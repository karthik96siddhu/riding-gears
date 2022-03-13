const express = require('express')
const router = express.Router()

const {signup, login, logout, forgotPassword, resetPassword, userdashboard, changePassword, updateUserDetail} = require('../controllers/userController')
const { isLoggedIn } = require('../middlewares/user')

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotPassword').post(forgotPassword)
router.route('/password/reset/:token').post(resetPassword)
router.route('/userdashboard').get(isLoggedIn, userdashboard)
router.route('/password/update').post(isLoggedIn, changePassword)
router.route('/userdashboard/update').post(isLoggedIn, updateUserDetail)

module.exports = router