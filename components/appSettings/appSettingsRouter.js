let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let appSettings = require("./appSettingsModel");

// Create an AppSetting
router.post("/create", function(req, res) {
  let memberId = req.body.memberId;
  let nightMode = req.body.nightMode;
  let doNotDisturb = req.body.doNotDisturb;
  let dndDuration = req.body.dndDuration;

  let newAppSetting = new appSettings({
    memberId: memberId,
    nightMode: nightMode,
    dndDuration: dndDuration,
    doNotDisturb: doNotDisturb
  });
  let query = { memberId: memberId };
  appSettings.findOne(query, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send({ message: "already exits.. pls use update API!!" });
    } else {
      appSettings.createAppSetting(newAppSetting, function(err, user) {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "AppSettings saved sucessfully" });
        }
      });
    }
  });
});
// End of Create an AppSetting

// Update an AppSetting record
router.put("/edit/:settingID", function(req, res) {
  let id = req.params.settingID;
  let reqbody = req.body;
  reqbody.updatedAt = new Date();
  appSettings.findById(id, function(err, result) {
    if (result) {
      appSettings.findByIdAndUpdate(id, reqbody, function(err, result) {
        if (err) return res.send(err);
        res.json({ message: "AppSettings Updated Successfully" });
      });
    } else {
      res.json({ error: "AppSettings not found / Invalid" });
    }
  });
});
// End of Update an AppSetting record

// Get By AppSetting ID
router.get("/getByID/:appSettingID", function(req, res) {
  let id = req.params.appSettingID;

  appSettings.findById(id, function(err, result) {
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
// End of Get By AppSetting ID

// Get App Settings by User Id
router.get("/getByUserID/:userID", function(req, res) {
  let id = req.params.userID;
  let query = { memberId: id };
  appSettings.findOne(query, function(err, result) {
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
// End of Get App Settings by User Id

// Get list of all user's App Settings
router.get("/getAll", function(req, res) {
  appSettings.find({}, function(err, result) {
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
// End of Get list of all user's App Settings

// Delete by appSettingID
router.delete("/delete/:appSettingID", function(req, res, next) {
  let id = req.params.appSettingID;

  appSettings.findById(id, function(err, result) {
    if (result) {
      appSettings.findByIdAndRemove(id, function(err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted AppSettings Successfully" });
      });
    } else {
      res.json({ error: "AppSettings not found / Invalid" });
    }
  });
});
// End of Delete by appSettingID

module.exports = router;
