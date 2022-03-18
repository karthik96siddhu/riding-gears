const express = require('express')
const { addProduct, 
        getProducts, 
        adminGetProducts, 
        getSingleProduct, 
        adminUpdateSingleProduct, 
        adminDeleteProduct, 
        addReview, 
        deleteReview,
        getOnlyReviewsForSingleProduct} = require('../controllers/productController')
const { isLoggedIn, customRole } = require('../middlewares/user')
const router  = express.Router()

// user routes
router.route('/products').get(getProducts)
router.route('/product/:id').get(getSingleProduct)

// reviews routes
router.route('/product/addreview').put(isLoggedIn, addReview)
router.route('/product').delete(isLoggedIn, deleteReview)
router.route('/product').get(getOnlyReviewsForSingleProduct)

                           

// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct)
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetProducts)
router.route('/admin/product/:id').put(isLoggedIn, customRole('admin'), adminUpdateSingleProduct)
                                  .delete(isLoggedIn, customRole('admin'), adminDeleteProduct)

module.exports = router