const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { storeReturnTo } = require('../middleware')

const auth = require('../controllers/auth')

router.route('/register')
    .get(auth.registerForm)
    .post(catchAsync( auth.register))

router.route('/login')
    .get(auth.loginForm)
    .post(storeReturnTo, passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}), auth.login)

router.get('/logout', auth.logout)


module.exports = router
