const mongoose = require('mongoose')
const User = require('./user')
const {Schema} = mongoose

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Review', reviewSchema)
