let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let financialTransaction = require("./financialTransactionModel");

// Create a Financial Transaction
router.post("/createFinancialTransaction", function (req, res) {
    let memberId = req.body.memberId;
  let scheduleId = req.body.scheduleId;
  let receiverId = req.body.receiverId;
  let financialType = req.body.financialType;
  let financialStatus = req.body.financialStatus;
  let transactionMode = req.body.transactionMode;
  let transactionValue = req.body.transactionValue;
  let transactionAuthCode = req.body.transactionAuthCode;
  let paymentgatewayResponse = req.body.paymentgatewayResponse;
  let created_at = req.body.created_at;

  let financialTransactionRecord = new financialTransaction({
    memberId: memberId,
    scheduleId: scheduleId,
    receiverId: receiverId,
    financialType: financialType,
    financialStatus: financialStatus,
    transactionMode: transactionMode,
    transactionValue: transactionValue,
    transactionAuthCode: transactionAuthCode,
    paymentgatewayResponse: paymentgatewayResponse,
    created_at: created_at
  });

  financialTransaction.createFinancialTransaction(financialTransactionRecord, function (err, user) {

    if (err) {
      res.send(err);
    } else {
      res.json({ message: "financialTransaction saved sucessfully" });
    }
  });
});
// End of create a financial transaction

// Edit a Finiancial Transaction
router.put("/financialTransaction/:id", function (req, res) {
  let financialId = req.body.financialId;
  let memberId = req.body.memberId;
  let financialType = req.body.financialType;
  let financialStatus = req.body.financialStatus;
  let transactionMode = req.body.transactionMode;
  let transactionValue = req.body.transactionValue;
  let transactionAuthCode = req.body.transactionAuthCode;
  let paymentgatewayResponse = req.body.paymentgatewayResponse;
  let updated_at = req.body.updated_at;

  let reqbody = req.body;

  financialTransaction.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "FinancialTransaction Updated Successfully" });
    }
  });
});
// End of Edit a Finiancial Transaction

// Find by Transcation Id
router.get("/findByfinancialTransactionId/:Id", function (req, res) {
  let id = req.params.Id;

  financialTransaction.getfinancialTransactionById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Finance Transaction details Not Exists / Send a valid transaction ID"
      });
    }
  });
});
// End of Find by Transcation Id

// get financial transaction by userId
router.get("/getByUserID/:userID", function (req, res) {
  let id = req.params.userID;
  financialTransaction.getByUserID(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Finance Transaction details Not Exists / Send a valid user ID"
      });
    }
  });
});
// End of get financial transaction by userId

// get list of all finaincial transactions
router.get("/getAll", function (req, res) {

  financialTransaction.find({}, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End of get list of all finaincial transactions

// Delete finaincial transaction
router.delete("/deletefinancialTransactionById/:id", function (req, res, next) {
  let id = req.params.id;

  financialTransaction.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    }else{
    res.json({ message: "Deleted financialTransaction Successfully" });
  }
  });
});
// Delete finaincial transaction

module.exports = router;
