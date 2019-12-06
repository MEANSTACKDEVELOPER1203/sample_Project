let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let mongoose = require("mongoose");
let celebrityContract = require("./celebrityContractsModel");
let User = require("../users/userModel");
let MemberPreferences = require("../memberpreferences/memberpreferencesModel");
let slotMaster = require("../slotMaster/slotMasterModel")

//@desc get by UserId (getContractByID)
//@methos GET
//@access publc
router.get("/getContractsByMemberID/:UserID", function (req, res) {
  let id = req.params.UserID;

  celebrityContract.find(
    { $and: [{ memberId: id }, { isActive: true }, { serviceType: "chat" }] },
    function (err, chat1) {
      let chat = chat1[0].serviceCredits;
      celebrityContract.find(
        { $and: [{ memberId: id }, { isActive: true }, { serviceType: "audio" }] },
        function (err, audio1) {
          let audio = audio1[0].serviceCredits;
          celebrityContract.find(
            { $and: [{ memberId: id }, { isActive: true }, { serviceType: "video" }] },
            function (err, video1) {
              let video = video1[0].serviceCredits;
              celebrityContract.find(
                { $and: [{ memberId: id }, { isActive: true }, { serviceType: "fan" }] },
                function (err, fan1) {
                  let fan = fan1[0].serviceCredits;
                  if (err) return res.send(err);
                  let query = {
                    $and: [
                     // { $or: [{ startTime: { $gte: new Date() } }, { endTime: { $gte: new Date() } }] },
                      { memberId: id },
                      //{ scheduleStatus: "inactive" },
                      //{ scheduleStatus: "inactive" },
                      {"slotArray.slotStatus": "unreserved"}
                    ]
                  };
                  slotMaster.find(query, (err, slotCount) => {
                    //console.log("slotCount",slotCount)
                    if (err) {
                      return res.json({ success: 0, message: `Please enter valid email ${err}`, data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia, creditDetails: null } })
                    } else {
                      let sCount;
                      if(slotCount.length > 0){
                        sCount = true;
                      }else if (slotCount.length == 0){
                        sCount = false;
                      }
                      res.json({ token: req.headers['x-access-token'], success: 1, data: {chat, audio, video, fan,schedules:sCount} });
                      //fanFollowingFollowerFeedCount.scheduleCount = slotCount;
                      //return res.json({ success: 1, token: req.headers['x-access-token'], data: { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, creditDetails: creditDetails[0], scheduleCount: parseInt(slotCount) } })
                    }
                  });
                 
                  //res.json({ chat, audio, video, fan })
                }
              );
            });
        });
    });
});
// End of get by MemberID (getContractByID)

// Get Contracts for a member by User ID and Service Type
router.get("/getContractsByMemberIdByService/:UserID/:serviceType", function (
  req,
  res
) {
  let id = req.params.UserID;
  let serviceType1 = req.params.serviceType;
  let query = {
    $and: [
      { memberId: ObjectId(id) },
      { serviceType: serviceType1 },
      { isActive: true }
    ]
  };
  celebrityContract.find(query, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    res.json({ token: req.headers['x-access-token'], success: 1, data: result });
  });
});
// End of Get Contracts for a member by User ID and Service Type


// // Create a celebrityContract
// router.post("/create", function (req, res) {

//   celebrityContract.find({ memberId: req.body.memberId[0] }, function (err, oldContracts) {
//     if (err) return res.send(err);
//     //console.log(oldContracts)
//     if (oldContracts.length > 0) {
//       for (let j = 0; j < oldContracts.length; j++) {
//         celebrityContract.findByIdAndRemove(oldContracts[j]._id, function (err, post) {
//           if (err) console.log(err);
//           if (post) console.log("deleted contract " + j)
//         });
//       }
//       for (let i = 0; i < (req.body.memberId).length; i++) {
//         let memberId = req.body.memberId[i];
//         let serviceType = req.body.serviceType[i];
//         let startDate = new Date();
//         let endDate = req.body.endDate[i];
//         let minDuration = req.body.minDuration[i];
//         let maxDuration = req.body.maxDuration[i];
//         let managerSharePercentage = req.body.managerSharePercentage[i];
//         let charitySharePercentage = req.body.charitySharePercentage[i];
//         let promoterSharePercentage = req.body.promoterSharePercentage[i];
//         let sharingPercentage = req.body.sharingPercentage[i];
//         let serviceCredits = req.body.serviceCredits[i];
//         let contractUpdateRemarks = req.body.contractUpdateRemarks[i];
//         let specialNotes = req.body.specialNotes[i];
//         let isActive = req.body.isActive[i];
//         let createdBy = req.body.createdBy[i];

//         let newCelebrityContract = new celebrityContract({
//           memberId: memberId,
//           serviceType: serviceType,
//           startDate: startDate,
//           endDate: endDate,
//           minDuration: minDuration,
//           maxDuration: maxDuration,
//           managerSharePercentage: managerSharePercentage,
//           charitySharePercentage: charitySharePercentage,
//           promoterSharePercentage: promoterSharePercentage,
//           sharingPercentage: sharingPercentage,
//           serviceCredits: serviceCredits,
//           contractUpdateRemarks: contractUpdateRemarks,
//           specialNotes: specialNotes,
//           isActive: isActive,
//           createdBy: createdBy
//         });

//         celebrityContract.createCelebrityContract(newCelebrityContract, function (
//           err,
//           user
//         ) {
//           if (err) {
//             //console.log(err);
//           }
//         });
//       }
//       res.send({ message: "Celebrity Contract created successfully" });
//     } else {
//       for (let i = 0; i < (req.body.memberId).length; i++) {
//         let memberId = req.body.memberId[i];
//         let serviceType = req.body.serviceType[i];
//         let startDate = new Date();
//         let endDate = req.body.endDate[i];
//         let minDuration = req.body.minDuration[i];
//         let maxDuration = req.body.maxDuration[i];
//         let managerSharePercentage = req.body.managerSharePercentage[i];
//         let charitySharePercentage = req.body.charitySharePercentage[i];
//         let promoterSharePercentage = req.body.promoterSharePercentage[i];
//         let sharingPercentage = req.body.sharingPercentage[i];
//         let serviceCredits = req.body.serviceCredits[i];
//         let contractUpdateRemarks = req.body.contractUpdateRemarks[i];
//         let specialNotes = req.body.specialNotes[i];
//         let isActive = req.body.isActive[i];
//         let createdBy = req.body.createdBy[i];

//         let newCelebrityContract = new celebrityContract({
//           memberId: memberId,
//           serviceType: serviceType,
//           startDate: startDate,
//           endDate: endDate,
//           minDuration: minDuration,
//           maxDuration: maxDuration,
//           managerSharePercentage: managerSharePercentage,
//           charitySharePercentage: charitySharePercentage,
//           promoterSharePercentage: promoterSharePercentage,
//           sharingPercentage: sharingPercentage,
//           serviceCredits: serviceCredits,
//           contractUpdateRemarks: contractUpdateRemarks,
//           specialNotes: specialNotes,
//           isActive: isActive,
//           createdBy: createdBy
//         });

//         celebrityContract.createCelebrityContract(newCelebrityContract, function (
//           err,
//           user
//         ) {
//           if (err) {
//             //console.log(err);
//           }
//         });
//       }
//       res.send({ message: "Celebrity Contract created successfully" });
//     }
//   });




// });
// // End of Create a celebrityContract

// // Update a Celebrity Contract using ContractID
// router.put("/edit/:contractID", function (req, res) {
//   let id = req.params.contractID;

//   let reqbody = req.body;
//   reqbody.updatedAt = new Date();

//   celebrityContract.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       celebrityContract.findByIdAndUpdate(id, reqbody, function (err, result) {
//         if (err) return res.send(err);
//         res.json({ message: "Contract Updated Successfully" });
//       });
//     } else {
//       res.json({ error: "Contract not found / Invalid" });
//     }
//   });
// });
// // End of Update a Celebrity Contract using ContractID

// // get by Contract Id
// router.get("/getContractByID/:conractID", function (req, res) {
//   let id = req.params.conractID;

//   celebrityContract.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     res.send(result);
//   });
// });
// // End of get by Contract Id

// // get by UserId (getContractByID)
// router.get("/getContractsByUserID/:UserID", function (req, res) {
//   let id = req.params.UserID;

//   celebrityContract.find(
//     { $and: [{ memberId: id }, { isActive: true }] },
//     function (err, result) {
//       if (err) return res.send(err);
//       res.send(result);
//     }
//   );
// });
// // End of get by UserId (getContractByID)


// // Get list of all celebrity contracts
// router.get("/getAll", function (req, res) {
//   celebrityContract.find({}, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   }).sort({ createdAt: -1 });
// });
// // End of Get list of all celebrity contracts

// // Delete a celebrityContract
// router.delete("/delete/:contractID", function (req, res, next) {
//   let id = req.params.contractID;
//   celebrityContract.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       celebrityContract.findByIdAndRemove(id, function (err, post) {
//         if (err) return res.send(err);
//         res.json({ message: "Deleted contract successfully" });
//       });
//     } else {
//       res.json({ error: "contractID not found / Invalid" });
//     }
//   });
// });
// // Delete a celebrityContract

//This is wrong ,its not right to write this type of code writing for loop is not at all good
//if not now, in future we will face problem 
//we have to change memberId which is store in string  to object :- Prathmesh
// router.get("/getOnlineOfflineUser/:memberId", (req, res) => {
//   celebrityContract.distinct("memberId", { isActive: true }, (err, contractsCelebArray) => {
//     if (err) {
//       res.json({ usersDetail: null, err: err })
//     }
//     else {
//       //console.log(contractsCelebArray.length)
//       //let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
//       let objectIdArray = contractsCelebArray.map(s =>
//         req.params.memberId != s ? mongoose.Types.ObjectId(s) : null
//       );
//       MemberPreferences.findOne({ memberId: ObjectId(req.params.memberId) }, { celebrities: 1 }, (err, listOfMyPreferences) => {
//         //console.log("Pa1",listOfMyPreferences);
//         if (err) {
//           res.json({ token: req.headers['x-access-token'], success: 0, data: null });
//         } else if (listOfMyPreferences) {

//           User.aggregate(
//             [
//               {
//                 $match: {
//                   '_id': { $in: objectIdArray },
//                   isCeleb: true,
//                   IsDeleted: false
//                 }
//               },
//               {
//                 $sort: {
//                   isOnline: -1
//                 }
//               },
//               {
//                 $project: {
//                   "location": 0,
//                   "country": 0,
//                   "loginType": 0,
//                   "dateOfBirth": 0,
//                   "address": 0,
//                   "referralCode": 0,
//                   "cumulativeSpent": 0,
//                   "cumulativeEarnings": 0,
//                   "lastActivity": 0,
//                   "userCategory": 0,
//                   "liveStatus": 0,
//                   "status": 0,
//                   "isTrending": 0,
//                   "isEditorChoice": 0,
//                   "isPromoted": 0,
//                   "isEmailVerified": 0,
//                   "isMobileVerified": 0,
//                   "emailVerificationCode": 0,
//                   "mobileVerificationCode": 0,
//                   "celebRecommendations": 0,
//                   "celebToManager": 0,
//                   "iosUpdatedAt": 0,
//                   "updated_at": 0,
//                   "created_by": 0,
//                   "updated_by": 0,
//                   "IsDeleted": 0,
//                   "isPromoter": 0,
//                   "isManager": 0,
//                   "managerRefId": 0,
//                   "promoterRefId": 0,
//                   "charityRefId": 0,
//                   "celebCredits": 0,
//                   "alternateEmail": 0,
//                   "alternateMobile": 0,
//                   "areaOfSpecialization": 0,
//                   "managerIndustry": 0,
//                   "managerCategory": 0,
//                   "managerSubCategory": 0,
//                   "experience": 0,
//                   "languages": 0,
//                   "website": 0,
//                   "facebookLink": 0,
//                   "twitterLink": 0,
//                   "password": 0,
//                   "created_at": 0,
//                   "celebritiesWorkedFor": 0,
//                   "callStatus": 0,
//                   "email": 0,
//                   "username": 0,
//                   "mobileNumber": 0,
//                   "Dnd": 0,
//                   "gender": 0,
//                   "industry": 0,
//                   "avtar_originalname": 0,
//                   "imageRatio": 0,
//                   "name": 0,
//                   "prefix": 0
//                 }
//               }
//             ], (err, usersDetail) => {
//               if (err) {
//                 res.json({ token: req.headers['x-access-token'], success: 0, usersDetail: null, err: err })
//               }
//               else {
//                 usersDetail.map((user) => {
//                   user.isFan = false;
//                   user.isFollower = false;
//                   if (listOfMyPreferences.celebrities.length) {
//                     user.isFan = listOfMyPreferences.celebrities.some((s) => {
//                       return ((user._id + "" == s.CelebrityId + "") && (s.isFan == true))
//                     });
//                     user.isFollower = listOfMyPreferences.celebrities.some((s) => {
//                       return ((user._id + "" == s.CelebrityId + "") && (s.isFollower == true))
//                     });
//                   }
//                 })
//                 res.json({ token: req.headers['x-access-token'], success: 1, data: usersDetail });
//               }
//             })
//         }
//         else if ((listOfMyPreferences == null) || (listOfMyPreferences == "")) {
//           User.aggregate(
//             [
//               {
//                 $match: {
//                   '_id': { $in: objectIdArray },
//                   isCeleb: true,
//                   IsDeleted: false
//                 }
//               },
//               {
//                 $sort: {
//                   isOnline: -1
//                 }
//               },
//               {
//                 $project: {
//                   "location": 0,
//                   "country": 0,
//                   "loginType": 0,
//                   "dateOfBirth": 0,
//                   "address": 0,
//                   "referralCode": 0,
//                   "cumulativeSpent": 0,
//                   "cumulativeEarnings": 0,
//                   "lastActivity": 0,
//                   "userCategory": 0,
//                   "liveStatus": 0,
//                   "status": 0,
//                   "isTrending": 0,
//                   "isEditorChoice": 0,
//                   "isPromoted": 0,
//                   "isEmailVerified": 0,
//                   "isMobileVerified": 0,
//                   "emailVerificationCode": 0,
//                   "mobileVerificationCode": 0,
//                   "celebRecommendations": 0,
//                   "celebToManager": 0,
//                   "iosUpdatedAt": 0,
//                   "updated_at": 0,
//                   "created_by": 0,
//                   "updated_by": 0,
//                   "IsDeleted": 0,
//                   "isPromoter": 0,
//                   "isManager": 0,
//                   "managerRefId": 0,
//                   "promoterRefId": 0,
//                   "charityRefId": 0,
//                   "celebCredits": 0,
//                   "alternateEmail": 0,
//                   "alternateMobile": 0,
//                   "areaOfSpecialization": 0,
//                   "managerIndustry": 0,
//                   "managerCategory": 0,
//                   "managerSubCategory": 0,
//                   "experience": 0,
//                   "languages": 0,
//                   "website": 0,
//                   "facebookLink": 0,
//                   "twitterLink": 0,
//                   "password": 0,
//                   "created_at": 0,
//                   "celebritiesWorkedFor": 0,
//                   "callStatus": 0,
//                   "email": 0,
//                   "username": 0,
//                   "mobileNumber": 0,
//                   "Dnd": 0,
//                   "gender": 0,
//                   "industry": 0,
//                   "avtar_originalname": 0,
//                   "imageRatio": 0,
//                   "name": 0,
//                   "prefix": 0
//                 }
//               }
//             ], (err, usersDetail) => {
//               if (err) {
//                 res.json({ token: req.headers['x-access-token'], success: 0, data: null, err: err })
//               }
//               else {
//                 usersDetail.map((user) => {
//                   // user.isFan = false;
//                   // user.isFollower =false;
//                   // if(listOfMyPreferences.celebrities.length)
//                   // {
//                   //   user.isFan = listOfMyPreferences.celebrities.some((s)=>{
//                   //     return ((user._id+"" == s.CelebrityId+"") && (s.isFan == true))
//                   //   });
//                   //   user.isFollower = listOfMyPreferences.celebrities.some((s)=>{
//                   //     return ((user._id+"" == s.CelebrityId+"") && (s.isFollower == true))
//                   //   });
//                   // }
//                 })
//                 res.json({ token: req.headers['x-access-token'], success: 1, data: usersDetail })
//               }
//             })
//         }
//       });
//     }
//   })
// })
module.exports = router;
