const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    pseudo: String,
    token: String,
    email: String,
    password: String,
    insert_date: Date,
    avatar: String,
    wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: 'beers'}],
    notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'notes'}]
})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel