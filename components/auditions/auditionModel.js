let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId

var auditionSchema = new mongoose.Schema({
    memberId: mongoose.Schema.Types.ObjectId,
    auditionProfileId: mongoose.Schema.Types.ObjectId,
    productionTitle: {
        type: String
    },
    productionType: {
        type: String
    },
    subProductionType: {
        type: String,
        default: ''
    },
    productionDescription: {
        type: String
    },
    productionCompany: {
        type: String,
        default: ""
    },
    productionPersonName: {
        type: String
    },
    startDate: {
        type: Date,
        default: ""
    },
    auditionExipires: {
        type: Date,
        default: ""
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    draftMode: {
        type: Boolean,
    },
    keywords: {
        type: String,
        default: ""
    },
    role: {
        type: [{
            _id:0,
            roleName: {
                type: String
            },
            roleType: {
                type: String
            },
            gender: {
                type: String,
                default: ""
            },
            ageStart: {
                type: Number,
                default:0
            },
            ageEnd: {
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
            ethnicity: {
                type: String,
                default: ""
            },
            mediaRequired: {
                type: Array, 
                default: [] 
                // ["Video Reel","Head Shot / Photo","Audio Reel"]
            },
            roleDescription: {
                type: String,
                default: ""
            },
            hairColour: {
                type: String,
                default: ""
            },
            bodyType: {
                type: String,
                default: ""
            },
            eyeColour: {
                type: String,
                default: ""
            },
            //for angular use
            ageRange:{
                type:String,
                default:""
            },
            height:{
                type:String,
                default:""
            },
            //******************************** */
        }],
        default: []
    },
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
        default: ""
    },
    updatedBy: {
        type: String,
        default: ""
    },
    favoritedBy: {
        type: [{
            memberId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        default: []
    }
}, {
        versionKey: false
});

let collName = "audition";
let audition = mongoose.model('audition', auditionSchema, collName);
module.exports = audition;