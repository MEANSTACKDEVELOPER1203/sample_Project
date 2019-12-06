// let express = require("express");
// let router = express.Router();
// let ObjectId = require("mongodb").ObjectID;
// let configSettings = require("./configsettingsModel");

// // Create a configSettings item
// router.post("/createConfigSettings", function(req, res) {
//   let defaultPassword = req.body.defaultPassword;
//   let createdDateTime = req.body.createdDateTime;
//   let createdBy = req.body.createdBy;
//   let updatedBy = req.body.updatedBy;
//   let updatedDateTime = req.body.updatedDateTime;

//   let newConfigSettings = new configSettings({
//     defaultPassword: defaultPassword,
//     createdBy: createdBy,
//     updatedBy: updatedBy,
//     createdDateTime: createdDateTime,
//     updatedDateTime: updatedDateTime
//   });

//   configSettings.createConfigSettings(newConfigSettings, function(
//     err,
//     configSettings
//   ) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.json({ message: "configSettings saved successfully" });
//     }
//   });
// });
// // End of Create a configSettings item

// // Update a configSettings record
// router.put("/update/:id", function(req, res) {
//   let reqbody = req.body;
//   reqbody.updatedBy = req.body.updatedBy;
//   reqbody.updatedDateTime = new Date();

//   configSettings.findByIdAndUpdate(req.params.id, reqbody, function(
//     err,
//     result
//   ) {
//     if (err) {
//       res.json({
//         error: "configSettings Not Exists / Send a valid UserID"
//       });
//     } else {
//       res.json({ message: "configSettings Updated Successfully" });
//     }
//   });
// });
// // End of Update a configSettings record

// // Find by configSettingsId
// router.get("/findConfigSettingsId/:configSettingsId", function(req, res) {
//   let id = req.params.configSettingsId;

//   configSettings.findById(id, function(err, result) {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "configSettings document Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
// // End of Find by configSettingsId

// // get list all credit exchange info
// router.get("/getAll", function(req, res) {
//   configSettings.find({}, function(err, result) {
//     if (err) return next(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   }).sort({createdDateTime:-1});
// });
// // End of get list all credit exchange info

// // Delete Credit Exchange
// router.delete("/deleteConfigSettingsById/:id", function(req, res, next) {
//   let id = req.params.id;

//   configSettings.findByIdAndRemove(id, function(err, post) {
//     if (err) {
//       res.json({
//         error: "configSettings document Not Exists / Send a valid ID"
//       });
//     } else {
//       res.json({ message: "Deleted configSettings Successfully" });
//     }
//   });
// });
// // End of Delete Credit Exchange

// module.exports = router;
