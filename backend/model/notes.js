const mongoose = require('mongoose')

const noteSchema = mongoose.Schema({
    note: Number,
    comment: String,
    date: Date,
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    beer: {type: mongoose.Schema.Types.ObjectId, ref: 'beers'},
})

const noteModel = mongoose.model('notes', noteSchema)

module.exports = noteModel