const mongoose = require('mongoose');
module.exports.experienceSection = mongoose.model('experienceSection',new mongoose.Schema(
    {
        aboutSectionText : String,
        sectionText : String,
        sectionDescription : String
    }
));