let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let productionType = require("./productionTypeModel");

// Create a productionType item start

router.post("/createProductionType", function (req, res) {
  let parentProductionId = req.body.parentProductionId;
  let productionName = req.body.productionName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newProductionType = new productionType({
    parentProductionId: parentProductionId,
    productionName: productionName,
    //access: access,
    createdBy: createdBy
  });

  productionType.createProductionType(newProductionType, function (err, productionType) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "productionType saved successfully",
        "manageData": productionType
      });
    }
  });
});
// End Create a productionType item

// Edit a productionType start

router.put("/editProductionType/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  productionType.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "productionType Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "productionType Updated Successfully" });
    }
  });
});
// End Edit a productionType

// Find by parentProductionId start

router.get("/findProductionTypeId/:parentProductionId", function (req, res) {
  let id = req.params.parentProductionId;

  productionType.getByParentProductionId(id, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"productionType document Not Exists / Send a valid ID"});
    }
  });
});
// End Find by parentProductionId

// Find by getParents start

router.get("/getParents", function (req, res) {
  
  let query = { parentProductionId: null };
  productionType.find(query, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"productionType document Not Exists / Send a valid ID"});
    }
  });
});
// End Find by getParents



// getAll start

router.get("/getAll", function (req, res) {

  productionType.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({productionName:1});
});
// End getAll

// deleteproductionTypeById start
router.delete("/deleteProductionTypeById/:id", function (req, res, next) {
  let id = req.params.id;

  productionType.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "productionType document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted productionType Successfully" });
    }
  });
});
// End deleteproductionTypeById

module.exports = router;
