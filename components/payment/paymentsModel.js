let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
//let checksum = require('../lib/checksum');
//let config = require('../../paytm/config');
var paytm_config_web = require('../../paytm/paytm_config').paytm_config_web;
let shortid = require('shortid');
let checksum = require('../../paytm/lib/checksum');
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

module.exports.initPayment = function(amount,paramarray) {
    //console.log("paramarrayModel",paramarray);
    return new Promise((resolve, reject) => {
      let paymentObj = {
        ORDER_ID: paramarray.ORDER_ID,
        CUST_ID: paramarray.CUST_ID,
        INDUSTRY_TYPE_ID: paytm_config_web.INDUSTRY_TYPE_ID,
        CHANNEL_ID: paytm_config_web.CHANNEL_ID,
        TXN_AMOUNT: amount.toString(),
        MID: paytm_config_web.MID,
        WEBSITE: paytm_config_web.WEBSITE,
        CALLBACK_URL: paytm_config_web.CALLBACK_URL
      };
      //console.log("paytmObj",paymentObj)
      checksum.genchecksum(
        paymentObj,
        paytm_config_web.MERCHANT_KEY,
        (err, result) => {
          if (err) {
            return reject('Error while generating checksum');
          } else {
            paymentObj.CHECKSUMHASH = result;
            return resolve(paymentObj);
            //console.log("paymentObj".paymentObj)
          }
        }
      );
    });
  };
  
module.exports.responsePayment = function(paymentObject) {
    return new Promise((resolve, reject) => {
      if (
        checksum.verifychecksum(
          paymentObject,
          paytm_config_web.MERCHANT_KEY,
          paymentObject.CHECKSUMHASH
        )
      ) {
        resolve(paymentObject);
      } else {
        return reject('Error while verifying checksum');
      }
    });
  };
