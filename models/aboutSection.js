const mongoose = require('mongoose');
module.exports.aboutSection= mongoose.model('aboutSection',new mongoose.Schema(
    {
        image : String,
        aboutSectionText : String,
        sectionText : String,
        aboutUser : String ,
        aboutSectionButton : String ,       
    }
));