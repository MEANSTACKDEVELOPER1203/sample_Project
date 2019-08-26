let express = require('express');
let genderController = require('./genderController');
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let Gender = require("./genderModel");

// Create a gender item start

router.post("/createGender", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let genderName = req.body.genderName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newGender= new Gender({
    //parentProductionId: parentProductionId,
    genderName: genderName,
    //access: access,
    createdBy: createdBy
  });

  Gender.createGender(newGender, function (err, gender) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "Gender saved successfully",
        "gender": gender
      });
    }
  });
});
// End Create a gender item

// Edit a gender start

router.put("/editGender/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  Gender.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "Gender Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "Gender Updated Successfully" });
    }
  });
});
// End Edit a gender

// Find by gender start

router.get("/findGender/:genderId", function (req, res) {
  let id = req.params.genderId;

  Gender.getGenderById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Gender document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by gender


// getAll start

router.get("/getAll", function (req, res) {

Gender.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({genderName:1});
});
// End getAll

// deletegenderstart
router.delete("/deleteGenderById/:id", function (req, res, next) {
  let id = req.params.id;

  Gender.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "Gender document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted Gender Successfully" });
    }
  });
});
// End deletegender

module.exports = router;
