let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let slotMaster = require("./slotMasterModel");
let logins = require("../loginInfo/loginInfoModel");
let notificationSetting = require("../notificationSettings/notificationSettingsModel");
const CelebManagerService = require("../CelebManager/celebManagerService");
let Notification = require("../notification/notificationModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
let MemberPreferences = require("../memberpreferences/memberpreferencesModel");
let User = require("../users/userModel");
let otpService = require('../otp/otpRouter');
const SlotMasterController = require("./slotMasterController");


router.post("/create", function (req, res) {
  let memberId = req.body.memberId;
  let startTime = req.body.startTime;
  let endTime = req.body.endTime;
  let serviceType = req.body.serviceType;
  let breakDuration = req.body.breakDuration;
  let scheduleDurarion = req.body.scheduleDurarion;
  let scheduleId = req.body.scheduleId;
  let creditValue = req.body.creditValue;
  let createdBy = req.body.createdBy;
  let updatedBy = req.body.updatedBy;
  let isDeleted = req.body.isDeleted;
  let isScheduled = req.body.isScheduled;
  let slotStatus = req.body.slotStatus;
  let createdAt = req.body.createdAt;
  let updatedAt = req.body.updatedAt;
  // console.log("p1===================== ",req.body);

  slotMaster.aggregate(
    [
      {
        $match: {
          $and: [
            { memberId: ObjectId(memberId) },
            //{ startTime: { $gte: new Date(startTime), $lt: new Date(endTime) } },
            //{ endTime: { $gte: new Date(startTime), $lt: new Date(endTime) } },
            { "scheduleArray.scheduleStartTime": { $gte: new Date(startTime), $lt: new Date(endTime) } },
            { "scheduleArray.scheduleEndTime": { $gte: new Date(startTime), $lt: new Date(endTime) } },
          ]
        }
      }
    ],
    function (err, result) {
      if (err) {
        res.send(err);
      }
      if (result.length == 0) {
        //Parse In start
        var parseIn = function (date_time) {
          var d = new Date();
          d.setHours(date_time.substring(11, 13));
          d.setMinutes(date_time.substring(14, 16));
          return d;
        };
        //End Parse In
        //make list start
        var getTimeIntervals = function (time1, time2) {
          var arr = [];
          while (time1 < time2) {
            var today = time1;
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();

            if (dd < 10) {
              dd = "0" + dd;
            }

            if (mm < 10) {
              mm = "0" + mm;
            }

            today = mm + "/" + dd + "/" + yyyy;
            let schedule = {};
            schedule.sTime = new Date(time1);

            schedule.eTime = new Date(
              time1.setMinutes(time1.getMinutes() + scheduleDurarion)
            );

            arr.push(schedule);

          }

          return arr;
        };
        //end make list

        startTime = new Date(req.body.startTime);
        endTime = new Date(req.body.endTime);
        //startTime = startTime.toTimeString().split(' ')[0].split(':');
        //console.log("p1",t1.toTimeString().split(' ')[0].split(':'))
        //console.log("p2",t1[0]+':'+t1[1]);
        var intervals = getTimeIntervals(startTime, endTime);


        let scheduleArray = [];
        let newSch;
        // start of Split the StartTime to EndTime into Multiple start
        for (let i = 0; i < intervals.length; i++) {
          let newSch = {};

          let id = new ObjectId();
          let scheduleStartTime = intervals[i].sTime;
          let scheduleEndTime = intervals[i].eTime;

          newSch.id = id;
          newSch.memberId = memberId;
          newSch.serviceType = serviceType;
          newSch.scheduleStartTime = scheduleStartTime;
          newSch.scheduleEndTime = scheduleEndTime;
          newSch.scheduleDurarion = scheduleDurarion;
          newSch.creditValue = creditValue;
          newSch.scheduleStatus = "unreserved";

          scheduleArray[i] = newSch;
        }

        // End of Split the StartTime to EndTime into Multiple

        let slotMasterRecord = new slotMaster({
          memberId: memberId,
          serviceType: serviceType,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          breakDuration: breakDuration,
          scheduleDurarion: scheduleDurarion,
          scheduleId: scheduleId,
          creditValue: creditValue,
          isDeleted: isDeleted,
          isScheduled: isScheduled,
          slotStatus: slotStatus,
          serviceType: serviceType,
          scheduleArray: scheduleArray,
          createdBy: createdBy,
          updatedBy: updatedBy,
          createdAt: createdAt,
          updatedAt: updatedAt
        });
        // console.log("AAAAAAAAAA", slotMasterRecord)
        slotMaster.slotMaster(slotMasterRecord, function (err, slot) {
          if (err) {
            res.send(err);
          } else {
            // console.log("Slot created successfuly...............")
            MemberPreferences.aggregate(
              [
                // { $match: { "celebrities.CelebrityId": { $in: [ObjectId(id)] } } },
                // { $unwind: "$celebrities" },
                {
                  $match: {celebrities: { $elemMatch: { CelebrityId: ObjectId(memberId) } } }
                },
                {
                  $limit: 20
                },
                {
                  $lookup: {
                    from: "logins",
                    localField: "memberId",
                    foreignField: "memberId",
                    as: "memberLoginInfo"
                  }
                },
                {
                  $unwind: "$memberLoginInfo"
                },
                {
                  $match: { $and: [{ "memberLoginInfo.deviceToken": { $ne: null } }, { "memberLoginInfo.deviceToken": { $ne: "" } }] }
                },
                {
                  $project: {
                    memberLoginInfo: {
                      memberId: 1,
                      deviceToken: 1,
                      osType: 1
                    }
                  }
                }
              ]
              , (err, data) => {
                // console.log("Data ========= ", data.length)
                if (err) {
                  return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                }
                if (data.length > 0) {
                  // console.log("slot fan f0llow",data.length);
                  User.findById(memberId, (err, SMresult) => {
                    ///users.forEach(user =>
                    let t1 = new Date(req.body.startTime);
                    let t2 = new Date(req.body.endTime);
                    for (let index = 0; index < data.length; index++) {
                      let user = {};
                      user = data[index];
                      //console.log(user.memberLoginInfo.memberId);
                      let dToken = user.memberLoginInfo.deviceToken;
                      let osType = user.memberLoginInfo.osType;

                      //console.log(user.memberLoginInfo.osType);
                      let newNotification = new Notification({
                        memberId: user.memberLoginInfo.memberId,
                        notificationFrom: SMresult._id,
                        activity: "SCHEDULE",
                        title: "Schedule Alert!!",
                        body: SMresult.firstName + " scheduled on Date : " + t1.toLocaleDateString("en-US") + " Time : " + t1.getUTCHours() + ":" + t1.getUTCMinutes() + ":" + t1.getUTCSeconds() + " To " + t2.getUTCHours() + ":" + t2.getUTCMinutes() + ":" + t2.getUTCSeconds() + " (GMT)",
                        startTime: t1,
                        endTime: t2,
                        notificationType: "Call"
                      });
                      //Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          // res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else {
                          //res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
                          let query = {
                            $and: [{
                              memberId: user.memberLoginInfo.memberId
                            }, {
                              notificationSettingId: ObjectId("5cac6893839a52126c21f2f7")
                            }]
                          };
                          notificationSetting.find(query, function (err, rest) {
                            if (err) return res.send(err);
                            //console.log("t1", rest);
                            if (rest.length <= 0 || rest[0].isEnabled == true) {
                              if (osType == "Android") {
                                //console.log("************* AAAAAAAAAAAAa ********************")
                                let data = {
                                  serviceType: "SCHEDULE", title: 'Alert!!',
                                  body: SMresult.firstName + " scheduled on Date : " + t1.toLocaleDateString("en-US") + " Time : " + t1.getUTCHours() + ":" + t1.getUTCMinutes() + ":" + t1.getUTCSeconds() + " To " + t2.getUTCHours() + ":" + t2.getUTCMinutes() + ":" + t2.getUTCSeconds() + " (GMT)",
                                  startTime: t1,
                                  endTime: t2,
                                  memberId: memberId
                                }
                                otpService.sendAndriodPushNotification(dToken, "Feed Alert!!", data, (err, successNotificationObj) => {
                                  if (err)
                                    console.log(err)
                                  else {
                                    console.log(successNotificationObj)
                                  }
                                });
                              } else if (osType == "IOS") {
                                //console.log("************* BBBBBBBBBBBBB ********************")
                                let notification = {
                                  title: 'Schedule Alert!!',
                                  serviceType: "SCHEDULE",
                                  body: SMresult.firstName + " scheduled on Date : " + t1.toLocaleDateString("en-US") + " Time : " + t1.getUTCHours() + ":" + t1.getUTCMinutes() + ":" + t1.getUTCSeconds() + " To " + t2.getUTCHours() + ":" + t2.getUTCMinutes() + ":" + t2.getUTCSeconds() + " (GMT)",
                                  startTime: t1,
                                  endTime: t2,
                                  memberId: memberId
                                }
                                otpService.sendIOSPushNotification(dToken, notification, (err, successNotificationObj) => {
                                  if (err)
                                    console.log(err)
                                  else {
                                    console.log(successNotificationObj)
                                  }
                                });
                              }
                            }
                          });
                        }
                      });
                    };
                    let message = {
                      collapse_key: 'Feed Alert!!',
                      serviceType: "Feed",
                      data: {
                        serviceType: "Schedule", title: 'Alert!!',
                        body: SMresult.firstName + " scheduled on Date : " + t1.toLocaleDateString("en-US") + " Time : " + t1.getUTCHours() + ":" + t1.getUTCMinutes() + ":" + t1.getUTCSeconds() + " To " + t2.getUTCHours() + ":" + t2.getUTCMinutes() + ":" + t2.getUTCSeconds() + " (GMT)",
                        startTime: t1,
                        endTime: t2
                      },
                      notification: {
                        memberId: SMresult._id,
                        notificationFrom: SMresult._id,
                        activity: "Call",
                        title: "Schedule Alert!!",
                        body: SMresult.firstName + " scheduled on ",
                        startTime: t1,
                        endTime: t2,
                        notificationType: "Call"
                      }
                    };
                    CelebManagerService.sendNotificationToAllSwitchedManager(memberId, message, (err, data) => {
                      if (err) {
                        console.log(err)
                      } else {
                        console.log(data)
                        // return res.json({ success: 1, token: req.headers['x-access-token'], slot: slot });
                      }
                    })
                  });
                  return res.json({ success: 1, token: req.headers['x-access-token'], slot: slot });

                  //   User.findById(memberId, function (err, SMresult) {
                  //   for (let i = 0; i < data.length; i++) {
                  //     for (let j = 0; j < data[i].loginData.length; j++) {
                  //       let dToken = data[i].loginData[0].deviceToken;
                  //       let t1 = user.startTime;
                  //       let t2 = user.endTime;
                  //       let newNotification = new Notification({
                  //         memberId: data[i].memberProfile[0]._id,
                  //         notificationFrom:SMresult._id,
                  //         activity: "Call",
                  //         title: "Schedule Alert!!",
                  //         body: "Greetings from CelebKonect! " +SMresult.firstName+" scheduled on ",
                  //         startTime:t1,
                  //         endTime:t2,
                  //         notificationType: "Call"
                  //       });
                  //       Notification.createNotification(newNotification, function (err, credits) {
                  //         if (err) {
                  //         } else {
                  //           let query = {
                  //             $and: [{
                  //               memberId: data[i].memberProfile[0]._id
                  //             }, {
                  //               notificationSettingId: "5c9b3ddb7aefd6165408e782"
                  //             }, {
                  //               isEnabled: false
                  //             }]
                  //           };
                  //           notificationSetting.find(query, function (err, rest) {
                  //             if (err) return res.send(err);
                  //             if (rest == "" || rest.isEnabled == true) {

                  //               var message = {
                  //                 to: dToken,
                  //                 collapse_key: 'Schedule Alert!!',
                  //                 data: {
                  //                   serviceType: "Schedule", title: 'Alert!!',
                  //                   body: "Greetings from CelebKonect! " +SMresult.firstName+" scheduled on Date : " +t1.toLocaleDateString("en-US")+" Time : "+t1.getUTCHours()+ ":"+t1.getUTCMinutes()+":"+t1.getUTCSeconds()+" To " +t2.getUTCHours()+ ":"+t2.getUTCMinutes()+":"+t2.getUTCSeconds()+" (GMT)",
                  //                   startTime:t1,
                  //                   endTime:t2
                  //                 },
                  //                 notification: {
                  //                   title: 'Schedule Alert!!',
                  //                   body: "Greetings from CelebKonect! " +SMresult.firstName+" scheduled on Date : " +t1.toLocaleDateString("en-US")+" Time : "+t1.getUTCHours()+ ":"+t1.getUTCMinutes()+":"+t1.getUTCSeconds()+" To " +t2.getUTCHours()+ ":"+t2.getUTCMinutes()+":"+t2.getUTCSeconds()+" (GMT)",
                  //                   startTime:t1,
                  //                   endTime:t2
                  //                 }

                  //               };
                  //               fcm.send(message, function (err, response) {
                  //                 if (err) {
                  //                   console.log(err)
                  //                 } else {
                  //                   console.log("Successfully sent with resposne :", response);
                  //                 }
                  //               });
                  //             }
                  //           });
                  //         }
                  //       });
                  //     }
                  //   }
                  //   let message = {
                  //       collapse_key: "Schedule Alert!!",
                  //       serviceType: "Call",
                  //       data: {
                  //         serviceType: "Schedule", title: 'Alert!!',
                  //         body: "Greetings from CelebKonect! " +SMresult.firstName+" scheduled on Date : " +t1.toLocaleDateString("en-US")+" Time : "+t1.getUTCHours()+ ":"+t1.getUTCMinutes()+":"+t1.getUTCSeconds()+" To " +t2.getUTCHours()+ ":"+t2.getUTCMinutes()+":"+t2.getUTCSeconds()+" (GMT)",
                  //         startTime:t1,
                  //         endTime:t2
                  //       },
                  //       notification:{
                  //           title: 'Schedule Alert!!',
                  //           body: "Greetings from CelebKonect! " +SMresult.firstName+" scheduled on Date : " +t1.toLocaleDateString("en-US")+" Time : "+t1.getUTCHours()+ ":"+t1.getUTCMinutes()+":"+t1.getUTCSeconds()+" To " +t2.getUTCHours()+ ":"+t2.getUTCMinutes()+":"+t2.getUTCSeconds()+" (GMT)",
                  //           startTime:t1,
                  //           endTime:t2,
                  //           memberId:SMresult._id,
                  //           activity: "Call",
                  //           notificationFrom:SMresult._id,
                  //           notificationType: "Call"
                  //       }
                  //   };
                  //   CelebManagerService.sendNotificationToAllSwitchedManager(memberId,message,(err,data)=>{
                  //     if(err){
                  //       console.log(err)
                  //     }else{
                  //       console.log(data)
                  //     }
                  //   })
                  // });
                } else {
                  return res.json({ success: 1, token: req.headers['x-access-token'], slot: slot });
                }
              }
            );
          }
        });
      }
      //checking the duplicate values start
      if (result.length > 0) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "Schedules exits in the given time line", data: result });
      }
      //End checking the duplicate values
    }
  );
});
// Get All  for a Member by Day start

router.post("/getDaySlotsByServiceMemberId", function (req, res) {
  let memberId = req.body.memberId;
  let serviceType = req.body.serviceType;
  let startTime = req.body.startTime;

  //console.log(req.body);
  newTime = new Date(startTime);
  let query = {
    $and: [
      { memberId: memberId },
      {
        startTime: {
          $gte: new Date().getUTCMinutes(),
          $lt: new Date(startTime + " 23:59:00")
        }
      }
    ]
  };
  slotMaster.aggregate(
    [
      {
        $match: {
          $and: [
            { memberId: ObjectId(memberId) },
            {
              startTime: {
                $gte: new Date(startTime),
                $lt: new Date(startTime + " 23:59:00")
              }
            }
          ]
        }
      }
    ],
    function (err, result) {
      if (err) {
        res.send(err);
      }
      //console.log(result);
      if (result.length > 0) {

        let newArr = [];
        for (let i = 0; i < result.length; i++) {
          myArr = result[i].scheduleArray;
          myArr = myArr.filter(function (obj) {
            return obj.scheduleStatus == "unreserved";
          });
          newArr.push(myArr);
        }
        res.send(newArr);

      } else {
        res.send(result);
      }
    }
  );
});
// End Get All Schedules for a Member by Day

// Get All Schedules for a Member start

router.post("/getSlotsByServiceMemberId", function (req, res) {
  let memberId = req.body.memberId;
  console.log(new Date());
  slotMaster.aggregate(
    [
      {
        $match: {
          $and: [
            { memberId: ObjectId(memberId) }
          ]
        },

      },
      { $sort: { startTime: -1 } }
    ],
    function (err, result) {

      // let query = {
      //   $or: [{ startTime: { $gte: new Date() } }, { endTime: { $lt: new Date() } }]
      // };
      // let query = {
      //   $and : [
      //     { endTime: { $lt: new Date()}},
      //     {memberId: ObjectId(memberId)  }
      // ]

      // }
      // let query = {
      //   $and : [
      //    //{$or: [{ startTime: { $lte: new Date() } },{ endTime: { $lt: new Date() } }]},
      //     {$or: [{ startTime: { $lt: new Date() } },{ endTime: { $gt: new Date() } }]},
      //     {memberId: ObjectId(memberId)  }
      // ]

      // }
      let query = {
        $and: [
          { endTime: { $lt: new Date() } },
          //{$or: [{ startTime: { $gte: new Date() } }]},
          { memberId: ObjectId(memberId) }
        ]

      }
      //var query = { startTime: { $lt: new Date() } };
      var newvalues = { $set: { slotStatus: "expired" } };
      console.log(result);
      slotMaster.updateMany(query, newvalues, function (err, sresult) {
        if (err) {
          console.log("1");
          // res.json({
          //   error: "User Not Exists / Send a valid UserID"
          // });
        } else {
          console.log("2", sresult);
          if (err) {

            res.send(err);
          }
          if (result.length > 0) {
            //console.log("H1", result);
            //slots////
            let newArr = [];
            for (let i = 0; i < result.length; i++) {
              let myArr = {};
              myArr._id = result[i]._id;
              myArr.scheduleDurarion = parseInt(result[i].scheduleDurarion);
              myArr.startTime = result[i].startTime;
              myArr.endTime = result[i].endTime;
              myArr.memberId = result[i].memberId;
              myArr.serviceType = result[i].serviceType;
              myArr._id = result[i]._id;
              myArr.slotStatus = result[i].slotStatus;
              myArr.creditValue = result[i].creditValue;
              newArr.push(myArr);
            }
            //res.send(newArr);
            let count = newArr.length;
            console.log("newArr", newArr);
            res.json({ token: req.headers['x-access-token'], success: 1, data: newArr, count: count });

          } else {
            console.log("result", result);
            let newArr = [];
            for (let i = 0; i < result.length; i++) {
              let myArr = {};
              myArr._id = result[i]._id;
              myArr.scheduleDurarion = result[i].scheduleDurarion;
              myArr.startTime = result[i].startTime;
              myArr.endTime = result[i].endTime;
              myArr.memberId = result[i].memberId;
              myArr.serviceType = result[i].serviceType;
              myArr._id = result[i]._id;
              myArr.slotStatus = result[i].slotStatus;
              myArr.creditValue = result[i].creditValue;
              newArr.push(myArr);
            }
            //res.send(newArr);
            let count = newArr.length;
            console.log("newArr", newArr);
            //let count = result.length;
            res.json({ token: req.headers['x-access-token'], success: 1, data: newArr, count: count });
            //res.send(result);
          }
          //res.json({ message: "slotMaster Updated Successfully" });
        }
      });


    }
  );
});


router.put("/editSlotMaster/:id", SlotMasterController.editSlot);

router.put("/updateSlotSchedule/:schID", SlotMasterController.updateSlotSchedule);

router.put("/updateScheduleStatus/:schID", SlotMasterController.updateScheduleStatus);

router.get("/getSlotsByMemberId/:memberId", SlotMasterController.getSlotByMemberId);

router.get("/getSlotsByLimitMemberId/:memberId/:createdAt/:limit", SlotMasterController.getSlotsByLimitMemberId);

router.get("/getSlotInfo/:slotId", SlotMasterController.getSlotDetailsById);

router.get("/getAll", SlotMasterController.getAllSlots);

router.delete("/deleteslotMasterById/:id", SlotMasterController.deleteslotMasterById);

module.exports = router;
