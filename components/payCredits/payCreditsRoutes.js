let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let payCredits = require("./payCreditsModel");

// Create a payCredits item start

router.post("/createPayCredits", function (req, res) {
  let memberId = req.body.memberId;
  let payType = req.body.payType;
  let celebId = req.body.celebId;
  let managerId = req.body.managerId;
  let referralId = req.body.referralId;
  let creditValue = req.body.creditValue;
  let celebPercentage = req.body.celebPercentage;
  let managerPercentage = req.body.managerPercentage;
  let celebKonnectPercentage = req.body.celebKonnectPercentage;
  let createdBy = req.body.createdBy;

  let newPayCredits = new payCredits({
    memberId: memberId,
    payType: payType,
    celebId: celebId,
    managerId: managerId,
    referralId:referralId,
    creditValue: creditValue,
    celebPercentage: celebPercentage,
    managerPercentage: managerPercentage,
    celebKonnectPercentage:celebKonnectPercentage,
    createdBy: createdBy
  });

  payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "payCredits saved successfully",
        "packageData": payCredits
      });
    }
  });
});
// End Create a payCredits item

// Edit a payCredits start

router.put("/editPayCredits/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  payCredits.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "payCredits Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "payCredits Updated Successfully" });
    }
  });
});
// End Edit a payCredits

// Find by payCreditsId start

router.get("/findPayCreditsId/:payCreditsId", function (req, res) {
  let id = req.params.payCreditsId;

  payCredits.getPayCreditsById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "payCredits document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by payCreditsId
// Find by getpayCreditsByMemberId start

router.get("/getPayCreditsByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;

  payCredits.getByMemberId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "payCredits transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by getpayCreditsByMemberId

// Get credit packages by country id start

router.get("/getCreditPackagesByCountry/:countryCODE", function (req, res) {
  let cCode = req.params.countryCODE;

  payCredits.find({ countryCode: cCode }, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "payCredits transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Get credit packages by country id 


// getAll start

router.get("/getAll", function (req, res) {

  payCredits.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({createdAt:-1});
});
// End getAll

// Start of Find Pay credits history by start date and endDate and memberId
router.post("/reportsByMemDate", function (req, res) {
  let memberId = req.body.memberId;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;
  payCredits.aggregate(
    [
      {
        $match: {
          $and: [
            { memberId: ObjectId(memberId) },
            { createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) } },
          ]
        }
      }
    ],
    function (err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
      
      
    }
  );

});
// End of Find Pay credits history by start date and endDate and memberId
// deletepayCreditsById start
router.delete("/deletePayCreditsById/:id", function (req, res, next) {
  let id = req.params.id;

  payCredits.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "payCredits document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted payCredits Successfully" });
    }
  });
});
// End deletepayCreditsById

module.exports = router;
