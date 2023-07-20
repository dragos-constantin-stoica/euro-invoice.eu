'use strict'

// Global variables
const PORT = 3000,
      HOST = '0.0.0.0',
      NODE_ENV = process.env.NODE_ENV || 'DEV',
      COUCH_ADMIN_URL = 'http://couch_admin:8090',
      EXPRESS_SESSION = 'The quick brown fox jumps over the lazy dog.',
      APPLICATION = 'UnityBill',
      VERSION = '1.0.0';

const http = require('http')
const express = require('express')
var session = require('express-session')
var filestore = require('session-file-store')(session);

var pino = require('pino-http')()

let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  pino.logger.error('crypto support is disabled!');
}
var path = require('path');
const hdbs = require("express-handlebars");
var fs = require('fs');
const { type } = require('express/lib/response');
var compression = require('compression')
const { createTerminus } = require('@godaddy/terminus')

var axios = require('axios')

const app = express()

const { log } = require('console')

//middleware configuration for ExpressJS
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(session({
  store: new filestore,
  secret: EXPRESS_SESSION, //use a secret from secrets
  resave: false,
  saveUninitialized: true
}))
app.use(compression())

app.use(pino) // logging with pino-http

app.use(express.static(path.join(__dirname, 'public'))) //all static files go in public folder: html, js, css etc

app.engine("handlebars", hdbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views")) //all handlebar template files go in views folder

var hbs = hdbs.create({ defaultLayout: 'error' });

// middleware to test if authenticated
function isAuthenticated(req, res, next) {
  console.log(req.session);
  if (req.session.user) next()
  else next('route')
}

app.get('/app', isAuthenticated, function (req, res) {
  // this is only called when there is an authentication user due to isAuthenticated
  res.render('application', { layout: 'main' })
})

app.get('/app', function (req, res) {
  res.render('index', { layout: 'main' })
})

app.get("/checksession", isAuthenticated, function (req, res) {
  if (req.session.user) {
    res.json({ status: "ok", user_data: req.session.user })
  } else {
    res.redirect('/')
  }
})

app.post('/changepassword', isAuthenticated, async function(req, res, next){
   //TODO - check the preconditions before changing password
   try{
    var chpwd_response = await axios.post(`${COUCH_ADMIN_URL}/changepassword`, { username: req.session.user, password: req.body.oldpassword, newpassword: req.body.newpassword })
    console.log(chpwd_response.data)
    res.json({
      status: chpwd_response.data.status,
      message: chpwd_response.data.message
    });
   }catch(err){
    console.log(err)
    res.json({status:'error', error: 'Something went South v'})
   }
})

app.post('/changepassword', function(req, res){
  res.render('index', {layout: 'main'})
})

app.get('/companies', isAuthenticated, async function(req, res, next){
  try{
     var companies = await axios.post(`${COUCH_ADMIN_URL}/companies`, {username: req.session.user, data: req.session.data})
     console.log(companies)
     res.json({
       status: companies.data.status,
       message: companies.data.message,
       dataset: companies.data.dataset
     })
  }catch(err){
    console.log(err)
    res.json({status: 'error', error: 'Something went North ^'})
  }
})

app.get('/companies', function(req, res){
  res.render('index', { layout: 'main' })
})

app.put('/companies', isAuthenticated, async function(req, res, next){
	try{
		console.log(req.body)
		//send company to be updated in the corresponding database and in the global database
		//we should receive one single company at a time
		var result = await axios.put(`${COUCH_ADMIN_URL}/companies`, {username: req.session.user, data: req.body})
		res.json({
			stautus: result.data.status,
			message: result.data.message,
			dataset: result.data.dataset
		})
	}catch(err){
		console.log(err)
		res.json({status: 'error', error: 'Something went Far North ´`'})
	}
})

app.get('/servicesproducts', isAuthenticated, async function(req, res, next){
	try{
		var result = await axios.post(`${COUCH_ADMIN_URL}/servicesproducts`, {username: req.session.user, data: req.session.data})
		//console.log(result.data.dataset)
		res.json({
			stautus: result.data.status,
			message: result.data.message,
			dataset: result.data.dataset
		})
	}catch(err){
		console.log(err)
		res.json({status:'error', error:'Something went Far West >>'})
	}
})

app.get('/version', function (req, res) {
  res.json({ application: APPLICATION, version: VERSION })
})

app.post('/login', async function (req, res) {
  //We expect a JSON in body
  //res.json({ status: 'User authentication error!' });

  // login logic to validate req.body.user and req.body.pass
  // would be implemented here. for this example any combo works
  try {

    var login_response = await axios.post(`${COUCH_ADMIN_URL}/login`, { username: req.body.username, password: req.body.password })
    //console.log(login_response.data)

    if (login_response.data.status == 'ok') {
      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      req.session.regenerate(function (err) {
        if (err) {
          console.log(err)
          res.json({status:'error', error:'Session regenerate error!'})
          return
        }

        console.log(req.session)
        // store user information in session, typically a user id
        req.session.user = req.body.username
        req.session.data = {
          username: login_response.data.roles.name,
          password: req.body.password,
          roles: login_response.data.roles.roles,
          companies: login_response.data.roles.companies
        }

        // save the session before redirection to ensure page
        // load does not happen before session is saved
        req.session.save(function (err) {
          if (err) {
            console.log(err)
            res.json({status:'error', error:'Session save error!'})
            return
          }
          console.log(req.session);
          res.json({
            status: login_response.data.status,
            message: login_response.data.message,
            action: login_response.data.action,
            args: login_response.data.args
          });
        })
      })

    } else {
      //Clear the session variables
      req.session.user = null
      req.session.data = null
      res.json({
        status: login_response.data.status,
        error: login_response.data.error,
        action: 'showLayout',
        args: {currentHeader:'publicHeader', mainComponent:'login', currentFooter:'publicFooter'}
      })
    }
  } catch (error) {
    console.log(error);
    req.json({status:'error', error: 'Something went West <'})
  }

});

app.post('/logout',isAuthenticated, function (req, res, next) {
  // logout logic

  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.user = null
  req.session.data = null
  req.session.save(function (err) {
    if (err) next(err)
    // regenerate the session, which is good practice to help
    // guard against forms of session fixation

    req.session.regenerate(function (err) {
      if (err) next(err)
      res.json({
        status: 'ok',
        message: 'See you soon!',
        action: 'showLayout',
        args: {currentHeader:'publicHeader', mainComponent:'login', currentFooter:'publicFooter'}
      })
    })

  })
})

app.post('/logout', function(req, res){
  res.render('index', { layout: 'main' })
})

app.post('/register', async function (req, res, next) {
  //get user and company data from payload
  //check if the company exists and create if does not exist
  //check if the user exists in the company and create/add admin role to the company
  console.log(req.body)

  try{
     var company = await axios.post(`${COUCH_ADMIN_URL}/register`, {data: req.body})
     console.log(company)
     res.json({
       status: company.data.status,
       message: company.data.message,
       action: 'showLayout',
       args: {currentHeader:'publicHeader', mainComponent:'login', currentFooter:'publicFooter'}
    })
  }catch(err){
    console.log(err)
    res.json({status: 'error', error: 'Something went double North ^^'})
  }

})

/*
 * Error pages
 * 404, 50x
 */


//A Route for Creating a 500 Error (Useful to keep around)
app.get('/500', function (req, res) {
  res.status(500)
  res.render('50x', { layout: 'error' })
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('/*', function (req, res) {
  res.status(404);
  res.render('404', { layout: 'error' });
});

app.use(function (req, res, next) {
  res.status(404);
  res.render('404', { layout: 'error' });
});

app.use(function (err, req, res, next) {
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('50x', { layout: 'error' });
});

//Terminus boilerplate
const server = http.createServer(app)

function onSignal() {
  pino.logger.info('Signal received: closing HTTP server')
  // start cleanup of resource, like databases or file descriptors
}

async function onHealthCheck() {
  // checks if the system is healthy, like the db connection is live
  // resolves, if health, rejects if not
  return Promise.resolve(
    pino.logger.info('health check OK!')
    // optionally include a resolve value to be included as
    // info in the health check response
  )
}

createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: { '/healthcheck': onHealthCheck },
  onSignal
})

server.listen(PORT)
pino.logger.info(`Express started on port ${PORT} in ENV::${NODE_ENV}`)
