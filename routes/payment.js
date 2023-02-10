const express = require('express')
const { sendStripeKey, sendRazorPayKey, captureStripePayment, captureRazorPayment } = require('../controllers/paymentController')
const { isLoggedIn } = require('../middlewares/user')
const router = express.Router()

router.route('/stripekey').get(isLoggedIn, sendStripeKey)
router.route('/razorpaykey').get(isLoggedIn, sendRazorPayKey)

router.route('/capturestripe').post(isLoggedIn, captureStripePayment)
router.route('/capturerazorpay').post(isLoggedIn, captureRazorPayment)

module.exports = router