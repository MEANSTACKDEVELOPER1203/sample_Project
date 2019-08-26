let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let auditionCommunication = require("./auditionCommunicationModel");

// Create a auditionCommunication item start

router.post("/createAuditionCommunication", function (req, res) {
  let memberId = req.body.memberId;
  let auditionProfileId = req.body.auditionProfileId;
  let receiverId = req.body.receiverId;
  let message = req.body.message;
  let status = req.body.status;
  let createdBy = req.body.createdBy;

  let newAuditionCommunication = new auditionCommunication({
    memberId: memberId,
    auditionProfileId: auditionProfileId,
    receiverId: receiverId,
    message: message,
    status: status,
    createdBy: createdBy
  });

  auditionCommunication.createAuditionCommunication(newAuditionCommunication, function (err, auditionCommunication) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "auditionCommunication saved successfully",
        "auditionCommunicationData": auditionCommunication
      });
    }
  });
});
// End Create a auditionCommunication item

// Edit a auditionCommunication start

router.put("/editAuditionCommunication/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  auditionCommunication.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "auditionCommunication Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "auditionCommunication Updated Successfully" });
    }
  });
});
// End Edit a auditionCommunication

// Find by auditionCommunicationId start

router.get("/findAuditionCommunicationId/:auditionCommunicationId", function (req, res) {
  let id = req.params.auditionCommunicationId;

  auditionCommunication.getAuditionCommunicationById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "auditionCommunication document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by auditionCommunicationId
// Find by getauditionCommunicationByMemberId start

router.get("/getAuditionCommunicationByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;

  auditionCommunication.getAuditionCommunicationByUserId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "auditionCommunication transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by getauditionCommunicationByMemberId


// getAll start

router.get("/getAll", function (req, res) {

  auditionCommunication.find({}, function (err, result) {
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

// deleteauditionCommunicationById start
router.delete("/deleteauditionCommunicationById/:id", function (req, res, next) {
  let id = req.params.id;

  auditionCommunication.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "auditionCommunication document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted auditionCommunication Successfully" });
    }
  });
});
// End deleteauditionCommunicationById

module.exports = router;
