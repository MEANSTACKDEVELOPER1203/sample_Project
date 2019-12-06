let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectId;
let serviceTransaction = require("./serviceTransactionModel");
const ServiceTransactionController = require("./serviceTransactionController")
const ck_call_messages = require('../../ck_Call_Messages/ck_call_messages');
let User = require("../users/userModel");
let UserSender = require("../users/userModel");
let logins = require("../loginInfo/loginInfoModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
var cron = require('node-cron');
let serviceSchedule = require("../serviceSchedule/serviceScheduleModel");
var apn = require('apn');
let Notification = require("../notification/notificationModel");
let Credits = require("../credits/creditsModel");
let creditServices = require('../credits/creditServices');
let celebrityContract = require("../celebrityContract/celebrityContractsModel");
let celebrityContractsService = require('../celebrityContract/celebrityContractsService');
let Chat = require("../../models/chat");
let payCredits = require("../payCredits/payCreditsModel");
let slotMaster = require("../slotMaster/slotMasterModel");
let MemberPreferences = require("../memberpreferences/memberpreferencesModel");
let feedbackModel = require("../feedback/feedbackModel");
let otpService = require('../otp/otpRouter');
let liveTimeLog = require('../liveTimeLog/liveTimeLogModel')
//let serviceSchedule = require("../models/serviceSchedule");
// Set up apn with the APNs Auth Key
var apnProvider = new apn.Provider({
  token: {
    key: 'AuthKey_47HAS9Y4S8.p8', // Path to the key p8 file
    keyId: '47HAS9Y4S8', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
    teamId: '3J79KQEY26', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
  },
  production: false // Set to true if sending a notification to a production iOS app
});

/**** USING P12 File***** */
// var apnProvider = new apn.Provider({
//   token: {
//     key: 'VoipCertificatesLatest.p12', // Path to the key p8 file
//     keyId: '3J79KQEY26', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
//     teamId: '3J79KQEY26',  // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
//   },
//   production: false // Set to true if sending a notification to a production iOS app
// });


// let notification = new apn.Notification();
// notification.expiry = Math.floor(Date.now() / 1000) + 24 * 3600; // will expire in 24 hours from now
// notification.badge = 2;
// notification.sound = "ping.aiff";
// notification.alert = "Hello from solarianprogrammer.com";
// notification.payload = { 'messageFrom': 'Solarian Programmer' };

// Replace this with your app bundle ID:
// notification.topic = "com.CelebKonect";

// apnProvider.send(notification, "eGPoDHVAgLA:APA91bGD_bPs-qO65WJ1ZPGGq9I_znli7gCtU0lGgjBchsiWPY3AP54gUb88Gf_EDJdd6rycBMdvLO_63hid8nqTeUUCVdJrCr0C8OeIKe7cb9EW1XkMbJt6BaHvxdsQgsmAdK1o3sO3").then(result => {
//   // Show the result of the send operation:
//   console.log(result.failed[0].response);
// });


var secondsToHms = function (d) {
  // if(d!= null)
  // {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  return { hours: (h > 0 ? h : 0), minutes: (m > 0 ? m : 0), seconds: (s > 0 ? s : 0) };
  // }else{
  //   return { hours: 0, minutes: 0, seconds: 0 };
  // }

}

//update celeb status afetr diconnected socket (using through socket)
router.post('/updateCelebStatus', (req, res) => {
  //console.log(req.body);
  let serviceStatus = "celebdisconnected"
  if (req.body.senderId != "undefined");
  serviceStatus = "memberDisconnected"
  // if(req.body.receiverId === "undefined"){
  //    return res.status(200).json({success:1, message:"Reciever iD " + req.body.receiverId});
  // }
  User.findByIdAndUpdate(ObjectId(req.body.receiverId), { $set: { callStatus: "false", isOnline: false } }, (err, userupdatedObj) => {
    if (err)
      console.log("************Error while Update celeb call status ****************", err)
    else {
      // console.log("userupdatedObj=============================", userupdatedObj);
      serviceTransaction.find({ receiverId: ObjectId(req.body.receiverId), serviceStatus: { $nin: ["scheduled", "celebritycalling", "celebdisconnected", "celebRejected"] } }, (err, lastCelebServTransObj) => {
        if (err)
          console.log("******** Error while fetching the last celeb transaction *************", err)
        else {
          //console.log("********************************  ====== ", lastCelebServTransObj.length)
          if (lastCelebServTransObj.length == 0 || lastCelebServTransObj.length <= 0) {
            return res.status(200).json({ message: "Celeb status updated success fully ", success: 1 })
          } else {
            serviceTransaction.findByIdAndUpdate(lastCelebServTransObj[0]._id, { $set: { "serviceStatus": serviceStatus } }, { new: true }, (err, celebTransactionUpdatedObj) => {
              if (err)
                console.log("****** Error while update celeb transaction service status ********", err)
              else {
                // if (userupdatedObj.liveStatus == 'online') {
                let liveTimeLogInfo = new liveTimeLog({
                  memberId: req.body.receiverId,
                  liveStatus: "offline",
                  createdAt: new Date()
                })
                liveTimeLog.create(liveTimeLogInfo, (err, liveTimeLogObj) => {
                  if (err)
                    console.log("****** Error while update celeb transaction service status ********", err)
                  else {
                    //console.log(celebTransactionUpdatedObj)
                    return res.status(200).json({ message: "Celeb status updated success fully ", success: 1 })
                  }
                })
                // } 
                // else {
                //   return res.status(200).json({ message: "Celeb status updated success fully ", success: 1 })
                // }
              }
            })
          }

        }
      }).sort({ createdAt: -1 }).limit(1)
    }
  })

});


// Create a Schedule Start //
router.post("/createServiceTransaction", function (req, res) {
  // console.log("***********************HI**********************************************")
  // console.log(req.body);
  // console.log("*************************HELLO********************************************")
  let serviceCode = req.body.serviceCode;
  let serviceType = req.body.serviceType;
  let senderId = req.body.senderId;
  let receiverId = req.body.receiverId;
  let scheduleId = req.body.scheduleId;
  //let startTime = req.body.startTime;
  let endTime = req.body.endTime;
  let actualStartTime = req.body.actualStartTime;
  let actualEndTime = req.body.actualEndTime;
  let serviceStatus = req.body.serviceStatus;
  let senderStatus = req.body.senderStatus;
  let r1status = req.body.r1status;
  let r2status = req.body.r2status;
  let r3status = req.body.r3status;
  let r15mstatus = req.body.r15mstatus;
  let r4hstatus = req.body.r4hstatus;
  let r1dstatus = req.body.r1dstatus;
  let callRemarks = req.body.callRemarks;
  let fcmnotification = req.body.fcmnotification;
  let fcmmembernotification = req.body.fcmmembernotification;
  let fcmcelebnotification = req.body.fcmcelebnotification;
  let created_at = req.body.created_at;
  let updated_at = req.body.updated_at;
  let NotficationTime = new Date();
  //VoIP Notification only for IOS 
  screenLockStatus = false;
  screenLockStatusForAndroid = false;
  // console.log(" Screen lock status 11111=========", screenLockStatus)
  // console.log("FFFFFF ==== ", req.body.ScreenLockStatus)
  if (req.body.ScreenLockStatus.length) {
    let data = req.body.ScreenLockStatus;
    // console.log("User Data with Screen lock status=========", data)
    let filteredRes = data.find(function (item) {
      if (item.userId === receiverId) {
        // console.log("User item with Screen lock status=========", item)
        return item;
      }
    });
    if (filteredRes) {
      if (filteredRes.osType == "android")
        screenLockStatusForAndroid = filteredRes.ScreenLockStatus
      else
        screenLockStatus = filteredRes.ScreenLockStatus
    }
  }
  // console.log(" Screen lock status 222222222 =========", screenLockStatus)

  let serviceTransactionRecord = new serviceTransaction({
    serviceCode: serviceCode,
    serviceType: serviceType,
    senderId: senderId,
    receiverId: receiverId,
    scheduleId: scheduleId,
    //startTime: startTime,
    endTime: endTime,
    actualStartTime: actualStartTime,
    actualEndTime: actualEndTime,
    serviceStatus: serviceStatus,
    r1status: r1status,
    r2status: r2status,
    r3status: r3status,
    r15mstatus: r15mstatus,
    r4hstatus: r4hstatus,
    r1dstatus: r1dstatus,
    callRemarks: callRemarks,
    fcmnotification: fcmnotification,
    fcmmembernotification: fcmmembernotification,
    fcmcelebnotification: fcmcelebnotification,
    created_at: created_at,
    updated_at: updated_at
  });

  // User.findOne({ _id: receiverId }, (err, nuResult) => {
  //   //console.log("nuResult", nuResult.isOnline);
  //   if ((nuResult.isOnline == null)&&(nuResult.isOnline == false) && ((nuResult.liveStatus == "offline"))) {
  //     res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity is offline" });
  //   } else {
  //feedbackModel.find()
  let query = {
    $and: [{ reason: "Block/Report" }, { celebrityId: ObjectId(receiverId) }, { memberId: ObjectId(senderId) }]
  };
  //console.log(query);
  creditServices.getCreditBalance(ObjectId(senderId), (err, senderCreditObj) => {
    if (err)
      console.log(err)
    else {
      //console.log("senderCreditObj", senderCreditObj);
      celebrityContractsService.getCelebContractsByServiceType(senderId, serviceType, (err, celebrityContractsObj) => {
        if (err)
          console.log(err)
        else {
          //console.log("celebrityContractsObj", celebrityContractsObj);
          let serviceCredits = 0;
          if (celebrityContractsObj)
            serviceCredits = celebrityContractsObj.serviceCredits;
          User.findById(ObjectId(senderId), (err, senderDetailsObj) => {
            if (err) {
              console.log(err);
            } else {
              logins.findOne({ memberId: ObjectId(receiverId) }, { osType: 1, deviceToken: 1, mobileNumber: 1, callingDeviceToken: 1 }, (err, celebDeviceObj) => {
                if (err) {
                  console.log(err);
                } else {
                  // console.log("celebDeviceObj", celebDeviceObj);
                  feedbackModel.find(query, function (err, Fresult) {
                    //console.log("Fresult", Fresult);
                    if (Fresult.length > 0) {
                      res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
                    } else {
                      let query = {
                        $and: [{ callRemarks: "Block/Report" }, { receiverId: receiverId }, { senderId: senderId }]
                      };
                      serviceTransaction.find(query, function (err, tresult) {
                        if (tresult.length > 0) {
                          res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
                        } else {
                          //console.log(req.body)
                          if (serviceType == "chat") {
                            serviceTransaction.serviceTransaction(serviceTransactionRecord, function (err, transaction) {
                              if (err) {
                                res.send(err);
                              } else {
                                res.json({ token: req.headers['x-access-token'], success: 1, message: "serviceTransaction saved sucessfully", data: transaction });
                                // Create a service schedule
                                let newServiceSchedule = new serviceSchedule({
                                  service_type: serviceType,
                                  senderId: senderId,
                                  receiverId: receiverId,
                                  startTime: serviceTransactionRecord.startTime,
                                  //createdBy: createdBy
                                });
                                //console.log("P1", newServiceSchedule);
                                serviceSchedule.createServiceSchedule(newServiceSchedule, function (
                                  err,
                                  result
                                ) {
                                  if (err) {
                                    //res.send(err);
                                  } else {
                                    //res.json({ message: "serviceSchedule created Successfully" });
                                  }
                                });
                              }
                            });
                          } else {
                            User.findOne({ _id: ObjectId(req.body.receiverId), $or: [{ isOnline: false }, { liveStatus: "offline" }] }, { pastProfileImages: 0, }, (err, nuResult) => {
                              // console.log("nuResult", nuResult);
                              // console.log("celebDeviceObj", celebDeviceObj);
                              if (err) {
                                console.log(err)
                                //if (nuResult) {
                                //res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity is offline" });
                              } else {
                                if (nuResult) {
                                  if (nuResult.liveStatus == "offline") {
                                    screenLockStatusForAndroid = false;
                                    screenLockStatus = false
                                  }
                                }
                                User.aggregate(
                                  [
                                    {
                                      $match: {
                                        $and: [
                                          { _id: ObjectId(receiverId) },
                                          { callStatus: "true" }
                                        ]
                                      }
                                    }
                                  ],
                                  function (err, result) {
                                    if (result.length > 0) {
                                      //console.log(result.length);
                                      return res.json({
                                        success: 0,
                                        token: req.headers['x-access-token'],
                                        message: "Celebrity is busy on another call",
                                        data: req.body
                                      });
                                    }
                                    else if (result.length == 0) {
                                      //console.log(result.length);
                                      currenttime = new Date(Date.now());
                                      var nextDay = new Date(currenttime);
                                      nextDay.setDate(currenttime.getDate() + 1);
                                      //console.log(currenttime);
                                      //console.log(nextDay);
                                      slotMaster.aggregate(
                                        [
                                          {
                                            $match: {
                                              $and: [
                                                { memberId: ObjectId(receiverId) },
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
                                        function (err, result1) {
                                          if (err) {
                                            //res.send(err);
                                          }
                                          //console.log(result)
                                          if (result1.length > 0) {
                                            // console.log("Schedule created pls Check call ");
                                            // console.log("tresult", tresult)
                                            serviceTransaction.serviceTransaction(serviceTransactionRecord, function (err, transaction) {
                                              if (err) {
                                                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                              } else {
                                                // console.log("*********************Sencond by rohit response*************************")
                                                // console.log(transaction);
                                                // console.log("*********************Sencond by rohit response*************************")
                                                if (nuResult || screenLockStatusForAndroid == true) {
                                                  if (celebDeviceObj.osType == "Android") {
                                                    let data = {
                                                      serviceType: serviceType,
                                                      title: 'Call Alert!',
                                                      body: "Hi! " + senderDetailsObj.firstName + " " + senderDetailsObj.lastName + " is trying to call you.",
                                                      firstName: senderDetailsObj.firstName,
                                                      avtar_imgPath: senderDetailsObj.avtar_imgPath,
                                                      senderId: senderDetailsObj._id,
                                                      senderName: senderDetailsObj.firstName,
                                                      senderImage: senderDetailsObj.avtar_imgPath,
                                                      sTransactionId: transaction._id,
                                                      roomID: transaction._id,
                                                      chatRoomID: receiverId,
                                                      os: senderDetailsObj.osType,
                                                      notficationTime: NotficationTime,
                                                      totalCredits: senderCreditObj.cumulativeCreditValue,
                                                      serviceCredits: serviceCredits,
                                                      screenLockStatus: screenLockStatusForAndroid
                                                    }
                                                    otpService.sendAndriodPushNotification(celebDeviceObj.deviceToken, "Call Alert!", data, (err, successNotificationObj) => {
                                                      if (err)
                                                        console.log(err)
                                                      else {
                                                        console.log("PUSH NOTI==== ", successNotificationObj)
                                                      }
                                                    })
                                                  }
                                                  else {
                                                    //let payload = {
                                                    // notification = {
                                                    //   serviceType: serviceType,
                                                    //   title: 'Call Alert!',
                                                    //   body: "Hi! " + senderDetailsObj.firstName + " " + senderDetailsObj.lastName + " is trying to call you.",
                                                    //   firstName: senderDetailsObj.firstName,
                                                    //   avtar_imgPath: senderDetailsObj.avtar_imgPath,
                                                    //   receiverId: receiverId,
                                                    //   senderStatus: senderStatus,
                                                    //   senderId: senderDetailsObj._id,
                                                    //   sendername: senderDetailsObj.firstName,
                                                    //   senderimage: senderDetailsObj.avtar_imgPath,
                                                    //   sTransactionId: transaction._id,
                                                    //   roomID: transaction._id,
                                                    //   chatRoomID: receiverId,
                                                    //   os: senderDetailsObj.osType,
                                                    //   totalCredits: senderCreditObj.cumulativeCreditValue,
                                                    //   serviceCredits: serviceCredits,
                                                    //   notficationTime:NotficationTime,
                                                    //   duration: 2
                                                    // }
                                                    // otpService.sendIOSPushNotification(celebDeviceObj.deviceToken, notification, (err, successNotificationObj) => {
                                                    //   if (err)
                                                    //     console.log(err)
                                                    //   else {
                                                    //     console.log(successNotificationObj)
                                                    //   }
                                                    // })
                                                  }
                                                }
                                                //Send VoIP(vice over IP) notiication only for IOS (related app minimize)
                                                //screenLockStatus == true
                                                if (celebDeviceObj.osType != "Android") {
                                                  let note = new apn.Notification();
                                                  note.expiry = Math.floor(Date.now() / 1000) + 15; // Expires 1 hour from now.
                                                  note.badge = 3;
                                                  note.sound = "ping.aiff";
                                                  note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
                                                  note.payload = {
                                                    serviceType: serviceType,
                                                    title: 'Call Alert!',
                                                    body: "Hi! " + senderDetailsObj.firstName + " " + senderDetailsObj.lastName + " is trying to call you.",
                                                    firstName: senderDetailsObj.firstName,
                                                    avtar_imgPath: senderDetailsObj.avtar_imgPath,
                                                    receiverId: receiverId,
                                                    senderStatus: senderStatus,
                                                    senderId: senderDetailsObj._id,
                                                    sendername: senderDetailsObj.firstName,
                                                    senderimage: senderDetailsObj.avtar_imgPath,
                                                    sTransactionId: transaction._id,
                                                    roomID: transaction._id,
                                                    chatRoomID: receiverId,
                                                    os: senderDetailsObj.osType,
                                                    totalCredits: senderCreditObj.cumulativeCreditValue,
                                                    serviceCredits: serviceCredits,
                                                    notficationTime: NotficationTime,
                                                    duration: 2
                                                  };
                                                  note.topic = "com.CelebKonect.voip";
                                                  apnProvider.send(note, celebDeviceObj.callingDeviceToken).then(result => {
                                                    // Show the result of the send operation:
                                                    console.log("ZZZZZZZZZZZZZZZZZZz", result);
                                                    //console.log(result.failed[0].response);
                                                  });
                                                }
                                                // let callInfo  =  {};
                                                // callInfo.transaction =  transaction;
                                                // callInfo.serviceType = serviceType;
                                                // callInfo.senderId = senderId;
                                                // callInfo.receiverId = receiverId;
                                                // callInfo.startTime = Date.now();
                                                // callInfo.endTime = Date.now();
                                                // //callInfo.receiverimage = receiverInfo.avtar_imgPath;
                                                // //callInfo.receivername = receiverInfo.firstName;
                                                // callInfo.sendername = senderDetailsObj.firstName;
                                                // callInfo.senderimage = senderDetailsObj.avtar_imgPath;
                                                // callInfo.screenLockStatus = false;
                                                // callInfo.scheduleCall = false;

                                                // console.log("callInfo",callInfo);
                                                res.json({
                                                  message: "serviceTransaction saved sucessfully",
                                                  success: 1,
                                                  token: req.headers['x-access-token'],
                                                  data: transaction
                                                });
                                                //res.json({ message: "serviceTransaction saved successfully" },transaction);
                                                // Create a service schedule
                                                let newServiceSchedule = new serviceSchedule({
                                                  service_type: serviceType,
                                                  senderId: senderId,
                                                  receiverId: receiverId,
                                                  startTime: serviceTransactionRecord.startTime,
                                                  //createdBy: createdBy
                                                });
                                                //console.log("P1", newServiceSchedule);
                                                serviceSchedule.createServiceSchedule(newServiceSchedule, function (
                                                  err,
                                                  Rsresult
                                                ) {
                                                  if (err) {
                                                    //res.send(err);
                                                  } else {
                                                    let reqbody = {};
                                                    reqbody.scheduleId = Rsresult._id;
                                                    serviceTransaction.findOneAndUpdate({ _id: transaction._id }, reqbody, function (err, test) {
                                                      if (err) return console.log(err);
                                                      //res.json({ message: "serviceSchedule created Successfully" });
                                                    });
                                                  }
                                                });
                                              }
                                            });
                                            // res.json({
                                            //   success: 1,
                                            //   message: "Existing slots",
                                            //   token: req.headers['x-access-token'],
                                            //   data: tresult
                                            // });
                                          } else if (result1.length == 0) {
                                            let celebCallStatus = "false";
                                            if (req.body.serviceStatus == "celebLifted" || req.body.serviceStatus == "membercalling")
                                              celebCallStatus = "true"
                                            User.findByIdAndUpdate(ObjectId(receiverId), { $set: { callStatus: celebCallStatus } }, (err, celebCallStatesUpdatedObj) => {
                                              if (err)
                                                console.log("***** Error while update celeb call status when celeblifted or membercalling *****", err)
                                              else {
                                                serviceTransaction.serviceTransaction(serviceTransactionRecord, function (err, transaction) {
                                                  if (err) {
                                                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                  } else {
                                                    if (nuResult || screenLockStatusForAndroid == true) {
                                                      if (celebDeviceObj.osType == "Android") {
                                                        let data = {
                                                          serviceType: serviceType,
                                                          title: 'Call Alert!',
                                                          body: "Hi! " + senderDetailsObj.firstName + " " + senderDetailsObj.lastName + " is trying to call you.",
                                                          firstName: senderDetailsObj.firstName,
                                                          avtar_imgPath: senderDetailsObj.avtar_imgPath,
                                                          senderId: senderDetailsObj._id,
                                                          senderName: senderDetailsObj.firstName,
                                                          senderImage: senderDetailsObj.avtar_imgPath,
                                                          sTransactionId: transaction._id,
                                                          roomID: transaction._id,
                                                          chatRoomID: receiverId,
                                                          os: senderDetailsObj.osType,
                                                          totalCredits: senderCreditObj.cumulativeCreditValue,
                                                          serviceCredits: serviceCredits,
                                                          notficationTime: NotficationTime,
                                                          screenLockStatus: screenLockStatusForAndroid
                                                        }
                                                        otpService.sendAndriodPushNotification(celebDeviceObj.deviceToken, "Call Alert!", data, (err, successNotificationObj) => {
                                                          if (err)
                                                            console.log(err)
                                                          else {
                                                            console.log("PUSH NOTI==== ", successNotificationObj)
                                                          }
                                                        })
                                                      }
                                                      else {
                                                        //let payload = {
                                                        // notification = {
                                                        //   serviceType: serviceType,
                                                        //   title: 'Call Alert!',
                                                        //   body: "Hi! " + senderDetailsObj.firstName + " " + senderDetailsObj.lastName + " is trying to call you.",
                                                        //   firstName: senderDetailsObj.firstName,
                                                        //   avtar_imgPath: senderDetailsObj.avtar_imgPath,
                                                        //   receiverId: receiverId,
                                                        //   senderStatus: senderStatus,
                                                        //   senderId: senderDetailsObj._id,
                                                        //   sendername: senderDetailsObj.firstName,
                                                        //   senderimage: senderDetailsObj.avtar_imgPath,
                                                        //   sTransactionId: transaction._id,
                                                        //   roomID: transaction._id,
                                                        //   chatRoomID: receiverId,
                                                        //   os: senderDetailsObj.osType,
                                                        //   totalCredits: senderCreditObj.cumulativeCreditValue,
                                                        //   serviceCredits: serviceCredits,
                                                        //   notficationTime:NotficationTime,
                                                        //   duration: 2
                                                        // }
                                                        // otpService.sendIOSPushNotification(celebDeviceObj.deviceToken, notification, (err, successNotificationObj) => {
                                                        //   if (err)
                                                        //     console.log(err)
                                                        //   else {
                                                        //     console.log(successNotificationObj)
                                                        //   }
                                                        // })
                                                      }
                                                    }
                                                    //Send VoIP(vice over IP) notiication only for IOS (related app minimize)
                                                    //screenLockStatus == true ||
                                                    //celebDeviceObj.osType != "Android"
                                                    if (celebDeviceObj.osType != "Android") {
                                                      let note = new apn.Notification();
                                                      note.expiry = Math.floor(Date.now() / 1000) + 15;// Expires 1 hour from now.
                                                      note.badge = 3;
                                                      note.sound = "ping.aiff";
                                                      note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
                                                      note.payload = {
                                                        serviceType: serviceType,
                                                        title: 'Call Alert!',
                                                        body: "Hi! " + senderDetailsObj.firstName + " " + senderDetailsObj.lastName + " is trying to call you.",
                                                        firstName: senderDetailsObj.firstName,
                                                        avtar_imgPath: senderDetailsObj.avtar_imgPath,
                                                        receiverId: receiverId,
                                                        senderStatus: senderStatus,
                                                        senderId: senderDetailsObj._id,
                                                        sendername: senderDetailsObj.firstName,
                                                        senderimage: senderDetailsObj.avtar_imgPath,
                                                        sTransactionId: transaction._id,
                                                        roomID: transaction._id,
                                                        chatRoomID: receiverId,
                                                        os: senderDetailsObj.osType,
                                                        totalCredits: senderCreditObj.cumulativeCreditValue,
                                                        serviceCredits: serviceCredits,
                                                        notficationTime: NotficationTime,
                                                        duration: 2
                                                      };
                                                      note.topic = "com.CelebKonect.voip";
                                                      apnProvider.send(note, celebDeviceObj.callingDeviceToken).then(result => {
                                                        // Show the result of the send operation:
                                                        console.log("VOIP Notification == ", result);
                                                        //console.log(result.failed[0].response);
                                                      });
                                                    }
                                                    if (req.body.senderStatus == 'celeb') {
                                                      UserSender.findByIdAndUpdate(ObjectId(senderId), { $set: { callStatus: celebCallStatus } }, { new: true }, (err, isSenderCelebObj) => {
                                                        if (err)
                                                          console.log("******* If Celeb initiate the call to celeb then sender status change ******************", err)
                                                        else {
                                                        }
                                                      })
                                                    }

                                                    res.json({
                                                      message: "serviceTransaction saved sucessfully",
                                                      success: 1,
                                                      token: req.headers['x-access-token'],
                                                      data: transaction
                                                    });
                                                    //res.json({ message: "serviceTransaction saved successfully" },transaction);
                                                    // Create a service schedule
                                                    let newServiceSchedule = new serviceSchedule({
                                                      service_type: serviceType,
                                                      senderId: senderId,
                                                      receiverId: receiverId,
                                                      startTime: serviceTransactionRecord.startTime,
                                                      //createdBy: createdBy
                                                    });
                                                    //console.log("P1", newServiceSchedule);
                                                    serviceSchedule.createServiceSchedule(newServiceSchedule, function (
                                                      err,
                                                      Rsresult
                                                    ) {
                                                      if (err) {
                                                        //res.send(err);
                                                      } else {
                                                        let reqbody = {};
                                                        reqbody.scheduleId = Rsresult._id;
                                                        serviceTransaction.findOneAndUpdate({ _id: transaction._id }, reqbody, function (err, test) {
                                                          if (err) return console.log(err);
                                                          //res.json({ message: "serviceSchedule created Successfully" });
                                                        });
                                                      }
                                                    });
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        }
                                      );
                                    }
                                  });
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                }
              })
            }
          })
        }
      })
    }
  })




  // }

  // });
});
//End Create a Schedule//



//Edit a Schedule start (using through socket)
router.put("/serviceTransaction/:id", function (req, res) {
  let reqbody = req.body;
  // console.log("**************************************************");
  // console.log(reqbody);
  // console.log("**************************************************");
  if (reqbody.serviceStatus == "celebLifted" || reqbody.serviceStatus == "memberDisconnected" || reqbody.serviceStatus == "celebdisconnected" || reqbody.serviceStatus == "memberDisconnected") {
    reqbody.startTime = Date.now();
    reqbody.endTime = reqbody.startTime;
    reqbody.updatedAt = reqbody.startTime;
    reqbody.isMissedCall = true;
  }
  else {
    reqbody.endTime = Date.now();
    reqbody.isMissedCall = false;
    reqbody.updatedAt = reqbody.endTime;
  }

  serviceTransaction.findOneAndUpdate({ _id: req.params.id }, reqbody, { new: true }, (err, sTresult) => {
    if (err) {
      res.json({ error: "User Not Exists / Send a valid UserID" });
    } else {
      if (reqbody.serviceStatus == "celebRejected" || reqbody.serviceStatus == "celebdisconnected" || reqbody.senderCallEnd == true) {
        User.findById(sTresult.senderId, (err, userObj) => {
          if (err)
            console.log("***** Error while fetching the user Details **********", err);
          else {
            User.findById(sTresult.receiverId, (err, celebDetailsObj) => {
              if (err)
                console.log("******** Error while fetching the celeb details***********", err)
              else {
                logins.findOne({ memberId: userObj._id }, (err, userDeviceInfoObj) => {
                  if (err)
                    console.log("*** Error while fetching use device info **********");
                  else {
                    if (reqbody.senderCallEnd == true) {
                      let body = "Hi! " + celebDetailsObj.firstName + " " + celebDetailsObj.lastName + " is not available.";
                      if (celebDetailsObj.liveStatus == "online")
                        body = "Hi! " + celebDetailsObj.firstName + " " + celebDetailsObj.lastName + " is busy.";
                      if (userDeviceInfoObj.osType == "Android") {
                        let data = {
                          title: 'Call Alert!',
                          body: body,
                        }
                        otpService.sendAndriodPushNotification(userDeviceInfoObj.deviceToken, "Call Alert!", data, (err, successNotificationObj) => {
                          if (err)
                            console.log(err)
                          else {
                            console.log("PUSH NOTI==== ", successNotificationObj)
                          }
                        })
                      } else {
                        let notification = {
                          title: 'Call Alert!',
                          body: body,
                        }
                        otpService.sendIOSPushNotification(userDeviceInfoObj.deviceToken, notification, (err, successNotificationObj) => {
                          if (err)
                            console.log(err)
                          else {
                            console.log("PUSH NOTI==== ", successNotificationObj)
                          }
                        })
                      }
                    } else {
                      let title = ck_call_messages.sendResponseMessage(celebDetailsObj, reqbody.callRemarks, reqbody.reason, reqbody.celebLifted).title;
                      let body = ck_call_messages.sendResponseMessage(celebDetailsObj, reqbody.callRemarks, reqbody.reason, reqbody.celebLifted).body
                      message = {
                        to: userDeviceInfoObj.deviceToken,
                        collapse_key: 'Service-alerts',
                        data: {
                          serviceType: "Service",
                          title: title,
                          body: body,
                          activity: reqbody.callRemarks,
                        },
                        notification: {
                          serviceType: "Service",
                          title: title,
                          body: body,
                          activity: "Call",
                        }
                      }
                      fcm.send(message, function (err, response) {
                        if (err) {
                          console.log("Something has gone wrong!", err);
                        } else {
                          console.log(response)
                          let newNotification = new Notification({
                            memberId: userObj._id,
                            notificationType: "Call",
                            activity: "Call",
                            title: title,
                            body: body,
                            notificationFrom: celebDetailsObj._id,
                          });
                          // Insert Notification
                          Notification.createNotification(newNotification, function (err, credits) {
                            if (err) {
                              //res.send(err);
                            } else {

                            }
                            //console.log("Successfully sent with response: ", response);

                          });
                          //console.log("Successfully sent with response: ", response);
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
      if (reqbody.callRemarks == "Block/Report" && reqbody.serviceStatus == "celebRejected") {
        MemberPreferences.aggregate([
          {
            $match: {
              memberId: sTresult.senderId
            }
          },
          {
            $unwind: "$celebrities"
          },
          {
            $match: {
              "celebrities.CelebrityId": sTresult.receiverId,
            }
          }
        ], (err, memberPreferencesObj) => {
          if (err)
            console.log(err)
          else if (memberPreferencesObj.length) {
            MemberPreferences.update({ memberId: sTresult.senderId },
              {
                $pull: {
                  celebrities: { CelebrityId: sTresult.receiverId },
                }
              }, { multi: true }, (err, updatedresult) => {
                if (err)
                  console.log(err);
                else {
                }
              })
            // serviceSchedule.findById(sTresult.scheduleId, function (err, sResult) {
            //   if (err) return console.log(err);
            //   let reqbody = {};

            //   reqbody.scheduleId = sResult._id;
            //   reqbody.endTime = Date.now();
            //   reqbody.updatedAt = Date.now();
            //   serviceTransaction.findOneAndUpdate({ _id: req.params.id }, reqbody, function (err, test) {
            //     if (err) return console.log(err);
            //     //console.log("hxsgxhs",test);
            //     let reqbody = {};
            //     reqbody.endTime = test.endTime;
            //     reqbody.serviceSchduleStatus = test.serviceStatus;
            //     serviceSchedule.findOneAndUpdate({ _id: test.scheduleId }, reqbody, function (err, sR) {
            //       if (err) return console.log(err);
            //     });
            //   });
            // });
          }
        })
      }
      res.json({ message: "serviceTransaction Updated Successfully", data: sTresult });
      serviceSchedule.findById(sTresult.scheduleId, function (err, sResult) {
        if (err) return console.log(err);
        let reqbody = {};

        reqbody.scheduleId = sResult._id;
        reqbody.endTime = Date.now();
        reqbody.updatedAt = Date.now();
        serviceTransaction.findOneAndUpdate({ _id: req.params.id }, reqbody, function (err, test) {
          if (err) return console.log(err);
          //console.log("hxsgxhs",test);
          let reqbody = {};
          reqbody.endTime = test.endTime;
          reqbody.serviceSchduleStatus = test.serviceStatus;
          serviceSchedule.findOneAndUpdate({ _id: test.scheduleId }, reqbody, function (err, sR) {
            if (err) return console.log(err);
          });
        });
      });
    }
  });
});
// End Edit a Schedule

// // Find by findByServiceTransactionId start
// router.get("/findByServiceTransactionId/:Id", function (req, res) {
//   let id = req.params.Id;

//   serviceTransaction.getServiceTransactionById(id, function (err, result) {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "serviceTransaction Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
// // End Find by findByServiceTransactionId

// get Transaction jobs by status start

// router.post("/getTransactionJobsByStatus", function (req, res) {
//   let serviceStatus = req.body.serviceStatus;
//   let serviceStatus1 = req.body.serviceStatus1;
//   if (serviceStatus && serviceStatus1) {
//     let query = { $or: [{ serviceStatus: serviceStatus }, { serviceStatus: serviceStatus1 }] };
//     serviceTransaction.find(query, function (err, result) {
//       if (result) {
//         res.send(result);
//       } else {
//         res.json({
//           error: "ServiceTransaction status Not Exists / Send a valid Status"
//         });
//       }
//     });
//   } else if (serviceStatus) {
//     serviceTransaction.find({ serviceStatus: serviceStatus }, function (err, result) {
//       if (result) {
//         res.send(result);
//       } else {
//         res.json({
//           error: "ServiceTransaction status Not Exists / Send a valid Status"
//         });
//       }
//     });

//   }

// });
// End get Transaction jobs by status












// // getByUserID start
// router.get("/getByUserID/:userID", function (req, res) {
//   let id = req.params.userID;
//   serviceTransaction.aggregate(
//     [
//       { $match: { $or: [{ senderId: ObjectId(id) }, { receiverId: ObjectId(id) }] } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "senderId",
//           foreignField: "_id",
//           as: "senderProfile"
//         }
//       },
//       { $unwind: "$senderProfile" },
//       {
//         $lookup: {
//           from: "users",
//           localField: "receiverId",
//           foreignField: "_id",
//           as: "receiverProfile"
//         }
//       },
//       { $unwind: "$receiverProfile" },
//       { $sort: { startTime: -1 } }
//     ],
//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       return res.send(data);
//     }
//   );
// });
// // End getByUserID

// Find by userId and serviceType start

// router.post("/schduleByServiceType", function (req, res) {
//   let id = req.body.senderId;
//   let serviceType = req.body.serviceType;

//   serviceTransaction.aggregate(
//     [
//       { $match: { $or: [{ senderId: ObjectId(id) }, { receiverId: ObjectId(id) }] } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "senderId",
//           foreignField: "_id",
//           as: "senderProfile"
//         }
//       },
//       { $unwind: "$senderProfile" },
//       {
//         $lookup: {
//           from: "users",
//           localField: "receiverId",
//           foreignField: "_id",
//           as: "receiverProfile"
//         }
//       },
//       { $unwind: "$receiverProfile" },
//       { $match: { serviceType: serviceType } }
//     ],
//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       return res.send(data);
//     }
//   );
// });
// End Find by userId and serviceType

// getAll start
// router.get("/getAll", (req, res) => {
//   serviceTransaction.find({}, (err, result) => {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   }).sort({ createdAt: -1 });
// });
// End getAll

// getAllServiceTrasactionJob start
// router.get("/getAllServiceTrasactionJob", function (req, res) {

//   serviceTransaction.find({}, function (err, result) {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   });
// });
// End getAllServiceTrasactionJob

// delete ServiceTransactionById start

// router.delete("/deleteServiceTransactionById/:id", function (req, res, next) {
//   let id = req.params.id;

//   serviceTransaction.findByIdAndRemove(id, function (err, post) {
//     if (err) {
//       res.json({
//         error: "User Not Exists / Send a valid UserID"
//       });
//     } else {
//       res.json({ message: "Deleted serviceTransaction Successfully" });
//     }
//   });
// });
// End delete ServiceTransactionById


// Create a Notification record
// router.post("/adminNotification", function (req, res) {
//   let body = req.body.body;
//   let title = req.body.title;
//   let dToken = req.body.deviceToken;


//   // logins.find({ }, function (err, Lresult) {
//   //   console.log(Lresult);
//   //   for(i=0;i<=Lresult.length;i++){


//   var message = {
//     "registration_ids": dToken,
//     collapse_key: 'Notificaitons',

//     notification: {
//       title: title,
//       body: body,
//     }

//   };
//   fcm.send(message, function (err, response) {
//     if (err) {
//     } else {
//       res.send(response);
//     }
//     //   });
//     // }
//   });



// });
// End of Create a Notification record



//get call history coantact persom Prathmesh
// router.get("/getCallHistoryByMemberId/:memberId", function (req, res) {
//   serviceTransaction.find({
//     $and: [{
//       $or: [
//         { senderId: ObjectId(req.params.memberId) },
//         { receiverId: ObjectId(req.params.memberId) }
//       ]
//     },
//     {
//       $or: [
//         { serviceType: "video" },
//         { serviceType: "audio" }
//       ]
//     }]
//   }, { _id: 1, receiverId: 1, senderId: 1, serviceType: 1, startTime: 1, endTime: 1, liveStatusDate: 1, createdAt: 1, updatedAt: 1 }, (err, allCallsHistory) => {
//     allCallsHistory.map((callDetails) => {
//       if (callDetails.receiverId == req.params.memberId) {
//         Object.assign(callDetails, {
//           "incoming": true,
//           "outgoing": false
//         });
//       }
//       else {
//         Object.assign(callDetails, {
//           "incoming": false,
//           "outgoing": true
//         });
//       }
//     })
//     // allCallsHistory = allCallsHistory.map((callDetails)=>{
//     //   if(callDetails.receiverId && callDetails.senderId)
//     //   {
//     //     if(callDetails.receiverId._id == req.params.memberId)
//     //     {
//     //       Object.assign(callDetails, {
//     //         "incoming" : true,
//     //         "outgoing" : false
//     //       });
//     //     }
//     //     else{
//     //       Object.assign(callDetails, {
//     //         "incoming" : false,
//     //         "outgoing" : true
//     //       });
//     //     }
//     //     return callDetails;
//     //   }
//     res.json({ "allCallsHistory": allCallsHistory })
//   }).populate({ path: 'senderId', select: '_id avtar_imgPath firstName lastName' })
//     .populate({ path: 'receiverId', select: '_id avtar_imgPath firstName lastName' })
//     .sort({ createdAt: -1 }).lean();
// });
//call histry end//

//created new one for above api 
router.get("/newGetCallHistoryByMemberId/:memberId", function (req, res) {

  serviceTransaction.updateMany({ receiverId: ObjectId(req.params.memberId) }, { $set: { isMissedCall: false } }, (err, missedCallStatusUpdatedObj) => {
    if (err) {
      res.json({ err: err, null: null })
    } else {
      MemberPreferences.aggregate([
        {
          $match: {
            "memberId": ObjectId(req.params.memberId)
          }
        },
        {
          $unwind: "$celebrities"
        },
        {
          $match: {
            "celebrities.isFan": true
          }
        },
        {
          $group: {
            _id: {
              _id: "$_id"
            },
            celebrities: { $push: "$celebrities.CelebrityId" }
          }
        },
        { "$limit": 1 },
        {
          $project: {
            _id: 1,
            memberId: 1,
            "celebrities": 1
          }
        }
      ], (err, fanOfDetails) => {
        // console.log("fanOfDetails", fanOfDetails)
        if (err) {
          res.json({ err: err, allCallsHistory: null })
        }
        if (fanOfDetails.length)
          fanOfDetails = fanOfDetails[0].celebrities;
        else
          fanOfDetails = [];
        serviceTransaction.aggregate([
          {
            $match: {
              $and: [{
                $or: [
                  { senderId: ObjectId(req.params.memberId) },
                  { receiverId: ObjectId(req.params.memberId) }
                ]
              },
              {
                $or: [
                  { serviceType: "video" },
                  { serviceType: "audio" }
                ]
              },

              ]
            },
          },
          // {
          //   $limit: 100
          // },
          {
            $lookup:
            {
              from: 'users',
              localField: 'senderId',
              foreignField: '_id',
              as: 'senderId'
            }
          },
          {
            $lookup:
            {
              from: 'users',
              localField: 'receiverId',
              foreignField: '_id',
              as: 'receiverId'
            }
          },
          {
            $sort:
            {
              createdAt: -1
            }
          },
          {
            $group: {
              _id: {
                senderId: "$senderId",
                receiverId: "$receiverId",
                serviceType: "$serviceType",
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
                year: { $year: "$createdAt" }
              },
              allCallsHistory: { $push: "$$ROOT" }
            }
          },
          {
            $sort:
            {
              "_id.day": -1
            }
          },
          {
            $sort:
            {
              "_id.month": -1
            }
          },
          {
            $sort:
            {
              "_id.year": -1
            }
          },
          {
            $sort:
            {
              createdAt: -1
            }
          },
          {
            $project: {
              _id: {
                senderId: {
                  _id: 1,
                  avtar_imgPath: 1,
                  firstName: 1,
                  lastName: 1,
                  isCeleb: 1,
                  isFan: 1,
                  isOnline: 1,
                  profession: 1,
                  aboutMe: 1,
                  role: 1
                },
                receiverId: {
                  _id: 1,
                  avtar_imgPath: 1,
                  firstName: 1,
                  lastName: 1,
                  isCeleb: 1,
                  isFan: 1,
                  isOnline: 1,
                  profession: 1,
                  aboutMe: 1,
                  role: 1
                },
                serviceType: 1,
                serviceStatus: 1,
                month: 1,
                day: 1,
                year: 1,
                hour: 1,
                minute: 1,
                second: 1
              },
              allCallsHistory: {
                _id: 1,
                senderId: {
                  _id: 1,
                  avtar_imgPath: 1,
                  firstName: 1,
                  lastName: 1,
                  isCeleb: 1,
                  isFan: 1,
                  isOnline: 1,
                  profession: 1,
                  aboutMe: 1,
                  role: 1
                },
                receiverId: {
                  _id: 1,
                  avtar_imgPath: 1,
                  firstName: 1,
                  lastName: 1,
                  isCeleb: 1,
                  isFan: 1,
                  isOnline: 1,
                  profession: 1,
                  aboutMe: 1,
                  role: 1
                },
                serviceType: 1,
                serviceStatus: 1,
                startTime: 1,
                endTime: 1,
                liveStatusDate: 1,
                createdAt: 1,
                updatedAt: 1,
                ago: { $subtract: [new Date(), "$createdAt"] },
              },
              numberOfCalls: { $size: "$allCallsHistory" }
            }
          },
        ], (err, allCallsHistoryGroupedObj) => {
          if (err) {
            res.json({ success: 0, err: err })
          }
          else {
            allCallsHistoryGroupedObj = allCallsHistoryGroupedObj.filter((callHistoryObj) => {
              if (callHistoryObj._id.receiverId.length && callHistoryObj._id.senderId.length) {
                return callHistoryObj
              }
              else {
                //console.log(callHistoryObj._id)
              }
            });
            let allCallsHistoryGroupedObj1 = allCallsHistoryGroupedObj;
            allCallsHistoryGroupedObj.map((callHistoryObj, index) => {
              let duplicate = allCallsHistoryGroupedObj1.filter((callHistoryObj2, index2) => {
                if ((callHistoryObj2._id.serviceType == callHistoryObj._id.serviceType) &&
                  (callHistoryObj2._id.hour == callHistoryObj._id.hour) &&
                  (callHistoryObj2._id.minute == callHistoryObj._id.minute) &&
                  (callHistoryObj2._id.second == callHistoryObj._id.second) &&
                  (callHistoryObj2._id.month == callHistoryObj._id.month) &&
                  (callHistoryObj2._id.day == callHistoryObj._id.day) &&
                  (callHistoryObj2._id.year == callHistoryObj._id.year) && (index != index2) &&
                  (
                    (callHistoryObj2._id.receiverId[0] && callHistoryObj2._id.senderId[0] && callHistoryObj._id.receiverId[0] && callHistoryObj._id.senderId[0]) && ((callHistoryObj2._id.senderId[0]._id + "" != req.params.memberId + "") ?
                      (callHistoryObj2._id.senderId[0]._id + "" == callHistoryObj._id.receiverId[0]._id + "") :
                      (callHistoryObj2._id.receiverId[0]._id + "" == callHistoryObj._id.receiverId[0]._id + ""))
                  )) {
                  allCallsHistoryGroupedObj.splice(index2, 1);
                  return callHistoryObj2;
                }
              })

              if (duplicate[0] != undefined && duplicate[0].allCallsHistory != []) {
                duplicate[0].allCallsHistory.forEach((callDetails) => {
                  let i;
                  callHistoryObj.allCallsHistory.push(callDetails)
                  // for(i = 0;callHistoryObj.allCallsHistory[i];i++)
                  // {
                  //   if(callHistoryObj.allCallsHistory[i].createdAt < callDetails.createdAt)
                  //   {
                  //     callHistoryObj.allCallsHistory.unshift(callDetails)
                  //     break;
                  //   }
                  //   else if(callHistoryObj.allCallsHistory[callHistoryObj.allCallsHistory.length-1].createdAt > callDetails.createdAt)
                  //   {
                  //     callHistoryObj.allCallsHistory.push(callDetails)
                  //     break;
                  //   }
                  //   else if((callHistoryObj.allCallsHistory[i].createdAt >= callDetails.createdAt) &&
                  //   (callHistoryObj.allCallsHistory[i+1])&&
                  //   (callHistoryObj.allCallsHistory[i+1].createdAt <= callDetails.createdAt))
                  //   {
                  //     callHistoryObj.allCallsHistory.splice(i+1,0,callDetails)
                  //     break;
                  //   }
                  //   else{
                  //     console.log("+++++++++++++++++++++++++")
                  //     callHistoryObj.allCallsHistory.splice(i+1,0,callDetails)
                  //     break;
                  //   }
                  //  }
                })
                callHistoryObj.numberOfCalls = callHistoryObj.allCallsHistory.length;
              }
              // console.log(index)
              // console.log(allCallsHistoryGroupedObj.length)
            })
            allCallsHistoryGroupedObj.map((callHistoryObj) => {
              callHistoryObj.allCallsHistory.map((callDetails) => {
                if (callDetails.receiverId[0]._id == req.params.memberId) {
                  Object.assign(callDetails, {
                    "incoming": true,
                    "outgoing": false
                  });
                }
                else {
                  Object.assign(callDetails, {
                    "incoming": false,
                    "outgoing": true
                  });
                }
                callDetails.senderId = callDetails.senderId[0];
                callDetails.receiverId = callDetails.receiverId[0];
                callDetails.callDuration = secondsToHms(((callDetails.endTime - callDetails.startTime) / 1000))
              })
              if (callHistoryObj._id.receiverId[0] && callHistoryObj._id.senderId[0]) {
                var receiverId = callHistoryObj._id.receiverId[0]._id + ""
                var senderId = callHistoryObj._id.senderId[0]._id + ""
                callHistoryObj._id.isFan = fanOfDetails.some((fanId) => {
                  return (fanId == receiverId) || (fanId == senderId);
                })
              } else {
                callHistoryObj._id.isFan = false;
              }

              //sort call history
              callHistoryObj.allCallsHistory.sort(function (a, b) {
                // convert date object into number to resolve issue in typescript
                return new Date(b.createdAt) - new Date(a.createdAt);
              })
              callHistoryObj._id.senderId = callHistoryObj._id.senderId[0];
              callHistoryObj._id.receiverId = callHistoryObj._id.receiverId[0];
              callHistoryObj.lastCallStatus = callHistoryObj.allCallsHistory[0];
            })
            function doB() {
              return new Promise(function (resolve, reject) {
                // setTimeout(() => {
                allCallsHistoryGroupedObj.sort(function (a, b) {
                  // convert date object into number to resolve issue in typescript
                  return new Date(b.lastCallStatus.endTime) - new Date(a.lastCallStatus.endTime);
                })
                resolve(allCallsHistoryGroupedObj);
                // }, 1000);
              })
            }
            async function main() {
              allCallsHistoryGroupedObj = await doB();
              setTimeout(() => {
                res.json({ token: req.headers['x-access-token'], success: 1, data: allCallsHistoryGroupedObj })
              }, 2000)
            }
            main();
            // res.json({ allCallsHistory: allCallsHistoryGroupedObj })
          }
        })
      })
    }
  })
});

var newSchduleNotificationSenderId = cron.schedule('*/3 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))
  let NotficationTime = new Date();
  // console.log("currenttime",currenttime)

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

  let query = { $and: [{ serviceStatus: "scheduled" }, { startTime: { $lte: new Date() } }, { endTime: { $gte: new Date() } }] };
  //let query = { $and: [{ serviceStatus: "scheduled" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  //{ serviceStatus: "scheduled", startTime: { $lte: new Date(NotficationTime) }, endTime: { $lte: new Date(NotficationTime) } }
  serviceTransaction.find(query, (err, TSresult) => {
    //console.log("AAAA TSresult", TSresult.length)

    if (TSresult == null) {

    } else {
      //console.log("BBBBBB TSresult", TSresult.length)
      for (let i = 0; i < TSresult.length; i++) {

        let id1 = TSresult[i].senderId;
        let id3 = TSresult[i].receiverId;
        // This will give difference in milliseconds

        //let slotDuration =TSresult[i].endTime -TSresult[i].startTime;
        //var resultInMinutes = Math.round(slotDuration / 60000);
        //console.log("resultInMinutes",resultInMinutes)

        User.findById(id3, (err, SMSresult) => {
          //console.log("SMSresult",SMSresult)
          //console.log("CCCCC TSresult", TSresult.length)
          User.findById(id1, (err, USresult) => {
      
            if (USresult == null) {

            } else {
              let id2 = USresult.email;

              logins.findOne({ memberId: USresult._id }, (err, LSresult) => {
                if (LSresult == null) {
                } else {
                  //console.log("EEEEE TSresult", TSresult.length)
                  let dToken = LSresult.deviceToken
                  let cdToken = LSresult.callingDeviceToken
                  //console.log("LSresult",LSresult)
                  if (LSresult.osType == "Android") {
                    //console.log("Andriod TSresult", TSresult.length)
                    ///////////////////////////   FCM SENDING MESSAGE  /////////////////////////////////
                    //console.log("1")
                    var message = {
                      to: dToken,
                      collapse_key: 'Service-alerts',

                      data: {
                        serviceType: TSresult[i].serviceType,
                        Schededid: TSresult[i].scheduleId,
                        sTransactionId: TSresult[i]._id,
                        startTime: TSresult[i].startTime,
                        scheduledDuration: TSresult[i].scheduledDuration * 60,
                        endTime: TSresult[i].endTime,
                        senderId: TSresult[i].senderId,
                        r1status: TSresult[i].r1status,
                        r2status: TSresult[i].r2status,
                        //scheduledDuration:schuduledDuration,
                        receiverId: TSresult[i].receiverId,
                        receivername: SMSresult.firstName,
                        receiverimage: SMSresult.avtar_imgPath,
                        liveStatus: SMSresult.liveStatus,
                        sendername: USresult.firstName,
                        senderimage: USresult.avtar_imgPath,
                        notficationTime: NotficationTime,
                        screenLockStatus: false,
                        scheduleCall: true,
                        senderAccepted: false
                      },

                    };

                    fcm.send(message, function (err, response) {
                      //console.log("response comming for andriod in schedule === ", response);
                      if (err) {
                        let myBody = {};
                        let idT = TSresult[i]._id;
                        myBody.fcmmembernotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, (err, r1dresult) => {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                            reqBody = {};
                            //console.log("FFFFF TSresult", TSresult.length)
                            //Update service status
                            let myBody = {};
                            myBody.serviceStatus = "membercalling";
                            myBody.fcmmembernotification = "FCM Alert Sent-Member";
                            serviceTransaction.findByIdAndUpdate(TSresult[i]._id, myBody, (err, ssresult) => {
                              //console.log("GGGGGGG TSresult", TSresult.length)
                              if (err) {
                                res.json({
                                  error: "User Not Exists / Send a valid UserID"
                                });
                              } else {


                              }
                            });

                          }
                        });
                      } else {
                        reqBody = {};
                        //console.log("HHHHH TSresult", TSresult.length)
                        //Update service status
                        let myBody = {};
                        myBody.serviceStatus = "membercalling";
                        myBody.fcmmembernotification = "FCM Alert Sent-Member";
                        serviceTransaction.findByIdAndUpdate(TSresult[i]._id, myBody, (err, ssresult) => {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {


                          }
                        });
                        //console.log("response",response)

                      }
                    });
                  }
                  else if (LSresult.osType == "IOS") {
                    console.log("Schedule VOIP Notification for IOS")

                    // voip notification
                    var notification = new apn.Notification();
                    notification.topic = 'com.CelebKonect.voip';
                    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
                    notification.badge = 1;
                    notification.sound = 'noti.aiff';
                    notification.contentAvailable = 1;
                    notification.mutableContent = 1;
                    // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
                    notification.alert = { body: "Voip:" + TSresult[i].serviceType + " With " + SMSresult.firstName + " " + SMSresult.lastName, title: "Service Alert", sTransactionId: TSresult[i]._id };
                    notification.payload = {
                      serviceType: TSresult[i].serviceType,
                      Schededid: TSresult[i].scheduleId,
                      sTransactionId: TSresult[i]._id,
                      startTime: TSresult[i].startTime,
                      endTime: TSresult[i].endTime,
                      senderId: TSresult[i].senderId,
                      scheduledDuration: TSresult[i].scheduledDuration * 60,
                      r1status: TSresult[i].r1status,
                      r2status: TSresult[i].r2status,
                      receiverId: TSresult[i].receiverId,
                      receivername: SMSresult.firstName,
                      receiverimage: SMSresult.avtar_imgPath,
                      liveStatus: SMSresult.liveStatus,
                      sendername: USresult.firstName,
                      senderimage: USresult.avtar_imgPath,
                      notficationTime: NotficationTime,
                      screenLockStatus: false,
                      scheduleCall: true,
                      senderAccepted: false
                    };
                    // Display the following message (the actual notification text, supports emoji)

                    // Actually send the notification
                    apnProvider.send(notification, cdToken).then(function (result) {
                      console.log("result", result)
                      // Check the result for any failed devices
                      reqBody = {};

                      //Update service status
                      let myBody = {};
                      myBody.serviceStatus = "membercalling";
                      myBody.fcmmembernotification = "FCM Alert Sent-Member";
                      serviceTransaction.findByIdAndUpdate(TSresult[i]._id, myBody,(err, ssresult)=> {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {


                        }
                      });
                    });
                  };
                }
              });
            }
          });
        });

      }
    }
  });

}, false);

newSchduleNotificationSenderId.start();



////////////////////////CELEBRITY  ALERTS //////////////////////////////////////////////////////////////

var newSchduleNotificationReciverid = cron.schedule('*/3 * * * * *', function () {
  let NotficationTime = new Date();
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))
  //console.log("currenttimeceleb",currenttime)

  var jobendtime = new Date(parsedDate.getTime() + (1000 * 60))
  serviceTransaction.find({ serviceStatus: "memberAccepted" },(err, TCresult)=> {
    // console.log("testCeleb",TCresult);
    if (TCresult == null) {
    } else {
      for (let i = 0; i < TCresult.length; i++) {
        let id1 = TCresult[i].receiverId;
        let id3 = TCresult[i].senderId;
        let slotDuration = TCresult[i].endTime - TCresult[i].startTime;
        reqBody = {};

        User.findById(id3,(err, SMCresult)=> {

          User.findById(id1,(err, UCresult)=> {
            if (UCresult == null) {
            } else {
              let id2 = UCresult.email;
              // console.log("id2",id2)
              logins.findOne({ memberId: UCresult._id },(err, LCresult)=> {
                // console.log("LCresult",LCresult)
                if (LCresult == null) {

                } else {
                  let dToken = LCresult.deviceToken;
                  let cdToken = LCresult.callingDeviceToken;
                  if (LCresult.osType == "Android") {
                    //console.log("celeb alert")
                    var message = {
                      to: dToken,
                      collapse_key: 'Service-alerts',
                      data: {
                        serviceType: TCresult[i].serviceType,
                        scheduleId: TCresult[i].scheduleId,
                        sTransactionId: TCresult[i]._id,
                        startTime: TCresult[i].startTime,
                        //slotDuration: slotDuration,
                        endTime: TCresult[i].endTime,
                        senderId: TCresult[i].senderId,
                        receiverId: TCresult[i].receiverId,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status,
                        sendername: SMCresult.firstName,
                        senderimage: SMCresult.avtar_imgPath,
                        liveStatus: SMCresult.liveStatus,
                        receivername: UCresult.firstName,
                        receiverimage: UCresult.avtar_imgPath,
                        scheduledDuration: TCresult[i].scheduledDuration * 60,
                        notficationTime: NotficationTime,
                        screenLockStatus: false,
                        scheduleCall: true,
                        senderAccepted: true
                      },

                    };
                   // console.log("celeb", message);
                    fcm.send(message, function (err, response) {
                      if (err) {

                      } else {
                        let myBody = {};
                        let idT = TCresult[i]._id;
                        myBody.fcmcelebnotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody,(err, r1dresult)=> {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                            console.log("response", response);
                          }
                        });
                        console.log("response", response);
                      }
                    });


                  }

                  else if (LCresult.osType == "IOS") {
                    //console.log("IOS")
                    ///ios devices
                    var notification = new apn.Notification();
                    notification.topic = 'com.CelebKonect.voip';
                    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
                    notification.badge = 1;
                    notification.sound = 'noti.aiff';
                    notification.contentAvailable = 1;
                    notification.mutableContent = 1;

                    // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
                    sType = TCresult[i].serviceType;
                    notification.alert = { body: sType + " With " + SMCresult.firstName + " " + SMCresult.lastName, title: "Service Alert" };
                    notification.payload = {
                      serviceType: TCresult[i].serviceType,
                      Schededid: TCresult[i].scheduleId,
                      sTransactionId: TCresult[i]._id,
                      startTime: TCresult[i].startTime,
                      r1status: TCresult[i].r1status,
                      r2status: TCresult[i].r2status,
                      slotDuration: slotDuration,
                      endTime: TCresult[i].endTime,
                      scheduledDuration: TCresult[i].scheduledDuration * 60,
                      senderId: TCresult[i].senderId,
                      receiverId: TCresult[i].receiverId,
                      r1status: TCresult[i].r1status,
                      r2status: TCresult[i].r2status,
                      receivername: SMCresult.firstName,
                      receiverimage: SMCresult.avtar_imgPath,
                      liveStatus: SMCresult.liveStatus,
                      sendername: UCresult.firstName,
                      senderimage: UCresult.avtar_imgPath,
                      notficationTime: NotficationTime,
                      screenLockStatus: false,
                      scheduleCall: true,
                      senderAccepted: true
                    };
                    // Display the following message (the actual notification text, supports emoji)

                    // Actually send the notification
                    apnProvider.send(notification, cdToken).then(function (result) {
                      console.log("result",result)

                    });
                  };
                }
              });
            }
          });
        });

      }

    }
  });

}, false);

newSchduleNotificationReciverid.start();


// get total calls
// router.get("/getCallReport", function (req, res) {

//   //let id = req.params.userID;
//   serviceTransaction.aggregate([

//     {
//       $match: {
//         startTime: { $ne: "endTime" }
//       }
//     },
//     {
//       $lookup:
//       {
//         from: 'users',
//         localField: 'receiverId',
//         foreignField: '_id',
//         as: 'receiverDetails'
//       }
//     },
//     {
//       "$group": {
//         "_id": {
//           "serviceType": "$serviceType",
//           "receiverId": "$receiverId",
//           "receiverDetails": "$receiverDetails"
//         },
//         "count": { "$sum": 1 }
//       }
//     },


//   ]).exec(function (error, fetchAllTopUsers) {
//     //console.log('##################');
//     console.log(fetchAllTopUsers);
//     res.send(fetchAllTopUsers);
//   });
// })
// End get total calls

//@desc get missed call count based on member Id (using throught socket)
//@method GET
//@access public 
router.get('/getMissedCallCount/:member_Id', ServiceTransactionController.getMissedCallCount);

// router.get("/getAll/:pageNo/:limit", ServiceTransactionController.getAll)

module.exports = router;
