const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    dob: Date,
    username: { type: String, required: true, unique: true },
    password: String,
    address: String,
    emergencyContact: {
        name: String,
        phone: String
    },
    passportInfo: {
        number: String,
        expiryDate: Date
    },
    travelPreferences: String,
    newsletter: Boolean
});

module.exports = mongoose.model('User', userSchema);
