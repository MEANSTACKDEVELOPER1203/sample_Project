let User = require('../components/users/userModel');
let ObjectId = require('mongodb').ObjectId;
let Login = require('../components/loginInfo/loginInfoModel');
let Memberpreferences = require('../components/memberpreferences/memberpreferencesModel');
let NotificationMaster = require('../components/notificationMaster/notificationMasterModel');
const mySms = require('../smsConfig');
//let MediaTracking = require('../../models/mediaTracking');
const config = require('../config/config');
let Credits = require('../components/credits/creditsModel');
let Notification = require('../components/notification/notificationModel');
let MemberMedia = require('../components/memberMedia1/memberMediaModel');
let Feeddata = require('../models/feeddata');
let ServiceSchedule = require('../components/serviceSchedule/serviceScheduleModel');
let Chat = require('../models/chat');
let Cart = require('../components/cart/cartModel');
let MediaTracking = require('../components/mediaTracking/mediaTrackingModel');
let ServiceTransaction = require('../components/serviceTransaction/serviceTransactionModel');
let CelebrityContracts = require('../components/celebrityContract/celebrityContractsModel');
let PaymentTransaction = require('../components/paymentTransaction/paymentTransactionModel');
let PayCredits = require('../components/payCredits/payCreditsModel');
let NotificationSettings = require('../components/notificationSettings/notificationSettingsModel');
let LiveTimeLog = require('../components/liveTimeLog/liveTimeLogModel');
let Feedback = require('../components/feedback/feedbackModel');
let ReferralCode = require('../components/referralCode/referralCodeModel');
const comLog = require("../components/comLog/comLogModel");



let findUser = function (memberDetails, callback) {
  var n = memberDetails.length;
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  let query;
  // if (n == 24) {
  //   query = { _id: ObjectId(memberDetails) }
  // } else 
  if (format.test(memberDetails)) {
    query = { email: memberDetails }
  } else {
    query = { mobileNumber: memberDetails }
  }
  //console.log(query)
  User.findOne(query, { email: 1, mobileNumber: 1, _id: 1 }, (err, userObj) => {
    if (err)
      return callback(err, null)
    else {
      return callback(null, userObj)
    }
  });
}

let findUserDetails = function (memberDetails, password, callback) {
  var n = memberDetails.length;
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  let query;
  // if (n == 24) {
  //   query = { _id: ObjectId(memberDetails) }
  // } else 
  if (format.test(memberDetails)) {
    query = { email: memberDetails }
  } else {
    query = { mobileNumber: memberDetails }
  }
  //console.log(query)
  User.findOne(query, (err, userObj) => {
    if (err)
      return callback(err, null)
    else {
      if (userObj) {
        Login.findOne(query, (err, loginObj) => {
          if (err)
            return callback(err, null)
          else {
            User.comparePassword(password, loginObj.password, (err, isMatch) => {
              if (err)
                return callback(err, null)
              else if (!isMatch) {
                return callback("invalid password", null);
              }
              else {
                return callback(null, userObj)
              }
            })
          }
        })
      } else {
        callback(null, userObj)
      }

    }
  })
}

let deleteMemberCartsHistory = function (memberId, callback) {
  Cart.deleteMany({ requestMemberId: memberId, celebrityId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberChatHistory = function (memberId, callback) {
  Chat.deleteMany({ senderId: memberId, receiverId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberServiceScheduleHistory = function (memberId, callback) {
  ServiceSchedule.deleteMany({ senderId: memberId, receiverId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberFeedHistory = function (memberId, callback) {
  Feeddata.deleteMany({ memberId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberMediaHistory = function (memberId, callback) {
  MemberMedia.findOneAndRemove({ memberId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberNotificationHistory = function (memberId, callback) {
  Notification.deleteMany({ memberId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberCreditsHistory = function (memberId, callback) {
  Credits.deleteMany({ memberId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteUserAccount = function (memberId, callback) {
  User.findByIdAndRemove(memberId, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteLoginAccount = function (memberId, callback) {
  Login.findOneAndRemove({ memberId: ObjectId(memberId) }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberPreference = function (memberId, callback) {
  Memberpreferences.findOneAndRemove({ memberId: memberId }, (err, deleted) => {
    if (!err)
      callback(null, deleted)
    else
      callback(err, null)
  });
}
let deleteMemberMediaTracking = function (memberId, callback) {
  MediaTracking.deleteMany({ memberId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj)
    else
      callback(err, null)
  })
}

let deleteServiceTransactionHistory = function (memberId, callback) {
  ServiceTransaction.deleteMany({ senderId: memberId, receiverId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj)
    else
      callback(err, null)
  })
}
let deleteCelebContractHistory = function (memberId, callback) {
  memberId = "" + memberId
  CelebrityContracts.deleteMany({ memberId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj)
    else
      callback(err, null)
  })
}
let deletePaymentHistory = function (memberId, callback) {
  PaymentTransaction.deleteMany({ memberId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj);
    else
      callback(err, null)
  })
}
let deletePayCreditsHistory = function (memberId, callback) {
  PayCredits.deleteMany({ memberId: memberId, celebId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj);
    else
      callback(err, null)
  });
}
let deleteNotificationSettingHistory = function (memberId, callback) {
  NotificationSettings.deleteMany({ memberId: memberId, notificationSettingId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj);
    else
      callback(err, null)
  });
}
let deleteLiveTimeLogsHistory = function (memberId, callback) {
  LiveTimeLog.deleteMany({ memberId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj);
    else
      callback(err, null)
  })
}
let deleteFeedBackHistory = function (memberId, callback) {
  Feedback.deleteMany({ memberId: memberId, celebrityId: memberId }, (err, deletedObj) => {
    if (!err)
      callback(null, deletedObj);
    else
      callback(err, null)
  })
}

let removeFromFanFollowHistory = function (memberId, callback) {
  Memberpreferences.update({}, { $pull: { celebrities: { CelebrityId: memberId } } }, { multi: true }, (err, updateObj) => {
    if (!err)
      callback(null, updateObj);
    else
      callback(err, null)
  })
}

let removeReferelCodeFromUsersHistory = function (memberId, callback) {
  ReferralCode.findOne({ memberId: memberId }, (err, refCodeObj) => {
    if (err)
      callback(err, null)
    else {
      User.updateMany({ referralCode: refCodeObj.memberCode }, { $set: { referralCode: "" } }, { multi: true }, (err, updateObj) => {
        if (!err)
          callback(null, updateObj);
        else
          callback(err, null)
      })
    }
  })


}




let findAllCelebs = function (callback) {
  User.find({ isCeleb: true, IsDeleted: false }, { _id: 1 }, (err, listOfCelebIds) => {
    if (err)
      callback(err, null);
    else {
      let celebIds = listOfCelebIds.map((celebId) => {
        return (celebId._id);
      })
      //console.log("celebIds ======== ", celebIds);
      callback(null, celebIds)
    }
  });
}
let findActiveCelebInApp = function (callback) {
  let today = new Date();
  let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
  console.log("lastWeek===========  ", lastWeek);
  Feeddata.aggregate([
    {
      $match: { created_at: { $lte: today, $gte: lastWeek }, isDelete: false }
    },
    {
      $limit: 50
    },
    {
      $sort: { created_at: -1 }
    },

    {
      $lookup: {
        from: "users",
        localField: 'memberId',
        foreignField: '_id',
        as: "celebDetails"
      }
    },
    {
      "$unwind": "$celebDetails"
    },
    {
      $project: {
        _id: 1,
        memberId: 1,
        created_at: 1,
        isDelete: 1,
        celebDetails: {
          _id: 1,
          isCeleb: 1,
          isManager: 1,
          isOnline: 1,
          avtar_imgPath: 1,
          firstName: 1,
          lastName: 1,
          profession: 1,
          gender: 1,
          username: 1,
        },
      }
    }

  ], function (err, listOfActiveCelebObj) {
    if (err)
      callback(err, null)
    else {
      console.log(listOfActiveCelebObj.length)
      callback(null, listOfActiveCelebObj)
    }

  })
}
let findFanFollowTrandingCelebs = function (celebIds, callback) {
  let today = new Date();
  let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);
  console.log("lastWeek===========  ", lastWeek);
  Memberpreferences.aggregate([
    {
      $match: {
        $and: [{ "celebrities.createdAt": { $lte: today, $gte: lastWeek } }],
        memberId: { $in: celebIds }
      }
    }, {
      $limit: 50
    },
    {
      $lookup: {
        from: "users",
        localField: 'memberId',
        foreignField: '_id',
        as: "celebDetails"
      }
    },
    {
      "$unwind": "$celebDetails"
    },
    {
      $project: {
        _id: 1,
        memberId: 1,
        createdAt: 1,
        celebrities: 1,
        celebDetails: {
          _id: 1,
          isCeleb: 1,
          isManager: 1,
          isOnline: 1,
          avtar_imgPath: 1,
          firstName: 1,
          lastName: 1,
          profession: 1,
          gender: 1,
          username: 1,
        },
      }
    }

  ], function (err, listOfFanFollowTrendingObj) {
    if (err)
      callback(err, null)
    else {
      for (let i = 0; i < listOfFanFollowTrendingObj.length; i++) {
        let listOfFanFollow = listOfFanFollowTrendingObj[i].celebrities;
        let count = 0;
        for (let j = 0; j < listOfFanFollow.length; j++) {
          let fanFollowObj = {}
          fanFollowObj = listOfFanFollow[j];
          if (new Date(fanFollowObj.createdAt).getTime() <= new Date(today).getTime() && new Date(fanFollowObj.createdAt).getTime() >= new Date(lastWeek).getTime()) {
            count = count + 1;
          }
        }
        listOfFanFollowTrendingObj[i].count = count;
        listOfFanFollowTrendingObj[i].celebrities = [];
        //console.log("Total count ============= ", count)
      }
      listOfFanFollowTrendingObj.sort(function (a, b) { return b.count - a.count });
      callback(null, listOfFanFollowTrendingObj);
    }

  });
}


let findLastCredit = function (memberId, creditValue, callback) {
  Credits.find({ memberId: memberId }, (err, creditObj) => {
    if (err)
      callback(err, null)
    else {
      Credits.findByIdAndUpdate(creditObj[0]._id, { $set: { cumulativeCreditValue: creditValue } }, (err, updateObj) => {
        if (err)
          callback(err, null);
        else
          callback(null, updateObj)
      })
    }
  }).sort({ createdAt: -1 }).limit(1);
}

// let findMemberMedia = function (query, callback) {
//   MemberMedia.aggregate([
//     {
//       $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
//     },
//     { $unwind: '$media' },
//     {
//       $match: { "media.createdAt": { $lt: new Date(query.paginationDate) } }
//     },
//     {
//       $match: { "media.mediaType": { $in: [query.mediaType] } }
//     },
//     { $sort: { "media.createdAt": -1 } },
//     { $limit: 15 },
//     {
//       "$group": {
//         "_id": "$_id",
//         memberId: { $first: "$memberId" },
//         createdAt: { $first: "$createdAt" },
//         media: { "$push": "$media" }
//       }
//     }
//   ], function (err, memberMediaObj) {
//     if (err)
//       callback(err, null)
//     else
//       callback(null, memberMediaObj)
//   });
// }

// let findMemberMediaBothSide = function (query, callback) {
//   MemberMedia.aggregate([
//     {
//       $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
//     },
//     { $unwind: '$media' },
//     {
//       $match: { "media.createdAt": { $lte: new Date(query.paginationDate) } }
//     },
//     {
//       $match: { "media.mediaType": { $in: [query.mediaType] } }
//     },
//     { $sort: { "media.createdAt": -1 } },
//     { $limit: 5 },
//     {
//       "$group": {
//         "_id": "$_id",
//         memberId: { $first: "$memberId" },
//         createdAt: { $first: "$createdAt" },
//         media: { "$push": "$media" }
//       }
//     }
//   ], function (err, preMemberMediaObj) {
//     if (err)
//       callback(err, null)
//     else {
//       MemberMedia.aggregate([
//         {
//           $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
//         },
//         { $unwind: '$media' },
//         {
//           $match: { "media.createdAt": { $gt: new Date(query.paginationDate) } }
//         },
//         {
//           $match: { "media.mediaType": { $in: [query.mediaType] } }
//         },
//         { $sort: { "media.createdAt": -1 } },
//         { $limit: 5 },
//         {
//           "$group": {
//             "_id": "$_id",
//             memberId: { $first: "$memberId" },
//             createdAt: { $first: "$createdAt" },
//             media: { "$push": "$media" }
//           }
//         }
//       ], function(err, nextMemberMediaObj){
//         if (err)
//         callback(err, null)
//         else{
//           preMemberMediaObj.push(...nextMemberMediaObj);
//           //listOfFeedObj.push(...listOfFeedByMemberPreferenceObj)
//           callback(null, preMemberMediaObj)
//         }
//       })

//     }

//   })
// }










let dumyService = {
  findUserDetails: findUserDetails,
  deleteUserAccount: deleteUserAccount,
  deleteLoginAccount: deleteLoginAccount,
  deleteMemberPreference: deleteMemberPreference,
  deleteMemberMediaTracking: deleteMemberMediaTracking,
  deleteMemberCreditsHistory: deleteMemberCreditsHistory,
  deleteMemberNotificationHistory: deleteMemberNotificationHistory,
  deleteMemberMediaHistory: deleteMemberMediaHistory,
  deleteMemberFeedHistory: deleteMemberFeedHistory,
  deleteMemberServiceScheduleHistory: deleteMemberServiceScheduleHistory,
  deleteMemberChatHistory: deleteMemberChatHistory,
  deleteMemberCartsHistory: deleteMemberCartsHistory,
  deleteServiceTransactionHistory: deleteServiceTransactionHistory,
  deleteCelebContractHistory: deleteCelebContractHistory,
  deletePaymentHistory: deletePaymentHistory,
  deletePayCreditsHistory: deletePayCreditsHistory,
  deleteNotificationSettingHistory: deleteNotificationSettingHistory,
  deleteLiveTimeLogsHistory: deleteLiveTimeLogsHistory,
  deleteFeedBackHistory: deleteFeedBackHistory,
  removeFromFanFollowHistory: removeFromFanFollowHistory,
  findAllCelebs: findAllCelebs,
  findActiveCelebInApp: findActiveCelebInApp,
  findFanFollowTrandingCelebs: findFanFollowTrandingCelebs,
  findUser: findUser,
  findLastCredit: findLastCredit,
  removeReferelCodeFromUsersHistory: removeReferelCodeFromUsersHistory
  //findMemberMedia: findMemberMedia,
  //findMemberMediaBothSide: findMemberMediaBothSide

}

module.exports = dumyService;