let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let debit;
let credit;
let promotion;
let active;
let inactive;
let payout;
let referral;

let creditsSchema = new mongoose.Schema({
    creditRefCartId: {
        type: mongoose.Schema.Types.ObjectId
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    paymentTranRefId: {
        type: mongoose.Schema.Types.ObjectId
    },
    creditType: {
        type: String,
        enum: [debit, credit, promotion, payout, referral],
        default: ""
    },
    creditValue: {
        type: Number,
        default: 0
    },
    cumulativeCreditValue: {
        type: Number,
        default: 0
    },
    referralCreditValue: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String,
        default: ""
    },
    couponCode: {
        type: String,
        default: ""
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
},{
    versionKey: false
});

let Credits = (module.exports = mongoose.model("credits", creditsSchema));

// Insert credits
module.exports.createCredits = function (newCredits, callback) {
    newCredits.save(callback);
};

// Edit credits

module.exports.editCredits = function (id, reqbody, callback) {
    Credits.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = { memberId: id };
    Credits.find(query, callback);
};

