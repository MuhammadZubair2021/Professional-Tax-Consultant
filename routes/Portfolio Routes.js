var express = require('express');
var router  = express.Router();
var sgMail  = require('@sendgrid/mail');
var jwt     = require('jsonwebtoken');
var cookies = require('cookie-parser');
const { compareSync, genSalt, hashSync } = require('bcrypt');

// Model
const { dataset } = require('../models/dataset');
const { user } = require('../models/user');


// Populate data with dummy values
// router.get ('/populate/dataset', async (req , res) => {
//   const datasets = await dataset.find();
//   if(datasets.length > 0){
//     await dataset.deleteMany()
//     .then(() => {
//       console.log('Some previous datasets found, and got deleted');
//       res.send('Some previous datasets found, and got deleted. Kindly try again to make a new dataset');
//     })
//     .catch(error => {
//       console.log(error);
//       res.send(error);
//     })
//   }else{
//     new dataset({
//       profileSection : {
//         greeting : "Hi, I am" ,
//         name : "Muhammad Zubair" ,
//         bio : "Me as a web engineer have expertise in building (REST API's). I will u..." ,
//         profileFirstButton : "Download CV" ,
//         profileSecondButton : "Reach Me" ,
//         image : "/upoads/image.jpg"
//       },
  
//       aboutSection : {
//         image : "/uploads/images.jpg" ,
//         aboutSectionText : "Who am I" ,
//         sectionText : "ABOUT ME" ,
//         aboutUser : "Me as a web engineer have expertise in building (REST API's). I will u..." ,
//         aboutSectionButton : "Download Resume" ,
//       },
  
//       servicesSection : {
//         aboutSectionText : "text",
//         sectionText : "text",
//         sectionDescription : "text"
//       },
  
//       skillsSection : {
//         aboutSectionText : "text",
//         sectionText : "text",
//         sectionDescription : "text"
//       }, 
      
//       portfolioSection : {
//         aboutSectionText : "text",
//         sectionText : "text",
//         sectionDescription : "text"
//       },
  
//       experienceSection : {
//         aboutSectionText : "text",
//         sectionText : "text",
//         sectionDescription : "text"
//       },
  
//       contactSection : {
//         aboutSectionText : "text",
//         sectionText : "text",
//         sectionDescription : "text"
//       },
  
//       contactDetails : {
//         address         :   "text"  ,
//         email           :   "text"  ,
//         phoneNumber     :   "text"  ,
//         buttonText      :   "text"  
//       },
//       footer : {
//         description : 'text'
//       }
//     })
//     .save()
//     .then(()=> {
//       res.send ('dataset got populated')
//     })
//     .catch(error => {
//       console.log (error);
//       res.send (error.message);
//     })
//   }
// })

// Verify user  
function isLoggedIn (req , res , next) {
    const token = req.cookies.token ;

    // first check for token and then verify that token
    if(token){
      jwt.verify(token , 'My portfolio' , (error , decodedToken) => {
        if(!error){          
          next();
        }else{
          console.log(error);
          res.redirect('/login');
        }
      })
    }else{
      res.redirect('/login');
    }
  }
// End of verifying user

/* GET home page. */
router.get('/', async (req, res) => {
  try {    
    const data = await dataset.find() ;    
    res.render('index.ejs',{title:data[0].profileSection.name, 
                          width : 50,
                          data});
  } catch (error) {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/');
  }  
    
  });

// Admin Panel 
let datasetId ;
router.get('/adminpanel' , isLoggedIn , async (req , res) => {
  try {    
    const data = await dataset.find() ;
    datasetId = data[0]._id ;        
    res.render('admin-panel',{title:data[0].profileSection.name,                               
                              data})    
  } catch (error) {
    console.log(error);    
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  }
})

// Multer setup
const multer = require ('multer');
const storage = multer.diskStorage({
  destination:function(req,file,cb){
      cb(null,'./uploads/');
  },
  filename:function(req,file,cb){
      cb(null,file.originalname);
  }
});
const fileFilter = (req,file , cb)=>{
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'application/pdf' || file.mimetype == 'text/plain'){
      cb(null,true);
  }
  else{
      cb('File should be an image or pdf (in case of CV)',false)
  }
};

const upload = multer({
  storage:storage,
  limits:{
  fileSize:1024*1024*5 // Maximum 5 MB.
  },
  fileFilter:fileFilter
});
// End of multer setup

// New resume logics
router.post('/new/resume', isLoggedIn , upload.single('resume') , async (req , res) => {
  const data = await dataset.findById(datasetId)  ;

  try {
    data.resume.file = req.file.path ;
  await data.save()
  .then(() => {
    console.log('New resume uploaded');
    req.flash('success','Resume uploading finished.');
    res.redirect('/adminpanel')
  })
  .catch(error => {    
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
  } catch (error) {
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  }
})
// End of new resume logics

// Modifying profile details...
router.post('/modify/profile/details' , isLoggedIn , upload.single('profileImage'),async (req , res) => {    
const data = await dataset.findById(datasetId)  ;
  // check for Image (as a file)
  if(req.file){
    newImage = req.file.path;
  }else{
    newImage = data.profileSection.image ;
  }    

  const formData = {
    profileSection : {
      greeting    : req.body.greeting ,
      name        : req.body.name     ,
      bio         : req.body.bio      ,
      profileFirstButton  : req.body.profileFirstButton ,
      profileSecondButton : req.body.profileSecondButton,
      image       : newImage 
    }
  }
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('Profile Updation done');
    req.flash('success','Profile updation done');
    res.redirect('/adminpanel/#profile')
  })
  .catch(error => {    
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying profile details


// Modifying aboutSection details...
router.post('/modify/aboutSection/details' , isLoggedIn , upload.single('image'),async (req , res) => {  
  const data = await dataset.findById(datasetId)  ;
  // check for Image (as a file)
  if(req.file){
    newImage = req.file.path;
  }else{
    newImage = data.aboutSection.image ;
  }

  const formData = {
    aboutSection : {
      image             : newImage                  ,
      aboutSectionText  : req.body.aboutSectionText ,
      sectionText       : req.body.sectionText      ,
      aboutUser         : req.body.aboutUser        ,
      aboutSectionButton: req.body.aboutSectionButton       
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('About section Updation done');
    req.flash('success','About section updation done');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying aboutSection details


// Modifying servicesSection details...
router.post('/modify/servicesSection/details' , isLoggedIn , async (req , res) => {  

  const formData = {
    servicesSection : {
      aboutSectionText   : req.body.aboutSectionText  ,
      sectionText        : req.body.sectionText       ,
      sectionDescription : req.body.sectionDescription     
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('Services section Updation done');
    req.flash('success','Service section updation done');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying servicesSection details

// Adding a new service
router.post('/add/new/service' , isLoggedIn , upload.single('image'),async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.services.push({
    image       : req.file.path   ,
    name        : req.body.name  ,
    description : req.body.description  ,
  });

  await data.save()
  .then(() => {
    console.log('New service added');
    req.flash('success','New Service added');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of adding a new service

// Modifying service details
router.post('/modify/:serviceId/service/details' , isLoggedIn , upload.single('image'),async (req , res) => {
  const data = await dataset.findById(datasetId);
      let newImage ; 
  data.services.forEach(service => {
    if((service._id).equals(req.params.serviceId)){
      if(req.file){
        newImage = req.file.path;
      }else{
        newImage = service.image ;
      }
      service.image = newImage ;
      service.name = req.body.name ;
      service.description = req.body.description ;
    }
  })

  await data.save()
  .then(() => {
    console.log('Service Modified');
    req.flash('success','Service details got modified');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying service details

// Delete a service
router.get('/delete/:serviceId/service' , isLoggedIn , async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.services = data.services.filter(service => !((service._id).equals(req.params.serviceId)));
  await data.save()
  .then(() => {
    console.log('SERVICE got deleted');
    req.flash('success','Service got deleted');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of deleting a service 

// Modifying skillsSection details...
router.post('/modify/skillsSection/details' , isLoggedIn , async (req , res) => {  

  const formData = {
    skillsSection : {
      aboutSectionText   : req.body.aboutSectionText  ,
      sectionText        : req.body.sectionText       ,
      sectionDescription : req.body.sectionDescription     
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('skillsSection Updation done');
    req.flash('success','Skills section updation done');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying skillsSection details

// Adding a new skill name In (skills Set)
router.post('/add/new/skill/name' , isLoggedIn , async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.skillsSet.push({    
    name        : req.body.name  ,    
  });

  await data.save()
  .then(() => {
    console.log('New skills Name added');
    req.flash('success','New Skill name got added');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of adding a new skill name

// Modifying skill name in (skillsSet)
  router.post('/modify/skill/names' , isLoggedIn , async (req ,res) => {
    const data = await dataset.findById(datasetId);    

    data.skillsSet.forEach((skill , index) => {
      skill.name = req.body.name[index] ;
    })

    await data.save()
    .then(() => {
      console.log('Skills Names Modified');
      req.flash('success','Skills set got modified');
    res.redirect('/adminpanel')
    })
    .catch(error => {
      console.log(error);
      req.flash('error',JSON.stringify(error.message));
      res.redirect('/adminpanel');
    })
  })
// End of modifying skill name in (skillsSet)

// Adding a new skill
router.post('/add/new/skill' , isLoggedIn , async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.skills.push({    
    name        : req.body.name       , 
    percentage  : req.body.percentage ,   
  });

  await data.save()
  .then(() => {
    console.log('New skill added');
    req.flash('success','New skill got added');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of adding a new skill


// Modifying skill name in (skillsSet)
router.post('/modify/skills/details' , isLoggedIn , async (req ,res) => {
  const data = await dataset.findById(datasetId);    

  data.skills.forEach((skill , index) => {
    skill.name = req.body.name[index] ;
    skill.percentage = req.body.percentage[index];
  })

  await data.save()
  .then(() => {
    console.log('Skills details Modified');
    req.flash('success','Skill details got modified');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying skill name in (skillsSet)


// Modifying Skills Image ...
router.post('/change/skills/image' , isLoggedIn , upload.single('skillsImage'),async (req , res) => {  
    
  try {
    const data = await dataset.findById(datasetId);
    data.skillsImage.image = req.file.path ;
    
    await data.save()
    .then(() => {
      console.log('SkillsImage Updation done');
      req.flash('success','Skills Image changed');
      res.redirect('/adminpanel')
    })
    .catch(error => {
      console.log(error);
      req.flash('error',JSON.stringify(error.message));
      res.redirect('/adminpanel');
    })
  } catch (error) {
    console.log(error);
      req.flash('error',JSON.stringify(error.message));
      res.redirect('/adminpanel');
  }
})
// End of modifying Skills Iamge

// Modifying portfolioSection details...
router.post('/modify/portfolioSection/details' , isLoggedIn , async (req , res) => {  

  const formData = {
    portfolioSection : {
      aboutSectionText   : req.body.aboutSectionText  ,
      sectionText        : req.body.sectionText       ,
      sectionDescription : req.body.sectionDescription     
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('portfolioSection Updation done');
    req.flash('success','Portfolio section updation done');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying portfolioSection details


// Adding a new Project / portfolio
router.post('/add/new/portfolio' , isLoggedIn , upload.single('image'),async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.portfolios.push({
    image       : req.file.path         ,
    name        : req.body.name         ,
    description : req.body.description  ,
    portfolioFirstButton      : req.body.portfolioFirstButton   ,
    portfolioSecondButton     : req.body.portfolioSecondButton  ,
    portfolioLivePreviewLink  : req.body.portfolioLivePreviewLink
  });

  await data.save()
  .then(() => {
    console.log('New Portfolio added');
    req.flash('success','New Portfolio / project got added');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of adding a new Project / portfolio

// Modifying PORTFOLIO details
router.post('/modify/:portfolioId/portfolio/details' , isLoggedIn , upload.single('image'),async (req , res) => {
  const data      = await dataset.findById(datasetId);
  let   newImage ; 

  data.portfolios.forEach(portfolio => {
    if((portfolio._id).equals(req.params.portfolioId)){
      if(req.file){
        newImage = req.file.path;
      }else{
        newImage = portfolio.image ;
      }
      portfolio.image       = newImage ;
      portfolio.name        = req.body.name ;
      portfolio.description = req.body.description ;
      portfolio.portfolioFirstButton      = req.body.portfolioFirstButton   ;
      portfolio.portfolioSecondButton     = req.body.portfolioSecondButton  ;
      portfolio.portfolioLivePreviewLink  = req.body.portfolioLivePreviewLink
    }
  })

  await data.save()
  .then(() => {
    console.log('Portfolio Modified');
    req.flash('success','Portfolio details got modified');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying PORTFOLIO details

// Adding Screenshots to a PORTFOLIO
router.post('/upload/screenshots/for/:portfolioId' , isLoggedIn , upload.array('screenshots'),async (req , res) => {
  
  const data = await dataset.findById(datasetId);

  // First find the exact portfolio
  data.portfolios.forEach(portfolio => {
    if((portfolio._id).equals(req.params.portfolioId)){
      // Now loop through all the files
      req.files.forEach(file => {
        // Here push each file separately
        portfolio.screenshots.push({
          name : file.path
        });
      })
    }
  })  

  await data.save()
  .then(() => {
    console.log('Portfolio screenshots added');
    req.flash('success','Project screenshots added');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of adding Screenshots to a PORTFOLIO


// Modifying Screenshots of a PORTFOLIO
router.post('/update/screenshots/for/:portfolioId' , isLoggedIn , upload.array('screenshots'),async (req , res) => {
  
  const data = await dataset.findById(datasetId);

  // // First delete the already present screenshots
  // data.portfolios.forEach(portfolio => {
  //   if((portfolio._id).equals(req.params.portfolioId)){      
  //     portfolio.screenshots.forEach(() => {        
  //       portfolio.screenshots.pop();
  //     })
  //     console.log('Array got empty');
  //     return ;
  //   }
  // }) 
  // // end of deleting the already present screenshots

  // Now again find the exact portfolio
  data.portfolios.forEach(portfolio => {
    if((portfolio._id).equals(req.params.portfolioId)){
      // first empty the screenshots array
      portfolio.screenshots = [] ;      

      // Now loop through all the files
      req.files.forEach(file => {
        // Here update the screenshot with the new one
        portfolio.screenshots.push({
          name : file.path
        }) ;
      })
      return ;
    }
  })  

  await data.save()
  .then(() => {
    console.log('Portfolio screenshots modified');
    req.flash('success','Project screenshots modified');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying Screenshots of a PORTFOLIO


// Delete a PORTFOLIO Screenshot
router.get('/Delete/:portfolioId/portfolio/:screenshotId/screenshot' , isLoggedIn , async (req , res) => {
  const data = await dataset.findById(datasetId);

  // First find the exact portfolio
  data.portfolios.forEach(portfolio => {
    if((portfolio._id).equals(req.params.portfolioId)){
      // Now loop through all except the one with (:screenshotId) and make a new array
      portfolio.screenshots = portfolio.screenshots.filter(screenshot => !((screenshot._id).equals(req.params.screenshotId)));     
    }
  })  

  await data.save()
  .then(() => {
    console.log('Portfolio screenshot Deleted');
    req.flash('success','Project screenshot got deleted');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of deleting a PORTFOLIO

// Showing portfolio screenshots
router.get('/:portfolioId/screenshots', async (req , res) => {
  try {
    const data = await dataset.find();

    // First find the exact portfolio
    data[0].portfolios.forEach(portfolio => {
      if((portfolio._id).equals(req.params.portfolioId)){
        res.render('screenshots',{title : portfolio.name,
                                  screenshots : portfolio.screenshots})
    }
  }) 
  } catch (error) {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/');
  }
})
// End of showing portfolio screenshots 


// Delete a PORTFOLIO
router.get('/delete/:portfolioId/portfolio' , isLoggedIn , async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.portfolios = data.portfolios.filter(portfolio => !((portfolio._id).equals(req.params.portfolioId)));
  await data.save()
  .then(() => {
    console.log('PORTFOLIO got deleted');
    req.flash('success','Portfolio / project got deleted');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of deleting a PORTFOLIO


// Modifying experienceSection details...
router.post('/modify/experienceSection/details' , isLoggedIn , async (req , res) => {  

  const formData = {
    experienceSection : {
      aboutSectionText   : req.body.aboutSectionText  ,
      sectionText        : req.body.sectionText       ,
      sectionDescription : req.body.sectionDescription     
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('experienceSection Updation done');
    req.flash('success','Experience section updation done');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    res.send(error);
  })
})
// End of modifying experienceSection details


// Adding a new EXPERIENCE
router.post('/add/new/experience' , isLoggedIn , upload.single('image'),async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.experiences.push({
    image               : req.file.path     ,
    duration            : req.body.duration ,
    title               : req.body.title    ,
    company             : req.body.company  ,
    companyWebsiteLink  : req.body.companyWebsiteLink ,
    description         : req.body.description
  });

  await data.save()
  .then(() => {
    console.log('New experience added');
    req.flash('success','New experience got added');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of adding a new EXPERIENCE

// Modifying EXPERIENCE details
router.post('/modify/:experienceId/experience/details' , isLoggedIn , upload.single('image'),async (req , res) => {
  const data = await dataset.findById(datasetId);
  let newImage = ''; 
  data.experiences.forEach(experience => {
    if((experience._id).equals(req.params.experienceId)){
      if(req.file){
        newImage = req.file.path;
      }else{
        newImage = experience.image ;
      }
      experience.image     = newImage          ;
      experience.duration  = req.body.duration ;
      experience.title     = req.body.title    ;
      experience.company   = req.body.company  ;
      experience.companyWebsiteLink  = req.body.companyWebsiteLink ;
      experience.description         = req.body.description
    }
  })

  await data.save()
  .then(() => {
    console.log('Experience Modified');
    req.flash('success','Experience got modified');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying EXPERIENCE details

// Delete an EXPERIENCE
router.get('/delete/:experienceId/experience' , isLoggedIn , async (req , res) => {
  const data = await dataset.findById(datasetId);
  data.experiences = data.experiences.filter(experience => !((experience._id).equals(req.params.experienceId)));
  await data.save()
  .then(() => {
    console.log('Experience got deleted');
    req.flash('success','Experience got deleted');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of deleting an EXPERIENCE


// Modifying contactSection details...
router.post('/modify/contactSection/details' , isLoggedIn , async (req , res) => {  

  const formData = {
    contactSection : {
      aboutSectionText   : req.body.aboutSectionText  ,
      sectionText        : req.body.sectionText       ,
      sectionDescription : req.body.sectionDescription     
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('contactSection Updation done');
    req.flash('success','Contact section updation done');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying contactSection details

// Modifying contact details...
router.post('/modify/contact/details' , isLoggedIn , async (req , res) => {  

  const formData = {
    contactDetails : {
      address         :   req.body.address      ,
      email           :   req.body.email        ,
      phoneNumber     :   req.body.phoneNumber  ,
      buttonText      :   req.body.buttonText     
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('Contact Details Updation done');
    req.flash('success','Contact details got modified');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying Contact details

// Modifying footerSection details...
router.post('/modify/footerSection/details' , isLoggedIn , async (req , res) => {  

  const formData = {
    footerSection : {
      description : req.body.description ,
    }
  } 
  
  await dataset.findByIdAndUpdate(datasetId,formData)  
  .then(() => {
    console.log('footer section Updation done');
    req.flash('success','Footer section updation done');
    res.redirect('/adminpanel')
  })
  .catch(error => {
    console.log(error);
    req.flash('error',JSON.stringify(error.message));
    res.redirect('/adminpanel');
  })
})
// End of modifying footerSection details


// Contact form
router.post('/contact' , (req , res) => {
  sgMail.setApiKey(process.env.sendgridApi);  

  // Form data is in the req.body object so  
  var textBody = `FROM: ${req.body.contactFormName} EMAIL: ${req.body.contactFormEmail} MESSAGE: ${req.body.contactFormMessage}`,
      htmlBody = `<h4>Mail From Portfolio Contact Form</h4> <h2>Message : </h2> <p>${req.body.contactFormMessage}</p> <br> <p> from: <a href="mailto:${req.body.contactFormEmail}">${req.body.contactFormEmail}</a></p>`;
      
      const message = {
        to : 'muhammad.zubairmz12349@gmail.com',
        from : {
          name : req.body.contactFormName ,
          email : 'muhammad.zubairmz12349@gmail.com'
        },
        subject : req.body.contactFormSubject,
        text : textBody,
        html : htmlBody
      }      
      sgMail.send(message)
      .then(() => {

        req.flash('success','Message sent! Thank you.');
        res.redirect('/')
      })
      .catch(error => {
        console.log(error);
        req.flash('error',JSON.stringify(error.message));
        res.redirect('/');      
      })
})
// End of contact form

// User saying Hi from the footer
router.post('/user/greeting' , (req , res) => {
  sgMail.setApiKey(process.env.sendgridApi);  

  // Form data is in the req.body object so  
  var textBody = `FROM: ${req.body.email}  MESSAGE: Hi, from the portfolio`,
      htmlBody = `<h4>Greeting from portfolio</h4> <h2>Message : </h2> <p> Hi, how are you ? Hope you are doing well.</p> <br> <p> from: <a href="mailto:${req.body.email}">${req.body.email}</a></p>`;
      
      const message = {
        to : 'muhammad.zubairmz12349@gmail.com',
        from : {
          name : req.body.contactFormName ,
          email : 'muhammad.zubairmz12349@gmail.com'
        },
        subject : 'Greeting from portfolio',
        text : textBody,
        html : htmlBody
      }      
      sgMail.send(message)
      .then(() => {

        req.flash('success','Greeting (HI) sent, Thank you.');
        res.redirect('/')
      })
      .catch(error => {
        console.log(error);
        req.flash('error',JSON.stringify(error.message));
        res.redirect('/');       
      })
})
// End of saying hi from the footer

// Registrtion logics
router.get('/register', (req , res) => {
  res.render('registration',{title : 'Register'});
})

router.post('/register', async (req , res) => {
  let users = await user.find();
  if(users.length > 0){
    console.log('User error: A user already registered');
    res.status(400).json({
      error : {
        name : 'emailError',
        message : 'A user already exists'
      }
    })
  }else{
    // Encrypt user password ;
    const salt = await genSalt();
    let userPassword = hashSync(req.body.password , salt);
    new user ({
      email     : req.body.email ,        
      password : userPassword
    })
    .save()
    .then((user) => {
      // generate a payload for jwtToken 
      const payload = {
        id : user._id     ,
        email : user.email 
      };

      // now create a jwt token
      const token = jwt.sign(payload , 'My portfolio' , {expiresIn : '1d'});

      // Now save above token in the browser cookies
      res.cookie('token' , token , {httpOnly : true });

      // Finally redirect the user into the admin dashboard
      res.status(200).json({
        success : {
          name : 'User got registered',
          message : 'User successfully registered'
        }
      })
      console.log('User got registered');
    })
    .catch(error => {
      console.log(error);
      res.status(400).json({
        error : {
          name : 'emailError',
          message : JSON.stringify(error.message)
        }
      })
    })
  }
})
// End of registration logics

// Login logics
router.get('/login', (req , res) => {
  res.render('login',{title : 'Login'});
})

router.post('/login', async (req , res) => {  

  try {    
    let userEmail = req.body.email ;
    const savedUser = await user.findOne({email : userEmail});
    if(savedUser){
      if(!(compareSync(req.body.password , savedUser.password))){
        res.status(400).json({
          error : {
            name : 'passwordError',
            message : 'Password is incorrect'
          }
        })     
      }else{
        // generate a payload for jwtToken 
        const payload = {
          id : savedUser._id     ,
          email : savedUser.email 
        };
  
        // now create a jwt token
        const token = jwt.sign(payload , 'My portfolio' , {expiresIn : '1d'});
  
        // Now save above token in the browser cookies
        res.cookie('token' , token , {httpOnly : true });
  
        // Finally redirect the user into the admin dashboard
        res.status(200).json({
          success : {
            name : 'user',
            message : 'A user got logged in'
          }
        })
        console.log('User got logged in');
      }
    }else{
      res.status(400).json({
        error : {
          name : 'emailError',
          message : 'Email do not registered'
        }
      })
    }    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error : {
        name : 'emailError',
        message : JSON.stringify(error.message)
      }
    })
  }

})
// End of login logics

module.exports = router;
