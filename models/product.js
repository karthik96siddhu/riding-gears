const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'product name is required'],
        trim: true,
        maxlength: [120, 'Product name should not be more than 120 characters']
    },
    price: {
        type: Number,
        required: [true, 'please provide product price'],
        maxlength: [6, 'Product price should not be more than 6 digits']
    },
    description: {
        type: String,
        required: [true, 'product description is required']
    },
    photos: [{
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    }],
    category: {
        type: String,
        required: [true, 'please select category from gloves, jacket, pant, luggage, helmet'],
        enum: {
            values: ['gloves', 'jacket', 'pant', 'luggage', 'helmet'],
            message: "please select category from gloves, jacket, pant, luggage, helmet"
        }
    },
    brand: {
        type: String,
        required: [true, 'please add a brand for gears']
    },
    rating: {
        type: Number,
        default: 0,
        required : [false, 'Please give rating b/w 1-5']
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema)