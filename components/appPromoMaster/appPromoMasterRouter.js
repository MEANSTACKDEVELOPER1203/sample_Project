let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let appPromoMaster = require("./appPromoMasterModel");

// Create a appPromoMaster
router.post("/createAppPromotionRequest", function(req, res) {
  let memberId = req.body.memberId;
  let reqDateTime = req.body.reqDateTime;
  let promoterIncentiveValue = req.body.promoterIncentiveValue;
  let installerIncentiveValue = req.body.installerIncentiveValue;
  let status = req.body.status;
  let approvedBy = req.body.approvedBy;
  let approvedDateTime = req.body.approvedDateTime;
  let rejectedReason = req.body.rejectedReason;
  let created_at = req.body.created_at;
  let updated_at = req.body.updated_at;

  let appPromoMasterRecord = new appPromoMaster({
    memberId: memberId,
    reqDateTime: reqDateTime,
    promoterIncentiveValue: promoterIncentiveValue,
    installerIncentiveValue: installerIncentiveValue,
    status: status,
    approvedBy: approvedBy,
    approvedDateTime: approvedDateTime,
    rejectedReason: rejectedReason,
    created_at: created_at,
    updated_at: updated_at
  });

  appPromoMaster.createAppPromoMasterRecord(appPromoMasterRecord, function(
    err,
    user
  ) {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: "appPromo request sent successfully" });
    }
  });
});

// Edit a appPromoRequest

router.put("/setAppPromoStatus/:id", function(req, res) {
  let memberId = req.body.memberId;
  let reqDateTime = req.body.reqDateTime;
  let incentiveValue = req.body.incentiveValue;
  let status = req.body.status;
  let approvedBy = req.body.approvedBy;
  let approvedDateTime = req.body.approvedDateTime;
  let rejectedReason = req.body.rejectedReason;
  let createdAt = req.body.createdAt;
  let updatedAt = req.body.updatedAt;

  let reqbody = req.body;
  reqbody.updatedAt = new Date();
  reqbody.approvedDateTime = new Date();

  appPromoMaster.findById(req.params.id, function(err, result) {
    if (result) {
      appPromoMaster.editAppPromoMaster(req.params.id, reqbody, function(
        err,
        result
      ) {
        if (err) {
          res.json({
            error: "User Not Exists / Send a valid UserID"
          });
        } else {
          res.json({ message: "appPromoMaster Updated Successfully" });
        }
      });
    } else {
      res.json({
        error: "No Info found / Send a valid ID"
      });
    }
  });
});

// Find by Id

router.get("/getAppPromoRequestInfoById/:Id", function(req, res) {
  let id = req.params.Id;

  appPromoMaster.getappPromoMasterById(id, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    }
  });
});

// getAll

router.get("/getAll", function(req, res) {
  appPromoMaster.find({}, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});

// getStatus

router.get("/getStatus/:userID", function(req, res) {
  let id = req.params.userID;

  appPromoMaster.findOne({ memberId: id }, function(err, result) {
    if (result) {
      res.json(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});

// delete by id

router.delete("/delete/:id", function(req, res, next) {
  let id = req.params.id;

  appPromoMaster.findByIdAndRemove(id, function(err, post) {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "Deleted appPromoMaster Successfully" });
    }
  });
});

module.exports = router;
