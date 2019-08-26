let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let packageCollection = require("./packageCollectionModel");
let PackageCollectionController = require("./packageCollectionController");

// Create a packageCollection item start

router.post("/createPackageCollection", function (req, res) {
  let memberId = req.body.memberId;
  let packageType = req.body.packageType;
  let packageName = req.body.packageName;
  let status = req.body.status;
  let credits = req.body.credits;
  let checkoutCurrencyINR = req.body.checkoutCurrencyINR;
  let amount = req.body.amount;
  let countryCode = req.body.countryCode;
  let createdBy = req.body.createdBy;

  let newpackageCollection = new packageCollection({
    memberId: memberId,
    packageType: packageType,
    packageName: packageName,
    credits: credits,
    checkoutCurrencyINR:checkoutCurrencyINR,
    amount: amount,
    countryCode: countryCode,
    status: status,
    createdBy: createdBy
  });

  packageCollection.createPackageCollection(newpackageCollection, function (err, packageCollection) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "packageCollection saved successfully",
        "packageData": packageCollection
      });
    }
  });
});
// End Create a packageCollection item

// Edit a packageCollection start

router.put("/editPackageCollection/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedDateTime = new Date();

  packageCollection.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "packageCollection Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "packageCollection Updated Successfully" });
    }
  });
});
// End Edit a packageCollection

// Find by packageCollectionId start

router.get("/findPackageCollectionId/:packageCollectionId", function (req, res) {
  let id = req.params.packageCollectionId;

  packageCollection.getPackageCollectionById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "packageCollection document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by packageCollectionId
// Find by getPackageCollectionByMemberId start

router.get("/getPackageCollectionByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;

  packageCollection.getPackageCollectionByUserId(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "packageCollection transaction document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by getPackageCollectionByMemberId

// Get credit packages by country id start

router.get("/getCreditPackagesByCountry/:countryCODE", function (req, res) {
  let cCode = req.params.countryCODE;

  packageCollection.find({ countryCode: cCode }, function (err, result) {
    if (result) {
      res.json({token:req.headers['x-access-token'],success:1,data:result});
    } else {
      res.json({token:req.headers['x-access-token'],success:0,message:"packageCollection transaction document Not Exists / Send a valid ID"})
    }
  }).sort({amount:-1});;
});
// End Get credit packages by country id 


// getAll start

router.get("/getAll",(req, res)=> {
  packageCollection.find({},(err, result)=> {
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

router.get("/getAll/:pageNo/:limit",PackageCollectionController.getAll)

// deletePackageCollectionById start
router.delete("/deletePackageCollectionById/:id", function (req, res, next) {
  let id = req.params.id;

  packageCollection.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "packageCollection document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted packageCollection Successfully" });
    }
  });
});
// End deletePackageCollectionById


//desc get predefine default credit package with other details
//method GET
//access public
router.get('/getDefaultCreditPackage/:member_Id/:country', PackageCollectionController.getDefaultCreditPackage);
//desc calculate price based on credit quantity/currency
//method POST
//access public
router.post('/calculateCreditPrice', PackageCollectionController.calculatePrice)
//desc calculate final price based on credit quantity/currency
//method POST
//access public
router.post('/calculateFinalCreditPriceWithGST', PackageCollectionController.calculateFinalCreditPriceWithGST)

/***************** start Only currency type API Here **************************** */
//desc create currency on from admin side
//method POST
//access Private
router.post('/createCurrencyType', PackageCollectionController.createCurrencyType);

/****************** end Only currency type API Here *************************   */
module.exports = router;
