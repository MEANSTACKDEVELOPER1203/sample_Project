let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let charitySettings = require("./charitySettingsModel");
let User = require("../users/userModel");

// Create charitySettings for a user
router.post("/create", function(req, res) {
  let memberId = req.body.memberId;
  let charityName = req.body.charityName;
  let charityTrustDesc = req.body.charityTrustDesc;
  let address = req.body.address;
  let charityRegistrationID = req.body.charityRegistrationID;
  let certificateURL = req.body.certificateURL;
  let bankName = req.body.bankName;
  let beneficiaryName = req.body.beneficiaryName;
  let accountNo = req.body.accountNo;
  let routingNo = req.body.routingNo;
  let branchName = req.body.branchName;
  let swiftOrIfscCode = req.body.swiftOrIfscCode;
  let payoutSettings = req.body.payoutSettings;
  let settingsId = new ObjectId();

  payoutSettings.settingsId;

  let charitySettingsRecord = new charitySettings({
    memberId: memberId,
    charityName: charityName,
    charityTrustDesc: charityTrustDesc,
    address: address,
    charityRegistrationID: charityRegistrationID,
    certificateURL: certificateURL,
    bankName: bankName,
    beneficiaryName: beneficiaryName,
    accountNo: accountNo,
    routingNo: routingNo,
    branchName: branchName,
    swiftOrIfscCode: swiftOrIfscCode,
    payoutSettings: payoutSettings
  });

  charitySettings.createCharitySetting(charitySettingsRecord, function(
    err,
    charityObj
  ) {
    if (err) {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    } else {
      res.json({token:req.headers['x-access-token'],success:1,message: "Changes saved successfully",data:charityObj});
    }
  });
});
// End of Create charitySettings for a user

// Update charity setting for a user
router.put("/edit/:charityID/:memberID", function(req, res) {
  id = req.params.charityID;
  memberId = req.params.memberID;

  let payoutSettings = {};
  payoutSettings.id = new ObjectId();
  payoutSettings.memberId = memberId;
  payoutSettings.video = req.body.video;
  payoutSettings.chat = req.body.chat;
  payoutSettings.ecommerce = req.body.ecommerce;

  charitySettings.findById(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      charitySettings.find(
        { $and: [{ _id: id }, { "payoutSettings.memberId": memberId }] },
        function(err, newresult) {
          if (err) return res.send(err);
          if (newresult.length > 0) {
            charitySettings.findOneAndUpdate(
              { $and: [{ _id: id }, { "payoutSettings.memberId": memberId }] },
              {
                $set: {
                  "payoutSettings.$.audio": req.body.audio,
                  "payoutSettings.$.video": req.body.video,
                  "payoutSettings.$.chat": req.body.chat,
                  "payoutSettings.$.ecommerce": req.body.ecommerce
                }
              },
              { upsert: true },
              function(err, updatedresult) {
                if (err) {
                  res.json({token:req.headers['x-access-token'],success:0,message:err});
                } else {
                  res.json({token:req.headers['x-access-token'],success:1,message: "payout settings updated successfully"});
                  //////////// update charity ID to user object ////////////////
                    let newBody = {};
                    newBody.updated_at = new Date();
                    newBody.charityRefId = id;
                    User.findByIdAndUpdate(memberId, newBody, function(err, uResult) {});
                  /////////// End of update charity ID to user object ///////////
                }
              }
            );
          } else if (newresult.length == 0) {
            charitySettings.updateOne(
              { _id: id },
              { $push: { payoutSettings: payoutSettings } },
              function(err, updateResult) {
                if (err) return res.send(err);
                if (updateResult.nModified == 1) {
                  res.json({token:req.headers['x-access-token'],success:1,message: "Charity Settings Updated Successfully."});

                  //////////// update charity ID to user object ////////////////
                      let newBody = {};
                      newBody.updated_at = new Date();
                      newBody.charityRefId = id;
                      User.findByIdAndUpdate(memberId, newBody, function(err, uResult) {});
                  /////////// End of update charity ID to user object ///////////
              } else {
                res.json({token:req.headers['x-access-token'],success:0,message: "Operation Failed!"});
                }
              }
            );
          }
        }
      );
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message: "No data found!"});
    }
  });
});
// End of Update charity setting for a user

//update payoutSettings for member
router.put("/payoutSettings/:id", function(req, res) {
  let reqbody = req.body;
  let id = req.params.id;

  charitySettings.findOneAndUpdate(
    { "payoutSettings._id": id },
    {
      $set: {
        "payoutSettings.$.settingsId": req.body.settingsId,
        "payoutSettings.$.memberId": req.body.memberId,
        "payoutSettings.$.video": req.body.video,
        "payoutSettings.$.audio": req.body.audio,
        "payoutSettings.$.chat": req.body.chat,
        "payoutSettings.$.ecommerce": req.body.ecommerce
      }
    },
    { upsert: true },
    function(err, newresult) {
      if (err) {
        res.json({ error: "InvalidID" });
      } else {
        res.json({ message: "payoutSettings updated successfully" });
      }
    }
  );
});
// End of update payoutSettings for member

// Find by charity settings Id
router.get("/findBycharitySettingsId/:Id", function(req, res) {
  let id = req.params.Id;

  charitySettings.getCharitySettingsById(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "charitySettings Not Exists / Send a valid ID"
      });
    }
  });
});
// End of Find by charity settings Id

// Get Charities created by a user
router.get("/getByMemberId/:memberId", function(req, res) {
  let id = req.params.memberId;
  charitySettings.getByMemberId(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "charitySettings Not Exists / Send a valid memberId"
      });
    }
  });
});
// End of Get Charities created by a user

// get List of charity settings
router.get("/getAll", function(req, res) {
  charitySettings.find({}, function(err, result) {
    if (err) return res.json({token:req.headers['x-access-token'],success:0,message:err});
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  });
});
// End of get List of charity settings

router.get("/getAll/:pageNo/:limit", (req, res)=> {
    let params = req.params
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);
    charitySettings.count({ },(err, count)=>{
        if (err){
          return res.json({token:req.headers['x-access-token'],success:0,message:err});
        }
        else{
          charitySettings.find({ },(err, result)=>{
                if (err){
                    return res.json({token:req.headers['x-access-token'],success:0,message:err});
                }
                else{
                    let data = {};
                    data.result = result
                    let total_pages = count/limit
                    let div = count%limit;
                    data.pagination ={
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    res.json({token:req.headers['x-access-token'],success:1,data:data});
                }
            }).skip(startFrom).limit(limit).sort({createdAt: -1});
        }
    })
});

// Delete charity settings
router.delete("/deleteCharitySettingsById/:id", function(req, res, next) {
  let id = req.params.id;

  charitySettings.findByIdAndRemove(id, function(err, post) {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "Deleted charitySettings Successfully" });
    }
  });
});
// End of Delete charity settings

// Update Charity Information
router.put("/updatecharityinfo/:charityID", function(req, res) {
  charityId = req.params.charityID;
  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  req.checkBody("updatedBy", "updatedBy is required").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.send({
      errors: errors
    });
  } else {
    charitySettings.editCharitySettings(charityId, reqbody, function(err, result) {
      if (err || (result == null)) {
        res.json({
          error: "Charity Not Exists / Send a valid CharityId"
        });
      } else {
        //console.log(result)
        res.json({ message: "Charity information updated successfully" });
      }
    });
  }
  
});
// End of Update charity setting for a user
module.exports = router;
