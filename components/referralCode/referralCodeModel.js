let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let referralCodeSchema = new mongoose.Schema({
    memberId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    memberCode: {
        type: String,
        default: ""
    },
    referralCreditValue: { 
        type: Number, 
        default:0
    },
    referreCreditValue: { 
        type: Number, 
        default:0
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
    }
    },{
        versionKey: false
    });

let referralCode = (module.exports = mongoose.model("referralCode", referralCodeSchema));

// Create a referralCode

module.exports.createReferralCode = function (newreferralCode, callback) {
    newreferralCode.save(callback);
};

// Edit a referralCode

module.exports.editReferralCode = function (id, reqbody, callback) {

    referralCode.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getReferralCodeById = function (id, callback) {
    referralCode.findById(ObjectId(id), callback);
};

// Find by email

module.exports.getReferralCodeByEmail = function (email, callback) {
    let query = { email: email };
    referralCode.find(query, callback);
};
module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    referralCode.find(query, callback);
  };

