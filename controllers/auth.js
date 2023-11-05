const User = require('../models/user')


module.exports.registerForm = (req,res) => {
    res.render('auth/register')
}

module.exports.register = async (req,res) => {
    try {
        const {email, username, password} = req.body
        const userData = new User({email, username})
        const user = await User.register(userData, password)
        req.login(user, (e) => {
            if(e) {
                return next(e)
            }
            req.flash('success', 'Welcome to HotelsHive')
            res.redirect('/hotels')
        })
    }
    catch(e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.loginForm = (req,res) => {
    res.render('auth/login')
}

module.exports.login = (req,res) => {
    req.flash('success', 'Welcome to HotelsHive')
    const redirectUrl = res.locals.returnTo || '/hotels'
    res.redirect(redirectUrl)
}

module.exports.logout = (req,res,next) => {
    req.logout(function (err) {
        if(err) {
            return next(err)
        }
        req.flash('GoodBye!')
        res.redirect('/hotels')
    })
}

