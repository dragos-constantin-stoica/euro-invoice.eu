//CONTATNTS Section
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
    result = await thisCompany.insert(myCompany)
    //create indexes
    const doctype_idx = { index: { fields: ["doctype"] }, name: "doctype_idx", type: "json", ddoc: "doctype_idx" }
    result = await thisCompany.createIndex(doctype_idx)
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
    reply.send({ status: 'ok', roles: chkuser, message: 'Welcome to Unity Bill! Sky is the limit!', action: 'showLayout', args: { currentHeader: 'privateHeader', mainComponent: 'dashboard', currentFooter: 'privateFooter' } })
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
	  const mango_query = { selector: { doctype: "client" }, fields: ["_id", "company_id",  "name", "country", "national_registration_number", "invoice_format", "vat", "bank_accounts", "address", "email"], use_index: "doctype_idx" }
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

async function updateClients(payload){
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

async function getCompanies(company_list) {
  let result = []
  const mango_query = { selector: { doctype: "company" }, fields: ["_id", "name", "country", "national_registration_number", "invoice_format", "vat", "bank_accounts", "address"], use_index: "doctype_idx" }
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
  } catch (err) {
    console.log(err)
  }
  return result
}

async function getContracts(company_list){
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

async function updateContracts(payload){
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

fastify.post('/clients', async function (request, reply){
	let result = {}
	try{
		//console.log(request.body)
		let credentials = request.body
		let theUser = await nano.request({method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}`})
		let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members ])]
		result.companies = await getCompanies(company_list)
		result.clients = await getClients(company_list)
		console.log(result)
		reply.send({status: 'ok', message: 'Clients data loaded', dataset: result})
	}catch(err){
		console.log(err)
		reply.send({status: 'error', message: 'Client fetch error.'})
	}
});

fastify.put('/clients', async function(request, reply){
	let result = {}
	try{
		console.log(request.body)
		let credentials = request.body.session
	    let theUser = await nano.request({ method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}` })
    	let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members])]
    	result.companies = await getCompanies(company_list)
    	let tmp = await updateClients(request.body)
		result.clients = await getClients(company_list)
		console.log(result)
		reply.send({status:'ok', message: 'Client data saved', dataset: result})
	}catch(err){
		console.log(err)
		reply.send({status: 'error', message: 'Client update error'})
	}
});


fastify.post('/contracts', async function (request, reply){
	let result = {}
	try{
		console.log(request.body)
		let credentials = request.body
		let theUser = await nano.request({method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}`})
		let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members ])]
		result.companies = await getCompanies(company_list)
		result.clients = await getClients(company_list)
		result.contracts = await getContracts(company_list)		
		console.log(result)
		reply.send({status: 'ok', message: 'Contracts data loaded', dataset: result})
	}catch(err){
		console.log(err)
		reply.send({status: 'error', message: 'Contract fetch error.'})
	}
});

fastify.put('/contracts', async function(request, reply){
	let result = {}
	try{
		//console.log(request.body)
		let credentials = request.body.session
		let theUser = await nano.request({method: 'get', db: '_users', doc: `${COUCHDB_USER_NAMESPACE}:${credentials.username}`})
		let company_list = [...new Set([...theUser.companies.admin, ...theUser.companies.members ])]
		result.companies = await getCompanies(company_list)
		result.clients = await getClients(company_list)
		let tmp = await updateContracts(request.body)
		result.contracts = await getContracts(company_list)		
		//console.log(result)
		reply.send({status: 'ok', message: 'Contracts data loaded', dataset: result})
	}catch(err){
		console.log(err)
		reply.send({status: 'error', message: 'Contract fetch error.'})
	}
});

fastify.put('/newinvoice', async function(request, reply){
  let result = {}

  try {
    
  } catch (err) {
    console.log(err);
    reply.send({status: 'error', message: 'New invoice fetch error'})
  }
})

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
