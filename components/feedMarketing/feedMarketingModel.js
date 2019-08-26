const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;

let New;
let inProgress;
let active;
let inactive;
let credit;
let debited;
let credited;
let Likes;
let Views;
let Clicks;


let feedMarketingSchema = new mongoose.Schema({
    feedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Feed',
        required: true
    },
    campaignType: {
        type: String,
        enum: [Likes, Views, Clicks],
        required: true
    },
    proposedBudget : {
        type: Number, 
        default: 0
    },
    proposedReach : {
        type: Number, 
        default: 0
    },
    actualBudget : {
        type: Number, 
        default: 0
    },
    actualReach : {
        type: Number, 
        default: 0
    },
    transactionStatus: {
        type: String,
        enum: [New, inProgress, active],
        default: New
    },
    transactionApproved: {
        type: Boolean,
        default: false
    },
    approvedBy : String,
    transactionReferenceDetails : {
        transactionDate : { 
            type: Date 
        },
        processedBy : { 
            type: String 
        },
        value: { 
            type: Number 
        },
        type: {
            type: String,
            enum: [credited, debited]
        },
        gatewayRefNo : String
    },
    status: {
        type: String,
        enum: [active, inactive],
        default: inactive
    },
    campaignStartDate: { 
        type: Date, 
        default: ""
    },
    campaignEndDate: { 
        type: Date, 
        default: "" 
    },
    created_at: { 
        type: Date,
        default: Date.now
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
},{
    versionKey: false
});

let feedMarketing = (module.exports = mongoose.model("feedMarketing", feedMarketingSchema));

// Create a feedMarketing
module.exports.createNewRecord = function (newRecord, callback) {
    newRecord.save(callback);
};



// update feed marketing details

module.exports.updateFeedMarketing = function (id, reqbody, callback) {
    feedMarketing.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// update transaction reference details

module.exports.updateTranRefDetails = function (id, transactionReferenceDetails, callback) {
    feedMarketing.findByIdAndUpdate(id, { $set: { "transactionReferenceDetails": transactionReferenceDetails } },callback);
  };

// Find by Id

module.exports.getFeedlogById = function (id, callback) {
  //  Feedlog.findById(ObjectId(id), callback);
};


