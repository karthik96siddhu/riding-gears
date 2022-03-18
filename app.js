const express = require('express')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const home = require('./routes/home')
const user = require('./routes/user')
const product = require('./routes/product')
const payment = require('./routes/payment')
const order = require('./routes/order')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const app = express()

// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// regular middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// cookies and file-upload middlware
app.use(cookieParser())
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}))

// tmp check
app.set('view engine', 'ejs')

// morgan middlware
const morgan = require('morgan')
// log all requests to access.log
app.use(morgan('common', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
  }))

// route middlware
app.use('c',home)
app.use('/api/v1', user)
app.use('/api/v1', product)
app.use('/api/v1', payment)
app.use('/api/v1', order)

app.get('/signuptest', (req, res) => {
  res.render('signup')
})

module.exports = app