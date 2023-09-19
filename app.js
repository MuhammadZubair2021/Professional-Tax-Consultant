var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');
var flash       = require('connect-flash');

var app = express();

var port ;        
//Setting up environment variables
//if we are not in the production level (in development phase/level)
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
    port = 3000 ;    
}else{
    port = process.env.PORT ;    
}

// Db connection 
// var dbURI = process.env.mongodbURI ;
// mongoose.connect(dbURI,{useNewUrlParser:true,useUnifiedTopology:true})
// .then(()=>{
  console.log("Connected to an Online database");
// })
// .catch(error => {
//   console.log('Db error : ', error)
// })
// End of Db connection

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Make some directory visible into public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname,'/uploads')));


//Parse the form data using body-parser module.
app.use(bodyParser.urlencoded({extended:false}));

// Parse the JSON and URLENCODED data into a javascript object.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// Flash messages configurations
app.use(require('express-session')({
  secret : 'I am Muhammad Zubair',
  resave : false ,
  saveUninitialized : false
}));
app.use(flash());
// End of flash messages configurations

//A middle ware to pass detail of current user /Customer and flash messages to every page...
app.use(function(req,res,next){  
  res.locals.error       = req.flash('error');
  res.locals.success     = req.flash('success');
  next();
})

// Require and use routes
const routes = require('./routes/routes');
app.use(routes);

module.exports = app;
