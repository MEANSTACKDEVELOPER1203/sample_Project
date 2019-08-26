let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let User = require("../users/userModel");
let feedMarketing = require("./feedMarketingModel");
let Feed = require("../../models/feeddata");

// Set Feed Marketing for a User
router.post("/setFeedMarketing", function(req, res) {
  let feedId                       = ObjectId(req.body.feedId);
  let campaignType                 = req.body.campaignType;
  let proposedBudget               = req.body.proposedBudget;
  let proposedReach                = req.body.proposedReach;
  let actualBudget                 = req.body.actualBudget;
  let actualReach                  = req.body.actualReach;
  let transactionStatus            = req.body.transactionStatus;
  let transactionApproved          = req.body.transactionApproved;
  let approvedBy                   = req.body.approvedBy;

  let reqbody = req.body;

  let newRecord = new feedMarketing({
    feedId: feedId,
    proposedBudget: proposedBudget,
    proposedReach: proposedReach,
    actualBudget: actualBudget,
    actualReach: actualReach,
    transactionStatus: transactionStatus,
    transactionApproved: transactionApproved,
    approvedBy: approvedBy,
    transactionReferenceDetails: transactionReferenceDetails,
    status: status
  });

  Feed.findById(feedId, function(err, result) {
    if (result) {
      feedMarketing.findOne({ feedId: feedId }, function(err, newresult) {
        if (newresult) {
           let id = newresult._id;
          feedMarketing.updateFeedMarketing(id, reqbody, function(err, user) {
            if (err) {
              res.send(err);
            }
            res.send({ message: "feedMarketing details Updated Successfully" });
          });
        } else {
          feedMarketing.createNewRecord(newRecord, function(err, user) {
            if (err) {
              res.send(err);
            } else {
              res.send({ message: "Feed Marketing Details Saved Successfully" });
            }
          });
        }
      });
    } else {
      res.json({
        error: "Feed Not Exists / Send a valid FeedID"
      });
    }
  });
});
// End of Set Feed Marketing for a User

// Update feedMarketing Details
router.put("/setFeedmarketingDetails", function(req, res) {
  let feedId = ObjectId(req.body.feedId);

  feedMarketing.findOne({ feedId: feedId }, function(err, newresult) {
        if (err) res.send(err); 
        if (newresult) {
          let id = newresult._id;
          feedMarketing.updateTranRefDetails(id, transactionReferenceDetails, function(err, user) {
            if (err) { res.send(err); }
            res.send({ message: "FeedMarketing details Updated Successfully" });
          });
        } else {
          res.send({ message: "FeedMarketing Details not found / do not exist!!" });
        }
      });
  
});
// End of Update feedMarketing Details


module.exports = router;
