let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let bodyType = require("./bodyTypeModel");

// Create a bodyType item start

router.post("/createBodyType", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let bodyTypeName = req.body.bodyTypeName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newBodyType = new bodyType({
    //parentProductionId: parentProductionId,
    bodyTypeName: bodyTypeName,
    //access: access,
    createdBy: createdBy
  });

  bodyType.createBodyType(newBodyType, function (err, bodyType) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "bodyType saved successfully",
        "manageData": bodyType
      });
    }
  });
});
// End Create a bodyType item

// Edit a bodyType start

router.put("/editbodyType/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  bodyType.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "bodyType Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "bodyType Updated Successfully" });
    }
  });
});
// End Edit a bodyType

// Find by bodyTypeId start

router.get("/findbodyTypeId/:bodyTypeId", function (req, res) {
  let id = req.params.bodyTypeId;

  bodyType.getbodyTypeById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "bodyType document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by bodyTypeId


// getAll start

router.get("/getAll", function (req, res) {

  bodyType.find({}, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  }).sort({bodyTypeName:1});
});
// End getAll

// deletebodyTypeById start
router.delete("/deletebodyTypeById/:id", function (req, res, next) {
  let id = req.params.id;

  bodyType.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "bodyType document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted bodyType Successfully" });
    }
  });
});
// End deletebodyTypeById

module.exports = router;
