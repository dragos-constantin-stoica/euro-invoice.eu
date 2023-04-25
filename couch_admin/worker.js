// CommonJS
const fastify = require('fastify')({logger: true})
const gearman = require('gearman')
// require the module
var hashes = require('jshashes')
var RMD160 = new hashes.RMD160;

const WRK_PORT = process.env.WRK_PORT || 8090,
      WRK_HOST = process.env.WRK_HOST || '0.0.0.0',
      GEARMAN_PORT = process.env.GEARMAN_PORT || 4730,
      COUCHDB_USER = process.env.COUCHDB_USER,
      COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD,
      APP_USER = process.env.APP_USER,
      APP_PASSWORD = process.env.APP_PASSWORD;

let worker = gearman('gearmand', GEARMAN_PORT)

// handle jobs assigned by the server
worker.on('JOB_ASSIGN', async function(job) {
    console.log(job.func_name + ' job assigned to this worker')
    console.log(JSON.parse(job.payload.toString()))
    let payload = JSON.parse(job.payload.toString())

    switch (job.func_name){
	case 'create_company':
	   //Compute new - database ID
	   var new_company = {
		_id: RMD160.hex(payload.name.toUpperCase()+payload.country.toUpperCase()+payload.national_registration_number.toUpperCase()),
		name: payload.name.toUpperCase(),
                country: payload.country.toUpperCase(),
		national_registration_number: payload.national_registration_number.toUpperCase()
           }
           console.log(new_company)
	   var company_admin = {
		name: payload.username,
                password: payload.password,
                roles:[`usr_${new_company._id}`],
                type:'user'
           }
           //Check if the database exists and if exists check if the user is already admin
	   try{
             let doit = await createCompanyWithAdmin(new_company, company_admin)
	     console.log(doit)
             worker.sendWorkComplete(job.handle, doit)
           }catch(e){
             console.log(e)
	     worker.sendWorkComplete(job.handle, JSON.stringify({status: 'error', error: e}))
           }
           //Check if the user exists and if it belongs to admin group for the corresponding database
	   worker.sendWorkComplete(job.handle, JSON.stringify({status: 'ok'}))
	break;
  	default:
	   console.log(`function ${job.func_name} not implemented :(`)
	   worker.sendWorkComplete(job.handle, JSON.stringify({status:'nok', message:'function not implemented'}))
    }
    // go back to sleep, telling the server we're ready for more work
    worker.preSleep()
});

// grab a job when the server signals one is available
worker.on('NOOP', function() {
  worker.grabJob()
})

// connect to the gearman server
worker.connect(function(){
   // register create company function
   worker.addFunction('create_company')

    // tell the server the worker is going to sleep, waiting for work
    worker.preSleep()
});

//CouchDB user management part
const nano = require('nano')({url:`http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couch:5984`})

//Create new company with admin user
async function createCompanyWithAdmin(newCompany, admin){
  try{
   let chkdb = await nano.request({method: 'head', db: 'companies', doc: newCompany._id})
   return JSON.stringify({status: 'error', error: 'Company alreay registered!'})
  }catch(e){
    switch(e.statusCode){
	case 404:
		//Company does not exist - create it
		let companies_db = nano.use('companies')
	    try{
		let new_doc =  await companies_db.insert(newCompany)
		console.log(new_doc)
		let new_db = await nano.db.create(`c${newCompany._id}`)
		console.log(new_db)
                let security_db = await nano.request(
		 {
                   method: 'put',
		   path: `c${newCompany._id}/_security`,
		   body: {"admins":{"names":[],"roles":[`adm_${newCompany._id}`, '_admin']},"members":{"names": [],"roles": [`usr_${newCompany._id}`]}}
		 }
		)
                console.log(security_db)
		let chkuser = await nano.request({method: 'get', db:'_users', doc:`org.coucdb.user:${admin.name}`})
	        console.log(chkuser)
		return JSON.stringify({status:'error', error: 'User exists!'})
	   }catch(e){
		if(e.statusCode == 404){
		//This should be from GET user
		//Create user
                  try{
		   let result = await nano.request({method:'put',path:`_users/org.couchdb.user:${admin.name}`, body: admin})
                   console.log(result)
		   return JSON.stringify({status:'ok'})
                  }catch(e){
                        console.log(e)
			return JSON.stringify({status: 'error', error:'User creation failed!'})
                  }
	        }
		return JSON.stringify({status:'error', error: e})
	   }
	break;
        case 401:
          return JSON.stringify({status: 'error', error:'Unauthorized - 401!'})
        break;
	default:
	 return JSON.stringify({status: 'error', error: e})
    }
  }
}


//--------------
//webserver part
async function closeGracefully(signal) {
   console.log(`*^!@4=> Received signal to terminate: ${signal}`)
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

(async () => {
 try {
   await fastify.listen({port:WRK_PORT, host:WRK_HOST})
   console.log(`*^!@4=> Process id: ${process.pid} on ${WRK_HOST}:${WRK_PORT}`)
 } catch (err) {
   fastify.log.error(err)
   process.exit(1)
 }
})();
//end webserver
//---------------------
