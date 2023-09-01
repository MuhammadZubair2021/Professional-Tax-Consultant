const mongoose = require('mongoose');
module.exports.contactSection = mongoose.model('contactSection',new mongoose.Schema(
    {
        aboutSectionText : String,
        sectionText : String,
        sectionDescription : String
    }
));