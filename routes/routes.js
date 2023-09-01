var express = require ('express'),
    router  = express.Router();

    // Landing / Home page
    router.get('/',(req,res) =>{
      res.render('index.ejs');
    })

    module.exports = router;