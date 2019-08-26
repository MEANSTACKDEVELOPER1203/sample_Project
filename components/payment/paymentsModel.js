let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let paymentsSchema = new mongoose.Schema({
    memberId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    paymentMode: {
        type: String,
        default: ""
    },
    paidTo:{
        type: String,
        default: ""
    },
    approvalCode: {
        type: String,
        default: ""
    },
    reference: {
        type: String,
        default: ""
    },
    transactionDateTime:   { 
        type: Date, 
        default: Date.now 
    },
    payoutPeriodStartDate: { 
        type: Date, 
        default: ""
    },
    payoutPeriodEndDate: { 
        type: Date,
        default: ""
    },
    paymentStatus: { 
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

let payments = (module.exports = mongoose.model("payments", paymentsSchema));

// Create a payments

module.exports.createPayments = function (newPayments, callback) {
    newPayments.save(callback);
};

// Edit a payments

module.exports.editPayments = function (id, reqbody, callback) {

    payments.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getPaymentsById = function (id, callback) {
    payments.findById(ObjectId(id), callback);
};

// Find by email

module.exports.getPaymentsByEmail = function (email, callback) {
    let query = { email: email };
    payments.find(query, callback);
};
module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    payments.find(query, callback);
  };

