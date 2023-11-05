const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./reviews')
const User = require('./reviews')
const { func, required } = require('joi')


const imageSchema = new Schema({
    url: String,
    filename: String
})
imageSchema.virtual('thumbnail')
    .get(function () {
        //this refers to the current image 
        return this.url.replace('/upload','/upload/w_330,h_220')
    })

const opts = { toJSON: { virtuals: true } };

const hotelSchema = new Schema({
    name: String,
    price: Number,
    location: String,
    desc: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
}, opts)
// By default, Mongoose does not include virtuals when 
// you convert a document to JSON.


hotelSchema.virtual('properties.popUpMarkup')
    .get(function() {
        return `<a href="/hotels/${this._id}><h4>${this.name}</h4></a>
        <p>${this.desc}</p>`
    });

hotelSchema.post('findOneAndDelete', async function(hotel) {
    if(hotel.reviews.length) {
        await Review.deleteMany({_id: {$in: hotel.reviews}})
    }
})

module.exports = mongoose.model('Hotel', hotelSchema);

