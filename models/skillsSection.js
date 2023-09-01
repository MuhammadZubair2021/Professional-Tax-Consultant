const mongoose = require('mongoose');
module.exports.skillsSection = mongoose.model('skillsSection',new mongoose.Schema(
    {
        aboutSectionText : String,
        sectionText : String,
        sectionDescription : String
    }
));