const NotificationModel = require("./notificationModel");
const NotificationSetting = require("../notificationSettings/notificationSettingsModel");
let otpService = require('../otp/otpRouter');
const ObjectId = require("mongodb").ObjectID;
const Login = require("../loginInfo/loginInfoModel");
const Users = require("../users/userModel");
const FCM = require('fcm-push');
const serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
const fcm = new FCM(serverkey);

const sendAndCreateNotification = (message, callback) => {
    let queryForSettingStatus = {
        memberId: message.notification.memberId,
        notificationSettingId: ObjectId(message.notification.notificationSettingsId),
        isEnabled: true
    }
    let body = message.notification.body
    message.notification.body = message.notification.body2;
    let notificationObj = new NotificationModel(message.notification);
    message.notification.body = body;
    NotificationModel.createNotification(notificationObj, (err, notificationObj) => {
        if (err) {
            callback(err, null)
        } else {
            NotificationSetting.find(queryForSettingStatus, (err, rest) => {
                if (err) {
                    callback(err, null)
                }
                else if (rest.length) {
                    let dToken = message.to
                    // if (message.notification.osType == "Android") {
                    let data = {
                        serviceType: message.serviceType,
                        title: message.notification.title,
                        body: message.notification.body,
                        feedId: message.feedId,
                        firstName: message.notification.firstName,
                        avtar_imgPath: message.notification.avtar_imgPath
                    }
                    otpService.sendAndriodPushNotification(dToken, message.collapse_key, data, (err, successNotificationObj) => {
                        if (err)
                            console.log(err)
                        else {
                            console.log(successNotificationObj)
                        }
                    });
                    // } else if (message.notification.osType == "IOS") {
                    //     let notification = {
                    //         serviceType: message.serviceType,
                    //         body: message.notification.body,
                    //         feedId: message.feedId,
                    //         firstName: message.notification.firstName,
                    //         avtar_imgPath: message.notification.avtar_imgPath
                    //     }
                    //     otpService.sendIOSPushNotification(dToken,  notification, (err, successNotificationObj) => {
                    //         if (err)
                    //             console.log(err)
                    //         else {
                    //             console.log(successNotificationObj)
                    //         }
                    //     });
                    // }
                    callback(null, notificationObj)
                } else {
                    callback(null, notificationObj)
                }
            });
        }
    });
}

const sendNotificationToAll = (params, callback) => {
    let notificationType = params.notificationType;
    let deviceType = params.deviceType;
    Users.find({ dua: false }, { _id: 1 }, (err, users) => {
        if (err) {
            callback(err, null)
        } else {
            let allIds = users.map((user) => {
                return user._id
            })
            if (notificationType == "AppUpdate") {
                let message = {}
                let query = {};
                if (deviceType.toUpperCase() == "ANDROID") {
                    message = {
                        to: "",
                        data: {
                            serviceType: "AppUpdate",
                            title: 'New update!!',
                            body: "Please update the app and enjoy the features",
                            activity: "APPUPDATE"
                        }
                    };
                    query = { osType: "Android", memberId: { $in: allIds }, deviceToken: { $ne: "" }, deviceToken: { $exists: true } }
                } else if (deviceType.toUpperCase() == "IOS") {
                    message = {
                        to: "",
                        data: {
                            serviceType: "AppUpdate", title: 'New update!!',
                            body: "Please update the app and enjoy the features",
                            activity: "APPUPDATE"
                        },
                        notification: {
                            title: "New update!!",
                            body: "Please update the app and enjoy the features",
                            notificationType: "AppUpdate",
                            serviceType: "AppUpdate",
                            activity: "APPUPDATE"
                        }
                    };
                    query = { osType: "IOS", memberId: { $in: allIds }, deviceToken: { $ne: "" }, deviceToken: { $exists: true } }
                }
                else {
                    query = null;
                    return callback("Please Provide Valid Devicetype", null)
                }
                if (query) {
                    Login.find(query, { deviceToken: 1 }, (err, allUser) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            allUser.forEach((loginObject) => {
                                message.to = loginObject.deviceToken;
                                fcm.send(message, (err, response) => {
                                    if (err) {
                                        console.log({ err: err })
                                    } else {
                                        console.log(response)
                                    }
                                });
                            })
                            callback(null, "Sent To all")
                        }
                    })
                } else {
                    return callback("Please Provide Valid Devicetype", null)
                }
            }
            else if (notificationType == "ReminderForOldUser") {
                let today = new Date();
                let lastThreeMonth = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
                let message = {}
                let query = {};
                if (deviceType.toUpperCase() == "ANDROID") {
                    message = {
                        to: "",
                        data: {
                            serviceType: "ReminderForOldUser", title: 'Exiting Features and reminder !!',
                            body: "Exiting Features and Celebrites waiting for you!!",
                            activity: "OLDUSERREMINDER"
                        }
                    };
                    query = { osType: "Android", lastLoginDate: { $lte: lastThreeMonth }, memberId: { $in: allIds }, deviceToken: { $ne: "" }, deviceToken: { $exists: true } }
                } else if (deviceType.toUpperCase() == "IOS") {
                    message = {
                        to: "",
                        data: {
                            serviceType: "ReminderForOldUser", title: 'Exiting Features and reminder !!',
                            body: "Exiting Features and Celebrites waiting for you!!",
                            activity: "OLDUSERREMINDER"
                        },
                        notification: {
                            title: 'Exiting Features and reminder !!',
                            body: "Exiting Features and Celebrites waiting for you!!",
                            notificationType: "ReminderForOldUser",
                            serviceType: "ReminderForOldUser",
                            activity: "OLDUSERREMINDER"
                        }
                    };
                    query = { osType: "IOS", lastLoginDate: { $lte: lastThreeMonth }, memberId: { $in: allIds }, deviceToken: { $ne: "" }, deviceToken: { $exists: true } }
                }
                else {
                    query = null;
                    return callback("Please Provide Valid Devicetype", null)
                }
                if (query) {
                    Login.find(query, { deviceToken: 1 }, (err, allUser) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            allUser.forEach((loginObject) => {
                                message.to = loginObject.deviceToken;
                                fcm.send(message, (err, response) => {
                                    if (err) {
                                        console.log({ err: err })
                                    } else {
                                        console.log(response)
                                    }
                                });
                            })
                            callback(null, "Sent To all")
                        }
                    })
                } else {
                    return callback("Please Provide Valid Devicetype", null)
                }
            }
            else {
                callback("Please provide valid notification type", null)
            }
        }
    })
}

let deleteMultipleNotification = function (body, callback) {
    // console.log("Body", body);
    let ids = body.id
    let memberId = ObjectId(body.memberId);
    let query = {};


    if (body.notificationType == "all") {
        query = { memberId: memberId }
    }
    else if (body.notificationType == "fan") {
        query = { memberId: memberId, notificationType: { $in: ["Follow", "Fan", "FOLLOW", "unFan", "unFollow"] } }
    }
    else if (body.notificationType == "services") {
        query = { memberId: memberId, notificationType: { $in: ["Call", "Schedule"] } }
    }
    else if (body.notificationType == "manager") {
        query = { memberId: memberId, notificationType: { $in: ["Manager",] } }
    } else {
        ids = ids.map(id => {
            return ObjectId(id)
        })
        if (ids.length <= 0) {
            return callback("ids not found")
        }
        query = { _id: { $in: ids } }
    }
    // console.log("Notification fanal query === ",query);
    NotificationModel.updateMany(query, { $set: { status: "isDeleted" } }, (err, deletedObj) => {
        if (!err)
            callback(null, deletedObj);
        else
            callback(err, null);
    })
}
module.exports = {
    sendAndCreateNotification: sendAndCreateNotification,
    sendNotificationToAll: sendNotificationToAll,
    deleteMultipleNotification: deleteMultipleNotification
}