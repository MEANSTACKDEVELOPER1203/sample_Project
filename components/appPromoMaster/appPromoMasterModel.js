let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let approved;
let rejected;
let pending;
let appPromoMasterSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    reqDateTime: { 
        type: Date, 
        default: Date.now 
    },
    promoterIncentiveValue: {
         type: Number,
          default: 0 
    },
    installerIncentiveValue: { 
        type: Number,
         default: 0 
    },
    status: {
        type: String,
        enum: [approved, rejected, pending],
        default: "pending"
    },
    approvedBy: { 
        type: String, 
        default: "" 
    },
    approvedDateTime: {
         type: Date, 
         default: "" 
    },
    rejectedReason: { 
        type: String, 
        default: ""
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
},
{
    versionKey: false
});

let appPromoMaster = (module.exports = mongoose.model("appPromoMaster", appPromoMasterSchema));

// Create a appPromoMaster
module.exports.createAppPromoMasterRecord = function (appPromoMasterRecord, callback) {
    appPromoMasterRecord.save(callback);
};

// Edit a financialTransaction

module.exports.editAppPromoMaster = function (id, reqbody, callback) {
    appPromoMaster.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getappPromoMasterById = function (id, callback) {
    appPromoMaster.findById(ObjectId(id), callback);
};