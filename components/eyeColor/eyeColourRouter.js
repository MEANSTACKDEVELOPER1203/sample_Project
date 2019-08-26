let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let eyeColour = require("./eyeColourModel");

// Create a eyeColour item start

router.post("/createEyeColour", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let eyeColourName = req.body.eyeColourName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newEyeColour = new eyeColour({
    //parentProductionId: parentProductionId,
    eyeColourName: eyeColourName,
    //access: access,
    createdBy: createdBy
  });

  eyeColour.createEyeColour(newEyeColour, function (err, eyeColour) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "eyeColour saved successfully",
        "manageData": eyeColour
      });
    }
  });
});
// End Create a eyeColour item

// Edit a eyeColour start

router.put("/editeyeColour/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  eyeColour.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "eyeColour Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "eyeColour Updated Successfully" });
    }
  });
});
// End Edit a eyeColour

// Find by eyeColourId start

router.get("/findeyeColourId/:eyeColourId", function (req, res) {
  let id = req.params.eyeColourId;

  eyeColour.geteyeColourById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "eyeColour document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by eyeColourId


// getAll start

router.get("/getAll", function (req, res) {

  eyeColour.find({}, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  }).sort({eyeColourName:1});
});
// End getAll

// deleteeyeColourById start
router.delete("/deleteeyeColourById/:id", function (req, res, next) {
  let id = req.params.id;

  eyeColour.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "eyeColour document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted eyeColour Successfully" });
    }
  });
});
// End deleteeyeColourById

module.exports = router;
