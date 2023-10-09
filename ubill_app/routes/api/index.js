const axios = require('axios')
const express = require('express')
const router = express.Router()

let crypto;
try {
  crypto = require('node:crypto')
} catch (err) {
  console.error('crypto support is disabled!')
}

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})

/*
 * API endpoints
 * simple versioning
 * parameters in path
 * 
Read the doc
https://www.codemzy.com/blog/nodejs-api-versioning
https://github.com/Prasanna-sr/express-routes-versioning
https://github.com/juninhocruzg3/express-routes-versioning
https://github.com/Amri91/route-v/tree/master
 */

//Display a webpage of the summary and status of this invoice
//the URL is encoded on the QR code on the PDF invoice
router.get('/v1/status/:db/:invoice', async function(req, res){
    console.log(req.params)
 	res.send('OK')	
})

//Display the PDF version of the invoice
//the URL is encoded on the email that is sent to the Client and Company admin
router.get('/v1/pdf/:db/:invoice/:hash', async function(req, res){
    console.log(req.params)
    let {db, invoice, hash} = req.params
    let key = db +  invoice
    let hmac = crypto.createHmac('rmd160', key)
    hmac.update(db + invoice)
    let h = hmac.digest('hex')
    //check hash
    if (h == hash){
    	//ok - call the backend
    	let result = await axios.post(`${COUCH_ADMIN_URL}/invoice`, {db:db, invoice:invoice})
    	res.json({status:'ok', message:'The invoice', dataset: result})
    }else{
    	res.json({status:'error', error:'URL error.'})
    }
    console.log(h)
})
 
module.exports = router