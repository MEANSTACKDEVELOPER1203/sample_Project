let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let appUpdate = require("./appupdateModel");
const NotificationServices = require("../notification/notificationServices");

// Create an Update Info
router.post("/create", function (req, res) {

  let platform = req.body.platform.toLowerCase();
  let info = req.body.info;
  let createdBy = req.body.createdBy;

  let newAppUpdate = new appUpdate({
    platform: platform,
    info: info,
    createdBy: createdBy
  });

  appUpdate.findOne({ platform: platform }, function (err, appObject) {
    if (err) { res.send(err) };
    if (appObject) {
      res.json({
        error: "platform '" + platform + "' already exists. Please use update method!"
      });
    } else {
      appUpdate.createAppUpdate(newAppUpdate, function (err, resultObject) {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "App update info created successfully!" });
        }
      });
    }
  });


});
// End of Create an App Update Info

// Update an auditLog
router.post("/appupdateinfo", function (req, res) {
  let platform = req.body.platform.toLowerCase();
  let currentVersion = req.body.currentVersion;
  appUpdate.findOne({ platform: platform }, (err, platformResult) => {
    if (err)
      return res.json({ err: err });
    else {
      //return res.json({ success: 0, token: req.headers['x-access-token'], message: "platform not found / invalid" });
      if (platformResult) {
        let update = false;
        if (currentVersion < platformResult.info.currentVersion) {
          update = true;
          // token:req.headers['x-access-token'],
          return res.json({ update: update, isForce: platformResult.info.isForce, success: 1 });
        } else {
          // token:req.headers['x-access-token'],
          return res.json({ update: update, isForce: false, success: 1 });
        }
      } else {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "platform not found / invalid" });
      }
    }
  });
});
// End of App Update Infor

// Update an App Update Record
router.put("/edit/:appUpdateId",(req, res)=>{
  let id = req.params.appUpdateId;
  let reqbody = req.body;
  let platform = reqbody.platform.toLowerCase();
  reqbody.updatedAt = new Date();
  appUpdate.findById(id,(err, result)=>{
    if (err) return res.send(err);
    if (result) {
      appUpdate.findByIdAndUpdate(id, reqbody,(err, aResult)=>{
        if(err){
          res.json({ success:0,error: "App Update ID not found"+err });
        }else{
          if(platform != undefined){
            let params = {
              notificationType:"AppUpdate",
              deviceType:platform
            }
            NotificationServices.sendNotificationToAll(params,(err,data)=>{
              if(err){
                res.json({ success:0,error: "App Update ID not found / Invalid error while sending notification"+err });
              }else{
                res.json({ success:1,message: "App Update information updated successfully and send ntotification to all" });
              }
            })
          }else{
            res.json({ success:1,message: "App Update information updated successfully.Not notified to user please provide device type(platform)" });
          }
        }
      });
    } else {
      res.json({ error: "App Update ID not found / Invalid" });
    }
  });
});
// End of Update an App Update Record

// Find by App Update ID
router.get("/getappupdateinfo/:appUpdateId", function (req, res) {
  let id = req.params.appUpdateId;
  let query = { $and: [{ _id: id }] };
  appUpdate.findOne(query, function (err, appUpdateResult) {
    if (err) return res.send(err);
    if (appUpdateResult) {
      res.send(appUpdateResult);
    } else {
      res.json({ error: "App Update info not found / Invalid ID" });
    }
  });
});
// End of Find by App Update ID

// Get All For ADMIN
router.get("/getAllAppUpdateInfoRecords", function (req, res) {
  appUpdate.find({}, function (err, allRecords) {
    if (err) return res.send(err);
    if (allRecords) {
      res.send(allRecords);
    } else {
      res.json({ error: "No data found!" });
    }
  });
});
// End of Get All for ADMIN

// Get List of all Audit Log records
router.get("/getAll", function (req, res) {
  //   auditLog.find({}, function(err, result) {
  //     if (err) return res.send(err);
  //     if (result) {
  //       res.send(result);
  //     } else {
  //       res.json({
  //         error: "No data found!"
  //       });
  //     }
  //   });
});
// End of Get List of all Audit Log records

// Delete by App Update ID
router.delete("/delete/:appUpdateRecord", function (req, res, next) {
  let id = req.params.appUpdateRecord;

  let reqbody = {};
  reqbody.status = false;
  reqbody.updatedAt = new Date();

  appUpdate.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      appUpdate.findByIdAndRemove(id, function (err, aResult) {
        if (err) return res.send(err);
        res.json({ message: "App Update information deleted successfully" });
      });
    } else {
      res.json({ error: "App Update ID not found / Invalid" });
    }
  });
});
// End of Delete by App Update ID

module.exports = router;