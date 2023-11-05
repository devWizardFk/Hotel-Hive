if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/hotelHive';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}) 
const Hotel = require('./models/hotel')
const Review = require('./models/reviews')
const User = require('./models/user')

const hotelRoute = require('./routes/hotels')
const reviewRoute = require('./routes/reviews')
const authRoute = require('./routes/auth')

const db = mongoose.connection
db.on("error", console.log.bind(console,'Connection Error ;)'))
db.once("open", () => {
    console.log('Database Connected!')
})

const app = express()
const path = require('path')
const { hotelSchema, reviewSchema } = require('./schemas')

const secret = process.env.SECRET || 'juice999'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{secret}
})
store.on("error", function(e) {
    console.log("session store error", e)
})

const sessionConfig = {
    store,
    name:'session',
    secret,
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly:true,
        expires: Date.now() + 604800000,
        maxAge: 604800000,
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://cdn.jsdelivr.net/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmbqi03fu/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
app.use(mongoSanitize())


app.use((req,res,next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const validateHotel = (req,res,next) => {   
    const { error } = hotelSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join()
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join()
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))


app.use('/', authRoute)
app.use('/hotels', hotelRoute)
app.use('/hotels/:id/reviews', reviewRoute)



app.get('/', (req, res) => {
    res.render('home')
})

app.get('/fakeUser', async (req,res) => {
    const userData = new User({email: 'ati@gamil.com', username: 'Atif'})
    const user = await User.register(userData,'monkey')
    res.send(user)
})

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found ;)', 404))
})
app.use((err,req,res,next) => {
    const { statusCode = 500 } = err
    if(!err.message) err.message = "Something Went Wrong!!"
    res.status(statusCode).render('error', {err})
})
app.listen(3000, () => {
    console.log("Serving on Port 3000")
}) 