const express = require('express')
const router = express.Router()
const {home} = require('../controllers/helloController')

router.route('/dummy').get(home)

module.exports = router