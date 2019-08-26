//npm module
const ObjectId = require("mongodb").ObjectID;
const FCM = require('fcm-push');
const serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
const fcm = new FCM(serverkey);
const ManagerPermissions = require("../managerPermission/managerPermissionsModel");
const Memberpreferences = require('../memberpreferences/memberpreferencesModel');
//db conections
const User = require("../users/userModel");
const Notification = require("../notification/notificationModel");
const Logins = require("../loginInfo/loginInfoModel");
const CelebManager = require('../CelebManager/celebManagersModel');
const notificationSetting = require("../notificationSettings/notificationSettingsModel");
const NotificationService = require("../notificationSettings/notificationSettingService");
const otpService = require('../otp/otpRouter');


const createCelebManager = (newCelebManager, callback) => {
    CelebManager.createCelebManager(newCelebManager, (err, CelebManagerObject) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, CelebManagerObject)
        }
    });
}

const sendRequestToManager = (reqestedCelebManagerObj, callback) => {
    CelebManager.findOne({ celebrityId: ObjectId(reqestedCelebManagerObj.celebrityId), managerId: ObjectId(reqestedCelebManagerObj.managerId) }, (err, celebManagerObj) => {
        if (err) {
            callback(err, null)
        } else if (celebManagerObj) {
            if (!celebManagerObj.isSuspended) {
                let reqbody = {
                    "isCelebReqNew": true,
                    "isCelebAccepted": true,
                    "status": "pending",
                    "updatedAt": new Date(),
                    "updatedBy": reqestedCelebManagerObj.updatedBy
                };

                CelebManager.findByIdAndUpdate(celebManagerObj.id, reqbody, function (err, result) {
                    if (err) {
                        callback(`Request sent again! ${err}`, null)
                    }
                    else {
                        callback(null, "Request send successfully");
                        ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                        User.findById(reqestedCelebManagerObj.celebrityId, (err, celebrityObject) => {
                            User.findById(reqestedCelebManagerObj.managerId, (err, managerObject) => {
                                let managerEmail = managerObject.email;
                                Logins.findOne({ email: managerEmail }, (err, loginObject) => {
                                    if (loginObject == null) {
                                    } else {
                                        let message = {
                                            to: loginObject.deviceToken,
                                            data: {
                                                serviceType: "Manager", title: 'Alert!!',
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                            },
                                            notification: {
                                                memberId: reqestedCelebManagerObj.managerId,
                                                activity: "Manager",
                                                notificationFrom: celebrityObject._id,
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Alert!!",
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                notificationType: "Manager",
                                                serviceType: "Manager"
                                            }
                                        };

                                        let notificationObj = new Notification(message.notification);
                                        //Insert Notification
                                        Notification.createNotification(notificationObj, function (err, credits) {
                                            if (err) {
                                                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                            } else {
                                                /* res.send({
                                                    message: "Notification sent successfully"
                                                }); */
                                                // console.log("Notification sent successfully!")
                                                let query = {
                                                    $and: [{
                                                        memberId: reqestedCelebManagerObj.managerId
                                                    }, {
                                                        notificationSettingId: "5baf8b475129360870bcfe8f"
                                                    }, {
                                                        isEnabled: "false"
                                                    }]
                                                };
                                                notificationSetting.find(query, function (err, rest) {
                                                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                    // console.log("t1", rest);
                                                    if (rest == "" || rest.isEnabled == true) {
                                                        var message = {
                                                            to: loginObject.deviceToken,
                                                            data: {
                                                                serviceType: "Manager", title: 'Alert!!',
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            },
                                                            ///////  FCM SENDING MESSAGE to Manager ////////
                                                            // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                            notification: {
                                                                memberId: reqestedCelebManagerObj.managerId,
                                                                activity: "Manager",
                                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                                title: "Manager Alert!!",
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                notificationType: "Manager",
                                                                serviceType: "Manager"
                                                            }
                                                        };
                                                        fcm.send(message, function (err, response) {
                                                            if (err) {
                                                                console.log(err)
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
                        });
                        ////////////////// ******** END OF NOIFICATION *************/////////////////////
                    }
                });
            } else {
                callback("Already this manager is linked with this celebrity", null)
            }
        } else {
            var newCelebManagerObj = {
                celebrityId: ObjectId(reqestedCelebManagerObj.celebrityId),
                managerId: ObjectId(reqestedCelebManagerObj.managerId),
                isCelebReq: true,
                isCelebAccepted: true,
                createdBy: reqestedCelebManagerObj.createdBy,
                status: "pending"
            }
            if (reqestedCelebManagerObj.reportingTo) {
                Object.assign(newCelebManagerObj, { reportingTo: ObjectId(reqestedCelebManagerObj.reportingTo) })
            }
            if (reqestedCelebManagerObj.mainManagerId) {
                Object.assign(newCelebManagerObj, { mainManagerId: ObjectId(reqestedCelebManagerObj.mainManagerId) })
            }
            newCelebManagerObj = new CelebManager(newCelebManagerObj);
            CelebManager.createCelebManager(newCelebManagerObj, (err, CelebManagerObject) => {
                if (err) {
                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                } else {
                    callback(null, { message: "Request sent to manager successfully!" })
                    User.findById(reqestedCelebManagerObj.celebrityId, (err, celebrityObject) => {
                        User.findById(reqestedCelebManagerObj.managerId, (err, managerObject) => {
                            let managerEmail = managerObject.email;
                            Logins.findOne({ email: managerEmail }, function (err, loginObject) {
                                if (loginObject == null) {
                                } else {
                                    let message = {
                                        to: loginObject.deviceToken,
                                        data: {
                                            serviceType: "Manager", title: 'Alert!!',
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                        },
                                        notification: {
                                            memberId: reqestedCelebManagerObj.managerId,
                                            activity: "Manager",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Alert!!",
                                            notificationFrom: celebrityObject._id,
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                            notificationType: "Manager",
                                            serviceType: "Manager"
                                        }
                                    };

                                    let notificationObj = new Notification(message.notification);
                                    //Insert Notification
                                    Notification.createNotification(notificationObj, function (err, credits) {
                                        if (err) {
                                            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                        } else {
                                            let query = {
                                                $and: [{
                                                    memberId: reqestedCelebManagerObj.managerId
                                                }, {
                                                    notificationSettingId: "5baf8b475129360870bcfe8f"
                                                }, {
                                                    isEnabled: "false"
                                                }]
                                            };
                                            notificationSetting.find(query, function (err, rest) {
                                                if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                if (rest == "" || rest.length == 0 || rest.isEnabled == true) {
                                                    var message = {
                                                        to: loginObject.deviceToken,
                                                        data: {
                                                            serviceType: "Manager", title: 'Alert!!',
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                        },
                                                        notification: {
                                                            memberId: reqestedCelebManagerObj.$andmanagerId,
                                                            activity: "Manager",
                                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                                            title: "Manager Alert!!",
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            notificationType: "Manager",
                                                            serviceType: "Manager"
                                                        }
                                                    };
                                                    fcm.send(message, function (err, response) {
                                                        if (err) {
                                                            console.log(err)
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
                    });
                }
            });
        }
    });
}


const getAccessStatus = (celebrityId, managerId, reportingTo, callback) => {
    if (reportingTo) {
        CelebManager.findOne({ celebrityId: celebrityId, managerId: managerId, reportingTo: reportingTo }, { celebrityId: 1, managerId: 1, _id: 1, isAccess: 1, isActive: 1 }, (err, celebManager) => {
            if (err) {
                callback(err, null)
            }
            else {
                callback(null, celebManager)
            }
        })
    }
    else {
        CelebManager.findOne({ celebrityId: celebrityId, managerId: managerId, reportingTo: { $exists: false } }, { celebrityId: 1, managerId: 1, _id: 1, isAccess: 1, isActive: 1 }, (err, celebManager) => {
            if (err) {
                callback(err, null)
            }
            else {
                callback(null, celebManager)
            }
        })
    }
}

const checkRequestedByAnyOtherMainManagerOrNot = (celebrityId, callback) => {
    CelebManager.findOne({
        celebrityId: ObjectId(celebrityId),
        isActive: false,
        isSuspended: false,
        status: "pending",
        mainManagerId: { $exists: false },
        reportingTo: { $exists: false },
        $or: [
            { isCelebReqNew: true },
            { isCelebReq: true }
        ]
    }, (err, celebManagerObj) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, celebManagerObj)
        }
    })
}

const checkActiveSameManagerOrNot = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        isActive: true,
        isSuspended: false,
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId),
        mainManagerId: { $exists: false },
        reportingTo: { $exists: false }
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkActiveManagerOrNot = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        isActive: true,
        isSuspended: false,
        celebrityId: ObjectId(celebrityId),
        mainManagerId: { $exists: false },
        reportingTo: { $exists: false }
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkAlreadyRequestedSameManagerOrNot = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        isCelebReq: true,
        isCelebAccepted: true,
        isCelebReqNew: false,
        isActive: false,
        status: "pending",
        isSuspended: false,
        managerId: ObjectId(managerId),
        celebrityId: ObjectId(celebrityId),
        mainManagerId: { $exists: false },
        reportingTo: { $exists: false }
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkAlreadyRequestedManagerOrNot = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        isCelebReq: true,
        status: "pending",
        isCelebAccepted: true,
        isCelebReqNew: false,
        isActive: false,
        isSuspended: false,
        celebrityId: ObjectId(celebrityId),
        mainManagerId: { $exists: false },
        reportingTo: { $exists: false }
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkPreviouslyRequestedSameManagerOrNot = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        isCelebReq: true,
        isCelebAccepted: true,
        isCelebReqNew: false,
        isActive: false,
        isSuspended: true,
        isManagerAccepted: true,
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId)
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkSendingRequestToSameManager = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        isActive: false,
        status: "pending",
        $or: [
            { isSuspended: true },
            { isSuspended: false },
            { isManagerAccepted: true },
            { isManagerAccepted: false },
            { isCelebReqNew: true },
            { isCelebReqNew: false },
            { isCelebAccepted: true },
            { isCelebReq: true }
        ],
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId),
        mainManagerId: { $exists: false },
        reportingTo: { $exists: false }
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkSendingRequestToSameSubManager = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        $or: [
            { isManagerAccepted: true },
            { isManagerAccepted: false },
            { isCelebReqNew: true },
            { isCelebReqNew: false },
            { isCelebAccepted: true },
            { isCelebReq: true }
        ],
        status: "pending",
        isActive: false,
        isSuspended: false,
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId),
        mainManagerId: { $exists: false },
        reportingTo: { $exists: true }
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkSendingRequestToSameSubSubManager = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        isActive: false,
        isSuspended: false,
        status: "pending",
        $or: [
            { isManagerAccepted: true },
            { isManagerAccepted: false },
            { isCelebReqNew: true },
            { isCelebReqNew: false },
            { isCelebAccepted: true },
            { isCelebReq: true }
        ],
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId),
        mainManagerId: { $exists: true },
        reportingTo: { $exists: true }
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkSameCelebManagerObejctExistOrNot = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        $or: [
            { isManagerAccepted: true },
            { isManagerAccepted: false },
            { isCelebReqNew: true },
            { isCelebAccepted: true },
            { isCelebReq: true }
        ],
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId)
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const subManagerRequestFromWhom = (celebrityId, managerId, callback) => {
    CelebManager.findOne({ isActive: true, mainManagerId: { $exists: false }, celebrityId: ObjectId(celebrityId), managerId: ObjectId(managerId) }, (err, celebManagerObj) => {
        if (err) {
            callback(err, null, null)
        } else {
            if (celebManagerObj.reportingTo) {
                //request from submanager so provide main manageid
                callback(null, celebManagerObj.reportingTo, false)
            } else if (celebManagerObj.reportingTo == undefined) {
                callback(null, false, true)
            }
            else {
                callback("Relation not fouund/Sub Sub manager for the celebrity", null, null)
            }
        }
    })
}

const checkActiveSameSubSubManagerOrNot = (celebrityId, managerId, reportingTo, mainManagerId, callback) => {
    let query = {
        isActive: true,
        isSuspended: false,
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId),
        reportingTo: ObjectId(reportingTo)
    }
    if (mainManagerId) {
        Object.assign(query, { mainManagerId: mainManagerId })
    }
    else {
        //request from main manager so no need to check
        return callback(null, null)
    }
    CelebManager.findOne(query, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const checkActiveSameSubManagerOrNot = (celebrityId, managerId, reportingTo, callback) => {
    CelebManager.findOne({
        isActive: true,
        isSuspended: false,
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId),
        mainManagerId: { $exists: false },
        reportingTo: ObjectId(reportingTo)
    }, (err, celebManagerObject) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, celebManagerObject)
        }
    })
}

const sendAndCreateNotification = (celebrityId, managerId, deviceTokenOf, mode, callback) => {
    let notificationFrom = celebrityId
    if (managerId) {
        notificationFrom = managerId
    }
    console.log(deviceTokenOf)
    User.findById(ObjectId(deviceTokenOf), (err, deviceTokenOfObject) => {
        if (err) {
            callback(err, null)
        } else {
            User.findById(ObjectId(celebrityId), (err, celebrityObject) => {
                if (err) {
                    callback(err, null)
                } else {
                    User.findById(ObjectId(managerId), (err, managerObject) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            let cond = [];
                            if (deviceTokenOfObject.email && deviceTokenOfObject.email != "") {
                                cond.push({ email: deviceTokenOfObject.email })
                            } else if (deviceTokenOfObject.mobileNumber && deviceTokenOfObject.mobileNumber != "") {
                                cond.push({ mobileNumber: { $regex: deviceTokenOfObject.mobileNumber } })
                            }
                            let query = {
                                $or: cond
                            }
                            let queryForSettingStatus = {}
                            Logins.findOne(query, (err, loginObject) => {
                                let message = {}, pushNotificationData, pushNotification, collapse_key_data;
                                if (err || !err) {
                                    let deviceTokenForPushNotification = loginObject.deviceToken;
                                    let osType = loginObject.osType;

                                    if (mode == "requestToManager") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            serviceType: "Manager", title: 'Alert!!',
                                            notificationType: "Manager",
                                            serviceType: "REQUESTTOMANAGER",
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "REQUESTTOMANAGER",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Alert!!",
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                            notificationType: "Manager",
                                            serviceType: "Manager",
                                            notificationFrom: notificationFrom
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "REQUESTTOMANAGER",
                                            data: {
                                                serviceType: "Manager", title: 'Alert!!',
                                                notificationType: "Manager",
                                                serviceType: "REQUESTTOMANAGER",
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "REQUESTTOMANAGER",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Alert!!",
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                notificationType: "Manager",
                                                serviceType: "Manager",
                                                notificationFrom: notificationFrom
                                            }
                                        }
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "requestFromAdmin") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            serviceType: "REQUESTFROMADMIN",
                                            serviceType: "Manager", title: 'Alert!!',
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation you 'be my manager' request",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "REQUESTFROMADMIN",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Alert!!",
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation sent you 'be my manager' request",
                                            notificationType: "Manager",
                                            serviceType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "REQUESTFROMADMIN",
                                            data: {
                                                notificationType: "Manager",
                                                serviceType: "REQUESTFROMADMIN",
                                                serviceType: "Manager", title: 'Alert!!',
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation you 'be my manager' request",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "REQUESTFROMADMIN",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Alert!!",
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation sent you 'be my manager' request",
                                                notificationType: "Manager",
                                                serviceType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "managerAccept") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            title: 'Manager Accepted !!!',
                                            memberId: managerObject._id,
                                            serviceType: "MANAGERACCEPTED",
                                            body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "MANAGERACCEPTED",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: 'Manager Accepted !!!',
                                            body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                            notificationType: "Manager",
                                            serviceType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "MANAGERACCEPTED",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Manager Accepted !!!',
                                                memberId: managerObject._id,
                                                serviceType: "MANAGERACCEPTED",
                                                body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "MANAGERACCEPTED",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: 'Manager Accepted !!!',
                                                body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                                notificationType: "Manager",
                                                serviceType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "subManagerAccept") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            title: 'Manager Accepted !!!',
                                            memberId: managerObject._id,
                                            serviceType: "MANAGERACCEPTED",
                                            body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "MANAGERACCEPTED",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: 'Manager Accepted !!!',
                                            body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                            notificationType: "Manager",
                                            serviceType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "MANAGERACCEPTED",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Manager Accepted !!!',
                                                memberId: managerObject._id,
                                                serviceType: "MANAGERACCEPTED",
                                                body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "MANAGERACCEPTED",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: 'Manager Accepted !!!',
                                                body: managerObject.firstName + " " + managerObject.lastName + " has accepted your 'be my manager' request. Click here to configure setting",
                                                notificationType: "Manager",
                                                serviceType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "celebrityAccept") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            title: 'Celebrity Accepted !!!',
                                            serviceType: "CELEBACCEPTED",
                                            memberId: celebrityObject._id,
                                            body: celebrityObject.firstName + celebrityObject.lastName + "has accepted your request to be his manager."
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "CELEBACCEPTED",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Suspended !!!",
                                            notificationFrom: celebrityObject._id,
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you.",
                                            notificationType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "CELEBACCEPTED",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Celebrity Accepted !!!',
                                                serviceType: "CELEBACCEPTED",
                                                memberId: celebrityObject._id,
                                                body: celebrityObject.firstName + celebrityObject.lastName + "has accepted your request to be his manager."
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "CELEBACCEPTED",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Suspended !!!",
                                                notificationFrom: celebrityObject._id,
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you.",
                                                notificationType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: managerId,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "suspendManager") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            serviceType: "SUSPENDMANAGER",
                                            title: 'Manager Suspended!!', 
                                            serviceType: "SUSPENDMANAGER",
                                            memberId: celebrityObject._id,
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you as a manager",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "SUSPENDMANAGER",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Suspended !!!",
                                            notificationFrom: celebrityObject._id,
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you.",
                                            notificationType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "SUSPENDMANAGER",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Manager Suspended!!', serviceType: "SUSPENDMANAGER",
                                                memberId: celebrityObject._id, body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you as a manager",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "SUSPENDMANAGER",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Suspended !!!",
                                                notificationFrom: celebrityObject._id,
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you.",
                                                notificationType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: managerId,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "suspendSubManager") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            title: 'Manager Suspended!!', 
                                            serviceType: "SUSPENDSUBMANAGER",
                                            memberId: celebrityObject._id, body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you as a manager",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "SUSPENDSUBMANAGER",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Suspended !!!",
                                            notificationFrom: celebrityObject._id,
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you.",
                                            notificationType: "Manager"
                                        }
                                        
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "SUSPENDSUBMANAGER",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Manager Suspended!!', serviceType: "SUSPENDSUBMANAGER",
                                                memberId: celebrityObject._id, body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you as a manager",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "SUSPENDSUBMANAGER",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Suspended !!!",
                                                notificationFrom: celebrityObject._id,
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has suspended you.",
                                                notificationType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "rejectManager") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            title: 'Alert!!', 
                                            serviceType: "MANAGERREJECT",
                                            memberId: celebrityObject._id, 
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has rejected your Access to manage his / her profile!",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "MANAGERREJECT",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Alert!!",
                                            notificationFrom: celebrityObject._id,
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has rejected your Access to manage his / her profile!",
                                            notificationType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "MANAGERREJECT",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Alert!!', serviceType: "MANAGERREJECT",
                                                memberId: celebrityObject._id, body: celebrityObject.firstName + " " + celebrityObject.lastName + " has rejected your Access to manage his / her profile!",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "MANAGERREJECT",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Alert!!",
                                                notificationFrom: celebrityObject._id,
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has rejected your Access to manage his / her profile!",
                                                notificationType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "rejectCelebrity") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            title: 'Manager Rejected !!!', 
                                            serviceType: "CELEBREJECT",
                                            memberId: managerObject._id, 
                                            body: managerObject.firstName + " " + managerObject.lastName + " has rejected your 'be my manager' request.",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            memberId: deviceTokenOf,
                                            activity: "CELEBREJECT",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Rejected !!!",
                                            notificationFrom: managerObject._id,
                                            body: managerObject.firstName + " " + managerObject.lastName + " has rejected your 'be my manager' request",
                                            notificationType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "CELEBREJECT",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Manager Rejected !!!', serviceType: "CELEBREJECT",
                                                memberId: managerObject._id, body: managerObject.firstName + " " + managerObject.lastName + " has rejected your 'be my manager' request.",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "CELEBREJECT",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Rejected !!!",
                                                notificationFrom: managerObject._id,
                                                body: managerObject.firstName + " " + managerObject.lastName + " has rejected your 'be my manager' request",
                                                notificationType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    } else if (mode == "cancelManagerRequest") {
                                        collapse_key_data = 'Manager Updates';
                                        pushNotificationData = {
                                            notificationType: "Manager",
                                            title: 'Manager Cancelled !!!',
                                            serviceType: "MANAGERREQCANCEL",
                                            memberId: celebrityObject._id, body: celebrityObject.firstName + " " + celebrityObject.lastName + " has cancelled your 'be my manager' request",
                                        }
                                        pushNotification = {
                                            memberId: deviceTokenOf,
                                            activity: "MANAGERREQCANCEL",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Cancelled !!!",
                                            notificationFrom: celebrityObject._id,
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has cancelled your 'be my manager' request",
                                            notificationType: "Manager"
                                        }
                                        message = {
                                            to: loginObject.deviceToken,
                                            collapse_key: 'Manager Updates',
                                            serviceType: "MANAGERREQCANCEL",
                                            data: {
                                                notificationType: "Manager",
                                                title: 'Manager Cancelled !!!', serviceType: "MANAGERREQCANCEL",
                                                memberId: celebrityObject._id, body: celebrityObject.firstName + " " + celebrityObject.lastName + " has cancelled your 'be my manager' request",
                                            },
                                            notification: {
                                                memberId: deviceTokenOf,
                                                activity: "MANAGERREQCANCEL",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Cancelled !!!",
                                                notificationFrom: celebrityObject._id,
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has cancelled your 'be my manager' request",
                                                notificationType: "Manager"
                                            }
                                        };
                                        queryForSettingStatus = {
                                            memberId: deviceTokenOf,
                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                            isEnabled: true
                                        };
                                    }

                                    let notificationObj = new Notification(message.notification);

                                    Notification.createNotification(notificationObj, (err, notificationObj) => {
                                        if (err) {
                                            callback(err, null)
                                        } else {
                                            notificationSetting.find(queryForSettingStatus, (err, rest) => {
                                                // console.log(rest)
                                                if (err) {
                                                    callback(err, null)
                                                }
                                                else if (rest.length) {
                                                    if (osType == "Android") {
                                                        otpService.sendAndriodPushNotification(deviceTokenForPushNotification, collapse_key_data, pushNotificationData, (err, successNotificationObj) => {
                                                            if (err)
                                                                console.log(err)
                                                            else {
                                                                console.log(successNotificationObj)
                                                            }
                                                        })
                                                    } else if (osType == "IOS") {
                                                        otpService.sendIOSPushNotification(deviceTokenForPushNotification, pushNotification, (err, successNotificationObj) => {
                                                            if (err)
                                                                console.log(err)
                                                            else {
                                                                console.log(successNotificationObj)
                                                            }
                                                        })
                                                    }
                                                    // fcm.send(message,(err, response)=> {
                                                    //     if (err){
                                                    //         callback(err,null)
                                                    //     } else {
                                                    //         callback(null,notificationObj)
                                                    //     }
                                                    // });
                                                } else {
                                                    callback(null, notificationObj)
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    })

}

const allActiveManagerForCelebrity = (celebrityId, callback) => {
    CelebManager.find({ celebrityId: ObjectId(celebrityId), isActive: true }, (err, managerList) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, managerList)
        }
    })
}

const allRequestedManagerForCelebrity = (celebrityId, callback) => {
    CelebManager.find({
        celebrityId: ObjectId(celebrityId),
        status: "pending",
        isActive: false,
        $or: [
            { isManagerAccepted: true },
            { isManagerAccepted: false },
            { isCelebReqNew: true },
            { isCelebAccepted: true },
            { isCelebReq: true }
        ]
    }, (err, managerList) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, managerList)
        }
    })
}


const isRequestFromSubSubManager = (celebrityId, managerId, callback) => {
    CelebManager.findOne({
        celebrityId: ObjectId(celebrityId),
        managerId: ObjectId(managerId),
        mainManagerId: { $exists: true },
        reportingTo: { $exists: true }
    }, (err, managerObj) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, managerObj)
        }
    })
}


const sendNotificationToAllSwitchedManager = (memberId, notificationObj, callback) => {
    Memberpreferences.aggregate([
        {
            $match: { "celebrities.CelebrityId": ObjectId(memberId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "memberId",
                foreignField: "_id",
                as: "memberProfile"
            }
        },
        {
            $unwind: "$memberProfile"
        },
        {
            $match: { "memberProfile.isCeleb": true }
        },
        {
            $group: {
                _id: 0,
                celebrityIdArray: { $push: "$memberProfile._id" }
            }
        }
    ], (err, data) => {
        if (err) {
            console.log(err)
        } else {
            let celebrityIdArray = [];
            if (data[0]) {
                celebrityIdArray = data[0].celebrityIdArray
            }
            Logins.aggregate([
                {
                    $match: {
                        memberId: { $in: celebrityIdArray }
                    }
                },
                {
                    $unwind: "$managerDeviceTokens"
                },
                {
                    $group: {
                        _id: 0,
                        managerDeviceTokens: { $push: "$managerDeviceTokens" }
                    }
                }
            ], (err, data) => {
                if (err) {
                    callback(err, null)
                } else {
                    if (data[0] && data[0].managerDeviceTokens.length) {
                        console.log(data[0].managerDeviceTokens)
                        data[0].managerDeviceTokens.forEach((managerDeviceToken) => {
                            let message = {
                                to: managerDeviceToken,
                                collapse_key: notificationObj.collapse_key,
                                serviceType: notificationObj.serviceType,
                                data: notificationObj.data,
                                notification: notificationObj.notification
                            };
                            if (notificationObj.feedId != undefined) {
                                message.data.feedId = notificationObj.feedId;
                                message.notification.feedId = notificationObj.feedId;
                            }
                            fcm.send(message, (err, response) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    // console.log(response)
                                }
                            });
                        })
                    }
                    callback(null, data)
                }
            })
        }
    })
}

// sendNotificationToAllSwitchedManager("5c6aa6df250d3114ffe670c8",message,(err,data)=>{
//     if(err){
//         console.log(err)
//     }else{
//         console.log(data)
//     }
// })


module.exports = {
    getAccessStatus: getAccessStatus,
    createCelebManager: createCelebManager,
    sendRequestToManager: sendRequestToManager,
    checkActiveSameManagerOrNot: checkActiveSameManagerOrNot,
    checkActiveManagerOrNot: checkActiveManagerOrNot,
    checkAlreadyRequestedSameManagerOrNot: checkAlreadyRequestedSameManagerOrNot,
    checkSendingRequestToSameManager: checkSendingRequestToSameManager,
    checkSendingRequestToSameSubSubManager: checkSendingRequestToSameSubSubManager,
    checkSendingRequestToSameSubManager: checkSendingRequestToSameSubManager,
    checkAlreadyRequestedManagerOrNot: checkAlreadyRequestedManagerOrNot,
    checkPreviouslyRequestedSameManagerOrNot: checkPreviouslyRequestedSameManagerOrNot,
    subManagerRequestFromWhom: subManagerRequestFromWhom,
    checkActiveSameSubManagerOrNot: checkActiveSameSubManagerOrNot,
    checkActiveSameSubSubManagerOrNot: checkActiveSameSubSubManagerOrNot,
    checkSameCelebManagerObejctExistOrNot: checkSameCelebManagerObejctExistOrNot,
    checkRequestedByAnyOtherMainManagerOrNot: checkRequestedByAnyOtherMainManagerOrNot,
    sendAndCreateNotification: sendAndCreateNotification,
    allActiveManagerForCelebrity: allActiveManagerForCelebrity,
    allRequestedManagerForCelebrity: allRequestedManagerForCelebrity,
    isRequestFromSubSubManager: isRequestFromSubSubManager,
    sendNotificationToAllSwitchedManager: sendNotificationToAllSwitchedManager
}