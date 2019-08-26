let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let activityTransaction = require("./activityTransactionModel");

// Creae Activity Transaction
router.post("/createActivityTransaction", function(req, res) {
  let memberId = req.body.memberId;
  let oldValues = req.body.oldValues;
  let newValues = req.body.newValues;
  let activityName = req.body.activityName;
  let activityStatus = req.body.activityStatus;
  let created_at = req.body.created_at;
  let updated_at = req.body.updated_at;

  let activityTransactionRecord = new activityTransaction({
    memberId: memberId,
    oldValues: oldValues,
    newValues: newValues,
    activityName: activityName,
    activityStatus: activityStatus,
    created_at: created_at,
    updated_at: updated_at
  });

  activityTransaction.createActivityTransaction(
    activityTransactionRecord,
    function(err, user) {
      if (err) {
        res.send(err);
      } else {
        res.json({ message: "activityTransaction saved successfully" });
      }
    }
  );
});
// End create Activity Transcation

// Edit an activityTransaction
router.put("/activityTransaction/:id", function(req, res) {
  let memberId = req.body.memberId;
  let oldValues = req.body.oldValues;
  let newValues = req.body.newValues;
  let activityName = req.body.activityName;
  let activityStatus = req.body.activityStatus;
  let updated_at = req.body.updated_at;

  let reqbody = req.body;

  activityTransaction.findByIdAndUpdate(req.params.id, reqbody, function(
    err,
    result
  ) {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "activityTransaction Updated Successfully" });
    }
  });
});
// End of Edit Activity Transaction

// Find by Transaction ID
router.get("/findByActivityTransactionId/:Id", function(req, res) {
  let id = req.params.Id;
  activityTransaction.getActivityTransactionById(id, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Activity transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End of Find by Transaction ID

// Find by UserID
router.get("/getByUserID/:UserID", function(req, res) {
  let id = req.params.UserID;

  activityTransaction.getActivityTransactionByUserId(id, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Activity transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End of Find by UserID

// Get All Activity Transactions
router.get("/getAll", function(req, res) {
  activityTransaction.find({}, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End of Get All Activity Transactions

// Delete Activity Transactions
router.delete("/deleteActivityTransactionById/:id", function(req, res, next) {
  let id = req.params.id;

  activityTransaction.findByIdAndRemove(id, function(err, post) {
    if (err) {
      res.json({
        error: "Activity transaction document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted activityTransaction Successfully" });
    }
  });
});
// End of Delete Activity Transcations

module.exports = router;
