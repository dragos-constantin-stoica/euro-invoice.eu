//CONSTANTS Section
const WRK_PORT = process.env.WRK_PORT || 8090,
  WRK_HOST = process.env.WRK_HOST || '0.0.0.0',
  COUCHDB_USER = process.env.COUCHDB_USER,
  COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD,
  APP_USER = process.env.APP_USER,
  APP_PASSWORD = process.env.APP_PASSWORD,
  COUCHDB_USER_NAMESPACE = 'org.couchdb.user';

// CommonJS
const fastify = require('fastify')({ logger: true })
// require the module
var hashes = require('jshashes')
var RMD160 = new hashes.RMD160;
//CouchDB management part
const nano = require('nano')({
  url: `http://${encodeURIComponent(COUCHDB_USER)}:${encodeURIComponent(COUCHDB_PASSWORD)}@couch:5984`,
  log: console.log,
});

/* 
   -----------------------------
   End of initialization section
   -----------------------------
*/

//Cleanup in case of failure. The Company may be created an the user not
async function cleanupCompany(newCompany) {
  try {
    let companies = nano.use('companies')
    let result = await companies.get(newCompany._id)
    result = await companies.destroy(result._id, result._rev)
    result = nano.db.destroy(`c${newCompany._id}`)
  } catch (e) {
    console.log(e)
  }
}

//Update Company with newly created admin
async function updateCompanyAdmin(newCompany, admin) {
  try {
    let companies = nano.use('companies')
    let company = await companies.get(newCompany._id)
    company.admin = [admin.name]
    company.members = [admin.name]
    //console.log(company)
    let result = await companies.insert(company)
    //console.log(result)
    let thisCompany = nano.use(`c${newCompany._id}`)
    let myCompany = newCompany
    myCompany.doctype = 'company'
    myCompany.bank_accounts = []
    //data structure iban, bank, swift, bic, currency, (office)
    myCompany.address = []
    //address is a string with newlines and will be displayed in a textarea
    myCompany.vat = myCompany.vat || ''
    myCompany.email = ''
    myCompany.mobile = ''
    result = await thisCompany.insert(myCompany)
    //create indexes
    const doctype_idx = { index: { fields: ["doctype"] }, name: "doctype_idx", type: "json", ddoc: "doctype_idx" }
    result = await thisCompany.createIndex(doctype_idx)
    //create serial_number document
    //this should not happen here?!
    if (myCompany.invoice_format) {
      let sn_doc = { _id: 'serialnumber', doctype: 'serialnumber' }
      sn_doc[`${myCompany.invoice_format}`] = 0
      result = await thisCompany.insert(sn_doc)
    }
    //create design documents
    const ddoc_update_sn = {
      "_id": "_design/serialnumber",
      "language": "javascript",
      "updates": {
        "upsert": `function(doc, req) {    
          if (req.method == "PUT") {        
            var payload = JSON.parse(req.body);
            if (doc === null) {
              //Create new document
              newdoc = {};            
              newdoc._id = 'serialnumber';
              newdoc.doctype = "serialnumber";
              newdoc[payload.field] = (typeof payload.serial === 'string')?parseInt(payload.serial,10):payload.serial;            
              return [newdoc, JSON.stringify({"action": "created","doc": newdoc})];
            } else {            
              //Update existing document            
              if(typeof doc[payload.field] === 'undefined'){                
                doc[payload.field] = (typeof payload.serial === 'string')?parseInt(payload.serial,10):payload.serial;           
              }else{                
                doc[payload.field]++            
              }           
              return [doc, JSON.stringify({"action": "updated","doc": doc})];
            }    
          }    
          //unknown request - send error with request payload
          return [null, JSON.stringify({"action": "error","req": req})];
        }`
      }
    }
    result = await thisCompany.insert(ddoc_update_sn)
    const ddoc_update_payment = {
      "_id": "_design/payments",
      "language": "javascript",
      "updates": {
        "register": `function(doc, req){
          if (req.method == "PUT"){
            var payload = JSON.parse(req.body);
            if (doc){
              //Update payment for exisiting invoice
              doc.payload.PAYMENTS.push(payload);
              //compute the state of the inovice
              //consider all payments made in the same currency and this is the same initial invoice
              var total_payments = doc.payload.PAYMENTS.reduce((acc, crtitem)=> acc + crtitem.amount, 0);
              doc.payload.STATUS = (total_payments < doc.payload.INVOICE_TOTAL)?"partially_payed":"payed"
              return [doc, JSON.stringify({"action":"updated", "doc":doc})];
            }else{
              //No invoice provided send error message back
              return [null, JSON.stringify({ "action":"error", "error": "No invoice provided."})];
            }
          }
          //Unknown request - send error message with request payload
          return [null, JSON.stringify({ "action":"error", "req": req})];
        }`
      }
    }
    result = await thisCompany.insert(ddoc_update_payment)

  } catch (e) {
    console.log(e)
  }
};

//Create new company with admin user
async function createCompanyWithAdmin(newCompany, admin) {
  try {
    let chkdb = await nano.request({ method: 'head', db: 'companies', doc: newCompany._id })
    return { status: 'error', error: 'Company alreay registered!' }
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        //Company does not exist - create it
        let companies_db = nano.use('companies')
        try {
          let new_doc = await companies_db.insert(newCompany)
          //console.log(new_doc)
          let new_db = await nano.db.create(`c${newCompany._id}`)
          //console.log(new_db)
          let security_db = await nano.request(
            {
              method: 'put',
              path: `c${newCompany._id}/_security`,
              body: { "admins": { "names": [], "roles": [`adm_${newCompany._id}`, '_admin'] }, "members": { "names": [], "roles": [`usr_${newCompany._id}`] } }
            }
          )
          //console.log(security_db)
          let chkuser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${admin.name}` })
          //console.log(chkuser)
          cleanupCompany(newCompany)
          return { status: 'error', error: 'User exists!' }
        } catch (e) {
          if (e.statusCode == 404) {
            //This should be from GET user
            //Create user
            try {
              admin.companies = { admin: [newCompany._id], members: [newCompany._id] }
              admin.mfa_secret = null
              let result = await nano.request({ method: 'put', path: `_users/${COUCHDB_USER_NAMESPACE}:${admin.name}`, body: admin })
              console.log(result)
              //add admin information to company document
              updateCompanyAdmin(newCompany, admin)
              return { status: 'ok', message: "Company and admin created! Please login.", action: 'showLayout', args: { currentHeader: 'privateHeader', mainComponent: 'login', currentFooter: 'privateFooter' } }
            } catch (e) {
              console.log(e)
              cleanupCompany(newCompany)
              return { status: 'error', error: 'User creation failed!' }
            }
          }
          console.log(e)
          return { status: 'error', error: 'Application error. Contact hotline.' }
        }
        break;
      case 401:
        return { status: 'error', error: 'Unauthorized - 401!' }
        break;
      default:
        console.log(e)
        return { status: 'error', error: 'Application error. Contact hotline.' }
    }
  }
}


//--------------
//webserver part
async function closeGracefully(signal) {
  console.log(`[ Received signal to terminate: ${signal} ]`)
  await fastify.close()
  // client.close(); gearmand client
  // await db.close() if we have a db connection in this app
  // await other things we should cleanup nicely
  process.kill(process.pid, signal);
};
process.once('SIGINT', closeGracefully)
process.once('SIGTERM', closeGracefully)
process.once('SIGHUP', closeGracefully)

fastify.register(require('fastify-healthcheck'), {
  healthcheckUrl: '/ok',
  // healthcheckUrlDisable: true,
  // healthcheckUrlAlwaysFail: true,
  // exposeUptime: true,
  // underPressureOptions: { } // no under-pressure specific options set here
  exposeUptime: true // enable, as a sample
});

fastify.get('/', async (request, reply) => {
  return { status: 'ok' }
});

fastify.post('/login', async function (request, reply) {
  try {
    console.log(request.body)
    let credentials = request.body
    //console.log(`${COUCHDB_USER_NAMESPACE}:${credentials.username}`)
    let chkuser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    console.log(chkuser)
    let result = await nano.auth(credentials.username, credentials.password)
    console.log(result)
    let session = await nano.session()
    console.log(session)
    await nano.auth(encodeURIComponent(COUCHDB_USER), encodeURIComponent(COUCHDB_PASSWORD))
    if (chkuser.companies.admin.length > 0) {
      const mango_query = { selector: { doctype: { "$in": ["company", "client", "service-product", "contract"] } }, use_index: "doctype_idx" }
      let tmp = nano.use(`c${chkuser.companies.admin[0]}`)
      let check_onboarding = await tmp.find(mango_query)
      //Check if onboarding has to be performed
      //Company must have: address, bank account, invoice format
      //Product-Service
      //Client
      //Contract
      let check = {
        company: false, service_product: false, client: false, contract: false
      }

      check_onboarding.docs.forEach(element => {
        switch (element.doctype) {
          case 'company':
            if (element.address.length > 0 &&
              element.bank_accounts.length > 0 &&
              element.invoice_format && element.invoice_format.length > 0) check.company = true
            break;

          case 'client':
            check.client = true
            break;

          case 'service-product':
            check.service_product = true
            break;

          case 'contract':
            check.contract = true
            break;

          default:
            break;
        }
      });
      if (check.company && check.service_product && check.client && check.contract) {
        reply.send({ status: 'ok', roles: chkuser, message: 'Welcome to Unity Bill! Sky is the limit!', action: 'showLayout', args: { currentHeader: 'privateHeader', mainComponent: 'dashboard', currentFooter: 'privateFooter' } })
      } else {
        reply.send({ status: 'ok', roles: chkuser, message: 'Welcome to Unity Bill! Please onboard your company!', action: 'showLayout', args: { currentHeader: 'onboardingHeader', mainComponent: 'onboarding', currentFooter: 'onboardingFooter' } })
      }
    } else {
      reply.send({ status: 'ok', roles: chkuser, message: 'Welcome to Unity Bill! Sky is the limit!', action: 'showLayout', args: { currentHeader: 'privateHeader', mainComponent: 'dashboard', currentFooter: 'privateFooter' } })
    }
  } catch (e) {
    console.log(`[ ${e} ]`)
    reply.send({ status: 'error', error: 'Login error' })
  }

});

fastify.post('/changepassword', async function (request, reply) {
  try {
    console.log(request.body)
    let credentials = request.body
    //Check username
    let chkuser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    console.log(chkuser)
    //Check current password
    let authuser = await nano.auth(credentials.username, credentials.password)
    console.log(authuser)
    await nano.auth(encodeURIComponent(COUCHDB_USER), encodeURIComponent(COUCHDB_PASSWORD))
    let newuser = {
      name: chkuser.name,
      password: credentials.newpassword,
      roles: chkuser.roles,
      type: "user",
      mfa_secret: chkuser.mfa_secret,
      companies: chkuser.companies
    }
    let newpass = await nano.request({ method: 'put', path: `_users/${COUCHDB_USER_NAMESPACE}:${credentials.username}`, body: newuser, headers: { 'If-Match': chkuser._rev } })
    reply.send({ status: 'ok', message: 'Password successfuly changed.' })
  } catch (err) {
    console.log(`[ ${err} ]`)
    reply.send({ status: 'error', error: 'Password change error.' })
  }
});

async function getServicesProducts(company_list) {
  let result = []
  const mango_query = { selector: { doctype: "service-product" }, fields: ["_id", "company_id", "name", "description", "type", "unit", "unit_price", "vat", "currency"], use_index: "doctype_idx" }
  await Promise.all(company_list.map(async (item) => {
    try {
      let tmp = nano.use(`c${item}`)
      let q = await tmp.find(mango_query)
      result = result.concat(...q.docs)
    } catch (err) {
      console.log(err)
    }
  }));
  return result
}

async function updateServicesProducts(payload) {
  let result = []
  //TODO - Implement upsert
  try {
    let company = await nano.use(`c${payload.data.company_id}`)
    let doc = payload.data
    doc.doctype = "service-product"
    let result = await company.insert(doc)
  } catch (error) {
    console.log(error)
  }
  return result
}

async function getClients(company_list) {
  let result = []
  const mango_query = { selector: { doctype: "client" }, fields: ["_id", "company_id", "name", "country", "national_registration_number", "invoice_format", "vat", "bank_accounts", "address", "email", "mobile"], use_index: "doctype_idx" }
  await Promise.all(company_list.map(async (item) => {
    try {
      let tmp = nano.use(`c${item}`)
      let q = await tmp.find(mango_query)
      result = result.concat(...q.docs)
    } catch (err) {
      console.log(err)
    }
  }));
  return result
}

async function updateClients(payload) {
  let result = []
  //TODO - Detect if it needs to create new company too
  //TODO - Implement upsert
  try {
    let company = await nano.use(`c${payload.data.company_id}`)
    let doc = payload.data
    doc.doctype = "client"
    let result = await company.insert(doc)
  } catch (error) {
    console.log(error)
  }
  return result
}

async function getOnboarding(company_list) {
  let result = {}
  const mango_query = { selector: { doctype: { "$in": ["company", "client", "service-product", "contract"] } }, use_index: "doctype_idx" }
  await Promise.all(company_list.map(async (item) => {
    try {
      let tmp = nano.use(`c${item}`)
      let q = await tmp.find(mango_query)
      if (!result[item]) result[item] = []
      result[item] = result[item].concat(...q.docs)
    } catch (err) {
      console.log(err)
    }
  }));
  return result
}

async function upsertOnboarding(payload) {
  let result = {}
  try {
    //update company
    let company_db = nano.use(`c${payload.company._id}`)
    let company_doc = await company_db.get(payload.company._id)
    //merge fields: vat, mobile, email, address, bank_accounts, invoice_format
    if (payload.company.vat.length > 0) company_doc.vat = payload.company.vat
    if (payload.company.email.length > 0) company_doc.email = payload.company.email
    if (payload.company.mobile.length > 0) company_doc.mobile = payload.company.mobile
    if (payload.company.address.length > 0) company_doc.address.push(payload.company.address[0])
    if (payload.company.bank_accounts.length > 0) company_doc.bank_accounts.push(payload.company.bank_accounts[0])
    //do something about serial number
    if (!company_doc.invoice_format && payload.company.invoice_format.length > 0) {
      company_doc.invoice_format = payload.company.invoice_format
      let sn_doc = {
        field: company_doc.invoice_format,
        serial: 0
      }
      let sn = await company_db.atomic('serialnumber', 'upsert', 'serialnumber', sn_doc)
      result.serialnumber = sn.doc._id
    }
    let tmp = await company_db.insert(company_doc)
    console.log(tmp);
    result.company = tmp.id
    
    //create service-product
    payload.service.doctype = "service-product"
    tmp = await company_db.insert(payload.service)
    console.log(tmp);
    result.service = tmp.id
    //create client
    payload.client.doctype = "client"
    tmp = await company_db.insert(payload.client)
    console.log(tmp);
    result.client = tmp.id
    //create contract
    payload.contract.doctype = "contract"
    payload.contract.client_id = tmp.id
    tmp = await company_db.insert(payload.contract)
    console.log(tmp);
    result.contract = tmp.id
  } catch (err) {
    console.log(err)
  }
  return result
}

async function getCompanies(company_list) {
  let result = []
  const mango_query = { selector: { doctype: "company" }, fields: ["_id", "name", "country", "national_registration_number", "invoice_format", "vat", "bank_accounts", "address", "email", "mobile"], use_index: "doctype_idx" }
  await Promise.all(company_list.map(async (item) => {
    try {
      let tmp = nano.use(`c${item}`)
      let q = await tmp.find(mango_query)
      result = result.concat(...q.docs)
    } catch (err) {
      console.log(err)
    }
  }));
  return result
}

async function updateCompany(company_data) {
  let result = []
  try {
    let company = nano.use(`c${company_data._id}`)
    let head = await company.head(company_data._id)
    console.log(head)
    company_data._rev = head.etag.replaceAll('"', '')
    company_data.doctype = "company"
    console.log(company_data)
    let result = await company.insert(company_data)
    //Should create serial number document via upsert
    let sn_doc = {
      field: company_data.invoice_format,
      serial: 0
    }
    let sn = await company.atomic('serialnumber', 'upsert', 'serialnumber', sn_doc)
  } catch (err) {
    console.log(err)
  }
  return result
}

async function getContracts(company_list) {
  let result = []
  const mango_query = { selector: { doctype: "contract" }, fields: ["_id", "company_id", "client_id", "registration_number", "type", "start_date", "end_date", "details"], use_index: "doctype_idx" }
  await Promise.all(company_list.map(async (item) => {
    try {
      let tmp = nano.use(`c${item}`)
      let q = await tmp.find(mango_query)
      result = result.concat(...q.docs)
    } catch (err) {
      console.log(err)
    }
  }));
  return result
}

async function getInvoices(company_list) {
  let result = {}
  const mango_query = { selector: { doctype: "invoice" }, fields: ["_id", "payload"], use_index: "doctype_idx" }
  await Promise.all(company_list.map(async (item) => {
    try {
      let tmp = nano.use(`c${item}`)
      let q = await tmp.find(mango_query)
      if (typeof result[item] === 'undefined') result[item] = []
      result[item] = result[item].concat(...q.docs)
    } catch (err) {
      console.log(err)
    }
  }));
  return result
}

async function updateContracts(payload) {
  let result = []
  //TODO - Detect if it needs to create new company too
  //TODO - Implement upsert
  try {
    let company = await nano.use(`c${payload.data.company_id}`)
    let doc = payload.data
    doc.doctype = "contract"
    let result = await company.insert(doc)
  } catch (error) {
    console.log(error)
  }
  return result
}

async function getSerialNumbers(company_list) {
  let result = {}

  await Promise.all(company_list.map(async (item) => {
    try {
      let tmpdb = nano.use(`c${item}`)
      let sn_doc = await tmpdb.get('serialnumber')
      let db_doc = await tmpdb.get(`${item}`)
      if (typeof result[item] === 'undefined') result[item] = {}
      result[item][db_doc.invoice_format] = sn_doc[db_doc.invoice_format]
    } catch (error) {
      console.log(error);
    }
  }))
  return result
}

fastify.post('/onboarding', async function (request, reply) {
  let result = []
  try {
    //current user may have various roles in multiple companies - for full version
    //in the free version, on company per user
    // the information about the companies is stored in CouchDB user profile
    let credentials = request.body
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin])]
    result = await getOnboarding(company_list)
    console.log(result)
    reply.send({ status: 'ok', message: 'Onboarding data loaded.', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', error: 'Onboarding fetch error.' })
  }
});

fastify.put('/onboarding', async function (request, reply) {
  let result = []
  try {
    console.log(request.body)
    let credentials = request.body.username.username
    result = await upsertOnboarding(request.body.data)
    console.log(result)
    //reply.send({ status: 'ok', message: 'Onboarding data saved.', dataset: result })
    reply.send({ status: 'ok', message: 'Welcome to Unity Bill! Sky is the limit!', action: 'showLayout', args: { currentHeader: 'privateHeader', mainComponent: 'dashboard', currentFooter: 'privateFooter' } })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', error: 'Onboarding setup error.' })
  }
});

fastify.post('/companies', async function (request, reply) {
  let result = []
  try {
    //current user may have various roles in multiple companies - for full version
    //in the free version, on company per user
    // the information about the companies is stored in CouchDB user profile
    let credentials = request.body
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result = await getCompanies(company_list)
    console.log(result)
    reply.send({ status: 'ok', message: 'Company data loaded.', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', error: 'Company fetch error.' })
  }
});

fastify.put('/companies', async function (request, reply) {
  let result = []
  try {
    //update one single company and return the list of all companies the this user can manage
    let tmpresult = await updateCompany(request.body.data)
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${request.body.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result = await getCompanies(company_list)
    console.log(result)
    reply.send({ status: 'ok', message: 'Company data saved.', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', error: 'Company update error.' })
  }
});

fastify.post('/servicesproducts', async function (request, reply) {
  let result = {}
  try {
    //need to send the companies list
    //together with the service-product list for each company
    let credentials = request.body
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.companies = await getCompanies(company_list)
    result.servicesproducts = await getServicesProducts(company_list)
    //console.log(result)
    reply.send({ status: 'ok', message: 'Service-Product data loaded.', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', error: 'Service-Product fetch error' })
  }
});

fastify.put('/servicesproducts', async function (request, reply) {
  let result = {}
  try {
    //console.log(request.body)
    let credentials = request.body.session
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.companies = await getCompanies(company_list)
    let tmp = await updateServicesProducts(request.body)
    result.servicesproducts = await getServicesProducts(company_list)
    //console.log(result)
    reply.send({ status: 'ok', message: 'Service-Product data saved.', dataset: result })
  } catch (err) {
    console.log(err);
    reply.send({ status: 'error', message: 'Service-Product update error.' })
  }
});

fastify.post('/clients', async function (request, reply) {
  let result = {}
  try {
    //console.log(request.body)
    let credentials = request.body
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.companies = await getCompanies(company_list)
    result.clients = await getClients(company_list)
    console.log(result)
    reply.send({ status: 'ok', message: 'Clients data loaded', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', message: 'Client fetch error.' })
  }
});

fastify.put('/clients', async function (request, reply) {
  let result = {}
  try {
    console.log(request.body)
    let credentials = request.body.session
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.companies = await getCompanies(company_list)
    let tmp = await updateClients(request.body)
    result.clients = await getClients(company_list)
    console.log(result)
    reply.send({ status: 'ok', message: 'Client data saved', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', message: 'Client update error' })
  }
});

fastify.post('/contracts', async function (request, reply) {
  let result = {}
  try {
    console.log(request.body)
    let credentials = request.body
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.companies = await getCompanies(company_list)
    result.clients = await getClients(company_list)
    result.contracts = await getContracts(company_list)
    console.log(result)
    reply.send({ status: 'ok', message: 'Contracts data loaded', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', message: 'Contract fetch error.' })
  }
});

fastify.put('/contracts', async function (request, reply) {
  let result = {}
  try {
    //console.log(request.body)
    let credentials = request.body.session
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.companies = await getCompanies(company_list)
    result.clients = await getClients(company_list)
    let tmp = await updateContracts(request.body)
    result.contracts = await getContracts(company_list)
    //console.log(result)
    reply.send({ status: 'ok', message: 'Contracts data loaded', dataset: result })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', message: 'Contract fetch error.' })
  }
});

fastify.post('/invoices', async function (request, reply) {
  let result = {}
  try {
    console.log(request.body)
    let credentials = request.body.session
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result = await getInvoices(company_list)
    reply.send({ status: 'ok', message: 'Invoices loaded', dataset: result })
  } catch (error) {
    console.log(error)
    reply.send({ status: 'error', message: 'Invoices load error.' })
  }
});

fastify.post('/serialnumber', async function (request, reply) {
  let result = {}
  try {
    console.log(request.body);
    let credentials = request.body.session
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.serialnumbers = await getSerialNumbers(company_list)
    reply.send({ status: 'ok', message: 'Serial number loaded', dataset: result })
  } catch (err) {
    console.log(err);
    reply.send({ status: 'error', message: 'Serial number fetch error' })
  }
});

fastify.put('/newinvoice', async function (request, reply) {
  let result = {}

  try {
    console.log(request.body);
    let companydb = nano.use(`c${request.body.data.company_id}`)
    let next_sn = await companydb.atomic('serialnumber', 'upsert', 'serialnumber', {
      field: request.body.data.invoice_format
    })
    console.log(next_sn);
    let new_sn = request.body.data.invoice_format.replace('YYYY', (new Date(request.body.data.payload.INVOICE_DATE)).getUTCFullYear())
      .replace('MM', ((new Date(request.body.data.payload.INVOICE_DATE)).getUTCMonth() + 1).toString().padStart(2, '0'))
      .replace('XX', next_sn.doc[request.body.data.invoice_format].toString().padStart(2, '0'));
    request.body.data.payload.INVOICE_NUMBER = new_sn

    const fy = (new Date(request.body.data.payload.INVOICE_DATE)).getUTCFullYear(),
      ddd = Math.floor((new Date(request.body.data.payload.INVOICE_DATE) - new Date(fy, 0, 0)) / (1000 * 60 * 60 * 24)),
      magic_number = parseInt("".concat(ddd, fy, next_sn.doc[request.body.data.invoice_format].toString()).padStart(4, '0'), 10);
    let cc = (magic_number % 97 == 0) ? 97 : (magic_number % 97)

    request.body.data.payload.INVOICE_DETAILS = `+++${ddd.toString().padStart(3, '0')}/${fy.toString().padStart(4, '0')}/${next_sn.doc[request.body.data.invoice_format].toString().padStart(4, '0')}${cc.toString().padStart(2, '0')}+++`
    let new_invoice_doc = {
      _id: new_sn,
      doctype: 'invoice',
      payload: request.body.data.payload,
      template: request.body.data.template
    }
    let tmp = await companydb.insert(new_invoice_doc)
    let credentials = request.body.session
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result.serialnumbers = await getSerialNumbers(company_list)
    reply.send({ status: 'ok', message: `Invoice ${new_sn} created`, dataset: result })
  } catch (err) {
    console.log(err);
    reply.send({ status: 'error', message: 'New invoice fetch error' })
  }
})

fastify.put('/registerpayment', async function (request, reply) {
  let result = {}
  try {
    console.log(request.body)
    let companydb = nano.use(`c${request.body.data.company_id}`)
    let tmp = await companydb.atomic('payments', 'register', request.body.data.invoice_number, request.body.data.payment)
    let credentials = request.body.session
    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    result = await getInvoices(company_list)
    reply.send({ status: 'ok', message: `Payment of ${request.body.data.payment.amount} ${request.body.data.payment.currency} registered for invoice ${request.body.data.invoice_number}`, dataset: result })
  } catch (error) {
    console.log(error)
    reply.send({ status: 'error', message: 'Payment registration error.' })
  }
});

fastify.post('/register', async function (request, reply) {
  let result = []
  try {
    //no authentication yet ... this should be handled with care for DDOS
    let payload = request.body.data
    //Compute new - database ID
    var new_company = {
      _id: RMD160.hex(payload.name.toUpperCase() + payload.country.toUpperCase() + payload.national_registration_number.toUpperCase()),
      name: payload.name.toUpperCase(),
      country: payload.country.toUpperCase(),
      national_registration_number: payload.national_registration_number.toUpperCase()
    }
    console.log(new_company)
    var company_admin = {
      name: payload.username,
      password: payload.password,
      roles: [`usr_${new_company._id}`],
      type: 'user'
    }
    //Check if the database exists and if exists check if the user is already admin
    try {
      let doit = await createCompanyWithAdmin(new_company, company_admin)
      console.log(doit)
      reply.send({ status: 'ok', message: 'Company created!', dataset: doit })
    } catch (e) {
      console.log(e)
      reply.send({ status: 'error', error: e })
    }
    //Check if the user exists and if it belongs to admin group for the corresponding database
    reply.send({ status: 'ok', message: 'All good!', dataset: null })
  } catch (err) {
    console.log(err)
    reply.send({ status: 'error', error: 'Company registration failed.' })
  }
});

fastify.post('/contact', async function (request, reply) {
  let result = {}
  try {
    let contactdb = nano.use('contact')
    result = contactdb.insert(request.body.data)
    reply.send({ status: 'ok', message: 'Message saved successfully.', dataset: result })
  } catch (err) {
    console.log(err);
    reply.send({ status: 'error', message: 'Contact or newsletter subscribe error' })
  }
});

(async () => {
  try {
    await fastify.listen({ port: WRK_PORT, host: WRK_HOST })
    //console.log(`[ Process id: ${process.pid} on ${WRK_HOST}:${WRK_PORT} ]`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})();
//end webserver
//---------------------
