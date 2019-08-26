let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let success;
let fail;
let dropped;
let credit;
let debit;
let banking;
let paymentGateway;
let wallet;
let credits;

let financialTransactionSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    financialType: {
        type: String,
        enum: [paymentGateway, wallet, credits],
        required:true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    financialStatus: {
        type: String,
        enum: [success, fail, dropped],
        default: ""
    },
    transactionMode: {
        type: String,
        enum: [credit, debit, banking],
        default: ""
    },
    transactionValue:{
        type: Number,
        default: 0
    },
    transactionAuthCode:{
        type: String,
        default:""
    },
    transactionRefNumber:{
        type: String,
        default:""
    },
    paymentgatewayResponse:{
     type: String,
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

let financialTransaction = (module.exports = mongoose.model("financialTransaction", financialTransactionSchema));

// Create a financialTransaction
module.exports.createFinancialTransaction = function (financialTransactionRecord, callback) {
    financialTransactionRecord.save(callback);
  };
  
  // Edit a financialTransaction
  
  module.exports.editFinancialTransaction = function (id, reqbody, callback) {
    financialTransaction.findByIdAndUpdate(id, { $set: reqbody },callback);
  };
  
  // Find by Id
  
  module.exports.getfinancialTransactionById = function (id, callback) {
    financialTransaction.findById(ObjectId(id), callback);
  };

   // Find by UserIDs
  
   module.exports.getByUserID = function (id, callback) {
    let query = {memberId : id}
    financialTransaction.find(query, callback);
  };
  
