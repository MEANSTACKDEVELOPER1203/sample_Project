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
// let otpService = require('../otp/otpRouter');
const SlotMasterController = require("./slotMasterController");
var cron = require('node-cron');


//@app development
//@methos GET
//@access ALL

router.get("/currentTime", function (req, res) {
 currentTime = new Date();
 res.json({ success: 1, token: req.headers['x-access-token'], data: {currentTime:currentTime} });
});


//@app development
//@methos Post
//@access ALL
router.post("/createSchedule", function (req, res) {
  let memberId = req.body.memberId;
  let startTime = req.body.startTime;
  let endTime = req.body.endTime;
  let serviceType = req.body.serviceType;
  let breakDuration = req.body.breakDuration;
  let scheduleDuration = req.body.scheduleDuration;
  let scheduleId = req.body.scheduleId;
  let creditValue = req.body.creditValue;
  let createdBy = req.body.createdBy;
  let updatedBy = req.body.updatedBy;
  let isDeleted = req.body.isDeleted;
  let isScheduled = req.body.isScheduled;
  let slotStatus = req.body.slotStatus;
  let createdAt = req.body.createdAt;
  let updatedAt = req.body.updatedAt;
  //console.log("newresult",req.body)
  //console.log("p1===================== ",req.body);
  let date = new Date();
  //console.log("date",date);
  if(new Date(req.body.startTime) < date){
    res.json({ token: req.headers['x-access-token'], success: 0, message: "Please choose the correct date and time."});
  }else{
    slotMaster.aggregate(
      [
        {
          $match: {
            $and: [
              { memberId: ObjectId(memberId) },
              //{ startTime: {$gte: new Date(startTime), $lte: new Date(endTime) } },
              //{ endTime: { $gte: new Date(startTime), $lte: new Date(endTime)} },
               //{ endTime: { $gte: new Date(startTime) } },
               {isDeleted:false},
              { "slotArray.slotEndTime": { $gte: new Date(startTime), $lte: new Date(endTime) } },
            ]
          }
        }
      ],
      (err, result) =>{
        //console.log("result",result)
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
              var mm = today.getMonth() ; //January is 0!
              var yyyy = today.getFullYear();
  
              if (dd < 10) {
                dd = "0" + dd;
              }
  
              if (mm < 10) {
                mm = "0" + mm;
              }
  
              today = mm + "/" + dd + "/" + yyyy;
              let schedule = {};
              //schedule.sTime = new Date(time1);
              schedule.sTime = new Date(
                time1.setMinutes(time1.getMinutes() ) 
              );
  
              schedule.eTime = new Date(
                time1.setMinutes(time1.getMinutes() + scheduleDuration) 
              );
              schedule.breakDuration = new Date(
                time1.setMinutes(time1.getMinutes() + breakDuration) 
              );
              
              arr.push(schedule);
              //console.log("schedule",schedule)
            }
  
            return arr;
          };
          //end make list
  
          startTime = new Date(req.body.startTime);
          endTime = new Date(req.body.endTime);
          //console.log("startTime",startTime)
          //startTime = startTime.toTimeString().split(' ')[0].split(':');
          //console.log("p1",t1.toTimeString().split(' ')[0].split(':'))
          //console.log("p2",t1[0]+':'+t1[1]);
          var intervals = getTimeIntervals(startTime, endTime);
          //console.log("intervals",intervals)
  
          let slotArray = [];
          let newSch;
          // start of Split the StartTime to EndTime into Multiple start
          for (let i = 0; i < intervals.length; i++) {
            let newSch = {};
  
            let id = new ObjectId();
            let slotStartTime = intervals[i].sTime;
            let slotEndTime = intervals[i].eTime;
  
            newSch.id = id;
            newSch.memberId = memberId;
            newSch.serviceType = serviceType;
            newSch.slotStartTime = slotStartTime;
            newSch.slotEndTime = slotEndTime;
            newSch.slotDuration = scheduleDuration;
            newSch.creditValue = creditValue;
            newSch.slotStatus = "unreserved";
  
            slotArray[i] = newSch;
            //console.log("newSch",newSch)
          }
          //console.log("scheduleArray",slotArray);
  
          // End of Split the StartTime to EndTime into Multiple
  
          let slotMasterRecord = new slotMaster({
            memberId: memberId,
            serviceType: serviceType,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            breakDuration: breakDuration,
            scheduleDuration: scheduleDuration,
            scheduleId: scheduleId,
            creditValue: creditValue,
            isDeleted: isDeleted,
            isScheduled: isScheduled,
            slotStatus: slotStatus,
            scheduleNotificationStatus:"create",
            serviceType: serviceType,
            slotArray: slotArray,
            createdBy: createdBy,
            updatedBy: updatedBy,
            createdAt: createdAt,
            updatedAt: updatedAt
          });
          //console.log("AAAAAAAAAA", slotMasterRecord)
          slotMaster.slotMaster(slotMasterRecord, function (err, slot) {
            if (err) {
              res.send(err);
            } else {
            //console.log("Slot created successfuly...............")
            return res.json({ success: 1, token: req.headers['x-access-token'], data: slot });
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
  }

});
// Get All  for a Member by Day start

// router.post("/getDaySlotsByServiceMemberId", function (req, res) {
//   let memberId = req.body.memberId;
//   let serviceType = req.body.serviceType;
//   let startTime = req.body.startTime;

//   //console.log(req.body);
//   newTime = new Date(startTime);
//   let query = {
//     $and: [
//       { memberId: memberId },
//       {
//         startTime: {
//           $gte: new Date().getUTCMinutes(),
//           $lt: new Date(startTime + " 23:59:00")
//         }
//       }
//     ]
//   };
//   slotMaster.aggregate(
//     [
//       {
//         $match: {
//           $and: [
//             { memberId: ObjectId(memberId) },
//             {
//               startTime: {
//                 $gte: new Date(startTime),
//                 $lt: new Date(startTime + " 23:59:00")
//               }
//             }
//           ]
//         }
//       }
//     ],
//     function (err, result) {
//       if (err) {
//         res.send(err);
//       }
//       //console.log(result);
//       if (result.length > 0) {

//         let newArr = [];
//         for (let i = 0; i < result.length; i++) {
//           myArr = result[i].scheduleArray;
//           myArr = myArr.filter(function (obj) {
//             return obj.scheduleStatus == "unreserved";
//           });
//           newArr.push(myArr);
//         }
//         res.send(newArr);

//       } else {
//         res.send(result);
//       }
//     }
//   );
// });
// End Get All Schedules for a Member by Day


//@getSlotsByServiceMemberId
//@methos Get
//@access All
// Get All Schedules for a Member start

router.post("/getSlotsByServiceMemberId", function (req, res) {
  let memberId = req.body.memberId;
  //let currentDate = new Date();
  let limit = parseInt(req.body.limit);
  
   let query;
  if (req.body.createdAt == "null" || req.body.createdAt == null) {
      query = {memberId: ObjectId(memberId),isDeleted : false}
  } else if(req.body.createdAt != null &&req.body.createdAt != "null") {
      query = {memberId: ObjectId(memberId),isDeleted : false,startTime: { $lt:  new Date(req.body.createdAt)}}
  }
  slotMaster.aggregate(
    [
      {
        $match:  query
      },
      { $sort: { startTime: -1 } },
      //{ $skip:parseInt(startFrom)},
      { $limit:limit},
    ],
    function (err, slotresult) {
     //console.log("slotresult",slotresult)

      let query1 = {
        $and: [
          { endTime: { $lt: new Date() } },
          //{$or: [{ startTime: { $gte: new Date() } }]},
          { memberId: ObjectId(memberId) }
        ]

      }
      //var query = { startTime: { $lt: new Date() } };
      var newvalues = { $set: { scheduleStatus: "expired"} };
      //console.log(result);
      slotMaster.updateMany(query1, newvalues, function (err, sresult) {
        if (err) {
          console.log("1",err);
        } else {
          //console.log("2", sresult);
          if (err) {

            res.send(err);
          }
          if (sresult.length > 0) {
            //console.log("H1", result);
            //slots////
            let newArr = [];
            //console.log("result1",result1)
            for (let i = 0; i < slotresult.length; i++) {
              //console.log("test",result1[i].scheduleStartTime)
              for(let j=0;j<slotresult[i].slotArray.length;j++){
                //console.log("test",slotresult[i].slotArray[j].slotStartTime)
                if(slotresult[i].slotArray[j].slotStartTime < new Date()){
                  // console.log("pa1",new Date())
                  // console.log("result1[i].slotArray[j].slotStartTime",slotresult[i].slotArray[j]._id);
                  let schID = slotresult[i].slotArray[j]._id;
                  slotMaster.findOneAndUpdate(
                    { "slotArray._id": schID },
                    {
                      $set: {
                        "slotArray.$.slotStatus": "expired"
                      }
                    },
                    { upsert: true }, (err, newresult) => {
                      if (err) {
                       
                      } else {
                      
                      }
                    });
                
                }
              }
              let myArr = {};
              myArr._id = slotresult[i]._id;
              myArr.scheduleDuration = parseInt(slotresult[i].scheduleDuration);
              myArr.startTime = slotresult[i].scheduleStartTime;
              myArr.endTime = slotresult[i].scheduleEndTime;
              myArr.memberId = slotresult[i].memberId;
              myArr.serviceType = slotresult[i].serviceType;
              myArr._id = slotresult[i]._id;
              myArr.scheduleStatus = slotresult[i].scheduleStatus;
              myArr.creditValue = slotresult[i].creditValue;
              
              newArr.push(myArr);
            }
            //res.send(newArr);
            let count = newArr.length;
            //console.log("newArr", newArr);
            res.json({ token: req.headers['x-access-token'], success: 1, data: slotresult, count: count });

          } else {
            //console.log("V",slotresult.length)
            if(slotresult.length == 0 ){
              res.json({ token: req.headers['x-access-token'], success: 1, data:slotresult  });
            }else if(slotresult.length > 0 ) {
              //console.log("result", slotresult);
            let newArr = [];
           
            for (let i = 0; i < slotresult.length; i++) {
              //console.log("slotresult[i].slotArray",slotresult[i].slotArray)
              for(let j=0;j<slotresult[i].slotArray.length;j++){
                //console.log("test1",slotresult[i].slotArray[j].slotStartTime)
                //console.log("date",slotStartTime)
                if(slotresult[i].slotArray[j].slotStartTime < new Date()){
                  //console.log("pa1",new Date())
                  //console.log("result1[i].slotArray[j].slotStartTime",slotresult[i].slotArray[j]._id);
                  let schID = slotresult[i].slotArray[j]._id;
                  slotMaster.findOneAndUpdate(
                    { "slotArray._id": schID },
                    {
                      $set: {
                        "slotArray.$.slotStatus": "expired"
                      }
                    },
                    { upsert: true }, (err, newresult) => {
                      if (err) {
                       
                      } else {
                      
                      }
                    });
                }
              }
              let myArr = {};
              myArr._id = slotresult[i]._id;
              myArr.scheduleDurarion = slotresult[i].scheduleDurarion;
              myArr.startTime = slotresult[i].scheduleStartTime;
              myArr.endTime = slotresult[i].scheduleEndTime;
              myArr.memberId = slotresult[i].memberId;
              myArr.serviceType = slotresult[i].serviceType;
              myArr._id = slotresult[i]._id;
              myArr.slotStatus = slotresult[i].slotStatus;
              myArr.creditValue = slotresult[i].creditValue;
              newArr.push(myArr);
            }
            //res.send(newArr);
            let count = newArr.length;
            //console.log("newArr", newArr);
            //let count = result.length;
            res.json({ token: req.headers['x-access-token'], success: 1, data: slotresult, count: count });
            //res.send(result);
            }
            
          }
          //res.json({ message: "slotMaster Updated Successfully" });
        }
      });


    }
  );
});


// router.put("/editSlotMaster/:id", SlotMasterController.editSlot);

// router.put("/updateSlotSchedule/:schID", SlotMasterController.updateSlotSchedule);

// router.put("/updateScheduleStatus/:schID", SlotMasterController.updateScheduleStatus);

// router.get("/getSlotsByMemberId/:memberId", SlotMasterController.getSlotByMemberId);

// router.get("/getSlotsByLimitMemberId/:memberId/:createdAt/:limit", SlotMasterController.getSlotsByLimitMemberId);

router.get("/getScheduleInfo/:scheduleId/:memberId/:celebId", SlotMasterController.getSlotDetailsById);

// router.get("/getAll", SlotMasterController.getAllSlots);

router.delete("/deleteslotMasterById/:id", SlotMasterController.deleteslotMasterById);
router.post("/deleteSchedules", SlotMasterController.deleteslotMasterById1);

// var slotExpired = cron.schedule('*/2 * * * * *', function () {

//   let query1 = {
//     $and: [
//       { endTime: { $lt: new Date() } },
//       //{$or: [{ startTime: { $gte: new Date() } }]},
//       //{ memberId: ObjectId(memberId) }
//     ]

//   }
//   //var query = { startTime: { $lt: new Date() } };
//   var newvalues = { $set: { scheduleStatus: "expired"} };
//   //console.log(result);
//   slotMaster.updateMany(query1, newvalues, function (err, sresult) {
//     if (err) {
//       console.log("1",err);
//     } else {
//       //console.log("2", sresult);
//       if (err) {

//         res.send(err);
//       }
//       let newArr = [];
//         //console.log("result1",result1)
//         for (let i = 0; i < sresult.length; i++) {
//           //console.log("test",result1[i].scheduleStartTime)
//           for(let j=0;j<sresult[i].slotArray.length;j++){
//             //console.log("test",slotresult[i].slotArray[j].slotStartTime)
//             if(sresult[i].slotArray[j].slotStartTime < new Date()){
//               // console.log("pa1",new Date())
//               // console.log("result1[i].slotArray[j].slotStartTime",slotresult[i].slotArray[j]._id);
//               let schID = sresult[i].slotArray[j]._id;
//               slotMaster.findOneAndUpdate(
//                 { "slotArray._id": schID },
//                 {
//                   $set: {
//                     "slotArray.$.slotStatus": "expired"
//                   }
//                 },
//                 { upsert: true }, (err, newresult) => {
//                   if (err) {
                   
//                   } else {
//                   //console.log("newresult",newresult)
//                   }
//                 });
            
//             }
//           }
//           let myArr = {};
//           myArr._id = slotresult[i]._id;
//           myArr.scheduleDuration = parseInt(sresult[i].scheduleDuration);
//           myArr.startTime = sresult[i].scheduleStartTime;
//           myArr.endTime = sresult[i].scheduleEndTime;
//           myArr.memberId = sresult[i].memberId;
//           myArr.serviceType = sresult[i].serviceType;
//           myArr._id = sresult[i]._id;
//           myArr.scheduleStatus = sresult[i].scheduleStatus;
//           myArr.creditValue = sresult[i].creditValue;
          
//           newArr.push(myArr);
//         }
//         //res.send(newArr);
//         let count = newArr.length;
        
//     }
//   });

// }, false);

// slotExpired.start();

module.exports = router;
