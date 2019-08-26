let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let hairColor = require("./hairColorModel");

// Create a hairColor item start

router.post("/createHairColor", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let hairColorName = req.body.hairColorName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newHairColor = new hairColor({
    //parentProductionId: parentProductionId,
    hairColorName: hairColorName,
    //access: access,
    createdBy: createdBy
  });

  hairColor.createHairColor(newHairColor, function (err, hairColor) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "hairColor saved successfully",
        "manageData": hairColor
      });
    }
  });
});
// End Create a hairColor item

// Edit a hairColor start

router.put("/edithairColor/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  hairColor.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "hairColor Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "hairColor Updated Successfully" });
    }
  });
});
// End Edit a hairColor

// Find by hairColorId start

router.get("/findhairColorId/:hairColorId", function (req, res) {
  let id = req.params.hairColorId;

  hairColor.gethairColorById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "hairColor document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by hairColorId


// getAll start

router.get("/getAll", function (req, res) {

  hairColor.find({}, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  }).sort({hairColorName:1});
});
// End getAll

// deletehairColorById start
router.delete("/deletehairColorById/:id", function (req, res, next) {
  let id = req.params.id;

  hairColor.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "hairColor document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted hairColor Successfully" });
    }
  });
});
// End deletehairColorById

module.exports = router;
