let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let User = require("../users/userModel");
let Notification = require("./notificationModel");
let logins = require("../loginInfo/loginInfoModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
let notificationSetting = require("../notificationSettings/notificationSettingsModel");
let NotificationController = require("./notificationController");
let async = require("async");
let OTPServices = require("../otp/otpRouter")


let request = require('request');
let email = require("../../routes/email");
let OTP = require("../otp/otpModel");

router.post("/createNotification", (req, res) => {
  let memberId = req.body.memberId;
  let activity = req.body.activity;
  let title = req.body.title;
  let body = req.body.body;
  let status = req.body.status;
  let createdBy = req.body.createdBy;
  let notificationType = req.body.notificationType;
  let celebrityId = req.body.celebrityId;


  if (notificationType == "Fan") {
    if ((notificationType != "unFan") && (notificationType != "unFollow")) {
      //console.log("hi");
      // Get Member and Celebrity Profiles Data
      User.findById(celebrityId, (err, SMresult) => {
        User.findById(memberId, (err, Uresult) => {
          if (Uresult == null) { } else {
            let cond = [];
            if (SMresult.email && SMresult.email != "") {
              cond.push({ email: SMresult.email })
            } else if (SMresult.mobileNumber && SMresult.mobileNumber != "") {
              cond.push({ mobileNumber: { $regex: SMresult.mobileNumber } })
            }
            let query = {
              $or: cond
            }
            logins.findOne(query, (err, Lresult) => {
              if (Lresult == null) {
                console.log("user doesn't exited")
              } else {
                let dToken = Lresult.deviceToken
                let newNotification = new Notification({
                  memberId: celebrityId,
                  activity: "FAN",
                  notificationSettingId: "5b5ebe31fef3737e09fb3849",
                  title: "Alert!!",
                  body: Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
                  status: status,
                  notificationType: notificationType,
                  notificationFrom: Uresult._id,
                  createdBy: createdBy
                });
                Notification.createNotification(newNotification, (err, credits) => {
                  if (err) {
                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                  } else {
                    res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
                    let query = {
                      $and: [{ memberId: celebrityId }, { notificationSettingId: "5b5ebe31fef3737e09fb3849" }, { isEnabled: "false" }]
                    };
                    notificationSetting.find(query, (err, rest) => {
                      if (err)
                        return res.send(err);
                      if (rest == "" || rest.isEnabled == true) {
                        //old code
                        //body: "Greetings from CelebKonect! " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
                        let data, notification;
                        if (Lresult.osType == "Android") {
                          data = {
                            serviceType: "Fan",
                            title: 'Alert!!',
                            memberId: memberId,
                            notificationType: notificationType,
                            body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                            activity: "FAN"
                          },
                            OTPServices.sendAndriodPushNotification(dToken, "Feed Alert!!", data, (err, successNotificationObj) => {
                              if (err)
                                console.log(err)
                              else {
                                console.log(successNotificationObj)
                              }
                            });
                        } else if (osType == "IOS") {
                          notification = {
                            serviceType: "Fan",
                            notificationType: notificationType,
                            title: 'Alert!!',
                            body: Uresult.firstName + " " + Uresult.lastName + " is your FAN now.",
                            activity: "FAN"
                          }
                          OTPServices.sendIOSPushNotification(dToken, notification, (err, successNotificationObj) => {
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
              }
            });
          }
        });
      });
      // End of Get Member and Celebrity Data
    }

  } else if (notificationType == "Follow") {
    if ((notificationType != "unFan") && (notificationType != "unFollow")) {
      // Get Member and Celebrity Profiles Data
      User.findById(celebrityId, (err, SMresult) => {
        User.findById(memberId, (err, Uresult) => {
          if (Uresult == null) { } else {
            let id2 = SMresult.email;
            logins.findOne({
              email: id2
            }, (err, Lresult) => {
              if (Lresult == null) { } else {
                let dToken = Lresult.deviceToken
                //console.log(dToken);
                let newNotification = new Notification({
                  memberId: celebrityId,
                  activity: "FOLLOW",
                  notificationSettingId: "5b5ebe31fef3737e09fb3849",
                  title: "Alert!!",
                  body:  Uresult.firstName + " " + Uresult.lastName + " has become your follower. Happy Konecting !!",
                  status: status,
                  notificationType: notificationType,
                  notificationFrom: Uresult._id,
                  createdBy: createdBy
                });
                //Insert Notification
                Notification.createNotification(newNotification, (err, credits) => {
                  if (err) {
                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                  } else {
                    res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
                    let query = {
                      $and: [{
                        memberId: celebrityId
                      }, {
                        notificationSettingId: "5b5ebe31fef3737e09fb3849"
                      }, {
                        isEnabled: "false"
                      }]
                    };
                    //let query = { memberId: celebrityId, notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") };
                    //console.log(celebrityId);
                    notificationSetting.find(query, (err, rest) => {
                      if (err) return res.send(err);
                      //console.log("t1", rest);
                      if (rest == "" || rest.isEnabled == true) {

                        let data, notification;
                        if (Lresult.osType == "Android") {
                          data = {
                            serviceType: "Follow",
                            title: 'Alert!!',
                            memberId: memberId,
                            notificationType: notificationType,
                            body: Uresult.firstName + " " + Uresult.lastName + " started Following you.",
                            activity: "FOLLOW"
                          },
                            otpService.sendAndriodPushNotification(dToken, "Feed Alert!!", data, (err, successNotificationObj) => {
                              if (err)
                                console.log(err)
                              else {
                                console.log(successNotificationObj)
                              }
                            });
                        } else if (osType == "IOS") {
                          notification = {
                            serviceType: "Follow",
                            notificationType: notificationType,
                            title: 'Alert!!',
                            body: Uresult.firstName + " " + Uresult.lastName + " started Following you.",
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
  } else if (notificationType == "unFan") {
    let newNotification = new Notification({
      memberId: celebrityId,
      activity: activity,
      notificationFrom: Uresult._id,
      title: title,
      body: body,
      status: status,
      notificationType: notificationType,
      createdBy: createdBy
    });
    //Insert Notification
    Notification.createNotification(newNotification, (err, credits) => {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      } else {
        res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
      }
    });


  } else if (notificationType == "unFollow") {

    let newNotification = new Notification({
      memberId: celebrityId,
      activity: activity,
      notificationFrom: Uresult._id,
      title: title,
      body: body,
      status: status,
      notificationType: notificationType,
      createdBy: createdBy
    });
    //Insert Notification
    Notification.createNotification(newNotification, (err, credits) => {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      } else {
        res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
      }
    });


  }


  //}
  //});
  // End of Inset Notification

});
// End of Create a Notification record

// Update notification information
router.put("/updateNotification/:notificationID", (req, res) => {
  let id = req.params.notificationID;

  let reqbody = req.body;

  reqbody.updatedAt = new Date();

  Notification.findById(id, (err, result) => {
    if (err) return res.send(err);
    if (result) {
      Notification.findByIdAndUpdate(id, reqbody, (err, result) => {
        if (err) return res.send(err);
        let message = "Notification updated successfully."
        if (req.body.status == "isArchieved") {
          message = "Notification archived successfully."
          res.json({ token: req.headers['x-access-token'], success: 1, message: message })

        }
        else if (req.body.status == "isViewed") {
          message = "Notification Viewed successfully."
          res.json({ token: req.headers['x-access-token'], success: 1, message: message })

        }
        else if (req.body.status == "isDeleted") {
          message = "Notification deleted successfully."
          res.json({ token: req.headers['x-access-token'], success: 1, message: message })

        } else if (result.activity == "audition") {
          message = "Recommendation Archived Successfully."
          res.json({ token: req.headers['x-access-token'], success: 1, message: message })

        }

      });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Notification not found / Invalid" });
    }
  });
});
// End of Update Notification information

// get by Id (getByNotificationID)
router.get("/getByNotificationID/:notificationID", (req, res) => {
  let id = req.params.notificationID;
  Notification.findById(id, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get by Id (notificationID)

// get Notifications By MemberID (not in used becuase off there is not pagination)
router.get("/getNotificationsByMemberID/:memberId", (req, res) => {
  let id = req.params.memberId;
  Notification.find({
    memberId: id,
    notificationType: { $ne: "audition" }
  }, (
    err,
    result
  ) => {
      if (err) return res.send(err);
      if (result) {
        res.json({ token: req.headers['x-access-token'], success: 1, data: result });
      } else {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" })
      }
    }).populate("notificationFrom", "_id firstName lastName avtar_imgPath").sort({
      createdAt: -1
    });
});

// get Notifications By MemberID
router.get("/getNotificationsByMemberID/:memberId/:createdAt/:limit", (req, res) => {
  let id = req.params.memberId;
  let createdAt = req.params.createdAt
  let getNotificatonByTime = new Date();
  let limit = parseInt(req.params.limit);
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  Notification.find({ memberId: id, status: { $nin: ["isDeleted", "isArchieved"] }, notificationType: { $ne: "audition" }, createdAt: { $lt: new Date(getNotificatonByTime) } }, (err, result) => {
    if (err) {
      return res.send(err);
    }
    if (!result) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" })
    } else {
      //{ $nin: ["isDeleted", "isArchieved"]}
      Notification.updateMany({ memberId: ObjectId(id), status: "active" }, { $set: { status: "isViewed" } }, (err, updatedObj) => {
        if (err) {
          console.log(err);
        } else {
          return res.json({ token: req.headers['x-access-token'], success: 1, data: result });
        }
      })

    }
  }).populate("notificationFrom", "_id firstName lastName avtar_imgPath").sort({
    createdAt: -1
  }).limit(limit);
});


router.get("/getNotificationsByServiceTypeAndMemberID/:memberId/:notificationType/:createdAt/:limit", (req, res) => {
  let id = req.params.memberId;
  let createdAt = req.params.createdAt
  notificationType = req.params.notificationType
  // console.log("notificationType==================",notificationType)
  let getNotificatonByTime = new Date();
  let limit = parseInt(req.params.limit);
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  let query = { status: { $nin: ["isDeleted", "isArchieved"] }, memberId: id, notificationType: notificationType, createdAt: { $lt: new Date(getNotificatonByTime) } }
  if (notificationType == "Manager") {
    query = { status: { $nin: ["isDeleted", "isArchieved"] }, memberId: id, notificationType: notificationType, createdAt: { $lt: new Date(getNotificatonByTime) } }
  } else if (notificationType == "FanFollow") {
    query = { status: { $nin: ["isDeleted", "isArchieved"] }, memberId: id, $or: [{ notificationType: "Fan" }, { notificationType: "Follow" }], createdAt: { $lt: new Date(getNotificatonByTime) } }
  }
  else if (notificationType == "Call") {
    query = { status: { $nin: ["isDeleted", "isArchieved"] }, memberId: id, notificationType: "Call", createdAt: { $lt: new Date(getNotificatonByTime) } }
  }
  //notificationType: "General",
  else if (notificationType == "General") {
    query = { status: { $nin: ["isDeleted", "isArchieved"] }, memberId: id, notificationType: { $in: ["General","Call", "Fan","Follow", "Credit"] }, createdAt: { $lt: new Date(getNotificatonByTime) } }
  }
  // console.log("query==================",query)
  Notification.find(query, (err, result) => {
    if (err) {
      return res.send(err);
    }
    if (result) {
      res.json({ token: req.headers['x-access-token'], success: 1, data: result });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" })
    }
  }).populate("notificationFrom", "_id firstName lastName avtar_imgPath").sort({
    createdAt: -1
  }).limit(limit);
});


router.get("/getArchivedNotificationsByMemberID/:memberId/:createdAt/:limit", (req, res) => {
  let id = req.params.memberId;
  let createdAt = req.params.createdAt
  let getNotificatonByTime = new Date();
  let limit = parseInt(req.params.limit);
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  Notification.find({ status: "isArchieved", memberId: id, notificationType: { $ne: "audition" }, createdAt: { $lt: new Date(getNotificatonByTime) } }, (err, result) => {
    if (err) {
      return res.send(err);
    }
    if (result) {
      res.json({ token: req.headers['x-access-token'], success: 1, data: result });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" })
    }
  }).populate("notificationFrom", "_id firstName lastName avtar_imgPath").sort({
    createdAt: -1
  }).limit(limit);
});


router.get("/getArchivedNotificationsByServiceTypeAndMemberID/:memberId/:notificationType/:createdAt/:limit", (req, res) => {
  let id = req.params.memberId;
  let createdAt = req.params.createdAt;
  notificationType = req.params.notificationType;
  let getNotificatonByTime = new Date();
  let limit = parseInt(req.params.limit);
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  let query = { status: "isArchieved", memberId: id, notificationType: notificationType, createdAt: { $lt: new Date(getNotificatonByTime) } }
  if (notificationType == "Manager") {
    query = { status: "isArchieved", memberId: id, notificationType: notificationType, createdAt: { $lt: new Date(getNotificatonByTime) } }
  } else if (notificationType == "FanFollow") {
    query = { status: "isArchieved", memberId: id, $or: [{ notificationType: "Fan" }, { notificationType: "Follow" }], createdAt: { $lt: new Date(getNotificatonByTime) } }
  }
  else if (notificationType == "Call") {
    query = { status: "isArchieved", memberId: id, notificationType: "Call", createdAt: { $lt: new Date(getNotificatonByTime) } }
  }
  else if (notificationType == "General") {
    query = { status: "isArchieved", memberId: id, notificationType: "General", createdAt: { $lt: new Date(getNotificatonByTime) } }
  }
  Notification.find(query, (err, result) => {
    if (err) {
      return res.send(err);
    }
    if (result) {
      res.json({ token: req.headers['x-access-token'], success: 1, data: result });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" })
    }
  }).populate("notificationFrom", "_id firstName lastName avtar_imgPath").sort({
    createdAt: -1
  }).limit(limit);
});

// get Notifications By MemberID
router.get("/getNotificationsCount/:memberId", (req, res) => {
  let id = req.params.memberId;
  Notification.find({
    memberId: id,
    status: "active",
    notificationType: { $ne: "audition" }
  }, (
    err,
    result
  ) => {
      //if (err) return res.send(err);
      //console.log("noteREesult",result)
      if (result) {
        res.send(result);
      } else {
        res.json({
          error: "Notifications not exits / send a valid memberId"
        });
      }
    }).sort({
      createdAt: -1
    });
});
// End of get Notifications By MemberID

// get Notifications By MemberID Missed
router.get("/getNotificationsByMemberIdMissed/:memberId", (req, res) => {
  let id = req.params.memberId;
  let query = {
    $and: [{
      memberId: id
    }, {
      notificationType: "missedcall"
    }, {
      status: "active"
    }]
  };
  Notification.find(query, (
    err,
    result
  ) => {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Notifications not exits / send a valid memberId"
      });
    }
  }).sort({
    createdAt: -1
  });
});


router.get("/getNotificationsByMemberIdAudition/:memberId", (req, res) => {
  let id = req.params.memberId;
  let query = {
    memberId: ObjectId(id), notificationType: "audition", $or: [{ status: "active" }, { status: "isViewed" }]
  };
  Notification.find(query, (
    err,
    result
  ) => {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    if (result) {
      result = result.filter((res) => {
        if (res.auditionId) {
          res.isFevourite = false;
          if (res.auditionId.favoritedBy && res.auditionId.favoritedBy.length) {
            res.isFevourite = res.auditionId.favoritedBy.some((user) => {
              return user.memberId && (user.memberId.toString() == id);
            })
          }
          res.auditionId = res.auditionId._id;
          return res;
        }
      })
      res.json({ token: req.headers['x-access-token'], success: 1, data: result });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" });
    }
  }).sort({
    createdAt: -1
  }).populate('auditionId').lean();

  //old code end
});

// get Notifications By MemberID Missed
router.get("/getNotificationsByMemberIdIsArchieved/:memberId", (req, res) => {
  let id = req.params.memberId;
  let query = {
    $and: [{
      memberId: id
    }, {
      notificationType: "audition"
    }, {
      status: "isArchieved"
    }]
  };
  Notification.find(query, (
    err,
    result
  ) => {
    if (err) return res.send(err);
    if (result) {
      res.json({ token: req.headers['x-access-token'], success: 1, data: result });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" });
    }
  }).sort({
    updatedAt: -1
  });
});
// End of get Notifications By MemberID

// getNotificationsByMemberIdIsArchievedGeneral
router.get("/getNotificationsByMemberIdIsArchievedGeneral/:memberId", (req, res) => {
  let id = req.params.memberId;
  let query = {
    $and: [{
      memberId: id
    }, {
      status: "isArchieved"
    },
    { notificationType: { $ne: "audition" } }]
  };
  Notification.find(query, (
    err,
    result
  ) => {
    if (err) {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        message: `${err}`
      });
    }
    if (result) {
      res.json({
        success: 1,
        token: req.headers['x-access-token'],
        data: result
      });
    } else {
      res.json({
        success: 0,
        token: req.headers['x-access-token'],
        error: "Notifications not exits / send a valid memberId"
      });
    }
  }).sort({
    updatedAt: -1
  });
});

// End of getNotificationsByMemberIdIsArchievedGeneral

// get Notifications By MemberID
router.get("/getNotificationsByMemberIdNotificationType/:memberId/:notificationType", (req, res) => {
  let id = req.params.memberId;
  let notificationType = req.params.notificationType;
  let query = {
    $and: [{
      memberId: id
    }, {
      notificationType: notificationType
    }, {
      status: "active"
    }]
  };
  Notification.find(query, (
    err,
    result
  ) => {
    if (err) return res.send(err);
    if (result) {
      res.json({ token: req.headers['x-access-token'], success: 1, data: result });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Notifications not exits / send a valid memberId" });
    }
  }).sort({
    createdAt: -1
  });
});
// End of get Notifications By MemberID

// get list of all Notifications
router.get("/getAll", (req, res) => {
  Notification.find({}, (err, result) => {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End of get list of all Notifications

// Delete Notification
router.delete("/delete/:notificationID", (req, res, next) => {
  let id = req.params.notificationID;

  Notification.findById(id, (err, result) => {
    if (err) return res.send(err);
    if (result) {
      Notification.findByIdAndRemove(id, (err, post) => {
        if (err) return res.send(err);
        res.json({
          message: "Deleted Notification successfully"
        });
      });
    } else {
      res.json({
        error: "Notification not found / Invalid"
      });
    }
  });
});
// End of Delete Notification


// Get OTP Verification
router.post("/getOTP", (req, res) => {
  console.log(req.body)
  if (req.body.medium == "mobile") {
    async.waterfall([
      /// Fetch member details
      (callback) => {
        User.findById(req.body.memberId, (err, memberObj) => {
          if (err)
            return callback(new Error(`Error While fetching member details : ${err}`), null);
          else if (!memberObj || memberObj == "") {
            return callback(new Error(`Please provide valid details`), null)
          } else {
            callback(null, memberObj);
          }
        })
      },
      /// call to MSGWOW sms gateway to get the OTP
      (memberObj, callback) => {

        OTPServices.getOTP("mobile", memberObj.mobileNumber, null, req.body.reason, (err, data, body) => {
          if (err) {
            callback(new Error(`Error While sending OTP : ${error}`), null);
          } else {
            if (body == 'Please Enter Valid Sender ID') {
              status = "Invalid Sender ID";
              callBack(null, memberObj);
            } else {
              callback(null, memberObj);
            }
          }
        })
      }
    ], (err, memberObj) => {
      // result now equals 'done'
      if (err)
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 0,
          message: `${err.message}`
        });
      else
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 1,
          message: 'OTP sent successfully'
        });
    });
  } else if (req.body.medium == "email") {
    /// Fetch member details
    async.waterfall([
      (callback) => {
        User.findById(req.body.memberId, (err, memberObj) => {
          if (err)
            return callback(new Error(`Error While fetching member details : ${err}`), null);
          else if (!memberObj || memberObj == "") {
            return callback(new Error(`Please provide valid details`), null)
          } else {
            callback(null, memberObj);
          }
        })
      },
      /// create OTP to send in EMAIL
      (memberObj, callback) => {
        let OTPcode = Math.floor(100000 + Math.random() * 900000);
        // save the OTP in Database
        let newOTP = new OTP({
          memberId: memberObj._id,
          medium: "email",
          reason: req.body.reason,
          OTP: OTPcode,
          toAddress: memberObj.email,
          expiryTimeInMins: 60,

        });
        OTP.createOTP(newOTP, (err, user) => {
          if (err) {
            return callback(new Error(`Error While sending OTP : ${err}`), null);
          } else {
            callback(null, memberObj, OTPcode)
          }
        });

      },
      /// send EMAIL using Mandrill Gateway
      (memberObj, OTPcode, callback) => {
        var message = {
          "html": "<p>Welcome to celebkonect!! your OTP for verification is " + OTPcode + "</p>. <p>OTP valid for next 1Hr.</p>",
          "subject": "OTP Verification for CelebKonect",
          "from_email": "admin@celebkonect.com",
          "from_name": "CelebKonect",
          "to": [{
            "email": memberObj.email,
            "name": memberObj.firstName + " " + memberObj.lastName,
            "type": "to"
          }],
        };
        //console.log(message)
        email.sendEmail(message, (err, result) => {
          // console.log(result)
          if (result[0].status == "sent") {
            callback(null, memberObj)
          } else {
            return callback(new Error(`OTP sending failed, please try again after sometime`), null);
          }
        });
      }
    ], (err, memberObj) => {
      // result now equals 'done'
      if (err)
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 0,
          message: `${err.message}`
        });
      else
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 1,
          message: 'OTP sent successfully'
        });
    });
  } else {
    res.status(200).json({
      token: req.headers['x-access-token'],
      success: 0,
      message: 'Invalid medium'
    });
  }
});
// End of Get OTP Verification

// verify OTP
router.post("/verifyOTP", (req, res) => {
  if (req.body.medium == "mobile") {
    async.waterfall([
      (callback) => {
        User.findById(req.body.memberId, (err, memberObj) => {
          if (err)
            return callback(new Error(`Error While fetching member details : ${err}`), null);
          else if (!memberObj || memberObj == "") {
            return callback(new Error(`Please provide valid details`), null)
          } else {
            callback(null, memberObj);
          }
        })
      },
      (memberObj, callback) => {
        // let ApiToken = "214777AbOoSEwKiYX5af41211";
        // let sender = "CKONCT";
        ////// Verify OTP //////////
        // request("http://sms.fly.biz/api/otp.php?authkey=" + ApiToken + "&mobile=" + memberObj.mobileNumber + "&otp=" + req.body.OTP, function (error, response, body) {
        //   if (error) {
        //     callback(new Error(`Error While sending OTP : ${error}`), null);
        //   }
        //   let Body = JSON.parse(body)
        //   //console.log('============ OTP VERIFICATION ==============')
        //   //console.log(body)
        //  // console.log('============ OTP VERIFICATION ==============')
        //   if (Body.message == "otp_not_verified") {
        //     callback(new Error(`Invalid OTP, Mobile number verification failed. Please try again later.`), null);
        //   } else if (Body.message == "already_verified") {
        //     callback(new Error(`Already verified!!`), null);
        //   } else if (Body.message == 'mobile_not_found') {
        //     callback(new Error(`Invalid mobile number`), null);
        //   } else if (Body.message == "otp_expired") {
        //     callback(new Error(`OTP Expired!!`), null);
        //   } else if (Body.message == "invalid_otp") {
        //     callback(new Error(`OTP incorrect. Please provide correct OTP or resend.`), null);
        //   } else if (Body.message == "last_otp_request_on_this_number_is_invalid") {
        //     callback(new Error(`Invalid mobile number`), null);
        //   } else {
        //     callback(null, memberObj);
        //   }
        // });

        OTPServices.verifyOTP("mobile", memberObj.mobileNumber, null, req.body.OTP, (err, data) => {
          if (err) {
            callback(err, null)
          } else {
            callback(null, memberObj);
          }
        })
        ////// End of Verify OTP ///
      }
    ], (err, memberObj) => {
      // result now equals 'done'
      if (err)
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 0,
          message: `${err}`
        });
      else
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 1,
          message: 'OTP verified successfully'
        });
    });
  } else if (req.body.medium == "email") {
    //console.log(req.body)
    /// Fetch member details
    async.waterfall([
      (callback) => {
        User.findById(req.body.memberId, (err, memberObj) => {
          if (err)
            return callback(new Error(`Error While fetching member details : ${err}`), null);
          else if (!memberObj || memberObj == "") {
            return callback(new Error(`Please provide valid details`), null)
          } else {
            callback(null, memberObj);
          }
        })
      },
      /// fetch latest OTP and verify
      (memberObj, callback) => {
        OTP.findOne({ memberId: req.body.memberId }, (
          err,
          Oresult
        ) => {
          if (err)
            return callback(new Error(`Error While fetching OTP info : ${err}`), null);
          if (Oresult) {
            //console.log(Oresult)
            if (Oresult.isVerified == "false" || Oresult.isVerified == false) {
              let CurrentTime = new Date();
              var parsedDate = Oresult.createdAt;
              //console.log('parsed created time')
              //console.log(parsedDate)
              let expiryTime = (Oresult.expiryTimeInMins * 60000);
              //console.log('new exiry time')
              // add the exipry minutes to created Time and verify
              let Expiration = new Date(parsedDate.getTime() + expiryTime);
              //console.log(Expiration)
              //console.log(CurrentTime)
              //// check for the OTP Expiration time
              if (CurrentTime <= Expiration) {
                //console.log("verifY OTP")
                if (Oresult.OTP == req.body.OTP) {
                  //console.log('correct OTP')
                  callback(null, memberObj, Oresult);
                } else {
                  return callback(new Error(`Incorrect OTP entered`), null);
                }
              } else {
                return callback(new Error(`OTP expired`), null);
              }
            } else {
              return callback(new Error(`OTP already verified`), null);
            }
          }
        }).sort({
          createdAt: -1
        });
      },
      /// send EMAIL using Mandrill Gateway
      (memberObj, Oresult, callback) => {
        let reqbody = {
          isVerified: true
        }
        OTP.findByIdAndUpdate(Oresult._id, reqbody, (err, result) => {
          if (err) return callback(new Error(`Server Error`), null);
          else
            callback(null, memberObj);
        });
      }
    ], (err, memberObj) => {
      // result now equals 'done'
      if (err)
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 0,
          message: `${err.message}`
        });
      else
        res.status(200).json({
          token: req.headers['x-access-token'],
          success: 1,
          message: 'OTP verified successfully'
        });
    });
  } else {
    res.status(200).json({
      token: req.headers['x-access-token'],
      success: 0,
      message: 'Invalid medium'
    });
  }
});
// End of verify OTP

router.get("/sendNotificationToAll/:notificationType/:deviceType", NotificationController.sendNotificationToAll)

//desc delete multiple notification
//method post (andriod&IOS can not send body data)
//access public
router.post('/deleteMultipleNotification', NotificationController.deleteMultipleNotification)
module.exports = router;