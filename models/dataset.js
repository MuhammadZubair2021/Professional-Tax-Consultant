const mongoose = require('mongoose');
module.exports.dataset = mongoose.model('dataset',new mongoose.Schema(
    {        
        resume : {
            file : String ,
        },
        
        profileSection : {
            greeting : String,
            name : String,
            bio : String ,
            profileFirstButton : String ,
            profileSecondButton : String ,
            image : String
        },

        aboutSection : {
            image : String,
            aboutSectionText : String,
            sectionText : String,
            aboutUser : String ,
            aboutSectionButton : String 
        },

        servicesSection : {
            aboutSectionText : String,
            sectionText : String,
            sectionDescription : String
        },

        services : [{
            image   :   String,
            name    :   String, 
            description :   String,
        }],

        skillsSection : {
            aboutSectionText : String,
            sectionText : String,
            sectionDescription : String
        },

        skillsSet : [{
            name : String
        }],

        skills : [{
            name : String ,
            percentage : Number ,
        }],

        skillsImage : {
            image : String 
        },

        portfolioSection : {
            aboutSectionText : String,
            sectionText : String,
            sectionDescription : String
        },

        portfolios : [{
            image : String ,
            name  : String ,
            description : String ,
            portfolioFirstButton : String ,
            screenshots : [{name : String}],
            portfolioSecondButton : String ,
            portfolioLivePreviewLink : String
        }],

        experienceSection : {
            aboutSectionText : String,
            sectionText : String,
            sectionDescription : String
        },

        experiences : [{
            image               :   String ,
            duration            :   String ,
            title               :   String ,
            company             :   String ,
            companyWebsiteLink  :   String ,
            description         :   String
        }],

        contactSection : {
            aboutSectionText : String,
            sectionText : String,
            sectionDescription : String
        },

        contactDetails : {
            address         :   String  ,
            email           :   String  ,
            phoneNumber     :   String  ,
            buttonText      :   String  
        },

        footerSection : {
            description     :   String ,
        }
    }
));