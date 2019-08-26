let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let approved;
let rejected;
let appPromoCodesSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    promoCode: [{
        code: {
            type: String,
            default: ""
        },
        promoterIncentiveValue: { 
            type: Number, 
            default: 0 
        },
        installerIncentiveValue: {
            type: Number,
            default: 0 
        },
        approvedBy: {
            type: String,
            default: ""
        },
        approvedDateTime: { 
            type: Date, 
            default: ""
        },
        promoStatus: {
            type: String,
            enum: [approved, rejected],
            default: "approved"
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
},
{
    versionKey: false
});

let appPromoCode = (module.exports = mongoose.model("appPromoCodes", appPromoCodesSchema));

// Create a financialTransaction
module.exports.createAppPromoCode = function (appPromoCodeRecord, callback) {
    appPromoCodeRecord.save(callback);
};

// Edit a financialTransaction

module.exports.editAppPromoCode = function (id, reqbody, callback) {
    appPromoCode.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getAppPromoCodeInfoById = function (id, callback) {
    appPromoCode.findById(ObjectId(id), callback);
};

// getPromoCodeInfoByUserID

module.exports.getPromoCodeInfoByUserID = function (id, callback) {
    let query = { memberId: id }
    appPromoCode.find(query, callback);
};