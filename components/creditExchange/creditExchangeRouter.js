let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let creditExchange = require("./creditExchangeModel");
let CreditExchangeController = require("./creditExchangeController");

// Create a creditExchange item
router.post("/createCreditExchange", function(req, res) {
  let countryName = req.body.countryName;
  let countryCode = req.body.countryCode;
  let conversionRate = req.body.conversionRate;
  let status = req.body.status;
  let createdDateTime = req.body.createdDateTime;
  let createdBy = req.body.createdBy;
  let updatedBy = req.body.updatedBy;
  let updatedDateTime = req.body.updatedDateTime;

  let newcreditExchange = new creditExchange({
    countryName: countryName,
    countryCode: countryCode,
    conversionRate: conversionRate,
    status: status,
    createdBy: createdBy,
    updatedBy: updatedBy,
    createdDateTime: createdDateTime,
    updatedDateTime: updatedDateTime
  });

  creditExchange.createCreditExchange(newcreditExchange, function(
    err,
    creditExchange
  ) {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: "creditExchange saved successfully" });
    }
  });
});
// End of Create a creditExchange item

// Edit a creditExchange record
router.put("/editCreditExchange/:id", function(req, res) {
  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedDateTime = new Date();

  creditExchange.findByIdAndUpdate(req.params.id, reqbody, function(
    err,
    result
  ) {
    if (err) {
      res.json({
        error: "creditExchange Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "creditExchange Updated Successfully" });
    }
  });
});
// End of Edit a creditExchange record

// Find by creditExchangeId
router.get("/findCreditExchangeId/:creditExchangeId", function(req, res) {
  let id = req.params.creditExchangeId;

  creditExchange.getCreditExchangeById(id, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "creditExchange document Not Exists / Send a valid ID"
      });
    }
  });
});
// End of Find by creditExchangeId

// get list all credit exchange info
router.get("/getAll", function(req, res) {
  creditExchange.find({}, function(err, result) {
    if (err) return next(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({createdDateTime:-1});
});
// End of get list all credit exchange info

//pagiganation
router.get("/getAll/:pageNo/:limit",CreditExchangeController.getAll);


// Delete Credit Exchange
router.delete("/deleteCreditExchangeById/:id", function(req, res, next) {
  let id = req.params.id;

  creditExchange.findByIdAndRemove(id, function(err, post) {
    if (err) {
      res.json({
        error: "creditExchange document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted creditExchange Successfully" });
    }
  });
});
// End of Delete Credit Exchange

module.exports = router;
