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
let celebrityContractsService = require('../celebrityContract/celebrityContractsService');
let creditServices = require('../credits/creditServices');
// Create a Credits record
router.post("/createCredits", function (req, res) {
  // console.log("############## createCredits ###############################")
  // console.log(req.body)
  // console.log("############### createCredits ##############################")
  let creditRefCartId = req.body.creditRefCartId;
  let memberId = req.body.memberId;
  let CelebrityId = ObjectId(req.body.CelebrityId);
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

    let query = {
      $and: [{ reason: "Block/Report" }, { celebrityId: ObjectId(req.body.CelebrityId) }, { memberId: ObjectId(req.body.memberId) }]
    };
    feedbackModel.find(query, function (err, feedbackObj) {
      if (feedbackObj.length > 0) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
      } else {
        let query = {
          $and: [{ callRemarks: "Block/Report" }, { receiverId: ObjectId(req.body.CelebrityId) }, { senderId: req.body.memberId }]
        };
        serviceTransaction.find(query, function (err, result) {
          if (result.length > 0) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
          } else {
            creditServices.getMemberAllDetails(memberId, (err, memberAllInfo) => {
              if (err) {
                res.json({ success: 0, token: req.headers['x-access-token'], message: err })
              } else {
                // console.log("memberAllInfo:::::::::::", memberAllInfo);
                let currentCreditValue = parseInt(memberAllInfo.creditBalanceInfo.cumulativeCreditValue + memberAllInfo.creditBalanceInfo.memberReferCreditValue)
                if (currentCreditValue < creditValue) {
                  return res.json({ success: 0, token: req.headers['x-access-token'], message: "In Sufficiant Credits" })
                }
                creditServices.getCelebAllDetails(CelebrityId, (err, celebAllInfo) => {
                  if (err)
                    return res.json({ success: 0, token: req.headers['x-access-token'], message: err })
                  else {
                    // console.log("celebAllInfo:::::::::::", celebAllInfo);
                    if (memberAllInfo.memberNotificationInfo) {
                      let newNotification = new Notification({
                        memberId: memberAllInfo.memberNotificationInfo.memberId,
                        notificationFrom: memberAllInfo.memberNotificationInfo.memberId,
                        activity: "SPENTCREDIT",
                        notificationType: "Fan",
                        title: "Credits Spent ",
                        body: "you have spent " + creditValue + " Credits to become FAN to " + celebAllInfo.celebInfo.firstName + " " + celebAllInfo.celebInfo.lastName + " Happy Konecting!!",
                        status: "active"
                      });
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          console.log(err)
                        } else {
                        }
                      })// Insert Notification
                    }
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
                            MemberPreferences.findOne({ memberId: ObjectId(memberId) }, { _id: 1, celebrities: 1 }, (err, memberPreferenceObj) => {
                              if (err) {
                                res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                              } else {
                                if (!memberPreferenceObj || memberPreferenceObj == null) {
                                  let newRecord = new MemberPreferences({
                                    memberId: memberId,
                                  });
                                  MemberPreferences.createNewRecord(newRecord, function (err, user) {
                                    if (err) {
                                    } else { }
                                  })
                                }
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
                                      })//fan updated
                                    // console.log("@@@@@@@@@@ Become a FAN Charge @@@@@@@@@@@@@@@@@@@@");
                                    oldCumulativeCreditValue = parseInt(memberAllInfo.creditBalanceInfo.cumulativeCreditValue);
                                    oldMemberReferCreditValue = parseInt(memberAllInfo.creditBalanceInfo.memberReferCreditValue);
                                    newReferralCreditValue = parseInt(memberAllInfo.creditBalanceInfo.referralCreditValue);
                                    let remainingCredits = 0;
                                    let debitFromMemberReferralCreditValue = 0;
                                    let debitFromMainCreditValue = 0;
                                    if (oldMemberReferCreditValue >= creditValue) {
                                      newMemberReferCreditValue = parseInt(oldMemberReferCreditValue) - parseInt(creditValue);
                                      newCumulativeCreditValue = oldCumulativeCreditValue;
                                      debitFromMemberReferralCreditValue = creditValue;
                                    } else if (oldMemberReferCreditValue > 0 && oldMemberReferCreditValue < creditValue) {
                                      remainingCredits = parseInt(creditValue) - parseInt(oldMemberReferCreditValue);
                                      newMemberReferCreditValue = 0;
                                      newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(remainingCredits);
                                      debitFromMemberReferralCreditValue = oldMemberReferCreditValue;
                                      debitFromMainCreditValue = remainingCredits;
                                    } else {
                                      newMemberReferCreditValue = oldMemberReferCreditValue;
                                      newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
                                      debitFromMainCreditValue = creditValue;
                                    }
                                    let newCredits = new Credits({
                                      creditRefCartId: creditRefCartId,
                                      memberId: memberId,
                                      paymentTranRefId: paymentTranRefId,
                                      creditType: creditType,
                                      creditValue: creditValue,
                                      cumulativeCreditValue: newCumulativeCreditValue,
                                      referralCreditValue: newReferralCreditValue,
                                      memberReferCreditValue: newMemberReferCreditValue,
                                      remarks: remarks,
                                      couponCode: couponCode,
                                      createdBy: createdBy

                                    });
                                    // Insert Into Credit Table
                                    Credits.createCredits(newCredits, function (err, memberCreditsInfo) {
                                      if (err) {
                                        res.json({ success: 0, token: req.headers['x-access-token'], message: err })
                                      } else {
                                        memberCreditsInfo.cumulativeCreditValue = memberCreditsInfo.cumulativeCreditValue + memberCreditsInfo.memberReferCreditValue
                                        let newNotification = new Notification({
                                          memberId: CelebrityId,
                                          activity: "FAN",
                                          notificationFrom: memberAllInfo.memberInfo._id,
                                          notificationSettingId: "5b5ebe31fef3737e09fb3849",
                                          title: "New FAN!!!",
                                          body: " " + memberAllInfo.memberInfo.firstName + " " + memberAllInfo.memberInfo.lastName + " has become your fan. Happy Konecting !!",
                                          notificationType: req.body.notificationType,
                                          createdBy: createdBy
                                        });
                                        //Insert Notification
                                        Notification.createNotification(newNotification, function (err, celebNotiObj) {
                                          if (err) {
                                            console.log(err)
                                          } else {
                                            newReferralCreditValue = celebAllInfo.celebCreditBalanceInfo.referralCreditValue;
                                            oldCumulativeCreditValue = parseFloat(celebAllInfo.celebCreditBalanceInfo.cumulativeCreditValue);
                                            oldMemberReferCreditValue = parseInt(celebAllInfo.celebCreditBalanceInfo.memberReferCreditValue);
                                            credits = celebAllInfo.celebContractInfo.serviceCredits;
                                            test2 = celebAllInfo.celebContractInfo.sharingPercentage;
                                            test = credits * test2 / 100;
                                            ckCredits = credits - test;
                                            newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
                                            let newPayCredits = new payCredits({
                                              memberId: CelebrityId,
                                              celebId: memberId,
                                              creditValue: credits,
                                              celebPercentage: test,
                                              payType: "fan",
                                              celebKonnectPercentage: ckCredits,
                                              debitFromMemberReferralCreditValue: debitFromMemberReferralCreditValue,
                                              debitFromMainCreditValue: debitFromMainCreditValue
                                            });
                                            payCredits.createPayCredits(newPayCredits, (err, payCredits) => {
                                              if (err)
                                                console.log(err)
                                              else {
                                                let newCredits = new Credits({
                                                  memberId: CelebrityId,
                                                  creditType: "credit",
                                                  creditValue: test,
                                                  cumulativeCreditValue: newCumulativeCreditValue,
                                                  referralCreditValue: newReferralCreditValue,
                                                  memberReferCreditValue: oldMemberReferCreditValue,
                                                  remarks: "Service Earnings for Fan",
                                                  createdBy: "Admin"
                                                });
                                                // Insert Into Credit Table
                                                Credits.createCredits(newCredits, (err, celebCreditsObj) => {
                                                  if (err)
                                                    console.log(err)
                                                  else {
                                                    if (celebAllInfo.celebNotificationInfo) {
                                                      if (celebAllInfo.celebDeviceInfo.osType == "Android") {
                                                        let data = {
                                                          serviceType: "Fan",
                                                          title: 'Alert!!',
                                                          memberId: memberId,
                                                          body: memberAllInfo.memberInfo.firstName + " " + memberAllInfo.memberInfo.lastName + " is your FAN now.",
                                                          activity: "FAN"
                                                        }
                                                        otpService.sendAndriodPushNotification(celebAllInfo.celebDeviceInfo.deviceToken, "Service-alerts", data, (err, successNotificationObj) => {
                                                          if (err)
                                                            console.log(err)
                                                          else {
                                                            console.log(successNotificationObj)
                                                          }
                                                        });
                                                      } else {
                                                        let notification = {
                                                          serviceType: "Fan",
                                                          memberId: memberId,
                                                          badge: 1,
                                                          title: 'Alert!!',
                                                          body: memberAllInfo.memberInfo.firstName + " " + memberAllInfo.memberInfo.lastName + " is your FAN now.",
                                                          activity: "FAN"
                                                        }
                                                        otpService.sendIOSPushNotification(celebAllInfo.celebDeviceInfo.deviceToken, notification, (err, successNotificationObj) => {
                                                          if (err)
                                                            console.log(err)
                                                          else {
                                                            console.log(successNotificationObj)
                                                          }
                                                        });
                                                      }
                                                    }
                                                    return res.json({ success: 1, token: req.headers['x-access-token'], message: "You are now a fan of " + celebAllInfo.celebInfo.firstName, data: { creditInfo: memberCreditsInfo, celebInfo: celebAllInfo.celebInfo } });
                                                  }
                                                });
                                              }
                                            })
                                          }
                                        })//create notification for celeb
                                      }
                                    })
                                  }
                                })
                              }
                            })//check member have fan/follow obj or not
                          }
                        })//check member have seen feed or not till
                      }
                    })//check celeb have uploade any feed in last week if is not then take last feed date
                  }
                })
              }
            })
          }
        })//check celeb blocked to user from transaction
      }
    })//check celeb blocked to user
  }
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
  // console.log(id);
  Credits.find({ memberId: id }, null, { sort: { createdAt: -1 } }, function (err, result) {
    if (err) return res.send(err);
    //console.log("p1",result);
    if (result.length > 0) {
      //console.log("1")
      User.findOne({ _id: id }, function (err, uResult) {
        if (uResult) {
          //console.log("2")
          console.log(uResult.celebCredits)
          let newCelebCredits;
          if ((uResult.refCreditValue == "")) {
            newCelebCredits = 0
          } else {
            newCelebCredits = uResult.celebCredits;
          }
          let data = {};
          data._id = result[0]._id;
          data.memberId = result[0].memberId;
          data.updatedBy = result[0].updatedBy;
          data.createdBy = result[0].createdBy;
          data.updatedAt = result[0].updatedAt;
          data.createdAt = result[0].createdAt;
          data.status = result[0].status;
          data.couponCode = result[0].couponCode;
          data.remarks = result[0].remarks;
          data.referralCreditValue = result[0].referralCreditValue;
          data.cumulativeCreditValue = result[0].cumulativeCreditValue;
          data.memberReferCreditValue = result[0].memberReferCreditValue;
          data.creditValue = result[0].creditValue;
          data.creditType = result[0].creditType;
          data.celebCredits = newCelebCredits;
          return res.json({ token: req.headers['x-access-token'], success: 1, data: data })
        } else {
          return res.json({ token: req.headers['x-access-token'], success: 0, message: "UserId not exits / send a valid memberId" })
        }
      });
    } else if (result.length == 0) {
      console.log("test")
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
          logins.findByIdAndUpdate(nId, myBody, function (err, nResult) {
          });
        }
      });
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
    else if((receiverInfo.isOnline == false)&&(receiverInfo.liveStatus == "offline")){
      //console.log("1");
      res.json({ success: 0, message: "Celebrity is offline" })
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
                              Credits.findOne({ memberId: senderId }, (err, CResult) => {
                                if (err) {
                                  return res.json({
                                    success: 0,
                                    token: req.headers['x-access-token'],
                                    message: `${err}`
                                  });
                                }
                                else if (CResult) {
                                  if (senderId.isCeleb) {
                                    // console.log("wow", CResult)
                                    CResult.cumulativeCreditValue = CResult.cumulativeCreditValue + CResult.memberReferCreditValue;
                                    res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCall: false, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
                                  }
                                  else if (senderId.isManager) {
                                    CResult.cumulativeCreditValue = CResult.cumulativeCreditValue + CResult.memberReferCreditValue;
                                    res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
                                  }
                                  else {
                                    CResult.cumulativeCreditValue = CResult.cumulativeCreditValue + CResult.memberReferCreditValue;
                                    // console.log("wow2", CResult)
                                    //console.log("sresult.referralCode",senderInfo)
                                    referralCode.findOne({ memberCode: senderInfo.referralCode }, (err, rresult) => {
                                      //console.log("rresult",rresult);
                                      if (err) {
                                        res.json({ success: 0, message: "please try again" })
                                      }
                                      else if (!rresult && creditValue && (creditValue > CResult.cumulativeCreditValue)) {
                                        {
                                          res.json({ token: req.headers['x-access-token'], success: 11, message: "In Sufficiant Credits", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCall: false } });
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
                                            CRcumulativeCreditValue = CResult.cumulativeCreditValue + CResult.memberReferCreditValue;
                                            CRreferralCreditValue = CResult.referralCreditValue;
                                            //console.log(CRreferralCreditValue)
                                            let today = new Date();
                                            slotMaster.find({ memberId: ObjectId(receiverId), scheduleStatus: "inactive", isDeleted: false }, (err, scheduleObj) => {
                                              if (err) {
                                                res.json({ success: 0, message: err })
                                              } else {
                                                if (scheduleObj.length) {
                                                  // console.log("scheduleObj===========", scheduleObj.length)
                                                  // console.log("Now", new Date());
                                                  let slotObj = {};
                                                  let sObj = [];
                                                  let now = new Date().getTime();
                                                  // console.log("Now", now);
                                                  // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$44")
                                                  scheduleObj.map((Obj) => {
                                                    slotObj = {};
                                                    // console.log("$$$$$$$$$$$$$$$$$$$$$", slotObj)
                                                    let st = Obj.startTime.getTime();
                                                    // console.log("startTime", st);
                                                    let et = Obj.endTime.getTime();
                                                    // console.log("endTime", st);
                                                    // console.log("**********************************************")
                                                    if (now >= st && now <= et) {
                                                      slotObj = Obj;
                                                      sObj.push(slotObj)
                                                      // console.log("Slot Available")
                                                    }
                                                  })
                                                  if (sObj.length == 0) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, message: " schdules exists at this time", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
                                                  }
                                                  else if (sObj.length > 0) {
                                                    // console.log("23")
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, message: " schdules exists at this time", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: true, scheduleCall: true, slotAvailabilty: true } });
                                                  }
                                                } else {
                                                  // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAA",rresult)
                                                  if (rresult && (creditValue <= CRreferralCreditValue) && (req.params.serviceType == "video") && (referralInfo.memberCode == rresult.memberCode)) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
                                                  }
                                                  else if (rresult && (creditValue <= CRreferralCreditValue) && !rresult.memberId.isCeleb) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
                                                  }
                                                  else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "video")) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
                                                  }
                                                  else if ((creditValue <= CRcumulativeCreditValue) && (req.params.serviceType == "audio")) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
                                                  }
                                                  else {
                                                    return res.json({ token: req.headers['x-access-token'], success: 11, message: "Insufficient Credits", data: { senderData: senderInfo, recieverData: receiverInfo, creditInfo: CResult, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: true, scheduleCount: false, scheduleCall: false, slotAvailabilty: false } });
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
                            }
                            else {
                              res.json({ token: req.headers['x-access-token'], success: 1, data: { senderData: senderInfo, recieverData: receiverInfo, contractsInfo: contractsResult, contractsFanInfo: contractsFanInfo, isFan: false, scheduleCall: false } });
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
// router.post("/insertReferralCreditTransaction", function (req, res) {
//   let creditRefCartId = req.body.creditRefCartId;
//   let memberId = req.body.memberId;
//   let paymentTranRefId = req.body.paymentTranRefId;
//   let creditType = req.body.creditType;
//   let creditValue = req.body.creditValue;
//   let cumulativeCreditValue = req.body.cumulativeCreditValue;
//   let referralCreditValue = req.body.referralCreditValue;
//   let celebCredits = req.body.celebCredits;
//   let remarks = req.body.remarks;
//   let createdBy = req.body.createdBy;

//   /* promotion or payout */
//   // Start of Fetch Latest Credits Information
//   Credits.find({
//     memberId: memberId
//   },
//     null, {
//     sort: {
//       createdAt: -1
//     }
//   },
//     function (err, cBal) {
//       if (err) return res.send(err);
//       if (cBal) {
//         cBalObj = cBal[0];
//         if ((parseInt(cBalObj.referralCreditValue) - creditValue) < 0) {
//           res.json({ token: req.headers['x-access-token'], success: 0, message: "Insufficient referral credits" })
//         } else {
//           oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//           oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
//           newReferralCreditValue = parseInt(oldReferralCreditValue) - parseInt(creditValue);
//           let newCredits = new Credits({
//             creditRefCartId: creditRefCartId,
//             memberId: memberId,
//             paymentTranRefId: paymentTranRefId,
//             creditType: creditType,
//             creditValue: creditValue,
//             cumulativeCreditValue: cBalObj.cumulativeCreditValue,
//             referralCreditValue: newReferralCreditValue,
//             celebCredits: celebCredits,
//             remarks: remarks,
//             createdBy: createdBy
//           });
//           // Insert Into Credit Table
//           Credits.createCredits(newCredits, function (err, credits) {
//             //console.log(credits)
//             if (err) {
//               res.send(err);
//             } else {
//               res.json({ token: req.headers['x-access-token'], success: 1, message: "Credits updated successfully", data: credits });

//               // Update Cumulative earnings in User Object
//               User.findOne({
//                 _id: memberId
//               }, function (err, uResult) {
//                 nId = uResult._id;
//                 oldValue = parseInt(uResult.cumulativeEarnings);
//                 let newbody = {};
//                 newbody.cumulativeEarnings =
//                   parseInt(creditValue) + parseInt(oldValue);
//                 if ((celebCredits == false) || (celebCredits == undefined) || (celebCredits == "") || (celebCredits == null)) {

//                 } else {
//                   newbody.celebCredits = celebCredits;
//                 }
//                 User.findByIdAndUpdate(memberId, newbody, function (
//                   err,
//                   upResult
//                 ) { });
//               });
//               // end of Update Cumulative earnings in User Object
//             }
//           });
//         }
//         // End of Inset into Credit Table
//       } else {
//         res.json({ token: req.headers['x-access-token'], success: 0, message: "credits not exists" })
//       }
//     }
//   ); // End of Create Credits
// });
////////////////////////////////// End of Insert Referral Credits ///////////////////////////////////

////////////////////////////////// Update CelebCredits in UserObject //////////////////////////////////////////
// router.post("/updateCelebCredits", function (req, res) {
//   let memberId = req.body.memberId;
//   let celebCredits = req.body.celebCredits;
//   let newbody = req.body;
//   newbody.updated_by = req.body.updated_by;
//   newbody.updated_at = new Date();
//   User.findByIdAndUpdate(memberId, newbody, function (
//     err,
//     upResult
//   ) {
//     res.send({
//       "message": "Celebrity credits updated successfully!"
//     });
//   });
//   // end of Update Cumulative earnings in User Object
// });
////////////////////////////////// End of Insert Referral Credits ///////////////////////////////////


// Update credit information
// router.put("/updateCredits/:creditID", function (req, res) {
//   let id = req.params.creditID;

//   let reqbody = req.body;

//   reqbody.updatedAt = new Date();

//   Credits.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       Credits.findByIdAndUpdate(id, reqbody, function (err, result) {
//         if (err) return res.send(err);
//         res.json({
//           message: "Credits updated successfully"
//         });
//       });
//     } else {
//       res.json({
//         error: "Credits not found / Invalid"
//       });
//     }
//   });
// });
// End of Update credit information

// get by Id (getByCreditID)
// router.get("/getByCreditID/:creditID", function (req, res) {
//   let id = req.params.creditID;

//   Credits.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     res.send(result);
//   });
// });
// End of get by Id (getByCreditID)

// get Credit Balance By MemberID
// get Credit Balance By UserID for video/audio (using throught socket)
router.post("/getCreditBalanceByUserID", function (req, res) {
  // console.log("BODY======", req.body)
  let senderId = req.body.senderId;
  let recieverId = req.body.recieverId;
  let serviceType = req.body.serviceType;
  currenttime = new Date(Date.now());
  var nextDay = new Date(currenttime);
  nextDay.setDate(currenttime.getDate() + 1);
  let senderAllCreditValue = 0;
  let remark = "debited for video";
  if (serviceType === "audio")
    remark = "debited for audio";
  slotMaster.aggregate(
    [
      {
        $match: {
          $and: [
            { memberId: ObjectId(recieverId) },
            {isDeleted:false},
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
      // console.log("bssss:1", Sresult)
      if (err) {
        //res.send(err);
      }
      if (Sresult.length > 0) {
        return res.json({ token: req.headers['x-access-token'], success: 1, message: "schdules exists at this time" });
      }
      if (Sresult.length <= 0) {
        celebrityContractsService.getCelebContractsByServiceType(recieverId, serviceType, (err, celebContractObj) => {
          if (err)
            return res.status(404).jsson({ success: 0, message: "Error while fetching the celeb contract", err });
          else {
            let creditChargesValue = celebContractObj.serviceCredits;
            creditServices.getCreditBalance(ObjectId(senderId), (err, senderCreditObj) => {
              if (err)
                return res.status(404).jsson({ success: 0, message: "Error while fetching the sender credit value", err });
              else {
                senderCreditValue = senderCreditObj.cumulativeCreditValue + senderCreditObj.memberReferCreditValue;
                // //&& senderCreditObj.referralCreditValue < creditChargesValue
                // if (senderCreditValue < creditChargesValue) {
                //   return res.status(200).send({
                //     success: 1, error: "Insufficient credits to call. Please add credits.", data: senderCreditObj
                //   });
                // } else {
                creditServices.getCreditBalance(ObjectId(recieverId), (err, recieverCreditObj) => {
                  if (err)
                    return res.status(404).jsson({ success: 0, message: "Error while fetching the reciever credit value", err });
                  else {
                    User.findOne({ _id: ObjectId(senderId) }, (err, senderObj) => {
                      if (err)
                        return res.status(404).jsson({ success: 0, message: "Error while fetching the sender credit value", err });
                      else {
                        // console.log("Sender Details:   ", senderObj);
                        let referralQuery = { memberCode: "" } //find celeb referral code based on sender referral code
                        if (serviceType === "video") {
                          referralQuery = {
                            memberId: ObjectId(recieverId)
                          }
                        }
                        // console.log("referralQuery", referralQuery);
                        referralCode.findOne(referralQuery, (err, celebReferralObj) => {
                          if (err)
                            return res.status(404).jsson({ success: 0, message: "Error while fetching the reciever referral code details", err });
                          else {
                            let isReferralcode = false;
                            if (celebReferralObj) {
                              if (senderObj.referralCode == celebReferralObj.memberCode) {
                                isReferralcode = true;
                                senderAllCreditValue = senderCreditObj.cumulativeCreditValue + senderCreditObj.memberReferCreditValue + senderCreditObj.referralCreditValue;
                              }
                            }
                            if (senderCreditValue < creditChargesValue && isReferralcode == false) {
                              return res.status(200).send({
                                success: 1, error: "Insufficient credits to call. Please add credits.", data: senderCreditObj
                              });
                            }
                            if (isReferralcode == true && senderAllCreditValue < creditChargesValue) {
                              return res.status(200).send({
                                success: 1, error: "Insufficient credits to call. Please add credits.", data: senderCreditObj
                              });
                            }
                            if (isReferralcode == true && senderCreditObj.referralCreditValue >= creditChargesValue) {
                              console.log("@@@@@@@@@@ By referral Only @@@@@@@@@@@@@@@@@@@@")
                              oldCumulativeCreditValue = parseInt(senderCreditObj.cumulativeCreditValue);
                              oldMemberReferCreditValue = parseInt(senderCreditObj.memberReferCreditValue);
                              oldReferralCreditValue = parseInt(senderCreditObj.referralCreditValue);
                              let callCostBalance = oldReferralCreditValue - creditChargesValue;
                              let newCredits = new Credits({
                                memberId: senderId,
                                creditType: "debit",
                                status: "active",
                                referralCreditValue: callCostBalance,
                                creditValue: creditChargesValue,
                                cumulativeCreditValue: oldCumulativeCreditValue,
                                memberReferCreditValue: oldMemberReferCreditValue,
                                remarks: remark
                              });
                              // Insert Into Credit Table
                              Credits.createCredits(newCredits, (err, creditsObj) => {
                                if (err)
                                  return res.status(404).jsson({ success: 0, message: "Error while updating sender credit value ", err });
                                else {
                                  res.status(200).json({
                                    success: 1,
                                    message: "Credits updated successfully",
                                    creditsData: creditsObj
                                  });
                                  // update celeb sharing percentage
                                  newReferralCreditValue = recieverCreditObj.referralCreditValue;
                                  oldCumulativeCreditValue = parseFloat(recieverCreditObj.cumulativeCreditValue);
                                  oldMemberReferCreditValue = parseInt(recieverCreditObj.memberReferCreditValue);
                                  credits = parseInt(creditChargesValue);
                                  // console.log(celebContractObj.sharingPercentage);
                                  sharingPercentage = celebContractObj.sharingPercentage;
                                  totalSharingPercentage = credits * sharingPercentage / 100;
                                  // console.log(typeof totalSharingPercentage);
                                  // console.log(totalSharingPercentage);
                                  ckChargeCredits = credits - totalSharingPercentage;
                                  newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(totalSharingPercentage);
                                  let celebNewCredits = new Credits({
                                    memberId: recieverId,
                                    creditType: "credit",
                                    cumulativeCreditValue: newCumulativeCreditValue,
                                    referralCreditValue: newReferralCreditValue,
                                    memberReferCreditValue: oldMemberReferCreditValue,
                                    creditValue: totalSharingPercentage,
                                    remarks: "Service Earnings",
                                    createdBy: "Admin"
                                  });
                                  Credits.createCredits(celebNewCredits, function (err, credits) {
                                    if (err) {
                                      console.log("Error while updating celeb sharing percentage", err);
                                      //res.send(err);
                                    } else {
                                      let newPayCredits = new payCredits({
                                        memberId: recieverId,
                                        celebId: senderId,
                                        creditValue: creditChargesValue,
                                        celebPercentage: totalSharingPercentage,
                                        celebKonnectPercentage: ckChargeCredits,
                                        payType: serviceType,
                                        debitFromCelebReferralCreditValue: creditChargesValue
                                      });
                                      payCredits.createPayCredits(newPayCredits, (err, payCredits) => {
                                        if (err) {
                                          console.log("Error while updating pay credits ", err)
                                          //res.send(err);
                                        } else {
                                          oldValue = parseInt(senderObj.cumulativeSpent);
                                          let newbody = {};
                                          newbody.cumulativeSpent = parseInt(creditChargesValue) + parseInt(oldValue);
                                          User.findByIdAndUpdate(senderObj._id, newbody, (err, upResult) => {
                                            if (err)
                                              console.log("Error while updating sender spend credit value")
                                          });
                                        }
                                      }); //update celeb-konect sharing percentage
                                    }
                                  });//update celeb credit based on contarct

                                }
                              })//latest updates credit 
                            } else {
                              console.log("@@@@@@@@@@ By referral with main credits @@@@@@@@@@@@@@@@@@@@");
                              oldCumulativeCreditValue = parseInt(senderCreditObj.cumulativeCreditValue);
                              oldMemberReferCreditValue = parseInt(senderCreditObj.memberReferCreditValue);
                              oldReferralCreditValue = parseInt(senderCreditObj.referralCreditValue);
                              let remainingCredits = 0;
                              let debitFromMemberReferralCreditValue = 0;
                              let debitFromMainCreditValue = 0;
                              if (oldMemberReferCreditValue >= creditChargesValue) {
                                newMemberReferCreditValue = parseInt(oldMemberReferCreditValue) - parseInt(creditChargesValue);
                                newCumulativeCreditValue = oldCumulativeCreditValue;
                                debitFromMemberReferralCreditValue = creditChargesValue
                              } else if (oldMemberReferCreditValue > 0 && oldMemberReferCreditValue < creditChargesValue) {
                                remainingCredits = parseInt(creditChargesValue) - parseInt(oldMemberReferCreditValue);
                                newMemberReferCreditValue = 0;
                                debitFromMemberReferralCreditValue = oldMemberReferCreditValue
                                newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(remainingCredits);
                                debitFromMainCreditValue = remainingCredits
                              } else {
                                newMemberReferCreditValue = oldMemberReferCreditValue;
                                newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditChargesValue);
                                debitFromMainCreditValue = creditChargesValue
                              }
                              let newCredits = new Credits({
                                memberId: senderId,
                                creditType: "debit",
                                status: "active",
                                referralCreditValue: oldReferralCreditValue,
                                cumulativeCreditValue: newCumulativeCreditValue,
                                memberReferCreditValue: newMemberReferCreditValue,
                                creditValue: creditChargesValue,
                                remarks: remark
                              });
                              // Insert Into Credit Table
                              Credits.createCredits(newCredits, (err, creditsObj) => {
                                if (err)
                                  return res.status(404).jsson({ success: 0, message: "Error while updating sender credit value ", err });
                                else {
                                  res.status(200).json({
                                    success: 1,
                                    message: "Credits updated successfully",
                                    creditsData: creditsObj
                                  });
                                  // update celeb sharing percentage
                                  newReferralCreditValue = recieverCreditObj.referralCreditValue;
                                  oldCumulativeCreditValue = parseFloat(recieverCreditObj.cumulativeCreditValue);
                                  oldMemberReferCreditValue = parseInt(recieverCreditObj.memberReferCreditValue);
                                  credits = parseInt(creditChargesValue);
                                  sharingPercentage = celebContractObj.sharingPercentage;
                                  totalSharingPercentage = credits * sharingPercentage / 100;
                                  ckChargeCredits = credits - totalSharingPercentage;
                                  //console.log(test);
                                  newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(totalSharingPercentage);
                                  let celebNewCredits = new Credits({
                                    memberId: recieverId,
                                    creditType: "credit",
                                    cumulativeCreditValue: newCumulativeCreditValue,
                                    referralCreditValue: newReferralCreditValue,
                                    memberReferCreditValue: oldMemberReferCreditValue,
                                    creditValue: totalSharingPercentage,
                                    remarks: "Service Earnings",
                                    createdBy: "Admin"
                                  });
                                  Credits.createCredits(celebNewCredits, function (err, credits) {
                                    if (err) {
                                      console.log("Error while updating celeb sharing percentage");
                                      //res.send(err);
                                    } else {
                                      let newPayCredits = new payCredits({
                                        memberId: recieverId,
                                        celebId: senderId,
                                        creditValue: creditChargesValue,
                                        celebPercentage: totalSharingPercentage,
                                        celebKonnectPercentage: ckChargeCredits,
                                        payType: serviceType,
                                        debitFromMemberReferralCreditValue: debitFromMemberReferralCreditValue,
                                        debitFromMainCreditValue: debitFromMainCreditValue,
                                      });
                                      payCredits.createPayCredits(newPayCredits, (err, payCredits) => {
                                        if (err) {
                                          console.log("Error while updating pay credits ", err)
                                          //res.send(err);
                                        } else {
                                          oldValue = parseInt(senderObj.cumulativeSpent);
                                          let newbody = {};
                                          newbody.cumulativeSpent = parseInt(creditChargesValue) + parseInt(oldValue);
                                          User.findByIdAndUpdate(senderObj._id, newbody, (err, upResult) => {
                                            if (err)
                                              console.log("Error while updating sender spend credit value")
                                          });
                                        }
                                      }); //update celeb-konect sharing percentage
                                    }
                                  });//update celeb credit based on contarct
                                }
                              })//latest updates credit 
                            }
                          }
                        })// get celeb referral code based on used referral code while register itself
                      }
                    })//get sender details
                  }
                })// get reciever credit value
                // }
              }
            }) // get sender credit value
          }
        }) //get celeb contract
      }
    });
});

//old one not in used now
router.post("/getCreditBalanceByUserID_Running", function (req, res) {
  console.log("BODY======", req.body)
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
      console.log("bssss:1", Sresult)
      if (err) {
        //res.send(err);
      }
      if (Sresult.length > 0) {
        console.log(Sresult);
        creditVal = Sresult[0].scheduleArray[0].creditValue;
        //console.log("Pa1",creditVal)
        //console.log("1");

        Credits.find({ memberId: senderId }, null, { sort: { createdAt: -1 } }, function (err, cBal) {
          console.log("Sender balance ", cBal)
          if (err) return res.send(err);
          cBalObj = cBal[0];
          newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
          let referralQuery = {} //find celeb referral code based on sender referral code
          User.findOne({ _id: senderId }, function (err, result) {
            if (serviceType == "video") {
              referralQuery = {
                memberCode: result.referralCode
              }
            }
            referralCode.findOne(referralQuery, function (err, result) {
              if (result) {
                //console.log(cBal[0].referralCreditValue);
                console.log(result.referralCreditValue);
                if (cBal[0].referralCreditValue >= 0) {
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
        console.log("jhdsuhkdsd", Sresult);
        celebrityContract.findOne(
          { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
          function (err, CCresult) {
            if (err) return res.send(err);
            // console.log("CCresult", CCresult);
            let creditValue = CCresult.serviceCredits;
            //server schedules exits for that receiver credit value
            // currentDateTime
            // {}
            Credits.find({ memberId: senderId }, null, { sort: { createdAt: -1 } }, function (err, cBal) {
              // console.log("cBal", cBal)
              if (err) return res.send(err);
              if (cBal) {
                cBalObj = cBal[0];
                console.log("cBal", cBalObj);
                newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
                if (newResult < creditValue) {
                  res.send({
                    error: "Insufficient credits to call. Please add credits.",
                    data: cBalObj
                  });
                } else {
                  User.findOne({ _id: senderId }, function (err, result) {
                    console.log("Sender Details:   ", result);
                    let referralQuery = { memberCode: "" } //find celeb referral code based on sender referral code
                    if (serviceType === "video") {
                      referralQuery = {
                        memberCode: result.referralCode
                      }
                    }
                    // console.log("referralQuery", referralQuery);
                    referralCode.findOne(referralQuery, function (err, result) {
                      // console.log("Celeb referral Details ==:   ", result);
                      if (result && cBal[0].referralCreditValue >= creditValue) {
                        // console.log("########################################################");
                        // console.log(cBal[0].referralCreditValue);
                        if (cBal[0].referralCreditValue >= 0) {
                          //console.log("1", cBal[0].referralCreditValue);
                          oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                          oldMemberReferCreditValue = parseInt(cBalObj.memberReferCreditValue);
                          oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
                          //console.log("1", cBal[0].referralCreditValue);
                          /*************************
                          let callCostBalance = parseInt(creditValue) -
                            (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));
                          newReferralCreditValue = parseInt(oldReferralCreditValue) -
                            (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));
                            let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;
                          ************************** */
                          let callCostBalance = parseInt(oldReferralCreditValue) - parseInt(creditValue);
                          newReferralCreditValue = parseInt(callCostBalance);
                          let newCumulativeCreditValue = oldCumulativeCreditValue;
                          let newCredits = new Credits({
                            memberId: senderId,
                            creditType: "debit",
                            status: "active",
                            referralCreditValue: newReferralCreditValue,
                            creditValue: creditValue,
                            cumulativeCreditValue: newCumulativeCreditValue,
                            memberReferCreditValue: oldMemberReferCreditValue,
                            remarks: "debited for video"
                          });
                          // Insert Into Credit Table
                          Credits.createCredits(newCredits, function (err, credits1) {
                            if (err) {
                              //res.send(err);
                            } else {
                              //console.log(credits1)
                              res.send({ message: "Credits updated successfully", creditsData: credits1 });

                              celebrityContract.findOne(
                                { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                                function (err, CCresult) {
                                  if (err) return res.send(err);
                                  //console.log("CCresult", CCresult);
                                  //console.log( Tresult[i].receiverId);
                                  //let idC = Tresult[i].receiverId;
                                  // start of credits
                                  Credits.find({ memberId: recieverId }, null, { sort: { createdAt: -1 } }, function (err, cBal) {
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
                        console.log("dmsdsjdhhsds")
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
                              message: "Credits updated successfully", creditsData: credits1
                            });
                            celebrityContract.findOne(
                              { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
                              function (err, CCresult) {
                                if (err) return res.send(err);
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


// // get Credit Balance By UserID for video/audio (twice check please)
// router.post("/getCreditBalanceByUserID", function (req, res) {
//   let senderId = req.body.senderId;
//   let recieverId = req.body.recieverId;
//   let serviceType = req.body.serviceType;
//   currenttime = new Date(Date.now());
//   var nextDay = new Date(currenttime);
//   nextDay.setDate(currenttime.getDate() + 1);
//   //console.log(currenttime);
//   //console.log(nextDay)

//   //console.log(currenttime);
//   //console.log(nextDay);
//   slotMaster.aggregate(
//     [
//       {
//         $match: {
//           $and: [
//             { memberId: ObjectId(recieverId) },
//             //{ "scheduleArray.scheduleStartTime": { $gte: new Date(currenttime), $lt: new Date(nextDay) } },
//             //{  "scheduleArray.scheduleEndTime": { $gte: new Date(currenttime), $lt: new Date(nextDay) } },
//             {
//               startTime: {
//                 $gte: currenttime,
//                 $lt: nextDay
//               }
//             }
//           ]
//         }
//       }
//     ],
//     function (err, Sresult) {
//       //console.log("bssss:1",Sresult[0].scheduleArray[0].creditValue)
//       if (err) {

//         //res.send(err);
//       }

//       if (Sresult.length > 0) {
//         //console.log(Sresult);
//         creditVal = Sresult[0].scheduleArray[0].creditValue;
//         //console.log("Pa1", creditVal)

//         Credits.find(
//           { memberId: senderId },
//           null,
//           { sort: { createdAt: -1 } },
//           function (err, cBal) {
//             //console.log(cBal)
//             if (err) return res.send(err);
//             //if (cBal) {
//             cBalObj = cBal[0];
//             newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
//             //}
//             //console.log("senderId",senderId)
//             User.findOne({ _id: senderId }, function (err, result) {
//               //console.log("result", result.celebCredits);
//               cCredtis = result.celebCredits;
//               P1 = cCredtis.split('-');
//               celebID = P1[1];
//               cB = P1[0];
//               //console.log("P1", celebID);
//               if (recieverId == celebID) {
//                 //console.log("test");

//                 //res.send(result.referralCode);
//                 referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
//                   if (result) {
//                     //console.log(cBal[0].referralCreditValue);
//                     if (cBal[0].referralCreditValue >= 0) {
//                       //console.log("1", cBal[0].referralCreditValue);
//                       oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                       oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
//                       //console.log("1", cBal[0].referralCreditValue);

//                       let callCostBalance = parseInt(creditVal) -
//                         (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));

//                       newReferralCreditValue = parseInt(oldReferralCreditValue) -
//                         (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));
//                       // newReferralCreditValue = cBalObj.referralCreditValue
//                       let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;



//                       let newCredits = new Credits({
//                         memberId: senderId,
//                         creditType: "debit",
//                         status: "active",
//                         referralCreditValue: newReferralCreditValue,
//                         creditValue: creditVal,
//                         cumulativeCreditValue: newCumulativeCreditValue,
//                         remarks: "debited for video"
//                       });
//                       // Insert Into Credit Table
//                       Credits.createCredits(newCredits, function (err, credits1) {
//                         if (err) {
//                           //res.send(err);
//                         } else {
//                           //console.log(credits1)
//                           res.send({
//                             message: "Credits updated successfully",
//                             creditsData: credits1
//                           });
//                           celebrityContract.findOne(
//                             { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                             function (err, CCresult) {
//                               if (err) return res.send(err);
//                               //console.log("CCresult", CCresult);
//                               //console.log( Tresult[i].receiverId);
//                               //let idC = Tresult[i].receiverId;
//                               // start of credits
//                               Credits.find(
//                                 { memberId: recieverId },
//                                 null,
//                                 { sort: { createdAt: -1 } },
//                                 function (err, cBal) {
//                                   if (err) return res.send(err);
//                                   if (cBal) {
//                                     cBalObj = cBal[0];
//                                     newReferralCreditValue = cBalObj.referralCreditValue;
//                                     oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                     credits = creditVal;
//                                     test2 = CCresult.sharingPercentage;
//                                     test = credits * test2 / 100;
//                                     ckCredits = credits - test;
//                                     //console.log(test);
//                                     newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                     let newCredits = new Credits({

//                                       memberId: recieverId,
//                                       creditType: "credit",
//                                       creditValue: test,
//                                       cumulativeCreditValue: newCumulativeCreditValue,
//                                       referralCreditValue: newReferralCreditValue,
//                                       //referralCreditValue: referralCreditValue,
//                                       remarks: "Service Earnings",
//                                       createdBy: "Admin"
//                                     });
//                                     // Insert Into Credit Table
//                                     Credits.createCredits(newCredits, function (err, credits) {
//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // //console.log("credits updated" + credits)
//                                         // let myBody = {};

//                                         // myBody.refundStatus = "active";
//                                         // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                         //   if (err) {
//                                         //     //console.log(rStatus);

//                                         //   } else {
//                                         //   }
//                                         // });

//                                       }
//                                     });
//                                     let newPayCredits = new payCredits({
//                                       memberId: recieverId,
//                                       celebId: senderId,
//                                       creditValue: credits,
//                                       celebPercentage: test,
//                                       celebKonnectPercentage: ckCredits,
//                                       payType: serviceType
//                                     });

//                                     payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // res.json({
//                                         //   message: "payCredits saved successfully",
//                                         //   "payCredits": payCredits
//                                         // });
//                                       }
//                                     });


//                                   }
//                                   else {
//                                   }

//                                 }
//                               ); //end of credits
//                             }
//                           ); //end of celeb contracts



//                           // Update Cumulative Spent in User Object
//                           User.findOne({ _id: senderId }, function (err, uResult) {
//                             nId = uResult._id;
//                             oldValue = parseInt(uResult.cumulativeSpent);
//                             let newbody = {};
//                             newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
//                             User.findByIdAndUpdate(nId, newbody, function (
//                               err,
//                               upResult
//                             ) { });
//                           });
//                           // end of Update Cumulative Spent in User Object
//                         }
//                       });

//                       //////super


//                     } else if ((cBal[0].cumulativeCreditValue > 0)) {
//                       ///test

//                       oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                       newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
//                       newReferralCreditValue = cBalObj.referralCreditValue;
//                       let newCredits = new Credits({
//                         memberId: senderId,
//                         creditType: "debit",
//                         status: "active",
//                         referralCreditValue: newReferralCreditValue,
//                         creditValue: creditVal,
//                         cumulativeCreditValue: newCumulativeCreditValue,
//                         remarks: "debited for video"
//                       });
//                       // Insert Into Credit Table
//                       Credits.createCredits(newCredits, function (err, credits1) {
//                         if (err) {
//                           //res.send(err);
//                         } else {
//                           //console.log(credits1)
//                           res.send({
//                             message: "Credits updated successfully",
//                             creditsData: credits1
//                           });

//                           celebrityContract.findOne(
//                             { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                             function (err, CCresult) {
//                               if (err) return res.send(err);
//                               //console.log("CCresult", CCresult);
//                               //console.log( Tresult[i].receiverId);
//                               //let idC = Tresult[i].receiverId;
//                               // start of credits
//                               Credits.find(
//                                 { memberId: recieverId },
//                                 null,
//                                 { sort: { createdAt: -1 } },
//                                 function (err, cBal) {
//                                   if (err) return res.send(err);
//                                   if (cBal) {
//                                     cBalObj = cBal[0];
//                                     newReferralCreditValue = cBalObj.referralCreditValue;
//                                     oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                     credits = creditVal;
//                                     test2 = CCresult.sharingPercentage;
//                                     test = credits * test2 / 100;
//                                     ckCredits = credits - test;
//                                     //console.log(test);
//                                     newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                     let newCredits = new Credits({

//                                       memberId: recieverId,
//                                       creditType: "credit",
//                                       creditValue: test,
//                                       cumulativeCreditValue: newCumulativeCreditValue,
//                                       referralCreditValue: newReferralCreditValue,
//                                       //referralCreditValue: referralCreditValue,
//                                       remarks: "Service Earnings",
//                                       createdBy: "Admin"
//                                     });
//                                     // Insert Into Credit Table
//                                     Credits.createCredits(newCredits, function (err, credits) {
//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // //console.log("credits updated" + credits)
//                                         // let myBody = {};

//                                         // myBody.refundStatus = "active";
//                                         // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                         //   if (err) {
//                                         //     //console.log(rStatus);

//                                         //   } else {
//                                         //   }
//                                         // });

//                                       }
//                                     });
//                                     let newPayCredits = new payCredits({
//                                       memberId: recieverId,
//                                       celebId: senderId,
//                                       creditValue: credits,
//                                       celebPercentage: test,
//                                       celebKonnectPercentage: ckCredits,
//                                       payType: serviceType
//                                     });

//                                     payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // res.json({
//                                         //   message: "payCredits saved successfully",
//                                         //   "payCredits": payCredits
//                                         // });
//                                       }
//                                     });


//                                   }
//                                   else {
//                                   }

//                                 }
//                               ); //end of credits
//                             }
//                           ); //end of celeb contracts
//                           // Update Cumulative Spent in User Object
//                           User.findOne({ _id: senderId }, function (err, uResult) {
//                             nId = uResult._id;
//                             oldValue = parseInt(uResult.cumulativeSpent);
//                             let newbody = {};
//                             newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
//                             User.findByIdAndUpdate(nId, newbody, function (
//                               err,
//                               upResult
//                             ) { });
//                           });
//                           // end of Update Cumulative Spent in User Object
//                         }
//                       });

//                     }

//                   } else if ((cBal[0].cumulativeCreditValue > 0) && ((cBal[0].cumulativeCreditValue = parseInt(creditVal)) || (cBal[0].cumulativeCreditValue > parseInt(creditVal)))) {
//                     console.log("dmsdsjdhhsds")
//                     oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                     newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
//                     newReferralCreditValue = cBalObj.referralCreditValue;
//                     let newCredits = new Credits({
//                       memberId: senderId,
//                       creditType: "debit",
//                       status: "active",
//                       referralCreditValue: newReferralCreditValue,
//                       creditValue: creditVal,
//                       cumulativeCreditValue: newCumulativeCreditValue,
//                       remarks: "debited for video"
//                     });
//                     // Insert Into Credit Table
//                     Credits.createCredits(newCredits, function (err, credits1) {
//                       if (err) {
//                         //res.send(err);
//                       } else {
//                         //console.log(credits1)
//                         res.send({
//                           message: "Credits updated successfully",
//                           creditsData: credits1
//                         });
//                         celebrityContract.findOne(
//                           { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                           function (err, CCresult) {
//                             if (err) return res.send(err);
//                             //console.log("CCresult", CCresult);
//                             //console.log( Tresult[i].receiverId);
//                             //let idC = Tresult[i].receiverId;
//                             // start of credits
//                             Credits.find(
//                               { memberId: recieverId },
//                               null,
//                               { sort: { createdAt: -1 } },
//                               function (err, cBal) {
//                                 if (err) return res.send(err);
//                                 if (cBal) {
//                                   cBalObj = cBal[0];
//                                   newReferralCreditValue = cBalObj.referralCreditValue;
//                                   oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                   credits = creditVal;
//                                   test2 = CCresult.sharingPercentage;
//                                   test = credits * test2 / 100;
//                                   ckCredits = credits - test;
//                                   //console.log(test);
//                                   newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                   let newCredits = new Credits({

//                                     memberId: recieverId,
//                                     creditType: "credit",
//                                     creditValue: test,
//                                     cumulativeCreditValue: newCumulativeCreditValue,
//                                     referralCreditValue: newReferralCreditValue,
//                                     //referralCreditValue: referralCreditValue,
//                                     remarks: "Service Earnings",
//                                     createdBy: "Admin"
//                                   });
//                                   // Insert Into Credit Table
//                                   Credits.createCredits(newCredits, function (err, credits) {
//                                     if (err) {
//                                       //res.send(err);
//                                     } else {
//                                       // //console.log("credits updated" + credits)
//                                       // let myBody = {};

//                                       // myBody.refundStatus = "active";
//                                       // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                       //   if (err) {
//                                       //     //console.log(rStatus);

//                                       //   } else {
//                                       //   }
//                                       // });

//                                     }
//                                   });
//                                   let newPayCredits = new payCredits({
//                                     memberId: recieverId,
//                                     celebId: senderId,
//                                     creditValue: credits,
//                                     celebPercentage: test,
//                                     celebKonnectPercentage: ckCredits,
//                                     payType: serviceType
//                                   });

//                                   payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                     if (err) {
//                                       //res.send(err);
//                                     } else {
//                                       // res.json({
//                                       //   message: "payCredits saved successfully",
//                                       //   "payCredits": payCredits
//                                       // });
//                                     }
//                                   });


//                                 }
//                                 else {
//                                 }

//                               }
//                             ); //end of credits
//                           }
//                         ); //end of celeb contracts
//                         // Update Cumulative Spent in User Object
//                         User.findOne({ _id: senderId }, function (err, uResult) {
//                           nId = uResult._id;
//                           oldValue = parseInt(uResult.cumulativeSpent);
//                           let newbody = {};
//                           newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
//                           User.findByIdAndUpdate(nId, newbody, function (
//                             err,
//                             upResult
//                           ) { });
//                         });
//                         // end of Update Cumulative Spent in User Object
//                       }
//                     });

//                   } else {
//                     console.log("10");
//                     res.send({
//                       error: "Insufficient credits to call. Please add credits.",
//                       data: cBalObj
//                     });

//                   }

//                   //res.send(result.referralCode);
//                   //referralCode.

//                 });

//               } else {
//                 console.log("9");
//                 referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
//                   if (result) {
//                     //console.log(cBal[0].referralCreditValue);
//                     if (cBal[0].referralCreditValue >= 0) {
//                       //console.log("1", cBal[0].referralCreditValue);
//                       oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                       oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
//                       //console.log("1", cBal[0].referralCreditValue);

//                       let callCostBalance = parseInt(creditVal) -
//                         (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));

//                       newReferralCreditValue = parseInt(oldReferralCreditValue) -
//                         (parseInt(oldReferralCreditValue) < parseInt(creditVal) ? parseInt(oldReferralCreditValue) : parseInt(creditVal));
//                       // newReferralCreditValue = cBalObj.referralCreditValue
//                       let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;



//                       let newCredits = new Credits({
//                         memberId: senderId,
//                         creditType: "debit",
//                         status: "active",
//                         referralCreditValue: newReferralCreditValue,
//                         creditValue: creditVal,
//                         cumulativeCreditValue: newCumulativeCreditValue,
//                         remarks: "debited for video"
//                       });
//                       // Insert Into Credit Table
//                       Credits.createCredits(newCredits, function (err, credits1) {
//                         if (err) {
//                           //res.send(err);
//                         } else {
//                           //console.log(credits1)
//                           res.send({
//                             message: "Credits updated successfully",
//                             creditsData: credits1
//                           });
//                           celebrityContract.findOne(
//                             { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                             function (err, CCresult) {
//                               if (err) return res.send(err);
//                               //console.log("CCresult", CCresult);
//                               //console.log( Tresult[i].receiverId);
//                               //let idC = Tresult[i].receiverId;
//                               // start of credits
//                               Credits.find(
//                                 { memberId: recieverId },
//                                 null,
//                                 { sort: { createdAt: -1 } },
//                                 function (err, cBal) {
//                                   if (err) return res.send(err);
//                                   if (cBal) {
//                                     cBalObj = cBal[0];
//                                     newReferralCreditValue = cBalObj.referralCreditValue;
//                                     oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                     credits = creditVal;
//                                     test2 = CCresult.sharingPercentage;
//                                     test = credits * test2 / 100;
//                                     ckCredits = credits - test;
//                                     //console.log(test);
//                                     newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                     let newCredits = new Credits({

//                                       memberId: recieverId,
//                                       creditType: "credit",
//                                       creditValue: test,
//                                       cumulativeCreditValue: newCumulativeCreditValue,
//                                       referralCreditValue: newReferralCreditValue,
//                                       //referralCreditValue: referralCreditValue,
//                                       remarks: "Service Earnings",
//                                       createdBy: "Admin"
//                                     });
//                                     // Insert Into Credit Table
//                                     Credits.createCredits(newCredits, function (err, credits) {
//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // //console.log("credits updated" + credits)
//                                         // let myBody = {};

//                                         // myBody.refundStatus = "active";
//                                         // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                         //   if (err) {
//                                         //     //console.log(rStatus);

//                                         //   } else {
//                                         //   }
//                                         // });

//                                       }
//                                     });
//                                     let newPayCredits = new payCredits({
//                                       memberId: recieverId,
//                                       celebId: senderId,
//                                       creditValue: credits,
//                                       celebPercentage: test,
//                                       celebKonnectPercentage: ckCredits,
//                                       payType: serviceType
//                                     });

//                                     payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // res.json({
//                                         //   message: "payCredits saved successfully",
//                                         //   "payCredits": payCredits
//                                         // });
//                                       }
//                                     });


//                                   }
//                                   else {
//                                   }

//                                 }
//                               ); //end of credits
//                             }
//                           ); //end of celeb contracts



//                           // Update Cumulative Spent in User Object
//                           User.findOne({ _id: senderId }, function (err, uResult) {
//                             nId = uResult._id;
//                             oldValue = parseInt(uResult.cumulativeSpent);
//                             let newbody = {};
//                             newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
//                             User.findByIdAndUpdate(nId, newbody, function (
//                               err,
//                               upResult
//                             ) { });
//                           });
//                           // end of Update Cumulative Spent in User Object
//                         }
//                       });

//                       //////super


//                     } else if ((cBal[0].cumulativeCreditValue > 0)) {
//                       ///test

//                       oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                       newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
//                       newReferralCreditValue = cBalObj.referralCreditValue;
//                       let newCredits = new Credits({
//                         memberId: senderId,
//                         creditType: "debit",
//                         status: "active",
//                         referralCreditValue: newReferralCreditValue,
//                         creditValue: creditVal,
//                         cumulativeCreditValue: newCumulativeCreditValue,
//                         remarks: "debited for video"
//                       });
//                       // Insert Into Credit Table
//                       Credits.createCredits(newCredits, function (err, credits1) {
//                         if (err) {
//                           //res.send(err);
//                         } else {
//                           //console.log(credits1)
//                           res.send({
//                             message: "Credits updated successfully",
//                             creditsData: credits1
//                           });

//                           celebrityContract.findOne(
//                             { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                             function (err, CCresult) {
//                               if (err) return res.send(err);
//                               //console.log("CCresult", CCresult);
//                               //console.log( Tresult[i].receiverId);
//                               //let idC = Tresult[i].receiverId;
//                               // start of credits
//                               Credits.find(
//                                 { memberId: recieverId },
//                                 null,
//                                 { sort: { createdAt: -1 } },
//                                 function (err, cBal) {
//                                   if (err) return res.send(err);
//                                   if (cBal) {
//                                     cBalObj = cBal[0];
//                                     newReferralCreditValue = cBalObj.referralCreditValue;
//                                     oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                     credits = creditVal;
//                                     test2 = CCresult.sharingPercentage;
//                                     test = credits * test2 / 100;
//                                     ckCredits = credits - test;
//                                     //console.log(test);
//                                     newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                     let newCredits = new Credits({

//                                       memberId: recieverId,
//                                       creditType: "credit",
//                                       creditValue: test,
//                                       cumulativeCreditValue: newCumulativeCreditValue,
//                                       referralCreditValue: newReferralCreditValue,
//                                       //referralCreditValue: referralCreditValue,
//                                       remarks: "Service Earnings",
//                                       createdBy: "Admin"
//                                     });
//                                     // Insert Into Credit Table
//                                     Credits.createCredits(newCredits, function (err, credits) {
//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // //console.log("credits updated" + credits)
//                                         // let myBody = {};

//                                         // myBody.refundStatus = "active";
//                                         // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                         //   if (err) {
//                                         //     //console.log(rStatus);

//                                         //   } else {
//                                         //   }
//                                         // });

//                                       }
//                                     });
//                                     let newPayCredits = new payCredits({
//                                       memberId: recieverId,
//                                       celebId: senderId,
//                                       creditValue: credits,
//                                       celebPercentage: test,
//                                       celebKonnectPercentage: ckCredits,
//                                       payType: serviceType
//                                     });

//                                     payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                       if (err) {
//                                         //res.send(err);
//                                       } else {
//                                         // res.json({
//                                         //   message: "payCredits saved successfully",
//                                         //   "payCredits": payCredits
//                                         // });
//                                       }
//                                     });


//                                   }
//                                   else {
//                                   }

//                                 }
//                               ); //end of credits
//                             }
//                           ); //end of celeb contracts
//                           // Update Cumulative Spent in User Object
//                           User.findOne({ _id: senderId }, function (err, uResult) {
//                             nId = uResult._id;
//                             oldValue = parseInt(uResult.cumulativeSpent);
//                             let newbody = {};
//                             newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
//                             User.findByIdAndUpdate(nId, newbody, function (
//                               err,
//                               upResult
//                             ) { });
//                           });
//                           // end of Update Cumulative Spent in User Object
//                         }
//                       });

//                     }

//                   } else if ((cBal[0].cumulativeCreditValue > 0) && ((cBal[0].cumulativeCreditValue = parseInt(creditVal)) || (cBal[0].cumulativeCreditValue > parseInt(creditVal)))) {
//                     console.log("dmsdsjdhhsds")
//                     oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                     newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditVal);
//                     newReferralCreditValue = cBalObj.referralCreditValue;
//                     let newCredits = new Credits({
//                       memberId: senderId,
//                       creditType: "debit",
//                       status: "active",
//                       referralCreditValue: newReferralCreditValue,
//                       creditValue: creditVal,
//                       cumulativeCreditValue: newCumulativeCreditValue,
//                       remarks: "debited for video"
//                     });
//                     // Insert Into Credit Table
//                     Credits.createCredits(newCredits, function (err, credits1) {
//                       if (err) {
//                         //res.send(err);
//                       } else {
//                         //console.log(credits1)
//                         res.send({
//                           message: "Credits updated successfully",
//                           creditsData: credits1
//                         });
//                         celebrityContract.findOne(
//                           { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                           function (err, CCresult) {
//                             if (err) return res.send(err);
//                             //console.log("CCresult", CCresult);
//                             //console.log( Tresult[i].receiverId);
//                             //let idC = Tresult[i].receiverId;
//                             // start of credits
//                             Credits.find(
//                               { memberId: recieverId },
//                               null,
//                               { sort: { createdAt: -1 } },
//                               function (err, cBal) {
//                                 if (err) return res.send(err);
//                                 if (cBal) {
//                                   cBalObj = cBal[0];
//                                   newReferralCreditValue = cBalObj.referralCreditValue;
//                                   oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                   credits = creditVal;
//                                   test2 = CCresult.sharingPercentage;
//                                   test = credits * test2 / 100;
//                                   ckCredits = credits - test;
//                                   //console.log(test);
//                                   newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                   let newCredits = new Credits({

//                                     memberId: recieverId,
//                                     creditType: "credit",
//                                     creditValue: test,
//                                     cumulativeCreditValue: newCumulativeCreditValue,
//                                     referralCreditValue: newReferralCreditValue,
//                                     //referralCreditValue: referralCreditValue,
//                                     remarks: "Service Earnings",
//                                     createdBy: "Admin"
//                                   });
//                                   // Insert Into Credit Table
//                                   Credits.createCredits(newCredits, function (err, credits) {
//                                     if (err) {
//                                       //res.send(err);
//                                     } else {
//                                       // //console.log("credits updated" + credits)
//                                       // let myBody = {};

//                                       // myBody.refundStatus = "active";
//                                       // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                       //   if (err) {
//                                       //     //console.log(rStatus);

//                                       //   } else {
//                                       //   }
//                                       // });

//                                     }
//                                   });
//                                   let newPayCredits = new payCredits({
//                                     memberId: recieverId,
//                                     celebId: senderId,
//                                     creditValue: credits,
//                                     celebPercentage: test,
//                                     celebKonnectPercentage: ckCredits,
//                                     payType: serviceType
//                                   });

//                                   payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                     if (err) {
//                                       //res.send(err);
//                                     } else {
//                                       // res.json({
//                                       //   message: "payCredits saved successfully",
//                                       //   "payCredits": payCredits
//                                       // });
//                                     }
//                                   });


//                                 }
//                                 else {
//                                 }

//                               }
//                             ); //end of credits
//                           }
//                         ); //end of celeb contracts
//                         // Update Cumulative Spent in User Object
//                         User.findOne({ _id: senderId }, function (err, uResult) {
//                           nId = uResult._id;
//                           oldValue = parseInt(uResult.cumulativeSpent);
//                           let newbody = {};
//                           newbody.cumulativeSpent = parseInt(creditVal) + parseInt(oldValue);
//                           User.findByIdAndUpdate(nId, newbody, function (
//                             err,
//                             upResult
//                           ) { });
//                         });
//                         // end of Update Cumulative Spent in User Object
//                       }
//                     });

//                   } else {
//                     console.log("10");
//                     res.send({
//                       error: "Insufficient credits to call. Please add credits.",
//                       data: cBalObj
//                     });

//                   }

//                   //res.send(result.referralCode);
//                   //referralCode.

//                 });
//                 res.send({
//                   error: "Insufficient credits to call. Please add credits.",
//                   data: cBalObj
//                 });

//               }
//             });
//           });

//       } else if (Sresult.length <= 0) {

//         //console.log("jhdsuhkdsd", Sresult);
//         celebrityContract.findOne(
//           { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//           function (err, CCresult) {
//             if (err) return res.send(err);
//             //console.log("Pa1", CCresult.serviceCredits);
//             let creditValue = CCresult.serviceCredits;
//             //server schedules exits for that receiver credit value
//             // currentDateTime
//             // {}
//             Credits.find(
//               { memberId: senderId },
//               null,
//               { sort: { createdAt: -1 } },
//               function (err, cBal) {
//                 //console.log(cBal)
//                 if (err) return res.send(err);
//                 if (cBal) {
//                   cBalObj = cBal[0];
//                   newResult = cBal[0].cumulativeCreditValue + cBal[0].referralCreditValue;
//                   console.log("newResult", newResult);
//                   // if(newResult <= creditValue){

//                   // }
//                   // if(cBal[0])
//                   //console.log(cBal[0].cumulativeCreditValue)
//                   //if ((cBal[0].cumulativeCreditValue < creditValue) && (cBal[0].referralCreditValue < creditValue))
//                   if (newResult <= creditValue) {
//                     console.log("Insufficiant credits:1");
//                     res.send({
//                       error: "Insufficient credits to call. Please add credits.",
//                       data: cBalObj
//                     });
//                   } else {
//                     User.findOne({ _id: senderId }, function (err, result) {
//                       //console.log("result.referralCode",result.celebCredits)
//                       cCredtis = result.celebCredits;
//                       P1 = cCredtis.split('-');
//                       celebID = P1[1];
//                       //console.log("1P1", celebID);
//                       cB = P1[0];
//                       if (recieverId == celebID) {
//                         //console.log("test");
//                         referralCode.findOne({ memberCode: result.referralCode }, function (err, result) {
//                           if (result) {
//                             //console.log(cBal[0].referralCreditValue);
//                             if (cBal[0].referralCreditValue >= 0) {
//                               //console.log("1", cBal[0].referralCreditValue);
//                               oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                               oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);
//                               //console.log("1", cBal[0].referralCreditValue);

//                               let callCostBalance = parseInt(creditValue) -
//                                 (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));

//                               newReferralCreditValue = parseInt(oldReferralCreditValue) -
//                                 (parseInt(oldReferralCreditValue) < parseInt(creditValue) ? parseInt(oldReferralCreditValue) : parseInt(creditValue));
//                               // newReferralCreditValue = cBalObj.referralCreditValue
//                               let newCumulativeCreditValue = oldCumulativeCreditValue - callCostBalance;



//                               let newCredits = new Credits({
//                                 memberId: senderId,
//                                 creditType: "debit",
//                                 status: "active",
//                                 referralCreditValue: newReferralCreditValue,
//                                 creditValue: creditValue,
//                                 cumulativeCreditValue: newCumulativeCreditValue,
//                                 remarks: "debited for video"
//                               });
//                               // Insert Into Credit Table
//                               Credits.createCredits(newCredits, function (err, credits1) {
//                                 if (err) {
//                                   //res.send(err);
//                                 } else {
//                                   //console.log(credits1)
//                                   res.send({
//                                     message: "Credits updated successfully",
//                                     creditsData: credits1
//                                   });
//                                   celebrityContract.findOne(
//                                     { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                                     function (err, CCresult) {
//                                       if (err) return res.send(err);
//                                       //console.log("CCresult", CCresult);
//                                       //console.log( Tresult[i].receiverId);
//                                       //let idC = Tresult[i].receiverId;
//                                       // start of credits
//                                       Credits.find(
//                                         { memberId: recieverId },
//                                         null,
//                                         { sort: { createdAt: -1 } },
//                                         function (err, cBal) {
//                                           if (err) return res.send(err);
//                                           if (cBal) {
//                                             cBalObj = cBal[0];
//                                             newReferralCreditValue = cBalObj.referralCreditValue;
//                                             oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                             credits = creditValue;
//                                             test2 = CCresult.sharingPercentage;
//                                             test = credits * test2 / 100;
//                                             ckCredits = credits - test;
//                                             //console.log(test);
//                                             newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                             let newCredits = new Credits({

//                                               memberId: recieverId,
//                                               creditType: "credit",
//                                               creditValue: test,
//                                               cumulativeCreditValue: newCumulativeCreditValue,
//                                               referralCreditValue: newReferralCreditValue,
//                                               //referralCreditValue: referralCreditValue,
//                                               remarks: "Service Earnings",
//                                               createdBy: "Admin"
//                                             });
//                                             // Insert Into Credit Table
//                                             Credits.createCredits(newCredits, function (err, credits) {
//                                               if (err) {
//                                                 //res.send(err);
//                                               } else {
//                                                 // //console.log("credits updated" + credits)
//                                                 // let myBody = {};

//                                                 // myBody.refundStatus = "active";
//                                                 // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                                 //   if (err) {
//                                                 //     //console.log(rStatus);

//                                                 //   } else {
//                                                 //   }
//                                                 // });

//                                               }
//                                             });
//                                             let newPayCredits = new payCredits({
//                                               memberId: recieverId,
//                                               celebId: senderId,
//                                               creditValue: credits,
//                                               celebPercentage: test,
//                                               celebKonnectPercentage: ckCredits,
//                                               payType: serviceType
//                                             });

//                                             payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                               if (err) {
//                                                 //res.send(err);
//                                               } else {
//                                                 // res.json({
//                                                 //   message: "payCredits saved successfully",
//                                                 //   "payCredits": payCredits
//                                                 // });
//                                               }
//                                             });


//                                           }
//                                           else {
//                                           }

//                                         }
//                                       ); //end of credits
//                                     }
//                                   ); //end of celeb contracts
//                                   // Update Cumulative Spent in User Object
//                                   User.findOne({ _id: senderId }, function (err, uResult) {
//                                     nId = uResult._id;
//                                     oldValue = parseInt(uResult.cumulativeSpent);
//                                     let newbody = {};
//                                     newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
//                                     User.findByIdAndUpdate(nId, newbody, function (
//                                       err,
//                                       upResult
//                                     ) { });
//                                   });
//                                   // end of Update Cumulative Spent in User Object
//                                 }
//                               });

//                               //////super


//                             } else if ((cBal[0].cumulativeCreditValue > 0)) {
//                               ///test

//                               oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                               newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
//                               newReferralCreditValue = cBalObj.referralCreditValue;
//                               let newCredits = new Credits({
//                                 memberId: senderId,
//                                 creditType: "debit",
//                                 status: "active",
//                                 referralCreditValue: newReferralCreditValue,
//                                 creditValue: creditValue,
//                                 cumulativeCreditValue: newCumulativeCreditValue,
//                                 remarks: "debited for video"
//                               });
//                               // Insert Into Credit Table
//                               Credits.createCredits(newCredits, function (err, credits1) {
//                                 if (err) {
//                                   //res.send(err);
//                                 } else {
//                                   //console.log(credits1)
//                                   res.send({
//                                     message: "Credits updated successfully",
//                                     creditsData: credits1
//                                   });
//                                   celebrityContract.findOne(
//                                     { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                                     function (err, CCresult) {
//                                       if (err) return res.send(err);
//                                       //console.log("CCresult", CCresult);
//                                       //console.log( Tresult[i].receiverId);
//                                       //let idC = Tresult[i].receiverId;
//                                       // start of credits
//                                       Credits.find(
//                                         { memberId: recieverId },
//                                         null,
//                                         { sort: { createdAt: -1 } },
//                                         function (err, cBal) {
//                                           if (err) return res.send(err);
//                                           if (cBal) {
//                                             cBalObj = cBal[0];
//                                             newReferralCreditValue = cBalObj.referralCreditValue;
//                                             oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                             credits = creditValue;
//                                             test2 = CCresult.sharingPercentage;
//                                             test = credits * test2 / 100;
//                                             ckCredits = credits - test;
//                                             //console.log(test);
//                                             newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                             let newCredits = new Credits({

//                                               memberId: recieverId,
//                                               creditType: "credit",
//                                               creditValue: test,
//                                               cumulativeCreditValue: newCumulativeCreditValue,
//                                               referralCreditValue: newReferralCreditValue,
//                                               //referralCreditValue: referralCreditValue,
//                                               remarks: "Service Earnings",
//                                               createdBy: "Admin"
//                                             });
//                                             // Insert Into Credit Table
//                                             Credits.createCredits(newCredits, function (err, credits) {
//                                               if (err) {
//                                                 //res.send(err);
//                                               } else {
//                                                 // //console.log("credits updated" + credits)
//                                                 // let myBody = {};

//                                                 // myBody.refundStatus = "active";
//                                                 // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                                 //   if (err) {
//                                                 //     //console.log(rStatus);

//                                                 //   } else {
//                                                 //   }
//                                                 // });

//                                               }
//                                             });
//                                             let newPayCredits = new payCredits({
//                                               memberId: recieverId,
//                                               celebId: senderId,
//                                               creditValue: credits,
//                                               celebPercentage: test,
//                                               celebKonnectPercentage: ckCredits,
//                                               payType: serviceType
//                                             });

//                                             payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                               if (err) {
//                                                 //res.send(err);
//                                               } else {
//                                                 // res.json({
//                                                 //   message: "payCredits saved successfully",
//                                                 //   "payCredits": payCredits
//                                                 // });
//                                               }
//                                             });


//                                           }
//                                           else {
//                                           }

//                                         }
//                                       ); //end of credits
//                                     }
//                                   ); //end of celeb contracts
//                                   // Update Cumulative Spent in User Object
//                                   User.findOne({ _id: senderId }, function (err, uResult) {
//                                     nId = uResult._id;
//                                     oldValue = parseInt(uResult.cumulativeSpent);
//                                     let newbody = {};
//                                     newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
//                                     User.findByIdAndUpdate(nId, newbody, function (
//                                       err,
//                                       upResult
//                                     ) { });
//                                   });
//                                   // end of Update Cumulative Spent in User Object
//                                 }
//                               });

//                             }

//                           } else if ((cBal[0].cumulativeCreditValue > 0) && (cBal[0].cumulativeCreditValue >= parseInt(creditValue))) {
//                             //console.log("dmsdsjdhhsds")
//                             oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//                             newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditValue);
//                             newReferralCreditValue = cBalObj.referralCreditValue;
//                             let newCredits = new Credits({
//                               memberId: senderId,
//                               creditType: "debit",
//                               status: "active",
//                               referralCreditValue: newReferralCreditValue,
//                               creditValue: creditValue,
//                               cumulativeCreditValue: newCumulativeCreditValue,
//                               remarks: "debited for video"
//                             });
//                             // Insert Into Credit Table
//                             Credits.createCredits(newCredits, function (err, credits1) {
//                               if (err) {
//                                 //res.send(err);
//                               } else {
//                                 //console.log(credits1)
//                                 res.send({
//                                   message: "Credits updated successfully",
//                                   creditsData: credits1
//                                 });
//                                 celebrityContract.findOne(
//                                   { $and: [{ memberId: recieverId }, { serviceType: serviceType }, { isActive: true }] },
//                                   function (err, CCresult) {
//                                     if (err) return res.send(err);
//                                     //console.log("CCresult", CCresult);
//                                     //console.log( Tresult[i].receiverId);
//                                     //let idC = Tresult[i].receiverId;
//                                     // start of credits
//                                     Credits.find(
//                                       { memberId: recieverId },
//                                       null,
//                                       { sort: { createdAt: -1 } },
//                                       function (err, cBal) {
//                                         if (err) return res.send(err);
//                                         if (cBal) {
//                                           cBalObj = cBal[0];
//                                           newReferralCreditValue = cBalObj.referralCreditValue;
//                                           oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                                           credits = creditValue;
//                                           test2 = CCresult.sharingPercentage;
//                                           test = credits * test2 / 100;
//                                           ckCredits = credits - test;
//                                           //console.log(test);
//                                           newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

//                                           let newCredits = new Credits({

//                                             memberId: recieverId,
//                                             creditType: "credit",
//                                             creditValue: test,
//                                             cumulativeCreditValue: newCumulativeCreditValue,
//                                             referralCreditValue: newReferralCreditValue,
//                                             //referralCreditValue: referralCreditValue,
//                                             remarks: "Service Earnings",
//                                             createdBy: "Admin"
//                                           });
//                                           // Insert Into Credit Table
//                                           Credits.createCredits(newCredits, function (err, credits) {
//                                             if (err) {
//                                               //res.send(err);
//                                             } else {
//                                               // //console.log("credits updated" + credits)
//                                               // let myBody = {};

//                                               // myBody.refundStatus = "active";
//                                               // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                               //   if (err) {
//                                               //     //console.log(rStatus);

//                                               //   } else {
//                                               //   }
//                                               // });

//                                             }
//                                           });
//                                           let newPayCredits = new payCredits({
//                                             memberId: recieverId,
//                                             celebId: senderId,
//                                             creditValue: credits,
//                                             celebPercentage: test,
//                                             celebKonnectPercentage: ckCredits,
//                                             payType: serviceType
//                                           });

//                                           payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                             if (err) {
//                                               //res.send(err);
//                                             } else {
//                                               // res.json({
//                                               //   message: "payCredits saved successfully",
//                                               //   "payCredits": payCredits
//                                               // });
//                                             }
//                                           });


//                                         }
//                                         else {
//                                         }

//                                       }
//                                     ); //end of credits
//                                   }
//                                 ); //end of celeb contracts
//                                 // Update Cumulative Spent in User Object
//                                 User.findOne({ _id: senderId }, function (err, uResult) {
//                                   nId = uResult._id;
//                                   oldValue = parseInt(uResult.cumulativeSpent);
//                                   let newbody = {};
//                                   newbody.cumulativeSpent = parseInt(creditValue) + parseInt(oldValue);
//                                   User.findByIdAndUpdate(nId, newbody, function (
//                                     err,
//                                     upResult
//                                   ) { });
//                                 });
//                                 // end of Update Cumulative Spent in User Object
//                               }
//                             });

//                           } else {
//                             console.log(1);
//                             res.send({
//                               error: "Insufficient credits to call. Please add credits.",
//                               data: cBalObj
//                             });

//                           }

//                           //res.send(result.referralCode);
//                           //referralCode.

//                         });

//                       } else {
//                         console.log(2);
//                         res.send({
//                           error: "Insufficient credits to call. Please add credits.",
//                           data: cBalObj
//                         });

//                       }
//                     });

//                   }// End of referral credits
//                 } else {
//                   // console.log("credits not exists");
//                 }
//               }
//             ).sort({ createdAt: -1 }); // End of Create Credits

//           });
//       }
//     });
// });


// get Credit History By MemberID
// router.get("/getCreditHistoryByMemberID/:memberId", function (req, res) {
//   let id = req.params.memberId;

//   Credits.find({
//     memberId: id
//   }, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "Credits not exits / send a valid memberId"
//       });
//     }
//   }).sort({ createdAt: -1 });
// });
// End of get Credit History By MemberID



// get list of all credits infomation
// router.get("/getAll", function (req, res) {
//   Credits.find({}, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   }).sort({
//     createdAt: -1
//   });
// });
// End of get list of all credits infomation

// router.get("/getAll/:pageNo/:limit", CreditController.getAll)

// router.get("/getCreditHistoryByMemberID/:memberId/:createdAt/:limit", CreditController.getCreditHistoryByMemberID)

// Delete Credits
// router.delete("/delete/:creditID", function (req, res, next) {
//   let id = req.params.creditID;

//   Credits.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       Credits.findByIdAndRemove(id, function (err, post) {
//         if (err) return res.send(err);
//         res.json({
//           message: "Deleted credits successfully"
//         });
//       });
//     } else {
//       res.json({
//         error: "Credits not found / Invalid"
//       });
//     }
//   });
// });
// End of Delete Credits

////////////// Filter Credit Transactions based on memberId, Date and type ///////////////////////////

// router.post("/findCreditTransactions", function (req, res, next) {
//   let memberId = req.body.memberId;
//   let startDate = req.body.startDate;
//   let endDate = req.body.endDate;
//   let creditType = req.body.creditType;

//   if (memberId && startDate && endDate && creditType) {
//     ////// Fetch by memberId, startDate, endDate and creditType
//     let query = {
//       $and: [{
//         memberId: memberId
//       }, {
//         creditType: creditType
//       }, {
//         createdAt: {
//           $gte: new Date(startDate)
//         }
//       }, {
//         createdAt: {
//           $lte: new Date(endDate + " 23:59:00")
//         }
//       }]
//     };
//     Credits.find(query, function (err, result) {
//       if (err) return res.send(err);
//       if (result) {
//         res.send(result);
//       } else {
//         res.json({
//           error: "Credits not found / Invalid"
//         });
//       }
//     });
//     ////// End of Fetch by memberId, startDate, endDate and creditType
//   } else if (memberId && startDate && endDate) {
//     ////// Fetch by only Start Date and End Date
//     let query = {
//       $and: [{
//         memberId: memberId
//       }, {
//         createdAt: {
//           $gte: new Date(startDate)
//         }
//       }, {
//         createdAt: {
//           $lte: new Date(endDate + " 23:59:00")
//         }
//       }]
//     };
//     Credits.find(query, function (err, result) {
//       if (err) return res.send(err);
//       if (result) {
//         res.send(result);
//       } else {
//         res.json({
//           error: "Credits not found / Invalid"
//         });
//       }
//     });
//     ////// Fetch by only Start Date and End Date
//   } else if (memberId && creditType) {
//     ///// Fetch by memberId and creditType
//     let query = {
//       $and: [{
//         memberId: memberId
//       }, {
//         creditType: creditType
//       }]
//     };
//     Credits.find(query, function (err, result) {
//       if (err) return res.send(err);
//       if (result) {
//         res.send(result);
//       } else {
//         res.json({
//           error: "Credits not found / Invalid"
//         });
//       }
//     });
//     ///// End of Fetch by memberId and creditType
//   } else if (memberId) {
//     ////// Fetch only member records
//     Credits.find({
//       memberId: memberId
//     }, function (err, result) {
//       if (err) return res.send(err);
//       res.send(result);
//     });
//     ////// End of Fetch only member records
//   } else {
//     ///// Fetch All Records
//     Credits.find({}, function (err, result) {
//       if (err) return res.send(err);
//       res.send(result);
//     });
//     ///// End of Fetch All Records
//   }
// });

// router.post("/insertCreditForBeingOnline", CreditController.insertCreditForBeingOnline);

////////// End of Filter Credit Transactions based on memberId, Date and type ///////////////////////////
module.exports = router;