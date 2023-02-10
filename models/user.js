const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password should be atleast 6 character'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String
        },
        secured_url: {
            type: String
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// encrpyt password before save
userSchema.pre('save', async function (next) {
    // below function checks if password field is not modified then continue next process else encrypt the password
    if (!this.isModified('password')) {
        return next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hashSync(this.password, salt)
    next()
})

// validate the password with user given password
userSchema.methods.isValidatedPassword = async function(givenPassword) {
    const isMatch = await bcrypt.compare(givenPassword, this.password)
    return isMatch
}

// create and return JWT
userSchema.methods.createJWT = function() {
    const token = jwt.sign({id: this._id, name: this.name, email: this.email}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY})
    return token
}

// generate forgot password token (string)
userSchema.methods.createForgotPasswordToken = function() {
    // generate longest random string
    const token = crypto.randomBytes(20).toString('hex')

    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20*60*1000

    return token
}

module.exports = mongoose.model('User', userSchema)