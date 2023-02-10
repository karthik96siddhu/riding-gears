const User = require('../models/user')
const BigPromise = require('./bigPromise')
const CustomError = require('../utils/customError')
const jwt = require('jsonwebtoken')

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    
    let authToken = req.header('Authorization')
    let token = req.cookies.token
    if (!token && authToken) {
        token = authToken.replace('Bearer ')
    }

    if (!token) {
        return next(new CustomError('Login first to access this page'), 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)
    next()
})

exports.customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new CustomError('you are not allowed for this resource', 403))
        }
        next()
    }
}