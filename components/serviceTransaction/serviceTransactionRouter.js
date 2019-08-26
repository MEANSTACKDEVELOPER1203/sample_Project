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
let liveTimeLog = require("../liveTimeLog/liveTimeLogModel");
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


let notification = new apn.Notification();
notification.expiry = Math.floor(Date.now() / 1000) + 24 * 3600; // will expire in 24 hours from now
notification.badge = 2;
notification.sound = "ping.aiff";
notification.alert = "Hello from solarianprogrammer.com";
notification.payload = { 'messageFrom': 'Solarian Programmer' };

// Replace this with your app bundle ID:
notification.topic = "com.CelebKonect";

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



//update celeb status afetr diconnected socket
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
      //console.log("userupdatedObj=============================", userupdatedObj);
      serviceTransaction.find({ receiverId: ObjectId(req.body.receiverId) }, (err, lastCelebServTransObj) => {
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
                //console.log(celebTransactionUpdatedObj)
                return res.status(200).json({ message: "Celeb status updated success fully ", success: 1 })
              }
            })
          }

        }
      }).sort({ createdAt: -1 }).limit(1)
    }
  })

});



// Create a Schedule Start //
// Create a Schedule Start //
router.post("/createServiceTransaction", function (req, res) {
  console.log("***********************HI**********************************************")
  console.log(req.body);
  console.log("*************************HELLO********************************************")
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
  console.log(" Screen lock status 222222222 =========", screenLockStatus)





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
                                //console.log(serviceTransactionRecord);
                                //res.json({ message: "serviceTransaction saved sucessfully" });
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
                                                    notification = {
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
                                                      duration: 2
                                                    }
                                                    otpService.sendIOSPushNotification(celebDeviceObj.deviceToken, notification, (err, successNotificationObj) => {
                                                      if (err)
                                                        console.log(err)
                                                      else {
                                                        console.log(successNotificationObj)
                                                      }
                                                    })
                                                  }
                                                }
                                                //Send VoIP(vice over IP) notiication only for IOS (related app minimize)
                                                if (screenLockStatus == true) {
                                                  let note = new apn.Notification();
                                                  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
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
                                                    duration: 2
                                                  };
                                                  note.topic = "com.CelebKonect.voip";
                                                  apnProvider.send(note, celebDeviceObj.callingDeviceToken).then(result => {
                                                    // Show the result of the send operation:
                                                    console.log("ZZZZZZZZZZZZZZZZZZz", result);
                                                    //console.log(result.failed[0].response);
                                                  });
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
                                            // res.json({
                                            //   success: 1,
                                            //   message: "Existing slots",
                                            //   token: req.headers['x-access-token'],
                                            //   data: tresult
                                            // });
                                          } else if (result1.length == 0) {
                                            // console.log("without Schedule created pls Check call ");
                                            let celebCallStatus = "false";
                                            if (req.body.serviceStatus == "celebLifted" || req.body.serviceStatus == "membercalling")
                                              celebCallStatus = "true"
                                            //console.log(celebCallStatus);
                                            //console.log("1")
                                            User.findByIdAndUpdate(ObjectId(receiverId), { $set: { callStatus: celebCallStatus } }, (err, celebCallStatesUpdatedObj) => {
                                              if (err)
                                                console.log("***** Error while update celeb call status when celeblifted or membercalling *****", err)
                                              else {
                                                serviceTransaction.serviceTransaction(serviceTransactionRecord, function (err, transaction) {

                                                  if (err) {
                                                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                  } else {
                                                    // console.log("*********************Sencond by rohit response*************************")
                                                    // console.log(transaction);
                                                    // console.log("*********************Sencond by rohit response*************************")
                                                    //let transactionForNotification = JSON.parse(transaction)
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
                                                        notification = {
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
                                                          duration: 2
                                                        }
                                                        otpService.sendIOSPushNotification(celebDeviceObj.deviceToken, notification, (err, successNotificationObj) => {
                                                          if (err)
                                                            console.log(err)
                                                          else {
                                                            console.log(successNotificationObj)
                                                          }
                                                        })
                                                      }
                                                    }
                                                    //Send VoIP(vice over IP) notiication only for IOS (related app minimize)
                                                    if (screenLockStatus == true) {
                                                      let note = new apn.Notification();
                                                      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
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
                                                        duration: 2
                                                      };
                                                      note.topic = "com.CelebKonect.voip";
                                                      apnProvider.send(note, celebDeviceObj.callingDeviceToken).then(result => {
                                                        // Show the result of the send operation:
                                                        console.log("ZZZZZZZZZZZZZZZZZZz", result);
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
//End Create a Schedule//

// Edit a Schedule start

router.put("/serviceTransaction/:id", function (req, res) {
  let reqbody = req.body;
  // console.log("**************************************************")
  // console.log(reqbody);
  // console.log("**************************************************")
  if (reqbody.serviceStatus == "celebLifted" || reqbody.serviceStatus == "celebdisconnected" || reqbody.serviceStatus == "memberDisconnected") {
    // console.log("*************************************")
    reqbody.startTime = Date.now();
    reqbody.endTime = reqbody.startTime;
    reqbody.updatedAt = reqbody.startTime;
  }
  else {
    reqbody.endTime = Date.now();
    reqbody.updatedAt = reqbody.endTime;
  }


  //console.log(req.params.id)
  //console.log(req.body)
  serviceTransaction.findOneAndUpdate({ _id: req.params.id }, reqbody, { new: true }, (err, sTresult) => {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    } else {
      if (reqbody.serviceStatus == "celebRejected" || reqbody.serviceStatus == "celebdisconnected") {
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
                    let title = ck_call_messages.sendResponseMessage(celebDetailsObj, reqbody.callRemarks, reqbody.reason, reqbody.celebLifted).title;
                    let body = ck_call_messages.sendResponseMessage(celebDetailsObj, reqbody.callRemarks, reqbody.reason, reqbody.celebLifted).body
                    message = {
                      to: userDeviceInfoObj.deviceToken,
                      collapse_key: 'Service-alerts',
                      data: {
                        serviceType: "Call",
                        title: title,
                        body: body
                        //memberId: senderId,
                        //isCeleb: req.body.isCeleb,
                        //senderFirstName: req.body.senderFirstName,
                        //senderLastName: req.body.senderLastName,
                        //senderAvatar: req.body.senderAvatar
                      },
                      notification: {
                        serviceType: "Call",
                        title: title,
                        body: body,
                        //memberId: senderId,
                        // isCeleb: req.body.isCeleb,
                        // senderFirstName: req.body.senderFirstName,
                        // senderLastName: req.body.senderLastName,
                        // senderAvatar: req.body.senderAvatar

                      }
                    }
                    console.log(message)
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
                          // status: "active"
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
                });
              }
            });
          }
        });
      }
      res.json({
        message: "serviceTransaction Updated Successfully",
        data: sTresult
      });
      // service_type = sTresult.serviceType;
      // senderId = sTresult.senderId;
      // receiverId = sTresult.receiverId;
      // startTime = sTresult.startTime;

      // let query = {
      //   $and: [{ service_type: service_type }, { senderId: senderId }, { receiverId: receiverId }]
      // };

      serviceSchedule.findById(sTresult.scheduleId, function (err, sResult) {
        if (err) return console.log(err);
        //console.log("Pa1", sResult);
        //id = sTresult.scheduleId;
        let reqbody = {};

        reqbody.scheduleId = sResult._id;
        //console.log("Pav",sResult[0]._id)

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
            //console.log(sR);
            // let reqbody = {};

            // reqbody.startTime = sR.endTime;

          });

        });

      });


    }
  });
});
// End Edit a Schedule

// Find by findByServiceTransactionId start

router.get("/findByServiceTransactionId/:Id", function (req, res) {
  let id = req.params.Id;

  serviceTransaction.getServiceTransactionById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "serviceTransaction Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by findByServiceTransactionId

// get Transaction jobs by status start

router.post("/getTransactionJobsByStatus", function (req, res) {
  let serviceStatus = req.body.serviceStatus;
  let serviceStatus1 = req.body.serviceStatus1;
  if (serviceStatus && serviceStatus1) {
    let query = { $or: [{ serviceStatus: serviceStatus }, { serviceStatus: serviceStatus1 }] };
    serviceTransaction.find(query, function (err, result) {
      if (result) {
        res.send(result);
      } else {
        res.json({
          error: "ServiceTransaction status Not Exists / Send a valid Status"
        });
      }
    });
  } else if (serviceStatus) {
    serviceTransaction.find({ serviceStatus: serviceStatus }, function (err, result) {
      if (result) {
        res.send(result);
      } else {
        res.json({
          error: "ServiceTransaction status Not Exists / Send a valid Status"
        });
      }
    });

  }

});
// End get Transaction jobs by status


/////////////////////////////////////////////SERVICE ALERTS - STARTS/////////////////////////////////////////////////


////////////////////////MEMEBER  ALERTS /////////////////////////////////////////////////////////////////
var newSchduleNotificationSenderId = cron.schedule('*/10 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

  let query = { $and: [{ serviceStatus: "scheduled" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, TSresult) {

    if (TSresult == null) {

    } else {

      for (let i = 0; i < TSresult.length; i++) {

        let id1 = TSresult[i].senderId;
        let id3 = TSresult[i].receiverId;

        User.findById(id3, function (err, SMSresult) {

          User.findById(id1, function (err, USresult) {
            if ((USresult.liveStatus == "onChat") || (USresult.liveStatus == "onAudioCall") || (USresult.liveStatus == "onVideoCall")) {
              console.log("1:User already in another call");
            }
            else {

              if (USresult == null) {

              } else {
                let id2 = USresult.email;

                logins.findOne({ email: id2 }, function (err, LSresult) {
                  if (LSresult == null) {
                  } else {
                    let dToken = LSresult.deviceToken
                    let cdToken = LSresult.callingDeviceToken

                    ////////////// IOS VOIP MESSAGE////////////////////////////////////////////////////////////////

                    // Get Device Token of sender/reciver
                    var deviceToken = LSresult.callingDeviceToken
                    if (LSresult.callingDeviceToken == null) {
                      let myBody = {};
                      let idT = TSresult[i]._id;
                      myBody.fcmmembernotification = "DeviceToken Missing";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                        if (err) {
                          res.json({
                            error: "DeviceToken Missing"
                          });
                        } else {

                        }
                      });

                    }

                    else {


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
                        r1status: TSresult[i].r1status,
                        r2status: TSresult[i].r2status,
                        receiverId: TSresult[i].receiverId,
                      };
                      // Display the following message (the actual notification text, supports emoji)

                      // Actually send the notification
                      apnProvider.send(notification, deviceToken).then(function (result) {
                        // Check the result for any failed devices
                      });
                    };


                    ///////////////////////////   FCM SENDING MESSAGE  /////////////////////////////////
                    var message = {
                      to: dToken,
                      collapse_key: 'Service-alerts',
                      notification: {
                        title: 'Service Alert',
                        body: TSresult[i].serviceType + " With " + SMSresult.firstName + " " + SMSresult.lastName,
                      },

                      data: {
                        serviceType: TSresult[i].serviceType,
                        Schededid: TSresult[i].scheduleId,
                        sTransactionId: TSresult[i]._id,
                        startTime: TSresult[i].startTime,
                        endTime: TSresult[i].endTime,
                        senderId: TSresult[i].senderId,
                        r1status: TSresult[i].r1status,
                        r2status: TSresult[i].r2status,
                        receiverId: TSresult[i].receiverId,
                      },

                    };
                    fcm.send(message, function (err, response) {

                      if (err) {
                        let myBody = {};
                        let idT = TSresult[i]._id;
                        myBody.fcmmembernotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {


                          }
                        });
                      } else {


                      }
                    });

                    reqBody = {};
                    if (TSresult[i].serviceType == "audio") {

                      reqBody.liveStatus = "onAudioCall";
                      reqBody.liveStatusDate = new Date();
                      User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                        if (err) return res.send(err);
                      });
                    }
                    else if (TSresult[i].serviceType == "video") {
                      reqBody.liveStatusDate = new Date();
                      reqBody.liveStatus = "onVideoCall";
                      //console.log(reqBody)
                      User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                        if (err) return res.send(err);
                        //console.log(Lresult)
                      });
                    }
                    else if (TSresult[i].serviceType == "chat") {
                      reqBody.liveStatusDate = new Date();
                      reqBody.liveStatus = "onChat";
                      User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                        if (err) return res.send(err);
                      });
                    }
                    //Update service status
                    let myBody = {};
                    myBody.serviceStatus = "membercalling";
                    myBody.fcmmembernotification = "FCM Alert Sent-Member";
                    serviceTransaction.findByIdAndUpdate(TSresult[i]._id, myBody, function (err, ssresult) {
                      if (err) {
                        res.json({
                          error: "User Not Exists / Send a valid UserID"
                        });
                      } else {


                      }
                    });

                  }
                });
              }

            }

          });
        });

      }
    }
  });

}, false);

//newSchduleNotificationSenderId.start();



////////////////////////CELEBRITY  ALERTS //////////////////////////////////////////////////////////////

var newSchduleNotificationReciverid = cron.schedule('*/10 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))

  var jobendtime = new Date(parsedDate.getTime() + (1000 * 60))
  serviceTransaction.find({ serviceStatus: "memberAccepted" }, function (err, TCresult) {
    if (TCresult == null) {
    } else {
      for (let i = 0; i < TCresult.length; i++) {
        let id1 = TCresult[i].receiverId;
        let id3 = TCresult[i].senderId;
        reqBody = {};


        User.findById(id3, function (err, SMCresult) {

          User.findById(id1, function (err, UCresult) {

            if ((UCresult.liveStatus == "onChat") || (UCresult.liveStatus == "onAudioCall") || (UCresult.liveStatus == "onVideoCall")) {
              console.log("2:User already in another call")
            }
            else {

              if (UCresult == null) {
              } else {
                let id2 = UCresult.email;
                logins.findOne({ email: id2 }, function (err, LCresult) {
                  if (LCresult == null) {
                  } else {
                    let dToken = LCresult.deviceToken

                    var message = {
                      to: dToken,
                      collapse_key: 'Service-alerts',

                      notification: {
                        title: 'Service Alert',
                        body: TCresult[i].serviceType + " With " + SMCresult.firstName + " " + SMCresult.lastName,
                      },

                      data: {
                        serviceType: TCresult[i].serviceType,
                        Schededid: TCresult[i].scheduleId,
                        sTransactionId: TCresult[i]._id,
                        startTime: TCresult[i].startTime,
                        endTime: TCresult[i].endTime,
                        senderId: TCresult[i].senderId,
                        receiverId: TCresult[i].receiverId,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status
                      },

                    };

                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = TCresult[i]._id;
                        myBody.fcmcelebnotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {

                          }
                        });
                      } else {

                        //iOS App VOIP Notification
                        // Get Device Token of sender/reciver
                        var deviceToken = LCresult.callingDeviceToken
                        if (LCresult.callingDeviceToken == null) {
                          let myBody = {};
                          let idT = TCresult[i]._id;
                          myBody.fcmcelebnotification = "DeviceToken Missing";
                          serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {

                            if (err) {
                              res.json({
                                error: "DeviceToken Missing"
                              });

                            } else {
                            }
                          });

                        }

                        else {

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
                            endTime: TCresult[i].endTime,
                            senderId: TCresult[i].senderId,
                            receiverId: TCresult[i].receiverId,
                            r1status: TCresult[i].r1status,
                            r2status: TCresult[i].r2status
                          };
                          // Display the following message (the actual notification text, supports emoji)

                          // Actually send the notification
                          apnProvider.send(notification, deviceToken).then(function (result) {

                            // Check the result for any failed devices

                          });
                        };

                        //console.log("2:")
                        reqBody = {};
                        if (TCresult[i].serviceType == "audio") {

                          reqBody.liveStatus = "onAudioCall";
                          reqBody.liveStatusDate = new Date();

                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });

                        }
                        else if (TCresult[i].serviceType == "video") {
                          reqBody.liveStatus = "onVideoCall";
                          reqBody.liveStatusDate = new Date();
                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });

                        }
                        else if (TCresult[i].serviceType == "chat") {
                          reqBody.liveStatus = "onChat";
                          reqBody.liveStatusDate = new Date();
                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });
                        }


                        // FCM Sending 
                        let myBody = {};
                        let idT = TCresult[i]._id;
                        myBody.serviceStatus = "celebritycalling";
                        myBody.fcmcelebnotification = "FCM Alert Sent-Celebrity";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {


                          }
                        });
                        //call Service transaction status update to set r1status = 1

                      }
                    });

                  }
                });
              }
            }
          });
        });

      }

    }
  });

}, false);

//newSchduleNotificationReciverid.start();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////// CELEB CONNECTION ERROR PROCESS ///////////////////////////////////////////////////

var processcelebconnectionerrors = cron.schedule('*/90 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 60))
  var jobendtime = new Date(parsedDate.getTime())

  let query = { $and: [{ serviceStatus: "celebritycalling" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, TSresult) {

    if (TSresult == null) {

    } else {

      for (let i = 0; i < TSresult.length; i++) {

        //Update service status
        let myBody = {};
        //console.log("Updating Schedule status ", TSresult[i]._id)

        // for chat notification 
        if (serviceType == "chat") {
          myBody.serviceStatus = "completed";
          myBody.r1status = "active";
          //myBody.fcmcelebnotification = "Moving schedule to re-try ";
          serviceTransaction.findByIdAndUpdate(TSresult[i]._id, myBody, function (err, ssresult) {
            if (err) {
              res.json({
                error: "User Not Exists / Send a valid UserID"
              });
            } else {
            }
          });
          // res.json({
          //   error: "User is offline"
          // });
        }
        else {
          myBody.serviceStatus = "celebNotResponded";
          myBody.r1status = "active";
          myBody.fcmcelebnotification = "Moving schedule to re-try ";
          serviceTransaction.findByIdAndUpdate(TSresult[i]._id, myBody, function (err, ssresult) {
            if (err) {
              res.json({
                error: "User Not Exists / Send a valid UserID"
              });
            } else {
            }
          });
        }
      }
    }

  });
}, false);

processcelebconnectionerrors.start();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////// RETRY - SERVICE ALERTS - STARTS //////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////// RETRY - SERVICE ALERTS - STARTS //////////////////////////////////////

var celebnotrespondedretry1 = cron.schedule('*/30 * * * * *', function () {


  let query = { $and: [{ serviceStatus: "celebNotResponded" }, { r1status: "active" }] };

  serviceTransaction.find(query, function (err, TCresult) {

    if (TCresult == null) {

    } else {

      for (let i = 0; i < TCresult.length; i++) {
        let id1 = TCresult[i].receiverId;
        let id3 = TCresult[i].senderId;

        User.findById(id3, function (err, SMCresult) {

          User.findById(id1, function (err, UCresult) {


            if (UCresult == null) {

            }
            else {
              if ((UCresult.liveStatus == "onChat") || (UCresult.liveStatus == "onAudioCall") || (UCresult.liveStatus == "onVideoCall")) {
                console.log("3:User already in another call")
              }
              else {
                let id2 = UCresult.email;
                logins.findOne({ email: id2 }, function (err, LCresult) {

                  if (LCresult == null) {
                  } else {

                    //iOS App VOIP Notification
                    var deviceToken = LCresult.callingDeviceToken

                    if (LCresult.callingDeviceToken == null) {
                      let myBody = {};
                      let idT = TCresult[i]._id;
                      myBody.fcmcelebnotification = "DeviceToken Missing";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {

                        if (err) {
                          res.json({
                            error: "DeviceToken Missing"
                          });

                        } else {
                          //console.log("Voip1",r1dresult)
                        }
                      });
                    }

                    else {

                      /////////////////////////////// Send VOIP Notification ////////////////////////////////////

                      var notification = new apn.Notification();
                      notification.topic = 'com.CelebKonect.voip';
                      notification.expiry = Math.floor(Date.now() / 1000) + 3600;
                      notification.badge = 1;
                      notification.sound = 'noti.aiff';
                      notification.contentAvailable = 1;
                      notification.mutableContent = 1;

                      // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
                      sType = TCresult[i].serviceType;
                      notification.alert = { body: "Retry-1 " + sType + " With " + SMCresult.firstName + " " + SMCresult.lastName, title: "Service Alert" };
                      notification.payload = {
                        serviceType: TCresult[i].serviceType,
                        Schededid: TCresult[i].scheduleId,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status,
                        sTransactionId: TCresult[i]._id,
                        startTime: TCresult[i].startTime,
                        endTime: TCresult[i].endTime,
                        senderId: TCresult[i].senderId,
                        receiverId: TCresult[i].receiverId,
                      };
                      // Display the following message (the actual notification text, supports emoji)

                      // Actually send the notification
                      apnProvider.send(notification, deviceToken).then(function (result) {
                      });
                    };


                    ////////////////////FCM Notification send////////////////////////////////////////////////////////// 
                    let dToken = LCresult.deviceToken
                    //if( TCresult[i].r1status=="inactive"){
                    var message = {
                      to: dToken,
                      collapse_key: 'Service-alerts',

                      notification: {
                        title: 'Service Alert',
                        body: TCresult[i].serviceType + " With " + SMCresult.firstName + " " + SMCresult.lastName,
                      },

                      data: {
                        serviceType: TCresult[i].serviceType,
                        Schededid: TCresult[i].scheduleId,
                        sTransactionId: TCresult[i]._id,
                        startTime: TCresult[i].startTime,
                        endTime: TCresult[i].endTime,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status,
                        senderId: TCresult[i].senderId,
                        receiverId: TCresult[i].receiverId,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status
                      },

                    };

                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = TCresult[i]._id;
                        myBody.fcmcelebnotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {



                          }
                        });
                      } else {

                      }
                    });

                    //////////////////// Update Schedule Status ///////////////////////////////
                    let myBody = {};
                    let idT = TCresult[i]._id;
                    // console.log("Re-Try Cycle 1 for : ", TCresult[i]._id)
                    myBody.serviceStatus = "celebritycalling";
                    myBody.fcmcelebnotification = "FCM Alert Sent-Celebrity - Retry 1";
                    serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                      if (err) {
                        res.json({
                          error: "User Not Exists / Send a valid UserID"
                        });
                      } else {
                        //  console.log("1",cssresult);
                        reqBody = {};
                        if (TCresult[i].serviceType == "audio") {

                          reqBody.liveStatus = "onAudioCall";
                          reqBody.liveStatusDate = new Date();

                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });

                        }
                        else if (TCresult[i].serviceType == "video") {
                          reqBody.liveStatus = "onVideoCall";
                          reqBody.liveStatusDate = new Date();
                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });

                        }
                        else if (TCresult[i].serviceType == "chat") {
                          reqBody.liveStatus = "onChat";
                          reqBody.liveStatusDate = new Date();
                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });
                        }
                      }
                    });

                  }

                });

              }
            }//check status
          });
        });

      }

    }
  });

}, false);

celebnotrespondedretry1.start();



//////////////////////////////////////////////RETRY - 2 ///////////////////////////////////////////////////////////

var celebnotrespondedretry2 = cron.schedule('*/90 * * * * *', function () {


  //let query = { r2status: "active" }; 
  let query = { $and: [{ serviceStatus: "celebNotResponded" }, { r2status: "active" }] };
  serviceTransaction.find(query, function (err, TCresult) {

    if (TCresult == null) {

    } else {
      //if(TCresult.r2status ="inactive") {
      for (let i = 0; i < TCresult.length; i++) {
        let id1 = TCresult[i].receiverId;
        let id3 = TCresult[i].senderId;

        User.findById(id3, function (err, SMCresult) {

          User.findById(id1, function (err, UCresult) {

            if (UCresult == null) {

            }
            else {
              if ((UCresult.liveStatus == "onChat") || (UCresult.liveStatus == "onAudioCall") || (UCresult.liveStatus == "onVideoCall")) {
                console.log("4:User already in another call")
              }
              else {
                let id2 = UCresult.email;
                logins.findOne({ email: id2 }, function (err, LCresult) {

                  if (LCresult == null) {
                  } else {

                    //iOS App VOIP Notification
                    var deviceToken = LCresult.callingDeviceToken

                    if (LCresult.callingDeviceToken == null) {
                      let myBody = {};
                      let idT = TCresult[i]._id;
                      myBody.fcmcelebnotification = "DeviceToken Missing";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {

                        if (err) {
                          res.json({
                            error: "DeviceToken Missing"
                          });

                        } else {
                          //console.log("Voip1",r1dresult)
                        }
                      });
                    }

                    else {

                      /////////////////////////////// Send VOIP Notification ////////////////////////////////////

                      var notification = new apn.Notification();
                      notification.topic = 'com.CelebKonect.voip';
                      notification.expiry = Math.floor(Date.now() / 1000) + 3600;
                      notification.badge = 1;
                      notification.sound = 'noti.aiff';
                      notification.contentAvailable = 1;
                      notification.mutableContent = 1;

                      // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
                      sType = TCresult[i].serviceType;
                      notification.alert = { body: "Retry-2 " + sType + " With " + SMCresult.firstName + " " + SMCresult.lastName, title: "Service Alert" };
                      notification.payload = {
                        serviceType: TCresult[i].serviceType,
                        Schededid: TCresult[i].scheduleId,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status,
                        sTransactionId: TCresult[i]._id,
                        startTime: TCresult[i].startTime,
                        endTime: TCresult[i].endTime,
                        senderId: TCresult[i].senderId,
                        receiverId: TCresult[i].receiverId,
                      };
                      // Display the following message (the actual notification text, supports emoji)

                      // Actually send the notification
                      apnProvider.send(notification, deviceToken).then(function (result) {
                      });
                    };


                    ////////////////////FCM Notification send////////////////////////////////////////////////////////// 
                    let dToken = LCresult.deviceToken
                    //if( TCresult[i].r1status=="inactive"){
                    var message = {
                      to: dToken,
                      collapse_key: 'Service-alerts',

                      notification: {
                        title: 'Service Alert',
                        body: TCresult[i].serviceType + " With " + SMCresult.firstName + " " + SMCresult.lastName,
                      },

                      data: {
                        serviceType: TCresult[i].serviceType,
                        Schededid: TCresult[i].scheduleId,
                        sTransactionId: TCresult[i]._id,
                        startTime: TCresult[i].startTime,
                        endTime: TCresult[i].endTime,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status,
                        senderId: TCresult[i].senderId,
                        receiverId: TCresult[i].receiverId,
                        r1status: TCresult[i].r1status,
                        r2status: TCresult[i].r2status
                      },

                    };

                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = TCresult[i]._id;
                        myBody.fcmcelebnotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {


                            //   console.log("hello:",r1dresult)
                          }
                        });
                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: TCresult[i].receiverId,
                          notificationType: "Service",
                          activity: "MISSEDCALL",
                          title: "Missed call with " + SMCresult.firstName + " " + SMCresult.lastName,
                          body: "This is to notify that you that have missed a call from " + SMCresult.firstName + " " + SMCresult.lastName,
                          status: "active",
                          notificationFrom: SMCresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {

                          }
                        });
                        // End of Inset Notification
                        reqBody = {};
                        if (TCresult[i].serviceType == "audio") {
                          reqBody.liveStatusDate = new Date();
                          reqBody.liveStatus = "onAudioCall";

                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });

                        }
                        else if (TCresult[i].serviceType == "video") {
                          reqBody.liveStatus = "onVideoCall";
                          reqBody.liveStatusDate = new Date();
                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });

                        }
                        else if (TCresult[i].serviceType == "chat") {
                          reqBody.liveStatus = "onChat";
                          reqBody.liveStatusDate = new Date();
                          User.findByIdAndUpdate(id1, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });
                        }
                      }
                    });

                    //////////////////// Update Schedule Status ///////////////////////////////
                    let myBody = {};
                    let idT = TCresult[i]._id;
                    //console.log("Re-Try Cycle 2 for : ", TCresult[i]._id)
                    myBody.serviceStatus = "celebritycalling";
                    myBody.fcmcelebnotification = "FCM Alert Sent-Celebrity - Retry 2";
                    serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                      if (err) {
                        res.json({
                          error: "User Not Exists / Send a valid UserID"
                        });
                      } else {

                      }
                    });


                  }

                });

              }
            }
          });
        });

        // }
      }
    }
  });

}, false);

celebnotrespondedretry2.start();

////////////////////////////////////////RE-TRY IF LEFT IN CELEB CALLING ///////////////////////////////////////////

/////////////////////////////////////////////SERVICE ALERTS - ENDS///////////////////////////////////////////////////



/////////////////////////////////////////////REJECT NOTIFICATIONS - STARTS/////////////////////////////////////////////////

////////////////////////  NOTIFY MEMBER ON CELEB REJECT ////////////////////////////////////////////////////////////

var notifymemberoncelebreject = cron.schedule('*/10 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

  let query = { $and: [{ serviceStatus: "celebRejected" }, { chatStatus: "inactive" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].senderId;

        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notification',

                    notification: {
                      title: 'Notification',
                      body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled, Credits debited from your account will be credited back to you shortly. Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                      receiverId: Tresult[i].receiverId,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {

                    } else {
                      //////////////////// Update Schedule Status ///////////////////////////////
                      let myBody = {};
                      let idT = Tresult[i]._id;
                      //console.log("Re-Try Cycle 2 for : ", TCresult[i]._id)
                      myBody.chatStatus = "active";
                      //myBody.fcmcelebnotification = "FCM Alert sent for Celebrity Rejection for Member";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                        if (err) {
                        } else {

                        }
                      });
                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].senderId,
                        activity: "REJECTCALLCELEBRITY",
                        notificationType: "Service",
                        title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                        body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled, Credits debited from your account will be credited back to you shortly. Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {

                          // Fetch Schedule Info to get Credit value & Revert back Credit Balance
                          let schId = Tresult[i].scheduleId;
                          serviceSchedule.findById(schId, function (err, schResult) {
                            Credits.find(
                              { memberId: Tresult[i].senderId },
                              null,
                              { sort: { createdAt: -1 } },
                              function (err, cBal) {
                                if (err) return res.send(err);
                                if (cBal) {
                                  cBalObj = cBal[0];

                                  oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);

                                  newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) + parseInt(schResult.credits);

                                  let newCredits = new Credits({
                                    memberId: schResult.senderId,
                                    creditType: credit,
                                    creditValue: schResult.creditValue,
                                    cumulativeCreditValue: newCumulativeCreditValue,
                                    referralCreditValue: newReferralCreditValue,
                                    //referralCreditValue: referralCreditValue,
                                    remarks: "Money Refunded",
                                    createdBy: "Admin"
                                  });
                                  // Insert Into Credit Table
                                  Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                      res.send(err);
                                    } else {
                                      let newPayCredits = new payCredits({
                                        memberId: schResult.senderId,
                                        celebId: schResult.receiverId,
                                        creditValue: schResult.creditValue,
                                        celebPercentage: 0,
                                        celebKonnectPercentage: 0,
                                        payType: Tresult[i].serviceType,
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
                                      // res.send({
                                      //   message: "Credits updated successfully",
                                      //   creditsData: credits
                                      // });

                                      // res.send({
                                      //   message: "Credits updated successfully",
                                      //   creditsData: credits
                                      // });
                                    }
                                  });

                                }
                                else {
                                }

                              }
                            );
                          });   // End of Create Credits

                        }
                      });
                      // End of Inset Notification

                      // End of Notfication Update 
                    }
                  });



                }
              });
            }
          });
        });
      }

    }
  });

}, false);

//notifymemberoncelebreject.start();

// ////////////////////////  NOTIFY MEMBER ON CELEB REJECT while on call ////////////////////////////////////////////////////////////

var notifymemberoncelebrejectoncall = cron.schedule('*/10 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

  let query = { $and: [{ serviceStatus: "celebdisconnected" }, { chatStatus: "inactive" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };
  //let query = { $and: [{ $or: [ { serviceStatus: "celebdisconnected" }, { serviceStatus: "rejected" }, {serviceStatus : "blocked"}, {serviceStatus : "celebRejected"} ] }, { fcmnotification: "RNotification" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };
  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].senderId;

        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notification',

                    notification: {
                      title: 'Notification',
                      body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was unattended due to " + Tresult[i].callRemarks + " . Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                      receiverId: Tresult[i].receiverId,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {

                    } else {
                      //////////////////// Update Schedule Status ///////////////////////////////
                      let myBody = {};
                      let idT = Tresult[i]._id;
                      //console.log("Re-Try Cycle 2 for : ", TCresult[i]._id)
                      myBody.chatStatus = "active";
                      //myBody.fcmcelebnotification = "FCM Alert sent for Celebrity Rejection for Member";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                        if (err) {
                        } else {
                          // Insert into Notfications Collection 

                          let newNotification = new Notification({
                            memberId: Tresult[i].senderId,
                            activity: "REJECTCALLCELEBRITY",
                            notificationType: "Service",
                            title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                            body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was unattended due to " + Tresult[i].callRemarks + " . Happy Konecting !!",
                            status: "active",
                            notificationFrom: SMresult._id
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




                      // End of Notfication Update 
                    }
                  });



                }
              });
            }
          });
        });

      }




    }
  });

}, false);

//notifymemberoncelebrejectoncall.start();

////////////////////////  NOTIFY MEMBER ON CELEB REJECT while on call End////////////////////////////////////////////////////////////

////////////////////////  NOTIFY MEMBER ON CELEB REJECT chat////////////////////////////////////////////////////////////

var notifymemberoncelebrejectchat = cron.schedule('*/10 * * * * *', function () {

  let query = { $and: [{ serviceStatus: "blocked" }, { serviceType: "chat" }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        if (Tresult[i].fcmnotification != "RNotification") {

          let id1 = Tresult[i].senderId;

          let id3 = Tresult[i].receiverId;

          User.findById(id3, function (err, SMresult) {
            User.findById(id1, function (err, Uresult) {
              if (Uresult == null) {
              } else {
                let id2 = Uresult.email;
                logins.findOne({ email: id2 }, function (err, Lresult) {
                  if (Lresult == null) {
                  } else {
                    let dToken = Lresult.deviceToken

                    var message = {
                      to: dToken,
                      collapse_key: 'Notification',

                      notification: {
                        title: 'Notification',
                        body: "This is to notify you that your " + SMresult[i].serviceType + " with " + SMresult.firstName + " " + Uresult.lastName + " was unattended due to " + Tresult[i].callRemarks + " . Happy Konecting !!",
                      },

                      data: {
                        Schededid: Tresult[i].scheduleId,
                        sTransactionId: Tresult[i]._id,
                        Starttime: Tresult[i].Starttime,
                        Endtime: Tresult[i].endTime,
                        senderId: Tresult[i].senderId,
                        r1status: Tresult[i].r1status,
                        r2status: Tresult[i].r2status,
                        receiverId: Tresult[i].receiverId,
                      },

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {

                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].senderId,
                          activity: "REJECTCALLCELEBRITY",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                          body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " wasunattended due to " + Tresult[i].callRemarks + " . Happy Konecting !!",
                          status: "active",
                          notificationFrom: SMresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {

                            //////////////////// Update Schedule Status ///////////////////////////////
                            let myBody = {};
                            let idT = Tresult[i]._id;
                            //console.log("Re-Try Cycle 2 for : ", TCresult[i]._id)
                            //myBody.serviceType = "completed";
                            myBody.fcmnotification = "RNotification";

                            serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                              if (err) {
                              } else {


                              }
                            });

                          }
                        });
                        // End of Inset Notification






                        // End of Notfication Update 
                      }
                    });



                  }
                });
              }
            });
          });
        }
      }
    }
  });

}, false);

//notifymemberoncelebrejectchat.start();



////////////////////////  NOTIFY CELEB ON MEMBER REJECT Chat ////////////////////////////////////////////////////////////



////////////////////////  NOTIFY MEMBER ON CELEB REJECT chat////////////////////////////////////////////////////////////

var notifymemberoncelebrejectchat1 = cron.schedule('*/10 * * * * *', function () {

  let query = { $and: [{ serviceStatus: "celebRejected" }, { serviceType: "chat" }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        if (Tresult[i].fcmnotification != "RNotification") {
          let id1 = Tresult[i].senderId;

          let id3 = Tresult[i].receiverId;

          User.findById(id3, function (err, SMresult) {
            User.findById(id1, function (err, Uresult) {
              if (Uresult == null) {
              } else {
                let id2 = Uresult.email;
                logins.findOne({ email: id2 }, function (err, Lresult) {
                  if (Lresult == null) {
                  } else {
                    let dToken = Lresult.deviceToken

                    var message = {
                      to: dToken,
                      collapse_key: 'Notification',

                      notification: {
                        title: 'Notification',
                        body: "this is to notify you that your  " + Tresult[i].serviceType + " with " + Uresult.firstName + "  " + Uresult.lastName + "  has been unattended due to " + Tresult[i].callRemarks + " . Happy Konecting !!",
                      },

                      data: {
                        Schededid: Tresult[i].scheduleId,
                        sTransactionId: Tresult[i]._id,
                        Starttime: Tresult[i].Starttime,
                        Endtime: Tresult[i].endTime,
                        senderId: Tresult[i].senderId,
                        r1status: Tresult[i].r1status,
                        r2status: Tresult[i].r2status,
                        receiverId: Tresult[i].receiverId,
                      },

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {

                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].senderId,
                          activity: "REJECTCALLCELEBRITY",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                          body: "this is to notify you that your " + Tresult[i].serviceType + "  with " + SMresult.firstName + "  " + SMresult.lastName + "  has been unattended due to  " + Tresult[i].callRemarks + " . Happy Konecting !!",
                          status: "active",
                          notificationFrom: SMresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {

                            //////////////////// Update Schedule Status ///////////////////////////////
                            let myBody = {};
                            let idT = Tresult[i]._id;
                            //console.log("Re-Try Cycle 2 for : ", TCresult[i]._id)
                            //myBody.serviceType = "completed";
                            myBody.fcmnotification = "RNotification";

                            serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                              if (err) {
                              } else {


                              }
                            });

                          }
                        });
                        // End of Inset Notification






                        // End of Notfication Update 
                      }
                    });



                  }
                });
              }
            });
          });
        }
      }
    }
  });

}, false);

//notifymemberoncelebrejectchat1.start();

////////////////////////  NOTIFY MEMBER ON CELEB REJECT Chat////////////////////////////////////////////////////////////

var notifymemberoncelebrejectchat2 = cron.schedule('*/10 * * * * *', function () {

  let query = { $and: [{ serviceStatus: "celebRejected" }, { fcmnotification: "" }, { serviceType: "chat" }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        if (Tresult[i].fcmnotification != "RNotification") {

          let id1 = Tresult[i].senderId;

          let id3 = Tresult[i].receiverId;

          User.findById(id3, function (err, SMresult) {
            User.findById(id1, function (err, Uresult) {
              if (Uresult == null) {
              } else {
                let id2 = SMresult.email;
                logins.findOne({ email: id2 }, function (err, Lresult) {
                  if (Lresult == null) {
                  } else {
                    let dToken = Lresult.deviceToken

                    var message = {
                      to: dToken,
                      collapse_key: 'Notification',

                      notification: {
                        title: 'Notification',
                        body: "this is to notify you that your " + Tresult[i].serviceType + " with " + Uresult.firstName + " " + Uresult.lastName + " has been discarded by the member, The call credits have been credited to your account. Happy Konecting !!",
                      },

                      data: {
                        Schededid: Tresult[i].scheduleId,
                        sTransactionId: Tresult[i]._id,
                        Starttime: Tresult[i].Starttime,
                        Endtime: Tresult[i].endTime,
                        senderId: Tresult[i].senderId,
                        r1status: Tresult[i].r1status,
                        r2status: Tresult[i].r2status,
                        receiverId: Tresult[i].receiverId,
                      },

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {

                      } else {


                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].senderId,
                          activity: "REJECTCALLCELEBRITY",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                          body: "this is to notify you that your " + Tresult[i].serviceType + " with " + Uresult.firstName + " " + Uresult.lastName + " has been discarded by the member, The call credits have been credited to your account. Happy Konecting !!",
                          status: "active",
                          notificationFrom: SMresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {

                            //////////////////// Update Schedule Status ///////////////////////////////
                            let myBody = {};
                            let idT = Tresult[i]._id;
                            //console.log("Re-Try Cycle 2 for : ", TCresult[i]._id)
                            myBody.serviceType = "completed";

                            serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, cssresult) {
                              if (err) {
                              } else {

                              }
                            });

                          }
                        });
                        // End of Inset Notification

                        // End of Notfication Update 
                      }
                    });



                  }
                });
              }
            });
          });
        }

      }
    }
  });

}, false);

//notifymemberoncelebrejectchat2.start();
////////////////////////  NOTIFY MEMBER ON CELEB REJECT Chat End////////////////////////////////////////////////////////////



////////////////////////  NOTIFY CELEB ON MEMBER REJECT ////////////////////////////////////////////////////////////


var notifycelebonmemberreject = cron.schedule('*/10 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 360))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 60))


  let query = { $and: [{ serviceStatus: "memberRejected" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        let id1 = Tresult[i].receiverId;

        let id3 = Tresult[i].senderId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {

            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {

                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notification',

                    notification: {
                      title: 'Notification',
                      body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been discarded by the member, The call credits have been credited to your account. Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      r1status: Tresult[i].rk1status,
                      r2status: Tresult[i].r2status,
                      receiverId: Tresult[i].receiverId,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {
                    } else {
                      let myBody = {};
                      let idT = Tresult[i]._id;
                      //console.log(myBody);
                      myBody.serviceStatus = "completed";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, serviceresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                          let sT = serviceresult.receiverId;
                          let id = serviceresult.scheduleId;
                          let idT = serviceresult._id;
                          let type = serviceresult.serviceType;
                          // Insert into Notfications Collection 

                          let newNotification = new Notification({
                            memberId: Tresult[i].receiverId,
                            activity: "REJECTCALLCELEBRITY",
                            notificationType: "Service",
                            title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                            body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + "has been discarded by the member, The call credits have been credited to your account. Happy Konecting !!",
                            status: "active",
                            notificationFrom: SMresult._id
                          });
                          // Insert Notification
                          Notification.createNotification(newNotification, function (err, credits) {
                            if (err) {
                            } else {
                              // start of sevice schdule
                              serviceSchedule.getServiceScheduleById(id, function (err, SRresult) {

                                let id = SRresult.receiverId;

                                celebrityContract.findOne(
                                  { $and: [{ memberId: id }, { serviceType: type }, { isActive: true }] },
                                  function (err, CCresult) {
                                    if (err) return res.send(err);
                                    //console.log("CCresult", CCresult);

                                    // start of credits
                                    Credits.find(
                                      { memberId: sT },
                                      null,
                                      { sort: { createdAt: -1 } },
                                      function (err, cBal) {
                                        if (err) return res.send(err);
                                        if (cBal) {

                                          cBalObj = cBal[0];
                                          newReferralCreditValue = cBalObj.referralCreditValue;
                                          //console.log("credits of celebrity " + cBalObj.cumulativeCreditValue)
                                          oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                          credits = SRresult.credits;
                                          test2 = CCresult.sharingPercentage;
                                          test = credits * test2 / 100
                                          //console.log(test);
                                          newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                                          let newCredits = new Credits({

                                            memberId: sT,
                                            creditType: "credit",
                                            creditValue: test,
                                            cumulativeCreditValue: newCumulativeCreditValue,
                                            referralCreditValue: newReferralCreditValue,
                                            //referralCreditValue: referralCreditValue,
                                            remarks: "Credited amount",
                                            createdBy: "Admin"
                                          });
                                          // Insert Into Credit Table
                                          Credits.createCredits(newCredits, function (err, credits) {
                                            if (err) {
                                              //res.send(err);
                                            } else {
                                              //console.log("credits updated" + credits)
                                              //console.log("//////// End of refund Credits ///////////////")
                                              let myBody = {};

                                              myBody.refundStatus = "active";
                                              serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                                                if (err) {
                                                  //console.log(rStatus);

                                                } else {
                                                }
                                              });

                                            }
                                          });

                                        }
                                        else {
                                        }

                                      }
                                    ); //end of credits
                                  }
                                ); //end of celeb contracts
                              }); // end of sevice schdule
                              //}
                            }
                          });
                          // End of Insert Notification

                        }
                      });


                      //call Service transaction status update to set r3status = 1
                    }
                  });

                }
              });
            }
          });
        });

      }

    }
  });

}, false);

//notifycelebonmemberreject.start();

/////////////////////////////////////////////REJECT NOTIFICATIONS - ENDS/////////////////////////////////////////////////



/////////////////////////////////////////////NO-RESPONSE NOTIFICATIONS - STARTS/////////////////////////////////////////////////


////////////////////////  NOTIFICATIONS TO MEMEBER ON CELEB NO-RESPONSE //////////////////////////////////////////

var notifymemberoncelebnoresponse = cron.schedule('*/10 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

  let query = { $and: [{ serviceStatus: "celebNotResponded" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {

    } else {
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].senderId;
        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {


          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notificaiton',

                    notification: {
                      title: 'Notificaiton',
                      body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was attempted with no response from the Celeb, we will re-attempt to Konect within a few minutes. Happy Konecting !!",
                    },

                    data: {
                      serviceType: Tresult[i].serviceType,
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                      receiverId: Tresult[i].receiverId,
                      Remarks: "celebNotResponded"
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {

                    } else {


                      let myBody = {};
                      let idT = Tresult[i]._id;
                      //    myBody.r1status = "active";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                          // Insert into Notfications Collection 

                          let newNotification = new Notification({
                            memberId: Tresult[i].senderId,
                            activity: "REJECTCALLCELEBRITY",
                            notificationType: "Service",
                            title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                            body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was attempted with no response from the Celeb, we will re-attempt to Konect within a few minutes. Happy Konecting !!",
                            status: "active",
                            notificationFrom: SMresult._id
                          });
                          // Insert Notification
                          Notification.createNotification(newNotification, function (err, credits) {
                            if (err) {
                              //res.send(err);
                            } else {
                            }
                          });
                          // End of Insert Notification

                        }
                      });


                    }
                  });

                }
              });
            }
          });
        });

      }

    }
  });


}, false);

//notifymemberoncelebnoresponse.start();


/////////////////// NOTIFY CELEB ON CELEBRITY NO RESPONSE ////////////////////////////////////////////////////

var notifyceleboncelebnoresponse = cron.schedule('*/10 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 360))

  var jobendtime = new Date(parsedDate.getTime() + (1000 * 60))
  let query = { $and: [{ serviceStatus: "celebNotResponded" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].receiverId;
        let id3 = Tresult[i].senderId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notificaitons',

                    notification: {
                      title: 'Notificaitons',
                      body: "This is to notify you that your " + Tresult[i].serviceType + "with" + SMresult.firstName + " " + SMresult.lastName + " was unsuccessful, a call will be re-attempted shortly." + " Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {
                    } else {
                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].receiverId,
                        activity: "REJECTCALLCELEBRITY",
                        notificationType: "Service",
                        title: Tresult[i].serviceType + " " + "Rejected by" + " " + SMresult.firstName,
                        body: "This is to notify you that your " + Tresult[i].serviceType + "with" + SMresult.firstName + " " + SMresult.lastName + " was unsuccessful, a call will be re-attempted shortly." + " Happy Konecting !!" + " Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification
                    }
                  });

                }
              });
            }
          });
        });
      }

    }
  });

}, false);

//notifyceleboncelebnoresponse.start();




////////////////////////  NOTIFY MEMBER  ON MEMBER NO-RESPONSE //////////////////////////////////////////////////////
var notifymemberonnoresponse = cron.schedule('*/10 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))
  let query = { $and: [{ serviceStatus: "memberNotResponded" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].senderId;

        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {

          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notificaitons',

                    notification: {
                      title: 'Notificaitons',
                      body: "This is to notify you that your " + SMresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was attempted with no response from your side, hence your service will be updated as completed.Happy Konecting !!",
                    },

                    data: {
                      serviceType: Tresult[i].serviceType,
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {
                    } else {
                      // Insert into Notfications Collection 
                      let newNotification = new Notification({
                        memberId: Tresult[i].senderId,
                        notificationType: "missedcall",
                        activity: "Notification",
                        title: "Missed call with " + SMresult.firstName + " " + SMresult.lastName,
                        body: "this is to notify that you had a missed call for your scheduled call with " + SMresult.firstName + " " + SMresult.lastName + " Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification
                    }
                  });

                }
              });
            }
          });
        });
      }

    }
  });

}, false);

//notifymemberonnoresponse.start();

///////////////////////////////////// NOTIFICATION CELEBRITY ON MEMBER NO RESPONSE ///////////////////////////////////

var notifycelebonmembernoresponse = cron.schedule('*/10 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 360))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 60))
  let query = { $and: [{ serviceStatus: "memberNotResponded" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        let id1 = Tresult[i].receiverId;
        let id3 = Tresult[i].senderId;

        User.findById(id3, function (err, SMresult) {


          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notificaitons',

                    notification: {
                      title: 'Notificaitons',
                      body: "This is to notify you that your " + Tresult[i].serviceType + "with" + SMresult.firstName + " " + SMresult.lastName + " was an unsuccessfull attempt." + "Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {

                    } else {

                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].receiverId,
                        notificationType: "service",
                        activity: "REJECTCALLCELEBRITY",
                        title: Tresult[i].serviceType + " " + "calling with" + " " + SMresult.firstName,
                        body: "this is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been an unsuccessfull attempt." + "Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification
                      let myBody = {};
                      let idT = Tresult[i]._id;
                      myBody.serviceStatus = "completed";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, serviceresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                          // Start of update user's liveStatus

                          let reqBody = {};
                          reqBody.liveStatus = "online";
                          User.findByIdAndUpdate(Tresult[i].senderId, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });
                          User.findByIdAndUpdate(Tresult[i].receiverId, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });


                          // End of update user's liveStatus

                        }
                      });
                      //call Service transaction status update to set r3status = 1


                    }
                  });

                }
              });
            }
          });
        });

      }

    }
  });

}, false);

//notifycelebonmembernoresponse.start();


////////////////////////  NOTIFY MEMBER  ON MEMBER CONNECTION ERROR //////////////////////////////////////////////////////
var notifymemberonmembernoconnection = cron.schedule('*/10 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() + (1000 * 30))

  var jobendtime = new Date(parsedDate.getTime() + (1000 * 360))

  let query = { $and: [{ serviceStatus: "membercalling" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {

    } else {
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].senderId;

        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {

                } else {

                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notificaitons',

                    notification: {
                      title: 'Notificaitons',
                      body: "This is to notify you that your" + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was attempted with no response from your side, hence your order will be updated as completed. Happy Konecting !!",
                    },

                    data: {
                      serviceType: Tresult[i].serviceType,
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {

                    } else {
                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].senderId,
                        activity: "REJECTCALLCELEBRITY",
                        notificationType: "Service",
                        title: Tresult[i].serviceType + " " + "calling with" + " " + SMresult.firstName,
                        body: "this is to notify you that your" + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + "was attempted with no response from your side, hence your order will be updated as completed. Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification

                    }
                  });

                }
              });
            }
          });
        });
      }

    }
  });

}, false);

//notifymemberonmembernoconnection.start();

///////////////////////////////////// NOTIFICATION CELEBRITY ON MEMBER CONNECTION ERROR ///////////////////////////////////

var notifycelebonmembernoconnection = cron.schedule('*/10 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() + (1000 * 30))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 360))
  let query = { $and: [{ serviceStatus: "membercalling" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {

    } else {

      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].receiverId;
        let id3 = Tresult[i].senderId;

        User.findById(id3, function (err, SMresult) {


          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {

            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {

                } else {

                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notificaitons',

                    notification: {
                      title: 'Notificaitons',
                      body: "This is to notify you that your" + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was an unsuccesful attempt with the member. Happy Konnecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {

                    } else {
                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].receiverId,
                        activity: "REJECTCALLCELEBRITY",
                        notificationType: "Service",
                        title: Tresult[i].serviceType + " " + "calling with" + " " + SMresult.firstName,
                        body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " was an unsuccesful attempt with the member. Happy Konnecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification
                      let myBody = {};
                      let idT = Tresult[i]._id;
                      myBody.serviceStatus = "completed";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, serviceresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                          // Start of update user's liveStatus

                          let reqBody = {};
                          reqBody.liveStatus = "online";
                          User.findByIdAndUpdate(Tresult[i].senderId, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });
                          User.findByIdAndUpdate(Tresult[i].receiverId, reqBody, function (err, Lresult) {
                            if (err) return res.send(err);
                          });


                          // End of update user's liveStatus
                        }
                      });
                      //call Service transaction status update to set r3status = 1
                    }
                  });

                }
              });
            }
          });
        });

      }

    }
  });

}, false);

//notifycelebonmembernoconnection.start();

/////////////////////////////////////////////NO-RESPONSE NOTIFICATIONS - ENDS/////////////////////////////////////////////////


////////////////////////////////////////////CELEB BLOCKED  - STARTS /////////////////////////////////////////////

////////////////////////MEMEBER  NOTIFICATIONS ON BLOCKING BY CELEB /////////////////////////////////////

// var notifymemberoncelebblocking = cron.schedule('*/10 * * * * *', function () {


//   let currenttime = new Date().toISOString();
//   var parsedDate = new Date(Date.parse(currenttime))

//   currenttime = new Date(parsedDate.getTime() - (1000 * 30))
//   var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

//   let query = { $and: [{ serviceStatus: "blocked" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

//   serviceTransaction.find(query, function (err, Tresult) {
//     if (Tresult == null) {
//     } else {
//       for (let i = 0; i < Tresult.length; i++) {
//         let id1 = Tresult[i].senderId;

//         let id3 = Tresult[i].receiverId;

//         User.findById(id3, function (err, SMresult) {

//           User.findById(id1, function (err, Uresult) {
//             if (Uresult == null) {
//             } else {
//               let id2 = Uresult.email;
//               logins.findOne({ email: id2 }, function (err, Lresult) {
//                 if (Lresult == null) {
//                 } else {
//                   let dToken = Lresult.deviceToken

//                   var message = {
//                     to: dToken,
//                     collapse_key: 'Service-alerts',

//                     notification: {
//                       title: 'Service Alert',
//                       body: "this is to notify you that your" + Tresult[i].serviceType + "with" + SMresult.firstName + " " + SMresult.lastName + "has been terminated and reported.  Happy Konecting !! ",
//                     },

//                     data: {
//                       Schededid: Tresult[i].scheduleId,
//                       sTransactionId: Tresult[i]._id,
//                       Starttime: Tresult[i].Starttime,
//                       Endtime: Tresult[i].endTime,
//                       senderId: Tresult[i].senderId,
//                       receiverId: Tresult[i].receiverId,
//                       r1status: Tresult[i].r1status,
//                       r2status: Tresult[i].r2status,
//                     },

//                   };
//                   fcm.send(message, function (err, response) {
//                     if (err) {
//                     } else {
//                       // Insert into Notfications Collection 

//                       let newNotification = new Notification({
//                         memberId: Tresult[i].senderId,
//                         activity: "REJECTCALLCELEBRITY",
//                         title: Tresult[i].serviceType + " " + "blocked by" + " " + Uresult.firstName,
//                         body: "this is to notify you that your" + Tresult[i].serviceType + "with" + SMresult.firstName + " " + SMresult.lastName + "has been terminated and reported.  Happy Konecting !! ",
//                         status: "active"
//                       });
//                       // Insert Notification
//                       Notification.createNotification(newNotification, function (err, credits) {
//                         if (err) {
//                           //res.send(err);
//                         } else {
//                         }
//                       });
//                       // End of Insert Notification
//                     }
//                   });

//                 }
//               });
//             }
//           });
//         });
//       }

//     }
//   });

// }, false);

// notifymemberoncelebblocking.start();

////////////////////////////////////////////CELEB BLOCKED  - ENDS /////////////////////////////////////////////////


////////////////////////////////////////////SCHEDULE CANCEL NOTIFICATION- STARTS /////////////////////////////////////////////////

////////////////////////MEMEBER  NOTIFICATIONS ON SCHEDULE CANCEL //////////////////////////////////////////////////

var notifymemberonschedulecancel = cron.schedule('*/10 * * * * *', function () {


  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 30))

  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

  let query = { $and: [{ serviceStatus: "canceled" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        let id1 = Tresult[i].senderId;

        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Service-alerts',

                    notification: {
                      title: 'Service Alert',
                      body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled, Credits debited from your account will be credited back to you shortly. Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {
                    } else {
                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].senderId,
                        activity: "CANCELCALLCELEBRITY",
                        notificationType: "Service",
                        title: Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName,
                        body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled, Credits debited from your account will be credited back to you shortly. Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification
                      let myBody = {};
                      let idT = Tresult[i]._id;
                      myBody.rstatus = "inactive";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                        }
                      });


                    }
                  });

                }
              });
            }
          });
        });
      }

    }
  });

}, false);

//notifymemberonschedulecancel.start();


/////////////////// CELEBRITY NOTIFICATION ON SCHEDULE CANCEL ////////////////////////////////////////////////////

var notifyceleboncschedulecancel = cron.schedule('*/10 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (1000 * 360))
  var jobendtime = new Date(parsedDate.getTime() + (1000 * 60))

  let query = { $and: [{ serviceStatus: "canceled" }, { startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].receiverId;

        let id3 = Tresult[i].senderId;

        User.findById(id3, function (err, SMresult) {

          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {

                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Service-alerts',

                    notification: {
                      title: 'Service Alert',
                      body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled. Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {

                    } else {
                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].receiverId,
                        activity: "Notification",
                        notificationType: "Service",
                        title: Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName,
                        body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled. Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification

                    }
                  });

                }
              });
            }
          });
        });
      }

    }
  });

}, false);

//notifyceleboncschedulecancel.start();

////////////////////////////////////////////SCHEDULE CANCEL NOTIFICATION- STARTS /////////////////////////////////////////////////





//////////////////////////////////////////// REMIDNER SERVICES -MARKETING NOTFICAITONS - START /////////////////////////////////////////////////

////////////////////////MEMBER REMINDER NOTIFICATIONS /////////////////////
var memberreminderNotifications = cron.schedule('*/10 * * * * *', function () {
  let query = { serviceStatus: "scheduled" }

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
      res.json({
        error: "No scheduled records found"
      });
    } else {

      // FOR LOOP for all Schedules from TResults
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].senderId;


        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {

          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {

                if (Lresult == null) {
                } else {
                  let schduledStartTime = Tresult[i].startTime;
                  let dToken = Lresult.deviceToken;
                  let dtimezone = Lresult.dtimezone;
                  var sysTime = new Date();
                  var diffTime = schduledStartTime - sysTime
                  var minutesDifference = Math.floor(diffTime / 1000 / 60);

                  //15 Minutes Before Reminder Noficiations
                  if ((minutesDifference < 15) && (minutesDifference > 0) && (Tresult[i].r15mstatus == "active")) {
                    var message = {
                      to: dToken,
                      collapse_key: 'CelebKonect Reminders',

                      notification: {
                        title: 'CelebKonect Reminders',
                        body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " will be held shortly, Please stay online for a happy experience with your favourite Celeb. Happy Konecting!!",
                      }

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.fcmmembernotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].senderId,
                          activity: "CALLREMINDER",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName,
                          body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " will be held shortly, Please stay online for a happy experience with your favourite Celeb. Happy Konecting!!",
                          status: "active",
                          notificationFrom: SMresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {
                          }
                        });
                        // End of Insert Notification
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.r15mstatus = "inactive";
                        myBody.fcmmembernotification = "fcm-notification 15m sent - Member";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r15mresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                        //call Service transaction status update to set r1status = 1
                      }
                    });


                  }

                  //4 Hours Before Reminder Noficiations
                  if ((minutesDifference < 240) && (minutesDifference > 15) && (Tresult[i].r4hstatus == "active")) {


                    var message = {
                      to: dToken,
                      collapse_key: 'CelebKonect Reminders',

                      notification: {
                        title: 'CelebKonect Reminders',
                        body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " is in 4 Hours.  Please stay online for a happy experience with your favourite Celeb!",
                      }

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.fcmmembernotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].senderId,
                          activity: "CALLREMINDER",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName,
                          body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " is in 4 Hours.  Please stay online for a happy experience with your favourite Celeb!",
                          status: "active",
                          notificationFrom: SMresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {
                          }
                        });
                        // End of Insert Notification

                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.r4hstatus = "inactive";
                        myBody.fcmmembernotification = "fcm-notification sent 4h- Member";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r4hresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                        //call Service transaction status update to set r1status = 1
                      }

                    });

                  }

                  //1 Day before Reminder Noficiations
                  if ((minutesDifference < 1440) && (minutesDifference > 240) && (Tresult[i].r1dstatus == "active")) {
                    var message = {
                      to: dToken,
                      collapse_key: 'CelebKonect Reminders',

                      notification: {
                        title: 'CelebKonect Reminders',
                        body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " is in 1 Day, Please stay online for happy experience with your favourite Celeb!",
                      }

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.fcmmembernotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                      } else {

                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].senderId,
                          activity: "CALLREMINDER",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName,
                          body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " is in 1 Day, Please stay online for happy experience with your favourite Celeb!",
                          status: "active",
                          notificationFrom: SMresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {
                          }
                        });
                        // End of Insert Notification
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.r1dstatus = "inactive";
                        myBody.fcmmembernotification = "fcm-notification sent 1d - Member";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {

                          }
                        });
                        //call Service transaction status update to set r1status = 1

                      }
                    });
                  }

                }
              });
            }
          });
          //UResults end 
        });
      }
    }
  });

}, false);
memberreminderNotifications.start();


////////////////////////CELEBRITY REMINDER NOTIFICATIONS ///////////////////////////////////////////////////////

var celebrityreminderNotifications = cron.schedule('*/10 * * * * *', function () {

  let query = { serviceStatus: "scheduled" }

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
      res.json({
        error: "No scheduled records found"
      });
    } else {


      // FOR LOOP for all Schedules from TResults
      for (let i = 0; i < Tresult.length; i++) {

        let id1 = Tresult[i].receiverId;

        let id3 = Tresult[i].senderId;


        User.findById(id3, function (err, Sresult) {

          User.findById(id1, function (err, Uresult) {


            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: Uresult.email }, function (err, Lresult) {

                if (Lresult == null) {
                } else {
                  let schduledStartTime = Tresult[i].startTime;
                  let dToken = Lresult.deviceToken;
                  let dtimezone = Lresult.dtimezone;
                  var sysTime = new Date();
                  var diffTime = schduledStartTime - sysTime
                  var minutesDifference = Math.floor(diffTime / 1000 / 60);

                  //15 Minutes Before Reminder Noficiations
                  if ((minutesDifference < 15) && (minutesDifference > 0) && (Tresult[i].r15mstatus == "active")) {
                    var message = {
                      to: dToken,
                      collapse_key: 'CelebKonect Reminders',

                      notification: {
                        title: 'CelebKonect Reminders',
                        body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName + " will be held shortly, Please stay online for happy Konect with your Fan/Follower!",
                      }

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.fcmcelebnotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].receiverId,
                          activity: "CALLREMINDER",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName,
                          body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName + " will be held shortly, Please stay online for happy Konect with your Fan/Follower!",
                          status: "active",
                          notificationFrom: Sresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {
                          }
                        });
                        // End of Insert Notification
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.r15mstatus = "inactive";
                        myBody.fcmcelebnotification = "fcm-notification sent 15m - Celeb";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r15mresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                        //call Service transaction status update to set r1status = 1
                      }
                    });


                  }

                  //4 Hours Before Reminder Noficiations
                  if ((minutesDifference < 240) && (minutesDifference > 15) && (Tresult[i].r4hstatus == "active")) {


                    var message = {
                      to: dToken,
                      collapse_key: 'CelebKonect Reminders',

                      notification: {
                        title: 'CelebKonect Reminders',
                        body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName + " is in 4 Hours, Please stay online for happy Konect with your Fan/Follower!",
                      }

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.fcmcelebnotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].receiverId,
                          activity: "CALLREMINDER",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName,
                          body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName + " is in 4 Hours, Please stay online for happy Konect with your Fan/Follower!",
                          status: "active",
                          notificationFrom: Sresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {
                          }
                        });
                        // End of Insert Notification
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.r4hstatus = "inactive";
                        myBody.fcmcelebnotification = "fcm-notification sent 4h - Celeb";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r4hresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                        //call Service transaction status update to set r1status = 1

                      }

                    });

                  }

                  //1 Day before Reminder Noficiations
                  if ((minutesDifference < 1440) && (minutesDifference > 240) && (Tresult[i].r1dstatus == "active")) {
                    var message = {
                      to: dToken,
                      collapse_key: 'CelebKonect Reminders',

                      notification: {
                        title: 'CelebKonect Reminders',
                        body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName + " is in 1 Day, Please stay online for happy Konect with your Fan/Follower!",
                      }

                    };
                    fcm.send(message, function (err, response) {
                      if (err) {
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.fcmcelebnotification = "fcm-Sending Error";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });

                      } else {
                        // Insert into Notfications Collection 

                        let newNotification = new Notification({
                          memberId: Tresult[i].receiverId,
                          activity: "CALLREMINDER",
                          notificationType: "Service",
                          title: Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName,
                          body: 'This is to remind you regarding your scheduled ' + Tresult[i].serviceType + " With " + Sresult.firstName + " " + Sresult.lastName + " is in 1 Day, Please stay online for happy Konect with your Fan/Follower!",
                          status: "active",
                          notificationFrom: Sresult._id
                        });
                        // Insert Notification
                        Notification.createNotification(newNotification, function (err, credits) {
                          if (err) {
                            //res.send(err);
                          } else {
                          }
                        });
                        // End of Insert Notification
                        let myBody = {};
                        let idT = Tresult[i]._id;
                        myBody.r1dstatus = "inactive";
                        myBody.fcmcelebnotification = "fcm-notification sent 1d - Celeb";
                        serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, r1dresult) {
                          if (err) {
                            res.json({
                              error: "User Not Exists / Send a valid UserID"
                            });
                          } else {
                          }
                        });
                        //call Service transaction status update to set r1status = 1
                      }
                    });
                  }

                }
              });
            }
          });
        });
      }
    }
  });
}, false);
celebrityreminderNotifications.start();




/////////////////// CELEBRITY Fund Trasfer Start 30////////////////////////////////////////////////////

var celebrityfundtrasfer = cron.schedule('* */30 * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime() - (60000 * 60))
  var jobendtime = new Date(parsedDate.getTime() - (60000 * 30))
  //console.log(currenttime)

  let query = { $and: [{ startTime: { $lt: jobendtime } }, { startTime: { $gt: currenttime } }, { refundStatus: "inactive" }] };

  serviceTransaction.find(query, function (err, Tresult) {

    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        if ((Tresult[i].serviceStatus == "completed") || (Tresult[i].serviceStatus == "celebAccepted")) {
          //console.log(Tresult[i].receiverId);
          let sT = Tresult[i].receiverId;
          let sE = Tresult[i].senderId;
          let id = Tresult[i].scheduleId;
          let idT = Tresult[i]._id;
          let type = Tresult[i].serviceType;
          // start of sevice schdule
          serviceSchedule.getServiceScheduleById(id, function (err, SRresult) {
            //res.send(result);
            // console.log("idS",SRresult);
            let id = SRresult.receiverId;

            celebrityContract.findOne(
              { $and: [{ memberId: id }, { serviceType: type }, { isActive: true }] },
              function (err, CCresult) {
                if (err) return res.send(err);
                //console.log("CCresult", CCresult);
                //console.log( Tresult[i].receiverId);
                //let idC = Tresult[i].receiverId;
                // start of credits
                Credits.find(
                  { memberId: sT },
                  null,
                  { sort: { createdAt: -1 } },
                  function (err, cBal) {
                    if (err) return res.send(err);
                    if (cBal) {
                      cBalObj = cBal[0];
                      newReferralCreditValue = cBalObj.referralCreditValue;
                      oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                      credits = SRresult.credits;
                      test2 = CCresult.sharingPercentage;
                      test = credits * test2 / 100;
                      ckCredits = credits - test;
                      //console.log(test);
                      newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                      let newCredits = new Credits({

                        memberId: sT,
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
                          //console.log("credits updated" + credits)
                          let myBody = {};

                          myBody.refundStatus = "active";
                          serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                            if (err) {
                              //console.log(rStatus);

                            } else {
                            }
                          });

                        }
                      });
                      let newPayCredits = new payCredits({
                        memberId: sT,
                        celebId: sE,
                        creditValue: credits,
                        celebPercentage: test,
                        celebKonnectPercentage: ckCredits,
                        payType: Tresult[i].serviceType,
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


                    }
                    else {
                    }

                  }
                ); //end of credits
              }
            ); //end of celeb contracts
          }); // end of sevice schdule


        }



      }


    }
  });

}, false);

celebrityfundtrasfer.start();

/////////////////// CELEBRITY Fund Trasfer End////////////////////////////////////////////////////



/////////////////// CELEBRITY Fund Trasfer chat Start////////////////////////////////////////////////////

var celebrityfundtrasferchat = cron.schedule('* */30 * * * *', function () {

  let query = { $and: [{ serviceType: "chat" }, { refundStatus: "inactive" }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        if ((Tresult[i].serviceStatus == "completed") || (Tresult[i].serviceStatus == "celebdisconnected")) {
          //console.log(Tresult[i].receiverId);
          let sT = Tresult[i].receiverId;
          let sE = Tresult[i].senderId;
          let id = Tresult[i].scheduleId;
          let idT = Tresult[i]._id;
          let type = Tresult[i].serviceType;

          Chat.find({ sTransactionId: idT }, function (err, Cresult) {
            if (err) return res.send(err);
            let totalCredits = 0;
            for (let i = 0; i < Cresult.length; i++) {
              //console.log(Cresult)
              totalCredits = totalCredits + Cresult[i].credits;
            }
            //res.send(result);

            // start of sevice schdule
            serviceSchedule.getServiceScheduleById(id, function (err, SRresult) {
              //res.send(result);
              // console.log("idS",SRresult);
              let id = SRresult.receiverId;

              celebrityContract.findOne(
                { $and: [{ memberId: sT }, { serviceType: type }, { isActive: true }] },
                function (err, CCresult) {
                  if (err) return res.send(err);
                  //console.log("CCresult", CCresult);
                  //console.log( Tresult[i].receiverId);
                  //let idC = Tresult[i].receiverId;
                  // start of credits

                  Credits.find(
                    { memberId: sT },
                    null,
                    { sort: { createdAt: -1 } },
                    function (err, cBal) {
                      if (err) return res.send(err);
                      if (cBal) {
                        cBalObj = cBal[0];
                        newReferralCreditValue = cBalObj.referralCreditValue;
                        oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                        credits = totalCredits;
                        test2 = CCresult.sharingPercentage;
                        test = totalCredits * test2 / 100;
                        ckCredits = credits - test;
                        //console.log(test);
                        newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);

                        let newPayCredits = new payCredits({
                          memberId: sT,
                          celebId: sE,
                          creditValue: credits,
                          celebPercentage: test,
                          celebKonnectPercentage: ckCredits,
                          payType: Tresult[i].serviceType,
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

                          memberId: sT,
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
                            //console.log("credits updated" + credits)
                            let myBody = {};

                            myBody.refundStatus = "active";
                            serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rStatus) {
                              if (err) {
                                //console.log(rStatus);

                              } else {
                              }
                            });

                          }
                        });

                      }
                      else {
                      }

                    }
                  ); //end of credits
                }
              ); //end of celeb contracts
            }); // end of sevice schdule


          });
        }



      }


    }
  });

}, false);

celebrityfundtrasferchat.start();

/////////////////// CELEBRITY Fund Trasfer chat End////////////////////////////////////////////////////



/////////////////// member Fund Trasfer After Retry2 Start////////////////////////////////////////////////////


var memberfundtransferafterretry2 = cron.schedule('* */30 * * * *', function () {


  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))
  //console.log(currenttime);
  currenttime = new Date(parsedDate.getTime() - (1000 * 30))

  var jobendtime = new Date(parsedDate.getTime() + (1000 * 30))

  let query = { serviceStatus: "celebNotResponded2", rstatus: "inactive" };

  serviceTransaction.find(query, function (err, Tresult) {

    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        let id1 = Tresult[i].senderId;

        let id3 = Tresult[i].receiverId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {
            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {
                } else {
                  let dToken = Lresult.deviceToken
                  //console.log(dToken);
                  var message = {
                    to: dToken,
                    collapse_key: 'Service-alerts',

                    notification: {
                      title: 'Service Alert',
                      body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled, Credits debited from your account will be credited back to you shortly. Happy Konecting !!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      receiverId: Tresult[i].receiverId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                    },

                  };
                  //console.log(message)
                  fcm.send(message, function (err, response) {
                    //console.log(response)
                    if (err) {
                    } else {
                      /// console.log(err)
                      // Fetch Schedule Info to get Credit value & Revert back Credit Balance
                      let schId = Tresult[i].scheduleId;
                      serviceSchedule.findById(schId, function (err, schResult) {
                        //console.log(schResult)
                        Credits.find(
                          { memberId: Tresult[i].senderId },
                          null,
                          { sort: { createdAt: -1 } },
                          function (err, cBal) {
                            if (err) return res.send(err);
                            if (cBal) {
                              cBalObj = cBal[0];

                              oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);

                              newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) + parseInt(schResult.credits);

                              let newCredits = new Credits({
                                memberId: schResult.senderId,
                                creditType: "credit",
                                creditValue: schResult.creditValue,
                                cumulativeCreditValue: newCumulativeCreditValue,
                                referralCreditValue: cBalObj.referralCreditValue,
                                //referralCreditValue: referralCreditValue,
                                remarks: "Money Refunded",
                                createdBy: "Admin"
                              });
                              // Insert Into Credit Table
                              Credits.createCredits(newCredits, function (err, credits) {
                                if (err) {
                                  res.send(err);
                                } else {
                                  let newPayCredits = new payCredits({
                                    memberId: schResult.senderId,
                                    celebId: schResult.receiverId,
                                    creditValue: schResult.creditValue,
                                    celebPercentage: 0,
                                    celebKonnectPercentage: 0,
                                    payType: Tresult[i].serviceType,
                                    createdBy: "Pavan"
                                  });

                                  payCredits.createPayCredits(newPayCredits, function (err, payCredits) {

                                    if (err) {
                                      //res.send(err);
                                    } else {
                                      //console.log(payCredits);
                                      // res.json({
                                      //   message: "payCredits saved successfully",
                                      //   "payCredits": payCredits
                                      // });
                                    }
                                  });
                                  // res.send({
                                  //   message: "Credits updated successfully",
                                  //   creditsData: credits
                                  // });
                                }
                              });

                            }
                            else {
                            }

                          }
                        );
                      });   // End of Create Credits



                      // Insert into Notfications Collection 

                      let newNotification = new Notification({
                        memberId: Tresult[i].senderId,
                        activity: "CANCELCALLCELEBRITY",
                        notificationType: "Service",
                        title: Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName,
                        body: "This is to notify you that your " + Tresult[i].serviceType + " with " + SMresult.firstName + " " + SMresult.lastName + " has been cancelled, Credits debited from your account will be credited back to you shortly. Happy Konecting !!",
                        status: "active",
                        notificationFrom: SMresult._id
                      });
                      // Insert Notification
                      Notification.createNotification(newNotification, function (err, credits) {
                        if (err) {
                          //res.send(err);
                        } else {
                        }
                      });
                      // End of Insert Notification
                      let myBody = {};
                      let idT = Tresult[i]._id;
                      myBody.rstatus = "active";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                        }
                      });


                    }
                  });

                }
              });
            }
          });
        });
      }

    }
  });

}, false);

memberfundtransferafterretry2.start();

/////////////////// member Fund Trasfer After Retry2 End////////////////////////////////////////////////////


/////////////////// Chat for Celeb Start////////////////////////////////////////////////////

var chatforceleb = cron.schedule('*/10 * * * * *', function () {

  let query = { $and: [{ serviceStatus: "scheduled" }, { serviceType: "chat" }, { chatStatus: "inactive" }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        let id1 = Tresult[i].receiverId;

        let id3 = Tresult[i].senderId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {

            } else {
              let id2 = Uresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {

                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notification',

                    notification: {
                      title: 'Notification',
                      body: "This is to notify that your " + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " has been scehduled" + " Happy Konecting!!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                      receiverId: Tresult[i].receiverId,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {
                    } else {

                      let myBody = {};
                      let idT = Tresult[i]._id;
                      myBody.chatStatus = "active";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                          // Insert into Notfications Collection 

                          let newNotification = new Notification({
                            memberId: Tresult[i].receiverId,
                            activity: "SCHEDULE",
                            notificationType: "Service",
                            title: Tresult[i].serviceType + " " + " with " + " " + Uresult.firstName,
                            body: "This is to notify that your " + Tresult[i].serviceType + " With " + SMresult.firstName + " " + SMresult.lastName + " has been scehduled" + " Happy Konecting!!",
                            status: "active",
                            notificationFrom: Uresult._id
                          });
                          // Insert Notification
                          Notification.createNotification(newNotification, function (err, credits) {
                            if (err) {
                              //res.send(err);
                            } else {
                            }
                          });
                          // End of Insert Notification
                        }
                      });




                    }
                  });


                  //call Service transaction status update to set r3status = 1

                }
              });
            }
          });
        });

      }

    }
  });

}, false);

chatforceleb.start();

/////////////////// Chat for Celeb End////////////////////////////////////////////////////

/////////////////// Chat for Member Start////////////////////////////////////////////////////

var chatformember = cron.schedule('*/10 * * * * *', function () {

  let query = { $and: [{ serviceStatus: "scheduled" }, { serviceType: "chat" }, { chatStatus: "inactive" }] };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      for (let i = 0; i < Tresult.length; i++) {
        let id1 = Tresult[i].receiverId;

        let id3 = Tresult[i].senderId;

        User.findById(id3, function (err, SMresult) {
          User.findById(id1, function (err, Uresult) {
            if (Uresult == null) {

            } else {
              let id2 = SMresult.email;
              logins.findOne({ email: id2 }, function (err, Lresult) {
                if (Lresult == null) {

                } else {
                  let dToken = Lresult.deviceToken

                  var message = {
                    to: dToken,
                    collapse_key: 'Notification',

                    notification: {
                      title: 'Notification',
                      body: "This is to notify that your " + Tresult[i].serviceType + " With " + Uresult.firstName + " " + Uresult.lastName + " has been scheduled" + " Happy Konecting!!",
                    },

                    data: {
                      Schededid: Tresult[i].scheduleId,
                      sTransactionId: Tresult[i]._id,
                      Starttime: Tresult[i].Starttime,
                      Endtime: Tresult[i].endTime,
                      senderId: Tresult[i].senderId,
                      r1status: Tresult[i].r1status,
                      r2status: Tresult[i].r2status,
                      receiverId: Tresult[i].receiverId,
                    },

                  };
                  fcm.send(message, function (err, response) {
                    if (err) {
                    } else {

                      let myBody = {};
                      let idT = Tresult[i]._id;
                      myBody.chatStatus = "active";
                      serviceTransaction.findByIdAndUpdate(idT, myBody, function (err, rresult) {
                        if (err) {
                          res.json({
                            error: "User Not Exists / Send a valid UserID"
                          });
                        } else {
                          // Insert into Notfications Collection 

                          let newNotification = new Notification({
                            memberId: Tresult[i].senderId,
                            activity: "SCHEDULE",
                            notificationType: "Service",
                            title: Tresult[i].serviceType + " " + " with " + " " + Uresult.firstName,
                            body: "This is to notify that your " + Tresult[i].serviceType + " With " + Uresult.firstName + " " + Uresult.lastName + " has been scheduled" + " Happy Konecting!!",
                            status: "active",
                            notificationFrom: Uresult._id
                          });
                          // Insert Notification
                          Notification.createNotification(newNotification, function (err, credits) {
                            if (err) {
                              //res.send(err);
                            } else {
                            }
                          });
                          // End of Insert Notification
                        }
                      });

                    }
                  });


                  //call Service transaction status update to set r3status = 1

                }
              });
            }
          });
        });

      }

    }
  });

}, false);

chatformember.start();

/////////////////// Chat for Member End////////////////////////////////////////////////////

//////////// changing live status////////////////////////////////////////////////////////////

var livestatus = cron.schedule('* */60 * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime());
  //console.log("S1:",currenttime);

  var jobendtime = new Date(parsedDate.getTime() - (100000 * 36));

  let query = { liveStatusDate: { $lte: jobendtime } };

  serviceTransaction.find(query, function (err, Tresult) {
    if (Tresult == null) {
    } else {
      //console.log(Tresult);
      for (let i = 0; i < Tresult.length; i++) {
        //console.log("test1",Tresult);
        let id1 = Tresult[i].receiverId;

        let id3 = Tresult[i].senderId;

        //livestatus = Tresult[i].liveStatusDate;
        reqBody = {};
        reqBody.liveStatus = "offline";
        reqBody.isOnline = "false";
        //console.log(reqBody)
        User.findByIdAndUpdate(id1, reqBody, function (err, Cresult) {
          if (err) return res.send(err);
          //console.log(Cresult)
        });
        User.findByIdAndUpdate(id3, reqBody, function (err, Uresult) {
          if (err) return res.send(err);
          //console.log(Uresult)
        });


      }

    }
  });

}, false);

//livestatus.start();



///////////// changing live status End ////////////////////////////////////////////////////////////

//////////// changing live status 1////////////////////////////////////////////////////////////

var livestatus1 = cron.schedule('* */10 * * * *', function (req, res) {
  //console.log(req);

  // let currenttime = new Date().toISOString();
  // var parsedDate = new Date(Date.parse(currenttime))

  // currenttime = new Date(parsedDate.getTime());
  // //console.log("S1:",currenttime);

  // var jobendtime = new Date(parsedDate.getTime() - (100000 * 36));

  // let query = { liveStatusDate: { $lte: jobendtime } };

  // Get Member and Celebrity Profiles Data
  //User.findById(celebrityId, function (err, SMresult) {
  User.find({}, function (err, Uresult) {
    //console.log(Uresult);
    for (let i = 0; i < Uresult.length; i++) {
      //console.log(Uresult[i].email);
      if (Uresult == null) {
      } else {
        let id2 = Uresult[i].email;
        //console.log(id2);
        logins.find({ email: id2 }, function (err, Lresult) {
          //console.log(Lresult);
          if (Lresult == null) {
            //console.log("test", Lresult);
          } else {
            //let t1 = Lresult.email;
            for (let i = 0; i < Lresult.length; i++) {
              let dToken = Lresult[i].deviceToken;
              //console.log(dToken);
              var message = {
                to: dToken,
                collapse_key: 'Service-alerts',
                notification: {
                  title: 'Alert!!',
                  body: "" + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
                }
              };
              fcm.send(message, function (err, response) {
                //console.log(response);
                if (err) {
                  //console.log(err)
                } else {
                  let id3 = Uresult[i]._id;
                  //console.log(id3);

                  // //livestatus = Tresult[i].liveStatusDate;
                  reqBody = {};
                  reqBody.liveStatus = "offline";
                  reqBody.isOnline = "false";
                  //console.log(reqBody)
                  User.findByIdAndUpdate(id3, reqBody, function (err, Cresult) {
                    if (err) return //console.log(err);
                    //console.log(Cresult)
                  });

                  // console.log("Successfully sent with resposne :", response);
                }
              });
            }

          }
        });

      }
    }


  });
  //});
  // End of Get Member and Celebrity Data

}, false);

//livestatus1.start();



///////////// changing live status 1 End ////////////////////////////////////////////////////////////


//////////// changing live status 1////////////////////////////////////////////////////////////

var livestatus2 = cron.schedule('*/2 * * * * *', function () {

  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime());
  //console.log("S1:",currenttime);

  var jobendtime = new Date(parsedDate.getTime() - (1000 * 5));

  let query = { iosUpdatedAt: { $lte: jobendtime } };
  //console.log(query);

  // User.find({ query }, function (err, users) {
  //   if (err) return next(err);
  //   res.json(users);

  reqBody = {};
  reqBody.liveStatus = "offline";
  reqBody.isOnline = "false";
  //console.log(reqBody)
  User.findByIdAndUpdate(query, reqBody, function (err, Cresult) {
    if (Cresult == null) {
      //console.log("not found");
    }
    if (err) return console.log(err);
    //console.log(Cresult)
  });

  // });


}, false);

//livestatus2.start();



///////////// changing live status 1 End ////////////////////////////////////////////////////////////


//////////////removing refarral credits after 2 months  start/////////////////////////////////////
var refarralCreditsExpire = cron.schedule('*/10 * * * * *', function () {
  let currenttime = new Date().toISOString();
  var parsedDate = new Date(Date.parse(currenttime))

  currenttime = new Date(parsedDate.getTime());
  //console.log("S1:",currenttime);

  var jobendtime = new Date(parsedDate.getTime() + (1000 * 60));

  let query = { createdAt: { $gte: jobendtime } };

  Credits.find(query, function (err, cresult) {
    if (err) return console.log(err);
    if (cresult) {
      //console.log(cresult);
      for (let i = 0; i < cresult.length; i++) {
        //console.log(cresult[i]);
        Credits.find(
          { memberId: cresult[i].senderId },
          null,
          { sort: { createdAt: -1 } },
          function (err, cBal) {
            if (err) return res.send(err);
            if (cBal) {
              cBalObj = cBal[0];

              //oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
              //oldReferralCreditValue = parseInt(cBalObj.referralCreditValue);

              //newCumulativeCreditValue = parseInt(cumulativeCreditValue) + parseInt(cresult.cumulativeCreditValue);

              newReferralCreditValue = parseInt(cBalObj.referralCreditValue) - parseInt(cresult.referralCreditValue);

              let newCredits = new Credits({
                memberId: cresult[i].memberId,
                creditType: "debit",
                creditValue: cresult.referralCreditValue,
                cumulativeCreditValue: cBalObj.cumulativeCreditValue,
                referralCreditValue: parseInt(cBalObj.referralCreditValue) - parseInt(cresult.referralCreditValue),
                //referralCreditValue: referralCreditValue,
                remarks: "Credits Expired",
                createdBy: "Admin"
              });
              // Insert Into Credit Table
              Credits.createCredits(newCredits, function (err, credits) {
                if (err) {
                  res.send(err);
                } else {
                  // res.send({
                  //   message: "Credits updated successfully",
                  //   creditsData: credits
                  // });
                }
              });

            }
            else {
            }

          }
        );

      }

    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({
    createdAt: -1
  });

}, false);

//refarralCreditsExpire.start();



//////////////removing refarral credits after 2 months  end//////////////////////////////////////





// getByUserID start

router.get("/getByUserID/:userID", function (req, res) {
  let id = req.params.userID;
  serviceTransaction.aggregate(
    [
      { $match: { $or: [{ senderId: ObjectId(id) }, { receiverId: ObjectId(id) }] } },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "senderProfile"
        }
      },
      { $unwind: "$senderProfile" },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiverProfile"
        }
      },
      { $unwind: "$receiverProfile" },
      { $sort: { startTime: -1 } }
    ],
    function (err, data) {
      if (err) {
        res.send(err);
      }
      return res.send(data);
    }
  );
});
// End getByUserID

// Find by userId and serviceType start

router.post("/schduleByServiceType", function (req, res) {
  let id = req.body.senderId;
  let serviceType = req.body.serviceType;

  serviceTransaction.aggregate(
    [
      { $match: { $or: [{ senderId: ObjectId(id) }, { receiverId: ObjectId(id) }] } },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "senderProfile"
        }
      },
      { $unwind: "$senderProfile" },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiverProfile"
        }
      },
      { $unwind: "$receiverProfile" },
      { $match: { serviceType: serviceType } }
    ],
    function (err, data) {
      if (err) {
        res.send(err);
      }
      return res.send(data);
    }
  );
});
// End Find by userId and serviceType

// getAll start
router.get("/getAll", (req, res) => {
  serviceTransaction.find({}, (err, result) => {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({ createdAt: -1 });
});
// End getAll

// getAllServiceTrasactionJob start

router.get("/getAllServiceTrasactionJob", function (req, res) {

  serviceTransaction.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End getAllServiceTrasactionJob

// delete ServiceTransactionById start

router.delete("/deleteServiceTransactionById/:id", function (req, res, next) {
  let id = req.params.id;

  serviceTransaction.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "Deleted serviceTransaction Successfully" });
    }
  });
});
// End delete ServiceTransactionById


// Create a Notification record
router.post("/adminNotification", function (req, res) {
  let body = req.body.body;
  let title = req.body.title;
  let dToken = req.body.deviceToken;


  // logins.find({ }, function (err, Lresult) {
  //   console.log(Lresult);
  //   for(i=0;i<=Lresult.length;i++){


  var message = {
    "registration_ids": dToken,
    collapse_key: 'Notificaitons',

    notification: {
      title: title,
      body: body,
    }

  };
  fcm.send(message, function (err, response) {
    if (err) {
    } else {
      res.send(response);
    }
    //   });
    // }
  });



});
// End of Create a Notification record



//get call history coantact persom Prathmesh
router.get("/getCallHistoryByMemberId/:memberId", function (req, res) {
  serviceTransaction.find({
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
    }]
  }, { _id: 1, receiverId: 1, senderId: 1, serviceType: 1, startTime: 1, endTime: 1, liveStatusDate: 1, createdAt: 1, updatedAt: 1 }, (err, allCallsHistory) => {
    allCallsHistory.map((callDetails) => {
      if (callDetails.receiverId == req.params.memberId) {
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
    })
    // allCallsHistory = allCallsHistory.map((callDetails)=>{
    //   if(callDetails.receiverId && callDetails.senderId)
    //   {
    //     if(callDetails.receiverId._id == req.params.memberId)
    //     {
    //       Object.assign(callDetails, {
    //         "incoming" : true,
    //         "outgoing" : false
    //       });
    //     }
    //     else{
    //       Object.assign(callDetails, {
    //         "incoming" : false,
    //         "outgoing" : true
    //       });
    //     }
    //     return callDetails;
    //   }
    res.json({ "allCallsHistory": allCallsHistory })
  }).populate({ path: 'senderId', select: '_id avtar_imgPath firstName lastName' })
    .populate({ path: 'receiverId', select: '_id avtar_imgPath firstName lastName' })
    .sort({ createdAt: -1 }).lean();
});
//call histry end//

//created new one for above api 
//d - p
//

router.get("/newGetCallHistoryByMemberId/:memberId", function (req, res) {
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
    // console.log("fanOfDetails",fanOfDetails)
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
          // callHistoryObj.map((obj)=>{
          // console.log(obj._id)
          // console.log(callHistoryObj._id.senderId[0])
          // if(callHistoryObj._id.senderId[0] == undefined)
          // {
          //   console.log("********************sender")
          //   console.log(callHistoryObj._id)
          // }
          // })
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
        // allCallsHistoryGroupedObj.sort(function (a, b) {
        //   // convert date object into number to resolve issue in typescript
        //   return new Date(b.lastCallStatus.createdAt) - new Date(a.lastCallStatus.createdAt);
        // })
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
          }, 3000)
        }
        main();
        // res.json({ allCallsHistory: allCallsHistoryGroupedObj })
      }
    })
  })

});

// get total calls
router.get("/getCallReport", function (req, res) {

  //let id = req.params.userID;
  serviceTransaction.aggregate([

    {
      $match: {
        startTime: { $ne: "endTime" }
      }
    },
    {
      $lookup:
      {
        from: 'users',
        localField: 'receiverId',
        foreignField: '_id',
        as: 'receiverDetails'
      }
    },
    {
      "$group": {
        "_id": {
          "serviceType": "$serviceType",
          "receiverId": "$receiverId",
          "receiverDetails": "$receiverDetails"
        },
        "count": { "$sum": 1 }
      }
    },


  ]).exec(function (error, fetchAllTopUsers) {
    //console.log('##################');
    console.log(fetchAllTopUsers);
    res.send(fetchAllTopUsers);
  });
})
// End get total calls

//call histry end//

// async function f(memberId,res) {
//   let promise = new Promise((resolve, reject) => {
//     MemberPreferences.aggregate([
//       {
//         $match: {
//           "memberId": ObjectId(memberId)
//         }
//       },
//       {
//         $unwind: "$celebrities"
//       },
//       {
//         $match: {
//           "celebrities.isFan": true
//         }
//       },
//       {
//         $group: {
//           _id: {
//             _id: "$_id"
//           },
//           celebrities: { $push: "$celebrities.CelebrityId" }
//         }
//       },
//       { "$limit": 1 },
//       {
//         $project: {
//           _id: 1,
//           memberId: 1,
//           "celebrities": 1
//         }
//       }
//     ], (err, fanOfDetails) => {
//       // console.log("fanOfDetails",fanOfDetails)
//       if (err) {
//         res.json({ err: err, allCallsHistory: null })
//       }
//       if (fanOfDetails.length)
//         fanOfDetails = fanOfDetails[0].celebrities;
//       else
//         fanOfDetails = [];
//       serviceTransaction.aggregate([
//         {
//           $match: {
//             $and: [{
//               $or: [
//                 { senderId: ObjectId(memberId) },
//                 { receiverId: ObjectId(memberId) }
//               ]
//             },
//             {
//               $or: [
//                 { serviceType: "video" },
//                 { serviceType: "audio" }
//               ]
//             },

//           ]
//           },
//         },
//         {
//           $lookup:
//           {
//             from: 'users',
//             localField: 'senderId',
//             foreignField: '_id',
//             as: 'senderId'
//           }
//         },
//         {
//           $lookup:
//           {
//             from: 'users',
//             localField: 'receiverId',
//             foreignField: '_id',
//             as: 'receiverId'
//           }
//         },
//         {
//           $sort:
//           {
//             createdAt: 1
//           }
//         },
//         {
//           $group: {
//             _id: {
//               senderId: "$senderId",
//               receiverId: "$receiverId",
//               serviceType: "$serviceType",
//               month: { $month: "$createdAt" },
//               day: { $dayOfMonth: "$createdAt" },
//               year: { $year: "$createdAt" }
//             },
//             allCallsHistory: { $push: "$$ROOT" }
//           }
//         },
//         {
//           $sort:
//           {
//             "_id.day": -1
//           }
//         },
//         {
//           $sort:
//           {
//             "_id.month": -1
//           }
//         },
//         {
//           $sort:
//           {
//             "_id.year": -1
//           }
//         },
//         {
//           $sort:
//           {
//             createdAt: -1
//           }
//         },
//         {
//           $project: {
//             _id: {
//               senderId: {
//                 _id: 1,
//                 avtar_imgPath: 1,
//                 firstName: 1,
//                 lastName: 1,
//                 isCeleb: 1,
//                 isFan: 1,
//                 isOnline: 1,
//                 profession: 1,
//                 aboutMe: 1,
//                 role: 1
//               },
//               receiverId: {
//                 _id: 1,
//                 avtar_imgPath: 1,
//                 firstName: 1,
//                 lastName: 1,
//                 isCeleb: 1,
//                 isFan: 1,
//                 isOnline: 1,
//                 profession: 1,
//                 aboutMe: 1,
//                 role: 1
//               },
//               serviceType: 1,
//               month: 1,
//               day: 1,
//               year: 1
//             },
//             allCallsHistory: {
//               _id: 1,
//               senderId: {
//                 _id: 1,
//                 avtar_imgPath: 1,
//                 firstName: 1,
//                 lastName: 1,
//                 isCeleb: 1,
//                 isFan: 1,
//                 isOnline: 1,
//                 profession: 1,
//                 aboutMe: 1,
//                 role: 1
//               },
//               receiverId: {
//                 _id: 1,
//                 avtar_imgPath: 1,
//                 firstName: 1,
//                 lastName: 1,
//                 isCeleb: 1,
//                 isFan: 1,
//                 isOnline: 1,
//                 profession: 1,
//                 aboutMe: 1,
//                 role: 1
//               },
//               serviceType: 1,
//               startTime: 1,
//               endTime: 1,
//               liveStatusDate: 1,
//               createdAt: 1,
//               updatedAt: 1,
//                ago :{ $subtract: [ new Date(),"$createdAt" ] },
//             },
//             numberOfCalls: { $size: "$allCallsHistory" }
//           }
//         },
//       ], (err, allCallsHistoryGroupedObj) => {
//         if (err) {
//           res.json({ err: err, allCallsHistory: null })
//         }
//         else {
//           allCallsHistoryGroupedObj = allCallsHistoryGroupedObj.filter((callHistoryObj) => {
//             if (callHistoryObj._id.receiverId.length && callHistoryObj._id.senderId.length) {
//               return callHistoryObj
//             }
//             else {
//               console.log(callHistoryObj._id)
//             }
//           });
//           let allCallsHistoryGroupedObj1 = allCallsHistoryGroupedObj;
//           allCallsHistoryGroupedObj.map((callHistoryObj, index) => {
//             let duplicate = allCallsHistoryGroupedObj1.filter((callHistoryObj2, index2) => {
//               if ((callHistoryObj2._id.serviceType == callHistoryObj._id.serviceType) &&
//                 (callHistoryObj2._id.month == callHistoryObj._id.month) &&
//                 (callHistoryObj2._id.day == callHistoryObj._id.day) &&
//                 (callHistoryObj2._id.year == callHistoryObj._id.year) && (index != index2) &&
//                 (
//                   (callHistoryObj2._id.receiverId[0] && callHistoryObj2._id.senderId[0] && callHistoryObj._id.receiverId[0] && callHistoryObj._id.senderId[0]) && ((callHistoryObj2._id.senderId[0]._id + "" != memberId + "") ?
//                     (callHistoryObj2._id.senderId[0]._id + "" == callHistoryObj._id.receiverId[0]._id + "") :
//                     (callHistoryObj2._id.receiverId[0]._id + "" == callHistoryObj._id.receiverId[0]._id + ""))
//                 )) {
//                 allCallsHistoryGroupedObj.splice(index2, 1);
//                 return callHistoryObj2;
//               }
//             })

//             if (duplicate[0] != undefined && duplicate[0].allCallsHistory != []) {
//               duplicate[0].allCallsHistory.forEach((callDetails) => {
//                 callHistoryObj.allCallsHistory.push(callDetails)
//               })
//               callHistoryObj.numberOfCalls = callHistoryObj.allCallsHistory.length;
//             }
//           })
//           allCallsHistoryGroupedObj.map((callHistoryObj) => {
//             callHistoryObj.allCallsHistory.map((callDetails) => {
//               if (callDetails.receiverId[0]._id == memberId) {
//                 Object.assign(callDetails, {
//                   "incoming": true,
//                   "outgoing": false
//                 });
//               }
//               else {
//                 Object.assign(callDetails, {
//                   "incoming": false,
//                   "outgoing": true
//                 });
//               }
//               callDetails.senderId = callDetails.senderId[0];
//               callDetails.receiverId = callDetails.receiverId[0];
//               callDetails.callDuration = secondsToHms(((callDetails.endTime - callDetails.startTime) / 1000))
//             })
//             if (callHistoryObj._id.receiverId[0] && callHistoryObj._id.senderId[0]) {
//               var receiverId = callHistoryObj._id.receiverId[0]._id + ""
//               var senderId = callHistoryObj._id.senderId[0]._id + ""
//               callHistoryObj._id.isFan = fanOfDetails.some((fanId) => {
//                 return (fanId == receiverId) || (fanId == senderId);
//               })
//             } else {
//               callHistoryObj._id.isFan = false;
//             }
//             //sort call history
//             callHistoryObj.allCallsHistory.sort(function (a, b) {
//               // convert date object into number to resolve issue in typescript
//               return +new Date(b.createdAt) - +new Date(a.createdAt);
//             })
//             callHistoryObj._id.senderId = callHistoryObj._id.senderId[0];
//             callHistoryObj._id.receiverId = callHistoryObj._id.receiverId[0];
//             callHistoryObj.lastCallStatus = callHistoryObj.allCallsHistory[0];
//           })
//           resolve(allCallsHistoryGroupedObj)
//         }
//       })
//     })

//   });

//   let allCallsHistoryGroupedObj = await promise; // wait till the promise resolves (*)
//   // console.log(allCallsHistoryGroupedObj)
//   return res.json({ allCallsHistory: allCallsHistoryGroupedObj });
// }


// router.get("/newGetCallHistoryByMemberId/:memberId", function (req, res) {
//   let allCallsHistoryGroupedObj = f(req.params.memberId,res);
//   console.log(allCallsHistoryGroupedObj)

// });


router.get("/getAll/:pageNo/:limit", ServiceTransactionController.getAll)

module.exports = router;
