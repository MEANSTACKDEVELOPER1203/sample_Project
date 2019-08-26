let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let auditionSubscription = require("./auditionSubscriptionModel");

// Create a auditionSubscription item start

router.post("/createAuditionSubscription", function (req, res) {
  let memberId = req.body.memberId;
  let auditionProfileId = req.body.auditionProfileId;
  let subPackageId = req.body.subPackageId;
  let isRecurring = req.body.isRecurring;
  let subValue = req.body.subValue;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;
  let billCycle  = req.body.billCycle;
  let subStatus = req.body.subStatus;
  let createdBy = req.body.createdBy;

  let newAuditionSubscription = new auditionSubscription({
    memberId: memberId,
    auditionProfileId: auditionProfileId,
    subPackageId: subPackageId,
    isRecurring: isRecurring,
    subValue: subValue,
    startDate:startDate,
    endDate:endDate,
    billCycle:billCycle,
    subStatus:subStatus,
    createdBy: createdBy
  });

  auditionSubscription.createAuditionSubscription(newAuditionSubscription, function (err, auditionSubscription) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "auditionSubscription saved successfully",
        "auditionSubscriptionData": auditionSubscription
      });
    }
  });
});
// End Create a auditionSubscription item

// Edit a auditionSubscription start

router.put("/editAuditionSubscription/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  auditionSubscription.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "auditionSubscription Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "auditionSubscription Updated Successfully" });
    }
  });
});
// End Edit a auditionSubscription

// Find by auditionSubscriptionId start

router.get("/findAuditionSubscriptionId/:auditionSubscriptionId", function (req, res) {
  let id = req.params.auditionSubscriptionId;

  auditionSubscription.getAuditionSubscriptionById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "auditionSubscription document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by auditionSubscriptionId
// Find by getauditionSubscriptionByMemberId start

router.get("/getAuditionSubscriptionByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;

  auditionSubscription.getAuditionSubscriptionByUserId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "auditionSubscription transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by getauditionSubscriptionByMemberId


// getAll start

router.get("/getAll", function (req, res) {

  auditionSubscription.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End getAll

// deleteauditionSubscriptionById start
router.delete("/deleteAuditionSubscriptionById/:id", function (req, res, next) {
  let id = req.params.id;

  auditionSubscription.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "auditionSubscription document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted auditionSubscription Successfully" });
    }
  });
});
// End deleteauditionSubscriptionById

module.exports = router;
