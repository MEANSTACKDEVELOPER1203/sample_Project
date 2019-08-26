let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId
let active, inactive;
var Float = require('mongoose-float').loadType(mongoose, 3);
let newBorns, toddlers, crawlers, teenagers, adults, veterans;
let image, video, audio, document;

var auditionsProfilesSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    title: {
        type: String,
        default: ""
    },
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    otherNames: {
        type: String,
        default: ""
    },
    screenName: {
        type: String,
        default: ""
    },
    aboutMe: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
        // required: true
    },
    mobileNumber: {
        type: String,
        default: ""
        //required: true
    },
    alternateEmail: {
        type: String,
        default: ""
    },
    alternateMobileNumber: {
        type: String,
        default: ""
    },
    profilePicUrl: {
        type: String,
        //default image
        default: "uploads/avatarDefalt.png"
        // default: "uploads/auditions/ck_pr2_2018-10-26_1540552708719_profilePicture"
    },
    profilePicName: {
        type: String,
        default: "avatarDefalt.png"
        // default: "ck_pr2_2018-10-26_1540552708719_profilePicture"
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    dob: {
        type: Date,
        default: ""
    },
    placeOfBirth: {
        type: String,
        default: ""
    },
    roleType: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
    },
    bodyType: {
        type: String,
        default: ""
    },
    skinTone: {
        type: String,
        default: ""
    },
    eyeColor: {
        type: String,
        default: ""
    },
    hairColor: {
        type: String,
        default: ""
    },
    ageGroup: {
        type: String,
        enum: [newBorns, toddlers, crawlers, teenagers, adults, veterans],
        default: ""
    },
    height: {
        type: Number,
        default: 0
    },
    weight: {
        type: Number,
        default: 0
    },
    startHeight: {
        type: Number,
        default: 0
    },
    endHeight: {
        type: Number,
        default: 0
    },
    startWeight: {
        type: Number,
        default: 0
    },
    endWeight: {
        type: Number,
        default: 0
    },
    ageStart :{
        type: Number,
        default: 0
    },
    ageEnd :{
        type: Number,
        default: 0
    },
    ethnicity: {
        type: String,
        default: ""
    },
    currentRoles: {
        type: Array,
        default: []
    },
    interestedIn: {
        type: Array,
        default: []
    },
    hobbies: {
        type: Array,
        default: []
    },
    skills: {
        type: Array,
        default: []
    },
    languages: {
        type: Array,
        default: []
    },
    highestEducation: {
        type: String,
        default: ""
    },
    schoolOrUniversity: {
        type: String,
        default: ""
    },
    professionalEducation: {
        type: String,
        default: ""
    },
    proSchoolOrUniversity: {
        type: String,
        default: ""
    },
    portFolioPictures: {
        type: Array,
        default: []
    },
    portFolioVideos: {
        type: Array,
        default: []
    },
    showReal: {
        type: Array,
        default: []
    },
    countryCode: {
        type: String,
        default: ""
    },
    isPassport: {
        type: Boolean,
        default: false
    },
    isLicense: {
        type: Boolean,
        default: false
    },
    publicProfileUrl: {
        type: String,
        default: ""
    },
    socialLinks: {
        type: Array,
        default: []
    },
    mediaLinksOrArticles: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: [active, inactive],
        default: "active"
    },
    showAge:{
        type:Boolean,
        default:false
    },
    media: [{
        mediaId: mongoose.Schema.Types.ObjectId,
        mediaRatio: {
            type: Float,
            default: 0.000
        },
        mediaCaption: {
            type: String,
            default: "",
        },
        mediaType: {
            type: String,
            default: "",
            enum: [image, video, audio, document]
        },
        mediaSize: {
            type: Float
            //default: 0.000
        },
        mediaCreditValue: {
            type: Number,
            default: 0.0
        },
        src: {
            mediaUrl: {
                type: String,
                default: ""
            },
            mediaName: {
                type: String,
                default: ""
            },
            videoUrl: {
                type: String,
                default: ""
            },
        },
        faceFeatures: [{
            posX: {
                type: Number,
                default: 0
            },
            posY: {
                type: Number,
                default: 0
            },
            width: {
                type: Number,
                default: 0
            },
            height: {
                type: Number,
                default: 0
            }
        }]
    }],
    education: [{
        educationId: mongoose.Schema.Types.ObjectId,
        school: {
            type: String,
            default: ""
        },
        degree: {
            type: String,
            default: "",
        },
        instructor: {
            type: String,
            default: ""
        },
        yearOfCompletion: {
            //type: Date,
            type:String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        monthOfCompletion: {
            type: String,
            default: ""
        }
    }],
    experience: [{
        experienceId: mongoose.Schema.Types.ObjectId,
        productionType: {
            type: String,
            default: ""
        },
        projectName: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            default: ""
        },
        director: {
            type: String,
            default: ""
        },
        fromMonth: {
            //type: Date,
            type: String,
            default: ""
        },
        fromYear: {
            //type: Date,
            type: String,
            default: ""
        },
        toMonth: {
            //type: Date,
            type: String,
            default: ""
        },
        toYear: {
            //type: Date,
            type: String,
            default: ""
        }
    }],

    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date,
        default: Date.now 
    },
    createdBy: {
        type: String,
        default: "",
    },
    updatedBy: {
        type: String,
        default: "",
    },
    profileCompletenes: {
        type: String,
        enum: [1, 2, 3, 4],
        default: "1"
    },
    tilents:{
        type:[
            {
                tilentId:{
                    type:mongoose.Schema.Types.ObjectId,
                    default:null,
                    ref:'tilents'
                },
                tilentTitle:{
                    type:String,
                    default:''
                },
                subTilent:{
                    type:String,
                    default:''
                },
                rating:{
                    type:String,
                    default:""
                },
                otherTalent:{
                    type:String,
                    default:""
                }
            }
        ],
        default:[]
    },
    achievements:{
        type:[
            {
                awardTitle:{
                    type:String,
                    default:''
                },
                category:{
                    type:String,
                    default:''
                },
                presentedAt:{
                    type:String,
                    default:''
                },
                year:{
                    type:String,
                    default:''
                }
            }
        ],
        default:[]
    },
    favoritedBy:{
        type:[{
            memberId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
        }],
        default:[]
    }
},
{
    versionKey: false
});


let collName = "auditionsProfiles";
let auditionsProfiles = mongoose.model('auditionsProfiles', auditionsProfilesSchema, collName);
module.exports = auditionsProfiles;