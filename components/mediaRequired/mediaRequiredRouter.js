let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let mediaRequired = require("./mediaRequiredModel");

// Create a mediaRequired item start

router.post("/createMediaRequired", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let mediaRequiredName = req.body.mediaRequiredName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newMediaRequired = new mediaRequired({
    //parentProductionId: parentProductionId,
    mediaRequiredName: mediaRequiredName,
    //access: access,
    createdBy: createdBy
  });

  mediaRequired.createMediaRequired(newMediaRequired, function (err, mediaRequired) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "mediaRequired saved successfully",
        "manageData": mediaRequired
      });
    }
  });
});
// End Create a mediaRequired item

// Edit a mediaRequired start

router.put("/editmediaRequired/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  mediaRequired.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "mediaRequired Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "mediaRequired Updated Successfully" });
    }
  });
});
// End Edit a mediaRequired

// Find by mediaRequiredId start

router.get("/findmediaRequiredId/:mediaRequiredId", function (req, res) {
  let id = req.params.mediaRequiredId;

  mediaRequired.getmediaRequiredById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "mediaRequired document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by mediaRequiredId


// getAll start

router.get("/getAll", function (req, res) {

  mediaRequired.find({},(err, result)=>{
    console.log(result)
    if (result.length) {
      res.json({
        success:1
        ,token:req.headers['x-access-token'],
        data:result
      });
    } else {
      res.json({
        success:0,
        message: "No data found!"
        ,token:req.headers['x-access-token']
      });
    }
  }).sort({mediaRequiredName:1});
});
// End getAll

// deletemediaRequiredById start
router.delete("/deletemediaRequiredById/:id", function (req, res, next) {
  let id = req.params.id;

  mediaRequired.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "mediaRequired document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted mediaRequired Successfully" });
    }
  });
});
// End deletemediaRequiredById

module.exports = router;
