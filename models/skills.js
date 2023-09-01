const mongoose = require('mongoose');
module.exports.skillsSection = mongoose.model('skillsSection',new mongoose.Schema(
    {
        name    :   String  ,
        percentage : String ,
    }
));