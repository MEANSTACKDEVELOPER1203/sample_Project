let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId

var roleSchema = new mongoose.Schema({
    roleName: {
        type: String
    },
    auditionId: { 
        type: mongoose.Schema.Types.ObjectId ,
        ref:'audition'
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
        default: ""
    },
    ageEnd: {
        type: Number,
        default: ""
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
        type: Array,  ///// change string to array
        default: []
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
    // draftMode: {
    //     type: String,
    //     default: ""
    // },
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
    }
}, {
    versionKey: false
});

let collName = "role";
let role = mongoose.model('role', roleSchema, collName);
module.exports = role;