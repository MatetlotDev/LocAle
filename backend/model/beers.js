const mongoose = require('mongoose')

const beerSchema = mongoose.Schema({
    name: String,
    slogan: String,
    alcool: Number,
    type: String,
    notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'notes'}],
    picture: String,
})

const beerModel = mongoose.model('beers', beerSchema)

module.exports = beerModel