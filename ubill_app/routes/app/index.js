const config = require('../../config/config')
const axios = require('axios')
const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('APP call at: ', Date.now())
  next()
})

//Contact form message
route.post('/contact', async function (req, res) {
  //Not logged - the information has to come form the homepage of the site
  console.log(req.body);
  try {
    var payload = req.body
    payload.doctype = "contact"
    payload.timestamp = Date.now()
    var result = await axios.post(`${config.COUCH_ADMIN_URL}/contact`, { session: null, data: payload })
    res.send((result.data.status == 'ok') ? 'OK' : result.data.message)
  } catch (error) {
    console.log(error);
    res.send('NOK')
  }
})

//Newsletter subscribe
route.post('/subscribe', async function (req, res) {
  //Not logged - the information has to come form the homepage of the site
  console.log(req.body);
  try {
    var payload = req.body
    payload.doctype = "newsletter"
    payload.timestamp = Date.now()
    var result = await axios.post(`${config.COUCH_ADMIN_URL}/contact`, { session: null, data: payload })
    res.send((result.data.status == 'ok') ? 'OK' : result.data.message)
  } catch (error) {
    console.log(error);
    res.send('NOK')
  }
})
 
module.exports = router
