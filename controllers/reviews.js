const Hotel = require('../models/hotel')
const Review = require('../models/reviews')

module.exports.delete = async (req,res) => {
    const {id, reviewId} = req.params
    await Hotel.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review deleted!')
    res.redirect(`/hotels/${id}`)
}

module.exports.create = async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    const review = new Review(req.body.review)
    review.user = req.user._id
    hotel.reviews.push(review)
    await review.save()
    await hotel.save()
    req.flash('success', 'Thank You for your review.')
    res.redirect(`/hotels/${hotel._id}`)
}

