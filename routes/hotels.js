const express = require('express')
const app = express()
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Hotel = require('../models/hotel')
const passport = require('passport')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })


const {isLoggedIn, storeReturnTo, isOwner, validateHotel} = require('../middleware')


const hotels = require('../controllers/hotels')

router.route('/')
    .get(catchAsync( hotels.index ))
    .post(isLoggedIn, upload.array('hotel[image]'), validateHotel, catchAsync( hotels.createHotel))
    
router.get('/new', isLoggedIn, hotels.newHotelForm)

router.route('/:id')
    .get(catchAsync( hotels.showHotel))
    .delete(isLoggedIn, isOwner, catchAsync( hotels.deleteHotel))
    .put(upload.array('hotel[image]'), validateHotel, isLoggedIn, isOwner, catchAsync( hotels.editHotel))
    

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync( hotels.editHotelForm))


module.exports = router
