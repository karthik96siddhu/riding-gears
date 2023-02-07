const express = require('express')
const router = express.Router()

const { signup, 
        login, 
        logout, 
        forgotPassword, 
        resetPassword, 
        userdashboard, 
        changePassword, 
        updateUserDetail, 
        adminAllUsers, 
        managerAllUsers, 
        adminSingleUser, 
        adminUpdateSingleUser, 
        adminDeleteSingleUser } = require('../controllers/userController')
const { isLoggedIn, customRole } = require('../middlewares/user')

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotPassword').post(forgotPassword)
router.route('/password/reset/:token').post(resetPassword)
router.route('/userdashboard').get(isLoggedIn, userdashboard)
router.route('/password/update').put(isLoggedIn, changePassword)
router.route('/userdashboard/update').put(isLoggedIn, updateUserDetail)

// admin only routes
router.route('/admin/users').get(isLoggedIn, customRole('admin'), adminAllUsers)
router.route('/admin/user/:id')
        .get(isLoggedIn, customRole('admin'), adminSingleUser)
        .put(isLoggedIn, customRole('admin'), adminUpdateSingleUser)
        .delete(isLoggedIn, customRole('admin'), adminDeleteSingleUser)

// manager only route
router.route('/manager/users').get(isLoggedIn, customRole('manager'), managerAllUsers)


module.exports = router