const { genSalt, hashSync } = require('bcrypt');
const mongoose = require('mongoose');
module.exports.user= mongoose.model('users',new mongoose.Schema(
    {
        email    : String ,
        password : String        
    }
));


// // Mongoose hooks are the special functions that fires before or after some event occures
// // Mongoose Hook for encrypting user password
// user.pre('save', async (next) => {
//     const salt = await genSalt() ;
//     this.password = hashSync(this.password , salt);
// })