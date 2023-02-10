const User = require('../models/user')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const fileUpload = require('express-fileupload')
const mailHelper = require('../utils/emailHelper')
const cloudinary = require('cloudinary').v2
const crypto = require('crypto')

exports.signup = BigPromise(async (req, res, next) => {

    let result;
    let profile_photo = {};
    if (req.files) {
        let file = req.files.photo
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'users',
            width: 150,
            crop: 'scale'
        })
        profile_photo = {
            id: result.public_id,
            secured_url: result.secure_url
        }
    }

    const { name, email, password } = req.body
    if (!email || !name || !password) {
        return next(new CustomError('name, email and password is required', 400))
    }
    const user = await User.create({
        name,
        email,
        password,
        photo: {...profile_photo}
    })
    cookieToken(user, res);
})


exports.login = BigPromise(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new CustomError('Email and password is required', 400))
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(new CustomError('User not exist', 400))
    }
    const isPasswordValid = await user.isValidatedPassword(password)
    if (!isPasswordValid) {
        return next(new CustomError('Password is invalid', 400))
    }
    cookieToken(user, res)
})

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "logout success"
    })
})


exports.forgotPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        return next(new CustomError('User not exist', 400))
    }

    const forgotToken = user.createForgotPasswordToken()
    await user.save({ validateBeforeSave: false })

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    const message = `copy paste this link in your URL and hit enter \n\n ${myUrl}`

    try {
        const options = {
            email: user.email,
            subject: 'Riding gears store - Reset password email ',
            message: message
        }
        await mailHelper(options)
        res
            .status(200)
            .json({
                success: true,
                message: 'Email sent successfully'
            })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        user.save()
        return next(new CustomError(error.message, 500))
    }
})

exports.resetPassword = BigPromise(async (req, res, next) => {
    const forgotPasswordToken = req.params.token
    const { password, confirmPassword } = req.body
    let encryToken = crypto
        .createHash('sha256')
        .update(forgotPasswordToken)
        .digest('hex')

    const user = await User.findOne(
        {
            encryToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        })

    if (!user) {
        return next(new CustomError('Token is invalid or expired'), 400)
    }

    if (password !== confirmPassword) {
        return next(new CustomError('password and confirm password do not match', 400))
    }

    user.password = password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    cookieToken(user, res);
})

exports.userdashboard = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})


exports.changePassword = BigPromise(async (req, res, next) => {

    const { password, newPassword, confirmPassword } = req.body
    const user = await User.findById(req.user.id).select('+password')

    if (!user) {
        return next(new CustomError('Not authorized to change password', 401))
    }

    const isPasswordValid = await user.isValidatedPassword(password)

    if (!isPasswordValid) {
        return next(new CustomError('Old Password is invalid'))
    }
    if (password === newPassword) {
        return next('new password is same as old password, please provide different password', 400)
    }

    if (newPassword !== confirmPassword) {
        return next('password and confirm password not matching', 400)
    }
    user.password = newPassword
    await user.save()
    cookieToken(user, res)
})

exports.updateUserDetail = BigPromise(async (req, res, next) => {

    if (!req.body.name || !req.body.email) {
        return next(new CustomError('email and name are compulsory', 400))
    }
    const newData = {
        name: req.body.name,
        email: req.body.email
    }


    if (req.files) {
        const user = await User.findById(req.user.id)

        if (!user) {
            return next(new CustomError('User is unAuthorized', 400))
        }

        // delete photo
        const resp = await cloudinary.uploader.destroy(user.photo.id)
        let file = req.files.photo
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'users',
            width: 150,
            crop: 'scale'
        })

        newData.photo = {
            id: result.public_id,
            secured_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        user: user,
        success: true
    })
})

exports.adminAllUsers = BigPromise(async (req, res, next) => {

    const users = await User.find({})

    res.status(200).json({
        users: users,
        success: true
    })
})

exports.adminSingleUser = BigPromise(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new CustomError('User not found', 400))
    }

    res.status(200).json({
        success: true,
        user: user
    })
})

exports.adminUpdateSingleUser = BigPromise(async (req, res, next) => {

    if (!req.body.name || !req.body.email) {
        return next(new CustomError('email and name are compulsory', 400))
    }
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        user: user,
        success: true
    })
})

exports.adminDeleteSingleUser = BigPromise(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new CustomError('User not found!', 400))
    }

    // delete photo
    const resp = await cloudinary.uploader.destroy(user.photo.id)

    await user.remove()

    res.status(200).json({
        success: true,
        msg: 'Deleted user successfully'
    })

})

exports.managerAllUsers = BigPromise(async (req, res, next) => {

    const users = await User.find({ role: 'user' }).select('name email')

    res.status(200).json({
        users: users,
        success: true
    })
})
