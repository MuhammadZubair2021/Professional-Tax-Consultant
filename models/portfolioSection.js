const mongoose = require('mongoose');
module.exports.portfolioSection = mongoose.model('portfolioSection',new mongoose.Schema(
    {
        aboutSectionText : String,
        sectionText : String,
        sectionDescription : String
    }
));