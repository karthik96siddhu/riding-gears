const BigPromise = require("../middlewares/bigPromise")
const Product = require("../models/product")
const CustomError = require("../utils/customError")
const WhereClause = require("../utils/whereClause")
const cloudinary = require('cloudinary').v2

exports.addProduct = BigPromise(async (req, res, next) => {

    // images
    let images = []
    if (!req.files) {
        return next(new CustomError('images are required', 401))
    }
    if (req.files.photos.length > 1) {
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: 'products',
            })
            images.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    } else {
        let result = await cloudinary.uploader.upload(req.files.photos.tempFilePath, {
            folder: 'products',
        })
        images.push({
            id: result.public_id,
            secure_url: result.secure_url
        })
    }

    req.body.photos = images
    req.body.user = req.user.id

    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product: product
    })
})

exports.getProducts = BigPromise(async (req, res, next) => {

    const resultPerPage = 6
    const totalCountProduct = await Product.countDocuments()

    const productsObj = new WhereClause(Product.find(), req.query).search().filter()

    let products = await productsObj.base
    const filtereProductNumber = products.length

    productsObj.pager(resultPerPage)

    // to execute same query 2nd time
    products = await productsObj.base.clone()

    res.status(200).json({
        success: true,
        products,
        filtereProductNumber,
        totalCountProduct
    })
})

exports.adminGetProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find()

    res.status(200).json({
        success: true,
        products
    })
})

exports.getSingleProduct = BigPromise(async (req, res, next) => {
    const productId = req.params.id

    const product = await Product.findById(productId)

    if (!product) {
        return next(new CustomError('Product not found', 401))
    }

    res.status(200).json({
        success: true,
        product
    })
})

exports.adminUpdateSingleProduct = BigPromise(async (req, res, next) => {
    const productId = req.params.id

    let product = await Product.findById(productId)

    if (!product) {
        return next(new CustomError('Product not found', 400))
    }

    if (req.files) {
        let images = []
        for (let index = 0; index < product.photos.length; index++) {
            let resp = await cloudinary.uploader.destroy(product.photos[index].id)
        }
        if (req.files.photos.length > 1) {
            for (let index = 0; index < req.files.photos.length; index++) {
                console.log('hello');
                let result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
                    folder: 'products',
                })
                images.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })
            }
        } else {
            let result = await cloudinary.uploader.upload(req.files.photos.tempFilePath, {
                folder: 'products',
            })
            images.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
        req.body.photos = images
    }

    product = await Product.findByIdAndUpdate(productId, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        product
    })


})

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new CustomError('Product not found', 401))
    }

    for (let index = 0; index < product.photos.length; index++) {
        let resp = await cloudinary.uploader.destroy(product.photos[index].id)
    }

    await product.remove()

    res.status(200).json({
        success: true,
        msg: 'Deleted Product successfully'
    })
})


exports.addReview = BigPromise(async (req, res, next) => {

    const { rating, comment, productId } = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    if (!product) {
        return next(new CustomError('Product not found', 401))
    }

    const alreadyReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.comment = comment
                rev.rating = rating
            }
        })
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }

    // adjust ratings
    product.rating = product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length

    await product.save({ useFindAndModify: false })

    res.status(200).json({
        success: true
    })

})

exports.deleteReview = BigPromise(async (req, res, next) => {
    const productId = req.query.id

    const product = await Product.findById(productId)

    if (!product) {
        return next(new CustomError('Product not found'), 401)
    }

    const reviews = product.reviews.filter(
        (rev) => rev.user.toString() !== req.user._id.toString()
    )

    const numberOfReviews = reviews.length

    // adjust ratings
    const rating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length

    // update the product
    await Product.findByIdAndUpdate(productId, {
        reviews,
        rating,
        numberOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        msg: 'Deleted review successfully'
    })

})

exports.getOnlyReviewsForSingleProduct = BigPromise(async (req, res, next) => {
    const productId = req.query.id
    const product = await Product.findById(productId)

    res.status(200).json({
        success: true,
        reviews : product.reviews
    })
})