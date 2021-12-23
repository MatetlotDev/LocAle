const mongoose = require('mongoose')

const daySchema = mongoose.Schema({
    day: Number,
    openings: String,
})

const sellerSchema = mongoose.Schema({
    type: String,
    name: String,
    description: String,
    website: String,
    adress: String,
    latitude: Number,
    longitude: Number,
    stock: [{type: mongoose.Schema.Types.ObjectId, ref: 'beers'}],
    pictures: [String],
    hours: [daySchema]
})

const sellerModel = mongoose.model('sellers', sellerSchema)

module.exports = sellerModel