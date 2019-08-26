let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let active, inactive;
let newBorns, toddlers, crawlers, teenagers, adults, veterans;

let auditionProfileSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    title: {
        type: String,
       // required: true
    },
    firstName: {
        type: String,
        //required: true
    },
    lastName: {
        type: String,
        //required: true
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
       //required: true
    },
    mobileNumber: {
        type: String,
        //required: true
    },
    profilePicUrl: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        //required: true
    },
    state: {
        type: String,
        //required: true
    },
    country: {
        type: String,
        //required: true
    },
    dob: {
        type: String,
        //required: true
    },
    placeOfBirth: {
        type: String,
        //required: true
    },
    gender: {
        type: String,
        //required: true
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
    age: {
        type: Number,
        //enum: [newBorns, toddlers, crawlers, teenagers, adults, veterans],
        default: ""
    },
    height: {
        type: String,
        default: ""
    },
    weight: {
        type: String,
        default: ""
    },
    languages: {
        type: Array,
        default: []
    },
    skills: {
        type: Array,
        default: []
    },
    Ethnicity: {
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
    portFolioDocuments: {
        type: Array,
        default: []
    },
    showReal: {
        type: Array,
        default: []
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
    profileCompletenes : {
        type: String,
        enum: [1,2,3,4],
        default: "1"
        }
},
{
    versionKey: false
});

let auditionProfile = (module.exports = mongoose.model("auditionProfile", auditionProfileSchema));

// Create a newAuditionProfile
module.exports.createAuditionProfile = function (newAuditionProfile, callback) {
    newAuditionProfile.save(callback);
};

// Edit an AuditionProfile

module.exports.editAuditionProfile = function (id, reqbody, callback) {
    auditionProfile.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getCelebSurveyById = function (id, callback) {
    auditionProfile.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = { memberId: id };
    auditionProfile.find(query, callback);
};

