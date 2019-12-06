let express = require("express");
let mongoose = require("mongoose");
const config = require('../../config/config');
let userService = require('./userService');
let router = express.Router();
let passport = require("passport");
var mySms = require('../../smsConfig');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('b4gGeksBlAv54P_igkBH-w');
let LocalStrategy = require("passport-local").Strategy;
let multer = require("multer");
var stringify = require("json-stringify");
let ObjectId = require("mongodb").ObjectID;
var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
let bcrypt = require("bcryptjs");
let transport = require("../../routes/email").transport;
let User = require("./userModel");
let comLog = require("../comLog/comLogModel");
// let email = require("../../routes/email");
let Feed = require("../../models/feeddata");
let MemberPreferences = require("../memberpreferences/memberpreferencesModel");
let logins = require("../loginInfo/loginInfoModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
// let Notification = require("../notification/notificationModel");
let celebrityContract = require("../celebrityContract/celebrityContractsModel");
let MemberMedia = require('../memberMedia1/memberMediaModel');
let Credits = require("../credits/creditsModel");
let userController = require('./userController');
// let FeedBackModel = require('../feedback/feedbackModel');
let ReferralCode = require('../referralCode/referralCodeModel');
let jwt = require('../../jwt/jwt');
let slotMaster = require("../slotMaster/slotMasterModel");
let LoginModel = require("../loginInfo/loginInfoModel")
// const ActivityLog = require("../activityLog/activityLogService");
const LiveTimeLog = require("../liveTimeLog/liveTimeLogModel");


let preferenceServices = require('../preferences/preferenceServices');
let memberPreferenceServices = require('../memberpreferences/memberPreferenceServices');

//mandrill code start
var nodemailer = require("nodemailer");

var mandrillTransport = require("nodemailer-mandrill-transport");
//End madrill code

// Multer Settings code start
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avtars/");
  },
  filename: function (req, file, cb) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
  }
});

let upload = multer({
  storage: storage
});

//End Multer settings code


// Start get Member by user_id using through socket
router.get("/getMember/:user_id", userController.getUserDetailsById);
// End get Member by user_id

// get Member by mobileNumber start
router.get("/getMemberBymobileNumber/:mobileNumber", function (req, res, next) {
  let mobileNumber = req.params.mobileNumber;

  User.getUserBymobileNumber(mobileNumber, function (err, result) {
    if (result == null) {
      res.json({
        error: "Please enter valid mobileNumber"
      });
    } else {
      res.send(result);
    }
  });
});
// End get Member by mobileNumber

// get Member by email start
router.get("/getMemberByEmail/:email", function (req, res, next) {
  let email = req.params.email;

  User.getUserByEmail(email, function (err, result) {
    if (result == null) {
      res.json({
        success: 0,
        message: `Please enter valid email ${err}`,
        token: req.headers['x-access-token']
      });
    } else {
      res.json({
        success: 1,
        data: result,
        token: req.headers['x-access-token']
      });
    }
  });
});
// End get Member by email

// Get Online Celebrities List
router.get("/getOnlineCelebrities/:userID", (req, res, next) => {
  celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
    if (err) {
      res.json({ usersDetail: null, err: err })
    }
    else {
      let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
      let id = req.params.userID;
      let celebrities = [];
      User.findOnlineCelebrities(objectIdArray, (err, listOfOnlineCelebraties) => {
        if (err) {
          res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching online celebraties! by user ID" });
        } else {
          MemberPreferences.findOne({ memberId: ObjectId(id) }, {}, (err, listOfMyPreferences) => {
            //console.log("listOfMyPreferences",listOfMyPreferences);
            if (err) {
              console.log(err);
            } else {

              if (listOfMyPreferences) {
                celebrities = listOfMyPreferences.celebrities;
              }
              if (celebrities === undefined) {
                celebrities = [];
              }
              let _id, username, isOnline, isCeleb, lastName, firstName, imageRatio, avtar_imgPath, aboutMe, profession;
              let onlineCelebritiesObj = {};
              let onlineCelebritiesArray = [];
              let isFan = false
              let isFollower = false;
              for (let j = 0; j < listOfOnlineCelebraties.length; j++) {
                let onlineMemberObj = {};
                onlineMemberObj = listOfOnlineCelebraties[j];
                let onleneMemberId = onlineMemberObj._id;
                if ("" + onleneMemberId == id) {
                  listOfOnlineCelebraties.splice(j, 1);
                }
              }
              for (let i = 0; i < listOfOnlineCelebraties.length; i++) {
                onlineCelebritiesObj = {};
                let onlineCelebrityObj = listOfOnlineCelebraties[i];
                let userId = listOfOnlineCelebraties[i]._id;
                userId = "" + userId;
                //console.log(userId);
                //console.log(typeof userId);
                for (var j = 0; j < celebrities.length; j++) {
                  let preferencesCelebId = celebrities[j].CelebrityId;
                  preferencesCelebId = "" + preferencesCelebId
                  if (userId === preferencesCelebId && celebrities[j].isFan) {
                    //console.log("IS Fan True");
                    isFan = true;
                  }
                  if (userId === preferencesCelebId && celebrities[j].isFollower) {
                    //console.log("IS Follower True");
                    isFollower = true;
                  }
                }
                onlineCelebritiesObj.isFan = isFan;
                onlineCelebritiesObj.isFollower = isFollower;
                onlineCelebritiesObj._id = onlineCelebrityObj._id;
                onlineCelebritiesObj.username = onlineCelebrityObj.username;
                onlineCelebritiesObj.isCeleb = onlineCelebrityObj.isCeleb;
                onlineCelebritiesObj.isOnline = onlineCelebrityObj.isOnline;
                onlineCelebritiesObj.lastName = onlineCelebrityObj.lastName;
                onlineCelebritiesObj.firstName = onlineCelebrityObj.firstName;
                onlineCelebritiesObj.imageRatio = onlineCelebrityObj.imageRatio;
                onlineCelebritiesObj.avtar_imgPath = onlineCelebrityObj.avtar_imgPath;
                onlineCelebritiesObj.aboutMe = onlineCelebrityObj.aboutMe;
                onlineCelebritiesObj.profession = onlineCelebrityObj.profession;
                listOfOnlineCelebraties[i] = onlineCelebritiesObj;
                isFollower = false;
                isFan = false;
              }
              res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfOnlineCelebraties })
            }
          });
        }
      });
    }
  })
});
// End of Get Online Celebrities List

//changed to put
router.put("/editUser/:memberId", upload.any(), (req, res) => {
  let reqbody = JSON.parse(req.body.profile);
  reqbody.preferenceId = ObjectId(reqbody.categoryId);
  let id = req.params.memberId;
  let profilepic = req.files;
  // console.log(profilepic);
  // console.log(reqbody);
  let updateField = reqbody;
  let pushField = {};
  let mimetype, size;
  let updateDoc = reqbody;
  let query2;
  if (profilepic && profilepic.length) {
    for (let i = 0; i < profilepic.length; i++) {
      if (profilepic[i].fieldname == "profilePic") {
        reqbody.avtar_imgPath = profilepic[i].path;
        mimetype = profilepic[i].mimetype;
        size = profilepic[i].size;
        reqbody.avtar_originalname = profilepic[i].originalname;
        query2 = {}
        updateDoc = { $set: reqbody, $push: { pastProfileImages: { avtar_imgPath: reqbody.avtar_imgPath, mimetype: mimetype, size: size } } }
      } else if (profilepic[i].fieldname == "coverPic") {
        reqbody.cover_imgPath = profilepic[i].path;
        reqbody.cover_originalname = profilepic[i].originalname;

        if (profilepic.length == 1) {
          updateDoc = { $set: reqbody }
        }
        if (profilepic.length == 2) {
          updateDoc = { $set: reqbody, $push: { pastProfileImages: { avtar_imgPath: reqbody.avtar_imgPath, mimetype: mimetype, size: size } } }
        }
      } else {
      }
    }
  }
  else {
    updateDoc = { $set: reqbody }
  }
  // console.log(updateDoc);
  User.findByIdAndUpdate(id, updateDoc, { new: true }, function (err, result) {
    if (err)
      return res.send(err);
    else if (!result || result == null) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: "Profile not found." + id });
    }
    // console.log(reqbody)
    if ((reqbody.email && reqbody.isEmailVerified) || (reqbody.mobileNumber && reqbody.isMobileVerified)) {
      let query = {
        $or: [
          { email: result.email },
          { mobileNumber: { $regex: result.mobileNumber } }
        ]
      }
      // console.log(query)
      LoginModel.updateMany(query, updateDoc, (err, loginUpdate) => {
        if (err) {
          return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        } else if (loginUpdate) {
          res.json({ token: req.headers['x-access-token'], success: 1, message: "Profile Updated Successfully", data: reqbody });
        }
      })
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, message: "Profile Updated Successfully", data: reqbody });
    }
  });
});

//get deatils of own progfile
router.get("/getAllDetailsOfCelebrity/:celebrityId", (req, res) => {
  let celebrityId = ObjectId(req.params.celebrityId);
  let arr1;
  let arr2;
  Credits.findOne({ memberId: celebrityId }, { cumulativeCreditValue: 1, referralCreditValue: 1, memberId: 1 }, (err, credits) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, err: err, credits: null, userDetails: null, fanFollowingFollowerFeedCount: null, celebContracts: null, memberMedia: null })
    }
    else {
      if (!credits) {
        var credits = {
          "memberId": celebrityId,
          "referralCreditValue": 0,
          "cumulativeCreditValue": 0
        }
      }
      User.aggregate([
        {
          $match: {
            _id: celebrityId
          }
        },
        {
          $lookup: {
            from: "countries",
            localField: "country",
            foreignField: "dialCode",
            as: "countryDetails"
          }
        },
        {
          $unwind: {
            path: "$countryDetails",
            preserveNullAndEmptyArrays: true
          }
        }
      ], (err, userDetails) => {
        if (err || userDetails.length < 0) {
          res.json({ token: req.headers['x-access-token'], success: 0, err: err, credits: credits, userDetails: null, fanFollowingFollowerFeedCount: null, celebContracts: null, memberMedia: null })
        }
        else {
          userDetails = userDetails[0];
          MemberPreferences.aggregate([
            {
              $match: {
                $or: [
                  { memberId: celebrityId },
                  { "celebrities.CelebrityId": { $in: [celebrityId] } }
                ]
              }
            },
            {
              $unwind: "$celebrities"
            },
            {
              "$facet": {
                "Followers": [
                  { "$match": { "celebrities.CelebrityId": celebrityId, "celebrities.isFollower": true } },
                  { "$count": "Followers" }
                ],
                "fan": [
                  { "$match": { "celebrities.CelebrityId": celebrityId, "celebrities.isFan": true } },
                  { "$count": "fan" }
                ],
                "FanOf": [
                  { "$match": { memberId: celebrityId, "celebrities.isFan": true } },
                  { "$count": "FanOf" }
                ],
                "Following": [
                  { "$match": { memberId: celebrityId, "celebrities.isFollower": true } },
                  { "$count": "Following" }
                ]
              }
            }
          ], (err, fanFollowerCount) => {
            if (err) {
              console.log(err)
              res.json({ token: req.headers['x-access-token'], success: 0, err: err, credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: null, celebContracts: null, memberMedia: null })
            }
            else {
              let fanFollowingFollowerFeedCount = {
                UrFanOf: fanFollowerCount[0].FanOf.length ? fanFollowerCount[0].FanOf[0].FanOf : 0,
                Following: fanFollowerCount[0].Following.length ? fanFollowerCount[0].Following[0].Following : 0,
                fanOfUr: fanFollowerCount[0].fan.length ? fanFollowerCount[0].fan[0].fan : 0,
                Followers: fanFollowerCount[0].Followers.length ? fanFollowerCount[0].Followers[0].Followers : 0
              }
              // media: { $ne: [] }
              Feed.countDocuments({ memberId: celebrityId, isDelete: false }, (err, feedCount) => {
                if (err) {
                  console.log(err)
                  res.json({ token: req.headers['x-access-token'], success: 0, err: err, credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: null, memberMedia: null })
                }
                else {
                  fanFollowingFollowerFeedCount.feedCount = feedCount;
                  celebrityContract.aggregate([
                    {
                      $match: {
                        memberId: req.params.celebrityId,
                        $or: [
                          { serviceType: "audio" },
                          { serviceType: "video" },
                          { serviceType: "chat" }
                        ]
                      }
                    },
                    {
                      $group: {
                        _id: {
                          memberId: "$memberId"
                        },
                        celebrityContract: {
                          $push: {
                            serviceType: "$serviceType",
                            managerSharePercentage: "$managerSharePercentage",
                            charitySharePercentage: "$charitySharePercentage",
                            promoterSharePercentage: "$promoterSharePercentage",
                            sharingPercentage: "$sharingPercentage",
                            serviceCredits: "$serviceCredits",
                          }
                        }
                      }
                    }
                  ], (err, celebContracts) => {
                    if (err) {
                      console.log(err)
                      res.json({ token: req.headers['x-access-token'], success: 0, err: err, credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: null, memberMedia: null })
                    }
                    else {
                      celebContracts = celebContracts.length ? celebContracts[0].celebrityContract : null;
                      MemberMedia.aggregate([
                        {
                          $match: {
                            memberId: celebrityId
                          }
                        },
                        {
                          $unwind: "$media"
                        },
                        {
                          $group: {
                            _id: "$media.mediaType",
                            media: {
                              $push: {
                                src: "$media.src",
                                mediaSize: "$media.mediaSize",
                                mediaRatio: "$media.mediaRatio",
                                status: "$media.status",
                                _id: "$media._id",
                                mediaType: "$media.mediaType",
                                createdAt: "$media.createdAt"
                              }
                            }
                          }
                        }
                      ], (err, memberMedia) => {
                        if (err) {
                          // console.log(err)
                          res.json({ token: req.headers['x-access-token'], success: 0, err: err, credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: null })
                        }
                        else {
                          arr1 = memberMedia.filter((media) => {
                            if (media._id == "image") {
                              return media.media
                            }
                          })

                          arr2 = memberMedia.filter((media) => {
                            if (media._id == "gif") {
                              return media.media
                            }
                          })
                          memberMedia.map((media) => {
                            // if (media._id == "image") {
                            //   if (arr1[0] && arr2[0] && arr1[0].media.length && arr2[0].media.length)
                            //     media.media = mergeTwo(arr1[0].media, arr2[0].media);
                            //   // console.log(memberMedia.media.length)
                            //}
                            media.media = media.media.reverse()
                          })
                          MemberPreferences.aggregate(
                            [
                              {
                                $match: { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFollower: true } } }
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
                                $match: { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
                              },
                              {
                                $count: "followerCount"
                              }
                            ], (err, followerCount) => {
                              if (err) {
                                res.json({ success: 1, token: req.headers['x-access-token'], data: { credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia } })
                              } else {
                                if (followerCount[0] && followerCount[0].followerCount) {
                                  fanFollowingFollowerFeedCount.Followers = followerCount[0].followerCount;
                                }
                                MemberPreferences.aggregate(
                                  [
                                    {
                                      $match: { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFan: true } } }
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
                                      $match: { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
                                    },
                                    {
                                      $count: "fancount"
                                    }
                                  ], (err, fancount) => {
                                    if (err) {
                                      res.json({ success: 1, token: req.headers['x-access-token'], data: { credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia } })
                                    } else {
                                      // console.log(followerCount)
                                      // console.log(fancount)
                                      if (fancount[0] && fancount[0].fancount) {
                                        fanFollowingFollowerFeedCount.fanOfUr = fancount[0].fancount;
                                        res.json({ success: 1, token: req.headers['x-access-token'], data: { credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia } })
                                      }
                                      else {
                                        res.json({ success: 1, token: req.headers['x-access-token'], data: { credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia } })
                                      }
                                    }
                                  }
                                )
                              }
                            })
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  }).sort({ createdAt: -1 }).limit(1)
})
//get details of own profile end


//check user passwrod is default or not
router.get('/isPasswordverified/:memberId', userController.isPasswordverified);

//new by count fan follow
router.get('/getAllCelebrityListForMember/:memberId', userController.getAllCelebrityListForMember1);


router.put('/memberRegistrationAndProfileUpdate/:memberId', upload.any(), userController.memberRegistrationAndProfileUpdate);

//get details of own profile end using throught socket
router.get('/checkOnLineUserIsCelebrityOrNot/:member_Id', userController.checkOnLineUserIsCelebrityOrNot)

// Get Online Celebrities List using throught socket
router.get("/getOnlineCelebrities", function (req, res, next) {
  celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
    if (err) {
      return res.json({ usersDetail: null, err: err })
    }
    else {
      let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
      User.findOnlineCelebritiesForSocket(objectIdArray, (err, listOfOnlineCelebraties) => {
        if (err) {
          return res.status(404).json({ success: 0, message: "Error while fetching online celebraties! by user ID" });
        } else {
          //console.log(listOfOnlineCelebraties)
          return res.status(200).json({ success: 1, data: listOfOnlineCelebraties })
        }
      });
    }
  });
});

//// recently commented 10-11-2019 using through Socket only
router.post('/getCurrentToken', (req, res) => {
  if (req.body.userId) {
    logins.findOne({ memberId: ObjectId(req.body.userId) }, { deviceToken: 1, token: 1, _id: 1 }, (err, loginInfo) => {
      if (err) {
        console.log("err", err);
        //res.json({ success: 0, data: null })
      }
      else {
        User.findOne({ _id: ObjectId(req.body.userId) }, { _id: 1 }, (err, userInfo) => {
          if (err) {
            console.log("err", err);
            //res.json({ success: 0, data: null })
          }
          else {
            // console.log(loginInfo)
            // console.log(userInfo)
            return res.json({ success: 1, data: { loginInfo: loginInfo, userInfo: userInfo } })
          }
        })
      }
    })
  }
})
// End of Get Online Celebrities List



router.post("/editUser", upload.any(), function (req, res) {
  // console.log(req.body);
  let reqbody = req.body;
  // reqbody.preferenceId = ObjectId(req.body.categoryId);
  let id = req.body.id;
  let profilepic = req.files;
  // console.log(reqbody);
  // console.log("++++++++++++++++++++++++++++++++++++++++++++++++++===");
  // if (Object.keys(reqbody).length == 0) {
  //   res.json({ token: req.headers['x-access-token'], success: 0, message: "Please fill the data" });
  // } else {
  // Start of Else 
  let updateDoc = reqbody;
  if (profilepic && profilepic.length) {
    reqbody.avtar_imgPath = req.files[0].path;
    let mimetype = req.files[0].mimetype;
    let size = req.files[0].size;
    reqbody.avtar_originalname = req.files[0].originalname;
    updateDoc = { $set: reqbody, $push: { pastProfileImages: { avtar_imgPath: reqbody.avtar_imgPath, mimetype: mimetype, size: size } } }
  }
  // if (profilepic && profilepic.length > 0) {
  //   reqbody.avtar_imgPath = req.files[0].path;
  //   reqbody.avtar_originalname = req.files[0].originalname;
  // }
  User.findByIdAndUpdate(id, updateDoc, { new: true }, function (err, result) {
    if (err) return res.send(err);
    else if (!result || result == null) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: "User Not Exists / Send a valid UserID " + id });
    }
    let body = {
      memberId: id
    }
    // ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Profile", body, (err, newActivityLog) => {
    //   if (err) {
    //     // res.json({success: 0,message: "Please try again." + err});
    //   } else {

    //   }
    // })
    return res.json({ token: req.headers['x-access-token'], success: 1, message: "Profile updated successfully", data: req.body });
    // return res.json({token:req.headers['x-access-token'],success:0,message:err});
  });
  // }
});
// End Edit User by UserID




// Get Online Celebrities List
// router.put("/getOnlineCelebrities", function (req, res, next) {
//   celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
//     if (err) {
//       console.log("err", err);
//       //res.json({ usersDetail: null, err: err })
//     }
//     else {
//       let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
//       let id = req.params.userID;
//       let celebrities = [];
//       User.findOnlineCelebrities(objectIdArray, (err, listOfOnlineCelebraties) => {
//         if (err) {
//           console.log("err", err);
//           //res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching online celebraties! by user ID" });
//         } else {
//           MemberPreferences.findOne({ memberId: ObjectId(id) }, {}, (err, listOfMyPreferences) => {
//             // console.log("listOfMyPreferences", listOfMyPreferences);
//             if (err) {
//               console.log(err);
//             } else {

//               if (listOfMyPreferences) {
//                 celebrities = listOfMyPreferences.celebrities;
//               }
//               if (celebrities === undefined) {
//                 celebrities = [];
//               }
//               let _id, username, isOnline, isCeleb, lastName, firstName, imageRatio, avtar_imgPath, aboutMe, profession;
//               let onlineCelebritiesObj = {};
//               let onlineCelebritiesArray = [];
//               let isFan = false
//               let isFollower = false;
//               for (let j = 0; j < listOfOnlineCelebraties.length; j++) {
//                 let onlineMemberObj = {};
//                 onlineMemberObj = listOfOnlineCelebraties[j];
//                 let onleneMemberId = onlineMemberObj._id;
//                 if ("" + onleneMemberId == id) {
//                   listOfOnlineCelebraties.splice(j, 1);
//                 }
//               }
//               for (let i = 0; i < listOfOnlineCelebraties.length; i++) {
//                 onlineCelebritiesObj = {};
//                 let onlineCelebrityObj = listOfOnlineCelebraties[i];
//                 let userId = listOfOnlineCelebraties[i]._id;
//                 userId = "" + userId;
//                 //console.log(userId);
//                 //console.log(typeof userId);
//                 for (var j = 0; j < celebrities.length; j++) {
//                   let preferencesCelebId = celebrities[j].CelebrityId;
//                   preferencesCelebId = "" + preferencesCelebId
//                   if (userId === preferencesCelebId && celebrities[j].isFan) {
//                     //console.log("IS Fan True");
//                     isFan = true;
//                   }
//                   if (userId === preferencesCelebId && celebrities[j].isFollower) {
//                     //console.log("IS Follower True");
//                     isFollower = true;
//                   }
//                 }
//                 onlineCelebritiesObj.isFan = isFan;
//                 onlineCelebritiesObj.isFollower = isFollower;
//                 onlineCelebritiesObj._id = onlineCelebrityObj._id;
//                 onlineCelebritiesObj.username = onlineCelebrityObj.username;
//                 onlineCelebritiesObj.isCeleb = onlineCelebrityObj.isCeleb;
//                 onlineCelebritiesObj.isOnline = onlineCelebrityObj.isOnline;
//                 onlineCelebritiesObj.lastName = onlineCelebrityObj.lastName;
//                 onlineCelebritiesObj.firstName = onlineCelebrityObj.firstName;
//                 onlineCelebritiesObj.imageRatio = onlineCelebrityObj.imageRatio;
//                 onlineCelebritiesObj.avtar_imgPath = onlineCelebrityObj.avtar_imgPath;
//                 onlineCelebritiesObj.aboutMe = onlineCelebrityObj.aboutMe;
//                 onlineCelebritiesObj.profession = onlineCelebrityObj.profession;
//                 listOfOnlineCelebraties[i] = onlineCelebritiesObj;
//                 isFollower = false;
//                 isFan = false;
//               }
//               res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfOnlineCelebraties })
//             }
//           });
//         }
//       });
//     }
//   })
//   // let query = { $and: [{ isCeleb: true }, { _id: { $ne: id } }, {isOnline : true}] };
// });
// End of Get Online Celebrities List

// Register code start
// router.get("/register", function (req, res, err) {
//   res.send(err);
// });

//End Register code

// Login code start
// router.get("/login", function (req, res) {
//   res.json({
//     message: "Please enter valid email id or password"
//   });
// });

// Start MemberRegistrations  
//Delete
// router.post("/memberRegistrations", upload.any(), (req, res) => {
//   let email = (req.body.email).toLowerCase();
//   let username = (req.body.username).toLowerCase();
//   let password = req.body.password;
//   let confirmPassword = req.body.confirmPassword;
//   let mobileNumber = req.body.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
//   let role = req.body.role;
//   let referralCode = req.body.referralCode;
//   let country = req.body.country;
//   let loginType = req.body.loginType;
//   let osType = req.body.osType;

//   let mobile = country.concat(mobileNumber).substr(1);
//   req.checkBody("email", "Email is required").notEmpty();
//   req.checkBody("mobileNumber", "mobileNumber is required").notEmpty();
//   req.checkBody("username", "username is required").notEmpty();
//   req.checkBody("role", "role is required").notEmpty();
//   req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
//   req.checkBody("loginType", "loginType is required").notEmpty();
//   User.findOne({ $or: [{ email }, { username }, { mobileNumber: mobile }] }, { _id: 1, email: 1, username: 1, mobileNumber: 1 }, (err, existingUser) => {
//     if (err) {
//       return res.json({ success: 0, message: "Please try again", err: err });
//     }
//     else if (existingUser) {
//       let mobile = country.concat(mobileNumber).substr(1);
//       if (existingUser.email == email) {
//         return res.json({ success: 0, message: "Email id already in use." });
//       } else if (existingUser.username == username) {
//         return res.json({ success: 0, message: "Username already in use." });
//       }
//       else if (existingUser.mobileNumber == mobile) {
//         return res.json({ success: 0, message: "Mobile number already in use." });
//       }
//       else {
//         return res.json({ success: 0, message: "User Already Exist" });
//       }
//     } else {
//       let errors = req.validationErrors();
//       let profilepic = req.files;
//       if (errors) {
//         res.json({ success: 0, errors: errors });
//       } else {
//         if (profilepic && profilepic.length > 0) {
//           let avtar_imgPath = req.files[0].path;
//           let avtar_originalname = req.files[0].originalname;
//           let newUser = new User({
//             email: email,
//             username: username,
//             password: password,
//             mobileNumber: mobile,
//             role: role,
//             loginType: loginType,
//             country: country,
//             referralCode: referralCode,
//             osType: osType,
//           });

//           User.createUser(newUser, function (err, userDetails) {
//             if (err) {
//               res.json({ success: 0, message: "Unable to registered", err: err });
//             } else {
//               var mobile = country.concat(mobileNumber).substr(1);
//               let newLoginInfo = new logins({
//                 email: email,
//                 username: username,
//                 password: password,
//                 mobileNumber: mobile,
//                 deviceToken: req.body.deviceToken,
//                 timezone: req.body.timezone,
//                 country: req.body.country,
//                 osType: osType
//               });
//               logins.createLoginInfo(newLoginInfo, (err, user) => {
//                 if (err) {
//                   return res.json({ success: 0, message: "Please try again", err: err });
//                 } else {
//                   res.json({ success: 1, message: "Your registration has been submitted successfully. Please verify your account details through your email/phone number.", data: { userInfo: userDetails, loginInfo: userLoginObj } });
//                   let newComLog = new comLog({
//                     mode_ids: ["email"],
//                     event: "register",
//                     from_addr: "admin@celebkonect.com",
//                     to_addr: userDetails.email,
//                     content: req.body.content,
//                     gateway_response: req.body.gateway_response,
//                     username: req.body.username
//                   });

//                   comLog.createComLog(newComLog, function (err, user) {
//                     if (err) {
//                       res.send(err);
//                     } else {
//                       crypto.randomBytes(20, function (err, buf) {

//                         //// NEW TOKEN GENERATOR
//                         var token = Math.floor(100000 + Math.random() * 900000);
//                         /// END OF NEW TOKEN GENERATOR
//                         let url = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyEmail/" + userDetails.email + "/" + token;
//                         let mobileurl = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyMobile/" + userDetails.email;

//                         // Get LoginInfo By Email and Update Email Verification Code
//                         let id = userDetails._id;
//                         let newbody = {};
//                         newbody.updated_at = new Date();
//                         newbody.emailVerificationCode = token;
//                         newbody.mobileVerificationCode = token;
//                         let reqBody = {};
//                         reqBody.mobileNumber = userDetails.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
//                         reqBody.regToken = token;

//                         mySms.sendSms(reqBody, function (err, result) {
//                           if (err) {
//                             console.log(err);
//                           } else {
//                             //console.log('OTP Sent');

//                           }
//                         });

//                         User.findByIdAndUpdate(id, newbody, function (err, result) { });

//                         // End of Get LoginInfo By Email and Update Email Verification Code

//                         var template_name = "reg";
//                         var template_content = [
//                           {
//                             name: "verifyurl",
//                             content: url
//                           },
//                           {
//                             name: "username",
//                             content: username
//                           },
//                           {
//                             name: "verifymobile",
//                             content: mobileurl
//                           },
//                           {
//                             name: "mobileToken",
//                             content: token
//                           }
//                         ];
//                         var message = {
//                           subject: "Registration Successful",
//                           from_email: "admin@celebkonect.com",
//                           from_name: "CelebKonect",
//                           to: [
//                             {
//                               email: userDetails.email,
//                               name: userDetails.email,
//                               type: "to"
//                             }
//                           ],
//                           headers: {
//                             "Reply-To": "admin@celebkonect.com"
//                           },
//                           important: false,
//                           track_opens: null,
//                           track_clicks: null,
//                           auto_text: null,
//                           auto_html: null,
//                           inline_css: null,
//                           url_strip_qs: null,
//                           preserve_recipients: null,
//                           view_content_link: null,
//                           tracking_domain: null,
//                           signing_domain: null,
//                           return_path_domain: null,
//                           merge: true,
//                           merge_language: "mailchimp",
//                           global_merge_vars: [
//                             {
//                               name: "verifyurl",
//                               content: url
//                             },
//                             {
//                               name: "username",
//                               content: username
//                             },
//                             {
//                               name: "verifymobile",
//                               content: mobileurl
//                             },
//                             {
//                               name: "mobileToken",
//                               content: token
//                             }
//                           ],
//                           merge_vars: [
//                             {
//                               "rcpt": userDetails.email,
//                               "vars": [
//                                 {
//                                   name: "verifyurl",
//                                   content: url
//                                 },
//                                 {
//                                   name: "username",
//                                   content: username
//                                 },
//                                 {
//                                   name: "verifymobile",
//                                   content: mobileurl
//                                 },
//                                 {
//                                   name: "mobileToken",
//                                   content: token
//                                 }
//                               ]
//                             }
//                           ],

//                         };
//                         var async = false;
//                         var ip_pool = "Main Pool";
//                         // var send_at = new Date();
//                         mandrill_client.messages.sendTemplate(
//                           {
//                             template_name: template_name,
//                             template_content: template_content,
//                             message: message,
//                             async: async,
//                             ip_pool: ip_pool
//                           },
//                           function (result) {
//                             console.log({ message: "comLog saved sucessfully" });
//                           },
//                           function (e) {
//                             console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//                           }
//                         );
//                       });
//                     }
//                   });
//                   let rCode = userDetails.referralCode;
//                   ReferralCode.findOne({ memberCode: rCode }, (err, refResult) => {
//                     if (err) {
//                       return res.json({ success: 0, message: "Please try again", err: err });
//                     }
//                     else if (refResult) {
//                       var fName = userDetails.firstName;
//                       var fRes = fName.substring(0, 3);
//                       var lName = userDetails.lastName;
//                       var lRes = lName.substring(0, 2);
//                       var token = Math.floor(Math.random() * 100000 + 54);
//                       var memberCode = fRes.toUpperCase() + lRes.toUpperCase() + "-" + token;
//                       let newCredits = new Credits({
//                         memberId: userDetails._id,
//                         creditType: "promotion",
//                         creditValue: parseInt(0),
//                         cumulativeCreditValue: parseInt(0),
//                         referralCreditValue: refResult.referralCreditValue,
//                         memberReferCreditValue: refResult.memberReferCreditValue,
//                         createdBy: userDetails.fName,
//                         memberCode: memberCode
//                       });
//                       Credits.createCredits(newCredits, (err, credits) => {
//                         if (err) {
//                           return res.json({ success: 0, message: "Please try again", err: err });
//                         } else {
//                           oldValue = parseInt(userDetails.cumulativeEarnings);
//                           /// Check if Refree is Celebrity Or Not
//                           let isRefCeleb;
//                           User.findOne({ _id: refResult.memberId }, (err, refCeleb) => {
//                             //console.log("Refeceleb user object == ")
//                             //console.log(refCeleb)
//                             if (err) {
//                               return res.json({ success: 0, message: "Please try again", err: err });
//                             }
//                             if (refCeleb) {
//                               if (refCeleb.isCeleb == true) {
//                                 isRefCeleb = true;
//                               }
//                             }

//                             let fBody = {};
//                             fBody.cumulativeEarnings =
//                               parseInt(refResult.referralCreditValue) + oldValue;
//                             if (isRefCeleb == true) {
//                               fBody.celebCredits = refResult.referralCreditValue + "-" + refResult.memberId;
//                             } else {
//                               fBody.celebCredits = 0 + "-" + refResult.memberId;
//                             }
//                             User.findByIdAndUpdate(userDetails._id, fBody, (err, upResult) => { });
//                             let myBody = {};
//                             let nId = userDetails._id;
//                             // Change RefCreditValue to the logged in user
//                             myBody.refCreditValue = true;
//                             logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                             // End of Change RefCreditValue to the logged in User
//                           });
//                           /// End of Check if Refree is Celebrity Or Not
//                           // Insert Credits to the Referred Celebrity / Member
//                           // Start of Fetch Latest Credits Information
//                           Credits.find({ memberId: refResult.memberId }, null, { sort: { createdAt: -1 } }, (err, cBal) => {
//                             if (err) {
//                               return res.json({ success: 0, message: "Please try again", err: err });
//                             }
//                             if (cBal) {
//                               cBalObj = cBal[0];
//                               newReferralCreditValue = cBalObj.referralCreditValue + parseInt(refResult.referreCreditValue);
//                               let newCredits = new Credits({
//                                 memberId: refResult.memberId,
//                                 creditType: "promotion",
//                                 cumulativeCreditValue: cBalObj.cumulativeCreditValue,
//                                 creditValue: refResult.referralCreditValue,
//                                 referralCreditValue: newReferralCreditValue,
//                                 memberReferCreditValue: refResult.memberReferCreditValue,
//                               });
//                               // Insert Into Credit Table
//                               Credits.createCredits(newCredits, (err, credits) => {
//                                 if (err) {
//                                   return res.json({ success: 0, message: "Please try again", err: err });
//                                 } else {
//                                   /* res.send({
//                                     message: "Credits updated successfully",
//                                     creditsData: credits
//                                   }); */

//                                   // Update Cumulative earnings in User Object
//                                   User.findOne({ _id: refResult.memberId }, (err, nuResult) => {
//                                     nId = nuResult._id;
//                                     oldValue = parseInt(nuResult.cumulativeEarnings);
//                                     let newbody1 = {};
//                                     newbody1.cumulativeEarnings = refResult.referralCreditValue + oldValue;
//                                     User.findByIdAndUpdate(nId, newbody1, (err, upResult) => { });
//                                   });
//                                   // end of Update Cumulative earnings in User Object
//                                 }
//                               });
//                               // End of Inset into Credit Table
//                             } else {
//                               //  console.log("credits not exists");
//                             }
//                           }
//                           ); // End of Create Credits
//                           // End of Insert Credits to the Referred Celebrity / Member
//                         }
//                       });
//                     } else {
//                       let newCredits = new Credits({
//                         memberId: userDetails._id,
//                         creditType: "promotion",
//                         creditValue: parseInt(0),
//                         cumulativeCreditValue: parseInt(0),
//                         referralCreditValue: parseInt(0),
//                         memberReferCreditValue: parseInt(0),
//                         createdBy: userDetails.fName
//                       });

//                       Credits.createCredits(newCredits, (err, credits) => {
//                         if (err) {
//                           return res.json({ success: 0, message: "Please try again", err: err });
//                         } else {
//                           let myBody = {};
//                           let nId = userDetails._id;
//                           myBody.refCreditValue = true;

//                           logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                         }
//                       });
//                     }
//                   });
//                   // });
//                   // End of Insert Referred Credits to the User and Celebrity
//                   // }
//                 }
//               });
//               userService.createDefaultSettingsForNewUser(userDetails._id)
//             }
//           });
//         } else {
//           var mobile = country.concat(mobileNumber).substr(1);
//           let newUser = new User({
//             email: email,
//             username: username,
//             password: password,
//             mobileNumber: mobile,
//             role: role,
//             loginType: loginType,
//             country: country,
//             referralCode: referralCode,
//             osType: osType,
//           });

//           User.createUser(newUser, function (err, userDetails) {
//             if (err) {
//               res.json({ success: 0, message: "Unable to registered", err: err });
//             } else {
//               var mobile = country.concat(mobileNumber).substr(1);
//               let newLoginInfo = new logins({
//                 email: email,
//                 username: username,
//                 password: password,
//                 mobileNumber: mobile,
//                 osType: osType,
//               });
//               logins.createLoginInfo(newLoginInfo, (err, userLoginObj) => {
//                 if (err) {
//                   return res.json({ success: 0, message: "Please try again", err: err });
//                 } else {
//                   res.json({ success: 1, message: "Your registration has been submitted successfully. Please verify your account details through your email/phone number.", data: { userInfo: userDetails, loginInfo: userLoginObj } });
//                   let newComLog = new comLog({
//                     mode_ids: ["email"],
//                     event: "register",
//                     from_addr: "admin@celebkonect.com",
//                     to_addr: userDetails.email,
//                     content: req.body.content,
//                     gateway_response: req.body.gateway_response
//                   });
//                   preferenceServices.findPreference([], (err, defaultPreferencesObj) => {
//                     if (err)
//                       throw err
//                     else {
//                       //console.log(defaultPreferencesObj);
//                       let memberPreferenceJson = {};
//                       memberPreferenceJson.memberId = userDetails._id;
//                       memberPreferenceJson.preferences = defaultPreferencesObj;
//                       memberPreferenceServices.saveMemberPreference(memberPreferenceJson, (err, memberPreferenceObj) => {
//                         if (err)
//                           throw err
//                         else {
//                           //console.log(memberPreferenceObj);
//                         }
//                       });
//                     }
//                   });
//                   comLog.createComLog(newComLog, function (err, user) {
//                     if (err) {
//                       res.send(err);
//                     } else {
//                       crypto.randomBytes(20, function (err, buf) {

//                         //// NEW TOKEN GENERATOR
//                         var token = Math.floor(100000 + Math.random() * 900000);
//                         /// END OF NEW TOKEN GENERATOR
//                         let url = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyEmail/" + userDetails.email + "/" + token;
//                         let mobileurl = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyMobile/" + userDetails.email;
//                         // Get LoginInfo By Email and Update Email Verification Code
//                         let id = userDetails._id;
//                         let newbody = {};
//                         newbody.updated_at = new Date();
//                         newbody.emailVerificationCode = token;
//                         newbody.mobileVerificationCode = token;
//                         let reqBody = {};
//                         reqBody.mobileNumber = userDetails.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
//                         reqBody.regToken = token;

//                         mySms.sendSms(reqBody, function (err, result) {
//                           if (err) {
//                             console.log(err);
//                           } else {
//                             //console.log('OTP Sent');

//                           }
//                         });

//                         User.findByIdAndUpdate(id, newbody, function (err, result) { });

//                         // End of Get LoginInfo By Email and Update Email Verification Code

//                         var template_name = "reg";
//                         var template_content = [
//                           {
//                             name: "verifyurl",
//                             content: url
//                           },
//                           {
//                             name: "verifymobile",
//                             content: mobileurl
//                           },
//                           {
//                             name: "mobileToken",
//                             content: token
//                           }
//                         ];
//                         var message = {
//                           subject: "Registration Successful",
//                           from_email: "admin@celebkonect.com",
//                           from_name: "CelebKonect",
//                           to: [
//                             {
//                               email: userDetails.email,
//                               name: userDetails.email,
//                               type: "to"
//                             }
//                           ],
//                           headers: {
//                             "Reply-To": "keystroke99@gmail.com"
//                           },
//                           important: false,
//                           track_opens: null,
//                           track_clicks: null,
//                           auto_text: null,
//                           auto_html: null,
//                           inline_css: null,
//                           url_strip_qs: null,
//                           preserve_recipients: null,
//                           view_content_link: null,
//                           tracking_domain: null,
//                           signing_domain: null,
//                           return_path_domain: null,
//                           merge: true,
//                           merge_language: "mailchimp",
//                           global_merge_vars: [
//                             {
//                               name: "verifyurl",
//                               content: url
//                             },
//                             {
//                               name: "verifymobile",
//                               content: mobileurl
//                             },
//                             {
//                               name: "mobileToken",
//                               content: token
//                             }
//                           ],
//                           merge_vars: [
//                             {
//                               "rcpt": userDetails.email,
//                               "vars": [
//                                 {
//                                   name: "verifyurl",
//                                   content: url
//                                 },
//                                 {
//                                   name: "verifymobile",
//                                   content: mobileurl
//                                 },
//                                 {
//                                   name: "mobileToken",
//                                   content: token
//                                 }
//                               ]
//                             }
//                           ],

//                         };
//                         var async = false;
//                         var ip_pool = "Main Pool";
//                         // var send_at = new Date();
//                         mandrill_client.messages.sendTemplate(
//                           {
//                             template_name: template_name,
//                             template_content: template_content,
//                             message: message,
//                             async: async,
//                             ip_pool: ip_pool
//                           },
//                           function (result) {
//                             console.log({ message: "comLog saved sucessfully" });
//                           },
//                           function (e) {
//                             console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//                           }
//                         );
//                       });
//                     }
//                   });

//                   let rCode = userDetails.referralCode;
//                   ReferralCode.findOne({ memberCode: rCode }, (err, refResult) => {
//                     if (err) {
//                       return res.json({ success: 0, message: "Please try again", err: err });
//                     }
//                     else if (refResult) {
//                       var fName = userDetails.firstName;
//                       var fRes = fName.substring(0, 3);
//                       var lName = userDetails.lastName;
//                       var lRes = lName.substring(0, 2);
//                       var token = Math.floor(Math.random() * 100000 + 54);
//                       var memberCode = fRes.toUpperCase() + lRes.toUpperCase() + "-" + token;
//                       let newCredits = new Credits({
//                         memberId: userDetails._id,
//                         creditType: "promotion",
//                         creditValue: parseInt(0),
//                         cumulativeCreditValue: parseInt(0),
//                         referralCreditValue: refResult.referralCreditValue,
//                         memberReferCreditValue: refResult.memberReferCreditValue,
//                         createdBy: userDetails.fName,
//                         memberCode: memberCode
//                       });
//                       Credits.createCredits(newCredits, (err, credits) => {
//                         if (err) {
//                           return res.json({ success: 0, message: "Please try again", err: err });
//                         } else {
//                           oldValue = parseInt(userDetails.cumulativeEarnings);
//                           /// Check if Refree is Celebrity Or Not
//                           let isRefCeleb;
//                           User.findOne({ _id: refResult.memberId }, (err, refCeleb) => {
//                             //console.log("Refeceleb user object == ")
//                             //console.log(refCeleb)
//                             if (err) {
//                               return res.json({ success: 0, message: "Please try again", err: err });
//                             }
//                             if (refCeleb) {
//                               if (refCeleb.isCeleb == true) {
//                                 isRefCeleb = true;
//                               }
//                             }

//                             let fBody = {};
//                             fBody.cumulativeEarnings =
//                               parseInt(refResult.referralCreditValue) + oldValue;
//                             if (isRefCeleb == true) {
//                               fBody.celebCredits = refResult.referralCreditValue + "-" + refResult.memberId;
//                             } else {
//                               fBody.celebCredits = 0 + "-" + refResult.memberId;
//                             }
//                             User.findByIdAndUpdate(userDetails._id, fBody, (err, upResult) => { });
//                             let myBody = {};
//                             let nId = userDetails._id;
//                             // Change RefCreditValue to the logged in user
//                             myBody.refCreditValue = true;
//                             logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                             // End of Change RefCreditValue to the logged in User
//                           });
//                           /// End of Check if Refree is Celebrity Or Not
//                           // Insert Credits to the Referred Celebrity / Member
//                           // Start of Fetch Latest Credits Information
//                           Credits.find({ memberId: refResult.memberId }, null, { sort: { createdAt: -1 } }, (err, cBal) => {
//                             if (err) {
//                               return res.json({ success: 0, message: "Please try again", err: err });
//                             }
//                             if (cBal) {
//                               cBalObj = cBal[0];
//                               newReferralCreditValue = cBalObj.referralCreditValue + parseInt(refResult.referreCreditValue);
//                               let newCredits = new Credits({
//                                 memberId: refResult.memberId,
//                                 creditType: "promotion",
//                                 cumulativeCreditValue: cBalObj.cumulativeCreditValue,
//                                 creditValue: refResult.referralCreditValue,
//                                 referralCreditValue: newReferralCreditValue,
//                                 memberReferCreditValue: cBalObj.memberReferCreditValue,
//                               });
//                               // Insert Into Credit Table
//                               Credits.createCredits(newCredits, (err, credits) => {
//                                 if (err) {
//                                   return res.json({ success: 0, message: "Please try again", err: err });
//                                 } else {
//                                   /* res.send({
//                                     message: "Credits updated successfully",
//                                     creditsData: credits
//                                   }); */

//                                   // Update Cumulative earnings in User Object
//                                   User.findOne({ _id: refResult.memberId }, (err, nuResult) => {
//                                     nId = nuResult._id;
//                                     oldValue = parseInt(nuResult.cumulativeEarnings);
//                                     let newbody1 = {};
//                                     newbody1.cumulativeEarnings = refResult.referralCreditValue + oldValue;
//                                     User.findByIdAndUpdate(nId, newbody1, (err, upResult) => { });
//                                   });
//                                   // end of Update Cumulative earnings in User Object
//                                 }
//                               });
//                               // End of Inset into Credit Table
//                             } else {
//                               //  console.log("credits not exists");
//                             }
//                           }
//                           ); // End of Create Credits
//                           // End of Insert Credits to the Referred Celebrity / Member
//                         }
//                       });
//                     } else {
//                       let newCredits = new Credits({
//                         memberId: userDetails._id,
//                         creditType: "promotion",
//                         creditValue: parseInt(0),
//                         cumulativeCreditValue: parseInt(0),
//                         referralCreditValue: parseInt(0),
//                         memberReferCreditValue: parseInt(0),
//                         createdBy: userDetails.fName
//                       });

//                       Credits.createCredits(newCredits, (err, credits) => {
//                         if (err) {
//                           return res.json({ success: 0, message: "Please try again", err: err });
//                         } else {
//                           let myBody = {};
//                           let nId = userDetails._id;
//                           myBody.refCreditValue = true;

//                           logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                         }
//                       });
//                     }
//                   });
//                   //   // End of Insert Referred Credits to the User and Celebrity
//                   // }
//                 }
//               });
//               userService.createDefaultSettingsForNewUser(userDetails._id)
//             }
//           });
//         }
//       }
//     }
//   });
// });
// End MemberRegistrations  


// Register User using social logins start
//Delete
// router.post("/socialRegister", upload.any(), function (req, res) {
//   const reqbody = JSON.parse(req.body.profile);
//   let profilepic = req.files;

//   // Validation
//   // console.log(reqbody)
//   if (!reqbody.username && !reqbody.username.length)
//     return res.json({ success: 0, message: "Username is required" })
//   else if (!reqbody.email && !reqbody.email.length)
//     return res.json({ success: 0, message: "Email is required" })
//   else if (!reqbody.loginType && !reqbody.loginType.length)
//     return res.json({ success: 0, message: "Login Type is required" })
//   else if (!reqbody.deviceToken && !reqbody.deviceToken.length)
//     return res.json({ success: 0, message: "Device Token is required" })
//   // req.checkBody("username", "Name is required").notEmpty();
//   // req.checkBody("email", "Email is required").notEmpty();
//   // req.checkBody("mobileNumber", "mobileNumber is required").notEmpty();
//   // req.checkBody("loginType", "loginType is required").notEmpty();
//   // req.checkBody("deviceToken", "deviceToken is required").notEmpty();
//   let osType = reqbody.osType;
//   let name = reqbody.name;
//   let email = (reqbody.email).toLowerCase();
//   let username = (reqbody.username).toLowerCase();
//   let password = reqbody.password;
//   let confirmPassword = reqbody.confirmPassword;
//   let preferences = reqbody.preferences;
//   let location = reqbody.location;
//   let country = reqbody.country;
//   let mobile = '';
//   // console.log(reqbody.mobileNumber)
//   let mobileNumber = reqbody.mobileNumber;
//   if (mobileNumber)
//     mobile = country.concat(mobileNumber).substr(1);
//   let role = reqbody.role;
//   let loginType = reqbody.loginType;
//   let gender = reqbody.gender;
//   let imageRatio = reqbody.imageRatio;
//   let dateOfBirth = reqbody.dateOfBirth;
//   let address = reqbody.address;
//   let lastName = reqbody.lastName;
//   let prefix = reqbody.prefix;
//   let aboutMe = reqbody.aboutMe;
//   let profession = reqbody.profession;
//   let firstName = reqbody.firstName;
//   let created_at = reqbody.created_at;
//   let lastLoginDate = new Date();
//   let updated_at = reqbody.updated_at;
//   let created_by = reqbody.created_by;
//   let updated_by = reqbody.updated_by;
//   let celebToManager = reqbody.celebToManager;
//   let isCeleb = reqbody.isCeleb;
//   let isTrending = reqbody.isTrending;
//   let isOnline = reqbody.isOnline;
//   let isEditorChoice = reqbody.isEditorChoice;
//   let isPromoted = reqbody.isPromoted;
//   let isDeleted = reqbody.isDeleted;
//   let celebRecommendations = reqbody.celebRecommendations;
//   let userCategory = reqbody.userCategory;
//   let author_status = reqbody.author_status;
//   let referralCode = reqbody.referralCode;
//   let isEmailVerified = true;
//   let Dnd = reqbody.Dnd;
//   let deviceToken = reqbody.deviceToken;

//   // console.log(mobile)
//   //1st If user is not unique, return error start

//   User.findOne({ $or: [{ email }, { username }, { mobileNumber: mobile }] }, { passport: 0 }, (err, existingUser) => {
//     if (err) { return next(err); }
//     if (mobileNumber)
//       mobile = country.concat(mobileNumber).substr(1);
//     // 2nd If user is not unique, return error start
//     if (existingUser) {
//       if (existingUser.email == email) {
//         logins.findOneAndUpdate({ email: email }, { token: token, deviceToken: deviceToken, lastLoginDate: lastLoginDate }, { new: true }, (err, loginInfo) => {
//           if (err) {
//             return res.json({ success: 0, message: "Authentication Fail" });
//           }
//           else if (loginInfo) {
//             var token = jwt.createToken(existingUser._id)
//             logins.findOneAndUpdate({ email: email }, { token: token, deviceToken: deviceToken, lastLoginDate: lastLoginDate }, { new: true }, (err, loginInfo) => {
//               if (err) {
//                 return res.json({ success: 0, message: "Authentication Fail" });
//               }
//               else if (loginInfo) {
//                 Credits.findOne({ memberId: ObjectId(existingUser._id) }, (err, creditInfo) => {
//                   if (err) {
//                     return res.json({ success: 0, message: "Please try again later" + err });
//                   }
//                   else {
//                     return res.json({ success: 1, message: "Success", data: { userInfo: existingUser, loginInfo: loginInfo, creditInfo: creditInfo }, token: token });
//                   }
//                 }).sort({ createdAt: -1 }).limit(1);
//               }
//             });
//           }
//           else {
//             var token = jwt.createToken(existingUser._id)
//             // newbody.lastLoginDate = new Date();
//             let newLoginInfo = new logins({
//               email: email,
//               username: username,
//               password: password,
//               mobileNumber: mobile,
//               deviceToken: deviceToken,
//               lastLoginDate: new Date(),
//               token: token
//             });
//             logins.createLoginInfo(newLoginInfo, (err, loginInfo) => {
//               if (err) {
//                 res.json({ success: 0, message: "Please try again", err: err });
//               } else {
//                 Credits.findOne({ memberId: ObjectId(existingUser._id) }, (err, creditInfo) => {
//                   if (err) {
//                     return res.json({ success: 0, message: "Please try again later" + err });
//                   }
//                   else {
//                     return res.json({ success: 1, message: "Success", data: { userInfo: existingUser, loginInfo: loginInfo, creditInfo: creditInfo }, token: token });
//                   }
//                 }).sort({ createdAt: -1 }).limit(1);
//               }
//             })
//           }
//         })
//       } else if (existingUser.email != email && existingUser.username != username && existingUser.mobileNumber == mobile) {
//         return res.json({ success: 0, message: "Mobile number already in use" });
//       }
//       else if (existingUser.email != email && existingUser.username == username && existingUser.mobileNumber != mobile) {
//         return res.json({ success: 0, message: "Username already in use" });
//       } else {
//         var token = jwt.createToken(existingUser._id)
//         logins.findOneAndUpdate({ email: email }, { token: token, deviceToken: deviceToken, lastLoginDate: new Date() }, { new: true }, (err, loginInfo) => {
//           if (err) {
//             return res.json({ success: 0, message: "Authentication Fail" });
//           }
//           else if (loginInfo) {
//             return res.json({ success: 1, message: "Logged-in successfully", token: token, data: { userInfo: existingUser, loginInfo: loginInfo } });
//           }
//           else {
//             let newLoginInfo = new logins({
//               email: email,
//               username: username,
//               password: password,
//               mobileNumber: mobile,
//               deviceToken: deviceToken,
//               lastLoginDate: new Date(),
//               token: token
//             });
//             logins.createLoginInfo(newLoginInfo, (err, userLoginObj) => {
//               if (err) {
//                 return res.json({ success: 0, message: "Please try again", err: err });
//               } else {
//                 Credits.findOne({ memberId: ObjectId(existingUser._id) }, (err, creditInfo) => {
//                   if (err) {
//                     return res.json({ success: 0, message: "Please try again later" + err });
//                   }
//                   else {
//                     return res.json({ success: 1, message: "Logged-in successfully", data: { userInfo: existingUser, loginInfo: userLoginObj, creditInfo: creditInfo }, token: token });
//                   }
//                 }).sort({ createdAt: -1 }).limit(1);
//               }
//             })
//           }
//         })
//       }
//     }
//     else {
//       if (!reqbody.mobileNumber && !reqbody.mobileNumber.length)
//         return res.json({ success: 0, message: "Mobile number is required" })
//       let mobileNumber = reqbody.mobileNumber;
//       var mobile = country.concat(mobileNumber).substr(1);
//       // If User Does Not Exists start
//       let errors = req.validationErrors();
//       let profilepic = req.files;
//       if (errors) {
//         res.json({
//           success: 0,
//           message: errors
//         });
//         // Profile Pic code start here
//       } else if (profilepic && profilepic.length > 0) {
//         // if (profilepic.length > 0) {
//         var mobile = country.concat(mobileNumber).substr(1);
//         let avtar_imgPath = req.files[0].path;
//         let pastProfileImages = [avtar_imgPath]
//         let avtar_originalname = req.files[0].originalname;
//         let newUser = new User({
//           name: name,
//           email: email,
//           username: username,
//           password: password,
//           mobileNumber: mobile,
//           role: role,
//           loginType: loginType,
//           avtar_imgPath: avtar_imgPath,
//           avtar_originalname: avtar_originalname,
//           location: location,
//           country: country,
//           lastName: lastName,
//           prefix: prefix,
//           imageRatio: imageRatio,
//           aboutMe: aboutMe,
//           gender: gender,
//           dateOfBirth: dateOfBirth,
//           firstName: firstName,
//           celebRecommendations: celebRecommendations,
//           userCategory: userCategory,
//           isCeleb: isCeleb,
//           isDeleted: isDeleted,
//           isTrending: isTrending,
//           isOnline: isOnline,
//           isEditorChoice: isEditorChoice,
//           isPromoted: isPromoted,
//           created_at: created_at,
//           created_by: created_by,
//           updated_at: updated_at,
//           updated_by: updated_by,
//           lastLoginDate: new Date(),
//           celebToManager: celebToManager,
//           address: address,
//           preferences: preferences,
//           author_status: author_status,
//           isEmailVerified: isEmailVerified,
//           Dnd: Dnd,
//           referralCode: referralCode,
//           deviceToken: deviceToken,
//           osType: osType
//         });

//         User.createUser(newUser, (err, userDetails) => {
//           if (err) {
//             res.json({ success: 0, message: err })
//           } else {
//             var mobile = country.concat(mobileNumber).substr(1);
//             var token = jwt.createToken(userDetails._id)
//             let newLoginInfo = new logins({
//               email: email,
//               username: username,
//               password: password,
//               mobileNumber: mobile,
//               deviceToken: deviceToken,
//               token: token
//             });
//             logins.createLoginInfo(newLoginInfo, (err, userLoginObj) => {
//               console.log(userLoginObj)
//               if (err) {
//                 return res.json({ success: 0, message: "Please try again", err: err });
//               } else {
//                 res.json({ success: 1, message: "Your registration has been submitted successfully.", data: { userInfo: userDetails, loginInfo: userLoginObj }, token: token });
//                 let newComLog = new comLog({
//                   mode_ids: ["email"],
//                   event: "register",
//                   from_addr: "admin@celebkonect.com",
//                   to_addr: userDetails.email,
//                   content: reqbody.content,
//                   gateway_response: reqbody.gateway_response
//                 });
//                 preferenceServices.findPreference([], (err, defaultPreferencesObj) => {
//                   if (err)
//                     throw err
//                   else {
//                     //console.log(defaultPreferencesObj);
//                     let memberPreferenceJson = {};
//                     memberPreferenceJson.memberId = userDetails._id;
//                     memberPreferenceJson.preferences = defaultPreferencesObj;
//                     memberPreferenceServices.saveMemberPreference(memberPreferenceJson, (err, memberPreferenceObj) => {
//                       if (err)
//                         throw err
//                       else {
//                         //console.log(memberPreferenceObj);
//                       }
//                     });
//                   }
//                 });
//                 comLog.createComLog(newComLog, function (err, user) {
//                   if (err) {
//                     res.send(err);
//                   } else {
//                     crypto.randomBytes(20, function (err, buf) {

//                       //// NEW TOKEN GENERATOR
//                       var token = Math.floor(100000 + Math.random() * 900000);
//                       /// END OF NEW TOKEN GENERATOR
//                       let url = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyEmail/" + userDetails.email + "/" + token;
//                       let mobileurl = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyMobile/" + userDetails.email;
//                       // Get LoginInfo By Email and Update Email Verification Code
//                       let id = userDetails._id;
//                       let newbody = {};
//                       newbody.updated_at = new Date();
//                       newbody.emailVerificationCode = token;
//                       newbody.mobileVerificationCode = token;
//                       User.findByIdAndUpdate(id, newbody, function (err, result) { });

//                       // End of Get LoginInfo By Email and Update Email Verification Code

//                       var template_name = "reg";
//                       var template_content = [
//                         {
//                           name: "verifyurl",
//                           content: url
//                         },
//                         {
//                           name: "verifymobile",
//                           content: mobileurl
//                         },
//                         {
//                           name: "mobileToken",
//                           content: token
//                         }
//                       ];
//                       var message = {
//                         subject: "Registration Successful",
//                         from_email: "admin@celebkonect.com",
//                         from_name: "CelebKonect",
//                         to: [
//                           {
//                             email: userDetails.email,
//                             name: userDetails.email,
//                             type: "to"
//                           }
//                         ],
//                         headers: {
//                           "Reply-To": "keystroke99@gmail.com"
//                         },
//                         important: false,
//                         track_opens: null,
//                         track_clicks: null,
//                         auto_text: null,
//                         auto_html: null,
//                         inline_css: null,
//                         url_strip_qs: null,
//                         preserve_recipients: null,
//                         view_content_link: null,
//                         tracking_domain: null,
//                         signing_domain: null,
//                         return_path_domain: null,
//                         merge: true,
//                         merge_language: "mailchimp",
//                         global_merge_vars: [
//                           {
//                             name: "verifyurl",
//                             content: url
//                           },
//                           {
//                             name: "verifymobile",
//                             content: mobileurl
//                           },
//                           {
//                             name: "mobileToken",
//                             content: token
//                           }
//                         ],
//                         merge_vars: [
//                           {
//                             "rcpt": userDetails.email,
//                             "vars": [
//                               {
//                                 name: "verifyurl",
//                                 content: url
//                               },
//                               {
//                                 name: "verifymobile",
//                                 content: mobileurl
//                               },
//                               {
//                                 name: "mobileToken",
//                                 content: token
//                               }
//                             ]
//                           }
//                         ],

//                       };
//                       var async = false;
//                       var ip_pool = "Main Pool";
//                       // var send_at = new Date();
//                       mandrill_client.messages.sendTemplate(
//                         {
//                           template_name: template_name,
//                           template_content: template_content,
//                           message: message,
//                           async: async,
//                           ip_pool: ip_pool
//                         },
//                         function (result) {
//                           console.log({ message: "comLog saved sucessfully" });
//                         },
//                         function (e) {
//                           console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//                         }
//                       );
//                     });
//                   }
//                 });
//                 let rCode = userDetails.referralCode;
//                 console.log(rCode)
//                 if (rCode != null && rCode != undefined) {
//                   ReferralCode.findOne({ memberCode: rCode }, (err, refResult) => {
//                     if (err) {
//                       return res.json({ success: 0, message: "Please try again", err: err });
//                     }
//                     else if (refResult) {
//                       var fName = userDetails.firstName;
//                       var fRes = fName.substring(0, 3);
//                       var lName = userDetails.lastName;
//                       var lRes = lName.substring(0, 2);
//                       var token = Math.floor(Math.random() * 100000 + 54);
//                       var memberCode = fRes.toUpperCase() + lRes.toUpperCase() + "-" + token;
//                       let newCredits = new Credits({
//                         memberId: userDetails._id,
//                         creditType: "promotion",
//                         creditValue: parseInt(0),
//                         cumulativeCreditValue: parseInt(0),
//                         referralCreditValue: refResult.referralCreditValue,
//                         memberReferCreditValue: refResult.memberReferCreditValue,
//                         createdBy: userDetails.fName,
//                         memberCode: memberCode
//                       });
//                       Credits.createCredits(newCredits, (err, credits) => {
//                         if (err) {
//                           return res.json({ success: 0, message: "Please try again", err: err });
//                         } else {
//                           oldValue = parseInt(userDetails.cumulativeEarnings);
//                           /// Check if Refree is Celebrity Or Not
//                           let isRefCeleb;
//                           User.findOne({ _id: refResult.memberId }, (err, refCeleb) => {
//                             //console.log("Refeceleb user object == ")
//                             //console.log(refCeleb)
//                             if (err) {
//                               return res.json({ success: 0, message: "Please try again", err: err });
//                             }
//                             if (refCeleb) {
//                               if (refCeleb.isCeleb == true) {
//                                 isRefCeleb = true;
//                               }
//                             }

//                             let fBody = {};
//                             fBody.cumulativeEarnings =
//                               parseInt(refResult.referralCreditValue) + oldValue;
//                             if (isRefCeleb == true) {
//                               fBody.celebCredits = refResult.referralCreditValue + "-" + refResult.memberId;
//                             } else {
//                               fBody.celebCredits = 0 + "-" + refResult.memberId;
//                             }
//                             User.findByIdAndUpdate(userDetails._id, fBody, (err, upResult) => { });
//                             let myBody = {};
//                             let nId = userDetails._id;
//                             // Change RefCreditValue to the logged in user
//                             myBody.refCreditValue = true;
//                             logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                             // End of Change RefCreditValue to the logged in User
//                           });
//                           /// End of Check if Refree is Celebrity Or Not
//                           // Insert Credits to the Referred Celebrity / Member
//                           // Start of Fetch Latest Credits Information
//                           Credits.find({ memberId: refResult.memberId }, null, { sort: { createdAt: -1 } }, (err, cBal) => {
//                             if (err) {
//                               return res.json({ success: 0, message: "Please try again", err: err });
//                             }
//                             if (cBal) {
//                               cBalObj = cBal[0];
//                               newReferralCreditValue = cBalObj.referralCreditValue + parseInt(refResult.referreCreditValue);
//                               let newCredits = new Credits({
//                                 memberId: refResult.memberId,
//                                 creditType: "promotion",
//                                 cumulativeCreditValue: cBalObj.cumulativeCreditValue,
//                                 creditValue: refResult.referralCreditValue,
//                                 referralCreditValue: newReferralCreditValue,
//                                 memberReferCreditValue: cBalObj.memberReferCreditValue
//                               });
//                               // Insert Into Credit Table
//                               Credits.createCredits(newCredits, (err, credits) => {
//                                 if (err) {
//                                   return res.json({ success: 0, message: "Please try again", err: err });
//                                 } else {
//                                   /* res.send({
//                                     message: "Credits updated successfully",
//                                     creditsData: credits
//                                   }); */

//                                   // Update Cumulative earnings in User Object
//                                   User.findOne({ _id: refResult.memberId }, (err, nuResult) => {
//                                     nId = nuResult._id;
//                                     oldValue = parseInt(nuResult.cumulativeEarnings);
//                                     let newbody1 = {};
//                                     newbody1.cumulativeEarnings = refResult.referralCreditValue + oldValue;
//                                     User.findByIdAndUpdate(nId, newbody1, (err, upResult) => { });
//                                   });
//                                   // end of Update Cumulative earnings in User Object
//                                 }
//                               });
//                               // End of Inset into Credit Table
//                             } else {
//                               //  console.log("credits not exists");
//                             }
//                           }
//                           ); // End of Create Credits
//                           // End of Insert Credits to the Referred Celebrity / Member
//                         }
//                       });
//                     } else {
//                       let newCredits = new Credits({
//                         memberId: userDetails._id,
//                         creditType: "promotion",
//                         creditValue: parseInt(0),
//                         cumulativeCreditValue: parseInt(0),
//                         referralCreditValue: parseInt(0),
//                         memberReferCreditValue: parseInt(0),
//                         createdBy: userDetails.fName
//                       });

//                       Credits.createCredits(newCredits, (err, credits) => {
//                         if (err) {
//                           return res.json({ success: 0, message: "Please try again", err: err });
//                         } else {
//                           let myBody = {};
//                           let nId = userDetails._id;
//                           myBody.refCreditValue = true;

//                           logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                         }
//                       });
//                     }
//                   });
//                 }

//                 //   // });
//                 //   // End of Insert Referred Credits to the User and Celebrity
//                 // }
//               }
//             });
//             userService.createDefaultSettingsForNewUser(userDetails._id)
//           }
//         });
//         // }
//       } else {
//         var mobile = country.concat(mobileNumber).substr(1);
//         // Profile Pic code ends here
//         let newUser = new User({
//           name: name,
//           email: email,
//           username: username,
//           password: password,
//           mobileNumber: mobile,
//           role: role,
//           loginType: loginType,
//           location: location,
//           country: country,
//           gender: gender,
//           lastName: lastName,
//           prefix: prefix,
//           aboutMe: aboutMe,
//           firstName: firstName,
//           isCeleb: isCeleb,
//           imageRatio: imageRatio,
//           isDeleted: isDeleted,
//           celebRecommendations: celebRecommendations,
//           userCategory: userCategory,
//           isTrending: isTrending,
//           isOnline: isOnline,
//           isEditorChoice: isEditorChoice,
//           isPromoted: isPromoted,
//           created_at: created_at,
//           created_by: created_by,
//           updated_at: updated_at,
//           updated_by: updated_by,
//           celebToManager: celebToManager,
//           dateOfBirth: dateOfBirth,
//           address: address,
//           preferences: preferences,
//           author_status: author_status,
//           isEmailVerified: isEmailVerified,
//           Dnd: Dnd,
//           referralCode: referralCode,
//           deviceToken: deviceToken,
//           osType: osType
//         });

//         User.createUser(newUser, function (err, userDetails) {
//           if (err) {
//             res.send(err);
//           } else {
//             var mobile = country.concat(mobileNumber).substr(1);
//             var token = jwt.createToken(userDetails._id)
//             let newLoginInfo = new logins({
//               email: email,
//               username: username,
//               password: password,
//               mobileNumber: mobile,
//               token: token
//             });
//             logins.createLoginInfo(newLoginInfo, (err, userLoginObj) => {
//               if (err) {
//                 return res.json({ success: 0, message: "Please try again", err: err });
//               } else {
//                 res.json({ success: 1, message: "Your registration has been submitted successfully. Please verify your account details through your email/phone number.", data: { userInfo: userDetails, loginInfo: userLoginObj } });
//                 let newComLog = new comLog({
//                   mode_ids: ["email"],
//                   event: "register",
//                   from_addr: "admin@celebkonect.com",
//                   to_addr: userDetails.email,
//                   content: reqbody.content,
//                   gateway_response: reqbody.gateway_response
//                 });

//                 comLog.createComLog(newComLog, function (err, user) {
//                   if (err) {
//                     res.send(err);
//                   } else {
//                     crypto.randomBytes(20, function (err, buf) {

//                       //// NEW TOKEN GENERATOR
//                       var token = Math.floor(100000 + Math.random() * 900000);
//                       /// END OF NEW TOKEN GENERATOR
//                       let url = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyEmail/" + userDetails.email + "/" + token;
//                       let mobileurl = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyMobile/" + userDetails.email;
//                       // Get LoginInfo By Email and Update Email Verification Code
//                       let id = userDetails._id;
//                       let newbody = {};
//                       newbody.updated_at = new Date();
//                       newbody.emailVerificationCode = token;
//                       newbody.mobileVerificationCode = token;
//                       User.findByIdAndUpdate(id, newbody, function (err, result) { });

//                       // End of Get LoginInfo By Email and Update Email Verification Code

//                       var template_name = "reg";
//                       var template_content = [
//                         {
//                           name: "verifyurl",
//                           content: url
//                         },
//                         {
//                           name: "verifymobile",
//                           content: mobileurl
//                         },
//                         {
//                           name: "mobileToken",
//                           content: token
//                         }
//                       ];
//                       var message = {
//                         subject: "Registration Successful",
//                         from_email: "admin@celebkonect.com",
//                         from_name: "CelebKonect",
//                         to: [
//                           {
//                             email: userDetails.email,
//                             name: userDetails.email,
//                             type: "to"
//                           }
//                         ],
//                         headers: {
//                           "Reply-To": "keystroke99@gmail.com"
//                         },
//                         important: false,
//                         track_opens: null,
//                         track_clicks: null,
//                         auto_text: null,
//                         auto_html: null,
//                         inline_css: null,
//                         url_strip_qs: null,
//                         preserve_recipients: null,
//                         view_content_link: null,
//                         tracking_domain: null,
//                         signing_domain: null,
//                         return_path_domain: null,
//                         merge: true,
//                         merge_language: "mailchimp",
//                         global_merge_vars: [
//                           {
//                             name: "verifyurl",
//                             content: url
//                           },
//                           {
//                             name: "verifymobile",
//                             content: mobileurl
//                           },
//                           {
//                             name: "mobileToken",
//                             content: token
//                           }
//                         ],
//                         merge_vars: [
//                           {
//                             "rcpt": userDetails.email,
//                             "vars": [
//                               {
//                                 name: "verifyurl",
//                                 content: url
//                               },
//                               {
//                                 name: "verifymobile",
//                                 content: mobileurl
//                               },
//                               {
//                                 name: "mobileToken",
//                                 content: token
//                               }
//                             ]
//                           }
//                         ],

//                       };
//                       var async = false;
//                       var ip_pool = "Main Pool";
//                       // var send_at = new Date();
//                       mandrill_client.messages.sendTemplate(
//                         {
//                           template_name: template_name,
//                           template_content: template_content,
//                           message: message,
//                           async: async,
//                           ip_pool: ip_pool
//                         },
//                         function (result) {
//                           console.log({ message: "comLog saved sucessfully" });
//                         },
//                         function (e) {
//                           console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//                         }
//                       );
//                     });
//                   }
//                 });
//                 let rCode = userDetails.referralCode;
//                 ReferralCode.findOne({ memberCode: rCode }, (err, refResult) => {
//                   if (err) {
//                     return res.json({ success: 0, message: "Please try again", err: err });
//                   }
//                   else if (refResult) {
//                     var fName = userDetails.firstName;
//                     var fRes = fName.substring(0, 3);
//                     var lName = userDetails.lastName;
//                     var lRes = lName.substring(0, 2);
//                     var token = Math.floor(Math.random() * 100000 + 54);
//                     var memberCode = fRes.toUpperCase() + lRes.toUpperCase() + "-" + token;
//                     let newCredits = new Credits({
//                       memberId: userDetails._id,
//                       creditType: "promotion",
//                       creditValue: parseInt(0),
//                       cumulativeCreditValue: parseInt(0),
//                       referralCreditValue: refResult.referralCreditValue,
//                       memberReferCreditValue: parseInt(0),
//                       createdBy: userDetails.fName,
//                       memberCode: memberCode
//                     });
//                     Credits.createCredits(newCredits, (err, credits) => {
//                       if (err) {
//                         return res.json({ success: 0, message: "Please try again", err: err });
//                       } else {
//                         oldValue = parseInt(userDetails.cumulativeEarnings);
//                         /// Check if Refree is Celebrity Or Not
//                         let isRefCeleb;
//                         User.findOne({ _id: refResult.memberId }, (err, refCeleb) => {
//                           //console.log("Refeceleb user object == ")
//                           //console.log(refCeleb)
//                           if (err) {
//                             return res.json({ success: 0, message: "Please try again", err: err });
//                           }
//                           if (refCeleb) {
//                             if (refCeleb.isCeleb == true) {
//                               isRefCeleb = true;
//                             }
//                           }

//                           let fBody = {};
//                           fBody.cumulativeEarnings =
//                             parseInt(refResult.referralCreditValue) + oldValue;
//                           if (isRefCeleb == true) {
//                             fBody.celebCredits = refResult.referralCreditValue + "-" + refResult.memberId;
//                           } else {
//                             fBody.celebCredits = 0 + "-" + refResult.memberId;
//                           }
//                           User.findByIdAndUpdate(userDetails._id, fBody, (err, upResult) => { });
//                           let myBody = {};
//                           let nId = userDetails._id;
//                           // Change RefCreditValue to the logged in user
//                           myBody.refCreditValue = true;
//                           logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                           // End of Change RefCreditValue to the logged in User
//                         });
//                         /// End of Check if Refree is Celebrity Or Not
//                         // Insert Credits to the Referred Celebrity / Member
//                         // Start of Fetch Latest Credits Information
//                         Credits.find({ memberId: refResult.memberId }, null, { sort: { createdAt: -1 } }, (err, cBal) => {
//                           if (err) {
//                             return res.json({ success: 0, message: "Please try again", err: err });
//                           }
//                           if (cBal) {
//                             cBalObj = cBal[0];
//                             newReferralCreditValue = cBalObj.referralCreditValue + parseInt(refResult.referreCreditValue);
//                             let newCredits = new Credits({
//                               memberId: refResult.memberId,
//                               creditType: "promotion",
//                               cumulativeCreditValue: cBalObj.cumulativeCreditValue,
//                               creditValue: refResult.referralCreditValue,
//                               memberReferCreditValue: cBalObj.memberReferCreditValue,
//                               referralCreditValue: newReferralCreditValue
//                             });
//                             // Insert Into Credit Table
//                             Credits.createCredits(newCredits, (err, credits) => {
//                               if (err) {
//                                 return res.json({ success: 0, message: "Please try again", err: err });
//                               } else {
//                                 /* res.send({
//                                   message: "Credits updated successfully",
//                                   creditsData: credits
//                                 }); */

//                                 // Update Cumulative earnings in User Object
//                                 User.findOne({ _id: refResult.memberId }, (err, nuResult) => {
//                                   nId = nuResult._id;
//                                   oldValue = parseInt(nuResult.cumulativeEarnings);
//                                   let newbody1 = {};
//                                   newbody1.cumulativeEarnings = refResult.referralCreditValue + oldValue;
//                                   User.findByIdAndUpdate(nId, newbody1, (err, upResult) => { });
//                                 });
//                                 // end of Update Cumulative earnings in User Object
//                               }
//                             });
//                             // End of Inset into Credit Table
//                           } else {
//                             //  console.log("credits not exists");
//                           }
//                         }
//                         ); // End of Create Credits
//                         // End of Insert Credits to the Referred Celebrity / Member
//                       }
//                     });
//                   } else {
//                     let newCredits = new Credits({
//                       memberId: userDetails._id,
//                       creditType: "promotion",
//                       creditValue: parseInt(0),
//                       cumulativeCreditValue: parseInt(0),
//                       referralCreditValue: parseInt(0),
//                       memberReferCreditValue: parseInt(0),
//                       createdBy: userDetails.fName
//                     });

//                     Credits.createCredits(newCredits, (err, credits) => {
//                       if (err) {
//                         return res.json({ success: 0, message: "Please try again", err: err });
//                       } else {
//                         let myBody = {};
//                         let nId = userDetails._id;
//                         myBody.refCreditValue = true;

//                         logins.findByIdAndUpdate(nId, myBody, (err, nResult) => { });
//                       }
//                     });
//                   }
//                 });
//                 // });
//                 // End of Insert Referred Credits to the User and Celebrity
//               }
//               // }
//             });
//             userService.createDefaultSettingsForNewUser(userDetails._id)
//           }
//         });
//       }
//     } // End If User Does Not Exists 
//   });//End 3rd If user is not unique, return error
//   //   });//End 2nd If user is not unique, return error
//   // });//End 1st If user is not unique, return error
// });
// End Register User using social logins

// Get MembersList (All Users) start
//Delete
// router.get("/membersList", (req, res) => {
//   User.aggregate(
//     [
//       { $match: { "IsDeleted": false, "dua": false } },
//       {
//         $lookup: {
//           from: "logins",
//           localField: "email",
//           foreignField: "email",
//           as: "deviceToken" // to get all the views, comments, shares count
//         }

//       },
//       { $sort: { created_at: -1 } },
//       {
//         $project: {
//           username: 1,
//           mobileNumber: 1,
//           avtar_imgPath: 1,
//           avtar_originalname: 1,
//           imageRatio: 1,
//           password: 1,
//           email: 1,
//           name: 1,
//           firstName: 1,
//           lastName: 1,
//           prefix: 1,
//           aboutMe: 1,
//           location: 1,
//           country: 1,
//           loginType: 1,
//           role: 1,
//           gender: 1,
//           dateOfBirth: 1,
//           address: 1,
//           referralCode: 1,
//           cumulativeSpent: 1,
//           cumulativeEarnings: 1,
//           lastActivity: 1,
//           profession: 1,
//           industry: 1,
//           userCategory: 1,
//           liveStatus: 1,
//           status: 1,
//           isCeleb: 1,
//           isTrending: 1,
//           isOnline: 1,
//           isEditorChoice: 1,
//           isPromoted: 1,
//           isEmailVerified: 1,
//           isMobileVerified: 1,
//           emailVerificationCode: 1,
//           mobileVerificationCode: 1,
//           celebRecommendations: 1,
//           Dnd: 1,
//           celebToManager: 1,
//           author_status: 1,
//           iosUpdatedAt: 1,
//           created_at: 1,
//           updated_at: 1,
//           created_by: 1,
//           updated_by: 1,
//           IsDeleted: 1,
//           isPromoter: 1,
//           isManager: 1,
//           managerRefId: 1,
//           promoterRefId: 1,
//           charityRefId: 1,
//           celebCredits: 1,
//           deviceToken: "$deviceToken.deviceToken"
//         }
//       }

//     ],
//     function (err, result) {
//       if (err) {
//         res.send(err);
//       }
//       res.send(result);
//     }
//   );

// });
// End Get MembersList (All Users)




//get Member by username start

// router.get("/getMemberByusername/:username", function (req, res, next) {
//   let username = req.params.username;

//   User.getUserByUsername(username, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "Please enter valid username"
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });

// End get Member by username





// get Member by isCeleb start

// router.get("/getMemberByisCeleb/:userID", function (req, res, next) {
//   let id = req.params.userID;
//   let isCeleb = true;
//   User.getUserByisCeleb(isCeleb, id, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "No Celebrities found"
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });

// End get Member by isCeleb




// Get Online Celebrities List
// router.post("/getOnlineCelebrities", function (req, res, next) {
//   celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
//     if (err) {
//       res.json({ usersDetail: null, err: err })
//     }
//     else {
//       let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
//       let id = req.params.userID;
//       let celebrities = [];
//       User.findOnlineCelebrities(objectIdArray, (err, listOfOnlineCelebraties) => {
//         if (err) {
//           res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching online celebraties! by user ID" });
//         } else {
//           MemberPreferences.findOne({ memberId: ObjectId(id) }, {}, (err, listOfMyPreferences) => {
//             //console.log("listOfMyPreferences", listOfMyPreferences);
//             if (err) {
//               console.log(err);
//             } else {

//               if (listOfMyPreferences) {
//                 celebrities = listOfMyPreferences.celebrities;
//               }
//               if (celebrities === undefined) {
//                 celebrities = [];
//               }
//               let _id, username, isOnline, isCeleb, lastName, firstName, imageRatio, avtar_imgPath, aboutMe, profession;
//               let onlineCelebritiesObj = {};
//               let onlineCelebritiesArray = [];
//               let isFan = false
//               let isFollower = false;
//               for (let j = 0; j < listOfOnlineCelebraties.length; j++) {
//                 let onlineMemberObj = {};
//                 onlineMemberObj = listOfOnlineCelebraties[j];
//                 let onleneMemberId = onlineMemberObj._id;
//                 if ("" + onleneMemberId == id) {
//                   listOfOnlineCelebraties.splice(j, 1);
//                 }
//               }
//               for (let i = 0; i < listOfOnlineCelebraties.length; i++) {
//                 onlineCelebritiesObj = {};
//                 let onlineCelebrityObj = listOfOnlineCelebraties[i];
//                 let userId = listOfOnlineCelebraties[i]._id;
//                 userId = "" + userId;
//                 //console.log(userId);
//                 //console.log(typeof userId);
//                 for (var j = 0; j < celebrities.length; j++) {
//                   let preferencesCelebId = celebrities[j].CelebrityId;
//                   preferencesCelebId = "" + preferencesCelebId
//                   if (userId === preferencesCelebId && celebrities[j].isFan) {
//                     //console.log("IS Fan True");
//                     isFan = true;
//                   }
//                   if (userId === preferencesCelebId && celebrities[j].isFollower) {
//                     //console.log("IS Follower True");
//                     isFollower = true;
//                   }
//                 }
//                 onlineCelebritiesObj.isFan = isFan;
//                 onlineCelebritiesObj.isFollower = isFollower;
//                 onlineCelebritiesObj._id = onlineCelebrityObj._id;
//                 onlineCelebritiesObj.username = onlineCelebrityObj.username;
//                 onlineCelebritiesObj.isCeleb = onlineCelebrityObj.isCeleb;
//                 onlineCelebritiesObj.isOnline = onlineCelebrityObj.isOnline;
//                 onlineCelebritiesObj.lastName = onlineCelebrityObj.lastName;
//                 onlineCelebritiesObj.firstName = onlineCelebrityObj.firstName;
//                 onlineCelebritiesObj.imageRatio = onlineCelebrityObj.imageRatio;
//                 onlineCelebritiesObj.avtar_imgPath = onlineCelebrityObj.avtar_imgPath;
//                 onlineCelebritiesObj.aboutMe = onlineCelebrityObj.aboutMe;
//                 onlineCelebritiesObj.profession = onlineCelebrityObj.profession;
//                 listOfOnlineCelebraties[i] = onlineCelebritiesObj;
//                 isFollower = false;
//                 isFan = false;
//               }
//               res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfOnlineCelebraties })
//             }
//           });
//         }
//       });
//     }
//   })
// });
// End of Get Online Celebrities List

// get Member by isTrending start

// router.get("/getMemberByisTrending", function (req, res, next) {
//   let isTrending = true;
//   User.getUserByisTrending(isTrending, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "No Trending Celebrities found"
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });

// End get Member by isTrending

// get Member by isOnline start

// router.get("/getMemberByisOnline/:userID", function (req, res, next) {
//   let isOnline = true;
//   let userID = req.params.userID;
//   User.getUserByisOnline(isOnline, userID, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "no users are online"
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });
// End get Member by isOnline 

// get Member by isEditorChoice start

// router.get("/getMemberByisEditorChoice", function (req, res, next) {
//   let isEditorChoice = true;
//   User.getUserByisEditorChoice(isEditorChoice, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "No Celebrities found"
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });
// End get Member by isEditorChoice

// get Member by isPromoted start

// router.get("/getMemberByisPromoted", function (req, res, next) {
//   let isPromoted = true;
//   User.getUserByisPromoted(isPromoted, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "No promted users found"
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });
// End get Member by isPromoted

// Edit User by UserID start not in use in dev






// Download User Profile Pic using Id start

// router.get("/getprofilepic/:id", function (req, res) {
//   let id = ObjectId(req.params.id);
//   if (err) {
//     return res.send(err);
//   }
//   User.find({ _id: id }, function (err, profiledata) {
//     res.download(profiledata[0].avtar_imgPath);
//   });
// });
// End Download User Profile Pic using Id
function escapeRegex(text) {
  return text.replace(/\s\s+/g, ' ');
};

router.get("/getCelebSearch/:userID/:string/:createdAt", function (req, res, next) {
  let searchString = req.params.string.toLowerCase();
  searchString = searchString.trim();
  let id = req.params.userID;
  let isCeleb = true;
  let paginationDate = new Date();
  let keyword = new RegExp('^' + searchString);  //"/^"+"vamshi krishna"+"/i"

  // console.log("######keyword", keyword, "######keyword")
  celebrityContract.distinct("memberId", { memberId: { $nin: [id] } }, (err, contractsCelebArray) => {
    if (err) {
      res.json({ usersDetail: null, err: err })
    }
    else {
      let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
      let getCeleByTime = req.params.createdAt;
      limit = parseInt(30);
      if (getCeleByTime == null || getCeleByTime == "null" || getCeleByTime == "0") {
        getCeleByTime = new Date();
      }
      User.aggregate(
        [
          {
            $addFields: {
              name: {
                $concat: [
                  '$firstName',
                  ' ',
                  '$lastName',
                ]
              },
            }
          },
          {
            "$match": {
              $or: [{
                $and: [
                  { _id: { $in: objectIdArray } },
                  { firstName: { $regex: keyword, '$options': 'i' } },
                  { isCeleb: true },
                  { IsDeleted: false },
                  { created_at: { $lt: new Date(getCeleByTime) } }
                ]
              }]
            }
          },
          {
            $sort: { created_at: -1 }
          },
          {
            $limit: limit
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              avtar_imgPath: 1,
              profession: 1,
              isCeleb: 1,
              isOnline: 1,
              isPromoted: 1,
              isTrending: 1,
              aboutMe: 1,
              email: 1,
              isEditorChoice: 1,
              username: 1,
              created_at: 1,
            }
          },
        ],
        function (err, data) {
          // console.log("Data L ==== ", data.length, searchString)
          if (err) {
            res.json({ success: 0, message: err })
          }
          else if (data.length == limit) {
            data.forEach((user) => {
              for (i = 0; i < data.length; i++) {
                if ((user._id.toString() == data[i]._id.toString()) && i != data.indexOf(user)) {
                  data.splice(i, 1);
                }
              }
            })
            paginationDate = data[data.length - 1].created_at;
            data.sort(function (a, b) {
              if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
              if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
              return 0;
            })
            return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: { celebSearchInfo: data, paginationDate: paginationDate } });
          } else {
            limit = limit - data.length;
            fNameIds = data.map((user) => {
              return (user._id)
            });
            // console.log("ARTICLE-1", fNameIds.length)
            // console.log("ARTICLE-1-1", keyword)
            User.aggregate(
              [
                {
                  $addFields: {
                    name: {
                      $concat: [
                        '$firstName',
                        ' ',
                        '$lastName',
                      ]
                    },
                  }
                },
                {
                  "$match": {
                    $or: [{
                      $and: [
                        { _id: { $in: objectIdArray } },
                        { _id: { $nin: fNameIds } },
                        { name: { $regex: keyword, '$options': 'im' } },
                        { isCeleb: true },
                        { IsDeleted: false },
                        { created_at: { $lt: new Date(getCeleByTime) } }
                      ],
                      $and: [
                        { _id: { $in: objectIdArray } },
                        { _id: { $nin: fNameIds } },
                        { lastName: { $regex: keyword, '$options': 'im' } },
                        { isCeleb: true },
                        { IsDeleted: false },
                        { created_at: { $lt: new Date(getCeleByTime) } }
                      ]

                    }]
                  }
                },
                {
                  $sort: { created_at: -1 }
                },
                {
                  $limit: limit
                },
                {
                  $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    avtar_imgPath: 1,
                    profession: 1,
                    isCeleb: 1,
                    isOnline: 1,
                    isPromoted: 1,
                    isTrending: 1,
                    aboutMe: 1,
                    email: 1,
                    isEditorChoice: 1,
                    username: 1,
                    created_at: 1,
                    category: 1
                  }
                },
                {
                  $limit: limit
                },
              ],
              function (err, data2) {
                if (err) {
                  return res.json({ success: 0, message: "Error while search lastname ", err })
                } else {
                  // console.log("ARTICLE-2", data2.length)
                  data.forEach((user) => {
                    for (i = 0; i < data.length; i++) {
                      if ((user._id.toString() == data[i]._id.toString()) && i != data.indexOf(user)) {
                        data.splice(i, 1);
                      }
                    }
                  })

                  if (data.length)
                    paginationDate = data[data.length - 1].created_at;
                  data.sort(function (a, b) {
                    if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
                    if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
                    return 0;
                  })
                  data2.sort(function (a, b) {
                    if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) { return -1; }
                    if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) { return 1; }
                    return 0;
                  })
                  const arr3 = [...data, ...data2];
                  return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: { celebSearchInfo: arr3, paginationDate: paginationDate } });
                }
              })
          }
        });
    }
  });
});


router.put("/edit/:receiverId", function (req, res) {
  //receiver id nothing but celeb id any condition.
  // console.log(req.body)
  // console.log(req.params.receiverId)
  let reqbody = req.body;
  receiverId = req.body.receiverId;
  reqbody.callStatus = req.body.callStatus;
  //reqbody.isOnline = true;
  reqbody.updatedAt = new Date();

  User.findByIdAndUpdate(req.params.receiverId, { $set: { "callStatus": reqbody.callStatus } }, function (err, result) {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "User Not Exists / Send a valid UserID" });
    } else {

      //return res.json({ message: "User Updated Successfully" });
      User.findById(ObjectId(req.body.senderId), (err, checkSenderCelebObj) => {
        if (err)
          console.log(err)
        {
          //console.log(checkSenderCelebObj);
          //if (checkSenderCelebObj) {
          if (checkSenderCelebObj != null && checkSenderCelebObj.isCeleb == true) {
            User.findByIdAndUpdate(ObjectId(req.body.senderId), { $set: { "callStatus": reqbody.callStatus } }, (err, updatedCelebCallStatus) => {
              if (err)
                console.log(err)
              else {
                return res.json({ token: req.headers['x-access-token'], success: 1, message: "User Updated Successfully" });
              }
            })
            // }

          } else {
            return res.json({ token: req.headers['x-access-token'], success: 1, message: "User Updated Successfully" });
          }
        }
      })
    }
  });
});
// End of Edit a Schedule 

//get deatils of other  progfile with isfollowing or not and isfanof or not
router.get("/getAllDetailsOfCelebrityForMemberId/:celebrityId/:memberId", (req, res) => {
  let celebrityId = ObjectId(req.params.celebrityId);
  let memberId = ObjectId(req.params.memberId);
  let now = new Date();
  let lastActiveTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  LiveTimeLog.findOne({ "memberId": celebrityId, "liveStatus": "offline" }, (err, lastActiveTimeObj) => {
    if (err) {
      res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: null, fanFollowingFollowerFeedCount: null, celebContracts: null, memberMedia: null } })
    } else {
      User.findById(celebrityId, { password: 0, pastProfileImages: 0, }, (err, userDetails) => {
        if (err) {
          res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: null, fanFollowingFollowerFeedCount: null, celebContracts: null, memberMedia: null } })
        }
        else {
          let fanFollowingFollowerFeedCount = {
            scheduleCount: 0
          }
          if (!lastActiveTimeObj || lastActiveTimeObj == null)
            userDetails.activeTime = lastActiveTime
          else
            userDetails.activeTime = lastActiveTimeObj.createdAt;
          MemberPreferences.findOne({ memberId: celebrityId }, (err, celebPrefernceObj) => {
            if (err) {
              res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia, creditDetails: null } })
            } else {
              urFanOfCount = 0;
              urFollowingCount = 0
              if (celebPrefernceObj.celebrities.length > 0 && celebPrefernceObj.celebrities != null) {
                celebPrefernceObj.celebrities.map((mpObj) => {
                  if (mpObj.isFan == true) {
                    urFanOfCount = urFanOfCount + 1;
                  } else if (mpObj.isFollower == true) {
                    urFollowingCount = urFollowingCount + 1;
                  }
                });
              }
              fanFollowingFollowerFeedCount.UrFanOf = urFanOfCount;
              fanFollowingFollowerFeedCount.Following = urFollowingCount;
              MemberPreferences.findOne({ memberId: memberId }, (err, memberPrefernceObj) => {
                if (err) {
                  res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia, creditDetails: null } })
                } else {
                  isFan = false;
                  isFollower = false;
                  memberPrefernceObj.celebrities.map((mpObj) => {
                    celebrityId = "" + celebrityId
                    if ("" + celebrityId == "" + mpObj.CelebrityId && mpObj.isFan == true) {
                      isFan = true;
                    }
                  });
                  memberPrefernceObj.celebrities.map((mpObj) => {
                    celebrityId = "" + celebrityId
                    if ("" + celebrityId == "" + mpObj.CelebrityId && mpObj.isFollower == true) {
                      isFollower = true;
                    }
                  });
                  fanFollowingFollowerFeedCount.isFan = isFan;
                  fanFollowingFollowerFeedCount.isFollower = isFollower;
                  celebrityId = ObjectId(req.params.celebrityId); // in above code coverted to string that's why again coverting to object
                  let query = { "memberId": ObjectId(celebrityId), isDeleted: false, "scheduleStatus": "inactive" }
                  Feed.countDocuments({ memberId: celebrityId, isDelete: false }, (err, feedCount) => {
                    if (err) {
                      res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: null, memberMedia: null } })
                    }
                    else {
                      fanFollowingFollowerFeedCount.feedCount = feedCount;
                      celebrityContract.aggregate([
                        {
                          $match: {
                            memberId: req.params.celebrityId,
                            $or: [
                              { serviceType: "audio" },
                              { serviceType: "video" },
                              { serviceType: "chat" },
                              { serviceType: "fan" }
                            ]
                          }
                        },
                        {
                          $group: {
                            _id: { memberId: "$memberId" },
                            celebrityContract: {
                              $push: {
                                serviceType: "$serviceType",
                                managerSharePercentage: "$managerSharePercentage",
                                charitySharePercentage: "$charitySharePercentage",
                                promoterSharePercentage: "$promoterSharePercentage",
                                sharingPercentage: "$sharingPercentage",
                                serviceCredits: "$serviceCredits",
                              }
                            }
                          }
                        }
                      ], (err, celebContracts) => {
                        if (err) {
                          return res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: null, memberMedia: null } })
                        }
                        else {
                          celebContracts = celebContracts.length ? celebContracts[0].celebrityContract : null;
                          Credits.find({ memberId: celebrityId }, (err, creditDetails) => {
                            if (err) {
                              return res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia, creditDetails: null } })
                            } else {
                              MemberPreferences.countDocuments({ celebrities: { $elemMatch: { CelebrityId: celebrityId, isFollower: true } } }, (err, followerCount) => {
                                if (err) {
                                  return res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia, creditDetails: null } })
                                } else {
                                  fanFollowingFollowerFeedCount.Followers = followerCount;
                                  MemberPreferences.countDocuments({ celebrities: { $elemMatch: { CelebrityId: celebrityId, isFan: true } } }, (err, fancount) => {
                                    if (err) {
                                      return res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia, creditDetails: null } })
                                    } else {
                                      fanFollowingFollowerFeedCount.fanOfUr = fancount;
                                      slotMaster.countDocuments(query, (err, slotCount) => {
                                        if (err) {
                                          return res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia, creditDetails: null } })
                                        } else {
                                          fanFollowingFollowerFeedCount.scheduleCount = slotCount;
                                          return res.json({ success: 1, token: req.headers['x-access-token'], data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, creditDetails: creditDetails[0], scheduleCount: parseInt(slotCount) } })
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          }).sort({ "createdAt": -1 }).limit(1)
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      }).lean()
    }
  }).sort({ createdAt: -1 }).limit(1)

})
//get deatils of other  progfile with isfollowing or not and isfanof or not end

router.get("/getVideoByMemberID/:memberId/:createdAt/:limit", userController.getVideoByMemberID)
router.get("/getImagesByMemberID/:memberId/:createdAt/:limit", userController.getImagesByMemberID)

//@desc get online/offline celebs with sorting by name 
//@method GET
//@access public
router.get('/getOnlineAndOfflineCelebs/:member_Id', userController.getOnlineAndOfflineCelebs)

//aboove api please remove new api with pagination in media only provide image/gif give limit
//get deatils of other  progfile with isfollowing or not and isfanof or not
// router.get("/getAllDetailsOfCelebrityForMemberId/:celebrityId/:memberId/:limit", userController.getAllDetailsOfCelebrityForMemberId)
//get deatils of other  progfile with isfollowing or not and isfanof or not end





// router.get("/getBrandsByMemberID/:memberId/:createdAt/:limit", userController.getBrandsByMemberID)




//get deatils of own progfile without media
// router.get("/getAllDetailsCelebrityForMember/:memberId", (req, res) => {
//   let memberId = ObjectId(req.params.memberId);
//   FeedBackModel.find({ reason: "Block/Report", memberId: ObjectId(memberId) }, { _id: 1, celebrityId: 1 }, (err, youblockedByCelebrity) => {
//     if (err) {
//       return res.json({ success: 0, token: req.headers['x-access-token'], message: err })
//     }
//     celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
//       if (err) {
//         res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//       }
//       else {
//         let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
//         User.find({
//           _id: { $ne: memberId, $in: objectIdArray },
//           IsDeleted: false,
//           isCeleb: true
//         },
//           // User.find({_id:{$ne:memberId},isCeleb:true},
//           {
//             _id: 1, avtar_imgPath: 1, avtar_originalname: 1,
//             imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
//             isTrending: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
//           }, (err, celebraties) => {
//             if (err) {
//               res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//             }
//             else {
//               MemberPreferences.findOne({ memberId: memberId }, { celebrities: 1 }, (err, listOfMyPreferences) => {
//                 if (err) {
//                   res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//                 } else {
//                   celebraties.map((celebDetails) => {
//                     if (listOfMyPreferences && listOfMyPreferences.celebrities) {
//                       celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//                         return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//                       });
//                       celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//                         return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//                       });
//                     }
//                     else {
//                       celebDetails.isFan = false;
//                       celebDetails.isFollower = false;
//                     }
//                     if (youblockedByCelebrity && youblockedByCelebrity.length) {
//                       celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
//                         return (celebDetails._id + "" == s.celebrityId + "")
//                       });
//                     }
//                     else {
//                       celebDetails.isBlocked = false;
//                     }
//                   })
//                   res.json({ success: 1, data: celebraties, token: req.headers['x-access-token'] })
//                 }
//               });
//             }
//           }).lean();
//       }
//     });
//   })

// });
//get details of own profile end


//get deatils of own progfile without media new with recommanded / editor choice / trending getting 
// router.get("/getAllCelebrityListForMember1/:memberId", (req, res) => {
//   let memberId = ObjectId(req.params.memberId);
//   FeedBackModel.find({ reason: "Block/Report", memberId: ObjectId(memberId) }, { _id: 1, celebrityId: 1 }, (err, youblockedByCelebrity) => {
//     if (err) {
//       return res.json({ success: 0, token: req.headers['x-access-token'], message: err })
//     }
//     else {
//       celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
//         if (err) {
//           res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//         }
//         else {
//           MemberPreferences.findOne({ memberId: memberId }, { celebrities: 1, preferences: 1 }, (err, listOfMyPreferences) => {
//             if (err) {
//               res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//             } else {
//               let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
//               let provideData = {
//                 _id: 1, avtar_imgPath: 1, avtar_originalname: 1,
//                 imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
//                 isTrending: 1, preferenceId: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
//               }
//               let listOfSelectedPrefernces = listOfMyPreferences.preferences;
//               //console.log(".... My Seleted Preferences ... ", listOfSelectedPrefernces);
//               //get all celebrity
//               User.find({
//                 _id: { $ne: memberId, $in: objectIdArray },
//                 IsDeleted: false,
//                 isCeleb: true
//               }, provideData, (err, celebrities) => {
//                 if (err) {
//                   res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//                 }
//                 else {
//                   celebrities.map((celebDetails) => {
//                     if (listOfMyPreferences && listOfMyPreferences.celebrities) {
//                       celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//                         return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//                       });
//                       celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//                         return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//                       });
//                     }
//                     else {
//                       celebDetails.isFan = false;
//                       celebDetails.isFollower = false;
//                     }
//                     if (youblockedByCelebrity && youblockedByCelebrity.length) {
//                       celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
//                         return (celebDetails._id + "" == s.celebrityId + "")
//                       });
//                     }
//                     else {
//                       celebDetails.isBlocked = false;
//                     }
//                   })
//                   userService.getOnlineCelebrity(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, listOfOnlineCelebraties) => {
//                     if (err) {
//                       return res.json({ success: 0, token: req.headers['x-access-token'], message: err })
//                     } else {
//                       listOfOnlineCelebraties.map((celebDetails) => {
//                         if (listOfMyPreferences && listOfMyPreferences.celebrities) {
//                           celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//                             return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//                           });
//                           celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//                             return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//                           });
//                         }
//                         else {
//                           celebDetails.isFan = false;
//                           celebDetails.isFollower = false;
//                         }
//                         if (youblockedByCelebrity && youblockedByCelebrity.length) {
//                           celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
//                             return (celebDetails._id + "" == s.celebrityId + "")
//                           });
//                         }
//                         else {
//                           celebDetails.isBlocked = false;
//                         }
//                       })
//                       User.find({
//                         _id: { $ne: memberId, $in: objectIdArray },
//                         IsDeleted: false,
//                         isTrending: true,
//                         isCeleb: true
//                       }, provideData, (err, trendingCelebrities) => {
//                         if (err) {
//                           res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//                         }
//                         else {
//                           trendingCelebrities.map((celebDetails) => {
//                             if (listOfMyPreferences && listOfMyPreferences.celebrities) {
//                               celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//                                 return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//                               });
//                               celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//                                 return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//                               });
//                             }
//                             else {
//                               celebDetails.isFan = false;
//                               celebDetails.isFollower = false;
//                             }
//                             if (youblockedByCelebrity && youblockedByCelebrity.length) {
//                               celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
//                                 return (celebDetails._id + "" == s.celebrityId + "")
//                               });
//                             }
//                             else {
//                               celebDetails.isBlocked = false;
//                             }
//                           })

//                           User.find({
//                             _id: { $ne: memberId, $in: objectIdArray },
//                             IsDeleted: false,
//                             isCeleb: true,
//                             isEditorChoice: true
//                           }, provideData, (err, editorChoiceCelebrities) => {
//                             if (err) {
//                               res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//                             }
//                             else {
//                               editorChoiceCelebrities.map((celebDetails) => {
//                                 if (listOfMyPreferences && listOfMyPreferences.celebrities) {
//                                   celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//                                     return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//                                   });
//                                   celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//                                     return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//                                   });
//                                 }
//                                 else {
//                                   celebDetails.isFan = false;
//                                   celebDetails.isFollower = false;
//                                 }
//                                 if (youblockedByCelebrity && youblockedByCelebrity.length) {
//                                   celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
//                                     return (celebDetails._id + "" == s.celebrityId + "")
//                                   });
//                                 }
//                                 else {
//                                   celebDetails.isBlocked = false;
//                                 }
//                               })

//                               User.find({
//                                 _id: { $ne: memberId, $in: objectIdArray },
//                                 preferenceId: { $in: listOfSelectedPrefernces },
//                                 IsDeleted: false,
//                                 isCeleb: true,
//                                 //isPromoted: true
//                               }, provideData, (err, recommendedCelebrities) => {
//                                 if (err) {
//                                   res.json({ success: 0, message: err, token: req.headers['x-access-token'] })
//                                 }
//                                 else {
//                                   // console.log("...... Recomamnded Celeb ..... ", recommendedCelebrities)

//                                   recommendedCelebrities.map((celebDetails) => {
//                                     if (listOfMyPreferences && listOfMyPreferences.celebrities) {
//                                       celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//                                         return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//                                       });
//                                       celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//                                         return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//                                       });
//                                     }
//                                     else {
//                                       celebDetails.isFan = false;
//                                       celebDetails.isFollower = false;
//                                     }
//                                     if (youblockedByCelebrity && youblockedByCelebrity.length) {
//                                       celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
//                                         return (celebDetails._id + "" == s.celebrityId + "")
//                                       });
//                                     }
//                                     else {
//                                       celebDetails.isBlocked = false;
//                                     }
//                                   })

//                                   res.json({ success: 1, data: { celebrities: celebrities, listOfOnlineCelebrities: listOfOnlineCelebraties, trendingCelebrities: trendingCelebrities, editorChoiceCelebrities: editorChoiceCelebrities, recommendedCelebrities: recommendedCelebrities }, token: req.headers['x-access-token'] })
//                                 }
//                               }).lean();

//                             }
//                           }).lean();

//                         }
//                       }).lean();
//                     }
//                   })
//                 }
//               }).lean();
//             }
//           });
//         }
//       });
//     }
//   })
// });
//get details of own profile end

//get deatils of own progfile without media
// router.get("/getAllDetailsCelebrityForMember/:memberId/:createDate", (req, res) => {
//   let memberId = ObjectId(req.params.memberId);
//   let query = {}
//   if (req.params.createDate == "0" || req.params.createDate == "null") {
//     query = {
//       $match: {
//         isCeleb: true,
//         IsDeleted: false
//       }
//     };
//   }
//   else {
//     query = {
//       $match: {
//         isCeleb: true,
//         IsDeleted: false,
//         created_at: { $lt: new Date(req.params.createDate) }
//       }
//     };
//   }
//   User.aggregate([
//     query,
//     {
//       $match: {
//         isCeleb: true,
//         IsDeleted: false
//       }
//     },
//     {
//       $sort: {
//         created_at: -1
//       }
//     },
//     {
//       $project: {
//         "_id": 1,
//         "avtar_imgPath": 1,
//         "avtar_originalname": 1,
//         "imageRatio": 1,
//         "name": 1,
//         "firstName": 1,
//         "lastName": 1,
//         "prefix": 1,
//         "role": 1,
//         "profession": 1,
//         "industry": 1,
//         "isCeleb": 1,
//         "isTrending": 1,
//         "isOnline": 1,
//         "created_at": 1
//       }
//     },
//     {
//       $limit: 10
//     }
//   ], (err, celebraties) => {
//     if (err) {
//       res.json({ success: 0, celebraties: null, err: err })
//     }
//     else {
//       MemberPreferences.findOne({ memberId: memberId }, { celebrities: 1 }, (err, listOfMyPreferences) => {
//         if (err) {
//           res.json({ success: 0, celebraties: null, err: err })
//         } else {
//           celebraties.map((celebDetails) => {
//             celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//               return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//             });
//             celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//               return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//             });
//           })
//           res.json({ success: 1, celebraties: celebraties })
//         }
//       });
//     }
//   })
// })
//get details of own profile end

//get new with limit deatils of own progfile without media
// router.get("/getAllDetailsCelebrityForMember/:memberId/:createDate/:limit", (req, res) => {
//   let memberId = ObjectId(req.params.memberId);
//   let limit = parseInt(req.params.limit);
//   let query = {}
//   if (req.params.createDate == "0" || req.params.createDate == "null") {
//     query = {
//       $match: {
//         isCeleb: true,
//         IsDeleted: false
//       }
//     };
//   }
//   else {
//     query = {
//       $match: {
//         isCeleb: true,
//         IsDeleted: false,
//         created_at: { $lt: new Date(req.params.createDate) }
//       }
//     };
//   }
//   User.aggregate([
//     query,
//     {
//       $match: {
//         isCeleb: true,
//         IsDeleted: false
//       }
//     },
//     {
//       $sort: {
//         created_at: -1
//       }
//     },
//     {
//       $project: {
//         "_id": 1,
//         "avtar_imgPath": 1,
//         "avtar_originalname": 1,
//         "imageRatio": 1,
//         "name": 1,
//         "firstName": 1,
//         "lastName": 1,
//         "prefix": 1,
//         "role": 1,
//         "profession": 1,
//         "industry": 1,
//         "isCeleb": 1,
//         "isTrending": 1,
//         "isOnline": 1,
//         "created_at": 1
//       }
//     },
//     {
//       $limit: limit
//     }
//   ], (err, celebraties) => {
//     if (err) {
//       res.json({ success: 0, celebraties: null, err: err })
//     }
//     else {
//       MemberPreferences.findOne({ memberId: memberId }, { celebrities: 1 }, (err, listOfMyPreferences) => {
//         if (err) {
//           res.json({ success: 0, celebraties: null, err: err })
//         } else {
//           celebraties.map((celebDetails) => {
//             celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
//               return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
//             });
//             celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
//               return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//             });
//           })
//           res.json({ success: 1, celebraties: celebraties })
//         }
//       });
//     }
//   })
// })


//recommanded
// router.get('/getSugessionByPreferances/:memberId', userController.getSugessionByPreferances);

//trending
// router.get('/getTrendingCelebrities/:memberId', userController.getTrendingCelebrities);



function mergeTwo(arr1, arr2) {
  let merged = [];
  let index1 = 0;
  let index2 = 0;
  let current = 0;

  while (current < (arr1.length + arr2.length)) {

    let isArr1Depleted = index1 >= arr1.length;
    let isArr2Depleted = index2 >= arr2.length;

    if (!isArr1Depleted && (isArr2Depleted || (arr1[index1].createdAt < arr2[index2].createdAt))) {
      merged[current] = arr1[index1];
      index1++;
    } else {
      merged[current] = arr2[index2];
      index2++;
    }

    current++;
  }
  return merged;
}

// router.get("/membersList/:createdAt/:limit",userController.MembersList1);

// router.get("/membersList/:pageNo/:limit", userController.MembersList);

module.exports = router;