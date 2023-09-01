const mongoose = require('mongoose');
module.exports.services = mongoose.model('services',new mongoose.Schema(
    {
        name : String
    }
));