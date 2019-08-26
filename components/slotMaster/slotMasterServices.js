const ObjectId = require("mongodb").ObjectID;
const SlotMaster = require("./slotMasterModel");
const Logins = require("../loginInfo/loginInfoModel");
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

const getSlotByMemberId = (memberId, callback) => {
  SlotMaster.find({ memberId: ObjectId(memberId) }, (err, slotsOfMember) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, slotsOfMember)
    }
  }).sort({ createdAt: -1 });
}


const getSlotDetailsById = (slotId, callback) => {
  SlotMaster.findById(slotId, (err, result) => {
    if (result) {
      let a = result.startTime;
      let b = result.endTime;
      c = (b - a) / (1000 * 60);
      let sum = 0;
      if (result.scheduleArray.length > 0) {
        for (let i = 0; i < result.scheduleArray.length; i++) {
          let x = result.scheduleArray[i].scheduleEndTime;
          let y = result.scheduleArray[i].scheduleStartTime;
          let z = (x - y) / (1000 * 60);

          sum = sum + z;

        }
        callback(null, {
          message:
            "Total credits for this slot " +
            result.creditValue +
            ". Total Slot Duration is " +
            c +
            " mins. Booked Slot Duration " +
            sum,
          credits: result.creditValue,
          "Total Slot Duration": c,
          "Booked Slot Duration ": sum
        })
      } else {
        callback("slots not found", null)
      }
    } else {
      callback("slotMaster Not Exists / Send a valid memberId", null)
    }
  });
}

const getSlotsByLimitMemberId =  (params,callback)=> {
    let memberId = ObjectId(params.memberId);
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    let limit = parseInt(params.limit);
    if(createdAt!="null" && createdAt!="0"){
      getNotificatonByTime = createdAt
    }
    SlotMaster.find({ memberId: memberId,createdAt: { $lt: new Date(getNotificatonByTime) } }, (err, slotsOfMember) => {
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
  deleteslotMasterById: deleteslotMasterById,
  getSlotByMemberId: getSlotByMemberId,
  getSlotsByLimitMemberId: getSlotsByLimitMemberId
}
