let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let appPromoCode = require("./appPromoCodesModel");
let appPromoMaster = require("../appPromoMaster/appPromoMasterModel");
let voucher_codes = require("voucher-code-generator");

// Create an appPromoCode
router.post("/CreateAppPromoCodes", function(req, res) {
  let memberId = req.body.memberId;
  let approvedBy = req.body.approvedBy;
  let promoterIncentiveValue = req.body.promoterIncentiveValue;
  let installerIncentiveValue = req.body.installerIncentiveValue;
  let promoStatus = req.body.promoStatus;

  let code = voucher_codes.generate({
    prefix: "CK",
    length: 8
  });

  let promoObject = {};
  promoObject.code = code;
  promoObject.promoterIncentiveValue = promoterIncentiveValue;
  promoObject.installerIncentiveValue = installerIncentiveValue;
  promoObject.approvedDateTime = new Date();
  promoObject.promoStatus = req.body.promoStatus;
  promoObject.approvedBy = approvedBy;

  let appPromoCodeRecord = new appPromoCode({
    memberId: memberId,
    promoCode: promoObject
  });
  let query = { memberId: memberId };
  appPromoMaster.find(query, function(err, result) {
    if (result.length > 0) {
      if (result[0].status == "approved") {
        let query = { memberId: memberId };
        appPromoCode.find(query, function(err, findResult) {
          if (findResult.length > 0) {
            appPromoCode.findOneAndUpdate(
              { _id: findResult[0]._id },
              { $push: { promoCode: promoObject } },
              function(err, updateResult) {
                if (err) return res.send(err);

                if (updateResult) {
                  res.json({
                    message: "appPromoCode created sucessfully",
                    codes: updateResult
                  });
                } else {
                  res.json({ message: "Operation Failed!" });
                }
              }
            );
          } else {
            appPromoCode.createAppPromoCode(appPromoCodeRecord, function(
              err,
              promoResult
            ) {
              if (err) {
                res.send(err);
              } else {
                res.send({
                  message: "appPromoCode created sucessfully",
                  codes: promoResult
                });
              }
            });
          } // end of findResult IF
        });
      } else {
        res.json({ error: "Your status is pending!" });
      }
    } else {
      res.json({ error: "Your status is pending / not received yet!" });
    }
  });
});
// End of Create an appPromoCode

// Update an appPromoCode
router.put("/edit/:appPromoCodeId", function(req, res) {
  let id = req.params.appPromoCodeId;
  let reqbody = req.body;
  reqbody.updatedAt = new Date();
  appPromoCode.findById(id, function(err, result) {
    if (result) {
      appPromoCode.editAppPromoCode(id, reqbody, function(err, result) {
        if (err) return res.send(err);
        res.json({ message: "appPromoCode Updated Successfully" });
      });
    } else {
      res.json({ error: "appPromoCodeID not found / Invalid" });
    }
  });
});
// End of Update an appPromoCode

// Find by App Promo Code ID
router.get("/getAppPromoCodeInfo/:appPromoCodeID", function(req, res) {
  let id = req.params.appPromoCodeID;

  appPromoCode.getAppPromoCodeById(id, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Find by App Promo Code ID

// Get Promo Code Information By UserID
router.get("/getPromoCodeInfoByUserID/:userID", function(req, res) {
  let id = req.params.userID;
  appPromoCode.getPromoCodeInfoByUserID(id, function(err, result) {
    if (err) return res.send(err);
    if (result.length > 0) {
      res.send(result);
    } else {
      res.json({ error: "No promo codes exit / Invalid info" });
    }
  });
});
// End of  Get Promo Code Information By UserID

// Delete by appPromoCodeID
router.delete("/delete/:appPromoCodeID", function(req, res, next) {
  let id = req.params.appPromoCodeID;

  appPromoCode.findById(id, function(err, result) {
    if (result) {
      appPromoCode.findByIdAndRemove(id, function(err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted appPromoCode Successfully" });
      });
    } else {
      res.json({ error: "appPromoCodeID not found / Invalid" });
    }
  });
});
// End of Delete by appPromoCodeID

module.exports = router;
