let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let notificationSetting = require("./notificationSettingsModel");

// setMemberPreferences for a User

router.post("/setNotificationSettings", function (req, res) {
  let memberId = ObjectId(req.body.memberId);
  let notificationSettingId = req.body.notificationSettingId;
  let isEnabled = req.body.isEnabled;

  let reqbody = req.body;
  reqbody.updatedAt = new Date;

  let newRecord = new notificationSetting({
    memberId: memberId,
    notificationSettingId: notificationSettingId,
    isEnabled: isEnabled
  });

  //"notificationSettingId":"5b5eb5939bde9e21d8faeb72",
  // console.log(req.body);
  let query = { $and: [{ memberId: memberId },{notificationSettingId: notificationSettingId}] };
  //let query = { memberId: memberId, notificationSettingId: notificationSettingId};
  
  notificationSetting.find(query, function (err, result) {
    if (err) return res.json({token:req.headers['x-access-token'],success:0,message:err});
    else if (result.length > 0) {
      //console.log(result);
      //console.log(result[0].memberId);
      nId = result[0].memberId;
      let query = { $and: [{ memberId: nId },{notificationSettingId: notificationSettingId}] };
      notificationSetting.updateOne(query, reqbody, {new:true}, function (err, ns) {
        if (err) return res.send(err);
        res.json({token:req.headers['x-access-token'],success:1,message: "Changes saved successfully"});
      });
    }
    else if (result.length <= 0) {
      notificationSetting.createNewRecord(newRecord, function (err, user) {
        if (err) {
          res.json({token:req.headers['x-access-token'],success:0,message:err});
        } else {
          res.json({token:req.headers['x-access-token'],success:1,message: "Changes saved successfully"});
        }
      })
    }
  });




});
// End of setMemberPreferences for a User

// getByID (SettingID)
router.get("/getByID/:settingID", function (req, res) {
  let id = req.params.settingID;

  notificationSetting.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No Data / Invalid ID"
      });
    }
  });
});
// End of getByID (SettingID)

// Get by UserID
router.get("/getByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;
  let query = { memberId: id };
  notificationSetting.find(query, function (err, result) {
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
// End of Get by UserID

// get list of notification settings fro all users
router.get("/getAll", function (req, res) {
  notificationSetting.find({}, function (err, result) {
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
// End of get list of notification settings fro all users

// Delete by notificationSettingID

router.delete("/delete/:settingID", function (req, res, next) {
  let id = req.params.settingID;

  notificationSetting.findById(id, function (err, result) {
    if (result) {
      notificationSetting.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted notificationSettings Successfully" });
      });
    } else {
      res.json({ error: "notificationSettingID not found / Invalid" });
    }
  });
});

module.exports = router;
