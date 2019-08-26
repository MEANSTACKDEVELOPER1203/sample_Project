let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let paymentTransaction = require("./paymentTransactionModel");
let PaymentTransactionController = require("./paymentTransactionController");
var request = require('request');


router.post("/createPaymentTransaction", function (req, res) {
  let transactionRefId = req.body.transactionRefId; // use in edit
  let refCartId = req.body.refCartId; //not in use
  let packageRefId;
  let isPackage = false;

  if (req.body.packageRefId != undefined && req.body.packageRefId != "") {
    isPackage = true
    packageRefId = req.body.packageRefId
  }
  // console.log("*****************Payment tranaction************************")
  // console.log(req.body);
  // console.log("*****************Payment tranaction************************")
  let memberId = req.body.memberId;
  packageRefId = packageRefId;
  let creditValue = req.body.creditValue;
  let equivalentAmount = req.body.equivalentAmount;
  let paymentType = req.body.paymentType;
  let gatewayResponse = req.body.gatewayResponse;
  let status = req.body.status;
  let creditUpdateStatus = req.body.creditUpdateStatus;
  let createdBy = req.body.createdBy;
  let paymentGateway = req.body.paymentGateway;
  let actualAmount = req.body.actualAmount;
  let gstAmount = req.body.gstAmount;

  let newpaymentTransaction = new paymentTransaction({
    memberId: memberId,
    refCartId: refCartId,
    creditValue: creditValue,
    equivalentAmount: equivalentAmount,
    paymentType: paymentType,
    transactionRefId: transactionRefId,
    gatewayResponse: gatewayResponse,
    status: status,
    creditUpdateStatus: creditUpdateStatus,
    createdBy: createdBy,
    isPackage: isPackage,
    paymentGateway: paymentGateway,
    actualAmount: actualAmount,
    gstAmount: gstAmount
  });
  if (isPackage == true)
    newpaymentTransaction.packageRefId = packageRefId
  paymentTransaction.createPaymentTransaction(newpaymentTransaction, function (err, paymentTransaction) {
    // console.log(err)
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err })
    } else {
      // console.log("Response ======= ", paymentTransaction)
      res.json({ token: req.headers['x-access-token'], success: 1, message: "paymentTransaction saved successfully", data: paymentTransaction });
    }
  });
});
// End Create a paymentTransaction item

// Edit a paymentTransaction start

router.put("/editPaymentTransaction/:id", function (req, res) {
  // console.log("************* editPaymentTransaction ******************************")
  // console.log(req.body)
  // console.log("*************** editPaymentTransaction ****************************")
  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedDateTime = new Date();
  if (reqbody.gatewayResponse == "Credit" || reqbody.gatewayResponse == "TXN_SUCCESS" || reqbody.gatewayResponse == "approved")
    reqbody.status = true
  paymentTransaction.findByIdAndUpdate(ObjectId(req.params.id), reqbody, function (err, result) {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "paymentTransaction Not Exists / Send a valid paymentTransaction ID" });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, message: "paymentTransaction Updated Successfully" });
    }
  });
});
// End Edit a paymentTransaction
// Find by PaymentTransactionId start

router.get("/findPaymentTransactionId/:paymentTransactionId", function (req, res){
  let id = req.params.paymentTransactionId;
  paymentTransaction.getPaymentTransactionById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "PaymentTransaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by PaymentTransactionId

// Find by UserID start

router.get("/getPaymentTransactionByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;

  paymentTransaction.getPaymentTransactionByUserId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error:
          "PaymentTransaction transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by UserID

// getAll Start
router.get("/getAll", function (req, res) {
  paymentTransaction.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({ createdAt: -1 });
});
// End getAll

router.get("/getAll/:pageNo/:limit", PaymentTransactionController.getAll)

// deletePaymentTransactionById start

router.delete("/deletePaymentTransactionById/:id", function (req, res, next) {
  let id = req.params.id;

  paymentTransaction.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "PaymentTransaction document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted paymentTransaction Successfully" });
    }
  });
});
// End deletePaymentTransactionById

/************************* start PAYPAL Intergrationj**********************************/
//send client token for varification
router.get('/generateClientToken', PaymentTransactionController.generateClientToken);
// payment start
router.post('/checkout', PaymentTransactionController.checkout);

//create multi-currency for murchanch account
router.post('/createBraintreeMultiCurrency', PaymentTransactionController.createBraintreeMultiCurrency)

//UI Testing porpose
// router.get('/paypalView', (req, res) => {
//   res.render('paypal')
// });

//desc buy credit by paypal getway
//method POST
//access public
// router.get('/pay', (re, res) => {
//   // create payment json object
//   // let create_payment_json = {
//   //   "intent": "authorize",
//   //   "payer": {
//   //     "payment_method": "paypal"
//   //   },
//   //   "redirect_urls": {
//   //     "return_url": "http://localhost:4300/paymentTransaction/success",
//   //     "cancel_url": "http://localhost:4300/paymentTransaction/err"
//   //   },
//   //   "transactions": [{
//   //     "amount": {
//   //       "total": 40.00,
//   //       "currency": "USD"
//   //     },
//   //     "description": "Credit Recharge"
//   //   }]
//   // }
//   const create_payment_json = {
//     "intent": "sale",
//     "payer": {
//       "payment_method": "paypal"
//     },
//     "redirect_urls": {
//       "return_url": "http://localhost:4300/paymentTransaction/success",
//       "cancel_url": "http://localhost:4300/paymentTransaction/cancel"
//     },
//     "transactions": [{
//       "item_list": {
//         "items": [{
//           "name": "Red Sox Hat",
//           "sku": "001",
//           "price": "25.00",
//           "currency": "INR",
//           "quantity": 1
//         }]
//       },
//       "amount": {
//         "currency": "INR",
//         "total": "25.00"
//       },
//       "description": "Hat for the best team ever"
//     }]
//   };

//   paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//       console.log(error)
//       throw error;
//     } else {
//       console.log("Success message ", payment)
//       for (let i = 0; i < payment.links.length; i++) {
//         if (payment.links[i].rel === 'approval_url') {
//           res.redirect(payment.links[i].href);
//         }
//       }
//     }
//   });

//   // createPay(create_payment_json).then((transaction) => {
//   //   console.log(transaction);
//   //   var id = transaction.id;
//   //   var links = transaction.links;
//   //   var counter = links.length;
//   //   while (counter--) {
//   //     if (links[counter].method == 'REDIRECT') {
//   //       // redirect to paypal where user approves the transaction 
//   //       return res.redirect(links[counter].href)
//   //     }
//   //   }
//   // })
//   //   .catch((err) => {
//   //     console.log(err);
//   //     res.redirect('/paymentTransaction/err');
//   //   });



// })

// success page 
// router.get('/success', (req, res) => {
//   console.log(req.query);
//   res.render('paypalSuccess');
// })

// error page 
// router.get('/err', (req, res) => {
//   console.log(req.query);
//   res.redirect('/err.html');
// })
// helper functions 
// var createPay = (payment) => {
//   return new Promise((resolve, reject) => {
//     paypal.payment.create(payment, function (err, payment) {
//       if (err) {
//         reject(err);
//       }
//       else {
//         resolve(payment);
//       }
//     });
//   });
// }



/************************* end PAYPAL Intergrationj**********************************/

module.exports = router;
