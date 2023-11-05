const Hotel = require('./models/hotel')
const Review = require('./models/reviews')
const { hotelSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')


module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be logged in!')
        return res.redirect('/login')
    }
    next()
}

module.exports.storeReturnTo = (req,res,next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo
    }
    next()
}

module.exports.validateHotel = (req,res,next) => {   
    const { error } = hotelSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join()
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

module.exports.isOwner = async(req,res,next) => {
    const { id } = req.params
    const hotel = await Hotel.findById(req.params.id)
    if(!hotel.owner.equals(req.user._id)) {
        req.flash('error', `You don't have permission to do that!`)
        return res.redirect(`/hotels/${id}`)
    }
    next();
}

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join()
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

module.exports.isUser = async (req,res,next) => {
    const { reviewId, id } = req.params
    const review = await Review.findById(reviewId).populate('user')
    if(!review.user.equals(req.user._id)) {
        req.flash('error', `You don't have permission to do that!`)
        return res.redirect(`/hotels/${id}`)
    }
    next();
}
