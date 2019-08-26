let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let active, inactive;

let payCreditsSchema = new mongoose.Schema({
    payType:{
        type: String,
        default:"",
    },
    memberId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    celebId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    managerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    referralId: {
        type: mongoose.Schema.Types.ObjectId
    },
    creditValue: {
        type: Number,
        default: 0
    },
    celebPercentage: {
        type: Number,
        default: 0
    },
    managerPercentage: {
        type: Number,
        default: 0
    },
    celebKonnectPercentage: {
        type: Number,
        default: 0
    },
    status : {
        type: String,
        enum: [active, inactive],
        default: inactive
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    createdBy:{
        type: String,
        default:"",
    },
    updatedBy:{
        type: String,
        default:"",
    },
},{
    versionKey: false
});

let payCredits = (module.exports = mongoose.model("payCredits", payCreditsSchema));

// Create a payCredits
module.exports.createPayCredits = function (newpayCredits, callback) {
    newpayCredits.save(callback);
};

// Edit a payCredits

module.exports.editPayCredits = function (id, reqbody, callback) {
    payCredits.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getPayCreditsById = function (id, callback) {
    payCredits.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    payCredits.find(query, callback);
  };

