const mongoose = require('mongoose')

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(console.log('connected to db successfully'))
    .catch((error) => {
        console.log('DB Connection failed');
        console.log(error)
        process.exit()
    })
}

module.exports = connectDB