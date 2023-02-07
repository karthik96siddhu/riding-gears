const BigPromise = require("../middlewares/bigPromise");
const Order = require("../models/order");
const Product = require("../models/product");
const CustomError = require("../utils/customError");


exports.createOrder = BigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    if (!order) {
        return next(new CustomError('Failed to add order', 401))
    }

    res.status(200).json({
        sucess: true,
        order
    })
})

exports.getSingleOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')


    if (!order) {
        return next(new CustomError('Order ID is not valid', 401))
    }

    res.status(200).json({
        success: true,
        order
    })
})

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find({user: req.user._id})

    if (!orders) {
        return next(new CustomError('Order is invalid, please check the Order ID', 401))
    }

    res.status(200).json({
        success: true,
        orders
    })
})

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find()

    res.status(200).json({
        success: true,
        orders
    })
}) 

exports.adminUpdateSingleOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (order.orderStatus === 'Delivered') {
        return next(new CustomError('Order is already delivered', 401))
    }

    order.orderStatus = req.body.orderStatus
    order.orderItems.forEach(async (prod) => {
        await updateProductStock(prod.product, prod.quantity)
    });

    await order.save()

    res.status(200).json({
        success: true,
        order
    })
})


exports.adminDeleteSingleOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    await order.remove()

    res.status(200).json({
        success :true,
        msg: 'Order deleted successfully'
    })
})

// to update number of stocks on product collections
async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId)

    if (!product.stock) {
        return next(new CustomError('Product is out of Stock. Cannot update stocks.', 401))
    }
    product.stock = product.stock - quantity

    await product.save({validateBeforeSave : false})
}