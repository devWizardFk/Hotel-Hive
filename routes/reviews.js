const express = require('express')
const router = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Hotel = require('../models/hotel')
const Review = require('../models/reviews')

const reviews = require('../controllers/reviews')

const {reviewSchema } = require('../schemas')

const {validateReview, isLoggedIn, isUser} = require('../middleware')

router.delete('/:reviewId', isLoggedIn, isUser, catchAsync( reviews.delete))
router.post('/', isLoggedIn, validateReview, catchAsync( reviews.create))

module.exports = router
