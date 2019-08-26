let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let User = require("../users/userModel");
let MemberPreferences = require("./memberpreferencesModel");
let MemberPreferencesController = require("./memberPreferenceController");
let Feed = require("../../models/feeddata");
let Feedlog = require("../feedLog/feedlogModel");
let orders = require("../order/ordersModel");
let payCredits = require("../payCredits/payCreditsModel");
let Credits = require("../credits/creditsModel");
let celebrityContract = require("../celebrityContract/celebrityContractsModel");
let feedbackModel = require("../feedback/feedbackModel");
let Feedback = require('../feedback/feedbackModel');
let logins = require("../loginInfo/loginInfoModel");
let feedServices = require('../feed/feedServices');
let notificationSetting = require("../notificationSettings/notificationSettingsModel");
let Notification = require("../notification/notificationModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
let serviceTransaction = require("../serviceTransaction/serviceTransactionModel");
let FeedMapping = require('../feed/feedMappingModel');
const ActivityLog = require("../activityLog/activityLogService");
let otpService = require('../otp/otpRouter');


router.get("/getMemberPreferancesCount/:memberId", MemberPreferencesController.getMemberPreferancesCount)

// router.put("/setMemberCelebrityAsFan/:memberId",MemberPreferencesController.beFanOfCelebrity)
// router.put("/setMemberCelebrityAsFollower/:memberId",MemberPreferencesController.followCelebrity)
// router.put("/unFan/:memberId", MemberPreferencesController.unFanCelebrity)
// router.put("/unFollow/:memberId",MemberPreferencesController.unfollowCelebrity)
// router.put("/blockUser/:memberId",MemberPreferencesController.blockMember);


// setMemberPreferences for a User
// MemberPreferences.find({ '_id': ObjectId('5bc0288f17729a2f63002937')},(err,data)=>{
//   console.log("data")
//   console.log(data)
// }).populate('preferences')

// MemberPreferences.aggregate([
//   // Unwind the source
//   {$match:{
//     '_id': ObjectId('5bc0288f17729a2f63002937')
//   }},
//   { "$unwind": "$preferences" },
//   // Do the lookup matching
//   { "$lookup": {
//      "from": "preferences",
//      "localField": "preferences",
//      "foreignField": "_id",
//      "as": "preferenceObjects"
//   }},
//   // Unwind the result arrays ( likely one or none )
//   { "$unwind": "$preferenceObjects" },
//   // Group back to arrays
//   { "$group": {
//       "_id": "$_id",
//       "preferences": { "$push": "$preferences" },
//       "preferenceObjects": { "$push": "$preferenceObjects" }
//   }}
// ],(err,data)=>{
//   console.log(data)
//   console.log(data[0].preferenceObjects)
// })


router.post("/setMemberPreferences", function (req, res) {
  let memberId = ObjectId(req.body.userId);
  let celebrities = req.body.celebrities;
  let newArr = req.body.preferences;
  let createdBy = req.body.createdBy;
  let preferences = newArr.map(function (id) {
    return ObjectId(id);
  });
  let reqbody = req.body;
  reqbody.updated_at = new Date();

  let newRecord = new MemberPreferences({
    memberId: memberId,
    preferences: preferences,
    celebrities: celebrities,
    createdBy: createdBy
  });

  User.findById(memberId, function (err, result) {
    if (err) {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      MemberPreferences.findOne({ memberId: req.body.userId }, function (
        err,
        newresult
      ) {
        if (newresult) {
          let id = newresult._id;
          MemberPreferences.editMemberPreferences(id, reqbody, function (
            err,
            user
          ) {
            if (err) {
              res.json({
                success: 0,
                token: req.headers['x-access-token'],
                message: `${err}`
              });
            } else {
              res.json({ success: 1, token: req.header['x-access-token'], message: "Preferences Saved Successfully" });
            }
          });
        } else {
          MemberPreferences.createNewRecord(newRecord, function (err, user) {
            if (err) {
              res.json({
                success: 0,
                token: req.headers['x-access-token'],
                message: `${err}`
              });
            } else {
              res.json({ success: 1, token: req.header['x-access-token'], message: "Preferences Saved Successfully" });
            }
          });
        }
      });
    } else {
      res.json({
        success: 0, token: req.header['x-access-token'],
        message: "User Not Exists / Send a valid UserID"
      });
    }
  });
});

/*old api start */
// router.put("/setMemberCelebrityAsFollower", function (req, res) {
//   let memberId = ObjectId(req.body.userId);
//   let CelebrityId = ObjectId(req.body.CelebrityId);
//   let reqbody = req.body;
//   reqbody.isFollower = true;

//   User.findById(memberId, function (err, result) {
//     if (err) {
//       res.send(err);
//     }
//     if (result) {
//       MemberPreferences.findOne(
//         { memberId: ObjectId(req.body.userId) },
//         function (err, newresult) {
//           if (newresult) {
//             let id = newresult._id;
//             let FollowerCount = 0;
//             for (let i = 0; i < newresult.celebrities.length; i++) {
//               if (
//                 newresult.celebrities[i].CelebrityId == req.body.CelebrityId &&
//                 newresult.celebrities[i].isFollower == true
//               ) {
//                 FollowerCount = FollowerCount + 1;
//               }
//             }
//             if (FollowerCount == 0) {
//               MemberPreferences.setFollower(id, reqbody, function (err, user) {
//                 if (err) {
//                   res.send(err);
//                 }
//                 res.send({ message: "Preferences Updated Successfully" });
//               });
//             } else {
//               res.send({ message: "User already a Follower" });
//             }
//           } else {
//             let newRecord = new MemberPreferences({
//               memberId: memberId,
//             });
//             MemberPreferences.createNewRecord(newRecord, function (err, user) {
//               if (err) {
//                 res.send(err);
//               } else {
//                 MemberPreferences.setFollower(newRecord._id, reqbody, function (err, user) {
//                   if (err) {
//                     res.send(err);
//                   }
//                   else {
//                     res.send({ message: "Preferences Updated Successfully" });
//                   }

//                 });
//               }


//             });

//           }
//         }
//       );

//     } else {
//       res.json({
//         error: "User Not Exists / Send a valid UserID"
//       });
//     }
//   });
// });

// router.put("/setMemberCelebrityAsFan", function (req, res) {
//   let memberId = ObjectId(req.body.userId);
//   let CelebrityId = ObjectId(req.body.CelebrityId);
//   let isFan = req.body.isFan;
//   let credits = req.body.credits;
//   let reqbody = req.body;
//   //let credits = req.body.credits;
//   reqbody.isFan = true;
//   console.log(reqbody);

//   User.findById(memberId, function (err, result) {
//     if (err) {
//       res.send(err);
//     }
//     if (result) {
//       MemberPreferences.findOne(
//         { memberId: ObjectId(req.body.userId) },
//         function (err, newresult) {
//           if (newresult) {
//             let id = newresult._id;
//             let FanCount = 0;
//             for (let i = 0; i < newresult.celebrities.length; i++) {
//               if (
//                 newresult.celebrities[i].CelebrityId == req.body.CelebrityId &&
//                 newresult.celebrities[i].isFan == true
//               ) {
//                 FanCount = FanCount + 1;
//               }
//             }
//             if (FanCount == 0) {
//               // let query = {
//               //   $and: [{ reason: "Block/Report" }, { celebrityId: ObjectId(CelebrityId) }, { memberId: ObjectId(memberId) }]
//               // };
//               // //console.log(query);
//               // feedbackModel.find(query, function (err, Fresult) {
//               //   console.log("Fresult", Fresult);
//               //   if (Fresult.length > 0) {
//               //     res.json({
//               //       error: "This celebrity has blocked you."
//               //     });

//               //   } else {
//                   MemberPreferences.setFan(id, reqbody, function (err, user) {
//                     if (err) {
//                       res.send(err);
//                     }
//                     res.send({ message: "Preferences Updated Successfully" });
//                     celebrityContract.findOne(
//                       { $and: [{ memberId: CelebrityId }, { serviceType: "fan" }, { isActive: true }] },
//                       function (err, CCresult) {
//                         if (err) return res.send(err);
//                         //console.log("CCresult", CCresult);
//                         //console.log( Tresult[i].receiverId);
//                         //let idC = Tresult[i].receiverId;
//                         // start of credits
//                         Credits.find(
//                           { memberId: CelebrityId },
//                           null,
//                           { sort: { createdAt: -1 } },
//                           function (err, cBal) {
//                             if (err) return res.send(err);
//                             if (cBal) {
//                               cBalObj = cBal[0];
//                               newReferralCreditValue = cBalObj.referralCreditValue;
//                               oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                               credits = CCresult.serviceCredits;
//                               test2 = CCresult.sharingPercentage;
//                               test = credits * test2 / 100;
//                               ckCredits = credits - test;
//                               //console.log(test);
//                               newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
//                               let newPayCredits = new payCredits({
//                                 memberId: CelebrityId,
//                                 celebId: memberId,
//                                 creditValue: credits,
//                                 celebPercentage: test,
//                                 celebKonnectPercentage: ckCredits,
//                                 createdBy: "Pavan"
//                               });

//                               payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                 if (err) {
//                                   //res.send(err);
//                                 } else {
//                                   // res.json({
//                                   //   message: "payCredits saved successfully",
//                                   //   "payCredits": payCredits
//                                   // });
//                                 }
//                               });

//                               let newCredits = new Credits({

//                                 memberId: CelebrityId,
//                                 creditType: "credit",
//                                 creditValue: test,
//                                 cumulativeCreditValue: newCumulativeCreditValue,
//                                 referralCreditValue: newReferralCreditValue,
//                                 //referralCreditValue: referralCreditValue,
//                                 remarks: "Service Earnings for Fan",
//                                 createdBy: "Admin"
//                               });
//                               // Insert Into Credit Table
//                               Credits.createCredits(newCredits, function (err, credits) {
//                                 if (err) {
//                                   //res.send(err);
//                                 } else {
//                                   console.log("credits updated" + credits)
//                                   // let myBody = {};

//                                   // myBody.refundStatus = "active";
//                                   // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                   //   if (err) {
//                                   //     //console.log(rStatus);

//                                   //   } else {
//                                   //   }
//                                   // });

//                                 }
//                               });

//                             }
//                             else {
//                             }

//                           }
//                         ); //end of credits
//                       }
//                     ); //end of celeb contracts
//                   });

//               //   }
//               // });

//             } else {
//               res.send({ message: "User already a Fan" });
//             }
//           } else {
//             let newRecord = new MemberPreferences({
//               memberId: memberId,
//             });
//             MemberPreferences.createNewRecord(newRecord, function (err, user) {
//               if (err) {
//                 res.send(err);
//               } else {
//                 MemberPreferences.setFan(newRecord._id, reqbody, function (err, user) {
//                   if (err) {
//                     res.send(err);
//                   }
//                   else {
//                     res.send({ message: "Preferences Updated Successfully" });
//                     celebrityContract.findOne(
//                       { $and: [{ memberId: CelebrityId }, { serviceType: "fan" }, { isActive: true }] },
//                       function (err, CCresult) {
//                         if (err) return res.send(err);
//                         //console.log("CCresult", CCresult);
//                         //console.log( Tresult[i].receiverId);
//                         //let idC = Tresult[i].receiverId;
//                         // start of credits
//                         Credits.find(
//                           { memberId: CelebrityId },
//                           null,
//                           { sort: { createdAt: -1 } },
//                           function (err, cBal) {
//                             if (err) return res.send(err);
//                             if (cBal) {
//                               cBalObj = cBal[0];
//                               newReferralCreditValue = cBalObj.referralCreditValue;
//                               oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
//                               credits = CCresult.serviceCredits;
//                               test2 = CCresult.sharingPercentage;
//                               test = credits * test2 / 100;
//                               ckCredits = credits - test;
//                               //console.log(test);
//                               newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
//                               let newPayCredits = new payCredits({
//                                 memberId: CelebrityId,
//                                 celebId: memberId,
//                                 creditValue: credits,
//                                 celebPercentage: test2,
//                                 celebKonnectPercentage: ckCredits,
//                                 createdBy: "Pavan"
//                               });

//                               payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

//                                 if (err) {
//                                   //res.send(err);
//                                 } else {
//                                   // res.json({
//                                   //   message: "payCredits saved successfully",
//                                   //   "payCredits": payCredits
//                                   // });
//                                 }
//                               });

//                               let newCredits = new Credits({

//                                 memberId: CelebrityId,
//                                 creditType: "credit",
//                                 creditValue: test,
//                                 cumulativeCreditValue: newCumulativeCreditValue,
//                                 referralCreditValue: newReferralCreditValue,
//                                 //referralCreditValue: referralCreditValue,
//                                 remarks: "Service Earnings for Fan",
//                                 createdBy: "Admin"
//                               });
//                               // Insert Into Credit Table
//                               Credits.createCredits(newCredits, function (err, credits) {
//                                 if (err) {
//                                   //res.send(err);
//                                 } else {
//                                   //console.log("credits updated" + credits)
//                                   // let myBody = {};

//                                   // myBody.refundStatus = "active";
//                                   // serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
//                                   //   if (err) {
//                                   //     //console.log(rStatus);

//                                   //   } else {
//                                   //   }
//                                   // });

//                                 }
//                               });

//                             }
//                             else {
//                             }

//                           }
//                         ); //end of credits
//                       }
//                     ); //end of celeb contracts
//                   }

//                 });
//               }


//             });

//             // res.send({ error: "User already a Fan" });

//           }

//         }
//       );
//     } else {
//       res.json({
//         error: "User Not Exists / Send a valid UserID"
//       });
//     }
//   });



// });

// router.put("/unFan", function (req, res) {
//   let memberId = ObjectId(req.body.userId);
//   let CelebrityId = ObjectId(req.body.CelebrityId);
//   let isFan = req.body.isFan;
//   let reqbody = req.body;

//   User.findById(memberId, function (err, result) {
//     if (result) {
//       MemberPreferences.findOne(
//         { memberId: ObjectId(req.body.userId) },
//         function (err, newresult) {
//           if (err) return res.send(err);
//           let id = newresult._id;
//           let FanCount = 0;
//           for (let i = 0; i < newresult.celebrities.length; i++) {
//             if (
//               newresult.celebrities[i].CelebrityId == req.body.CelebrityId &&
//               newresult.celebrities[i].isFan == true
//             ) {
//               FanCount = FanCount + 1;
//             }
//           }
//           if (FanCount == 0) {
//             res.send({ message: "you are not a fan" });
//           } else {
//             MemberPreferences.updateOne(
//               {
//                 $and: [
//                   { memberId: ObjectId(newresult.memberId) },
//                   { "celebrities.CelebrityId": ObjectId(req.body.CelebrityId) },
//                   { "celebrities.isFan": true }
//                 ]
//               },
//               {
//                 $pull: {
//                   celebrities: {
//                     $and: [
//                       { CelebrityId: ObjectId(req.body.CelebrityId) },
//                       { isFan: true }
//                     ]
//                   }
//                 }
//               },
//               function (err, updatedresult) {
//                 if (err) {
//                   res.send(err);
//                 } else {
//                   if (updatedresult.nModified == 1) {
//                     res.json({ message: "UnFan Done" });
//                   } else {
//                     res.json({ message: "Operation Failed" });
//                   }
//                 }
//               }
//             );
//           }
//         }
//       );
//     } else {
//       res.json({
//         error: "User Not Exists / Send a valid UserID"
//       });
//     }
//   });
// });

// router.put("/unFollow", function (req, res) {
//   let memberId = ObjectId(req.body.userId);
//   let CelebrityId = ObjectId(req.body.CelebrityId);
//   let reqbody = req.body;

//   User.findById(memberId, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       MemberPreferences.findOne(
//         { memberId: ObjectId(req.body.userId) },
//         function (err, newresult) {
//           let id = newresult._id;
//           let FollowerCount = 0;
//           for (let i = 0; i < newresult.celebrities.length; i++) {
//             if (
//               newresult.celebrities[i].CelebrityId == req.body.CelebrityId &&
//               newresult.celebrities[i].isFollower == true
//             ) {
//               FollowerCount = FollowerCount + 1;
//             }
//           }
//           if (FollowerCount == 0) {
//             res.send({ message: "you are not a follower" });
//           } else {
//             MemberPreferences.updateOne(
//               {
//                 $and: [
//                   { memberId: ObjectId(newresult.memberId) },
//                   { "celebrities.CelebrityId": ObjectId(req.body.CelebrityId) },
//                   { "celebrities.isFollower": true }
//                 ]
//               },
//               {
//                 $pull: {
//                   celebrities: {
//                     $and: [
//                       { CelebrityId: ObjectId(req.body.CelebrityId) },
//                       { isFollower: true }
//                     ]
//                   }
//                 }
//               },
//               function (err, updatedresult) {
//                 if (err) {
//                   res.send(err);
//                 } else {
//                   if (updatedresult.nModified == 1) {
//                     res.json({ message: "UnFollow Done" });
//                   } else {
//                     res.json({ message: "Operation Failed" });
//                   }
//                 }
//               }
//             );
//           }
//         }
//       );
//     } else {
//       res.json({
//         error: "User Not Exists / Send a valid UserID"
//       });
//     }
//   });
// });

/*old api done */

// set Member Celebrity As a Fan new api testing purpose
router.put("/setMemberCelebrityAsFan/:memberId", function (req, res) {
  let memberId = ObjectId(req.params.memberId);
  let CelebrityId = ObjectId(req.body.CelebrityId);
  let isFan = req.body.isFan;
  let credits = req.body.credits;
  let reqbody = req.body;
  reqbody.isFan = true;
  User.findById(memberId, function (err, result) {
    if (err) {
      res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
    }
    if (result) {
      //we are checking the fan/follow from member preferances collection
      feedServices.findCelebFeedDate(CelebrityId, (err, lastWeekDate) => {
        if (err) {
          res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
          FeedMapping.findOne({ memberId: memberId }, (err, feedMappingObj) => {
            let today = new Date();
            let lastWeek = new Date(lastWeekDate);
            MemberPreferences.findOne({ memberId: memberId }, { _id: 1, celebrities: 1 }, (err, memberPreferenceObj) => {
              if (err) {
                res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
              } else if (memberPreferenceObj) {
                MemberPreferences.aggregate([
                  {
                    $match: {
                      memberId: memberId
                    }
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
                    res.json({ token: req.headers['x-access-token'], success: 1, message: "User already a Fan" });
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
                        lastWeek = new Date(lastWeekDate);
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
                        res.send({ success: 1, token: req.headers['x-access-token'], message: "Successfully become fan", data: user });
                        celebrityContract.findOne(
                          { $and: [{ memberId: CelebrityId + "" }, { serviceType: "fan" }, { isActive: true }] },
                          function (err, CCresult) {
                            if (err)
                              return res.send(err);
                            Credits.find({ memberId: CelebrityId }, (err, cBal) => {
                              if (err)
                                console.log(err)
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
                                  celebKonnectPercentage: ckCredits,
                                  createdBy: "Pavan"
                                });
                                payCredits.createPayCredits(newPayCredits, function (err, payCredits) {
                                  if (err) {

                                  } else {

                                  }
                                });
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
                                    console.log(err)
                                  } else {
                                    //console.log("credits updated" + credits)
                                  }
                                });
                              }
                              else {
                              }

                            }).sort({ createdAt: -1 }).limit(1); //end of credits
                          }); //end of celeb contracts
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
                          return res.json({
                            success: 0,
                            token: req.headers['x-access-token'],
                            message: `${err}`
                          });
                        }
                        else {
                          res.json({ success: 1, token: req.headers['x-access-token'], message: "Sucessfully become fan" });
                          celebrityContract.findOne(
                            { $and: [{ memberId: CelebrityId }, { serviceType: "fan" }, { isActive: true }] },
                            function (err, CCresult) {
                              if (err) {
                                return res.json({
                                  success: 0,
                                  token: req.headers['x-access-token'],
                                  message: `${err}`
                                });
                              }
                              Credits.find({ memberId: CelebrityId }, (err, cBal) => {
                                if (err) {
                                  return res.json({
                                    success: 0,
                                    token: req.headers['x-access-token'],
                                    message: `${err}`
                                  });
                                }
                                if (cBal) {
                                  cBalObj = cBal[0];
                                  newReferralCreditValue = cBalObj.referralCreditValue;
                                  oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                  credits = CCresult.serviceCredits;
                                  test2 = CCresult.sharingPercentage;
                                  test = credits * test2 / 100;
                                  ckCredits = credits - test;
                                  //console.log(test);
                                  newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
                                  let newPayCredits = new payCredits({
                                    memberId: CelebrityId,
                                    celebId: memberId,
                                    creditValue: credits,
                                    celebPercentage: test2,
                                    celebKonnectPercentage: ckCredits,
                                    createdBy: "Pavan"
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

                                  let newCredits = new Credits({

                                    memberId: CelebrityId,
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
                                      //res.send(err);
                                    } else {

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
          });
        }
      })

    }
  });
});
// End of set Member Celebrity As a Fan

// set Member Celebrity As Follower new api testing purpose
router.put("/setMemberCelebrityAsFollower/:memberId", function (req, res) {
  let memberId = ObjectId(req.params.memberId);
  let CelebrityId = ObjectId(req.body.CelebrityId);
  let notificationType = req.body.notificationType;
  let reqbody = req.body;
  reqbody.isFollower = true;
  ////////block check //////
  let query = {
    $and: [{ reason: "Block/Report" }, { celebrityId: ObjectId(CelebrityId) }, { memberId: ObjectId(memberId) }]
  };
  feedbackModel.find(query, function (err, Fresult) {
    if (Fresult.length > 0) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
    } else {
      let query = {
        $and: [{ callRemarks: "Block/Report" }, { receiverId: CelebrityId }, { senderId: memberId }]
      };
      serviceTransaction.find(query, function (err, result) {
        if (result.length > 0) {
          return res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
        } else {
          feedServices.findCelebFeedDate(CelebrityId, (err, lastWeekDate) => {
            if (err) {
              return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
            } else {
              FeedMapping.findOne({ memberId: memberId }, (err, feedMappingObj) => {
                if (err) {
                  return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                } else {
                  let today = new Date();
                  let lastWeek = new Date(lastWeekDate);
                  User.findById(memberId, (err, userDetails) => {
                    if (err) {
                      return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                    }
                    if (userDetails) {
                      MemberPreferences.findOne({ memberId: memberId }, { _id: 1, celebrities: 1 }, (err, memberPreferenceObj) => {
                        if (err) {
                          return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                        } else if (memberPreferenceObj) {
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
                                "celebrities.isFollower": true
                              }
                            }
                          ], (err, memberPreferencesObj) => {
                            if (err) {
                              return res.json({ success: 0, token: req.headers['x-access-token'], message: "Something went wrong" });
                            }
                            else if (memberPreferencesObj.length) {
                              return res.json({ success: 1, token: req.headers['x-access-token'], message: "You are already Following" });
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
                                { $addToSet: { celebrities: { CelebrityId: CelebrityId, isFollower: true, createdAt: lastWeek } } }
                                , { new: 1 }, function (err, user) {
                                  if (err) {
                                    return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                  } else {
                                    if (memberPreferenceObj.celebrities.length <= 0 && !feedMappingObj) {
                                      let feedMappingInfo = {
                                        memberId: memberId,
                                        currentSeenFeedDate: lastWeek,
                                        lastSeenFeedDate: lastWeek
                                      }
                                      FeedMapping.saveFeedMappingData(feedMappingInfo, function (err, feedMappObj) {
                                        if (err)
                                          console.log(err)
                                        else {
                                          let body = {
                                            memberId: memberId,
                                            activityOn: CelebrityId
                                          }
                                          ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Follow", body, (err, newActivityLog) => {
                                            if (err) {
                                              console.log(err)
                                            } else {

                                            }
                                          })
                                          return res.json({ success: 1, token: req.headers['x-access-token'], message: "Successfully following" });
                                        }
                                      })
                                    } else {
                                      let body = {
                                        memberId: memberId,
                                        activityOn: CelebrityId
                                      }
                                      ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Follow", body, (err, newActivityLog) => {
                                        if (err) {
                                          console.log(err)
                                        } else {

                                        }
                                      })
                                      return res.json({ success: 1, token: req.headers['x-access-token'], message: "Successfully following" });
                                    }
                                  }
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
                                { $addToSet: { celebrities: { CelebrityId: CelebrityId, isFollower: true, createdAt: lastWeek } } }
                                , { new: 1 }, function (err, user) {
                                  if (err) {
                                    res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                                  }
                                  else {
                                    User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                                      if (err)
                                        console.log(err)
                                      else {
                                        return res.json({ success: 1, token: req.headers['x-access-token'], message: "You are now a follower of " + celebInfo.firstName, data: { creditInfo: "credits", celebInfo: celebInfo } });
                                      }
                                    });
                                  }
                                });
                            }
                          });
                        }
                        // Get Member and Celebrity Profiles Data
                        User.findById(CelebrityId, (err, celebrityInfo) => {
                          // User.findById(memberId, function (err, Uresult) {
                          if (celebrityInfo == null) {
                            console.log("User doesn't existed")
                          }
                          else {
                            let id2 = celebrityInfo.email;
                            logins.findOne({ memberId: CelebrityId }, (err, Lresult) => {
                              if (Lresult == null) {
                                console.log("User doesn't existed")
                              } else {
                                let dToken = Lresult.deviceToken
                                let newNotification = new Notification({
                                  memberId: CelebrityId,
                                  activity: "FOLLOW",
                                  notificationSettingId: "5b5ebe31fef3737e09fb3849",
                                  title: "New FOLLOWER!!!",
                                  body: " " + userDetails.firstName + " " + userDetails.lastName + " has become your follower. Happy Konecting !!",
                                  //status: status,
                                  notificationType: "Follow",
                                  notificationFrom: userDetails._id
                                  //createdBy: createdBy
                                });
                                //Insert Notification
                                Notification.createNotification(newNotification, function (err, credits) {
                                  if (err) {
                                    console.log("Error while save the notification")
                                  } else {
                                    let query = {
                                      $and: [{ memberId: CelebrityId }, { notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") }, { isEnabled: true }]
                                    };
                                    notificationSetting.findOne(query, { _id: 1 }, (err, notificationSetting) => {
                                      if (err) {
                                        console.log("error while finding notification setting" + err);
                                      }
                                      else if (notificationSetting) {
                                        //old formate
                                        //body: "Greetings from CelebKonect! " + userDetails.firstName + " " + userDetails.lastName + " has become your follower. Happy Konecting !!",
                                        let data, notification;
                                        if (Lresult.osType == "Android") {
                                          data = {
                                            serviceType: "FOLLOW",
                                            title: 'Alert!!',
                                            memberId: memberId,
                                            notificationType: notificationType,
                                            body: userDetails.firstName + " " + userDetails.lastName + " started Following you.",
                                            activity: "FOLLOW"
                                          },
                                            otpService.sendAndriodPushNotification(dToken, "Feed Alert!!", data, (err, successNotificationObj) => {
                                              if (err)
                                                console.log(err)
                                              else {
                                                console.log(successNotificationObj)
                                              }
                                            });
                                        } else if (Lresult.osType == "IOS") {
                                          notification = {
                                            serviceType: "FOLLOW",
                                            notificationType: notificationType,
                                            title: 'Alert!!',
                                            memberId: memberId,
                                            body: userDetails.firstName + " " + userDetails.lastName + " started Following you.",
                                            activity: "FOLLOW"
                                          }
                                          otpService.sendIOSPushNotification(dToken, notification, (err, successNotificationObj) => {
                                            if (err)
                                              console.log(err)
                                            else {
                                              console.log(successNotificationObj)
                                            }
                                          });
                                        }
                                      } else {
                                        console.log("notifiction setting off");
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      });
                    } else {
                      res.json({
                        success: 0, message: "User Not Exists / Send a valid UserID"
                      });
                    }
                  });
                }
              })
            }
          })
        }
      });
    }
  });
});
// End of set Member Celebrity As Follower

// UnFan a User

router.put("/unFan/:memberId", function (req, res) {
  let memberId = ObjectId(req.params.memberId);
  let CelebrityId = ObjectId(req.body.CelebrityId);
  // let isFan = req.body.isFan;
  // let reqbody = req.body;
  let feedbackInfo = new Feedback({
    memberId: memberId,
    celebrityId: CelebrityId,
    reason: "Unfan",
    feedback: req.body.feedback
  });
  MemberPreferences.findOne({ memberId: memberId }, { celebrities: 1 }, (err, listOfFanObj) => {
    if (err) {
      res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
    } else {
      Feedback.create(feedbackInfo, (err, createdFeedbackObj) => {
        if (!err && createdFeedbackObj) {
          MemberPreferences.aggregate([
            {
              $match: {
                memberId: memberId
              }
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
              console.log(err)
            }
            if (memberPreferencesObj.length) {
              MemberPreferences.updateOne({ memberId: memberId },
                {
                  $pull: {
                    celebrities: { CelebrityId: CelebrityId, isFan: true }
                  }
                }, (err, updatedresult) => {
                  if (err) {
                    res.json({
                      success: 0,
                      token: req.headers['x-access-token'],
                      message: `${err}`
                    });
                  } else {
                    if (listOfFanObj.celebrities.length - 1 == 0) {
                      FeedMapping.findOneAndDeleteObject(memberId, (err, deletedObj) => {
                        if (err)
                          console.log(err)
                        else {
                          if (updatedresult.nModified == 1) {
                            User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                              //celebInfo.SMresult = celebInfo;
                              let body = {
                                memberId: memberId,
                                activityOn: CelebrityId
                              }
                              ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("UnFan", body, (err, newActivityLog) => {
                                if (err) {
                                  // res.json({success: 0,message: "Please try again." + err});
                                } else {

                                }
                              })
                              res.json({ success: 1, token: req.headers['x-access-token'], message: "You have successfully unsubscribed to " + celebInfo.firstName.charAt(0).toUpperCase() + celebInfo.firstName.slice(1) });
                            });
                          } else {
                            res.json({ success: 0, message: "Operation Failed", token: req.headers['x-access-token'] });
                          }
                        }
                      })
                    } else {
                      if (updatedresult.nModified == 1) {
                        User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                          //celebInfo.SMresult = celebInfo;
                          let body = {
                            memberId: memberId,
                            activityOn: CelebrityId
                          }
                          ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("UnFan", body, (err, newActivityLog) => {
                            if (err) {
                              // res.json({success: 0,message: "Please try again." + err});
                            } else {

                            }
                          })
                          res.json({ success: 1, token: req.headers['x-access-token'], message: "You have successfully unsubscribed to " + celebInfo.firstName.charAt(0).toUpperCase() + celebInfo.firstName.slice(1) });
                        });
                      } else {
                        res.json({ success: 0, message: "Operation Failed", token: req.headers['x-access-token'] });
                      }
                    }
                  }
                });
            }
            else {
              User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                //celebInfo.SMresult = celebInfo;
                ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("UnFan", body, (err, newActivityLog) => {
                  if (err) {
                    // res.json({success: 0,message: "Please try again." + err});
                  } else {

                  }
                })
                res.json({ success: 1, token: req.headers['x-access-token'], message: "You have successfully unsubscribed to " + celebInfo.firstName.charAt(0).toUpperCase() + celebInfo.firstName.slice(1) });
              });
            }
          });
        }
        else {
          res.json({ success: 0, token: req.headers['x-access-token'], message: "FeedBack not submitted" })
        }
      })
    }
  })

});
// End of UnFan a User

// UnFan a User

//desc block users by celebrity
//method PUT
//access public
router.put("/blockUser/:memberId", function (req, res) {
  let memberId = ObjectId(req.params.memberId);
  let CelebrityId = ObjectId(req.body.CelebrityId);
  let now = new Date();
  let lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
  // console.log("last month === ", lastMonthDate)
  Feedback.findOne({ memberId: memberId, celebrityId: CelebrityId, reason: "Unblock", lastTimeUnBlocked: { $gt: lastMonthDate } }, (err, blockedObject) => {
    if (err) {
      res.json({ success: 0, message: err })
    } else if (blockedObject) {
      // console.log("Blocking Date === ", blockedObject.lastTimeUnBlocked)
      // let remaining = new Date(lastMonthDate.getTime() - blockedObject.lastTimeUnBlocked.getTime());
      // remaining = parseInt(remaining)
      let remaining = validateReBlockingDate(lastMonthDate, blockedObject.lastTimeUnBlocked);
      return res.json({ success: 0, message: "You cannot block Username for next " + remaining + " days" });
    } else {
      Feedback.findOne({ memberId: memberId, celebrityId: CelebrityId, reason: "Block/Report" }, (err, blockedObject) => {
        if (err) {
          res.json({ success: 0, message: err })
        } else if (blockedObject) {
          return res.json({ success: 0, message: "Already block.Please Unblock" })
        } else {
          let feedbackInfo = new Feedback({
            memberId: memberId,
            celebrityId: CelebrityId,
            reason: "Block/Report",
            feedback: req.body.feedback,
          });
          Feedback.create(feedbackInfo, (err, createdFeedbackObj) => {
            if (err) {
              console.log(err)
            }
            MemberPreferences.aggregate([
              {
                $match: {
                  memberId: memberId
                }
              },
              {
                $unwind: "$celebrities"
              },
              {
                $match: {
                  "celebrities.CelebrityId": CelebrityId,
                  // "celebrities.isFan": true,
                  // "celebrities.isFollower": true,
                }
              }
            ], (err, memberPreferencesObj) => {
              if (err) {
                res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
              }
              else if (memberPreferencesObj.length) {
                MemberPreferences.update({ memberId: memberId },
                  {
                    $pull: {
                      celebrities: { CelebrityId: CelebrityId },
                    }
                  }, { multi: true }, (err, updatedresult) => {
                    if (err) {
                      res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                    } else {
                      if (updatedresult.nModified == 1) {
                        let body = {
                          memberId: memberId,
                          activityOn: CelebrityId
                        }
                        ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Block", body, (err, newActivityLog) => {
                          if (err) {
                            // res.json({success: 0,message: "Please try again." + err});
                          } else {

                          }
                        })
                        res.json({ success: 1, token: req.headers['x-access-token'], message: "User blocked" });
                      } else {
                        res.json({ success: 0, message: "Operation Failed", token: req.headers['x-access-token'] });
                      }
                    }
                  });
              }
              else {
                let body = {
                  memberId: memberId,
                  activityOn: CelebrityId
                }
                ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Block", body, (err, newActivityLog) => {
                  if (err) {
                    // res.json({success: 0,message: "Please try again." + err});
                  } else {

                  }
                })
                res.json({ success: 1, token: req.headers['x-access-token'], message: "User blocked" });
              }
            });
          });
        }
      })
    }
  })
});
// End of UnFan a User
function validateReBlockingDate(lastDate, unBlockingDate) {


  var startDate = Date.parse(unBlockingDate);
  // console.log("Testing Days AAAAA ========= ", startDate);
  var endDate = Date.parse(lastDate);
  // console.log("Testing Days BBBB ========= ", endDate);
  var timeDiff = startDate - endDate;
  daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  // console.log("Testing Days ========= ", daysDiff);
  // LicenseStartDate = lastDate;
  // LicenseEndDate = unBlockingDate;
  // console.log(LicenseStartDate);
  // console.log(LicenseEndDate);
  // let nDays = diffDays(new Date, LicenseStartDate);
  // console.log("License remaining dates " + nDays);
  // if(Date.parse(LicenseStartDate) <= Date.parse(LicenseEndDate) && nDays > 0){
  //     console.log("License remaining dates " + nDays);
  //     return true;
  // }
  // else if(Date.parse(LicenseStartDate) >= Date.parse(LicenseEndDate) && nDays < 0){
  //     console.log("License have expired.....");
  //     return false;
  // }
  return daysDiff

}
function diffDays(d1, d2) {
  let ndays;
  var tv1 = d1.valueOf();  // msec since 1970
  var tv2 = d2.valueOf();

  ndays = (tv2 - tv1) / 1000 / 86400;
  ndays = Math.round(ndays);
  return ndays;
}





// UnFollow a User
router.put("/unFollow/:memberId", function (req, res) {
  let memberId = ObjectId(req.params.memberId);
  let CelebrityId = ObjectId(req.body.CelebrityId);
  let reqbody = req.body;

  MemberPreferences.findOne({ memberId: memberId }, (err, memberPrecObj) => {
    if (err) {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    } else {
      User.findById(memberId, { _id: 1 }, (err, userInfo) => {
        if (userInfo) {
          MemberPreferences.aggregate([
            {
              $match: {
                memberId: memberId
              }
            },
            {
              $unwind: "$celebrities"
            },
            {
              $match: {
                "celebrities.CelebrityId": CelebrityId,
                "celebrities.isFollower": true
              }
            }
          ], (err, memberPreferencesObj) => {
            if (err) {
              res.json({
                success: 0,
                token: req.headers['x-access-token'],
                message: `${err}`
              });
            }
            else if (memberPreferencesObj.length) {
              MemberPreferences.updateOne({ memberId: memberId },
                {
                  $pull: {
                    celebrities: { CelebrityId: CelebrityId, isFollower: true }
                  }
                }, (err, updatedresult) => {
                  if (err) {
                    return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                  } else {
                    if (memberPrecObj.celebrities.length - 1 == 0) {
                      FeedMapping.findOneAndDeleteObject(memberId, (err, deletedObj) => {
                        if (err)
                          console.log(err)
                        else {
                          if (updatedresult.nModified == 1) {
                            User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                              //celebInfo.SMresult = celebInfo;
                              let body = {
                                memberId: memberId,
                                activityOn: CelebrityId
                              }
                              ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("UnFollow", body, (err, newActivityLog) => {
                                if (err) {
                                  // res.json({success: 0,message: "Please try again." + err});
                                } else {

                                }
                              })
                              res.json({ success: 1, token: req.headers['x-access-token'], message: "You have stopped following " + celebInfo.firstName });
                            });
                            //res.json({ success: 1, token: req.headers['x-access-token'], message: "UYou have stopped following " });
                          } else {
                            res.json({ success: 0, token: req.headers['x-access-token'], message: "Operation Failed" });
                          }
                        }
                      })
                    } else {
                      if (updatedresult.nModified == 1) {
                        User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                          //celebInfo.SMresult = celebInfo;
                          let body = {
                            memberId: memberId,
                            activityOn: CelebrityId
                          }
                          ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("UnFollow", body, (err, newActivityLog) => {
                            if (err) {
                              // res.json({success: 0,message: "Please try again." + err});
                            } else {

                            }
                          })
                          res.json({ success: 1, token: req.headers['x-access-token'], message: "You have stopped following " + celebInfo.firstName });
                        });
                        //res.json({ success: 1, token: req.headers['x-access-token'], message: "UYou have stopped following " });
                      } else {
                        res.json({ success: 0, token: req.headers['x-access-token'], message: "Operation Failed" });
                      }
                    }

                  }
                });
            }
            else {
              User.findById(ObjectId(CelebrityId), function (err, celebInfo) {
                //celebInfo.SMresult = celebInfo;
                let body = {
                  memberId: memberId,
                  activityOn: CelebrityId
                }
                ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("UnFollow", body, (err, newActivityLog) => {
                  if (err) {
                    // res.json({success: 0,message: "Please try again." + err});
                  } else {

                  }
                })
                res.json({ success: 1, token: req.headers['x-access-token'], message: "You have stopped following " + celebInfo.firstName });
              });
            }
          });
        } else {
          res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: "User Not Exists / Send a valid UserID"
          });
        }
      });
    }
  })

});
// End of UnFollow a User


// get Member Preferences By UserID
router.get("/getMemberPreferencesByUserID/:UserId", function (req, res) {
  id = req.params.UserId;
  if (id) {
    User.findById(id, function (err, result) {
      if (err) {
        return res.json({
          success: 0,
          token: req.headers['x-access-token'],
          message: `${err}`
        });
      }
      if (result) {
        MemberPreferences.findOne({ memberId: result._id }, function (
          err,
          newresult
        ) {
          if (err) {
            res.json({
              success: 0,
              token: req.headers['x-access-token'],
              message: `${err}`
            });
          }
          else if (newresult) {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: newresult })
          } else {
            return res.json({
              success: 0,
              token: req.headers['x-access-token'],
              message: "No data found!"
            });
          }
        });
      } else {
        return res.json({
          success: 0,
          token: req.headers['x-access-token'],
          message: "User Not Exists / Send a valid UserID"
        });
      }
    });
  }
  else {
    return res.json({
      success: 0,
      token: req.headers['x-access-token'],
      message: "UserID not provided"
    });
  }

});
// End of get Member Preferences By UserID

// get Member Preferences By Email
router.get("/getMemberPreferencesByEmail/:Email", function (req, res) {
  email = req.params.Email;
  User.findOne({ email: email }, function (err, result) {
    if (err) {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      MemberPreferences.findOne({ memberId: result._id }, function (
        err,
        newresult
      ) {
        if (err) {
          return res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: `${err}`
          });
        }
        if (newresult) {
          res.json({ success: 1, token: req.headers['x-access-token'], data: newresult })
        } else {
        }
      });
    } else {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: "User Not Exists / Send a valid Email"
      });
    }
  });
});
// End of get Member Preferences By Email

// get Member Preferences By MobileNo
router.get("/getMemberPreferencesByMobileNo/:MobileNo", function (req, res) {
  MobileNo = req.params.MobileNo;

  User.findOne({ mobileNumber: MobileNo }, function (err, result) {
    if (err) {
      return res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      MemberPreferences.findOne({ memberId: result._id }, function (
        err,
        newresult
      ) {
        if (err) return res.send(err);
        if (newresult) {
          res.json({ success: 1, token: req.headers['x-access-token'], data: newresult })
        } else {
        }
      });
    } else {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: "User Not Exists / Send a valid Mobile Number"
      });
    }
  });
});
// End of get Member Preferences By MobileNo

// get Member Preferences By Username
router.get("/getMemberPreferencesByUsername/:Username", function (req, res) {
  Username = req.params.Username;

  User.findOne({ username: Username }, function (err, result) {
    if (err) {
      return res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      MemberPreferences.findOne({ memberId: result._id }, function (
        err,
        newresult
      ) {
        if (err) {
          return res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: `${err}`
          });
        }
        if (newresult) {
          return res.json({
            success: 1,
            token: req.headers['x-access-token'],
            data: newresult
          });
        } else {
        }
      });
    } else {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: "User Not Exists / Send a valid Username"
      });
    }
  });
});
// End of get Member Preferences By Username

// get Celebrities By Selected Preferences
router.get("/getCelebritiesBySelectedPreferences/:userId", function (req, res) {
  id = req.params.userId;

  User.findById(id, function (err, result) {
    if (err) {
      return res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      MemberPreferences.findOne({ memberId: result._id }, function (
        err,
        newresult
      ) {
        if (err) {
          return res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: `${err}`
          });
        }
        if (newresult) {
          //  res.send(newresult.preferences);
          // Aggregate Memberpreferences MemberIds with User collection's UserIds
          MemberPreferences.aggregate(
            [
              { $match: { preferences: { $in: newresult.preferences } } },
              {
                $lookup: {
                  from: "users",
                  localField: "memberId",
                  foreignField: "_id",
                  as: "celebProfile"
                }
              },
              { $unwind: "$celebProfile" },
              {
                $match: {
                  $and: [
                    { celebProfile: { $ne: [] } },
                    { "celebProfile.isCeleb": true },
                    { "celebProfile._id": { $ne: ObjectId(id) } }
                  ]
                }
              },
              {
                $project: {
                  _id: 0,
                  celebProfile: 1
                }
              }
            ],
            function (err, data) {
              if (err) {
                return res.json({
                  success: 0,
                  token: req.headers['x-access-token'],
                  message: `${err}`
                });
              }
              return res.json({
                success: 1,
                token: req.headers['x-access-token'],
                data: data
              });
            }
          );
        } else {
          res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: "No Preferences set for the Member"
          });
        }
      });
    } else {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: "User Not Exists / Send a valid UserID"
      });
    }
  });
});
// End of get Celebrities By Selected Preferences

// get Celebrities By Preferences By Country
router.get("/getCelebritiesByPreferencesByCountry/:UserID/:countryCode", function (req, res) {
  id = req.params.UserID;
  country = req.params.countryCode;

  User.findById(id, function (err, result) {
    if (err) {
      return res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      MemberPreferences.findOne({ memberId: result._id }, function (
        err,
        newresult
      ) {
        if (err) return res.send(err);
        if (newresult) {
          // Aggregate Memberpreferences MemberIds with User collection's UserIds
          MemberPreferences.aggregate(
            [
              { $match: { preferences: { $in: newresult.preferences } } },
              {
                $lookup: {
                  from: "users",
                  localField: "memberId",
                  foreignField: "_id",
                  as: "celebProfile"
                }
              },
              { $unwind: "$celebProfile" },
              {
                $match: {
                  $and: [
                    { celebProfile: { $ne: [] } },
                    { "celebProfile.isCeleb": true },
                    { "celebProfile.country": country }
                  ]
                }
              },
              {
                $project: {
                  _id: 0,
                  celebProfile: 1
                }
              }
            ],
            function (err, data) {
              if (err) {
                return res.json({
                  success: 0,
                  token: req.headers['x-access-token'],
                  message: `${err}`
                });
              }
              return res.json({
                success: 1,
                token: req.headers['x-access-token'],
                data: data
              });
            }
          );
        }
      });
    } else {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        error: "User Not Exists / Send a valid UserID"
      });
    }
  });
}
);
// End of get Celebrities By Preferences By Country

// get Fans By Selected Preferences
router.get("/getFansBySelectedPreferences/:userId", function (req, res) {
  id = req.params.userId;

  User.findById(id, function (err, result) {
    if (err) {
      return res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      MemberPreferences.findOne({ memberId: result._id }, function (
        err,
        newresult
      ) {
        if (err) {
          return res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: `${err}`
          });
        }
        if (newresult) {
          // Aggregate Memberpreferences MemberIds with User collection's UserIds
          MemberPreferences.aggregate(
            [
              { $match: { preferences: { $in: newresult.preferences } } },
              {
                $lookup: {
                  from: "users",
                  localField: "memberId",
                  foreignField: "_id",
                  as: "memberProfile"
                }
              },
              { $unwind: "$memberProfile" },
              {
                $match: {
                  $and: [
                    { celebProfile: { $ne: [] } },
                    { "memberProfile.isCeleb": false }
                  ]
                }
              },
              {
                $project: {
                  _id: 0,
                  memberProfile: 1
                }
              }
            ],
            function (err, data) {
              if (err) {
                res.send(err);
              }
              return res.json({
                success: 1,
                token: req.headers['x-access-token'],
                data: data
              });
            }
          );
        } else {
          res.json({
            success: 0,
            token: req.headers['x-access-token'],
            error: "No Preferences set for the Member"
          });
        }
      });
    } else {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        error: "User Not Exists / Send a valid UserID"
      });
    }
  });
});
// End of get Fans By Selected Preferences

// following celebrities by a Member
router.get("/followingCelebritiesByMember/:userId", function (req, res) {
  id = req.params.userId;

  MemberPreferences.aggregate(
    [
      { $match: { $and: [{ memberId: ObjectId(id) }] } },
      { $unwind: "$celebrities" },
      { $match: { $and: [{ "celebrities.isFollower": true }] } },
      {
        $lookup: {
          from: "users",
          localField: "celebrities.CelebrityId",
          foreignField: "_id",
          as: "celebProfile"
        }
      },
      {
        $sort: {
          "celebProfile.firstName": 1
        }
      },
      {
        $match: {
          $and: [
            { "celebProfile._id": { $ne: ObjectId(id) } },
            { celebProfile: { $ne: [] } }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          celebProfile: 1
        }
      }
    ],
    function (err, data) {
      if (err) {
        return res.json({
          success: 0,
          token: req.headers['x-access-token'],
          message: `${err}`
        });
      }
      if (data.length > 0) {
        return res.json({
          success: 1,
          token: req.headers['x-access-token'],
          data: data
        });
      } else {
        res.json({
          success: 1,
          token: req.headers['x-access-token'],
          message: "No followers",
          data: []
        });
      }
    }
  );
});
// End of following celebrities by a Member

//pagignation


// Fan Celebrities by a Member
router.get("/fanCelebritiesbyMember/:userId", function (req, res) {
  id = req.params.userId;

  MemberPreferences.aggregate(
    [
      { $match: { $and: [{ memberId: ObjectId(id) }] } },
      { $unwind: "$celebrities" },
      { $match: { $and: [{ "celebrities.isFan": true }] } },
      {
        $lookup: {
          from: "users",
          localField: "celebrities.CelebrityId",
          foreignField: "_id",
          as: "celebProfile"
        }
      },
      {
        $sort: {
          "celebProfile.firstName": 1
        }
      },
      {
        $match: {
          $and: [
            { "celebProfile._id": { $ne: ObjectId(id) } },
            { celebProfile: { $ne: [] } }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          celebProfile: 1
        }
      }
    ],
    function (err, data) {
      if (err) {
        res.send(err);
      }
      if (data.length > 0) {
        return res.json({
          success: 1,
          token: req.headers['x-access-token'],
          data: data
        });
      } else {
        res.json({
          success: 1,
          token: req.headers['x-access-token'],
          message: "No Fans",
          data: []
        });
      }
    }
  );
});


//pagignation



// MemberPreferences.aggregate(
//   [
//     {
//       $match: { celebrities: { $elemMatch: { CelebrityId: ObjectId("5bcda16c1325b505040e0819"), isFollower: true } } }
//     },
//     {
//       $lookup: {
//           from: "users",
//           localField: "memberId",
//           foreignField: "_id",
//           as: "memberProfile"
//         }
//     },
//     {
//       $match:{ "memberProfile.IsDeleted": { $ne: true },memberProfile: { $ne: [] } }
//     },
//     {
//       $count: "followerCount"
//     }
//   ],(err,followerCount)=>{
//     if(err)
//     {

//     }else{
//       MemberPreferences.aggregate(
//         [
//           {
//             $match: { celebrities: { $elemMatch: { CelebrityId: ObjectId("5afbd42e95a40d59e36cb3b8"), isFan: true } } }
//           },
//           {
//           $lookup: {
//               from: "users",
//               localField: "memberId",
//               foreignField: "_id",
//               as: "memberProfile"
//             }
//           },
//           {
//             $match:{ "memberProfile.IsDeleted": { $ne: true },memberProfile: { $ne: [] } }
//           },
//           {
//             $count: "fancount"
//           }
//         ],(err,fancount)=>{
//           if(err)
//           {

//           }else{
//             console.log(followerCount)
//             console.log(fancount)
//           }
//         }
//       )
//     }
//   })


// Following Members by a Celebrity
router.get("/followingMembersbyCelebrity/:CelebId", function (req, res) {
  id = req.params.CelebId;

  MemberPreferences.aggregate(
    [
      // { $match: { "celebrities.CelebrityId": { $in: [ObjectId(id)] } } },
      // { $unwind: "$celebrities" },
      {
        $match: { celebrities: { $elemMatch: { CelebrityId: ObjectId(id), isFollower: true } } }
      },
      {
        $lookup: {
          from: "users",
          localField: "memberId",
          foreignField: "_id",
          as: "memberProfile"
        }
      },
      {
        $sort: {
          "memberProfile.firstName": 1
        }
      },
      {
        $match:
          // {
          // $and: [
          //   { "memberProfile._id": { $ne: ObjectId(id) } },
          // { },
          { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
        //   ]
        // }
      },
      {
        $project: {
          _id: 0,
          memberProfile: 1,
          count: 1
        }
      }
    ],
    function (err, data) {
      if (err) {
        return res.json({
          success: 0,
          token: req.headers['x-access-token'],
          message: `${err}`
        });
      }
      if (data.length > 0) {

        return res.json({
          success: 1,
          token: req.headers['x-access-token'],
          data: data
        });
      } else {
        res.json({
          success: 1,
          token: req.headers['x-access-token'],
          message: "Not following anyone",
          data: []
        });
      }
    }
  );
});
// End of Following Members by a Celebrity



// Fan Members by a Celebrity
router.get("/fanMembersbyCelebrity/:CelebId", (req, res) => {
  id = req.params.CelebId;

  MemberPreferences.aggregate(
    [
      // { $match: { "celebrities.CelebrityId": { $in: [ObjectId(id)] } } },
      // { $unwind: "$celebrities" },
      {
        $match: { celebrities: { $elemMatch: { CelebrityId: ObjectId(id), isFan: true } } }
      },
      {
        $lookup: {
          from: "users",
          localField: "memberId",
          foreignField: "_id",
          as: "memberProfile"
        }
      },
      {
        $sort: {
          "memberProfile.firstName": 1
        }
      },
      {
        $match:
          //  {
          //     $and: [
          //       { "memberProfile._id": { $ne: ObjectId(id) } },
          { memberProfile: { $ne: [] } }
        //     ]
        //   }
      },
      {
        $project: {
          _id: 0,
          memberProfile: 1
        }
      }
    ],
    function (err, data) {
      if (err) {
        return res.json({
          success: 0,
          token: req.headers['x-access-token'],
          message: `${err}`
        });
      }
      if (data.length > 0) {
        res.json({
          success: 1,
          token: req.headers['x-access-token'],
          data: data
        });
      } else {
        res.json({
          success: 1,
          token: req.headers['x-access-token'],
          message: "No fan",
          data: []
        });
      }
    }
  );
});
// End of Fan Members by a Celebrity

// Get Profile Activity for a Member
router.get("/getProfileActivityCountsByMemberId/:memberId", (req, res) => {
  let memberId = req.params.memberId;

  // followingCelebritiesByMember
  MemberPreferences.aggregate(
    [
      { $match: { $and: [{ "celebrities.CelebrityId": ObjectId(memberId) }, { "celebrities.isFollower": true }] } },
      {
        $lookup: {
          from: "users",
          localField: "memberId",
          foreignField: "_id",
          as: "celebProfile"
        }
      },
      {
        $project: {
          _id: 1,
          celebrities: 1,
          celebProfile: 1
        }
      }
    ],
    function (err, following) {
      if (err) {
        return res.json({
          success: 0,
          token: req.headers['x-access-token'],
          message: `${err}`
        });
      }
      MemberPreferences.aggregate(
        [
          { $match: { $and: [{ "celebrities.CelebrityId": ObjectId(memberId) }, { "celebrities.isFan": true }] } },
          {
            $lookup: {
              from: "users",
              localField: "memberId",
              foreignField: "_id",
              as: "celebProfile"
            }
          },
          {
            $project: {
              _id: 1,
              celebrities: 1,
              celebProfile: 1
            }
          }
        ],
        function (err, fan) {
          if (err) {
            return res.json({
              success: 0,
              token: req.headers['x-access-token'],
              message: `${err}`
            });
          }
          MemberPreferences.aggregate(
            [
              { $match: { $and: [{ memberId: ObjectId(memberId) }] } },
              { $unwind: "$celebrities" },
              { $match: { $and: [{ "celebrities.isFollower": true }] } },
              {
                $lookup: {
                  from: "users",
                  localField: "celebrities.CelebrityId",
                  foreignField: "_id",
                  as: "celebProfile"
                }
              },
              {
                $match: {
                  $and: [
                    { "celebProfile._id": { $ne: ObjectId(memberId) } },
                    { celebProfile: { $ne: [] } }
                  ]
                }
              },
              {
                $project: {
                  _id: 0,
                  celebProfile: 1
                }
              }
            ],
            function (err, fCbm) {
              if (err) {
                return res.json({
                  success: 0,
                  token: req.headers['x-access-token'],
                  message: `${err}`
                });
              }
              fCbmCount = fCbm.length;
              MemberPreferences.aggregate(
                [
                  { $match: { $and: [{ memberId: ObjectId(memberId) }] } },
                  { $unwind: "$celebrities" },
                  { $match: { $and: [{ "celebrities.isFan": true }] } },
                  {
                    $lookup: {
                      from: "users",
                      localField: "celebrities.CelebrityId",
                      foreignField: "_id",
                      as: "celebProfile"
                    }
                  },
                  {
                    $match: {
                      $and: [
                        { "celebProfile._id": { $ne: ObjectId(memberId) } },
                        { celebProfile: { $ne: [] } }
                      ]
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      celebProfile: 1
                    }
                  }
                ],
                function (err, faCbm) {
                  if (err) {
                    return res.json({
                      success: 0,
                      token: req.headers['x-access-token'],
                      message: `${err}`
                    });
                  }
                  faCbmCount = faCbm.length;

                  // followingMembersbyCelebrity
                  MemberPreferences.aggregate(
                    [
                      {
                        $match: {
                          "celebrities.CelebrityId": { $in: [ObjectId(memberId)] }
                        }
                      },
                      { $unwind: "$celebrities" },
                      {
                        $match: {
                          $and: [
                            { "celebrities.isFollower": true },
                            { "celebrities.CelebrityId": ObjectId(memberId) }
                          ]
                        }
                      },
                      {
                        $lookup: {
                          from: "users",
                          localField: "memberId",
                          foreignField: "_id",
                          as: "memberProfile"
                        }
                      },
                      {
                        $match: {
                          $and: [
                            { "memberProfile._id": { $ne: ObjectId(memberId) } },
                            { memberProfile: { $ne: [] } }
                          ]
                        }
                      },
                      {
                        $project: {
                          _id: 0,
                          memberProfile: 1
                        }
                      }
                    ],
                    function (err, fMbc) {
                      if (err) {
                        res.send(err);
                      }
                      fMbcCount = fMbc.length;

                      // fanMembersbyCelebrity
                      MemberPreferences.aggregate(
                        [
                          {
                            $match: {
                              "celebrities.CelebrityId": { $in: [ObjectId(memberId)] }
                            }
                          },
                          { $unwind: "$celebrities" },
                          {
                            $match: {
                              $and: [
                                { "celebrities.isFan": true },
                                { "celebrities.CelebrityId": ObjectId(memberId) }
                              ]
                            }
                          },
                          {
                            $lookup: {
                              from: "users",
                              localField: "memberId",
                              foreignField: "_id",
                              as: "memberProfile"
                            }
                          },
                          {
                            $match: {
                              $and: [
                                { "memberProfile._id": { $ne: ObjectId(memberId) } },
                                { memberProfile: { $ne: [] } }
                              ]
                            }
                          },
                          {
                            $project: {
                              _id: 0,
                              memberProfile: 1
                            }
                          }
                        ],
                        function (err, faMbc) {
                          if (err) {
                            return res.json({
                              success: 0,
                              token: req.headers['x-access-token'],
                              message: `${err}`
                            });
                          }
                          faMbcCount = faMbc.length;
                          //isDelete: true

                          // Posts Created Count
                          Feed.find({ memberId: memberId, isDelete: false }, function (err, fResult) {
                            if (err) {
                              return res.json({
                                success: 0,
                                token: req.headers['x-access-token'],
                                message: `${err}`
                              });
                            }

                            feedCount = fResult.length;

                            // Orders Count 

                            orders.find({ memberId: memberId }, function (err, oResult) {
                              if (err) {
                                return res.json({
                                  success: 0,
                                  token: req.headers['x-access-token'],
                                  message: `${err}`
                                });
                              }

                              orderCount = oResult.length;

                              res.json({
                                success: 1, token: req.headers['x-access-token'], data: {
                                  memberId: memberId,
                                  posts: feedCount,
                                  fans: faMbcCount,
                                  followers: fMbcCount,
                                  orders: orderCount,
                                  fan: fan.length,
                                  following: following.length
                                }
                              });

                              // Posts Followed
                              /* Feedlog.find(
                                {
                                  $and: [{ memberId: memberId }, { activities: "follow" }]
                                },
                                function(err, foResult) {
                                  if (err) return res.send(err);
                                  foCount = foResult.length;
          
                                  res.json({
                                    memberId: memberId,
                                    posts: feedCount + foCount,
                                    fans: fCbmCount + fMbcCount,
                                    followers: faCbmCount + faMbcCount
                                  });
                                }
                              ); */
                            }); /// End of Orders Count
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        });
    });

});
// End of Get Profile Activity for a Member

// Get Celeb Status by Member
router.get("/getCelebStatusByMember/:celebID/:memberID", (req, res) => {
  celebID = req.params.celebID;
  memberID = req.params.memberID;

  MemberPreferences.findOne({ memberId: memberID }, function (err, newresult) {
    if (err) {
      return res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (newresult) {
      // Filter Celebrities array wit memberID
      let Arr = newresult.celebrities;
      myArr = Arr.filter(function (obj) {
        return obj.CelebrityId == celebID;
      });
      res.json({ token: req.headers['x-access-token'], success: 1, data: myArr });
    } else {
      let newRecord = new MemberPreferences({
        memberId: memberID,
        //preferences: preferences,
        //celebrities: celebrities,
        createdBy: "celebkonect"
      });
      MemberPreferences.createNewRecord(newRecord, function (err, user) {
        if (err) {
          res.json({
            success: 0,
            token: req.headers['x-access-token'],
            message: `${err}`
          });
        } else {
          res.json({ success: 1, token: req.header['x-access-token'], data: user });
        }
      });
      // res.json({ token: req.headers['x-access-token'], success: 0, message: "No data found!" });
    }
  });
});
// End of Get Celeb Status by Member
router.get('/checkCurrentMemberIsFan/:memberId/:receiverId', (req, res) => {
  let isFan = false;
  User.findById(ObjectId(req.params.receiverId), (err, userObj) => {
    if (err) {
      return res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    else {
      if (userObj != null && userObj.isCeleb == true) {

        // MemberPreferences.aggregate([
        //   {
        //     $match:{
        //       memberId: ObjectId(req.params.memberId)
        //     }
        //   },
        //   {
        //     $unwind:"$celebrities"
        //   },
        //   {
        //     $project:{
        //       isFan :{
        //         $eq:["$celebrities.CelebrityId",req.params.receiverId]
        //       }
        //     }
        //   }
        // ],()=>{

        // })
        MemberPreferences.findOne({ memberId: ObjectId(req.params.memberId) }, (err, memberPreferencesObj) => {
          if (err) {
            return res.json({
              success: 0,
              token: req.headers['x-access-token'],
              message: `${err}`
            });
          }
          else {
            isFan = false;
            if (memberPreferencesObj) {
              isFan = memberPreferencesObj.celebrities.some((memPreObj) => {
                let celebId = memPreObj.CelebrityId;
                celebId = "" + celebId;
                return (celebId == req.params.receiverId && memPreObj.isFan == true)
              })
            }

            return res.status(200).json({ success: 1, token: req.header['x-access-token'], data: isFan })
          }
        })
      } else {
        return res.status(200).json({ success: 1, token: req.header['x-access-token'], data: isFan })
      }
    }
  })


})

//desc make dummy fan/follow
//method POST
//access private
router.post('/makeVertualFollower', MemberPreferencesController.makeVertualFollower)

//desc get users details blocked by celebrity
//method GET
//access public
router.get('/getBlockUserList/:celebrityId/:pagination_Date', MemberPreferencesController.getBlockUserList)
router.get('/getAllBlockUser/:createdAt/:limit', MemberPreferencesController.getAllBlockUser)
router.get('/getAllUnfanWithReason/:createdAt/:limit', MemberPreferencesController.getAllUnfanWithReason)
router.get('/getUnfanWithReasonByCelebrityId/:memberId/:createdAt/:limit', MemberPreferencesController.getUnfanWithReasonByCelebrityId)
router.post('/unblockMember', MemberPreferencesController.unblockMember)
router.get('/getBlockersList/:memberId', MemberPreferencesController.getBlockersList)
router.get("/followingMembersbyCelebrity/:celebId/:createdAt/:limit", MemberPreferencesController.followingMembersbyCelebrity);
router.get("/fanMembersbyCelebrity/:celebId/:createdAt/:limit", MemberPreferencesController.fanMembersbyCelebrity);
router.get("/followingCelebritiesByMember/:userId/:createdAt/:limit", MemberPreferencesController.followingCelebritiesByMember);
router.get("/fanCelebritiesbyMember/:userId/:createdAt/:limit", MemberPreferencesController.fanCelebritiesbyMember);

module.exports = router;
