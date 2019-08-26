let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let User = require("../users/userModel");
let Credits = require("./creditsModel");
let Notification = require("../notification/notificationModel");
let notificationSetting = require("../notificationSettings/notificationSettingsModel");
let celebrityContract = require("../celebrityContract/celebrityContractsModel");
let referralCode = require("../referralCode/referralCodeModel");
let slotMaster = require("../slotMaster/slotMasterModel");
let payCredits = require("../payCredits/payCreditsModel");
let feedbackModel = require("../feedback/feedbackModel");
let logins = require("./../loginInfo/loginInfoModel");
let serviceTransaction = require("../serviceTransaction/serviceTransactionModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
let MemberPreferences = require("../memberpreferences/memberpreferencesModel");
let FeedMapping = require('../feed/feedMappingModel');
let feedServices = require('../feed/feedServices');
const CreditController = require("./creditController");
const ActivityLog = require("../activityLog/activityLogService");
const otpService = require("../otp/otpRouter");
let paymentTransactionServices = require('../paymentTransaction/paymentTransactionServices');

// Create a Credits record
router.post("/createCredits", function (req, res) {
  // console.log("############## createCredits ###############################")
  // console.log(req.body)
  // console.log("############### createCredits ##############################")
  let creditRefCartId = req.body.creditRefCartId;
  let memberId = req.body.memberId;
  let paymentTranRefId = req.body.paymentTranRefId;
  let creditType = req.body.creditType;
  let creditValue = req.body.creditValue;
  let cumulativeCreditValue = req.body.cumulativeCreditValue;
  let referralCreditValue = req.body.referralCreditValue;
  let remarks = req.body.remarks;
  let couponCode = req.body.couponCode;
  let createdBy = req.body.createdBy;
  // console.log(req.body);

  /* promotion or payout */
  if (creditType == "payout" || creditType == "promotion") {
    // Start of Fetch Latest Credits Information
    Credits.find({
      memberId: memberId
    },
      null, {
        sort: {
          createdAt: -1
        }
      },
      function (err, cBal) {
        if (err) {
          res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: err
          })
        }
        if (cBal) {
          cBalObj = cBal[0];
          oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
          newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) + parseInt(creditValue);
          newReferralCreditValue = cBalObj.referralCreditValue;
          let newCredits = new Credits({
            creditRefCartId: creditRefCartId,
            memberId: memberId,
            paymentTranRefId: paymentTranRefId,
            creditType: creditType,
            creditValue: creditValue,
            cumulativeCreditValue: newCumulativeCreditValue,
            referralCreditValue: newReferralCreditValue,
            remarks: remarks,
            couponCode: couponCode,
            createdBy: createdBy
          });
          // Insert Into Credit Table
          Credits.createCredits(newCredits, function (err, credits) {
            if (err) {
              res.json({
                success: 0,
                token: req.headers['x-access-token'],
                message: err
              })
            } else {
              res.send({
                success: 1,
                token: req.headers['x-access-token'],
                message: "Credits updated successfully",
                data: credits
              });


              let query = { $and: [{ memberId: memberId }, { notificationSettingId: "5b5ebd64fef3737e09fb3844" }, { isEnabled: false }] };
              //let query = { memberId: celebrityId, notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") };
              //console.log(celebrityId);
              notificationSetting.find(query, function (err, rest) {
                if (err) return res.send(err);
                // Insert into Notfications Collection 
                if (rest == "" || rest.isEnabled == true) {

                  let newNotification = new Notification({
                    memberId: memberId,
                    notificationFrom: memberId,
                    activity: "EARNEDCREDIT",
                    title: "You" + " " + "earned " + creditValue + " " + creditType + " Credits",
                    body: " This is to notify that you have earned " + creditValue + " " + creditType + " Credits. Happy Konecting!!",
                    status: "active",
                    notificationType: "Credit"
                  });
                  // Insert Notification
                  Notification.createNotification(newNotification, function (err, credits) {
                    if (err) {
                      //res.send(err);
                    } else {


                    }
                  });
                  // End of Inset Notification
                }
              });



              // Update Cumulative earnings in User Object
              User.findOne({
                _id: memberId
              }, function (err, uResult) {
                nId = uResult._id;
                oldValue = parseInt(uResult.cumulativeEarnings);
                let newbody = {};
                newbody.cumulativeEarnings =
                  parseInt(creditValue) + parseInt(oldValue);
                User.findByIdAndUpdate(nId, newbody, function (
                  err,
                  upResult
                ) { });
              });
              // end of Update Cumulative earnings in User Object
            }
          });
          // End of Inset into Credit Table
        } else {
          //  console.log("credits not exists");
        }
      }
    ); // End of Create Credits
  }
  /* Debit */
  if (creditType == "debit") {
    // Start of Fetch Latest Credits Information
    ////////block check //////
    let query = {
      $and: [{ reason: "Block/Report" }, { celebrityId: ObjectId(req.body.CelebrityId) }, { memberId: ObjectId(req.body.memberId) }]
    };
    //console.log("T1",query);
    feedbackModel.find(query, function (err, Fresult) {
      //console.log("Fresult", Fresult);
      if (Fresult.length > 0) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });

      } else {
        let query = {
          $and: [{ callRemarks: "Block/Report" }, { receiverId: ObjectId(req.body.CelebrityId) }, { senderId: req.body.memberId }]
        };
        serviceTransaction.find(query, function (err, result) {
          if (result.length > 0) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
          } else {
            Credits.find({ memberId: memberId }, null, { sort: { createdAt: -1 } }, function (err, cBal) {
              if (err) {
                res.json({ success: 0, token: req.headers['x-access-token'], message: err })
              }
              if (cBal) {
                cBalObj = cBal[0];   // check user credit balance
                if ((parseInt(cBalObj.cumulativeCreditValue) - creditValue) < 0) {
                  res.json({ success: 0, token: req.headers['x-access-token'], message: "In Sufficiant Credits" })
                } else {
                  User.findById(ObjectId(req.body.CelebrityId), { username: 1, firstName: 1, lastName: 1 }, (err, celebDetailsObj) => {
                    if (err)
                      return res.json({ success: 0, token: req.headers['x-access-token'], message: err })
                    else {
                      let query = { $and: [{ memberId: ObjectId(memberId) }, { notificationSettingId: ObjectId("5b5ebd64fef3737e09fb3844") }, { isEnabled: true }] };  //check current member notification setting
                      notificationSetting.findOne(query, (err, rest) => {
                        if (err) {
                          return res.json({ success: 0, token: req.headers['x-access-token'], message: err })
                        }
                        if (rest) {
                          // Insert into Notfications Collection 
                          //this is to notify you purchased " + creditValue + " Credits. Happy Konecting!!",
                          let newNotification = new Notification({
                            memberId: memberId,
                            notificationFrom: memberId,
                            activity: "SPENTCREDIT",
                            notificationType: "Fan",
                            title: "Credits Spent ",
                            body: "you have spent " + creditValue + " Credits to become FAN to " + celebDetailsObj.firstName + " " + celebDetailsObj.lastName + " Happy Konecting!!",
                            status: "active"
                          });
                          // Insert Notification
                          Notification.createNotification(newNotification, function (err, credits) {
                            if (err) {
                              console.log(err)
                            } else {
                              let memberId = ObjectId(req.body.memberId);
                              let CelebrityId = ObjectId(req.body.CelebrityId);
                              let isFan = req.body.isFan;
                              let credits = req.body.credits;
                              let reqbody = req.body;
                              reqbody.isFan = true;
                              User.findById(memberId, function (err, result) {
                                //console.log("result", result);
                                if (err) {
                                  res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                }
                                if (result) {
                                  feedServices.findCelebFeedDate(CelebrityId, (err, lastWeekDate) => {
                                    if (err) {
                                      res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                    } else {
                                      let today = new Date();
                                      let lastWeek = new Date(lastWeekDate);
                                      FeedMapping.findFeedMappingByMemberId(ObjectId(memberId), (err, feedMappingObj) => {
                                        if (err) {
                                          res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                        } else {
                                          MemberPreferences.findOne({ memberId: memberId }, { _id: 1, celebrities: 1 }, (err, memberPreferenceObj) => {
                                            //console.log("P12",memberPreferenceObj);
                                            if (err) {
                                              res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                            }
                                            else if (memberPreferenceObj) {
                                              MemberPreferences.aggregate([
                                                {
                                                  $match: { memberId: memberId }
                                                },
                                                {
                                                  $unwind: "$celebrities"
                                                },
                                                {
                                                  $match: {
                                                    "celebrities.CelebrityId": CelebrityId,
                                                    "celebrities.isFan": true
                                                  }
                                                }
                                              ], (err, memberPreferencesObj) => {
                                                if (err) {
                                                  res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                }
                                                else if (memberPreferencesObj.length) {
                                                  res.json({ token: req.headers['x-access-token'], success: 0, message: "User already a Fan" });
                                                } else {
                                                  memberPreferenceObj.celebrities.map((celebIdObj) => {
                                                    let celebId = celebIdObj.CelebrityId;
                                                    celebId = "" + celebId
                                                    let isCelebIdRegister = "" + CelebrityId
                                                    if (celebId == isCelebIdRegister) {
                                                      lastWeek == new Date(celebIdObj.createdAt);
                                                    }
                                                  });
                                                  if (feedMappingObj) {
                                                    if (new Date(feedMappingObj.currentSeenFeedDate).getTime() == new Date(feedMappingObj.createdAt).getTime()) {
                                                      lastWeek = new Date(lastWeek);
                                                    } else {
                                                      lastWeek = today;
                                                    }
                                                  }
                                                  MemberPreferences.updateOne({ memberId: memberId },
                                                    { $addToSet: { celebrities: { CelebrityId: CelebrityId, isFan: true, createdAt: lastWeek } } }
                                                    , { new: 1 }, function (err, user) {
                                                      if (err) {
                                                        res.send(err);
                                                      }
                                                      oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                                                      newCumulativeCreditValue =
                                                        parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                                                      newReferralCreditValue = cBalObj.referralCreditValue;
                                                      let newCredits = new Credits({
                                                        creditRefCartId: creditRefCartId,
                                                        memberId: memberId,
                                                        paymentTranRefId: paymentTranRefId,
                                                        creditType: creditType,
                                                        creditValue: creditValue,
                                                        cumulativeCreditValue: newCumulativeCreditValue,
                                                        referralCreditValue: newReferralCreditValue,
                                                        remarks: remarks,
                                                        couponCode: couponCode,
                                                        createdBy: createdBy
                                                      });
                                                      // Insert Into Credit Table
                                                      Credits.createCredits(newCredits, function (err, credits) {
                                                        if (err) {
                                                          res.json({ success: 0, token: req.headers['x-access-token'], message: err })
                                                        } else {
                                                          let celebInfo = {};
                                                          User.findById(CelebrityId, function (err, SMresult) {
                                                            User.findById(ObjectId(req.body.memberId), function (err, Uresult) {
                                                              if (Uresult == null) { } else {
                                                                let id2 = SMresult._id;
                                                                // console.log(id2);
                                                                logins.findOne({ memberId: CelebrityId }, function (err, Lresult) {
                                                                  if (Lresult == null) { }
                                                                  else {
                                                                    // console.log("AAAAAAAAAAAAAAAAA ")
                                                                    let dToken = Lresult.deviceToken
                                                                    // console.log("Device token ======= ",dToken);
                                                                    let newNotification = new Notification({
                                                                      memberId: req.body.CelebrityId,
                                                                      activity: "FAN",
                                                                      notificationFrom: Uresult._id,
                                                                      notificationSettingId: "5b5ebe31fef3737e09fb3849",
                                                                      title: "New FAN!!!",
                                                                      body: " " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
                                                                      //status: status,
                                                                      notificationType: req.body.notificationType,
                                                                      createdBy: createdBy
                                                                    });
                                                                    //Insert Notification
                                                                    Notification.createNotification(newNotification, function (err, credits) {
                                                                      if (err) {
                                                                        // res.json({token:req.headers['x-access-token'],success:0,message:err});
                                                                      } else {
                                                                        celebrityContract.findOne({ $and: [{ memberId: CelebrityId }, { serviceType: "fan" }, { isActive: true }] }, function (err, CCresult) {
                                                                          if (err) {
                                                                            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                                          }
                                                                          Credits.find({ memberId: CelebrityId }, (err, cBal) => {
                                                                            if (err) {
                                                                              return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                                            }
                                                                            if (cBal) {
                                                                              cBalObj = cBal[0];
                                                                              newReferralCreditValue = cBalObj.referralCreditValue;
                                                                              oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                                                              credits = CCresult.serviceCredits;
                                                                              test2 = CCresult.sharingPercentage;
                                                                              test = credits * test2 / 100;
                                                                              ckCredits = credits - test;
                                                                              newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
                                                                              let newPayCredits = new payCredits({
                                                                                memberId: CelebrityId,
                                                                                celebId: memberId,
                                                                                creditValue: credits,
                                                                                celebPercentage: test,
                                                                                payType: "fan",
                                                                                celebKonnectPercentage: ckCredits
                                                                              });
                                                                              payCredits.createPayCredits(newPayCredits, function (err, payCredits) {
                                                                                if (err) {
                                                                                  //res.send(err);
                                                                                  console.log(err)
                                                                                } else {
                                                                                  let newCredits = new Credits({
                                                                                    memberId: CelebrityId,
                                                                                    creditType: "credit",
                                                                                    creditValue: test,
                                                                                    cumulativeCreditValue: newCumulativeCreditValue,
                                                                                    referralCreditValue: newReferralCreditValue,
                                                                                    remarks: "Service Earnings for Fan",
                                                                                    createdBy: "Admin"
                                                                                  });
                                                                                  // Insert Into Credit Table
                                                                                  Credits.createCredits(newCredits, function (err, credits) {
                                                                                    if (err) {
                                                                                      //res.send(err);
                                                                                    } else {
                                                                                    }
                                                                                  });
                                                                                }
                                                                              });
                                                                            }
                                                                            else {
                                                                            }
                                                                          }).sort({ createdAt: -1 }).limit(1); //end of credits
                                                                        }); //end of celeb contracts
                                                                        let query = { $and: [{ memberId: CelebrityId }, { notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") }, { isEnabled: true }] };
                                                                        notificationSetting.findOne(query, (err, rest) => {
                                                                          if (err)
                                                                            return res.send(err);
                                                                          if (rest) {
                                                                            //let dToken = Lresult.deviceToken
                                                                            //body: " " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!", old body sending
                                                                            if (Lresult.osType == "Android") {
                                                                              var message = {
                                                                                to: dToken,
                                                                                collapse_key: 'Service-alerts',
                                                                                data: {
                                                                                  serviceType: "Fan",
                                                                                  title: 'Alert!!',
                                                                                  memberId: memberId,
                                                                                  body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                                                  activity: "FAN"
                                                                                }
                                                                              };
                                                                              fcm.send(message, function (err, response) {
                                                                                if (err) {
                                                                                  console.log(err)
                                                                                } else {
                                                                                  //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                                                  console.log("Successfully sent with resposne :", response);
                                                                                }
                                                                              });
                                                                            } else {
                                                                              var message = {
                                                                                to: dToken,
                                                                                collapse_key: 'Service-alerts',
                                                                                notification: {
                                                                                  serviceType: "Fan",
                                                                                  memberId: memberId,
                                                                                  title: 'Alert!!',
                                                                                  body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                                                  activity: "FAN"
                                                                                }
                                                                              };
                                                                              fcm.send(message, function (err, response) {
                                                                                if (err) {
                                                                                  console.log(err)
                                                                                } else {
                                                                                  //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                                                  console.log("Successfully sent with resposne :", response);
                                                                                }
                                                                              });
                                                                            }
                                                                          } else {
                                                                            oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                                                                            newCumulativeCreditValue =
                                                                              parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                                                                            newReferralCreditValue = cBalObj.referralCreditValue;
                                                                            let newCredits = new Credits({
                                                                              creditRefCartId: creditRefCartId,
                                                                              memberId: memberId,
                                                                              paymentTranRefId: paymentTranRefId,
                                                                              creditType: creditType,
                                                                              creditValue: creditValue,
                                                                              cumulativeCreditValue: newCumulativeCreditValue,
                                                                              referralCreditValue: newReferralCreditValue,
                                                                              remarks: remarks,
                                                                              couponCode: couponCode,
                                                                              createdBy: createdBy
                                                                            });
                                                                            // Insert Into Credit Table
                                                                            Credits.createCredits(newCredits, function (err, credits) {
                                                                              if (err) {
                                                                                res.json({ success: 0, token: req.headers['x-access-token'], message: err })
                                                                              } else {
                                                                                let celebInfo = {};
                                                                                User.findById(CelebrityId, function (err, SMresult) {
                                                                                  User.findById(ObjectId(req.body.memberId), function (err, Uresult) {
                                                                                    if (Uresult == null) {

                                                                                    } else {
                                                                                      let id2 = SMresult.email;
                                                                                      logins.findOne({ memberId: CelebrityId }, function (err, Lresult) {
                                                                                        if (Lresult == null) {

                                                                                        } else {
                                                                                          let dToken = Lresult.deviceToken
                                                                                          let newNotification = new Notification({
                                                                                            memberId: req.body.CelebrityId,
                                                                                            activity: "FAN",
                                                                                            notificationFrom: Uresult._id,
                                                                                            notificationSettingId: "5b5ebe31fef3737e09fb3849",
                                                                                            title: "Alert!!",
                                                                                            body: " " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
                                                                                            //status: status,
                                                                                            notificationType: req.body.notificationType,
                                                                                            createdBy: createdBy
                                                                                          });
                                                                                          //Insert Notification
                                                                                          Notification.createNotification(newNotification, function (err, credits) {
                                                                                            if (err) {
                                                                                              // res.json({token:req.headers['x-access-token'],success:0,message:err});
                                                                                            } else {
                                                                                              let query = {
                                                                                                $and: [{ memberId: CelebrityId }, { notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") }, { isEnabled: true }]
                                                                                              };
                                                                                              notificationSetting.findOne(query, function (err, rest) {
                                                                                                if (err)
                                                                                                  return res.send(err);
                                                                                                if (rest) {
                                                                                                  if (Lresult.osType == "Android") {
                                                                                                    var message = {
                                                                                                      to: dToken,
                                                                                                      collapse_key: 'Service-alerts',
                                                                                                      data: {
                                                                                                        serviceType: "Fan",
                                                                                                        title: 'Alert!!',
                                                                                                        memberId: memberId,
                                                                                                        body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                                                                        activity: "FAN"
                                                                                                      }
                                                                                                    };
                                                                                                    fcm.send(message, function (err, response) {
                                                                                                      if (err) {
                                                                                                        console.log(err)
                                                                                                      } else {
                                                                                                        //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                                                                        console.log("Successfully sent with resposne :", response);
                                                                                                      }
                                                                                                    });
                                                                                                  } else {
                                                                                                    var message = {
                                                                                                      to: dToken,
                                                                                                      collapse_key: 'Service-alerts',
                                                                                                      notification: {
                                                                                                        serviceType: "Fan",
                                                                                                        title: 'Alert!!',
                                                                                                        memberId: memberId,
                                                                                                        body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                                                                        activity: "FAN"
                                                                                                      }
                                                                                                    };
                                                                                                    fcm.send(message, function (err, response) {
                                                                                                      if (err) {
                                                                                                        console.log(err)
                                                                                                      } else {
                                                                                                        //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                                                                        console.log("Successfully sent with resposne :", response);
                                                                                                      }
                                                                                                    });
                                                                                                  }
                                                                                                } else { }
                                                                                              });
                                                                                            }
                                                                                          });
                                                                                        }
                                                                                      });
                                                                                    }
                                                                                  });
                                                                                });
                                                                                // End of Get Member and Celebrity Data
                                                                              } //from here
                                                                              User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                                                                              });
                                                                            });
                                                                          }

                                                                        });
                                                                      }
                                                                    });
                                                                  }
                                                                });
                                                              }
                                                            });
                                                          });
                                                          // End of Get Member and Celebrity Data
                                                        }
                                                        User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                                                          let body = {
                                                            memberId: memberId,
                                                            activityOn: CelebrityId
                                                          }
                                                          ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Fan", body, (err, newActivityLog) => {
                                                            if (err) {
                                                              // res.json({success: 0,message: "Please try again." + err});
                                                            } else {

                                                            }
                                                          })
                                                          res.json({ success: 1, token: req.headers['x-access-token'], message: "You are now a fan of " + celebInfo.firstName, data: { creditInfo: credits, celebInfo: celebInfo } });
                                                        });
                                                      });
                                                    });
                                                }
                                              })
                                            }
                                            else {
                                              let newRecord = new MemberPreferences({
                                                memberId: memberId,
                                              });
                                              MemberPreferences.createNewRecord(newRecord, function (err, user) {
                                                if (err) {
                                                  res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                } else {
                                                  MemberPreferences.updateOne({ memberId: memberId },
                                                    { $addToSet: { celebrities: { CelebrityId: CelebrityId, isFan: true } } }
                                                    , { new: 1 }, function (err, user) {
                                                      if (err) {
                                                        return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                      }
                                                      else {
                                                        if (req.body.notificationType && req.body.notificationType == "Fan") {
                                                          if ((req.body.notificationType != "unFan") && (req.body.notificationType != "unFollow")) {
                                                            // Get Member and Celebrity Profiles Data
                                                            User.findById(ObjectId(req.body.CelebrityId), function (err, SMresult) {
                                                              User.findById(memberId, function (err, Uresult) {
                                                                if (Uresult == null) {

                                                                } else {
                                                                  let id2 = SMresult.email;
                                                                  //console.log(id2);
                                                                  logins.findOne({ memberId: ObjectId(req.body.CelebrityId) }, function (err, Lresult) {
                                                                    if (Lresult == null) { } else {
                                                                      let dToken = Lresult.deviceToken;
                                                                      let osType = Lresult.osType;
                                                                      let newNotification = new Notification({
                                                                        memberId: req.body.CelebrityId,
                                                                        activity: "FAN",
                                                                        notificationFrom: Uresult._id,
                                                                        notificationSettingId: "5b5ebe31fef3737e09fb3849",
                                                                        title: "New FAN !!!",
                                                                        body: " " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
                                                                        status: "active",
                                                                        notificationType: req.body.notificationType,
                                                                        createdBy: createdBy
                                                                      });
                                                                      //Insert Notification
                                                                      Notification.createNotification(newNotification, function (err, credits) {
                                                                        if (err) {
                                                                          res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                        } else {
                                                                          res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
                                                                          let query = {
                                                                            $and: [{ memberId: ObjectId(req.body.CelebrityId) }, { notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") }, { isEnabled: true }]
                                                                          };
                                                                          notificationSetting.findOne(query, function (err, rest) {
                                                                            if (err) return res.send(err);
                                                                            if (rest) {
                                                                              if (Lresult.osType == "Android") {
                                                                                var message = {
                                                                                  to: dToken,
                                                                                  collapse_key: 'Service-alerts',
                                                                                  data: {
                                                                                    serviceType: "Fan",
                                                                                    title: 'Alert!!',
                                                                                    memberId: memberId,
                                                                                    body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                                                    activity: "FAN"
                                                                                  }
                                                                                };
                                                                                fcm.send(message, function (err, response) {
                                                                                  if (err) {
                                                                                    console.log(err)
                                                                                  } else {
                                                                                    //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                                                    console.log("Successfully sent with resposne :", response);
                                                                                  }
                                                                                });
                                                                              } else {
                                                                                var message = {
                                                                                  to: dToken,
                                                                                  collapse_key: 'Service-alerts',
                                                                                  notification: {
                                                                                    serviceType: "Fan",
                                                                                    memberId: memberId,
                                                                                    title: 'Alert!!',
                                                                                    body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                                                    activity: "FAN"
                                                                                  }
                                                                                };
                                                                                fcm.send(message, function (err, response) {
                                                                                  if (err) {
                                                                                    console.log(err)
                                                                                  } else {
                                                                                    //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                                                    console.log("Successfully sent with resposne :", response);
                                                                                  }
                                                                                });
                                                                              }
                                                                            }
                                                                          });
                                                                        }
                                                                      });
                                                                    }
                                                                  });
                                                                }
                                                              });
                                                            });
                                                            // End of Get Member and Celebrity Data
                                                          }
                                                        }
                                                        celebrityContract.findOne({ $and: [{ memberId: CelebrityId }, { serviceType: "fan" }, { isActive: true }] }, function (err, CCresult) {
                                                          if (err) {
                                                            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                          }
                                                          Credits.find({ memberId: ObjectId(req.body.CelebrityId) }, (err, cBal) => {
                                                            if (err) {
                                                              return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                            }
                                                            if (cBal) {
                                                              cBalObj = cBal[0];
                                                              newReferralCreditValue = cBalObj.referralCreditValue;
                                                              oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                                              credits = CCresult.serviceCredits;
                                                              test2 = CCresult.sharingPercentage;
                                                              test = credits * test2 / 100;
                                                              ckCredits = credits - test;
                                                              newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
                                                              let newPayCredits = new payCredits({
                                                                memberId: ObjectId(req.body.CelebrityId),
                                                                celebId: memberId,
                                                                creditValue: credits,
                                                                celebPercentage: test,
                                                                payType: "fan",
                                                                celebKonnectPercentage: ckCredits
                                                              });
                                                              payCredits.createPayCredits(newPayCredits, function (err, payCredits) {
                                                                if (err) {
                                                                  console.log(err)
                                                                } else {
                                                                  let newCredits = new Credits({
                                                                    memberId: ObjectId(req.body.CelebrityId),
                                                                    creditType: "credit",
                                                                    creditValue: test,
                                                                    cumulativeCreditValue: newCumulativeCreditValue,
                                                                    referralCreditValue: newReferralCreditValue,
                                                                    //referralCreditValue: referralCreditValue,
                                                                    remarks: "Service Earnings for Fan",
                                                                    createdBy: "Admin"
                                                                  });
                                                                  // Insert Into Credit Table
                                                                  Credits.createCredits(newCredits, function (err, credits) {
                                                                    if (err) {
                                                                      console.log(err)
                                                                    } else {
                                                                    }
                                                                  });
                                                                }
                                                              });
                                                            }
                                                            else {
                                                            }
                                                          }).sort({ createdAt: -1 }).limit(1); //end of credits
                                                        }); //end of celeb contracts
                                                      }
                                                    });
                                                }
                                              });
                                            }
                                          });
                                        }
                                      })
                                    }
                                  })
                                }
                              });
                            } //celeb id is CelebrityId
                          });
                          // End of Inset Notification
                        } else {
                          let CelebrityId = ObjectId(req.body.CelebrityId);
                          MemberPreferences.updateOne({ memberId: memberId },
                            { $addToSet: { celebrities: { CelebrityId: ObjectId(req.body.CelebrityId), isFan: true } } }
                            , { new: 1 }, function (err, user) {
                              if (err) {
                                res.send(err);
                              }
                              oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                              newCumulativeCreditValue =
                                parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                              newReferralCreditValue = cBalObj.referralCreditValue;
                              let newCredits = new Credits({
                                creditRefCartId: creditRefCartId,
                                memberId: memberId,
                                paymentTranRefId: paymentTranRefId,
                                creditType: creditType,
                                creditValue: creditValue,
                                cumulativeCreditValue: newCumulativeCreditValue,
                                referralCreditValue: newReferralCreditValue,
                                remarks: remarks,
                                couponCode: couponCode,
                                createdBy: createdBy
                              });
                              // Insert Into Credit Table
                              Credits.createCredits(newCredits, function (err, credits) {
                                if (err) {
                                  res.json({ success: 0, token: req.headers['x-access-token'], message: err })
                                } else {
                                  if (req.body.notificationType == "Fan") {
                                    if ((req.body.notificationType != "unFan") && (req.body.notificationType != "unFollow")) {
                                      let celebInfo = {};
                                      User.findById(ObjectId(req.body.CelebrityId), function (err, SMresult) {
                                        User.findById(ObjectId(req.body.memberId), function (err, Uresult) {
                                          if (Uresult == null) { } else {
                                            let id2 = SMresult.email;
                                            logins.findOne({ memberId: ObjectId(req.body.CelebrityId) }, function (err, Lresult) {
                                              if (Lresult == null) { } else {
                                                let dToken = Lresult.deviceToken
                                                let newNotification = new Notification({
                                                  memberId: req.body.CelebrityId,
                                                  activity: "FAN",
                                                  notificationSettingId: "5b5ebe31fef3737e09fb3849",
                                                  title: "Alert!!",
                                                  body: " " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
                                                  //status: status,
                                                  notificationFrom: Uresult._id,
                                                  notificationType: req.body.notificationType,
                                                  createdBy: createdBy
                                                });
                                                //Insert Notification
                                                Notification.createNotification(newNotification, function (err, credits) {
                                                  if (err) {
                                                    console.log(err)
                                                  } else {
                                                    let query = {
                                                      $and: [{ memberId: ObjectId(req.body.CelebrityId) }, { notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") }, { isEnabled: true }]
                                                    };
                                                    notificationSetting.findOne(query, function (err, rest) {
                                                      if (err)
                                                        return //res.send(err);
                                                      if (rest) {
                                                        if (Lresult.osType == "Android") {
                                                          var message = {
                                                            to: dToken,
                                                            collapse_key: 'Service-alerts',
                                                            data: {
                                                              serviceType: "Fan",
                                                              title: 'Alert!!',
                                                              memberId: memberId,
                                                              body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                              activity: "FAN"
                                                            }
                                                          };
                                                          fcm.send(message, function (err, response) {
                                                            if (err) {
                                                              console.log(err)
                                                            } else {
                                                              //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                              console.log("Successfully sent with resposne :", response);
                                                            }
                                                          });
                                                        } else {
                                                          var message = {
                                                            to: dToken,
                                                            collapse_key: 'Service-alerts',
                                                            notification: {
                                                              serviceType: "Fan",
                                                              title: 'Alert!!',
                                                              memberId: memberId,
                                                              body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                                                              activity: "FAN"
                                                            }
                                                          };
                                                          fcm.send(message, function (err, response) {
                                                            if (err) {
                                                              console.log(err)
                                                            } else {
                                                              //res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                                                              console.log("Successfully sent with resposne :", response);
                                                            }
                                                          });
                                                        }
                                                        celebrityContract.findOne({ $and: [{ memberId: req.body.CelebrityId }, { serviceType: "fan" }, { isActive: true }] }, function (err, CCresult) {
                                                          if (err) {
                                                            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                          }
                                                          Credits.find({ memberId: req.body.CelebrityId }, (err, cBal) => {
                                                            //console.log("cBal", cBal);
                                                            if (err) {
                                                              return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                            }
                                                            if (cBal) {
                                                              cBalObj = cBal[0];
                                                              newReferralCreditValue = cBalObj.referralCreditValue;
                                                              oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                                              credits = CCresult.serviceCredits;
                                                              test2 = CCresult.sharingPercentage;
                                                              test = credits * test2 / 100;
                                                              ckCredits = credits - test;
                                                              newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
                                                              let newPayCredits = new payCredits({
                                                                memberId: req.body.CelebrityId,
                                                                celebId: memberId,
                                                                creditValue: credits,
                                                                celebPercentage: test,
                                                                payType: "fan",
                                                                celebKonnectPercentage: ckCredits
                                                              });
                                                              payCredits.createPayCredits(newPayCredits, function (err, payCredits) {
                                                                if (err) {
                                                                  console.log(err)
                                                                } else {
                                                                  let newCredits = new Credits({
                                                                    memberId: req.body.CelebrityId,
                                                                    creditType: "credit",
                                                                    creditValue: test,
                                                                    cumulativeCreditValue: newCumulativeCreditValue,
                                                                    referralCreditValue: newReferralCreditValue,
                                                                    //referralCreditValue: referralCreditValue,
                                                                    remarks: "Service Earnings for Fan",
                                                                    createdBy: "Admin"
                                                                  });
                                                                  // Insert Into Credit Table
                                                                  Credits.createCredits(newCredits, function (err, credits) {
                                                                    if (err) {
                                                                      console.log(err)
                                                                    } else {
                                                                    }
                                                                  });
                                                                }
                                                              });
                                                            }
                                                            else {
                                                            }
                                                          }).sort({ createdAt: -1 }).limit(1); //end of credits
                                                        }); //end of celeb contracts
                                                      } else {
                                                        celebrityContract.findOne({ $and: [{ memberId: req.body.CelebrityId }, { serviceType: "fan" }, { isActive: true }] }, function (err, CCresult) {
                                                          if (err) {
                                                            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                          }
                                                          Credits.find({ memberId: req.body.CelebrityId }, (err, cBal) => {
                                                            if (err) {
                                                              return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                                            }
                                                            if (cBal) {
                                                              cBalObj = cBal[0];
                                                              newReferralCreditValue = cBalObj.referralCreditValue;
                                                              oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                                              credits = CCresult.serviceCredits;
                                                              test2 = CCresult.sharingPercentage;
                                                              test = credits * test2 / 100;
                                                              ckCredits = credits - test;
                                                              newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
                                                              let newPayCredits = new payCredits({
                                                                memberId: req.body.CelebrityId,
                                                                celebId: memberId,
                                                                creditValue: credits,
                                                                celebPercentage: test,
                                                                payType: "fan",
                                                                celebKonnectPercentage: ckCredits
                                                              });
                                                              payCredits.createPayCredits(newPayCredits, function (err, payCredits) {
                                                                if (err) {
                                                                  console.log(err)
                                                                } else {
                                                                  let newCredits = new Credits({
                                                                    memberId: req.body.CelebrityId,
                                                                    creditType: "credit",
                                                                    creditValue: test,
                                                                    cumulativeCreditValue: newCumulativeCreditValue,
                                                                    referralCreditValue: newReferralCreditValue,
                                                                    //referralCreditValue: referralCreditValue,
                                                                    remarks: "Service Earnings for Fan",
                                                                    createdBy: "Admin"
                                                                  });
                                                                  // Insert Into Credit Table
                                                                  Credits.createCredits(newCredits, function (err, credits) {
                                                                    if (err) {
                                                                      console.log(err)
                                                                    } else {
                                                                    }
                                                                  });
                                                                }
                                                              });
                                                            }
                                                            else { }
                                                          }).sort({ createdAt: -1 }).limit(1); //end of credits
                                                        }); //end of celeb contracts
                                                      }
                                                    });
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      });
                                      // End of Get Member and Celebrity Data
                                    }
                                  }
                                }
                                User.findById(ObjectId(req.body.CelebrityId), function (err, celebInfo) {
                                  if (err)
                                    console.log(err)
                                  else
                                    res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan", data: { creditInfo: credits, celebInfo: celebInfo } });
                                });
                              });
                            });
                        }
                      });
                    }
                  })
                  // Update Cumulative Spent in User Object
                  User.findOne({ _id: memberId }, function (err, uResult) {
                    nId = uResult._id;
                    oldValue = parseInt(uResult.cumulativeSpent);
                    let newbody = {};
                    newbody.cumulativeSpent =
                      parseInt(creditValue) + parseInt(oldValue);
                    User.findByIdAndUpdate(nId, newbody, function (err, upResult
                    ) { });
                  });
                  // end of Update Cumulative Spent in User Object
                }
              }
            });
          }
        });
      }
    });
  }
  /* Credit */
  if (creditType == "credit") {
    // Start of Fetch Latest Credits Information
    logins.findOne({ memberId: memberId }, {}, (err, memberDeviceDetailsObj) => {
      if (err) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: err });
      } else {
        Credits.find({ memberId: memberId }, null, { sort: { createdAt: -1 } }, function (err, cBal) {
          if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: err });
          }
          if (cBal) {
            cBalObj = cBal[0];
            oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
            newCumulativeCreditValue =
              parseInt(oldCumulativeCreditValue) + parseInt(creditValue);
            newReferralCreditValue = cBalObj.referralCreditValue;
            let newCredits = new Credits({
              creditRefCartId: creditRefCartId,
              memberId: memberId,
              paymentTranRefId: paymentTranRefId,
              creditType: creditType,
              creditValue: creditValue,
              cumulativeCreditValue: newCumulativeCreditValue,
              referralCreditValue: newReferralCreditValue,
              remarks: remarks,
              couponCode: couponCode,
              createdBy: createdBy
            });
            // Insert Into Credit Table
            Credits.createCredits(newCredits, function (err, credits) {
              if (err) {
                return res.json({ success: 0, token: req.headers['x-access-token'], message: err });
              } else {
                paymentTransactionServices.updateCreditStatus(ObjectId(paymentTranRefId), { creditUpdateStatus: true }, (err, updatedPaymentTransaction) => {
                  if (err)
                    console.log(err)
                  else { }
                })
                res.send({ success: 1, token: req.headers['x-access-token'], message: "Credits updated successfully", data: req.body });
                //let query = { $and: [{ memberId: memberId }, { notificationSettingId: ObjectId("5b5ebd64fef3737e09fb3844") }, { isEnabled: true }] };
                let query = { memberId: memberId, notificationSettingId: ObjectId("5b5ebd64fef3737e09fb3844") };
                notificationSetting.find(query, (err, rest) => {
                  if (err)
                    return res.send(err);
                  // if (rest.length)
                  else {
                    // Insert into Notfications Collection 
                    let newNotification = new Notification({
                      memberId: memberId,
                      notificationFrom: memberId,
                      notificationType: "Credit",
                      activity: "PURCHASEDCREDITS",
                      title: "You" + " " + "purchased" + " " + creditValue + " credits",
                      body: "This is to notify you purchased " + creditValue + " Credits. Happy Konecting!!",
                      status: "active"
                    });
                    // Insert Notification
                    Notification.createNotification(newNotification, (err, credits) => {
                      if (err) {
                        console.log(err)
                      } else {
                        if (rest[0].isEnabled == true) {
                          if (memberDeviceDetailsObj.osType == "Android") {
                            let data = {
                              serviceType: "PURCHASEDCREDITS",
                              notificationType: "Credit",
                              title: 'Purchased Credits Alert!!',
                              memberId: memberId,
                              activity: "PURCHASEDCREDITS",
                              body: "Your account is credited by " + creditValue + " credits. Now credit Bal: " + newCumulativeCreditValue + " by UPI Ref No " + paymentTranRefId + ". T&C apply. Grab now:",
                              //body: "you have purchased " + creditValue + " credits. ",
                            }
                            otpService.sendAndriodPushNotification(memberDeviceDetailsObj.deviceToken, "", data, (err, successNotificationObj) => {
                              if (err)
                                console.log(err)
                              else {
                                console.log(successNotificationObj)
                              }
                            });
                          } else {
                            let notification = {
                              serviceType: "PURCHASEDCREDITS",
                              notificationType: "Credit",
                              title: 'Purchased Credits Alert!!',
                              memberId: memberId,
                              activity: "PURCHASEDCREDITS",
                              body: "Your account is credited by " + creditValue + " credits. Now credit Bal: " + newCumulativeCreditValue + " by UPI Ref No " + paymentTranRefId + ". T&C apply. Grab now:",
                              //body: "Greetings from CelebKonect, this is to notify you earned " + creditValue + " Credits. Happy Konecting!!",
                            }
                            otpService.sendIOSPushNotification(memberDeviceDetailsObj.deviceToken, notification, (err, successNotificationObj) => {
                              if (err)
                                console.log(err)
                              else {
                                console.log(successNotificationObj)
                              }
                            });
                          }
                        }
                      }
                    });
                    // End of Inset Notification
                  }
                });
              }
            });
            // End of Inset into Credit Table
          } else { }
        }); // End of Create Credits
      }
    })

  }
});
// End of Create a Credits record
// get Credit Balance By MemberID
router.get("/getCreditBalanceByMemberID/:memberId", function (req, res) {
  let id = req.params.memberId;
  //console.log(id);

  Credits.find({
    memberId: id
  }, null, {
      sort: {
        createdAt: -1
      }
    }, function (
      err,
      result
    ) {
      if (err) return res.send(err);
      //console.log("p1",result);
      if (result.length > 0) {
        //console.log("1")
        User.findOne({
          _id: id
        }, function (err, uResult) {
          if (uResult) {
            //console.log("2")
            //console.log(uResult.celebCredits)
            let newCelebCredits;
            if ((uResult.refCreditValue == "")) {
              newCelebCredits = 0
            } else {
              newCelebCredits = uResult.celebCredits;

            }
            let data = {};
            data._id = result[0]._id;
            data.memberId = result[0].memberId,
              data.__v = result[0].__v,
              data.updatedBy = result[0].updatedBy,
              data.createdBy = result[0].createdBy,
              data.updatedAt = result[0].updatedAt,
              data.createdAt = result[0].createdAt,
              data.status = result[0].status,
              data.couponCode = result[0].couponCode,
              data.remarks = result[0].remarks,
              data.referralCreditValue = result[0].referralCreditValue,
              data.cumulativeCreditValue = result[0].cumulativeCreditValue,
              data.creditValue = result[0].creditValue,
              data.creditType = result[0].creditType,
              data.celebCredits = newCelebCredits
            return res.json({ token: req.headers['x-access-token'], success: 1, data: data })
            // res.json({
            //   "_id": result[0]._id,
            //   "memberId": result[0].memberId,
            //   "__v": result[0].__v,
            //   "updatedBy": result[0].updatedBy,
            //   "createdBy": result[0].createdBy,
            //   "updatedAt": result[0].updatedAt,
            //   "createdAt": result[0].createdAt,
            //   "status": result[0].status,
            //   "couponCode": result[0].couponCode,
            //   "remarks": result[0].remarks,
            //   "referralCreditValue": result[0].referralCreditValue,
            //   "cumulativeCreditValue": result[0].cumulativeCreditValue,
            //   "creditValue": result[0].creditValue,
            //   "creditType": result[0].creditType,
            //   "celebCredits": newCelebCredits
            // });
          } else {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: "UserId not exits / send a valid memberId" })

          }

        });

      } else if (result.length == 0) {
        //console.log("test")
        let newCredits = new Credits({
          memberId: id,
          creditType: "promotion",
          creditValue: parseInt(0),
          cumulativeCreditValue: parseInt(0),
          referralCreditValue: parseInt(0)
        });

        Credits.createCredits(newCredits, function (err, credits) {
          if (err) {
            res.send(err);
          } else {
            let myBody = {};
            let nId = id;
            myBody.refCreditValue = true;

            logins.findByIdAndUpdate(nId, myBody, function (
              err,
              nResult
            ) { });
          }
        });
        // res.json({
        //   error: "Credits not exits / send a valid memberId"
        // });
      }
    });
});


router.get("/getCheckBalance/:senderId/:recieverId/:serviceType/:isCeleb", (req, res) => {
  const senderId = ObjectId(req.params.senderId);
  const receiverId = ObjectId(req.params.recieverId);
  const serviceType = req.params.serviceType;



  User.findById(receiverId, { pastProfileImages: 0, languages: 0, password: 0 }, (err, receiverInfo) => {
    if (err) {
      res.json({ success: 0, message: err })
    }
    else if (receiverInfo) {
      celebrityContract.findOne({ memberId: receiverId, isActive: true, serviceType: "fan" }, (err, contractsFanInfo) => {
        if (err) {
          res.json({ success: 0, message: err })
        } else {
          User.findById(senderId, { pastProfileImages: 0, languages: 0, password: 0 }, (err, senderInfo) => {
            if (err) {
              res.json({ success: 0, message: err })
            }
            if (senderInfo) {
              let query = {
                $and: [{ reason: "Block/Report" }, { celebrityId: receiverId }, { memberId: senderId }]
              };
              feedbackModel.findOne(query, (err, blockStatus) => {
                if (err) {
                  res.json({ success: 0, message: "Please try again", token: req.headers['x-access-token'], })
                }
                else if (blockStatus) {
                  res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
                } else {
                  let query = {
                    $and: [{ callRemarks: "Block/Report" }, { receiverId: receiverId }, { senderId: senderId }]
                  };
                  serviceTransaction.findOne(query, (err, callBlockStatus) => {
                    if (err) {
                      res.json({ success: 0, message: "Please try again", token: req.headers['x-access-token'], })
                    }
                    else if (callBlockStatus) {
                      res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
                    } else {
                      let query = {
                        $and: [
                          { memberId: receiverId },
                          { serviceType: serviceType },
                          { isActive: true },
                        ]
                      };
                      celebrityContract.findOne(query, (err, contractsResult) => {
                        if (err) {
                          return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        }
                        else if (contractsResult) {
                          creditValue = contractsResult.serviceCredits;
                          MemberPreferences.aggregate([
                            {
                              $match: {
                                memberId: senderId
                              }
                            },
                            // {
                            //   $unwind: "$celebrities"
                            // },
                            {
                              $match: { celebrities: { $elemMatch: { CelebrityId: receiverId, isFan: true } } }
                            }
                          ], (err, memberPreferencesObj) => {
                            // console.log(senderId)
                            // console.log(memberPreferencesObj[0])
                            if (err) {
                              return res.json({
                                success: 0,
                                token: req.headers['x-access-token'],
                                message: `${err}`
                              });
                            }
                            else if (memberPreferencesObj.length) {

                              // celebrityContract.findOne(query, (err, contractsResult) => {
                              //   if (err)
                              //   {
                              //     return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                              //   }
                              //   else if(contractsResult){


                              Credits.findOne({
                                memberId: senderId
                              }, (err, CResult) => {
                                if (err) {
                                  return res.json({
                                    success: 0,
                                    token: req.headers['x-access-token'],
                                    message: `${err}`
                                  });
                                }
                                else if (CResult) {
                                  if (senderId.isCeleb) {
                                    //console.log("wow")
                                    res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                  }
                                  else if (senderId.isManager) {
                                    res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                  }
                                  else {

                                    //console.log("sresult.referralCode",senderInfo)
                                    referralCode.findOne({ memberCode: senderInfo.referralCode }, (err, rresult) => {
                                      //console.log("rresult",rresult);
                                      if (err) {
                                        res.json({ success: 0, message: "please try again" })
                                      }
                                      else if (!rresult && creditValue && (creditValue > CResult.cumulativeCreditValue)) {
                                        {
                                          res.json({ token: req.headers['x-access-token'], success: 11, message: "In Sufficiant Credits", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                        }
                                      } else {
                                        // console.log("receiverId",receiverId);

                                        referralCode.findOne({ memberId: receiverId }, (err, referralInfo) => {
                                          // console.log("referralInfo", referralInfo);
                                          if (err) {
                                            res.json({ success: 0, message: "please try again" })
                                            // return res.json({ token: req.headers['x-access-token'], success: 11, message: "In Sufficiant Credits",data: { senderData: senderInfo, recieverData: receiverInfo,creditInfo:CResult,contractsInfo:contractsResult, isFan: true } });   
                                          } else {
                                            //console.log("referralInfo",referralInfo);
                                            // console.log("P1",referralInfo.memberCode);
                                            // console.log("P2",rresult.memberCode);
                                            CRcumulativeCreditValue = CResult.cumulativeCreditValue;
                                            CRreferralCreditValue = CResult.referralCreditValue;
                                            //console.log(CRreferralCreditValue)
                                            let today = new Date();
                                            slotMaster.findOne({ memberId: ObjectId(receiverId), startTime: { $lte: today }, endTime: { $gte: today } }, (err, scheduleObj) => {
                                              if (err) {
                                                res.json({ success: 0, message: err })
                                              } else {
                                                if (scheduleObj) {
                                                  let sameService = scheduleObj.serviceType.some((x) => {
                                                    return x.toLowerCase() == serviceType.toLowerCase()
                                                  })
                                                  if (sameService) {
                                                    creditValue = creditValue.creditValue;
                                                    contractsResult.serviceCredits = scheduleObj.creditValue;
                                                    creditValue = scheduleObj.creditValue;
                                                    console.log(creditValue)
                                                    if (rresult && (creditValue <= CRreferralCreditValue) && (req.params.serviceType == "video") && (referralInfo.memberCode == rresult.memberCode)) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    else if (rresult && (creditValue <= CRreferralCreditValue) && !rresult.memberId.isCeleb) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    // if ((creditValue <= CRreferralCreditValue) && (referralInfo.memberCode != rresult.memberCode) ) {
                                                    //   return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo,creditInfo:CResult,contractsInfo:contractsResult, isFan: true } });   
                                                    // }
                                                    // if ((creditValue <= CRreferralCreditValue) && (req.params.serviceType == "audio")&&(rresult)) {
                                                    //   return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo,creditInfo:CResult,contractsInfo:contractsResult, isFan: true } });   
                                                    // }
                                                    else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "video")) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "audio")) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    else {
                                                      return res.json({ token: req.headers['x-access-token'], success: 11, message: "Insufficient Credits", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                  } else {
                                                    console.log(creditValue)
                                                    if (rresult && (creditValue <= CRreferralCreditValue) && (req.params.serviceType == "video") && (referralInfo.memberCode == rresult.memberCode)) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    else if (rresult && (creditValue <= CRreferralCreditValue) && !rresult.memberId.isCeleb) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    // if ((creditValue <= CRreferralCreditValue) && (referralInfo.memberCode != rresult.memberCode) ) {
                                                    //   return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo,creditInfo:CResult,contractsInfo:contractsResult, isFan: true } });   
                                                    // }
                                                    // if ((creditValue <= CRreferralCreditValue) && (req.params.serviceType == "audio")&&(rresult)) {
                                                    //   return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo,creditInfo:CResult,contractsInfo:contractsResult, isFan: true } });   
                                                    // }
                                                    else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "video")) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "audio")) {
                                                      return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                    else {
                                                      return res.json({ token: req.headers['x-access-token'], success: 11, message: "Insufficient Credits", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                    }
                                                  }
                                                } else {
                                                  // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAA",rresult)
                                                  if (rresult && (creditValue <= CRreferralCreditValue) && (req.params.serviceType == "video") && (referralInfo.memberCode == rresult.memberCode)) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                  }
                                                  else if (rresult && (creditValue <= CRreferralCreditValue) && !rresult.memberId.isCeleb) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                  }
                                                  // if ((creditValue <= CRreferralCreditValue) && (referralInfo.memberCode != rresult.memberCode) ) {
                                                  //   return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo,creditInfo:CResult,contractsInfo:contractsResult, isFan: true } });   
                                                  // }
                                                  // if ((creditValue <= CRreferralCreditValue) && (req.params.serviceType == "audio")&&(rresult)) {
                                                  //   return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo,creditInfo:CResult,contractsInfo:contractsResult, isFan: true } });   
                                                  // }
                                                  else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "video")) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                  }
                                                  else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "audio")) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                  }
                                                  else {
                                                    return res.json({ token: req.headers['x-access-token'], success: 11, message: "Insufficient Credits", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true } });
                                                  }
                                                }
                                              }
                                            })
                                          }
                                        }).sort({ createdAt: -1 }).limit(1);
                                      }
                                    }).populate('memberId', '_id isCeleb');
                                    // return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: sresult, recieverData: uresult,creditInfo:CResult,contractsInfo:contractsResult, isFan: false } });
                                  }
                                } else {
                                  let newCredits = new Credits({
                                    memberId: senderId,
                                    creditType: "promotion",
                                    creditValue: parseInt(0),
                                    cumulativeCreditValue: parseInt(0),
                                    referralCreditValue: parseInt(0)
                                  });
                                  // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                                  Credits.createCredits(newCredits, (err, credits) => {
                                    if (err) {
                                      console.log(err)
                                    } else {
                                      logins.findByIdAndUpdate(senderId, { $set: { refCreditValue: true } }, (
                                        err,
                                        nResult
                                      ) => { });
                                    }
                                  });
                                }
                              }).sort({ createdAt: -1 }).limit(1);
                              //   }
                              //   else {
                              //     return res.json({ success: 0, message: "No Contrscts.please contact to admin" })
                              //   }
                              // });
                            }
                            else {
                              // let newRecord = new MemberPreferences({
                              //   memberId: senderId,
                              //   preferences: [],
                              //   celebrities: [],
                              //   createdBy: "celebkonect"
                              // });
                              // MemberPreferences.createNewRecord(newRecord,(err, memberPreferencesObj)=> {
                              //   if (err) {
                              //     res.json({
                              //       success: 0,
                              //       token: req.headers['x-access-token'],
                              //       message: `${err}`
                              //     });
                              //   } else {
                              res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: false } });
                              //   }
                              // });
                            }
                          })
                        }
                        else {
                          res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has no contract." });
                        }
                      }).lean();
                    }
                  });
                }
              })
            } else {
              res.json({ token: req.headers['x-access-token'], success: 0, message: "Sender information not found." })
            }
          });
        }
      })
    }
    else {
      res.json({ success: 0, message: "Recever information not found." })
    }
  });
});

////////////////////////////////// Insert Referral Credits //////////////////////////////////////////
router.post("/insertReferralCreditTransaction", function (req, res) {
  let creditRefCartId = req.body.creditRefCartId;
  let memberId = req.body.memberId;
  let paymentTranRefId = req.body.paymentTranRefId;
  let creditType = req.body.creditType;
  let creditValue = req.body.creditValue;
  let cumulativeCreditValue = req.body.cumulativeCreditValue;
  let referralCreditValue = req.body.referralCreditValue;
  let celebCredits = req.body.celebCredits;
  let remarks = req.body.remarks;
  let createdBy = req.body.createdBy;

  /* promotion or payout */
  // Start of Fetch Latest Credits Information
  Credits.find({
    memberId: memberId
  },
    null, {
      sort: {
        createdAt: -1
      }
    },
    function (err, cBal) {
      if (err) return res.send(err);
      if (cBal) {
        cBalObj = cBal[0];
        if ((parseInt(cBalObj.referralCreditValue) - creditValue) < 0) {
          res.json({ token: req.headers['x-access-token'], success: 0, message: "Insufficient referral credits" })
        } else {
          oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
          oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
          newReferralCreditValue = parseInt(oldReferralCreditValue) - parseInt(creditValue);
          let newCredits = new Credits({
            creditRefCartId: creditRefCartId,
            memberId: memberId,
            paymentTranRefId: paymentTranRefId,
            creditType: creditType,
            creditValue: creditValue,
            cumulativeCreditValue: cBalObj.cumulativeCreditValue,
            referralCreditValue: newReferralCreditValue,
            celebCredits: celebCredits,
            remarks: remarks,
            createdBy: createdBy
          });
          // Insert Into Credit Table
          Credits.createCredits(newCredits, function (err, credits) {
            //console.log(credits)
            if (err) {
              res.send(err);
            } else {
              res.json({ token: req.headers['x-access-token'], success: 1, message: "Credits updated successfully", data: credits });

              // Update Cumulative earnings in User Object
              User.findOne({
                _id: memberId
              }, function (err, uResult) {
                nId = uResult._id;
                oldValue = parseInt(uResult.cumulativeEarnings);
                let newbody = {};
                newbody.cumulativeEarnings =
                  parseInt(creditValue) + parseInt(oldValue);
                if ((celebCredits == false) || (celebCredits == undefined) || (celebCredits == "") || (celebCredits == null)) {

                } else {
                  newbody.celebCredits = celebCredits;
                }
                User.findByIdAndUpdate(memberId, newbody, function (
                  err,
                  upResult
                ) { });
              });
              // end of Update Cumulative earnings in User Object
            }
          });
        }
        // End of Inset into Credit Table
      } else {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "credits not exists" })
      }
    }
  ); // End of Create Credits
});
////////////////////////////////// End of Insert Referral Credits ///////////////////////////////////

////////////////////////////////// Update CelebCredits in UserObject //////////////////////////////////////////
router.post("/updateCelebCredits", function (req, res) {
  let memberId = req.body.memberId;
  let celebCredits = req.body.celebCredits;
  let newbody = req.body;
  newbody.updated_by = req.body.updated_by;
  newbody.updated_at = new Date();
  User.findByIdAndUpdate(memberId, newbody, function (
    err,
    upResult
  ) {
    res.send({
      "message": "Celebrity credits updated successfully!"
    });
  });
  // end of Update Cumulative earnings in User Object
});
////////////////////////////////// End of Insert Referral Credits ///////////////////////////////////


// Update credit information
router.put("/updateCredits/:creditID", function (req, res) {
  let id = req.params.creditID;

  let reqbody = req.body;

  reqbody.updatedAt = new Date();

  Credits.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      Credits.findByIdAndUpdate(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        res.json({
          message: "Credits updated successfully"
        });
      });
    } else {
      res.json({
        error: "Credits not found / Invalid"
      });
    }
  });
});
// End of Update credit information

// get by Id (getByCreditID)
router.get("/getByCreditID/:creditID", function (req, res) {
  let id = req.params.creditID;

  Credits.findById(id, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get by Id (getByCreditID)

// get Credit Balance By MemberID
// get Credit Balance By UserID for video/audio
router.post("/getCreditBalanceByUserID", function (req, res) {
  let senderId = req.body.senderId;
  let recieverId = req.body.recieverId;
  let serviceType = req.body.serviceType;
  currenttime = new Date(Date.now());
  var nextDay = new Date(currenttime);
  nextDay.setDate(currenttime.getDate() + 1);
  slotMaster.aggregate(
    [
      {
        $match: {
          $and: [
            { memberId: ObjectId(recieverId) },
            //{ "scheduleArray.scheduleStartTime": { $gte: new Date(currenttime), $lt: new Date(nextDay) } },
            //{  "scheduleArray.scheduleEndTime": { $gte: new Date(currenttime), $lt: new Date(nextDay) } },
            {
              startTime: { $lte: currenttime }
            },
            {
              endTime: { $gte: currenttime }
            }
          ]
        }
      }
    ],
    function (err, Sresult) {
      //console.log("bssss:1",Sresult[0].scheduleArray[0].creditValue)
      if (err) {

        //res.send(err);
      }

      if (Sresult.length > 0) {
        //console.log(Sresult);
        creditVal = Sresult[0].scheduleArray[0].creditValue;
        //console.log("Pa1",creditVal)
        //console.log("1");

        Credits.find(
          { memberId: senderId },
          null,
          { sort: { createdAt: -1 } },
          function (err, cBal) {
            //console.log(cBal)
            if (err) return res.send(err);
            //if (cBal) {
            cBalObj = cBal[0];
            newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
            //}

            User.findOne({ _id: senderId }, function (err, result) {

              //res.send(result.referralCode);
              referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
                if (result) {
                  //console.log(cBal[0].referralCreditValue);
                  console.log(result.referralCreditValue);
                  if (cBal[0].referralCreditValue >= 0) {
                    //console.log("1", cBal[0].referralCreditValue);
                    oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                    oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
                    //console.log("1", cBal[0].referralCreditValue);

                    let callCostBalance = parseInt(creditVal) -
                      (parseInt(oldReferralCreditValue) <= parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));

                    newReferralCreditValue = parseInt(oldReferralCreditValue) -
                      (parseInt(oldReferralCreditValue) <= parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));
                    // newReferralCreditValue = cBalObj.referralCreditValue
                    let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;

                    if (result.referralCreditValue <= cBal[0].referralCreditValue) {

                      let newCredits = new Credits({
                        memberId: senderId,
                        creditType: "debit",
                        status: "active",
                        referralCreditValue: newReferralCreditValue,
                        creditValue: creditVal,
                        cumulativeCreditValue: newCumulativeCreditValue,
                        remarks: "debited for video"
                      });
                      // Insert Into Credit Table
                      Credits.createCredits(newCredits, function (err, credits1) {
                        if (err) {
                          //res.send(err);
                        } else {
                          //console.log(credits1)
                          res.send({
                            message: "Credits updated successfully",
                            creditsData: credits1
                          });
                          celebrityContract.findOne(
                            { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                            function (err, CCresult) {
                              if (err) return res.send(err);
                              //console.log("CCresult", CCresult);
                              //console.log( Tresult[i].receiverId);
                              //let idC = Tresult[i].receiverId;
                              // start of credits
                              Credits.find(
                                { memberId: recieverId },
                                null,
                                { sort: { createdAt: -1 } },
                                function (err, cBal) {
                                  if (err) return res.send(err);
                                  if (cBal) {
                                    cBalObj = cBal[0];
                                    newReferralCreditValue = cBalObj.referralCreditValue;
                                    oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                    credits = creditVal;
                                    test2 = CCresult.sharingPercentage;
                                    test = credits * test2 / 100;
                                    ckCredits = credits - test;
                                    //console.log(test);
                                    newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                    let newCredits = new Credits({

                                      memberId: recieverId,
                                      creditType: "credit",
                                      creditValue: test,
                                      cumulativeCreditValue: newCumulativeCreditValue,
                                      referralCreditValue: newReferralCreditValue,
                                      //referralCreditValue: referralCreditValue,
                                      remarks: "Service Earnings",
                                      createdBy: "Admin"
                                    });
                                    // Insert Into Credit Table
                                    Credits.createCredits(newCredits, function (err, credits) {
                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // //console.log("credits updated" + credits)
                                        // let myBody = {};

                                        // myBody.refundStatus = "active";
                                        // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                        //   if (err) {
                                        //     //console.log(rStatus);

                                        //   } else {
                                        //   }
                                        // });

                                      }
                                    });
                                    let newPayCredits = new payCredits({
                                      memberId: recieverId,
                                      celebId: senderId,
                                      creditValue: credits,
                                      celebPercentage: test,
                                      celebKonnectPercentage: ckCredits,
                                      payType: serviceType
                                    });

                                    payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // res.json({
                                        //   message: "payCredits saved successfully",
                                        //   "payCredits": payCredits
                                        // });
                                      }
                                    });


                                  }
                                  else {
                                  }

                                }
                              ); //end of credits
                            }
                          ); //end of celeb contracts



                          // Update Cumulative Spent in User Object
                          User.findOne({ _id: senderId }, function (err, uResult) {
                            nId = uResult._id;
                            oldValue = parseInt(uResult.cumulativeSpent);
                            let newbody = {};
                            newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                            User.findByIdAndUpdate(nId, newbody, function (
                              err,
                              upResult
                            ) { });
                          });
                          // end of Update Cumulative Spent in User Object
                        }
                      });

                    } else {
                      console.log("34");
                      res.send({
                        error: "Insufficient credits to call. Please add credits.",
                        data: cBalObj
                      });

                    }




                    //////super


                  } else if ((cBal[0].cumulativeCreditValue > 0)) {
                    ///test

                    oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                    newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
                    newReferralCreditValue = cBalObj.referralCreditValue;
                    let newCredits = new Credits({
                      memberId: senderId,
                      creditType: "debit",
                      status: "active",
                      referralCreditValue: newReferralCreditValue,
                      creditValue: creditVal,
                      cumulativeCreditValue: newCumulativeCreditValue,
                      remarks: "debited for video"
                    });
                    // Insert Into Credit Table
                    Credits.createCredits(newCredits, function (err, credits1) {
                      if (err) {
                        //res.send(err);
                      } else {
                        //console.log(credits1)
                        res.send({
                          message: "Credits updated successfully",
                          creditsData: credits1
                        });

                        celebrityContract.findOne(
                          { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                          function (err, CCresult) {
                            if (err) return res.send(err);
                            //console.log("CCresult", CCresult);
                            //console.log( Tresult[i].receiverId);
                            //let idC = Tresult[i].receiverId;
                            // start of credits
                            Credits.find(
                              { memberId: recieverId },
                              null,
                              { sort: { createdAt: -1 } },
                              function (err, cBal) {
                                if (err) return res.send(err);
                                if (cBal) {
                                  cBalObj = cBal[0];
                                  newReferralCreditValue = cBalObj.referralCreditValue;
                                  oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                  credits = creditVal;
                                  test2 = CCresult.sharingPercentage;
                                  test = credits * test2 / 100;
                                  ckCredits = credits - test;
                                  //console.log(test);
                                  newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                  let newCredits = new Credits({

                                    memberId: recieverId,
                                    creditType: "credit",
                                    creditValue: test,
                                    cumulativeCreditValue: newCumulativeCreditValue,
                                    referralCreditValue: newReferralCreditValue,
                                    //referralCreditValue: referralCreditValue,
                                    remarks: "Service Earnings",
                                    createdBy: "Admin"
                                  });
                                  // Insert Into Credit Table
                                  Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                      //res.send(err);
                                    } else {
                                      // //console.log("credits updated" + credits)
                                      // let myBody = {};

                                      // myBody.refundStatus = "active";
                                      // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                      //   if (err) {
                                      //     //console.log(rStatus);

                                      //   } else {
                                      //   }
                                      // });

                                    }
                                  });
                                  let newPayCredits = new payCredits({
                                    memberId: recieverId,
                                    celebId: senderId,
                                    creditValue: credits,
                                    celebPercentage: test,
                                    celebKonnectPercentage: ckCredits,
                                    payType: serviceType
                                  });

                                  payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                    if (err) {
                                      //res.send(err);
                                    } else {
                                      // res.json({
                                      //   message: "payCredits saved successfully",
                                      //   "payCredits": payCredits
                                      // });
                                    }
                                  });


                                }
                                else {
                                }

                              }
                            ); //end of credits
                          }
                        ); //end of celeb contracts
                        // Update Cumulative Spent in User Object
                        User.findOne({ _id: senderId }, function (err, uResult) {
                          nId = uResult._id;
                          oldValue = parseInt(uResult.cumulativeSpent);
                          let newbody = {};
                          newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                          User.findByIdAndUpdate(nId, newbody, function (
                            err,
                            upResult
                          ) { });
                        });
                        // end of Update Cumulative Spent in User Object
                      }
                    });

                  }

                } else if ((cBal[0].cumulativeCreditValue > 0) && (cBal[0].cumulativeCreditValue >= parseInt(creditVal))) {
                  //console.log("dmsdsjdhhsds")
                  oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                  newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
                  newReferralCreditValue = cBalObj.referralCreditValue;
                  let newCredits = new Credits({
                    memberId: senderId,
                    creditType: "debit",
                    status: "active",
                    referralCreditValue: newReferralCreditValue,
                    creditValue: creditVal,
                    cumulativeCreditValue: newCumulativeCreditValue,
                    remarks: "debited for video"
                  });
                  // Insert Into Credit Table
                  Credits.createCredits(newCredits, function (err, credits1) {
                    if (err) {
                      //res.send(err);
                    } else {
                      //console.log(credits1)
                      res.send({
                        message: "Credits updated successfully",
                        creditsData: credits1
                      });
                      celebrityContract.findOne(
                        { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                        function (err, CCresult) {
                          if (err) return res.send(err);
                          //console.log("CCresult", CCresult);
                          //console.log( Tresult[i].receiverId);
                          //let idC = Tresult[i].receiverId;
                          // start of credits
                          Credits.find(
                            { memberId: recieverId },
                            null,
                            { sort: { createdAt: -1 } },
                            function (err, cBal) {
                              if (err) return res.send(err);
                              if (cBal) {
                                cBalObj = cBal[0];
                                newReferralCreditValue = cBalObj.referralCreditValue;
                                oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                credits = creditVal;
                                test2 = CCresult.sharingPercentage;
                                test = credits * test2 / 100;
                                ckCredits = credits - test;
                                //console.log(test);
                                newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                let newCredits = new Credits({

                                  memberId: recieverId,
                                  creditType: "credit",
                                  creditValue: test,
                                  cumulativeCreditValue: newCumulativeCreditValue,
                                  referralCreditValue: newReferralCreditValue,
                                  //referralCreditValue: referralCreditValue,
                                  remarks: "Service Earnings",
                                  createdBy: "Admin"
                                });
                                // Insert Into Credit Table
                                Credits.createCredits(newCredits, function (err, credits) {
                                  if (err) {
                                    //res.send(err);
                                  } else {
                                    // //console.log("credits updated" + credits)
                                    // let myBody = {};

                                    // myBody.refundStatus = "active";
                                    // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                    //   if (err) {
                                    //     //console.log(rStatus);

                                    //   } else {
                                    //   }
                                    // });

                                  }
                                });
                                let newPayCredits = new payCredits({
                                  memberId: recieverId,
                                  celebId: senderId,
                                  creditValue: credits,
                                  celebPercentage: test,
                                  celebKonnectPercentage: ckCredits,
                                  payType: serviceType
                                });

                                payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                  if (err) {
                                    //res.send(err);
                                  } else {
                                    // res.json({
                                    //   message: "payCredits saved successfully",
                                    //   "payCredits": payCredits
                                    // });
                                  }
                                });


                              }
                              else {
                              }

                            }
                          ); //end of credits
                        }
                      ); //end of celeb contracts
                      // Update Cumulative Spent in User Object
                      User.findOne({ _id: senderId }, function (err, uResult) {
                        nId = uResult._id;
                        oldValue = parseInt(uResult.cumulativeSpent);
                        let newbody = {};
                        newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                        User.findByIdAndUpdate(nId, newbody, function (
                          err,
                          upResult
                        ) { });
                      });
                      // end of Update Cumulative Spent in User Object
                    }
                  });

                } else {
                  console.log("2");
                  res.send({
                    error: "Insufficient credits to call. Please add credits.",
                    data: cBalObj
                  });

                }

                //res.send(result.referralCode);
                //referralCode.

              });


            });
          });

      } else if (Sresult.length <= 0) {

        //console.log("jhdsuhkdsd", Sresult);
        celebrityContract.findOne(
          { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
          function (err, CCresult) {
            if (err) return res.send(err);
            //console.log("Pa1", CCresult);
            let creditValue = CCresult.serviceCredits;
            //server schedules exits for that receiver credit value
            // currentDateTime
            // {}
            Credits.find(
              { memberId: senderId },
              null,
              { sort: { createdAt: -1 } },
              function (err, cBal) {
                //console.log(cBal)
                if (err) return res.send(err);
                if (cBal) {
                  //console.log("cBal",cBalObj)
                  cBalObj = cBal[0];
                  newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
                  //console.log(newResult);
                  // if(newResult <= creditValue){

                  // }
                  // if(cBal[0])
                  //console.log(cBal[0].cumulativeCreditValue)
                  //if ((cBal[0].cumulativeCreditValue < creditValue) && (cBal[0].referralCreditValue < creditValue))
                  if (newResult < creditValue) {
                    //console.log("Insufficiant credits:1");
                    //console.log("3");
                    res.send({
                      error: "Insufficient credits to call. Please add credits.",
                      data: cBalObj
                    });
                  } else {
                    //console.log("hsgdy");
                    User.findOne({ _id: senderId }, function (err, result) {

                      //res.send(result.referralCode);
                      referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
                        if (result) {
                          console.log(cBal[0].referralCreditValue);
                          if (cBal[0].referralCreditValue >= 0) {
                            //console.log("1", cBal[0].referralCreditValue);
                            oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                            oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
                            //console.log("1", cBal[0].referralCreditValue);

                            let callCostBalance = parseInt(creditValue) -
                              (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));

                            newReferralCreditValue = parseInt(oldReferralCreditValue) -
                              (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));
                            // newReferralCreditValue = cBalObj.referralCreditValue
                            let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;



                            let newCredits = new Credits({
                              memberId: senderId,
                              creditType: "debit",
                              status: "active",
                              referralCreditValue: newReferralCreditValue,
                              creditValue: creditValue,
                              cumulativeCreditValue: newCumulativeCreditValue,
                              remarks: "debited for video"
                            });
                            // Insert Into Credit Table
                            Credits.createCredits(newCredits, function (err, credits1) {
                              if (err) {
                                //res.send(err);
                              } else {
                                //console.log(credits1)
                                res.send({
                                  message: "Credits updated successfully",
                                  creditsData: credits1
                                });
                                celebrityContract.findOne(
                                  { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                                  function (err, CCresult) {
                                    if (err) return res.send(err);
                                    //console.log("CCresult", CCresult);
                                    //console.log( Tresult[i].receiverId);
                                    //let idC = Tresult[i].receiverId;
                                    // start of credits
                                    Credits.find(
                                      { memberId: recieverId },
                                      null,
                                      { sort: { createdAt: -1 } },
                                      function (err, cBal) {
                                        if (err) return res.send(err);
                                        if (cBal) {
                                          cBalObj = cBal[0];
                                          newReferralCreditValue = cBalObj.referralCreditValue;
                                          oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                          credits = creditValue;
                                          test2 = CCresult.sharingPercentage;
                                          test = credits * test2 / 100;
                                          ckCredits = credits - test;
                                          //console.log(test);
                                          newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                          let newCredits = new Credits({

                                            memberId: recieverId,
                                            creditType: "credit",
                                            creditValue: test,
                                            cumulativeCreditValue: newCumulativeCreditValue,
                                            referralCreditValue: newReferralCreditValue,
                                            //referralCreditValue: referralCreditValue,
                                            remarks: "Service Earnings",
                                            createdBy: "Admin"
                                          });
                                          // Insert Into Credit Table
                                          Credits.createCredits(newCredits, function (err, credits) {
                                            if (err) {
                                              //res.send(err);
                                            } else {
                                              // //console.log("credits updated" + credits)
                                              // let myBody = {};

                                              // myBody.refundStatus = "active";
                                              // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                              //   if (err) {
                                              //     //console.log(rStatus);

                                              //   } else {
                                              //   }
                                              // });

                                            }
                                          });
                                          let newPayCredits = new payCredits({
                                            memberId: recieverId,
                                            celebId: senderId,
                                            creditValue: credits,
                                            celebPercentage: test,
                                            celebKonnectPercentage: ckCredits,
                                            payType: serviceType
                                          });

                                          payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                            if (err) {
                                              //res.send(err);
                                            } else {
                                              // res.json({
                                              //   message: "payCredits saved successfully",
                                              //   "payCredits": payCredits
                                              // });
                                            }
                                          });


                                        }
                                        else {
                                        }

                                      }
                                    ); //end of credits
                                  }
                                ); //end of celeb contracts
                                // Update Cumulative Spent in User Object
                                User.findOne({ _id: senderId }, function (err, uResult) {
                                  nId = uResult._id;
                                  oldValue = parseInt(uResult.cumulativeSpent);
                                  let newbody = {};
                                  newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
                                  User.findByIdAndUpdate(nId, newbody, function (
                                    err,
                                    upResult
                                  ) { });
                                });
                                // end of Update Cumulative Spent in User Object
                              }
                            });

                            //////super


                          } else if ((cBal[0].cumulativeCreditValue > 0)) {
                            ///test

                            oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                            newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                            newReferralCreditValue = cBalObj.referralCreditValue;
                            let newCredits = new Credits({
                              memberId: senderId,
                              creditType: "debit",
                              status: "active",
                              referralCreditValue: newReferralCreditValue,
                              creditValue: creditValue,
                              cumulativeCreditValue: newCumulativeCreditValue,
                              remarks: "debited for video"
                            });
                            // Insert Into Credit Table
                            Credits.createCredits(newCredits, function (err, credits1) {
                              if (err) {
                                //res.send(err);
                              } else {
                                //console.log(credits1)
                                res.send({
                                  message: "Credits updated successfully",
                                  creditsData: credits1
                                });
                                celebrityContract.findOne(
                                  { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                                  function (err, CCresult) {
                                    if (err) return res.send(err);
                                    //console.log("CCresult", CCresult);
                                    //console.log( Tresult[i].receiverId);
                                    //let idC = Tresult[i].receiverId;
                                    // start of credits
                                    Credits.find(
                                      { memberId: recieverId },
                                      null,
                                      { sort: { createdAt: -1 } },
                                      function (err, cBal) {
                                        if (err) return res.send(err);
                                        if (cBal) {
                                          cBalObj = cBal[0];
                                          newReferralCreditValue = cBalObj.referralCreditValue;
                                          oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                          credits = creditValue;
                                          test2 = CCresult.sharingPercentage;
                                          test = credits * test2 / 100;
                                          ckCredits = credits - test;
                                          //console.log(test);
                                          newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                          let newCredits = new Credits({

                                            memberId: recieverId,
                                            creditType: "credit",
                                            creditValue: test,
                                            cumulativeCreditValue: newCumulativeCreditValue,
                                            referralCreditValue: newReferralCreditValue,
                                            //referralCreditValue: referralCreditValue,
                                            remarks: "Service Earnings",
                                            createdBy: "Admin"
                                          });
                                          // Insert Into Credit Table
                                          Credits.createCredits(newCredits, function (err, credits) {
                                            if (err) {
                                              //res.send(err);
                                            } else {
                                              // //console.log("credits updated" + credits)
                                              // let myBody = {};

                                              // myBody.refundStatus = "active";
                                              // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                              //   if (err) {
                                              //     //console.log(rStatus);

                                              //   } else {
                                              //   }
                                              // });

                                            }
                                          });
                                          let newPayCredits = new payCredits({
                                            memberId: recieverId,
                                            celebId: senderId,
                                            creditValue: credits,
                                            celebPercentage: test,
                                            celebKonnectPercentage: ckCredits,
                                            payType: serviceType
                                          });

                                          payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                            if (err) {
                                              //res.send(err);
                                            } else {
                                              // res.json({
                                              //   message: "payCredits saved successfully",
                                              //   "payCredits": payCredits
                                              // });
                                            }
                                          });


                                        }
                                        else {
                                        }

                                      }
                                    ); //end of credits
                                  }
                                ); //end of celeb contracts
                                // Update Cumulative Spent in User Object
                                User.findOne({ _id: senderId }, function (err, uResult) {
                                  nId = uResult._id;
                                  oldValue = parseInt(uResult.cumulativeSpent);
                                  let newbody = {};
                                  newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
                                  User.findByIdAndUpdate(nId, newbody, function (
                                    err,
                                    upResult
                                  ) { });
                                });
                                // end of Update Cumulative Spent in User Object
                              }
                            });

                          }

                        } else if ((cBal[0].cumulativeCreditValue > 0) && (cBal[0].cumulativeCreditValue >= parseInt(creditValue))) {
                          //console.log("dmsdsjdhhsds")
                          oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                          newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                          newReferralCreditValue = cBalObj.referralCreditValue;
                          let newCredits = new Credits({
                            memberId: senderId,
                            creditType: "debit",
                            status: "active",
                            referralCreditValue: newReferralCreditValue,
                            creditValue: creditValue,
                            cumulativeCreditValue: newCumulativeCreditValue,
                            remarks: "debited for video"
                          });
                          // Insert Into Credit Table
                          Credits.createCredits(newCredits, function (err, credits1) {
                            if (err) {
                              //res.send(err);
                            } else {
                              //console.log(credits1)
                              res.send({
                                message: "Credits updated successfully",
                                creditsData: credits1
                              });
                              celebrityContract.findOne(
                                { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                                function (err, CCresult) {
                                  if (err) return res.send(err);
                                  //console.log("CCresult", CCresult);
                                  //console.log( Tresult[i].receiverId);
                                  //let idC = Tresult[i].receiverId;
                                  // start of credits
                                  Credits.find(
                                    { memberId: recieverId },
                                    null,
                                    { sort: { createdAt: -1 } },
                                    function (err, cBal) {
                                      if (err) return res.send(err);
                                      if (cBal) {
                                        cBalObj = cBal[0];
                                        newReferralCreditValue = cBalObj.referralCreditValue;
                                        oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                        credits = creditValue;
                                        test2 = CCresult.sharingPercentage;
                                        test = credits * test2 / 100;
                                        ckCredits = credits - test;
                                        //console.log(test);
                                        newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                        let newCredits = new Credits({

                                          memberId: recieverId,
                                          creditType: "credit",
                                          creditValue: test,
                                          cumulativeCreditValue: newCumulativeCreditValue,
                                          referralCreditValue: newReferralCreditValue,
                                          //referralCreditValue: referralCreditValue,
                                          remarks: "Service Earnings",
                                          createdBy: "Admin"
                                        });
                                        // Insert Into Credit Table
                                        Credits.createCredits(newCredits, function (err, credits) {
                                          if (err) {
                                            //res.send(err);
                                          } else {
                                            // //console.log("credits updated" + credits)
                                            // let myBody = {};

                                            // myBody.refundStatus = "active";
                                            // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                            //   if (err) {
                                            //     //console.log(rStatus);

                                            //   } else {
                                            //   }
                                            // });

                                          }
                                        });
                                        let newPayCredits = new payCredits({
                                          memberId: recieverId,
                                          celebId: senderId,
                                          creditValue: credits,
                                          celebPercentage: test,
                                          celebKonnectPercentage: ckCredits,
                                          payType: serviceType
                                        });

                                        payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                          if (err) {
                                            //res.send(err);
                                          } else {
                                            // res.json({
                                            //   message: "payCredits saved successfully",
                                            //   "payCredits": payCredits
                                            // });
                                          }
                                        });


                                      }
                                      else {
                                      }

                                    }
                                  ); //end of credits
                                }
                              ); //end of celeb contracts
                              // Update Cumulative Spent in User Object
                              User.findOne({ _id: senderId }, function (err, uResult) {
                                nId = uResult._id;
                                oldValue = parseInt(uResult.cumulativeSpent);
                                let newbody = {};
                                newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
                                User.findByIdAndUpdate(nId, newbody, function (
                                  err,
                                  upResult
                                ) { });
                              });
                              // end of Update Cumulative Spent in User Object
                            }
                          });

                        } else {
                          console.log("4");
                          res.send({
                            error: "Insufficient credits to call. Please add credits.",
                            data: cBalObj
                          });

                        }

                        //res.send(result.referralCode);
                        //referralCode.

                      });


                    });

                  }// End of referral credits
                } else {
                  // console.log("credits not exists");
                }
              }
            ).sort({ createdAt: -1 }); // End of Create Credits

          });
      }
    });
});


// End of get Credit Balance By MemberID


// get Credit Balance By MemberID
router.get("/getBlockCheck/:memberId/:celebId", function (req, res) {
  let id = ObjectId(req.params.memberId);
  let id1 = ObjectId(req.params.celebId);

  let query = {
    $and: [{ reason: "Block/Report" }, { celebrityId: ObjectId(id1) }, { memberId: ObjectId(id) }]
  };
  //console.log("T1",query);
  feedbackModel.find(query, function (err, Fresult) {
    //console.log("Fresult", Fresult);
    if (Fresult.length > 0) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });

    } else {
      let query = {
        $and: [{ callRemarks: "Block/Report" }, { receiverId: id1 }, { senderId: id }]
      };
      serviceTransaction.find(query, function (err, result) {
        if (result.length > 0) {
          res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
        } else {
          Credits.find({
            memberId: id
          }, null, {
              sort: {
                createdAt: -1
              }
            }, function (
              err,
              result
            ) {
              if (err) return res.send(err);
              if (result) {
                User.findOne({
                  _id: id
                }, function (err, uResult) {
                  if (uResult) {
                    //console.log(uResult.celebCredits)
                    let newCelebCredits;
                    if ((uResult.refCreditValue == "")) {
                      newCelebCredits = 0
                    } else {
                      newCelebCredits = uResult.celebCredits;
                    }
                    let data = {};
                    data._id = result[0]._id;
                    data.memberId = result[0].memberId;
                    data.__v = result[0].__v;
                    data.updatedBy = result[0].updatedBy;
                    data.createdBy = result[0].createdBy;
                    data.updatedAt = result[0].updatedAt;
                    data.createdAt = result[0].createdAt;
                    data.status = result[0].status;
                    data.couponCode = result[0].couponCode;
                    data.remarks = result[0].remarks;
                    data.referralCreditValue = result[0].referralCreditValue;
                    data.cumulativeCreditValue = result[0].cumulativeCreditValue;
                    data.creditValue = result[0].creditValue;
                    data.creditType = result[0].creditType;
                    data.celebCredits = newCelebCredits;
                    res.json({ token: req.headers['x-access-token'], success: 1, data: data });

                    // res.json({
                    //   "_id": result[0]._id,
                    //   "memberId": result[0].memberId,
                    //   "__v": result[0].__v,
                    //   "updatedBy": result[0].updatedBy,
                    //   "createdBy": result[0].createdBy,
                    //   "updatedAt": result[0].updatedAt,
                    //   "createdAt": result[0].createdAt,
                    //   "status": result[0].status,
                    //   "couponCode": result[0].couponCode,
                    //   "remarks": result[0].remarks,
                    //   "referralCreditValue": result[0].referralCreditValue,
                    //   "cumulativeCreditValue": result[0].cumulativeCreditValue,
                    //   "creditValue": result[0].creditValue,
                    //   "creditType": result[0].creditType,
                    //   "celebCredits": newCelebCredits
                    // });
                  }

                });

              } else {
                res.json({ token: req.headers['x-access-token'], success: 0, message: "Credits not exits / send a valid memberId" });
              }
            });

        }
      });



    }

  });

});
// End of get Credit Balance By MemberID


// get Credit Balance By UserID for video/audio
router.post("/getCreditBalanceByUserID", function (req, res) {
  let senderId = req.body.senderId;
  let recieverId = req.body.recieverId;
  let serviceType = req.body.serviceType;
  currenttime = new Date(Date.now());
  var nextDay = new Date(currenttime);
  nextDay.setDate(currenttime.getDate() + 1);
  //console.log(currenttime);
  //console.log(nextDay)

  //console.log(currenttime);
  //console.log(nextDay);
  slotMaster.aggregate(
    [
      {
        $match: {
          $and: [
            { memberId: ObjectId(recieverId) },
            //{ "scheduleArray.scheduleStartTime": { $gte: new Date(currenttime), $lt: new Date(nextDay) } },
            //{  "scheduleArray.scheduleEndTime": { $gte: new Date(currenttime), $lt: new Date(nextDay) } },
            {
              startTime: {
                $gte: currenttime,
                $lt: nextDay
              }
            }
          ]
        }
      }
    ],
    function (err, Sresult) {
      //console.log("bssss:1",Sresult[0].scheduleArray[0].creditValue)
      if (err) {

        //res.send(err);
      }

      if (Sresult.length > 0) {
        //console.log(Sresult);
        creditVal = Sresult[0].scheduleArray[0].creditValue;
        //console.log("Pa1", creditVal)

        Credits.find(
          { memberId: senderId },
          null,
          { sort: { createdAt: -1 } },
          function (err, cBal) {
            //console.log(cBal)
            if (err) return res.send(err);
            //if (cBal) {
            cBalObj = cBal[0];
            newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
            //}
            //console.log("senderId",senderId)
            User.findOne({ _id: senderId }, function (err, result) {
              //console.log("result", result.celebCredits);
              cCredtis = result.celebCredits;
              P1 = cCredtis.split('-');
              celebID = P1[1];
              cB = P1[0];
              //console.log("P1", celebID);
              if (recieverId == celebID) {
                //console.log("test");

                //res.send(result.referralCode);
                referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
                  if (result) {
                    //console.log(cBal[0].referralCreditValue);
                    if (cBal[0].referralCreditValue >= 0) {
                      //console.log("1", cBal[0].referralCreditValue);
                      oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                      oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
                      //console.log("1", cBal[0].referralCreditValue);

                      let callCostBalance = parseInt(creditVal) -
                        (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));

                      newReferralCreditValue = parseInt(oldReferralCreditValue) -
                        (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));
                      // newReferralCreditValue = cBalObj.referralCreditValue
                      let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;



                      let newCredits = new Credits({
                        memberId: senderId,
                        creditType: "debit",
                        status: "active",
                        referralCreditValue: newReferralCreditValue,
                        creditValue: creditVal,
                        cumulativeCreditValue: newCumulativeCreditValue,
                        remarks: "debited for video"
                      });
                      // Insert Into Credit Table
                      Credits.createCredits(newCredits, function (err, credits1) {
                        if (err) {
                          //res.send(err);
                        } else {
                          //console.log(credits1)
                          res.send({
                            message: "Credits updated successfully",
                            creditsData: credits1
                          });
                          celebrityContract.findOne(
                            { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                            function (err, CCresult) {
                              if (err) return res.send(err);
                              //console.log("CCresult", CCresult);
                              //console.log( Tresult[i].receiverId);
                              //let idC = Tresult[i].receiverId;
                              // start of credits
                              Credits.find(
                                { memberId: recieverId },
                                null,
                                { sort: { createdAt: -1 } },
                                function (err, cBal) {
                                  if (err) return res.send(err);
                                  if (cBal) {
                                    cBalObj = cBal[0];
                                    newReferralCreditValue = cBalObj.referralCreditValue;
                                    oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                    credits = creditVal;
                                    test2 = CCresult.sharingPercentage;
                                    test = credits * test2 / 100;
                                    ckCredits = credits - test;
                                    //console.log(test);
                                    newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                    let newCredits = new Credits({

                                      memberId: recieverId,
                                      creditType: "credit",
                                      creditValue: test,
                                      cumulativeCreditValue: newCumulativeCreditValue,
                                      referralCreditValue: newReferralCreditValue,
                                      //referralCreditValue: referralCreditValue,
                                      remarks: "Service Earnings",
                                      createdBy: "Admin"
                                    });
                                    // Insert Into Credit Table
                                    Credits.createCredits(newCredits, function (err, credits) {
                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // //console.log("credits updated" + credits)
                                        // let myBody = {};

                                        // myBody.refundStatus = "active";
                                        // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                        //   if (err) {
                                        //     //console.log(rStatus);

                                        //   } else {
                                        //   }
                                        // });

                                      }
                                    });
                                    let newPayCredits = new payCredits({
                                      memberId: recieverId,
                                      celebId: senderId,
                                      creditValue: credits,
                                      celebPercentage: test,
                                      celebKonnectPercentage: ckCredits,
                                      payType: serviceType
                                    });

                                    payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // res.json({
                                        //   message: "payCredits saved successfully",
                                        //   "payCredits": payCredits
                                        // });
                                      }
                                    });


                                  }
                                  else {
                                  }

                                }
                              ); //end of credits
                            }
                          ); //end of celeb contracts



                          // Update Cumulative Spent in User Object
                          User.findOne({ _id: senderId }, function (err, uResult) {
                            nId = uResult._id;
                            oldValue = parseInt(uResult.cumulativeSpent);
                            let newbody = {};
                            newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                            User.findByIdAndUpdate(nId, newbody, function (
                              err,
                              upResult
                            ) { });
                          });
                          // end of Update Cumulative Spent in User Object
                        }
                      });

                      //////super


                    } else if ((cBal[0].cumulativeCreditValue > 0)) {
                      ///test

                      oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                      newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
                      newReferralCreditValue = cBalObj.referralCreditValue;
                      let newCredits = new Credits({
                        memberId: senderId,
                        creditType: "debit",
                        status: "active",
                        referralCreditValue: newReferralCreditValue,
                        creditValue: creditVal,
                        cumulativeCreditValue: newCumulativeCreditValue,
                        remarks: "debited for video"
                      });
                      // Insert Into Credit Table
                      Credits.createCredits(newCredits, function (err, credits1) {
                        if (err) {
                          //res.send(err);
                        } else {
                          //console.log(credits1)
                          res.send({
                            message: "Credits updated successfully",
                            creditsData: credits1
                          });

                          celebrityContract.findOne(
                            { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                            function (err, CCresult) {
                              if (err) return res.send(err);
                              //console.log("CCresult", CCresult);
                              //console.log( Tresult[i].receiverId);
                              //let idC = Tresult[i].receiverId;
                              // start of credits
                              Credits.find(
                                { memberId: recieverId },
                                null,
                                { sort: { createdAt: -1 } },
                                function (err, cBal) {
                                  if (err) return res.send(err);
                                  if (cBal) {
                                    cBalObj = cBal[0];
                                    newReferralCreditValue = cBalObj.referralCreditValue;
                                    oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                    credits = creditVal;
                                    test2 = CCresult.sharingPercentage;
                                    test = credits * test2 / 100;
                                    ckCredits = credits - test;
                                    //console.log(test);
                                    newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                    let newCredits = new Credits({

                                      memberId: recieverId,
                                      creditType: "credit",
                                      creditValue: test,
                                      cumulativeCreditValue: newCumulativeCreditValue,
                                      referralCreditValue: newReferralCreditValue,
                                      //referralCreditValue: referralCreditValue,
                                      remarks: "Service Earnings",
                                      createdBy: "Admin"
                                    });
                                    // Insert Into Credit Table
                                    Credits.createCredits(newCredits, function (err, credits) {
                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // //console.log("credits updated" + credits)
                                        // let myBody = {};

                                        // myBody.refundStatus = "active";
                                        // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                        //   if (err) {
                                        //     //console.log(rStatus);

                                        //   } else {
                                        //   }
                                        // });

                                      }
                                    });
                                    let newPayCredits = new payCredits({
                                      memberId: recieverId,
                                      celebId: senderId,
                                      creditValue: credits,
                                      celebPercentage: test,
                                      celebKonnectPercentage: ckCredits,
                                      payType: serviceType
                                    });

                                    payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // res.json({
                                        //   message: "payCredits saved successfully",
                                        //   "payCredits": payCredits
                                        // });
                                      }
                                    });


                                  }
                                  else {
                                  }

                                }
                              ); //end of credits
                            }
                          ); //end of celeb contracts
                          // Update Cumulative Spent in User Object
                          User.findOne({ _id: senderId }, function (err, uResult) {
                            nId = uResult._id;
                            oldValue = parseInt(uResult.cumulativeSpent);
                            let newbody = {};
                            newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                            User.findByIdAndUpdate(nId, newbody, function (
                              err,
                              upResult
                            ) { });
                          });
                          // end of Update Cumulative Spent in User Object
                        }
                      });

                    }

                  } else if ((cBal[0].cumulativeCreditValue > 0) && ((cBal[0].cumulativeCreditValue = parseInt(creditVal)) || (cBal[0].cumulativeCreditValue > parseInt(creditVal)))) {
                    console.log("dmsdsjdhhsds")
                    oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                    newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
                    newReferralCreditValue = cBalObj.referralCreditValue;
                    let newCredits = new Credits({
                      memberId: senderId,
                      creditType: "debit",
                      status: "active",
                      referralCreditValue: newReferralCreditValue,
                      creditValue: creditVal,
                      cumulativeCreditValue: newCumulativeCreditValue,
                      remarks: "debited for video"
                    });
                    // Insert Into Credit Table
                    Credits.createCredits(newCredits, function (err, credits1) {
                      if (err) {
                        //res.send(err);
                      } else {
                        //console.log(credits1)
                        res.send({
                          message: "Credits updated successfully",
                          creditsData: credits1
                        });
                        celebrityContract.findOne(
                          { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                          function (err, CCresult) {
                            if (err) return res.send(err);
                            //console.log("CCresult", CCresult);
                            //console.log( Tresult[i].receiverId);
                            //let idC = Tresult[i].receiverId;
                            // start of credits
                            Credits.find(
                              { memberId: recieverId },
                              null,
                              { sort: { createdAt: -1 } },
                              function (err, cBal) {
                                if (err) return res.send(err);
                                if (cBal) {
                                  cBalObj = cBal[0];
                                  newReferralCreditValue = cBalObj.referralCreditValue;
                                  oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                  credits = creditVal;
                                  test2 = CCresult.sharingPercentage;
                                  test = credits * test2 / 100;
                                  ckCredits = credits - test;
                                  //console.log(test);
                                  newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                  let newCredits = new Credits({

                                    memberId: recieverId,
                                    creditType: "credit",
                                    creditValue: test,
                                    cumulativeCreditValue: newCumulativeCreditValue,
                                    referralCreditValue: newReferralCreditValue,
                                    //referralCreditValue: referralCreditValue,
                                    remarks: "Service Earnings",
                                    createdBy: "Admin"
                                  });
                                  // Insert Into Credit Table
                                  Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                      //res.send(err);
                                    } else {
                                      // //console.log("credits updated" + credits)
                                      // let myBody = {};

                                      // myBody.refundStatus = "active";
                                      // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                      //   if (err) {
                                      //     //console.log(rStatus);

                                      //   } else {
                                      //   }
                                      // });

                                    }
                                  });
                                  let newPayCredits = new payCredits({
                                    memberId: recieverId,
                                    celebId: senderId,
                                    creditValue: credits,
                                    celebPercentage: test,
                                    celebKonnectPercentage: ckCredits,
                                    payType: serviceType
                                  });

                                  payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                    if (err) {
                                      //res.send(err);
                                    } else {
                                      // res.json({
                                      //   message: "payCredits saved successfully",
                                      //   "payCredits": payCredits
                                      // });
                                    }
                                  });


                                }
                                else {
                                }

                              }
                            ); //end of credits
                          }
                        ); //end of celeb contracts
                        // Update Cumulative Spent in User Object
                        User.findOne({ _id: senderId }, function (err, uResult) {
                          nId = uResult._id;
                          oldValue = parseInt(uResult.cumulativeSpent);
                          let newbody = {};
                          newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                          User.findByIdAndUpdate(nId, newbody, function (
                            err,
                            upResult
                          ) { });
                        });
                        // end of Update Cumulative Spent in User Object
                      }
                    });

                  } else {
                    console.log("10");
                    res.send({
                      error: "Insufficient credits to call. Please add credits.",
                      data: cBalObj
                    });

                  }

                  //res.send(result.referralCode);
                  //referralCode.

                });

              } else {
                console.log("9");
                referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
                  if (result) {
                    //console.log(cBal[0].referralCreditValue);
                    if (cBal[0].referralCreditValue >= 0) {
                      //console.log("1", cBal[0].referralCreditValue);
                      oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                      oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
                      //console.log("1", cBal[0].referralCreditValue);

                      let callCostBalance = parseInt(creditVal) -
                        (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));

                      newReferralCreditValue = parseInt(oldReferralCreditValue) -
                        (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));
                      // newReferralCreditValue = cBalObj.referralCreditValue
                      let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;



                      let newCredits = new Credits({
                        memberId: senderId,
                        creditType: "debit",
                        status: "active",
                        referralCreditValue: newReferralCreditValue,
                        creditValue: creditVal,
                        cumulativeCreditValue: newCumulativeCreditValue,
                        remarks: "debited for video"
                      });
                      // Insert Into Credit Table
                      Credits.createCredits(newCredits, function (err, credits1) {
                        if (err) {
                          //res.send(err);
                        } else {
                          //console.log(credits1)
                          res.send({
                            message: "Credits updated successfully",
                            creditsData: credits1
                          });
                          celebrityContract.findOne(
                            { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                            function (err, CCresult) {
                              if (err) return res.send(err);
                              //console.log("CCresult", CCresult);
                              //console.log( Tresult[i].receiverId);
                              //let idC = Tresult[i].receiverId;
                              // start of credits
                              Credits.find(
                                { memberId: recieverId },
                                null,
                                { sort: { createdAt: -1 } },
                                function (err, cBal) {
                                  if (err) return res.send(err);
                                  if (cBal) {
                                    cBalObj = cBal[0];
                                    newReferralCreditValue = cBalObj.referralCreditValue;
                                    oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                    credits = creditVal;
                                    test2 = CCresult.sharingPercentage;
                                    test = credits * test2 / 100;
                                    ckCredits = credits - test;
                                    //console.log(test);
                                    newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                    let newCredits = new Credits({

                                      memberId: recieverId,
                                      creditType: "credit",
                                      creditValue: test,
                                      cumulativeCreditValue: newCumulativeCreditValue,
                                      referralCreditValue: newReferralCreditValue,
                                      //referralCreditValue: referralCreditValue,
                                      remarks: "Service Earnings",
                                      createdBy: "Admin"
                                    });
                                    // Insert Into Credit Table
                                    Credits.createCredits(newCredits, function (err, credits) {
                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // //console.log("credits updated" + credits)
                                        // let myBody = {};

                                        // myBody.refundStatus = "active";
                                        // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                        //   if (err) {
                                        //     //console.log(rStatus);

                                        //   } else {
                                        //   }
                                        // });

                                      }
                                    });
                                    let newPayCredits = new payCredits({
                                      memberId: recieverId,
                                      celebId: senderId,
                                      creditValue: credits,
                                      celebPercentage: test,
                                      celebKonnectPercentage: ckCredits,
                                      payType: serviceType
                                    });

                                    payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // res.json({
                                        //   message: "payCredits saved successfully",
                                        //   "payCredits": payCredits
                                        // });
                                      }
                                    });


                                  }
                                  else {
                                  }

                                }
                              ); //end of credits
                            }
                          ); //end of celeb contracts



                          // Update Cumulative Spent in User Object
                          User.findOne({ _id: senderId }, function (err, uResult) {
                            nId = uResult._id;
                            oldValue = parseInt(uResult.cumulativeSpent);
                            let newbody = {};
                            newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                            User.findByIdAndUpdate(nId, newbody, function (
                              err,
                              upResult
                            ) { });
                          });
                          // end of Update Cumulative Spent in User Object
                        }
                      });

                      //////super


                    } else if ((cBal[0].cumulativeCreditValue > 0)) {
                      ///test

                      oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                      newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
                      newReferralCreditValue = cBalObj.referralCreditValue;
                      let newCredits = new Credits({
                        memberId: senderId,
                        creditType: "debit",
                        status: "active",
                        referralCreditValue: newReferralCreditValue,
                        creditValue: creditVal,
                        cumulativeCreditValue: newCumulativeCreditValue,
                        remarks: "debited for video"
                      });
                      // Insert Into Credit Table
                      Credits.createCredits(newCredits, function (err, credits1) {
                        if (err) {
                          //res.send(err);
                        } else {
                          //console.log(credits1)
                          res.send({
                            message: "Credits updated successfully",
                            creditsData: credits1
                          });

                          celebrityContract.findOne(
                            { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                            function (err, CCresult) {
                              if (err) return res.send(err);
                              //console.log("CCresult", CCresult);
                              //console.log( Tresult[i].receiverId);
                              //let idC = Tresult[i].receiverId;
                              // start of credits
                              Credits.find(
                                { memberId: recieverId },
                                null,
                                { sort: { createdAt: -1 } },
                                function (err, cBal) {
                                  if (err) return res.send(err);
                                  if (cBal) {
                                    cBalObj = cBal[0];
                                    newReferralCreditValue = cBalObj.referralCreditValue;
                                    oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                    credits = creditVal;
                                    test2 = CCresult.sharingPercentage;
                                    test = credits * test2 / 100;
                                    ckCredits = credits - test;
                                    //console.log(test);
                                    newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                    let newCredits = new Credits({

                                      memberId: recieverId,
                                      creditType: "credit",
                                      creditValue: test,
                                      cumulativeCreditValue: newCumulativeCreditValue,
                                      referralCreditValue: newReferralCreditValue,
                                      //referralCreditValue: referralCreditValue,
                                      remarks: "Service Earnings",
                                      createdBy: "Admin"
                                    });
                                    // Insert Into Credit Table
                                    Credits.createCredits(newCredits, function (err, credits) {
                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // //console.log("credits updated" + credits)
                                        // let myBody = {};

                                        // myBody.refundStatus = "active";
                                        // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                        //   if (err) {
                                        //     //console.log(rStatus);

                                        //   } else {
                                        //   }
                                        // });

                                      }
                                    });
                                    let newPayCredits = new payCredits({
                                      memberId: recieverId,
                                      celebId: senderId,
                                      creditValue: credits,
                                      celebPercentage: test,
                                      celebKonnectPercentage: ckCredits,
                                      payType: serviceType
                                    });

                                    payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                      if (err) {
                                        //res.send(err);
                                      } else {
                                        // res.json({
                                        //   message: "payCredits saved successfully",
                                        //   "payCredits": payCredits
                                        // });
                                      }
                                    });


                                  }
                                  else {
                                  }

                                }
                              ); //end of credits
                            }
                          ); //end of celeb contracts
                          // Update Cumulative Spent in User Object
                          User.findOne({ _id: senderId }, function (err, uResult) {
                            nId = uResult._id;
                            oldValue = parseInt(uResult.cumulativeSpent);
                            let newbody = {};
                            newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                            User.findByIdAndUpdate(nId, newbody, function (
                              err,
                              upResult
                            ) { });
                          });
                          // end of Update Cumulative Spent in User Object
                        }
                      });

                    }

                  } else if ((cBal[0].cumulativeCreditValue > 0) && ((cBal[0].cumulativeCreditValue = parseInt(creditVal)) || (cBal[0].cumulativeCreditValue > parseInt(creditVal)))) {
                    console.log("dmsdsjdhhsds")
                    oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                    newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
                    newReferralCreditValue = cBalObj.referralCreditValue;
                    let newCredits = new Credits({
                      memberId: senderId,
                      creditType: "debit",
                      status: "active",
                      referralCreditValue: newReferralCreditValue,
                      creditValue: creditVal,
                      cumulativeCreditValue: newCumulativeCreditValue,
                      remarks: "debited for video"
                    });
                    // Insert Into Credit Table
                    Credits.createCredits(newCredits, function (err, credits1) {
                      if (err) {
                        //res.send(err);
                      } else {
                        //console.log(credits1)
                        res.send({
                          message: "Credits updated successfully",
                          creditsData: credits1
                        });
                        celebrityContract.findOne(
                          { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                          function (err, CCresult) {
                            if (err) return res.send(err);
                            //console.log("CCresult", CCresult);
                            //console.log( Tresult[i].receiverId);
                            //let idC = Tresult[i].receiverId;
                            // start of credits
                            Credits.find(
                              { memberId: recieverId },
                              null,
                              { sort: { createdAt: -1 } },
                              function (err, cBal) {
                                if (err) return res.send(err);
                                if (cBal) {
                                  cBalObj = cBal[0];
                                  newReferralCreditValue = cBalObj.referralCreditValue;
                                  oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                  credits = creditVal;
                                  test2 = CCresult.sharingPercentage;
                                  test = credits * test2 / 100;
                                  ckCredits = credits - test;
                                  //console.log(test);
                                  newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                  let newCredits = new Credits({

                                    memberId: recieverId,
                                    creditType: "credit",
                                    creditValue: test,
                                    cumulativeCreditValue: newCumulativeCreditValue,
                                    referralCreditValue: newReferralCreditValue,
                                    //referralCreditValue: referralCreditValue,
                                    remarks: "Service Earnings",
                                    createdBy: "Admin"
                                  });
                                  // Insert Into Credit Table
                                  Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                      //res.send(err);
                                    } else {
                                      // //console.log("credits updated" + credits)
                                      // let myBody = {};

                                      // myBody.refundStatus = "active";
                                      // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                      //   if (err) {
                                      //     //console.log(rStatus);

                                      //   } else {
                                      //   }
                                      // });

                                    }
                                  });
                                  let newPayCredits = new payCredits({
                                    memberId: recieverId,
                                    celebId: senderId,
                                    creditValue: credits,
                                    celebPercentage: test,
                                    celebKonnectPercentage: ckCredits,
                                    payType: serviceType
                                  });

                                  payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                    if (err) {
                                      //res.send(err);
                                    } else {
                                      // res.json({
                                      //   message: "payCredits saved successfully",
                                      //   "payCredits": payCredits
                                      // });
                                    }
                                  });


                                }
                                else {
                                }

                              }
                            ); //end of credits
                          }
                        ); //end of celeb contracts
                        // Update Cumulative Spent in User Object
                        User.findOne({ _id: senderId }, function (err, uResult) {
                          nId = uResult._id;
                          oldValue = parseInt(uResult.cumulativeSpent);
                          let newbody = {};
                          newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
                          User.findByIdAndUpdate(nId, newbody, function (
                            err,
                            upResult
                          ) { });
                        });
                        // end of Update Cumulative Spent in User Object
                      }
                    });

                  } else {
                    console.log("10");
                    res.send({
                      error: "Insufficient credits to call. Please add credits.",
                      data: cBalObj
                    });

                  }

                  //res.send(result.referralCode);
                  //referralCode.

                });
                res.send({
                  error: "Insufficient credits to call. Please add credits.",
                  data: cBalObj
                });

              }
            });
          });

      } else if (Sresult.length <= 0) {

        //console.log("jhdsuhkdsd", Sresult);
        celebrityContract.findOne(
          { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
          function (err, CCresult) {
            if (err) return res.send(err);
            //console.log("Pa1", CCresult.serviceCredits);
            let creditValue = CCresult.serviceCredits;
            //server schedules exits for that receiver credit value
            // currentDateTime
            // {}
            Credits.find(
              { memberId: senderId },
              null,
              { sort: { createdAt: -1 } },
              function (err, cBal) {
                //console.log(cBal)
                if (err) return res.send(err);
                if (cBal) {
                  cBalObj = cBal[0];
                  newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
                  console.log("newResult", newResult);
                  // if(newResult <= creditValue){

                  // }
                  // if(cBal[0])
                  //console.log(cBal[0].cumulativeCreditValue)
                  //if ((cBal[0].cumulativeCreditValue < creditValue) && (cBal[0].referralCreditValue < creditValue))
                  if (newResult <= creditValue) {
                    console.log("Insufficiant credits:1");
                    res.send({
                      error: "Insufficient credits to call. Please add credits.",
                      data: cBalObj
                    });
                  } else {
                    User.findOne({ _id: senderId }, function (err, result) {
                      //console.log("result.referralCode",result.celebCredits)
                      cCredtis = result.celebCredits;
                      P1 = cCredtis.split('-');
                      celebID = P1[1];
                      //console.log("1P1", celebID);
                      cB = P1[0];
                      if (recieverId == celebID) {
                        //console.log("test");
                        referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
                          if (result) {
                            //console.log(cBal[0].referralCreditValue);
                            if (cBal[0].referralCreditValue >= 0) {
                              //console.log("1", cBal[0].referralCreditValue);
                              oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                              oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
                              //console.log("1", cBal[0].referralCreditValue);

                              let callCostBalance = parseInt(creditValue) -
                                (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));

                              newReferralCreditValue = parseInt(oldReferralCreditValue) -
                                (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));
                              // newReferralCreditValue = cBalObj.referralCreditValue
                              let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;



                              let newCredits = new Credits({
                                memberId: senderId,
                                creditType: "debit",
                                status: "active",
                                referralCreditValue: newReferralCreditValue,
                                creditValue: creditValue,
                                cumulativeCreditValue: newCumulativeCreditValue,
                                remarks: "debited for video"
                              });
                              // Insert Into Credit Table
                              Credits.createCredits(newCredits, function (err, credits1) {
                                if (err) {
                                  //res.send(err);
                                } else {
                                  //console.log(credits1)
                                  res.send({
                                    message: "Credits updated successfully",
                                    creditsData: credits1
                                  });
                                  celebrityContract.findOne(
                                    { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                                    function (err, CCresult) {
                                      if (err) return res.send(err);
                                      //console.log("CCresult", CCresult);
                                      //console.log( Tresult[i].receiverId);
                                      //let idC = Tresult[i].receiverId;
                                      // start of credits
                                      Credits.find(
                                        { memberId: recieverId },
                                        null,
                                        { sort: { createdAt: -1 } },
                                        function (err, cBal) {
                                          if (err) return res.send(err);
                                          if (cBal) {
                                            cBalObj = cBal[0];
                                            newReferralCreditValue = cBalObj.referralCreditValue;
                                            oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                            credits = creditValue;
                                            test2 = CCresult.sharingPercentage;
                                            test = credits * test2 / 100;
                                            ckCredits = credits - test;
                                            //console.log(test);
                                            newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                            let newCredits = new Credits({

                                              memberId: recieverId,
                                              creditType: "credit",
                                              creditValue: test,
                                              cumulativeCreditValue: newCumulativeCreditValue,
                                              referralCreditValue: newReferralCreditValue,
                                              //referralCreditValue: referralCreditValue,
                                              remarks: "Service Earnings",
                                              createdBy: "Admin"
                                            });
                                            // Insert Into Credit Table
                                            Credits.createCredits(newCredits, function (err, credits) {
                                              if (err) {
                                                //res.send(err);
                                              } else {
                                                // //console.log("credits updated" + credits)
                                                // let myBody = {};

                                                // myBody.refundStatus = "active";
                                                // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                                //   if (err) {
                                                //     //console.log(rStatus);

                                                //   } else {
                                                //   }
                                                // });

                                              }
                                            });
                                            let newPayCredits = new payCredits({
                                              memberId: recieverId,
                                              celebId: senderId,
                                              creditValue: credits,
                                              celebPercentage: test,
                                              celebKonnectPercentage: ckCredits,
                                              payType: serviceType
                                            });

                                            payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                              if (err) {
                                                //res.send(err);
                                              } else {
                                                // res.json({
                                                //   message: "payCredits saved successfully",
                                                //   "payCredits": payCredits
                                                // });
                                              }
                                            });


                                          }
                                          else {
                                          }

                                        }
                                      ); //end of credits
                                    }
                                  ); //end of celeb contracts
                                  // Update Cumulative Spent in User Object
                                  User.findOne({ _id: senderId }, function (err, uResult) {
                                    nId = uResult._id;
                                    oldValue = parseInt(uResult.cumulativeSpent);
                                    let newbody = {};
                                    newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
                                    User.findByIdAndUpdate(nId, newbody, function (
                                      err,
                                      upResult
                                    ) { });
                                  });
                                  // end of Update Cumulative Spent in User Object
                                }
                              });

                              //////super


                            } else if ((cBal[0].cumulativeCreditValue > 0)) {
                              ///test

                              oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                              newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                              newReferralCreditValue = cBalObj.referralCreditValue;
                              let newCredits = new Credits({
                                memberId: senderId,
                                creditType: "debit",
                                status: "active",
                                referralCreditValue: newReferralCreditValue,
                                creditValue: creditValue,
                                cumulativeCreditValue: newCumulativeCreditValue,
                                remarks: "debited for video"
                              });
                              // Insert Into Credit Table
                              Credits.createCredits(newCredits, function (err, credits1) {
                                if (err) {
                                  //res.send(err);
                                } else {
                                  //console.log(credits1)
                                  res.send({
                                    message: "Credits updated successfully",
                                    creditsData: credits1
                                  });
                                  celebrityContract.findOne(
                                    { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                                    function (err, CCresult) {
                                      if (err) return res.send(err);
                                      //console.log("CCresult", CCresult);
                                      //console.log( Tresult[i].receiverId);
                                      //let idC = Tresult[i].receiverId;
                                      // start of credits
                                      Credits.find(
                                        { memberId: recieverId },
                                        null,
                                        { sort: { createdAt: -1 } },
                                        function (err, cBal) {
                                          if (err) return res.send(err);
                                          if (cBal) {
                                            cBalObj = cBal[0];
                                            newReferralCreditValue = cBalObj.referralCreditValue;
                                            oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                            credits = creditValue;
                                            test2 = CCresult.sharingPercentage;
                                            test = credits * test2 / 100;
                                            ckCredits = credits - test;
                                            //console.log(test);
                                            newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                            let newCredits = new Credits({

                                              memberId: recieverId,
                                              creditType: "credit",
                                              creditValue: test,
                                              cumulativeCreditValue: newCumulativeCreditValue,
                                              referralCreditValue: newReferralCreditValue,
                                              //referralCreditValue: referralCreditValue,
                                              remarks: "Service Earnings",
                                              createdBy: "Admin"
                                            });
                                            // Insert Into Credit Table
                                            Credits.createCredits(newCredits, function (err, credits) {
                                              if (err) {
                                                //res.send(err);
                                              } else {
                                                // //console.log("credits updated" + credits)
                                                // let myBody = {};

                                                // myBody.refundStatus = "active";
                                                // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                                //   if (err) {
                                                //     //console.log(rStatus);

                                                //   } else {
                                                //   }
                                                // });

                                              }
                                            });
                                            let newPayCredits = new payCredits({
                                              memberId: recieverId,
                                              celebId: senderId,
                                              creditValue: credits,
                                              celebPercentage: test,
                                              celebKonnectPercentage: ckCredits,
                                              payType: serviceType
                                            });

                                            payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                              if (err) {
                                                //res.send(err);
                                              } else {
                                                // res.json({
                                                //   message: "payCredits saved successfully",
                                                //   "payCredits": payCredits
                                                // });
                                              }
                                            });


                                          }
                                          else {
                                          }

                                        }
                                      ); //end of credits
                                    }
                                  ); //end of celeb contracts
                                  // Update Cumulative Spent in User Object
                                  User.findOne({ _id: senderId }, function (err, uResult) {
                                    nId = uResult._id;
                                    oldValue = parseInt(uResult.cumulativeSpent);
                                    let newbody = {};
                                    newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
                                    User.findByIdAndUpdate(nId, newbody, function (
                                      err,
                                      upResult
                                    ) { });
                                  });
                                  // end of Update Cumulative Spent in User Object
                                }
                              });

                            }

                          } else if ((cBal[0].cumulativeCreditValue > 0) && (cBal[0].cumulativeCreditValue >= parseInt(creditValue))) {
                            //console.log("dmsdsjdhhsds")
                            oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                            newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                            newReferralCreditValue = cBalObj.referralCreditValue;
                            let newCredits = new Credits({
                              memberId: senderId,
                              creditType: "debit",
                              status: "active",
                              referralCreditValue: newReferralCreditValue,
                              creditValue: creditValue,
                              cumulativeCreditValue: newCumulativeCreditValue,
                              remarks: "debited for video"
                            });
                            // Insert Into Credit Table
                            Credits.createCredits(newCredits, function (err, credits1) {
                              if (err) {
                                //res.send(err);
                              } else {
                                //console.log(credits1)
                                res.send({
                                  message: "Credits updated successfully",
                                  creditsData: credits1
                                });
                                celebrityContract.findOne(
                                  { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                                  function (err, CCresult) {
                                    if (err) return res.send(err);
                                    //console.log("CCresult", CCresult);
                                    //console.log( Tresult[i].receiverId);
                                    //let idC = Tresult[i].receiverId;
                                    // start of credits
                                    Credits.find(
                                      { memberId: recieverId },
                                      null,
                                      { sort: { createdAt: -1 } },
                                      function (err, cBal) {
                                        if (err) return res.send(err);
                                        if (cBal) {
                                          cBalObj = cBal[0];
                                          newReferralCreditValue = cBalObj.referralCreditValue;
                                          oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                          credits = creditValue;
                                          test2 = CCresult.sharingPercentage;
                                          test = credits * test2 / 100;
                                          ckCredits = credits - test;
                                          //console.log(test);
                                          newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                          let newCredits = new Credits({

                                            memberId: recieverId,
                                            creditType: "credit",
                                            creditValue: test,
                                            cumulativeCreditValue: newCumulativeCreditValue,
                                            referralCreditValue: newReferralCreditValue,
                                            //referralCreditValue: referralCreditValue,
                                            remarks: "Service Earnings",
                                            createdBy: "Admin"
                                          });
                                          // Insert Into Credit Table
                                          Credits.createCredits(newCredits, function (err, credits) {
                                            if (err) {
                                              //res.send(err);
                                            } else {
                                              // //console.log("credits updated" + credits)
                                              // let myBody = {};

                                              // myBody.refundStatus = "active";
                                              // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                              //   if (err) {
                                              //     //console.log(rStatus);

                                              //   } else {
                                              //   }
                                              // });

                                            }
                                          });
                                          let newPayCredits = new payCredits({
                                            memberId: recieverId,
                                            celebId: senderId,
                                            creditValue: credits,
                                            celebPercentage: test,
                                            celebKonnectPercentage: ckCredits,
                                            payType: serviceType
                                          });

                                          payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                            if (err) {
                                              //res.send(err);
                                            } else {
                                              // res.json({
                                              //   message: "payCredits saved successfully",
                                              //   "payCredits": payCredits
                                              // });
                                            }
                                          });


                                        }
                                        else {
                                        }

                                      }
                                    ); //end of credits
                                  }
                                ); //end of celeb contracts
                                // Update Cumulative Spent in User Object
                                User.findOne({ _id: senderId }, function (err, uResult) {
                                  nId = uResult._id;
                                  oldValue = parseInt(uResult.cumulativeSpent);
                                  let newbody = {};
                                  newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
                                  User.findByIdAndUpdate(nId, newbody, function (
                                    err,
                                    upResult
                                  ) { });
                                });
                                // end of Update Cumulative Spent in User Object
                              }
                            });

                          } else {
                            console.log(1);
                            res.send({
                              error: "Insufficient credits to call. Please add credits.",
                              data: cBalObj
                            });

                          }

                          //res.send(result.referralCode);
                          //referralCode.

                        });

                      } else {
                        console.log(2);
                        res.send({
                          error: "Insufficient credits to call. Please add credits.",
                          data: cBalObj
                        });

                      }
                    });

                  }// End of referral credits
                } else {
                  // console.log("credits not exists");
                }
              }
            ).sort({ createdAt: -1 }); // End of Create Credits

          });
      }
    });
});


// get Credit History By MemberID
router.get("/getCreditHistoryByMemberID/:memberId", function (req, res) {
  let id = req.params.memberId;

  Credits.find({
    memberId: id
  }, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Credits not exits / send a valid memberId"
      });
    }
  }).sort({ createdAt: -1 });
});
// End of get Credit History By MemberID



// get list of all credits infomation
router.get("/getAll", function (req, res) {
  Credits.find({}, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({
    createdAt: -1
  });
});
// End of get list of all credits infomation

router.get("/getAll/:pageNo/:limit", CreditController.getAll)

router.get("/getCreditHistoryByMemberID/:memberId/:createdAt/:limit", CreditController.getCreditHistoryByMemberID)

// Delete Credits
router.delete("/delete/:creditID", function (req, res, next) {
  let id = req.params.creditID;

  Credits.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      Credits.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({
          message: "Deleted credits successfully"
        });
      });
    } else {
      res.json({
        error: "Credits not found / Invalid"
      });
    }
  });
});
// End of Delete Credits

////////////// Filter Credit Transactions based on memberId, Date and type ///////////////////////////

router.post("/findCreditTransactions", function (req, res, next) {
  let memberId = req.body.memberId;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;
  let creditType = req.body.creditType;

  if (memberId && startDate && endDate && creditType) {
    ////// Fetch by memberId, startDate, endDate and creditType
    let query = {
      $and: [{
        memberId: memberId
      }, {
        creditType: creditType
      }, {
        createdAt: {
          $gte: new Date(startDate)
        }
      }, {
        createdAt: {
          $lte: new Date(endDate + " 23:59:00")
        }
      }]
    };
    Credits.find(query, function (err, result) {
      if (err) return res.send(err);
      if (result) {
        res.send(result);
      } else {
        res.json({
          error: "Credits not found / Invalid"
        });
      }
    });
    ////// End of Fetch by memberId, startDate, endDate and creditType
  } else if (memberId && startDate && endDate) {
    ////// Fetch by only Start Date and End Date
    let query = {
      $and: [{
        memberId: memberId
      }, {
        createdAt: {
          $gte: new Date(startDate)
        }
      }, {
        createdAt: {
          $lte: new Date(endDate + " 23:59:00")
        }
      }]
    };
    Credits.find(query, function (err, result) {
      if (err) return res.send(err);
      if (result) {
        res.send(result);
      } else {
        res.json({
          error: "Credits not found / Invalid"
        });
      }
    });
    ////// Fetch by only Start Date and End Date
  } else if (memberId && creditType) {
    ///// Fetch by memberId and creditType
    let query = {
      $and: [{
        memberId: memberId
      }, {
        creditType: creditType
      }]
    };
    Credits.find(query, function (err, result) {
      if (err) return res.send(err);
      if (result) {
        res.send(result);
      } else {
        res.json({
          error: "Credits not found / Invalid"
        });
      }
    });
    ///// End of Fetch by memberId and creditType
  } else if (memberId) {
    ////// Fetch only member records
    Credits.find({
      memberId: memberId
    }, function (err, result) {
      if (err) return res.send(err);
      res.send(result);
    });
    ////// End of Fetch only member records
  } else {
    ///// Fetch All Records
    Credits.find({}, function (err, result) {
      if (err) return res.send(err);
      res.send(result);
    });
    ///// End of Fetch All Records
  }
});

router.post("/insertCreditForBeingOnline", CreditController.insertCreditForBeingOnline);

////////// End of Filter Credit Transactions based on memberId, Date and type ///////////////////////////
module.exports = router;