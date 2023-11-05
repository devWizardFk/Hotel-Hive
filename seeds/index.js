const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/hotelHive', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}) 
const Hotel = require('../models/hotel')
const {names, cities} = require('./seedHelpers')

const db = mongoose.connection
db.on("error", console.log.bind(console,'Connection Error ;)'))
db.once("open", () => {
    console.log('Database Connected!')
})

const randomEl = (array) => array[Math.floor(Math.random()*array.length)]
const priceFn = () => (Math.floor(Math.random()*30)+6)*1000
const seedDB = async () => {
    await Hotel.deleteMany({})
    for(let i = 0; i < 300; i++) {
        const random = Math.floor(Math.random()*150)
        const newHotel = new Hotel({
            name:`${randomEl(names)} ${cities[random].city}`,
            location: `${cities[random].city}, ${cities[random].admin_name}`,
            images: [
              {
                url: 'https://res.cloudinary.com/dmbqi03fu/image/upload/v1691372486/HotelHive/fy1mjqzavfwxteezqkzl.jpg',
                filename: 'HotelHive/fy1mjqzavfwxteezqkzl',
              },
              {
                url: 'https://res.cloudinary.com/dmbqi03fu/image/upload/v1691372494/HotelHive/toervkzphhquwkb2nprv.jpg',
                filename: 'HotelHive/toervkzphhquwkb2nprv',
              },
              {
                url: 'https://res.cloudinary.com/dmbqi03fu/image/upload/v1691372501/HotelHive/zbmepsgjphhqqwulmohh.jpg',
                filename: 'HotelHive/zbmepsgjphhqqwulmohh',
              }
            ],
            geometry: {
              type: 'Point',
              coordinates: [
                cities[random].lng,
                cities[random].lat
              ]
            },
            desc: `This 7-acre property boasts opulent interiors, a luxury spa, 24-hour fitness centre, and art murals devoted to Sant Kabir. Easy connectivity to airport, railway station, and other parts of the city. Besides dining at any of the 4 eateries, guests can opt for a dinner under the stars or a meal at the chef's table` ,
            price: priceFn(),
            owner: '64c9b5a852378c7757da4073'
        })
        await newHotel.save()
    }
}

seedDB().then(() => {
    db.close()
})
