let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let roleType = require("./roleTypeModel");
let AgeRange = require('../ageRange/ageRangeModel');
let HairColor = require('../hairColor/hairColorModel');
let BodyType = require('../bodyType/bodyTypeModel');
let EyeColour = require('../eyeColor/eyeColourModel');
let Ethnicity = require('../ethnicity/ethnicityModel');
let roleTypeControllers = require('./roleTypeController');
let roleTypeServices = require('./roleTypeService');

// Create a roleType item start

router.post("/createRoleType", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let roleTypeName = req.body.roleTypeName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newRoleType = new roleType({
    //parentProductionId: parentProductionId,
    roleTypeName: roleTypeName,
    filter: req.body.filter,
    //access: access,
    createdBy: createdBy
  });

  roleType.createRoleType(newRoleType, function (err, roleType) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "roleType saved successfully",
        "manageData": roleType
      });
    }
  });
});
// End Create a roleType item

// Edit a roleType start

router.put("/editroleType/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  roleType.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "roleType Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "roleType Updated Successfully" });
    }
  });
});
// End Edit a roleType

// Find by roleTypeId start

router.get("/findroleTypeId/:roleTypeId", function (req, res) {
  let id = req.params.roleTypeId;

  roleType.getroleTypeById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "roleType document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by roleTypeId


// getAll start

router.get("/getAll", function (req, res) {

  roleType.find({}, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  }).sort({ roleTypeName: 1 });
});
// End getAll

// deleteroleTypeById start
router.delete("/deleteroleTypeById/:id", function (req, res, next) {
  let id = req.params.id;

  roleType.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "roleType document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted roleType Successfully" });
    }
  });
});
// End deleteroleTypeById

//get all filtered  data (ageRange, haircolor, bodyType, etc)
router.get('/getAllFiltersByRoleType', (req, res) => {

  AgeRange.find((err, listOfAgeRage) => {
    if (err)
      return res.status(404).json({ success: 0, message: "Error while fetching filters data..." });
    else {
      HairColor.find((err, listOfHairColor) => {
        if (err)
          console.log("HairColor",err)
        else {
          BodyType.find((err, listOfBodyType) => {
            if (err)
              console.log("BodyType======= ",err)
            else {
              EyeColour.find((err, listOfEyeColor) => {
                if (err)
                  console.log("EyeColour",  err)
                else {
                  Ethnicity.find((err, listOfEthnicity) => {
                    if (err)
                      console.log("Ethnicity  ", err)
                    else {
                       res.status(200).json(
                         {success:1, 
                          ageRange:listOfAgeRage,
                          hairColor:listOfHairColor,
                          bodyType:listOfBodyType,
                          eyeColour:listOfEyeColor,
                          ethnicity:listOfEthnicity});
                    }
                  });
                }
              }).sort({createdAt:-1});
            }
          });
        }
      }).sort({createdAt:-1});
    }
  });
});

router.get('/getFiltersByRoleType/:roleTypeName',roleTypeControllers.getFiltersByRoleType);

module.exports = router;
