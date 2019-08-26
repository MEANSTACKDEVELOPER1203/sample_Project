let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let appInstall = require("./appInstallsModel");

// Create an appInstall Record
router.post("/create", function(req, res) {
  let deviceId = req.body.deviceId;
  let location = req.body.location;
  let promoCode = req.body.promoCode;

  let newappInstallRecord = new appInstall({
    deviceId: deviceId,
    location: location,
    promoCode: promoCode
  });

  appInstall.createAppInstall(newappInstallRecord, function(
    err,
    result
  ) {
    if (err) {
      res.send(err);
    } else {
      res.send({ message: "appInstall record saved sucessfully" });
    }
  });
});
// End of Create an appInstall Record

// Update an appInstall record
router.put("/edit/:appInstallId", function(req, res) {
  let id = req.params.appInstallId;
  let reqbody = req.body;
  reqbody.updatedAt = new Date();

  appInstall.findById(id, function(err, result) {
    if (result) {
        appInstall.editAppInstall(id, reqbody, function(err, result) {
        if (err) return res.send(err);
        res.json({ message: "appInstall document Updated Successfully" });
      });
    } else {
      res.json({ error: "appInstallID not found / Invalid" });
    }
  });
});
// End of Update an appInstall record

// Find by Id (appInstall)
router.get("/getAppInstallInfo/:appInstallId", function(req, res) {
  let id = req.params.appInstallId;

  appInstall.getAppInstallInfoById(id, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Find by Id (appInstall)

// Delete by appInstallId
router.delete("/delete/:appInstallId", function(req, res, next) {
  let id = req.params.appInstallId;

  appInstall.findById(id, function(err, result) {
    if (result) {
        appInstall.findByIdAndRemove(id, function(err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted appInstall document Successfully" });
      });
    } else {
      res.json({ error: "appInstall Info not found / Invalid ID" });
    }
  });
});
// End of Delete by appInstallId

module.exports = router;
