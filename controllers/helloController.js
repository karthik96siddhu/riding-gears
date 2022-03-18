const bigPromise = require('../middlewares/bigPromise')

exports.home = bigPromise((req, res) => {
    res.status(200).json({
        greeting: "Hello Welcome to Motor-Cycle riding gears.",
        success: true
    })
})