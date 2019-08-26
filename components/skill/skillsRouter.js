let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let skills = require("./skillsModel");

// Create a skills item start

router.post("/createSkills", function (req, res) {
  //let parentskillsId = req.body.parentskillsId;
  let skillsName = req.body.skillsName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newskills = new skills({
  //parentskillsId: parentskillsId,
    skillsName: skillsName,
    //access: access,
    createdBy: createdBy
  });

  skills.createSkills(newskills, function (err, skills) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "skills saved successfully",
        "manageData": skills
      });
    }
  });
});
// End Create a skills item

// Edit a skills start

router.put("/editskills/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  skills.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "skills Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "skills Updated Successfully" });
    }
  });
});
// End Edit a skills

// Find by parentskillsId start

router.get("/findskillsId/:parentskillsId", function (req, res) {
  let id = req.params.parentskillsId;

  skills.getByParentskillsId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "skills document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by parentskillsId

// Find by getParents start

router.get("/getParents", function (req, res) {
  
  let query = { parentskillsId: null };
  skills.find(query, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "skills document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by getParents



// getAll start

router.get("/getAll", function (req, res) {

  skills.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({skillsName:1});
});
// End getAll

// deleteskillsById start
router.delete("/deleteskillsById/:id", function (req, res, next) {
  let id = req.params.id;

  skills.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "skills document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted skills Successfully" });
    }
  });
});
// End deleteskillsById

module.exports = router;
