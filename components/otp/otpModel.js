let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId

var OTPSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    medium: {
        type: String,
        enum: ["mobile", "email"],

    },
    reason: {
        type: String,
        default: ""
    },
    OTP: {
        type: String
    },
    ///// Email Address or Mobile Number based on MemberID
    toAddress: {
        type: String,
        default: ""
    },
    expiryTimeInMins: {
        type: Number,
        default: 60
    },
    gatewayResponse: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:  { 
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

let collName = "OTP";
let OTP = mongoose.model('OTP', OTPSchema, collName);
module.exports = OTP;

module.exports.createOTP = function (newOTP, callback) {
    newOTP.save(callback);
};