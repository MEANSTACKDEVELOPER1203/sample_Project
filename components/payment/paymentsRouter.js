let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let payments = require("./paymentsModel");
let PaymentTransaction = require("../paymentTransaction/paymentTransactionController");
var Insta = require('instamojo-nodejs');
var request = require('request');
//dev
Insta.setKeys('test_b9cea638b817efe3f5818251640', 'test_fcc8a3b611c9f7277a2443c22e0');
//live
// Insta.setKeys('f540ee8448a9d0a56469938f2b281f4d', '5e2048cf779a9ace89a38d62a8e294ca');
Insta.isSandboxMode(true);
var paytm_config = require('../../paytm/paytm_config').paytm_config;
var paytm_config_web = require('../../paytm/paytm_config').paytm_config_web;
var config = require('../../config/config')

var paytm_checksum = require('../../paytm/checksum');
let checksum = require('../../paytm/lib/checksum');
//const {initPayment, responsePayment} = require("../../paytm/services/index")
var querystring = require('querystring');
const Paytm = require('paytm-sdk')
//const paytm = new Paytm('IENTER06579977505143', options)
const paytm = new Paytm('IENTER06579977505143', {
  generateRoute: '/checksum/generate',
  verifyRoute: '/checksum/verify',
  handleError: false
})

// Create a payments start

router.post("/createPayments", function (req, res) {
  let memberId = req.body.memberId;
  let paymentMode = req.body.paymentMode;
  let paidTo = req.body.paidTo;
  let approvalCode = req.body.approvalCode;
  let reference = req.body.reference;
  let transactionDateTime = req.body.transactionDateTime;
  let payoutPeriodStartDate = req.body.payoutPeriodStartDate;
  let payoutPeriodEndDate = req.body.payoutPeriodEndDate;
  let paymentStatus = req.body.paymentStatus;
  let createdBy = req.body.createdBy;

  let newPayments = new payments({
    memberId: memberId,
    paymentMode: paymentMode,
    paidTo: paidTo,
    approvalCode: approvalCode,
    reference: reference,
    transactionDateTime: transactionDateTime,
    payoutPeriodStartDate: payoutPeriodStartDate,
    payoutPeriodEndDate: payoutPeriodEndDate,
    paymentStatus: paymentStatus,
    createdBy: createdBy
  });
  payments.createPayments(newPayments, function (err, user) {
    if (err) {
      res.send(err);
    } else {
      res.send({
        message: "payments created sucessfully"
      });
    }
  });
});
// End Create a payments

// Edit a payments start

router.put("/edit/:paymentsId", function (req, res) {
  let id = req.params.paymentsId;

  let reqbody = req.body;

  reqbody.updatedAt = new Date();
  reqbody.updatedBy;

  payments.findById(id, function (err, result) {
    if (result) {
      payments.findByIdAndUpdate(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        res.json({
          message: "payments Updated Successfully"
        });
      });
    } else {
      res.json({
        error: "payments not found / Invalid"
      });
    }
  });
});
// End Edit a payments

// get by Id (getpaymentsByID) start

router.get("/getpaymentsById/:paymentsId", function (req, res) {
  let id = req.params.paymentsId;

  payments.findById(id, function (err, result) {
    res.send(result);
  });
});

// End get by Id (getpaymentsByID)

// getBymemberId start

router.get("/getByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;
  payments.getByMemberId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "payments Not Exists / Send a valid memberId"
      });
    }
  });
});

// End getBymemberId
// get all start
router.get("/getAll", function (req, res) {
  payments.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End get all

// Delete by payments start

router.delete("/delete/:paymentsId", function (req, res, next) {
  let id = req.params.paymentsId;

  payments.findById(id, function (err, result) {
    if (result) {
      payments.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({
          message: "Deleted payments successfully"
        });
      });
    } else {
      res.json({
        error: "payments not found / Invalid"
      });
    }
  });
});

// End Delete by payments

// InstaMojo Payment 
router.post("/instamojopayment", function (req, res, next) {
  var data = new Insta.PaymentData();
  data.purpose = req.body.purpose; // REQUIRED
  data.amount = req.body.amount; // REQUIRED
  //  data.redirectUrl = req.body.redirectUrl
  data.setRedirectUrl(req.body.redirectUrl);
  Insta.createPayment(data, function (error, response) {
    if (error) {
      // some error
    } else {
      // Payment redirection link at response.payment_request.longurl
      res.send(response);
    }
  });
});
// End of InstaMojo Payment

// InstaMojo Payment Request Info 
router.post("/instamojopaymentdetails", function (req, res, next) {
  let payment_request_id = req.body.payment_request_id;
  Insta.getPaymentRequestStatus(payment_request_id, function (error, response) {
    if (error) {
      // Some error
    } else {
      res.send(response);
    }
  });
});
// End of InstaMojo Payment


/////////////////////////////// GENERATE CHECKSUMHASH FOR PAYTM PAYMENT REQUEST FOR MOBILE SDK's ///////////////////////////////////

var paramarray = {};

router.post("/generate_checksum", function (req, res) {
  let MID = paytm_config.MID   //"JLOTGY48867147844550";
  let ORDER_ID = req.body.ORDER_ID;
  let CUST_ID = req.body.CUST_ID;
  let TXN_AMOUNT = parseFloat(req.body.TXN_AMOUNT);
  let WEBSITE = req.body.WEBSITE;
  let CALLBACK_URL = req.body.CALLBACK_URL;
  let CHANNEL_ID = req.body.CHANNEL_ID;
  let INDUSTRY_TYPE_ID = req.body.INDUSTRY_TYPE_ID;
  let REQUEST_TYPE = req.body.REQUEST_TYPE;
  let paymentGateway = req.body.paymentGateway;

  // console.log('///// gen checksum ////')
   console.log(req.body)
  // console.log('///// end of gen checksum ////')

  TXN_AMOUNT = TXN_AMOUNT.toFixed(2);

  paramarray['MID'] = MID; //Provided by Paytm
  paramarray['ORDER_ID'] = ORDER_ID; //unique OrderId for every request
  paramarray['CUST_ID'] = CUST_ID; // unique customer identifier 
  paramarray['INDUSTRY_TYPE_ID'] = INDUSTRY_TYPE_ID; //Provided by Paytm
  paramarray['CHANNEL_ID'] = CHANNEL_ID; //Provided by Paytm
  paramarray['TXN_AMOUNT'] = TXN_AMOUNT; // transaction amount
  paramarray['WEBSITE'] = WEBSITE; //Provided by Paytm
  //paramarray['REQUEST_TYPE'] = REQUEST_TYPE; //Provided by Paytm
  //paramarray['EMAIL'] = paytm_config.EMAIL; // customer email id
 // paramarray['MOBILE_NO'] = paytm_config.MOBILE_NUMBER; // customer 10 digit mobile no.
  if (CHANNEL_ID == "WEB") {
    paramarray['CALLBACK_URL'] = config.baseUrl+".celebkonect.com:4300/payments/paywithpaytm?amount=" + TXN_AMOUNT; //Provided by Paytm
    //paramarray['CALLBACK_URL'] = config.baseUrl+":4300/payments/paywithpaytm?amount=" + TXN_AMOUNT; //Provided by Paytm
     paramarray['EMAIL'] = paytm_config.EMAIL; // customer email id
     paramarray['MOBILE_NO'] = paytm_config.MOBILE_NUMBER;
     paramarray['paymentGateway'] = paymentGateway; // customer 10 digit mobile no.

  } else {
    paramarray['CALLBACK_URL'] = CALLBACK_URL; //Provided by Paytm
  }


  //console.log('///// params array ////')
  //console.log(paramarray)
  //console.log('///// end of params array ////')


  paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (err, checksumResponse) {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {
      //console.log("checksum",checksumResponse);
      //console.log("paramarray",paramarray)
      res.json({ token: req.headers['x-access-token'], success: 1, data: checksumResponse });
    }
  });
});


/////////////////////////////// END OF GENERATE CHECKSUMHASH FOR PAYTM PAYMENT REQUEST FOR MOBILE SDK's ///////////////////////////////////

//////////////////// VERIFYT CHECKSUMHASH FROM PAYTM PAYMENT //////////////////////////////////////////////
router.post("/gettxnstatus", function (req, res) {
  let ORDER_ID = req.body.ORDER_ID;
  let MID = req.body.MID;
  let CHECKSUMHASH = req.body.CHECKSUMHASH;

  let jsonUrlEndocdedData = JSON.stringify(req.body);
  let txnurl = paytm_config.TXN_URL;
  request(txnurl + jsonUrlEndocdedData, function (error, response, body) {
    if (error) {
      res.send(error);
    } else {
      res.send(JSON.parse(body));
    }

  });
});
//////////////////// END OF VERIFYT CHECKSUMHASH FROM PAYTM PAYMENT //////////////////////////////////////////////

router.get("/paywithpaytm", (req, res) => {
  payments.initPayment(req.query.amount, paramarray).then(

    success => {

      res.render("paytmRedirect.ejs", {
        resultData: success,
        paytmFinalUrl: paytm_config_web.PAYTM_FINAL_URL
      });
    },
    error => {
      res.send(error);
    }
  );
  //console.log("res",res);
});
router.post("/paywithpaytmresponse", (req, res) => {
  payments.responsePayment(req.body).then(
    success => {
      //console.log("success", success);
      res.render("response.ejs", { resultData: "true", responseData: success });
      //res.send({resultData: "true", responseData: success});
      let data = {
        customerId: paramarray.CUST_ID,
        paymentStatus: success.STATUS,
        orderId: success.ORDERID,
        paymentMode:paramarray.paymentGateway,
        gatewayResponse:success.RESPMSG,
        transactionRefId:success.ORDERID,
        countryCode:success.CURRENCY
      }
      //console.log("data",data);
      request.post(config.baseUrl+'.celebkonect.com:4300/paymentTransaction/generalCheckout_web', {
        json: data
      }, (error, res, body) => {
        if (error) {
          console.error(error)
          return
        }
        //console.log(`statusCode: ${res.statusCode}`)
        //console.log(body)
      })
      //console.log("data", data)

    },
    error => {
      res.send(error);
    }
  );
});
module.exports = router;