const mongoose = require('mongoose');
module.exports.servicesSection = mongoose.model('servicesSection',new mongoose.Schema(
    {
        aboutSectionText : String,
        sectionText : String,
        sectionDescription : String
    }
));