let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let credit;
let debit;
let netBanking;
let active;
let inActive;

let paymentTransactionSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    packageRefId: {
        type: mongoose.Schema.Types.ObjectId
    },
    refCartId: {
        type: mongoose.Schema.Types.ObjectId
    },
    isPackage: {
        type: Boolean,
        default: false
    },
    creditValue: {
        type: Number,
        default: 0.0
    },
    equivalentAmount: {
        type: Number,
        default: 0.0
    },
    actualAmount:{
        type:Number,
        default:0.0,
    },
    gstAmount:{
        type:Number,
        default:0.0,
    },
    paymentGateway:{
        type:String
        //enum:[],
    },
    paymentType: {
        type: String,
        enum: [credit, debit, netBanking]
    },
    transactionRefId: {
        type: String,
        default: ""
    },
    gatewayResponse: {
        type: String,
        enum: [active, inActive]
    },
    status: {
        type: Boolean,
        default: false
    },
    creditUpdateStatus: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: ""
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: String,
        default: ""
    }
}, {
        versionKey: false
    });

let paymentTransaction = (module.exports = mongoose.model("paymentTransaction", paymentTransactionSchema));

module.exports.createPaymentTransaction = function (newpaymentTransaction, callback) {
    newpaymentTransaction.save(callback);
};

// Edit paymentTransactionLog

module.exports.editPaymentTransaction = function (id, reqbody, callback) {
    paymentTransaction.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (paymentTransactionStatus)

module.exports.getPaymentTransactionById = function (id, callback) {
    paymentTransaction.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getPaymentTransactionByUserId = function (id, callback) {
    let query = { memberId: id }
    paymentTransaction.find(query, callback);
};

// Find by userName

module.exports.getPaymentTransactionByUserName = function (username, callback) {
    //console.log(username);
    let query = { username: username };
    paymentTransaction.find(query, callback);
};