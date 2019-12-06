const ObjectId = require("mongodb").ObjectID;
const SlotMaster = require("./slotMasterModel");
const Logins = require("../loginInfo/loginInfoModel");
const users = require("../users/userModel")
const notificationSetting = require("../notificationSettings/notificationSettingsModel");
const CelebManagerService = require("../CelebManager/celebManagerService");
const Notification = require("../notification/notificationModel");
const FCM = require('fcm-push');
const serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
const fcm = new FCM(serverkey);
const MemberPreferences = require("../memberpreferences/memberpreferencesModel");
const User = require("../users/userModel");
const OtpService = require('../otp/otpRouter');
const SlotMasterController = require("./slotMasterController");
const serviceTransaction = require("../serviceTransaction/serviceTransactionModel")


const editSlot = (id, update, callback) => {
  SlotMaster.findByIdAndUpdate(id, update, { new: true }, (err, updatedSlot) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, updatedSlot)
    }
  })
}

const updateSlotSchedule = (schID, reqbody, callback) => {
  SlotMaster.findOneAndUpdate(
    { "scheduleArray._id": schID },
    {
      $set: {
        "scheduleArray.$.scheduleId": reqbody.scheduleId,
        "scheduleArray.$.memberId": reqbody.memberId,
        "scheduleArray.$.scheduleStatus": reqbody.scheduleStatus
      }
    },
    { upsert: true }, (err, newresult) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, newresult)
      }
    });
}


const updateScheduleStatus = (schID, reqbody, callback) => {
  SlotMaster.findOneAndUpdate(
    { "scheduleArray._id": schID },
    {
      $set: {
        "scheduleArray.$.scheduleStatus": reqbody.scheduleStatus
      }
    },
    { upsert: true }, (err, newresult) => {
      if (err) {
        res.json({ error: "InvalidID" });
      } else {
        callback(null, newresult)
        let newBody = {};
        newBody.isScheduled = true;
        newBody.updatedAt = new Date();
        SlotMaster.findByIdAndUpdate(newresult._id, newBody, (err, result) => {
          if (err) {
            console.log(err)
          }
        });
      }
    });
}


const getAllSlot = (callback) => {
  SlotMaster.find({}, (err, allSlots) => {
    if (result) {
      callback(null, allSlots)
    } else {
      callback(err, null)
    }
  });
}


const deleteslotMasterById = (slotMasterId, callback) => {
  // SlotMaster.update({}, { $pull: { scheduleArray: { _id: ObjectId(slotMasterId) } } }, (err, data) => {
  //   if (err) {
  //     callback(err, null)
  //   } else {
  //     callback(null, data)
  //   }
  // })
  SlotMaster.findByIdAndRemove(ObjectId(slotMasterId), (err, data) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, data)
    }
  });
}
const deleteslotMasterById1 = (body, callback) => {
  ///////////////////////////
  // console.log("Body", body);
  let ids = body.id
  let memberId = ObjectId(body.memberId);
  let query = {};
  let query1 = {};


  if (body.deleteAll == true) {
    query = { memberId: memberId }
  } else {
    ids = ids.map(id => {
      return ObjectId(id)
    })
    if (ids.length <= 0) {
      return callback("ids not found")
    }
    query = { _id: { $in: ids },scheduleStatus : { $in: ["inactive","expired"] } }
    query1 = { schId: { $in: ids },serviceStatus:"scheduled" }
  }
  // console.log("Notification fanal query === ",query);
  SlotMaster.updateMany(query, { $set: { isDeleted: true,scheduleNotificationStatus:"delete" } }, (err, deletedObj) => {
    if (err){
      callback(null, deletedObj);
    }
      else{
      // serviceTransaction.find(query1, function (err, sTresult) {
      //   if (err) {
      //     console.log("1", err);
      //   } else {
      //     //console.log("2", sTresult);
      //     for(let i=0;i < sTresult.length;i++){
      //       var newvalues = { $set: { serviceStatus:"canceled"} };
      //       //console.log("query1",sTresult)
      //       serviceTransaction.findByIdAndUpdate(sTresult[i]._id, newvalues, function (err, sresult) {
      //         if (err) {
      //           console.log("1", err);
      //         } else {
      //           users.findOne({ _id: sTresult[i].receiverId }, function (err, recieverInfo) {
      //             Logins.findOne({ memberId: sTresult[i].senderId }, function (err, senderInfo) {
      //             if (senderInfo == null) {
      //             } else {
      //               let dToken = senderInfo.deviceToken
      //               let cdToken = senderInfo.callingDeviceToken
      //               let newNotification = new Notification({
      //                           scheduleId:ids,
      //                           memberId:senderInfo.memberId,
      //                           notificationFrom:recieverInfo._id,
      //                           activity: "SCHEDULE",
      //                           title: "Schedule Alert!!",
      //                           body: recieverInfo.firstName + " has cancelled their schedule.",
      //                           notificationType: "Call"
      //               });
      //               //Insert Notification
      //               Notification.createNotification(newNotification, function (err, credits) {
      //                 if (err) {
      //                   // res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      //                 } else {
      //                   //res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
      //                   let query = {
      //                     $and: [{
      //                       memberId: senderInfo.memberId
      //                     }, {
      //                       notificationSettingId: ObjectId("5c9b3ddb7aefd6165408e782")
      //                     }]
      //                   };
      //                   notificationSetting.find(query, function (err, rest) {
      //                     if (err) return res.send(err);
      //                     //console.log("t1", rest);
      //                     if (rest.length <= 0 || rest[0].isEnabled == true) {
      //                       if (senderInfo.osType == "Android") {
      //                         ///////////////////////////   FCM SENDING MESSAGE  /////////////////////////////////
      //                         //console.log("1")
      //                         var message = {
      //                           to: dToken,
      //                           collapse_key: 'Service-alerts',
      //                           scheduleId:ids,
      //                           notificationFrom:recieverInfo._id,
      //                           activity: "SCHEDULE",
      //                           title: "Schedule Alert!!",
      //                           body: recieverInfo.firstName + " has cancelled their schedule.",
      //                           notificationType: "Call"
      //                         };
      //                         //console.log("message",message);
      //                         fcm.send(message, function (err, response) {
          
      //                           if (err) {
                                
      //                           } else {
      //                             reqBody = {};
          
      //                             //Update service status
      //                             let myBody = {};
      //                             myBody.fcmmembernotification = "FCM Alert Sent-Member for schdule delete";
      //                             serviceTransaction.findByIdAndUpdate(sTresult[i]._id, myBody, function (err, ssresult) {
      //                               if (err) {
      //                                 res.json({
      //                                   error: "User Not Exists / Send a valid UserID"
      //                                 });
      //                               } else {
          
          
      //                               }
      //                             });
      //                             //console.log("response",response)
          
      //                           }
      //                         });
      //                       }
      //                       else if (senderInfo.osType == "IOS") {
      //                         //console.log("1")
      //                         var message = {
      //                           to: dToken,
      //                           collapse_key: 'Service-alerts',
      //                           scheduleId:ids,
      //                           notificationFrom:recieverInfo._id,
      //                           activity: "SCHEDULE",
      //                           title: "Schedule Alert!!",
      //                           body: recieverInfo.firstName + " has cancelled their schedule.",
      //                           notificationType: "Call"
      //                         };
      //                         //console.log("message",message);
      //                         fcm.send(message, function (err, response) {
          
      //                           if (err) {
                                
      //                           } else {
      //                             reqBody = {};
          
      //                             //Update service status
      //                             let myBody = {};
      //                             myBody.fcmmembernotification = "FCM Alert Sent-Member for schdule delete";
      //                             serviceTransaction.findByIdAndUpdate(sTresult[i]._id, myBody, function (err, ssresult) {
      //                               if (err) {
      //                                 res.json({
      //                                   error: "User Not Exists / Send a valid UserID"
      //                                 });
      //                               } else {
          
          
      //                               }
      //                             });
      //                             //console.log("response",response)
          
      //                           }
      //                         });
                          
      //                       };

      //                     }
      //                   });
      //                 }
      //                 });
      //               //console.log("LSresult",LSresult)
                    
      //             }
      //           });
      //         });
      //           //console.log("2", sresult);
      //         }
      //       });
      //     }
         
      //   }
      // });
      callback(null, deletedObj);
    }

 

  })
  ////////////////////////////////////////////
}



const getSlotByMemberId = (memberId, callback) => {
  SlotMaster.find({ memberId: ObjectId(memberId) }, (err, slotsOfMember) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, slotsOfMember)
    }
  }).sort({ createdAt: -1 });
}


const getSlotDetailsById = (scheduleId, memberId, celebId, callback) => {
  //console.log("slotId",slotId)
  SlotMaster.find(
    { _id: scheduleId },
    //{startTime:{ $gte: new Date() }},
    // { "slotArray.slotStatus": "unreserved" },
    // {
    //   $set: {
    //     "slotArray.$.slotStatus": "reserved"
    //   }
    // },
    (err, newresult) => {
      //console.log("newresult",newresult)
      //console.log("newresult",newresult[0].slotArray);
      if (err) {

      } else if (newresult.length == 0) {
        //console.log("newresult",newresult)
      }
      else {
        callback(null, newresult[0])
      }
    });
  // SlotMaster.findById(ObjectId(slotId), (err, result) => {
  //   console.log("slotId",result)
  //   if (result) {
  //     let a = result.startTime;
  //     let b = result.endTime;
  //     c = (b - a) / (1000 * 60);
  //     let sum = 0;
  //     if (result.scheduleArray.length > 0) {
  //       for (let i = 0; i < result.scheduleArray.length; i++) {
  //         let x = result.scheduleArray[i].scheduleEndTime;
  //         let y = result.scheduleArray[i].scheduleStartTime;
  //         let z = (x - y) / (1000 * 60);

  //         sum = sum + z;

  //       }
  //       callback(null, {
  //         message:
  //           "Total credits for this slot " +
  //           result.creditValue +
  //           ". Total Slot Duration is " +
  //           c +
  //           " mins. Booked Slot Duration " +
  //           sum,
  //         credits: result.creditValue,
  //         "Total Slot Duration": c,
  //         "Booked Slot Duration ": sum
  //       })
  //     } else {
  //       callback("slots not found", null)
  //     }
  //   } else {
  //     callback("slotMaster Not Exists / Send a valid memberId", null)
  //   }
  // });
}

const getSlotsByLimitMemberId = (params, callback) => {
  let memberId = ObjectId(params.memberId);
  let createdAt = params.createdAt;
  let getNotificatonByTime = new Date();
  let limit = parseInt(params.limit);
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  SlotMaster.find({ memberId: memberId, createdAt: { $lt: new Date(getNotificatonByTime) } }, (err, slotsOfMember) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, slotsOfMember)
    }
  }).sort({ createdAt: -1 }).limit(limit);
}

module.exports = {
  editSlot: editSlot,
  updateSlotSchedule: updateSlotSchedule,
  updateScheduleStatus: updateScheduleStatus,
  getAllSlot: getAllSlot,
  getSlotDetailsById: getSlotDetailsById,
  deleteslotMasterById: deleteslotMasterById,
  getSlotByMemberId: getSlotByMemberId,
  getSlotsByLimitMemberId: getSlotsByLimitMemberId,
  deleteslotMasterById1: deleteslotMasterById1
}
