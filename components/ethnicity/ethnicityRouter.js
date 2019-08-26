let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let ethnicity = require("./ethnicityModel");

// Create a ethnicity item start

router.post("/createEthnicity", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let ethnicityName = req.body.ethnicityName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newEthnicity = new ethnicity({
    //parentProductionId: parentProductionId,
    ethnicityName: ethnicityName,
    //access: access,
    createdBy: createdBy
  });

  ethnicity.createEthnicity(newEthnicity, function (err, ethnicity) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "ethnicity saved successfully",
        "manageData": ethnicity
      });
    }
  });
});
// End Create a ethnicity item

// Edit a ethnicity start

router.put("/editethnicity/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  ethnicity.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "ethnicity Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "ethnicity Updated Successfully" });
    }
  });
});
// End Edit a ethnicity

// Find by ethnicityId start

router.get("/findethnicityId/:ethnicityId", function (req, res) {
  let id = req.params.ethnicityId;

  ethnicity.getethnicityById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "ethnicity document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by ethnicityId


// getAll start

router.get("/getAll", function (req, res) {

  ethnicity.find({}, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  }).sort({ethnicityName:1});
});
// End getAll

// deleteethnicityById start
router.delete("/deleteethnicityById/:id", function (req, res, next) {
  let id = req.params.id;

  ethnicity.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "ethnicity document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted ethnicity Successfully" });
    }
  });
});
// End deleteethnicityById

module.exports = router;
