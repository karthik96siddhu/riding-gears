const bigPromise = require('../middlewares/bigPromise')

exports.home = bigPromise((req, res) => {
    res.send('<h1>Hello Welcome to MotorCycle Riding gear store')
})