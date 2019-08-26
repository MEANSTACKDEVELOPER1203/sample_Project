let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let skinTone = require("./skinToneModel");

// Create a skinTone item start

router.post("/createSkinTone", function (req, res) {
  //let parentskinToneId = req.body.parentskinToneId;
  let skinToneName = req.body.skinToneName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newSkinTone = new skinTone({
  //parentskinToneId: parentskinToneId,
    skinToneName: skinToneName,
    //access: access,
    createdBy: createdBy
  });

  skinTone.createSkinTone(newSkinTone, function (err, skinTone) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "skinTone saved successfully",
        "manageData": skinTone
      });
    }
  });
});
// End Create a skinTone item

// Edit a skinTone start

router.put("/editskinTone/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  skinTone.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "skinTone Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "skinTone Updated Successfully" });
    }
  });
});
// End Edit a skinTone

// Find by parentskinToneId start

router.get("/findskinToneId/:parentskinToneId", function (req, res) {
  let id = req.params.parentskinToneId;

  skinTone.getByParentskinToneId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "skinTone document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by parentskinToneId

// Find by getParents start

router.get("/getParents", function (req, res) {
  
  let query = { parentskinToneId: null };
  skinTone.find(query, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "skinTone document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by getParents



// getAll start

router.get("/getAll", function (req, res) {

  skinTone.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({skinToneName:1});
});
// End getAll

// deleteskinToneById start
router.delete("/deleteskinToneById/:id", function (req, res, next) {
  let id = req.params.id;

  skinTone.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "skinTone document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted skinTone Successfully" });
    }
  });
});
// End deleteskinToneById

module.exports = router;
