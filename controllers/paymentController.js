const BigPromise = require("../middlewares/bigPromise");
const stripe = require('stripe')(process.env.STRIP_SCERET_KEY)
const Razorpay = require('razorpay')
const nanoid = require('nanoid')

exports.sendStripeKey = BigPromise(async (req, res, next) => {

    res.status(200).json({
        stripeKey: process.env.STRIP_API_KEY
    })
})

exports.captureStripePayment = BigPromise(async (req, res, next) => {

    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: process.env.CURRENCY,
              product_data: {
                name: req.body.name,
              },
              unit_amount: req.body.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      });
      res.redirect(303, session.url);
})

exports.sendRazorPayKey = BigPromise(async (req, res, next) => {

    res.status(200).json({
        razorPayKey: process.env.RAZORPAY_API_KEY
    })
})


exports.captureRazorPayment = BigPromise(async (req, res, next) => {

    let instance = new Razorpay({ key_id: process.envRAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY })
    const options = {
                      amount: req.body.amount,
                      currency: "INR",
                      receipt: nanoid()
                    }

    const myOrder = await instance.orders.create(options)

    res.status(200).json({
      success: true,
      amount: req.body.amount,
      order: myOrder
    })
})
