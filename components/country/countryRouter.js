let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let country = require("./countrysModel");

// Create a country item
router.post("/createCountry", function(req, res) {
  let countryName = req.body.countryName;
  let countryCode = req.body.countryCode;
  let dialCode = req.body.dialCode;
  let status = req.body.status;
  let createdDateTime = req.body.createdDateTime;
  let createdBy = req.body.createdBy;
  let updatedBy = req.body.updatedBy;
  let updatedDateTime = req.body.updatedDateTime;

  let newCountry = new country({
    countryName: countryName,
    countryCode: countryCode,
    dialCode: dialCode,
    status: status,
    createdBy: createdBy,
    updatedBy: updatedBy,
    createdDateTime: createdDateTime,
    updatedDateTime: updatedDateTime
  });

  country.createCountry(newCountry, function(
    err,
    country
  ) {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: "country saved successfully" });
    }
  });
});
// End of Create a country item

// Edit a country record
router.put("/editCountry/:id", function(req, res) {
  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedDateTime = new Date();

  country.findByIdAndUpdate(req.params.id, reqbody, function(
    err,
    result
  ) {
    if (err) {
      res.json({
        error: "country Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "country Updated Successfully" });
    }
  });
});
// End of Edit a country record

// Find by countryId
router.get("/findCountryId/:countryId", function(req, res) {
  let id = req.params.countryId;

  country.getcountryById(id, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "country document Not Exists / Send a valid ID"
      });
    }
  });
});
// End of Find by countryId

// get list all credit exchange info
router.get("/getAll", function(req, res) {
  country.find({}, function(err, result) {
    if (err) return next(err);
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    }
  }).sort({countryName:1});
});
// End of get list all credit exchange info

// Delete Credit Exchange
router.delete("/deleteCountryById/:id", function(req, res, next) {
  let id = req.params.id;

  country.findByIdAndRemove(id, function(err, post) {
    if (err) {
      res.json({
        error: "country document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted country Successfully" });
    }
  });
});
// End of Delete Credit Exchange

module.exports = router;
