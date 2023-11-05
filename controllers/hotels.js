const Hotel = require('../models/hotel')
const {cloudinary} = require('../cloudinary')
const { required } = require('joi')
const mapBoxToken = process.env.MAPBOX_TOKEN
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geoCoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.index = async (req,res) => {
    const hotels = await Hotel.find({})
    res.render('hotels/index', { hotels })
}

module.exports.newHotelForm = (req,res) => {
    res.render('hotels/new')
}

module.exports.createHotel = async (req,res,next) => {
    if(!req.body.hotel) throw new ExpressError("Invalid Hotel Data", 400)
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.hotel.location,
        limit: 1
    }).send()
    const newHotel = new Hotel(req.body.hotel)
    newHotel.geometry = geoData.body.features[0].geometry;
    newHotel.owner = req.user._id;
    newHotel.images = req.files.map(f => ({filename: f.filename, url: f.path}))
    await newHotel.save()
    req.flash('success','New Hotel Listed Succesfully!!')
    res.redirect(`/hotels/${newHotel._id}`)
}

module.exports.showHotel = async (req,res) => {
    const {id} = req.params;
    const hotel = await Hotel.findById(id).populate({
        path:'reviews',
        populate: 'user'
    }).populate('owner')
    if(!hotel) {
        req.flash('error','404! No such Hotel exist!!')
        return res.redirect('/hotels')
    }
    res.render('hotels/detail', {hotel})
}

module.exports.editHotelForm = async (req,res) => {
    const {id} = req.params
    const hotel = await Hotel.findById(req.params.id)
    if(!hotel) {
        req.flash('error','404! No such Hotel exist!!')
        return res.redirect('/hotels')
    }
    res.render('hotels/edit', {hotel})
}

module.exports.deleteHotel = async (req,res) => {
    await Hotel.findByIdAndDelete(req.params.id)
    req.flash('success', 'Hotel deleted successfully!')
    res.redirect('/hotels')
}

module.exports.editHotel = async (req,res) => {
    const {id} = req.params
    const hotel = await Hotel.findByIdAndUpdate(id, {...req.body.hotel});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}))
    hotel.images.push(...imgs)
    await hotel.save()
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await hotel.updateOne({ $pull : { images: { filename: { $in: req.body.deleteImages}}}})
    }

    req.flash('success','Hotel Details Updated Succesfully!!')
    res.redirect(`/hotels/${id}`)
}
