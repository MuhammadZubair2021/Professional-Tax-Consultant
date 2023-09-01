const mongoose = require('mongoose');
module.exports.contactDetails = mongoose.model('contactDetails',new mongoose.Schema(
    {
        address : String,
        email : String,
        phoneNumber : String,
        buttonText  : String
    }
));