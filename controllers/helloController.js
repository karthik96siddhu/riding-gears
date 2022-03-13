const bigPromise = require('../middlewares/bigPromise')

exports.home = bigPromise((req, res) => {
    res.status(200).json({
        greeting: "Hello from LCO",
        success: true
    })
})