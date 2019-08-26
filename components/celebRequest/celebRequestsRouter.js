let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let CelebRequest = require("./celebRequestsModel");

// Create a CelebRequest
router.post("/create", function(req, res) {
  let memberId = req.body.memberId;
  let status = req.body.status;
  let remarks = req.body.remarks;

  let newRequest = new CelebRequest({
    memberId: memberId,
    status: status,
    remarks: remarks
  });

  CelebRequest.find({ memberId: memberId }, function(err, user) {
    if (err) {
      res.send(err);
    }
    if (user.length > 0) {
      res.send({ error: "Request Pending / Rejected" });
    } else {
      CelebRequest.createCelebRequest(newRequest, function(err, user) {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "Request sent successfully" });
        }
      });
    }
  });
});
// End of Create a CelebRequest

// Update a CelebRequest
router.put("/edit/:reqID", function(req, res) {
  let id = req.params.reqID;
  let memberId = req.body.memberId;
  let status = req.body.status;
  let remarks = req.body.remarks;

  let reqbody = req.body;

  reqbody.updated_at = new Date();

  CelebRequest.findById(id, function(err, result) {
    if (result) {
      CelebRequest.findByIdAndUpdate(id, reqbody, function(err, result) {
        if (err) return res.send(err);
        res.json({ message: "CelebRequest Updated Successfully" });
      });
    } else {
      res.json({ error: "CelebRequest not found / Invalid" });
    }
  });
});
// End of Update a CelebRequest

// Find by Id (getComLogStatus)
router.get("/getComLogStatus/:comLogID", function(req, res) {
  let id = req.params.comLogID;

  CelebRequest.getComLogById(id, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Find by Id (getComLogStatus)

// Get all Celebrity Requests
router.get("/getAll", function(req, res) {
  CelebRequest.find({}, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({createdAt:-1});
});
// End of Get all Celebrity Requests

// Delete by CelebRequest ID
router.delete("/delete/:reqID", function(req, res, next) {
  let id = req.params.ComLogID;
  CelebRequest.findById(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      comLog.findByIdAndRemove(id, function(err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted request Successfully" });
      });
    } else {
      res.json({ error: "Request not found / Invalid" });
    }
  });
});
// Delete by CelebRequest ID

module.exports = router;
