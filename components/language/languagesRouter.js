let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let languages = require("./languagesModel");

// Create a languages item start

router.post("/createLanguages", function (req, res) {
  //let parentlanguagesId = req.body.parentlanguagesId;
  let languagesName = req.body.languagesName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newlanguages = new languages({
  //parentlanguagesId: parentlanguagesId,
    languagesName: languagesName,
    //access: access,
    createdBy: createdBy
  });

  languages.createlanguages(newlanguages, function (err, languages) {

    if (err) {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    } else {
      res.json({token:req.headers['x-access-token'],success:1,message: "languages saved successfully",data:languages});
    }
  });
});
// End Create a languages item

// Edit a languages start

router.put("/editlanguages/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  languages.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "languages Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "languages Updated Successfully" });
    }
  });
});
// End Edit a languages

// Find by parentlanguagesId start

router.get("/findlanguagesId/:parentlanguagesId", function (req, res) {
  let id = req.params.parentlanguagesId;

  languages.getByParentlanguagesId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "languages document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by parentlanguagesId

// Find by getParents start

router.get("/getParents", function (req, res) {
  
  let query = { parentlanguagesId: null };
  languages.find(query, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "languages document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by getParents



// getAll start

router.get("/getAll", function (req, res) {

  languages.find({}, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  }).sort({languagesName:1});
});
// End getAll

// deletelanguagesById start
router.delete("/deletelanguagesById/:id", function (req, res, next) {
  let id = req.params.id;

  languages.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "languages document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted languages Successfully" });
    }
  });
});
// End deletelanguagesById

module.exports = router;
