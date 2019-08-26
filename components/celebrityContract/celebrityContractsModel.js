let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for Email Communication
let email;
let sms;
let audio;
let video;
let chat;
let fan, follow, app, content, media, fashion;

let celebrityContractSchema = new mongoose.Schema({
    memberId: { 
        type: String, 
        required: true 
    },
    // memberId: {
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'User'
    // },
    serviceType: {
        type: String,
        enum: [audio, video, chat, fan, follow, app, content, media, fashion],
        required: true
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    minDuration: { 
        type: Number, 
        required: true 
    },
    maxDuration: { 
        type: Number,
        required: true 
    },
    managerSharePercentage: { 
        type: Number, 
        default: 0 
    },
    charitySharePercentage: { 
        type: Number,
        default: 0
    },
    promoterSharePercentage: { 
        type: Number, 
        default: 0 
    },
    sharingPercentage: { 
        type: Number, 
        default: 0 
    },
    serviceCredits: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean,
        default: true 
    },
    contractUpdateRemarks: { 
        type: String, 
        default: "" 
    },
    specialNotes: {
        type: String,
        default: "" 
    },
    createdBy: { 
        type: String,
        default: "" 
    },
    createdDateTime: {
        type: Date,
        default: Date.now 
    },
    updatedBy: { 
        type: String,
        default: Date.now  
    },
    updatedDateTime: { 
        type: Date,
        default: Date.now 
    }
},{
    versionKey: false
});

let celebrityContract = (module.exports = mongoose.model("celebrityContracts", celebrityContractSchema));

module.exports.createCelebrityContract = function (newCelebrityContract, callback) {
    newCelebrityContract.save(callback);
};

// Edit a celebrityContract

module.exports.editElog = function (id, reqbody, callback) {
    celebrityContract.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id (getCelebrityContractStatus)

module.exports.getCelebrityContractById = function (id, callback) {
    celebrityContract.findById(ObjectId(id), callback);
};

