//npm module
const ObjectId = require("mongodb").ObjectID;
const async = require("async");
const FCM = require('fcm-push');
const serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
const fcm = new FCM(serverkey);
const ManagerPermissions = require("../managerPermission/managerPermissionsModel");
//db conections
const notificationSetting = require("../notificationSettings/notificationSettingsModel");
const ManagerIndustry = require("../managerIndustry/managerIndustry.model");
const User = require("../users/userModel");
const Notification = require("../notification/notificationModel");
const logins = require("../loginInfo/loginInfoModel");
const celebManager = require('../CelebManager/celebManagersModel');
const CelebManagerService = require('../CelebManager/celebManagerService');
const NotificationService = require("../notificationSettings/notificationSettingService");
const ManagerPermissionsAccessMasterService = require('../managerPermissionsAccessMaster/managerPermissionsAccessMasterService');
const _ = require('underscore');
const FeedbackModel = require("../feedback/feedbackModel");
const ServiceTransaction = require("../serviceTransaction/serviceTransactionModel");
let otpService = require('../otp/otpRouter');

// NotificationService.notificationSettingCheck(managerId,ObjectId("5baf8b475129360870bcfe8f"),(err,isPermit)=>{
//     if(err)
//     {

//     }else{

//     }
// })

const sendRequestToManager = (req, res) => {
    CelebManagerService.sendRequestToManager(req.body, (err, data) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
        } else {
            return res.json({ token: req.headers['x-access-token'], success: 1, message: data.message });
        }
    })
}

const celebToManagerRequest1 = (req, res) => {
    console.log(req.body)
    let celebrityId = ObjectId(req.body.celebrityId);
    let managerId = ObjectId(req.body.managerId);
    CelebManagerService.checkRequestedByAnyOtherMainManagerOrNot(celebrityId, (err, celebManagerObj) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
        } else if (celebManagerObj) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Please cancel your previous requests to send a new request!!" });
        } else {
            CelebManagerService.checkActiveSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                if (err) {
                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                } else if (celebManagerObj) {
                    res.status(200).json({
                        token: req.headers['x-access-token'],
                        success: 0,
                        message: "Please make sure you don’t have active manager to send request to new manager."
                    });
                } else {
                    CelebManagerService.checkActiveManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                        if (err) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                        } else if (celebManagerObj) {
                            res.status(200).json({
                                token: req.headers['x-access-token'],
                                success: 0,
                                message: "Please make sure you don’t have active manager to send request to new manager."
                            });
                        } else {
                            CelebManagerService.checkAlreadyRequestedSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                if (err) {
                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                } else if (celebManagerObj) {
                                    res.status(200).json({
                                        token: req.headers['x-access-token'],
                                        success: 0,
                                        message: "Please cancel your previous requests to send a new request!!"
                                    });
                                } else {
                                    CelebManagerService.checkAlreadyRequestedManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                        if (err) {
                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                        } else if (celebManagerObj) {
                                            res.status(200).json({
                                                token: req.headers['x-access-token'],
                                                success: 0,
                                                message: "Please cancel your previous requests to send a new request!!"
                                            });
                                        } else {
                                            CelebManagerService.checkPreviouslyRequestedSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                                if (err) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                } else if (celebManagerObj) {
                                                    let set = {
                                                        "isCelebReqNew": true,
                                                        "isSuspended": false,
                                                        "isActive": false,
                                                        "isCelebReq": true,
                                                        "status": "pending",
                                                        "updatedAt": new Date(),
                                                        "updatedBy": req.body.updatedBy
                                                    };
                                                    let unset = {
                                                        mainManagerId: "",
                                                        reportingTo: ""
                                                    };

                                                    celebManager.findByIdAndUpdate(celebManagerObj._id, { $set: set, $unset: unset }, function (err, result) {
                                                        if (err) {
                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                        }
                                                        else {
                                                            // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                            //     managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                            //     }},(err,updateOldPermission)=>{
                                                            //         if(err)
                                                            //         {
                                                            //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                            //         }
                                                            //         else if(updateOldPermission){
                                                            res.json({
                                                                token: req.headers['x-access-token'],
                                                                success: 1,
                                                                message: "Manager request sent again!"
                                                            });
                                                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestToManager", (err, send) => {
                                                                if (err) {
                                                                    console.log(err)
                                                                } else {
                                                                    //console.log(send)
                                                                }
                                                            })
                                                            //         }
                                                            // });
                                                        }
                                                    });
                                                } else {
                                                    CelebManagerService.checkSendingRequestToSameManager(celebrityId, managerId, (err, celebManagerObj) => {
                                                        if (err) {
                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                        } else if (celebManagerObj) {
                                                            let set = {
                                                                "isCelebReqNew": true,
                                                                "isCelebReq": true,
                                                                "isCelebAccepted": true,
                                                                "isSuspended": false,
                                                                "isActive": false,
                                                                "isCelebReq": true,
                                                                "status": "pending",
                                                                "updatedAt": new Date(),
                                                                "updatedBy": req.body.updatedBy
                                                            };
                                                            let unset = {
                                                                mainManagerId: "",
                                                                reportingTo: ""
                                                            };

                                                            celebManager.findByIdAndUpdate(celebManagerObj._id, { $set: set, $unset: unset }, (err, result) => {
                                                                if (err) {
                                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                }
                                                                else {
                                                                    // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                                    //     managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                                    //     }},(err,updateOldPermission)=>{
                                                                    //         if(err)
                                                                    //         {
                                                                    //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                    //         }
                                                                    //         else if(updateOldPermission){
                                                                    res.json({
                                                                        token: req.headers['x-access-token'],
                                                                        success: 1,
                                                                        message: "Manager request sent again succesfully!"
                                                                    });
                                                                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestToManager", (err, send) => {
                                                                        if (err) {
                                                                            console.log(err)
                                                                        } else {
                                                                            //console.log(send)
                                                                        }
                                                                    })
                                                                    //         }
                                                                    // });
                                                                }
                                                            });
                                                        } else {
                                                            CelebManagerService.checkSameCelebManagerObejctExistOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                                                if (err) {
                                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                } else if (celebManagerObj) {
                                                                    let set = {
                                                                        "isCelebReqNew": true,
                                                                        "isCelebReq": true,
                                                                        "isCelebAccepted": true,
                                                                        "isSuspended": false,
                                                                        "isActive": false,
                                                                        "isCelebReq": true,
                                                                        "status": "pending",
                                                                        "updatedAt": new Date(),
                                                                        "updatedBy": req.body.updatedBy
                                                                    };
                                                                    let unset = {
                                                                        mainManagerId: "",
                                                                        reportingTo: ""
                                                                    };
                                                                    celebManager.findByIdAndUpdate(celebManagerObj._id, { $set: set, $unset: unset }, (err, result) => {
                                                                        if (err) {
                                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                        }
                                                                        else {
                                                                            // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                                            // managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                                            // }},(err,updateOldPermission)=>{
                                                                            //     if(err)
                                                                            //     {
                                                                            //         return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                            //     }
                                                                            //     else if(updateOldPermission){
                                                                            res.json({
                                                                                token: req.headers['x-access-token'],
                                                                                success: 1,
                                                                                message: "Manager request sent again!"
                                                                            });
                                                                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestToManager", (err, send) => {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                } else {
                                                                                    //console.log(send)
                                                                                }
                                                                            })
                                                                            //     }
                                                                            // });
                                                                        }
                                                                    });
                                                                } else {
                                                                    let newCelebManager = new celebManager({
                                                                        celebrityId: celebrityId,
                                                                        managerId: managerId,
                                                                        isCelebReq: true,
                                                                        isCelebAccepted: true,
                                                                        createdBy: req.body.createdBy
                                                                    });
                                                                    CelebManagerService.createCelebManager(newCelebManager, (err, celebManagerObj) => {
                                                                        if (err) {
                                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                        }
                                                                        else {
                                                                            // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                                            //     managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                                            //     }},(err,updateOldPermission)=>{
                                                                            //         if(err)
                                                                            //         {
                                                                            //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                            //         }
                                                                            //         else if(updateOldPermission){
                                                                            res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "Request sent to manager successfully!" })
                                                                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestToManager", (err, send) => {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                } else {
                                                                                    //console.log(send)
                                                                                }
                                                                            })
                                                                            //         }
                                                                            // });
                                                                        }
                                                                    })
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
                        }
                    })
                }
            })
        }
    })
}

const managerToManagerRequest1 = (req, res) => {
    console.log(req.body)
    let reportingTo = ObjectId(req.body.managerId);//parent manager id
    let managerId = ObjectId(req.body.asstManagerId);//child manager id
    let celebrityId = ObjectId(req.body.celebrityId);
    CelebManagerService.isRequestFromSubSubManager(celebrityId, reportingTo, (err, subsubmanager) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        } else if (subsubmanager) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Sorry,You are sub sub manger for celebrity.Please contact manager" });
        } else {
            CelebManagerService.subManagerRequestFromWhom(celebrityId, reportingTo, (err, mainManager, subManager) => {
                if (err) {
                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                } else {
                    let mainManagerId = mainManager ? ObjectId(mainManager) : mainManager;
                    CelebManagerService.checkActiveSameSubSubManagerOrNot(celebrityId, managerId, reportingTo, mainManagerId, (err, celebManagerObj) => {
                        if (err) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else if (celebManagerObj) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Manager already link with this celebrity As a Sub Sub manager" });
                        }
                        else {
                            CelebManagerService.checkActiveSameSubManagerOrNot(celebrityId, managerId, reportingTo, (err, celebManagerObj) => {
                                if (err) {
                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                } else if (celebManagerObj) {
                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Manager already link with this celebrity As a Sub manager" });
                                }
                                else {
                                    CelebManagerService.checkActiveSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                        if (err) {
                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                        } else if (celebManagerObj) {
                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Manager already link with this celebrity As a manager" });
                                        } else {
                                            CelebManagerService.checkSendingRequestToSameManager(celebrityId, managerId, (err, celebManagerObj) => {
                                                if (err) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                } else if (celebManagerObj) {
                                                    let set = {
                                                        reportingTo: reportingTo,
                                                        isCelebReqNew: true,
                                                        isCelebAccepted: true,
                                                        isManagerAccepted: false,
                                                        isSuspended: false,
                                                        isAdminReq: false,
                                                        isCelebReq: true,
                                                        status: "pending",
                                                        updatedAt: new Date(),
                                                        updatedBy: req.body.updatedBy
                                                    };
                                                    let unset = {}

                                                    if (mainManager) {
                                                        let mainManagerId = ObjectId(mainManager);//main parent manager id
                                                        Object.assign(set, { mainManagerId: mainManagerId })
                                                    }

                                                    if (!mainManager) {
                                                        Object.assign(unset, { mainManagerId: "" })
                                                    }
                                                    let updatequery = { $set: set }
                                                    if (!(_.isEmpty(unset))) {
                                                        updatequery = { $set: set, $unset: unset }
                                                    }


                                                    celebManager.findByIdAndUpdate(celebManagerObj._id, updatequery, function (err, result) {
                                                        if (err) {
                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                        }
                                                        else {
                                                            // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                            //     managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                            //     }},(err,updateOldPermission)=>{
                                                            //         if(err)
                                                            //         {
                                                            //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                            //         }
                                                            //         else if(updateOldPermission){
                                                            res.json({
                                                                token: req.headers['x-access-token'],
                                                                success: 1,
                                                                message: "Manager request sent again!"
                                                            });
                                                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "requestToManager", (err, send) => {
                                                                if (err) {
                                                                    console.log(err)
                                                                } else {
                                                                    //console.log(send)
                                                                }
                                                            })
                                                            //         }
                                                            // });
                                                        }
                                                    });
                                                }
                                                else {
                                                    CelebManagerService.checkSendingRequestToSameSubManager(celebrityId, managerId, (err, celebManagerObj) => {
                                                        if (err) {
                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                        } else if (celebManagerObj) {
                                                            res.json({
                                                                token: req.headers['x-access-token'],
                                                                success: 1,
                                                                message: "Already requested as a submanager"
                                                            });
                                                        } else {
                                                            CelebManagerService.checkSendingRequestToSameSubSubManager(celebrityId, managerId, (err, celebManagerObj) => {
                                                                if (err) {
                                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                } else if (celebManagerObj) {
                                                                    res.json({
                                                                        token: req.headers['x-access-token'],
                                                                        success: 1,
                                                                        message: "Already requested as a subsubmanager"
                                                                    });
                                                                } else {
                                                                    CelebManagerService.checkPreviouslyRequestedSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                                                        if (err) {
                                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                        } else if (celebManagerObj) {
                                                                            let set = {
                                                                                reporting: reportingTo,
                                                                                isCelebReqNew: true,
                                                                                isSuspended: false,
                                                                                isActive: false,
                                                                                isCelebReq: true,
                                                                                status: "pending",
                                                                                updatedAt: new Date(),
                                                                                updatedBy: req.body.updatedBy
                                                                            };
                                                                            let unset = {
                                                                                mainManagerId: ""
                                                                            };

                                                                            celebManager.findByIdAndUpdate(celebManagerObj._id, { $set: set, $unset: unset }, function (err, result) {
                                                                                if (err) {
                                                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                                }
                                                                                else {
                                                                                    // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                                                    // managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                                                    // }},(err,updateOldPermission)=>{
                                                                                    //     if(err)
                                                                                    //     {
                                                                                    //         return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                                    //     }
                                                                                    //     else if(updateOldPermission){
                                                                                    res.json({
                                                                                        token: req.headers['x-access-token'],
                                                                                        success: 1,
                                                                                        message: "Manager request sent again!"
                                                                                    });
                                                                                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestToManager", (err, send) => {
                                                                                        if (err) {
                                                                                            console.log(err)
                                                                                        } else {
                                                                                            //console.log(send)
                                                                                        }
                                                                                    })
                                                                                    //     }
                                                                                    // });
                                                                                }
                                                                            });
                                                                        } else {
                                                                            CelebManagerService.checkSameCelebManagerObejctExistOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                                                                if (err) {
                                                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                                } else if (celebManagerObj) {
                                                                                    let set = {
                                                                                        reportingTo: reportingTo,
                                                                                        isCelebReqNew: true,
                                                                                        isCelebAccepted: true,
                                                                                        isManagerAccepted: false,
                                                                                        isSuspended: false,
                                                                                        isAdminReq: false,
                                                                                        isCelebReq: true,
                                                                                        status: "pending",
                                                                                        updatedAt: new Date(),
                                                                                        updatedBy: req.body.updatedBy
                                                                                    };
                                                                                    let unset = {}

                                                                                    if (mainManager) {
                                                                                        let mainManagerId = ObjectId(mainManager);//main parent manager id
                                                                                        Object.assign(set, { mainManagerId: mainManagerId })
                                                                                    }
                                                                                    // console.log(mainManager)
                                                                                    if (!mainManager) {
                                                                                        Object.assign(unset, { mainManagerId: "" })
                                                                                    }
                                                                                    let updatequery = { $set: set }
                                                                                    if (!(_.isEmpty(unset))) {
                                                                                        updatequery = { $set: set, $unset: unset }
                                                                                    }
                                                                                    console.log(updatequery)
                                                                                    celebManager.findByIdAndUpdate(celebManagerObj._id, updatequery, (err, result) => {
                                                                                        if (err) {
                                                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                                        }
                                                                                        else {
                                                                                            // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                                                            // managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                                                            // }},(err,updateOldPermission)=>{
                                                                                            //     if(err)
                                                                                            //     {
                                                                                            //         return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                                            //     }
                                                                                            //     else if(updateOldPermission){
                                                                                            res.json({
                                                                                                token: req.headers['x-access-token'],
                                                                                                success: 1,
                                                                                                message: "Manager request sent again!"
                                                                                            });
                                                                                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "requestToManager", (err, send) => {
                                                                                                if (err) {
                                                                                                    console.log(err)
                                                                                                } else {
                                                                                                    //console.log(send)
                                                                                                }
                                                                                            })
                                                                                            //     }
                                                                                            // });
                                                                                        }
                                                                                    });
                                                                                } else {
                                                                                    let newCelebManagerObj = new celebManager({
                                                                                        reportingTo: reportingTo,
                                                                                        managerId: managerId,
                                                                                        celebrityId: celebrityId,
                                                                                        isCelebReq: true,
                                                                                        isCelebAccepted: true,
                                                                                        createdBy: req.body.createdBy
                                                                                    })
                                                                                    if (mainManager) {
                                                                                        let mainManagerId = ObjectId(mainManager);//main parent manager id
                                                                                        Object.assign(newCelebManagerObj, { mainManagerId: mainManagerId })
                                                                                    }
                                                                                    CelebManagerService.createCelebManager(newCelebManagerObj, (err, celebManagerObj) => {
                                                                                        if (err) {
                                                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                                        }
                                                                                        else {
                                                                                            // ManagerPermissions.findOneAndRemove({ celebrityId: ObjectId(celebrityId),managerId:ObjectId(managerId)},(err,updateOldPermission)=>{
                                                                                            //         if(err)
                                                                                            //         {
                                                                                            //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                                            //         }
                                                                                            //         else{
                                                                                            res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "Request sent to manager successfully!" })
                                                                                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestToManager", (err, send) => {
                                                                                                if (err) {
                                                                                                    console.log(err)
                                                                                                } else {
                                                                                                    //console.log(send)
                                                                                                }
                                                                                            })
                                                                                            //     }
                                                                                            // });
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

const linkCelebAndManagerFromAdmin1 = (req, res) => {
    console.log(req.body)
    let celebrityId = req.body.celebrityId;
    let managerId = req.body.managerId;
    CelebManagerService.checkActiveManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        } else if (celebManagerObj) {
            res.status(200).json({
                token: req.headers['x-access-token'],
                "success": 0,
                "message": "Already have active Manager. Please check the settings!"
            });
        } else {
            CelebManagerService.checkActiveSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                if (err) {
                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                } else if (celebManagerObj) {
                    res.status(200).json({
                        token: req.headers['x-access-token'],
                        "success": 0,
                        "message": "Already manager linked with celebrity as active Manager. Please check the settings!"
                    });
                } else {
                    CelebManagerService.checkRequestedByAnyOtherMainManagerOrNot(celebrityId, (err, celebManagerObj) => {
                        if (err) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else if (celebManagerObj) {
                            res.status(200).json({
                                token: req.headers['x-access-token'],
                                success: 0,
                                message: "Please cancel your previous requests to send a new request!!"
                            });
                        } else {
                            CelebManagerService.checkAlreadyRequestedSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                if (err) {
                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                } else if (celebManagerObj) {
                                    res.status(200).json({
                                        token: req.headers['x-access-token'],
                                        success: 0,
                                        message: "Please cancel your previous requests to send a new request!!"
                                    });
                                } else {
                                    CelebManagerService.checkAlreadyRequestedManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                        if (err) {
                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                        } else if (celebManagerObj) {
                                            res.status(200).json({
                                                token: req.headers['x-access-token'],
                                                success: 0,
                                                message: "Please cancel your previous requests to send a new request!!"
                                            });
                                        } else {
                                            CelebManagerService.checkPreviouslyRequestedSameManagerOrNot(celebrityId, managerId, (err, celebManagerObj) => {
                                                if (err) {
                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                } else if (celebManagerObj) {
                                                    let set = {
                                                        isCelebReqNew: false,
                                                        isCelebAccepted: false,
                                                        isManagerAccepted: false,
                                                        isSuspended: false,
                                                        isManagerReqNew: false,
                                                        isActive: false,
                                                        isCelebReq: false,
                                                        isAdminReq: true,
                                                        status: "Recommended",
                                                        updatedAt: new Date(),
                                                        updatedBy: req.body.updatedBy
                                                    };
                                                    let unset = {
                                                        mainManagerId: "",
                                                        reportingTo: ""
                                                    };

                                                    celebManager.findByIdAndUpdate(celebManagerObj._id, { $set: set, $unset: unset }, function (err, result) {
                                                        if (err) {
                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                        }
                                                        else {
                                                            // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                            //     managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                            //     }},(err,updateOldPermission)=>{
                                                            //         if(err)
                                                            //         {
                                                            //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                            //         }
                                                            //         else if(updateOldPermission){
                                                            res.json({
                                                                token: req.headers['x-access-token'],
                                                                success: 1,
                                                                message: "Request sent again succesfully!!"
                                                            });
                                                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestFromAdmin", (err, send) => {
                                                                if (err) {
                                                                    console.log(err)
                                                                } else {
                                                                    //console.log(send)
                                                                }
                                                            })
                                                            //         }
                                                            // });
                                                        }
                                                    });
                                                } else {
                                                    CelebManagerService.checkSendingRequestToSameManager(celebrityId, managerId, (err, celebManagerObj) => {
                                                        if (err) {
                                                            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                        } else if (celebManagerObj) {
                                                            let set = {
                                                                isCelebReqNew: false,
                                                                isCelebAccepted: false,
                                                                isManagerAccepted: false,
                                                                isSuspended: false,
                                                                isManagerReqNew: false,
                                                                isActive: false,
                                                                isCelebReq: false,
                                                                isAdminReq: true,
                                                                status: "Recommended",
                                                                updatedAt: new Date(),
                                                                updatedBy: req.body.updatedBy
                                                            };
                                                            let unset = {
                                                                mainManagerId: "",
                                                                reportingTo: ""
                                                            };

                                                            celebManager.findByIdAndUpdate(celebManagerObj._id, { $set: set, $unset: unset }, function (err, result) {
                                                                if (err) {
                                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                }
                                                                else {
                                                                    // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                                    //     managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                                    //     }},(err,updateOldPermission)=>{
                                                                    //         if(err)
                                                                    //         {
                                                                    //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                    //         }
                                                                    //         else if(updateOldPermission){
                                                                    res.json({
                                                                        token: req.headers['x-access-token'],
                                                                        success: 1,
                                                                        message: "Request sent again succesfully!"
                                                                    });
                                                                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestFromAdmin", (err, send) => {
                                                                        if (err) {
                                                                            console.log(err)
                                                                        } else {
                                                                            //console.log(send)
                                                                        }
                                                                    })
                                                                    //         }
                                                                    // });
                                                                }
                                                            });
                                                        } else {
                                                            let newCelebManager = new celebManager({
                                                                celebrityId: celebrityId,
                                                                managerId: managerId,
                                                                isAdminReq: true,
                                                                createdBy: req.body.createdBy,
                                                                status: "Recommended"
                                                            });
                                                            CelebManagerService.createCelebManager(newCelebManager, (err, celebManagerObj) => {
                                                                if (err) {
                                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
                                                                }
                                                                else {
                                                                    // ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId},{$set:{
                                                                    //     managerSettingsMasterId:ObjectId("5b97b71035aa150522f81c58")
                                                                    //     }},(err,updateOldPermission)=>{
                                                                    //         if(err)
                                                                    //         {
                                                                    //             return res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again."+err});
                                                                    //         }
                                                                    //         else if(updateOldPermission){
                                                                    res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "Request sent successfully!" })
                                                                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "requestFromAdmin", (err, send) => {
                                                                        if (err) {
                                                                            console.log(err)
                                                                        } else {
                                                                            //console.log(send)
                                                                        }
                                                                    })
                                                                    //         }
                                                                    // });
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

//not in use
const celebToManagerRequest = (req, res, next) => {
    let celebrityId = ObjectId(req.body.celebrityId);
    let managerId = ObjectId(req.body.managerId);
    let isCelebReq = true;
    let isCelebAccepted = true;
    let id;
    let newCelebManager = new celebManager({
        celebrityId: celebrityId,
        managerId: managerId,
        isCelebReq: isCelebReq,
        isCelebAccepted: isCelebAccepted,
        createdBy: req.body.createdBy
    });
    // console.log(newCelebManager)
    ///update previous permission if there
    ManagerPermissions.update({ celebrityId: celebrityId, managerId: managerId }, {
        $set: {
            managerSettingsMasterId: ObjectId("5b97b71035aa150522f81c58")
        }
    }, { multi: true }, (err, updateOldPermission) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
        }
        else if (updateOldPermission) {
            // console.log(updateOldPermission)
        }
    });

    let isActiveManagerExist = false;
    let isSameManager = false;
    let reqAgain = false;
    let oldCelebReqAccepted = false;
    let oldManagerAccepted = false;
    let alreadyRequested = false;

    celebManager.find({ celebrityId: celebrityId }, (err, Mresult) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        }
        else {
            for (let i = 0; i < Mresult.length; i++) {
                // Check if already a Main Manager is Active
                if ((Mresult[i].isActive == true)) {
                    isActiveManagerExist = true;
                }
                // Check if already if a previous request exists
                if ((Mresult[i].isCelebAccepted == true) && (Mresult[i].isManagerAccepted == false) && (Mresult[i].isCelebReqNew == false) && (Mresult[i].isManagerReqNew == false)) {
                    alreadyRequested = true;
                }
                if ((Mresult[i].isCelebAccepted == true) && (Mresult[i].isManagerAccepted == true) && (Mresult[i].isCelebReqNew == true) && (Mresult[i].isManagerReqNew == false)) {
                    alreadyRequested = true;
                }
                if (Mresult[i].managerId + "" == req.body.managerId + "" && Mresult[i].reportingTo == undefined) {
                    if (Mresult[i].isCelebReqNew == false) {
                        reqAgain = true;
                        id = Mresult[i]._id;
                    }
                    if (Mresult[i].isCelebAccepted == true) {
                        oldCelebReqAccepted = true;
                    }
                    if (Mresult[i].isManagerAccepted == true) {
                        oldManagerAccepted = true
                    }

                    isSameManager = true;
                }
            }
            if (isActiveManagerExist) {
                console.log('step1')
                res.status(200).json({
                    token: req.headers['x-access-token'],
                    success: 0,
                    message: "Please make sure you don’t have active manager to send request to new manager."
                });
            } else if (alreadyRequested) {
                console.log('step2')
                res.status(200).json({
                    token: req.headers['x-access-token'],
                    success: 0,
                    message: "Please cancel your previous requests to send a new request!!"
                });
            } else if (isActiveManagerExist && isSameManager && reqAgain) {
                console.log('step3')
                let reqbody = {
                    "isCelebReqNew": true,
                    "status": "pending",
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager request accepted and linked with profile successfully"
                    });

                });
            }
            else if (isSameManager && oldCelebReqAccepted && oldManagerAccepted) {
                console.log('step4')
                let reqbody = {
                    "isCelebReqNew": true,
                    "isSuspended": false,
                    "isCelebReq": true,
                    "status": "pending",
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log(result)

                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Manager request sent again!"
                        });
                    }

                    ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                    User.findById(celebrityId, function (err, celebrityObject) {
                        User.findById(managerId, function (err, managerObject) {
                            let cond = []
                            if (managerObject.email && managerObject.email != "") {
                                cond.push({ email: managerObject.email })
                            } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                            }
                            let query = {
                                $or: cond
                            }
                            logins.findOne(query, function (err, loginObject) {
                                if (loginObject == null) {
                                    console.log("User doesn't exixted")

                                } else {
                                    let message = {
                                        to: loginObject.deviceToken,
                                        data: {
                                            serviceType: "Manager", title: 'Alert!!',
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                        },
                                        notification: {
                                            memberId: managerId,
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
                                            // console.log("Notification sent successfully!"
                                            let query = {
                                                memberId: ObjectId(managerId),
                                                notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                isEnabled: true
                                            };
                                            notificationSetting.find(query, function (err, rest) {
                                                if (err)
                                                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                else if (rest.length) {
                                                    ///////  PUSH SENDING MESSAGE to Manager ////////
                                                    // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                    let data, notification;
                                                    if (loginObject.osType == "Android") {
                                                        data = {
                                                            serviceType: "Manager",
                                                            title: 'Alert!!',
                                                            memberId: managerId,
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            activity: "REQUESTTOMANAGER"
                                                        }
                                                        otpService.sendAndriodPushNotification(loginObject.deviceToken, "", data, (err, successNotificationObj) => {
                                                            if (err)
                                                                console.log(err)
                                                            else {
                                                                console.log(successNotificationObj)
                                                            }
                                                        })
                                                    } else if (loginObject.osType == "IOS") {
                                                        notification = {
                                                            memberId: managerId,
                                                            activity: "Manager",
                                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                                            title: "Manager Alert!!",
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            notificationType: "Manager",
                                                            serviceType: "Manager",
                                                            // activity: "REQUESTTOMANAGER"
                                                        }
                                                        otpService.sendIOSPushNotification(loginObject.deviceToken, notification, (err, successNotificationObj) => {
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
                        });
                    });
                    ////////////////// ******** END OF NOIFICATION *************/////////////////////
                });
            } else if (isActiveManagerExist && isSameManager) {
                console.log('step5')
                res.status(200).json({
                    token: req.headers['x-access-token'],
                    success: 0,
                    message: "You are already linked with the Manager and Active. Please check the settings!"
                });
            } else if (isSameManager) {
                console.log('step6')
                let reqbody = {
                    "isCelebReq": true,
                    "isCelebAccepted": true,
                    "status": "pending",
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.send
                        (err);
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager request sent again!"
                    });
                    ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                    User.findById(celebrityId, function (err, celebrityObject) {
                        User.findById(managerId, function (err, managerObject) {
                            let cond = []
                            if (managerObject.email && managerObject.email != "") {
                                cond.push({ email: managerObject.email })
                            } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                            }
                            let query = {
                                $or: cond
                            }
                            logins.findOne(query, function (err, loginObject) {
                                if (loginObject == null) {
                                } else {
                                    let message = {
                                        to: loginObject.deviceToken,
                                        data: {
                                            serviceType: "Manager", title: 'Alert!!',
                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                        },
                                        notification: {
                                            memberId: managerId,
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
                                                memberId: ObjectId(managerId),
                                                notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                isEnabled: true
                                            };
                                            notificationSetting.find(query, function (err, rest) {
                                                if (err) 
                                                return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                else if (rest.length) {
                                                    ///////  PUSH SENDING MESSAGE to Manager ////////
                                                    // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                    let data, notification;
                                                    if (loginObject.osType == "Android") {
                                                        data = {
                                                            serviceType: "Manager",
                                                            title: 'Alert!!',
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            memberId: managerId,
                                                            activity: "REQUESTTOMANAGER"
                                                        }
                                                        otpService.sendAndriodPushNotification(loginObject.deviceToken, "", data, (err, successNotificationObj) => {
                                                            if (err)
                                                                console.log(err)
                                                            else {
                                                                console.log(successNotificationObj)
                                                            }
                                                        })
                                                    } else if (loginObject.osType == "IOS") {
                                                        notification = {
                                                            memberId: managerId,
                                                            activity: "Manager",
                                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                                            title: "Manager Alert!!",
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            notificationType: "Manager",
                                                            serviceType: "Manager",
                                                            // activity: "REQUESTTOMANAGER"
                                                        }
                                                        otpService.sendIOSPushNotification(loginObject.deviceToken, notification, (err, successNotificationObj) => {
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
                        });
                    });
                    ////////////////// ******** END OF NOIFICATION *************/////////////////////
                });
            } else {
                console.log('step7')
                celebManager.createCelebManager(newCelebManager, function (err, CelebManagerObject) {
                    if (err) {
                        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    } else {
                        res.status(200).json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Request sent to manager successfully!"
                        })

                        ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                        User.findById(celebrityId, function (err, celebrityObject) {
                            User.findById(managerId, function (err, managerObject) {
                                let cond = []
                                if (managerObject.email && managerObject.email != "") {
                                    cond.push({ email: managerObject.email })
                                } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                    cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                                }
                                let query = {
                                    $or: cond
                                }
                                logins.findOne(query, function (err, loginObject) {
                                    if (loginObject == null) {
                                    } else {
                                        console.log("loginObject.deviceToken)")
                                        console.log(loginObject.deviceToken)
                                        let message = {
                                            to: loginObject.deviceToken,
                                            data: {
                                                serviceType: "Manager", title: 'Alert!!',
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                            },
                                            notification: {
                                                memberId: managerId,
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
                                                /* res.send({
                                                  message: "Notification sent successfully"
                                                }); */
                                                // console.log("Notification sent successfully!")
                                                let query = {
                                                    memberId: managerId,
                                                    notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                    isEnabled: true
                                                };
                                                notificationSetting.find(query, function (err, rest) {
                                                    console.log(rest)
                                                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                    //console.log("t1", rest);
                                                    else if (rest.length) {
                                                         ///////  PUSH SENDING MESSAGE to Manager ////////
                                                            // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                        let data, notification;
                                                        if (loginObject.osType == "Android") {
                                                            data = {
                                                                serviceType: "Manager",
                                                                title: 'Alert!!',
                                                                memberId: managerId,
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                activity: "REQUESTTOMANAGER"
                                                            }
                                                            otpService.sendAndriodPushNotification(loginObject.deviceToken, "", data, (err, successNotificationObj) => {
                                                                if (err)
                                                                    console.log(err)
                                                                else {
                                                                    console.log(successNotificationObj)
                                                                }
                                                            })
                                                        } else if (loginObject.osType == "IOS") {
                                                            notification = {
                                                                memberId: managerId,
                                                                activity: "Manager",
                                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                                title: "Manager Alert!!",
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                notificationType: "Manager",
                                                                serviceType: "Manager",
                                                                // activity: "REQUESTTOMANAGER"
                                                            }
                                                            otpService.sendIOSPushNotification(loginObject.deviceToken, notification, (err, successNotificationObj) => {
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
                            });
                        });
                        ////////////////// ******** END OF NOIFICATION *************/////////////////////
                    }
                });
            }
        }
    }).lean();
}

//not in use
const managerToManagerRequest = (req, res, next) => {

    let reportingTo = ObjectId(req.body.managerId);//parent manager id
    let managerId = ObjectId(req.body.asstManagerId);//child manager id
    let celebrityId = ObjectId(req.body.celebrityId);

    celebManager.findOne({ isActive: true, celebrityId: celebrityId, managerId: reportingTo, mainManagerId: { $exists: false } }, (err, celbManObj) => {
        if (err) {

        } else if (celbManObj) {
            let isCelebReq = true;
            let isCelebAccepted = true;
            let id;
            let reqToMainManagerExistingCelebrity = false;
            let newCelebManagerObj = {
                reportingTo: reportingTo,
                managerId: managerId,
                celebrityId: celebrityId,
                isCelebReq: isCelebReq,
                isCelebAccepted: isCelebAccepted,
                createdBy: req.body.createdBy
            }
            if (celbManObj.reportingTo) {
                let mainManagerId = ObjectId(celbManObj.reportingTo);//main parent manager id
                Object.assign(newCelebManagerObj, { mainManagerId: mainManagerId })
            }
            // else{
            let newCelebManager = new celebManager(newCelebManagerObj);
            ///remove previous permission if there
            ManagerPermissions.remove({ celebrityId: celebrityId, managerId: managerId }, (err, data) => {

            });
            //console.log(newCelebManager)
            let isActiveManagerExist = false;
            let isSameManager = false;
            let reqAgain = false;
            let oldCelebReqAccepted = false;
            let oldManagerAccepted = false;
            let celebExists = false;
            let managerAlreadyLinked

            celebManager.findOne({ $and: [{ reportingTo: managerId }, { celebrityId: celebrityId }, { isSuspended: false }] }, function (err, Mresult) {
                if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                if (Mresult) {
                    reqToMainManagerExistingCelebrity = true;
                }
                celebManager.find({
                    $and: [{ managerId: managerId }, { reportingTo: reportingTo }]
                }, (err, Mresult) => {
                    if (err) {
                        return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else {
                        for (let i = 0; i < Mresult.length; i++) {
                            if (Mresult[i].isActive == true) {
                                isActiveManagerExist = true;
                            }
                            if (Mresult[i].managerId + "" == managerId + "") {
                                id = Mresult[i]._id;
                                if (Mresult[i].celebrityId == celebrityId) {
                                    celebExists = true;
                                }
                                if (Mresult[i].isCelebReqNew == false) {
                                    reqAgain = true;
                                }
                                if (Mresult[i].isCelebAccepted == true) {
                                    oldCelebReqAccepted = true;
                                }
                                if (Mresult[i].isManagerAccepted == true) {
                                    oldManagerAccepted = true
                                }
                                if ((Mresult[i].celebrityId == celebrityId) && (Mresult[i].isActive == true)) {

                                }
                                isSameManager = true;
                            }
                        }
                        if (reqToMainManagerExistingCelebrity == true || reqToMainManagerExistingCelebrity == "true") {
                            console.log('manager request ============================= STEP 1')
                            res.json({
                                token: req.headers['x-access-token'],
                                success: 0,
                                message: "Already this manager is linked with this celebrity"
                            });
                        } else if (isSameManager && reqAgain) {//isActiveManagerExist && 
                            console.log('manager request ============================= STEP 2')
                            let reqbody = {
                                "isCelebReqNew": true,
                                "isCelebAccepted": true,
                                "status": "pending",
                                "updatedAt": new Date(),
                                "updatedBy": req.body.updatedBy,
                                "celebrityId": req.body.celebrityId
                            };

                            celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                                if (err) {
                                    return res.json({
                                        token: req.headers['x-access-token'],
                                        success: 0,
                                        message: `Request accepted and linked with profile successfully ${err}`
                                    });
                                }
                                res.json({
                                    token: req.headers['x-access-token'],
                                    success: 1,
                                    message: "Request send successfully"
                                });
                                ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                                User.findById(celebrityId, function (err, celebrityObject) {
                                    User.findById(managerId, function (err, managerObject) {
                                        let cond = []
                                        if (managerObject.email && managerObject.email != "") {
                                            cond.push({ email: managerObject.email })
                                        } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                            cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                                        }
                                        let query = {
                                            $or: cond
                                        }
                                        logins.findOne(query, function (err, loginObject) {
                                            if (loginObject == null) {
                                            } else {
                                                let message = {
                                                    to: loginObject.deviceToken,
                                                    data: {
                                                        serviceType: "Manager", title: 'Alert!!',
                                                        body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                    },
                                                    notification: {
                                                        memberId: managerId,
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
                                                            memberId: ObjectId(managerId),
                                                            notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                            isEnabled: true
                                                        };
                                                        notificationSetting.find(query, function (err, rest) {
                                                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                            // console.log("t1", rest);
                                                            else if (rest.length) {
                                                                var message = {
                                                                    to: loginObject.deviceToken,
                                                                    data: {
                                                                        serviceType: "Manager", title: 'Alert!!',
                                                                        body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                    },
                                                                    ///////  FCM SENDING MESSAGE to Manager ////////
                                                                    // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                                    notification: {
                                                                        memberId: managerId,
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
                            });
                        } else if (isSameManager && oldCelebReqAccepted && oldManagerAccepted) {
                            console.log('manager request ============================= STEP 3')
                            let reqbody = {
                                "isCelebReqNew": true,
                                "status": "pending",
                                "updatedAt": new Date(),
                                "updatedBy": req.body.updatedBy,
                                "celebrityId": req.body.celebrityId
                            };

                            celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                                if (err) {
                                    return res.json({
                                        token: req.headers['x-access-token'],
                                        success: 0,
                                        message: `${err}`
                                    });
                                }
                                res.json({
                                    token: req.headers['x-access-token'],
                                    success: 1,
                                    message: "Request sent again!"
                                });
                                ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                                User.findById(reportingTo, function (err, mainManagerObject) {
                                    User.findById(managerId, function (err, managerObject) {
                                        User.findById(celebrityId, function (err, celebrityObject) {
                                            let cond = []
                                            if (managerObject.email && managerObject.email != "") {
                                                cond.push({ email: managerObject.email })
                                            } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                                cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                                            }
                                            let query = {
                                                $or: cond
                                            }
                                            logins.findOne(query, function (err, loginObject) {
                                                if (loginObject == null) {
                                                } else {
                                                    let message = {
                                                        to: loginObject.deviceToken,
                                                        data: {
                                                            serviceType: "Manager", title: 'Alert!!',
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                        },
                                                        notification: {
                                                            memberId: managerId,
                                                            activity: "Manager",
                                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                                            title: "Manager Alert!!",
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            notificationType: "Manager",
                                                            serviceType: "Manager",
                                                            notificationFrom: celebrityObject._id
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
                                                                memberId: ObjectId(managerId),
                                                                notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                                isEnabled: true
                                                            };
                                                            notificationSetting.find(query, function (err, rest) {
                                                                if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                // console.log("t1", rest);
                                                                else if (rest.length) {
                                                                    var message = {
                                                                        to: loginObject.deviceToken,
                                                                        data: {
                                                                            serviceType: "Manager", title: 'Alert!!',
                                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                        },
                                                                        ///////  FCM SENDING MESSAGE to Manager ////////
                                                                        // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                                        notification: {
                                                                            memberId: managerId,
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
                                });
                                ////////////////// ******** END OF NOIFICATION *************/////////////////////
                            });
                        } else if (isActiveManagerExist && isSameManager) {
                            console.log('manager request ============================= STEP 4')
                            res.status(200).json({
                                token: req.headers['x-access-token'],
                                success: 0,
                                message: "Please make sure you don’t have active manager to send request to new manager."
                            });
                        } else if (isSameManager) {
                            console.log('manager request ============================= STEP 5')
                            let reqbody = {
                                "isCelebAccepted": true,
                                "status": "pending",
                                "updatedAt": new Date(),
                                "updatedBy": req.body.updatedBy,
                                "celebrityId": req.body.celebrityId
                            };

                            celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                                if (err) return res.send
                                    (err);
                                res.json({
                                    token: req.headers['x-access-token'],
                                    success: 1,
                                    message: "Request sent again!"
                                });
                                ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                                User.findById(reportingTo, function (err, mainManagerObject) {
                                    User.findById(managerId, function (err, managerObject) {
                                        User.findById(celebrityId, function (err, celebrityObject) {
                                            let cond = []
                                            if (managerObject.email && managerObject.email != "") {
                                                cond.push({ email: managerObject.email })
                                            } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                                cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                                            }
                                            let query = {
                                                $or: cond
                                            }
                                            logins.findOne(query, function (err, loginObject) {
                                                if (loginObject == null) {
                                                } else {
                                                    let message = {
                                                        to: loginObject.deviceToken,
                                                        data: {
                                                            serviceType: "Manager", title: 'Alert!!',
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                        },
                                                        notification: {
                                                            memberId: managerId,
                                                            activity: "Manager",
                                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                                            title: "Manager Alert!!",
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            notificationType: "Manager",
                                                            notificationFrom: celebrityObject._id,
                                                            serviceType: "Manager"
                                                        }
                                                    };

                                                    let notificationObj = new Notification(message.notification);
                                                    //Insert Notification
                                                    Notification.createNotification(notificationObj, function (err, message) {
                                                        if (err) {
                                                            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                        } else {
                                                            /* res.send({
                                                            message: "Notification sent successfully"
                                                            }); */
                                                            // console.log("Notification sent successfully!")
                                                            // console.log(message)
                                                            let query = {
                                                                memberId: ObjectId(managerId),
                                                                notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                                isEnabled: true
                                                            };
                                                            notificationSetting.find(query, function (err, rest) {
                                                                if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                // console.log("t1", rest);
                                                                else if (rest.length) {
                                                                    var message = {
                                                                        to: loginObject.deviceToken,
                                                                        data: {
                                                                            serviceType: "Manager", title: 'Alert!!',
                                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                        },
                                                                        ///////  FCM SENDING MESSAGE to Manager ////////
                                                                        // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                                        notification: {
                                                                            memberId: managerId,
                                                                            activity: "Manager",
                                                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                                                            title: "Manager Alert!!",
                                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                            notificationType: "Manager",
                                                                            serviceType: "Manager",
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
                                });
                                ////////////////// ******** END OF NOIFICATION *************/////////////////////
                            });
                        } else {
                            console.log('manager request ============================= STEP 6')
                            celebManager.createCelebManager(newCelebManager, function (err, CelebManagerObject) {
                                if (err) {
                                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                } else {
                                    res.status(200).json({
                                        token: req.headers['x-access-token'],
                                        success: 1,
                                        message: "Request sent to manager successfully!"
                                    })
                                    ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                                    User.findById(reportingTo, function (err, mainManagerObject) {
                                        User.findById(managerId, function (err, managerObject) {
                                            User.findById(celebrityId, function (err, celebrityObject) {
                                                let cond = []
                                                if (managerObject.email && managerObject.email != "") {
                                                    cond.push({ email: managerObject.email })
                                                } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                                    cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                                                }
                                                let query = {
                                                    $or: cond
                                                }
                                                logins.findOne(query, function (err, loginObject) {
                                                    if (loginObject == null) {
                                                    } else {
                                                        let message = {
                                                            to: loginObject.deviceToken,
                                                            data: {
                                                                serviceType: "Manager", title: 'Alert!!',
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            },
                                                            notification: {
                                                                memberId: managerId,
                                                                activity: "Manager",
                                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                                title: "Manager Alert!!",
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                notificationType: "Manager",
                                                                notificationFrom: celebrityObject._id,
                                                                serviceType: "Manager"
                                                            }
                                                        };

                                                        let notificationObj = new Notification(message.notification);
                                                        //Insert Notification
                                                        Notification.createNotification(notificationObj, function (err, message) {
                                                            if (err) {
                                                                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                            } else {
                                                                /* res.send({
                                                                message: "Notification sent successfully"
                                                                }); */
                                                                // console.log("Notification sent successfully!")
                                                                // console.log(message)
                                                                let query = {
                                                                    memberId: ObjectId(managerId),
                                                                    notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                                    isEnabled: true
                                                                };
                                                                notificationSetting.find(query, function (err, rest) {
                                                                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                                    // console.log("t1", rest);
                                                                    else if (rest.length) {
                                                                        var message = {
                                                                            to: loginObject.deviceToken,
                                                                            data: {
                                                                                serviceType: "Manager", title: 'Alert!!',
                                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                            },
                                                                            ///////  FCM SENDING MESSAGE to Manager ////////
                                                                            // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                                            notification: {
                                                                                memberId: managerId,
                                                                                activity: "Manager",
                                                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                                                title: "Manager Alert!!",
                                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                                                notificationType: "Manager",
                                                                                serviceType: "Manager",
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
                                    });
                                    ////////////////// ******** END OF NOIFICATION *************/////////////////////
                                }
                            });
                        }
                    }
                }).lean();
            });
            // }
        }
        else {
            res.json({ success: 0, message: "No relation found" })
        }
    })
}

const linkCelebAndManagerFromAdmin = (req, res, next) => {

    let celebrityId = req.body.celebrityId;
    let managerId = req.body.managerId;
    let isAdminReq = true;
    let newCelebManager = new celebManager({
        celebrityId: celebrityId,
        managerId: managerId,
        isAdminReq: isAdminReq,
        createdBy: req.body.createdBy,
        status: "Recommended"
    });

    let isActiveManagerExist = false;
    let isSameManager = false;
    let id = null

    celebManager.find({ celebrityId: celebrityId }, (err, Mresult) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        }
        else {
            for (let i = 0; i < Mresult.length; i++) {
                if (Mresult[i].isActive == true) {
                    isActiveManagerExist = true;
                }
                if (Mresult[i].managerId + "" == req.body.managerId) {
                    isSameManager = true;
                    id = Mresult[i]._id;
                }
            }
            if (isActiveManagerExist) {
                res.status(200).json({
                    "success": 0,
                    "message": "You are already linked with an active Manager. Please check the settings!"
                });
            } else if (isActiveManagerExist && isSameManager) {
                res.status(200).json({
                    "success": 0,
                    "message": "You are already linked with the Manager and Active. Please check the settings!"
                });
            } else if (isSameManager) {

                let reqbody = {
                    "isAdminReq": true,
                    "status": "pending",
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Manager request sent again!"
                        });
                        User.findById(celebrityId, function (err, celebrityObject) {
                            User.findById(managerId, function (err, managerObject) {
                                let cond = []
                                if (managerObject.email && managerObject.email != "") {
                                    cond.push({ email: managerObject.email })
                                } else if (managerObject.mobileNumber && managerObject.mobileNumber != "") {
                                    cond.push({ mobileNumber: { $regex: managerObject.mobileNumber } })
                                }
                                let query = {
                                    $or: cond
                                }
                                logins.findOne(query, function (err, loginObject) {
                                    if (loginObject == null) {
                                    } else {
                                        let message = {
                                            to: loginObject.deviceToken,
                                            data: {
                                                serviceType: "Manager", title: 'Alert!!',
                                                body: managerObject.firstName + " " + managerObject.lastName + " admin  has sent you 'be my manager' request",
                                            },
                                            notification: {
                                                memberId: celebrityId,
                                                activity: "Manager",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Alert!!",
                                                body: managerObject.firstName + " " + managerObject.lastName + "admin has sent you 'be my manager' request",
                                                notificationType: "Manager",
                                                notificationFrom: celebrityObject._id,
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
                                                    memberId: ObjectId(celebrityId),
                                                    notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                    isEnabled: true
                                                };

                                                notificationSetting.find(query, function (err, rest) {
                                                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                    //console.log("t1", rest);
                                                    else if (rest.length) {

                                                    //  PUSH SENDING MESSAGE to Manager ////////
                                                    // Save the EXT in Notifications Collection and send the Notification to Manager
                                                    let data, notification;
                                                    if (loginObject.osType == "Android") {
                                                        data = {
                                                            serviceType: "Manager",
                                                            title: 'Alert!!',
                                                            memberId: managerId,
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            activity: "REQUESTTOMANAGER"
                                                        }
                                                        otpService.sendAndriodPushNotification(loginObject.deviceToken, "", data, (err, successNotificationObj) => {
                                                            if (err)
                                                                console.log(err)
                                                            else {
                                                                console.log(successNotificationObj)
                                                            }
                                                        })
                                                    } else if (loginObject.osType == "IOS") {
                                                        notification = {
                                                            memberId: managerId,
                                                            //activity: "Manager",
                                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                                            title: "Manager Alert!!",
                                                            body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                            notificationType: "Manager",
                                                            serviceType: "Manager",
                                                            activity: "REQUESTTOMANAGER"
                                                        }
                                                        otpService.sendIOSPushNotification(loginObject.deviceToken, notification, (err, successNotificationObj) => {
                                                            if (err)
                                                                console.log(err)
                                                            else {
                                                                console.log(successNotificationObj)
                                                            }
                                                        });
                                                    }
                                                        // var message = {
                                                        //     to: loginObject.deviceToken,
                                                        //     data: {
                                                        //         serviceType: "Manager", title: 'Alert!!',
                                                        //         body: managerObject.firstName + " " + managerObject.lastName + " has sent you 'be my manager' request",
                                                        //     },
                                                        //     ///////  FCM SENDING MESSAGE to Manager ////////
                                                        //     // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                        //     notification: {
                                                        //         memberId: managerId,
                                                        //         activity: "Manager",
                                                        //         notificationSettingId: "5baf8b475129360870bcfe8f",
                                                        //         title: "Manager Alert!!",
                                                        //         body: managerObject.firstName + " " + managerObject.lastName + " has sent you 'be my manager' request",
                                                        //         notificationType: "Manager",
                                                        //         serviceType: "Manager"
                                                        //     }
                                                        // };
                                                        // fcm.send(message, function (err, response) {
                                                        //     if (err) {
                                                        //         console.log(err)
                                                        //     } else {
                                                        //     }
                                                        // });
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
                // res.status(200).json({
                //     "success": 0,
                //     "message": "You are already linked with this manager and In-Active. Please check the settings!"
                // });
            } else {
                celebManager.createCelebManager(newCelebManager, (err, CelebManagerObject) => {
                    if (err) {
                        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    } else {
                        res.status(200).json({
                            "success": 1,
                            "message": "Manager linked successfully"
                        })
                        ////////////////// ******** SEND NOIFICATION TO MANAGER *************/////////////////////
                        User.findById(celebrityId, (err, celebrityObject) => {
                            User.findById(managerId, (err, managerObject) => {
                                let celebrityEmail = celebrityObject.email;
                                let cond = []
                                if (celebrityObject.email && celebrityObject.email != "") {
                                    cond.push({ email: celebrityObject.email })
                                } else if (celebrityObject.mobileNumber && celebrityObject.mobileNumber != "") {
                                    cond.push({ mobileNumber: { $regex: celebrityObject.mobileNumber } })
                                }
                                let query = {
                                    $or: cond
                                }
                                // Send Notification to Celebrity
                                logins.findOne(query, (err, loginObject) => {
                                    if (loginObject == null) {
                                    } else {
                                        let message = {
                                            to: loginObject.deviceToken,
                                            data: {
                                                serviceType: "Manager", title: 'Alert!!',
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                            },
                                            notification: {
                                                memberId: managerId,
                                                activity: "Manager",
                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                title: "Manager Alert!!",
                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " has sent you 'be my manager' request",
                                                notificationType: "Manager",
                                                notificationFrom: celebrityObject._id,
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
                                                    memberId: ObjectId(celebrityId),
                                                    notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                    isEnabled: true
                                                };
                                                notificationSetting.findOne(query, (err, notificationSettingObj) => {
                                                    if (err)
                                                        console.log(err);
                                                    else if (notificationSettingObj) {
                                                        if (loginObject.osType == "Android") {
                                                            data = {
                                                                serviceType: "Manager",
                                                                title: 'Alert!!',
                                                                memberId: managerId,
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation sent you 'be my manager' request",
                                                                activity: "REQUESTTOMANAGER"
                                                            }
                                                            otpService.sendAndriodPushNotification(loginObject.deviceToken, "", data, (err, successNotificationObj) => {
                                                                if (err)
                                                                    console.log(err)
                                                                else {
                                                                    console.log(successNotificationObj)
                                                                }
                                                            })
                                                        } else if (loginObject.osType == "IOS") {
                                                            notification = {
                                                                memberId: managerId,
                                                                activity: "Manager",
                                                                notificationSettingId: "5baf8b475129360870bcfe8f",
                                                                title: "Manager Alert!!",
                                                                body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation sent you 'be my manager' request",
                                                                notificationType: "Manager",
                                                                serviceType: "Manager",
                                                                // activity: "REQUESTTOMANAGER"
                                                            }
                                                            otpService.sendIOSPushNotification(loginObject.deviceToken, notification, (err, successNotificationObj) => {
                                                                if (err)
                                                                    console.log(err)
                                                                else {
                                                                    console.log(successNotificationObj)
                                                                }
                                                            });
                                                        }
                                                        
                                                        
                                                        // var message = {
                                                        //     to: loginObject.deviceToken,
                                                        //     data: {
                                                        //         serviceType: "Manager", title: 'Alert!!',
                                                        //         body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation you 'be my manager' request",
                                                        //     },
                                                        //     ///////  FCM SENDING MESSAGE to Manager ////////
                                                        //     // Save the TEXT in Notifications Collection and send the Notification to Manager
                                                        //     notification: {
                                                        //         memberId: managerId,
                                                        //         activity: "Manager",
                                                        //         notificationSettingId: "5baf8b475129360870bcfe8f",
                                                        //         title: "Manager Alert!!",
                                                        //         body: celebrityObject.firstName + " " + celebrityObject.lastName + " got recommandation sent you 'be my manager' request",
                                                        //         notificationType: "Manager",
                                                        //         serviceType: "Manager"
                                                        //     }
                                                        // };
                                                        // fcm.send(message, function (err, response) {
                                                        //     if (err) {
                                                        //         console.log(err)
                                                        //     } else {
                                                        //     }
                                                        // });
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
            }
        }
    }).lean();

}

const findManagerByCelebrity = (req, res) => {
    let id = req.params.CelebId;

    celebManager.find({
        celebrityId: id
    }, (err, result) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: "Something went wrong.Please try again." + err });
        }
        if (result) {
            if (result.length == 0) {
                celebManager.find({}, function (err, result) {
                    if (result) {
                        res.json({ token: req.headers['x-access-token'], success: 1, data: result });
                        //res.send(result);
                    } else {
                        res.json({ token: req.headers['x-access-token'], success: 0, message: "No data found!" });
                    }
                }).sort({
                    createdAt: -1
                });
            } else {
                res.json({ token: req.headers['x-access-token'], success: 1, data: result });
            }

        } else {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "Celeb has no managers / Send a valid ID" });
        }
    });
}

const getManagerListForCelebrity = (req, res) => {
    let CelebId = ObjectId(req.params.CelebId);
    celebManager.aggregate([
        {
            $match: {
                $and: [{ celebrityId: CelebId }, { reportingTo: { $exists: false } }]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "managerId",
                foreignField: "_id",
                as: "managerProfile"
            }
        },
        {
            $unwind: "$managerProfile"
        },
        {
            $sort: { isActive: -1 }
        },
        {
            $project: {
                "_id": 1,
                "celebrityId": 1,
                "managerId": 1,
                "isSuspended": 1,
                "updatedBy": 1,
                "createdBy": 1,
                "updatedAt": 1,
                "createdAt": 1,
                "isActive": 1,
                "isAccess": 1,
                "feedBack": 1,
                "status": 1,
                "isManagerAccepted": 1,
                "isCelebAccepted": 1,
                "isManagerReqNew": 1,
                "isCelebReqNew": 1,
                "isCelebReq": 1,
                "isAdminReq": 1,
                "reportingTo": 1,
                "managerProfile._id": 1,
                "managerProfile.email": 1,
                "managerProfile.username": 1,
                "managerProfile.mobileNumber": 1,
                "managerProfile.managerCategory": 1,
                "managerProfile.managerIndustry": 1,
                "managerProfile.isManager": 1,
                "managerProfile.isPromoter": 1,
                "managerProfile.IsDeleted": 1,
                "managerProfile.updated_at": 1,
                "managerProfile.created_at": 1,
                "managerProfile.Dnd": 1,
                "managerProfile.isCeleb": 1,
                "managerProfile.status": 1,
                "managerProfile.liveStatus": 1,
                "managerProfile.industry": 1,
                "managerProfile.profession": 1,
                "managerProfile.lastName": 1,
                "managerProfile.firstName": 1,
                "managerProfile.imageRatio": 1,
                "managerProfile.avtar_originalname": 1,
                "managerProfile.avtar_imgPath": 1
            }
        }
    ], (err, CMresult) => {
        if (err) {
            res.status(200).json({ success: 0, message: `${err.message}`});
        }
        else {
            res.json({"success": 1, "token": req.headers['x-access-token'], "data": CMresult
            });
        }
    })
    // let result = [];
    // let query = { $and: [{ celebrityId: ObjectId(celebrityId) }, { reportingTo: { $exists: false}}] }
    // celebManager.find(query,(err, CMresult)=>{
    //     if(err){
    //         res.json({token:req.headers['x-access-token'],success:0,message:err});
    //     }
    //     if(CMresult){
    //         async.each(CMresult,(celebManagerObj, callback) =>{

    //             User.findById(ObjectId(celebManagerObj.managerId),(err, managerObject)=> {
    //                 if(err) 
    //                 {
    //                     return callback(new Error(`Server Error`), null);
    //                 }
    //                 if(managerObject) {
    //                     newCMObject = {}
    //                     newCMObject = managerObject;
    //                     fObject = {}
    //                     fObject = celebManagerObj;
    //                     Object.assign(fObject, {
    //                         "managerProfile": managerObject
    //                     })
    //                     result.push(fObject)
    //                     callback()
    //                 }
    //             }).lean();
    //         },(err)=>{
    //             if (err)
    //             {
    //                 res.status(200).json({
    //                     success: 0,
    //                     message: `${err.message}`
    //                 });
    //             }
    //             else
    //             {
    //                 result.sort((x, y)=>{
    //                     return (x.isSuspended === y.isSuspended) ? 1 : x.isSuspended ? 1 : -1;
    //                 });
    //                 res.json({
    //                     "success": 1,
    //                     "token":req.headers['x-access-token'],
    //                     "data": result
    //                 });
    //             }
    //         });
    //     } else {
    //         console.log("******************************************************")
    //         res.json({
    //             error: "Celeb has no managers / Send a valid ID"
    //         });
    //     }
    // }).sort({ updatedAt: -1 }).lean();
}

const getCelebrityListForManager = (req, res) => {

    let id = ObjectId(req.params.managerID);
    // console.log(id)
    let result = [];
    let query = { $and: [{ $or: [{ managerId: id }, { reportingTo: id }] }, { $or: [{ isCelebReq: true }, { isCelebReqNew: true }, { isCelebAccepted: true }] }] };
    // console.log(query)
    celebManager.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: "users",
                localField: "celebrityId",
                foreignField: "_id",
                as: "celebrityProfile"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "reportingTo",
                foreignField: "_id",
                as: "reportingToProfile"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "managerId",
                foreignField: "_id",
                as: "managerProfile"
            }
        },
        // {
        //     $unwind:{ path: "$managerProfile" }
        // },
        {
            $unwind: "$celebrityProfile"
        },
        {
            $sort: { updatedAt: -1 }
        },
        {
            $project: {
                "_id": 1,
                "celebrityId": 1,
                "managerId": 1,
                "isSuspended": 1,
                "updatedBy": 1,
                "createdBy": 1,
                "updatedAt": 1,
                "createdAt": 1,
                "isActive": 1,
                "isAccess": 1,
                "feedBack": 1,
                "status": 1,
                "isManagerAccepted": 1,
                "isCelebAccepted": 1,
                "isManagerReqNew": 1,
                "isCelebReqNew": 1,
                "isCelebReq": 1,
                "isAdminReq": 1,
                "reportingTo": 1,
                "celebrityProfile._id": 1,
                "celebrityProfile.email": 1,
                "celebrityProfile.username": 1,
                "celebrityProfile.mobileNumber": 1,
                "celebrityProfile.managerCategory": 1,
                "celebrityProfile.managerIndustry": 1,
                "celebrityProfile.isManager": 1,
                "celebrityProfile.isPromoter": 1,
                "celebrityProfile.IsDeleted": 1,
                "celebrityProfile.updated_at": 1,
                "celebrityProfile.created_at": 1,
                "celebrityProfile.Dnd": 1,
                "celebrityProfile.isCeleb": 1,
                "celebrityProfile.status": 1,
                "celebrityProfile.liveStatus": 1,
                "celebrityProfile.industry": 1,
                "celebrityProfile.profession": 1,
                "celebrityProfile.lastName": 1,
                "celebrityProfile.firstName": 1,
                "celebrityProfile.imageRatio": 1,
                "celebrityProfile.avtar_originalname": 1,
                "celebrityProfile.avtar_imgPath": 1,
                "reportingToProfile._id": 1,
                "reportingToProfile.email": 1,
                "reportingToProfile.username": 1,
                "reportingToProfile.mobileNumber": 1,
                "reportingToProfile.managerCategory": 1,
                "reportingToProfile.managerIndustry": 1,
                "reportingToProfile.isManager": 1,
                "reportingToProfile.isPromoter": 1,
                "reportingToProfile.IsDeleted": 1,
                "reportingToProfile.updated_at": 1,
                "reportingToProfile.created_at": 1,
                "reportingToProfile.Dnd": 1,
                "reportingToProfile.isCeleb": 1,
                "reportingToProfile.status": 1,
                "reportingToProfile.liveStatus": 1,
                "reportingToProfile.industry": 1,
                "reportingToProfile.profession": 1,
                "reportingToProfile.lastName": 1,
                "reportingToProfile.firstName": 1,
                "reportingToProfile.imageRatio": 1,
                "reportingToProfile.avtar_originalname": 1,
                "reportingToProfile.avtar_imgPath": 1,
                "managerProfile._id": 1,
                "managerProfile.email": 1,
                "managerProfile.username": 1,
                "managerProfile.mobileNumber": 1,
                "managerProfile.managerCategory": 1,
                "managerProfile.managerIndustry": 1,
                "managerProfile.isManager": 1,
                "managerProfile.isPromoter": 1,
                "managerProfile.IsDeleted": 1,
                "managerProfile.updated_at": 1,
                "managerProfile.created_at": 1,
                "managerProfile.Dnd": 1,
                "managerProfile.isCeleb": 1,
                "managerProfile.status": 1,
                "managerProfile.liveStatus": 1,
                "managerProfile.industry": 1,
                "managerProfile.profession": 1,
                "managerProfile.lastName": 1,
                "managerProfile.firstName": 1,
                "managerProfile.imageRatio": 1,
                "managerProfile.avtar_originalname": 1,
                "managerProfile.avtar_imgPath": 1
            }
        }
    ], (err, CMresult) => {
        if (err) {
            res.status(200).json({token: req.headers['x-access-token'], success: 0, message: `${err.message}`});
        }
        else if (CMresult) {
            CMresult.map((CMresultObj) => {
                if (id + "" == CMresultObj.reportingTo + "") {
                    CMresultObj.managerProfile = CMresultObj.managerProfile[0]
                }
                else {
                    CMresultObj.managerProfile = CMresultObj.reportingToProfile[0]
                }
                // CMresultObj.managerProfile = CMresultObj.managerProfile[0]
                return CMresultObj;
            });
            // console.log(CMresult)

            res.status(200).json({token: req.headers['x-access-token'], success: 1, data: CMresult});
        }
        else {
            res.json({token: req.headers['x-access-token'], success: 0, message: "Manager has no Celebrites linked / Send a valid ID"});
        }
    })
    // celebManager.find(query,(err, CMresult)=>{
    //     if (err){
    //         res.json({token:req.headers['x-access-token'],success:0,message:err});
    //     }
    //     else if (CMresult) {
    //         let newCMObject;
    //         let loop = 0;
    //         async.each(CMresult, function (celebManagerObj, callback) {
    //             // If there is no reporting manager, send Manager Profile along with celebrity profile
    //             if (celebManagerObj.reportingTo == undefined) {
    //                 User.findById(celebManagerObj.celebrityId, function (err, celebrityObject) {
    //                     newCMObject = {}
    //                     newCMObject = celebrityObject;
    //                     fObject = {}
    //                     fObject = celebManagerObj;
    //                     Object.assign(fObject, {
    //                         "celebrityProfile": celebrityObject,
    //                         "managerProfile": {}
    //                     })
    //                     result.push(fObject)
    //                     loop = loop + 1;
    //                     callback()
    //                 });
    //             } else {
    //                 if (celebManagerObj.reportingTo == id) {
    //                     // Send manager profile details from ReportingTO
    //                     User.findById(celebManagerObj.managerId, function (err, managerObject) {
    //                         if (err) console.log(err)
    //                         User.findById(celebManagerObj.celebrityId, function (err, celebrityObject) {
    //                             if (err) console.log(err)
    //                             newCMObject = {}
    //                             newCMObject = celebrityObject;
    //                             fObject = {}
    //                             fObject = celebManagerObj;
    //                             Object.assign(fObject, {
    //                                 "celebrityProfile": celebrityObject,
    //                                 "managerProfile": managerObject
    //                             })
    //                             result.push(fObject)
    //                             callback()
    //                         });
    //                     });

    //                 } else {
    //                     User.findById(celebManagerObj.reportingTo
    //                         , function (err, managerObject) {
    //                             if (err) console.log(err)
    //                             User.findById(celebManagerObj.celebrityId
    //                                 , function (err, celebrityObject) {
    //                                     if (err) console.log(err)
    //                                     newCMObject = {}
    //                                     newCMObject = celebrityObject;
    //                                     fObject = {}
    //                                     fObject = celebManagerObj;
    //                                     Object.assign(fObject, {
    //                                         "celebrityProfile": celebrityObject,
    //                                         "managerProfile": managerObject
    //                                     })
    //                                     result.push(fObject)
    //                                     callback()
    //                                 });
    //                         });
    //                 }
    //             }
    //         }, function (err) {
    //             // if any of the file processing produced an error, err would equal that error
    //             if (err)
    //                 res.status(200).json({
    //                     token:req.headers['x-access-token'],
    //                     success: 0,
    //                     message: `${err.message}`
    //                 });
    //             else
    //             {
    //                 result.sort(function (a, b) {
    //                     // convert date object into number to resolve issue in typescript
    //                     return new Date(b.updatedAt) - new Date(a.updatedAt);
    //                 })
    //                 res.status(200).json({
    //                     token:req.headers['x-access-token'],
    //                     success: 1,
    //                     data: result
    //                 });
    //             }

    //         });
    //     } else {
    //         res.json({
    //             token:req.headers['x-access-token'],
    //             success: 0,
    //             message: "Manager has no Celebrites linked / Send a valid ID"
    //         });
    //     }
    // }).sort({ updatedAt: -1 }).lean();
}

// const managerSearchWhenCelebrityLogin = (req, res, next)=> {
//     // console.log('body')
//     // console.log(req.params)
//     // console.log(req.body)
//     // console.log('end of body')
//     let memberId = req.params.memberId;
//     let isCelebAccepted = false;
//     let isManagerAccepted = false;
//     let isCelebReqNew = false;
//     let isManagerReqNew = false;
//     let status;
//     let managersArray = [];
//     let fObject;
//     // let searchString = "^"+req.body.searchString.replace(/\s+/g,' ');
//     let searchString = req.body.searchString;
//     let managerIndustry = req.body.managerIndustry;
//     let managerCategory = req.body.managerCategory;
//     let country = req.body.country;
//     let experience = req.body.experience;

//     let OrArr = [];
//     OrArr = [{ _id: { "$nin": [ObjectId(memberId)] } }, { isManager: true }];
//     let query = { $and: OrArr };
//     if (searchString != null && searchString != "null") {
//         OrArr.push({  name : { $regex: searchString, $options: 'im' }});
//     }
//     if (managerIndustry != null && managerIndustry != "null") {
//         OrArr.push({ managerIndustry:{ $in:[ObjectId(managerIndustry)]} });
//     }
//     if (managerCategory != null && managerCategory != "null") {
//         OrArr.push({ managerCategory: {$in:[managerCategory]} });
//     }
//     if (country != null && country != "null") {
//         OrArr.push({ country: country });
//     }
//     if (experience != null && experience != "null") {
//         OrArr.push({ "experience": { $gte: parseInt(experience) } });
//     }
//     // console.log(query)
//     User.aggregate(
//         [
//             {
//                 $addFields:{
//                     name:{
//                     $concat:[
//                         '$firstName',
//                         ' ',
//                         '$lastName',
//                     ]
//                     }
//                 }
//             },
//             {
//                 $match: query,
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     firstName: 1,
//                     lastName: 1,
//                     avtar_imgPath: 1,
//                     profession: 1,
//                     isCeleb: 1,
//                     isManager: 1,
//                     isOnline: 1,
//                     isPromoted: 1,
//                     isTrending: 1,
//                     aboutMe: 1,
//                     email: 1,
//                     mobileNumber: 1,
//                     isEditorChoice: 1,
//                     industry:1,
//                     celebritiesWorkedFor:1,
//                     managerIndustry:1
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "managerindustries",
//                     localField: "managerIndustry",
//                     foreignField: "_id",
//                     as: "industryDetails"
//                 }
//             },
//             {
//                 $sort: { created_at : -1 }
//             }
//         ],
//         function (err, CMresult) {
//             if (err) {
//                 res.json({token:req.headers['x-access-token'],success:0,message:err});
//             }
//             // console.log('result')
//             // console.log(CMresult)
//             // console.log('error')
//             // console.log(err)
//             if (CMresult) {
//                 if (CMresult.length == 0) {
//                     return res.json({
//                         token:req.headers['x-access-token'],
//                         success: 1,
//                         data:[],
//                         message: "No results found!! Cheez :)"
//                     })
//                 } else {

//                     // check for the matched results from celebManagers collection
//                     async.each(CMresult, function (celebManagerObj, callback) {
//                         let query = { $and: [{ celebrityId: memberId }, { managerId: celebManagerObj._id }] }
//                         celebManager.findOne(query, function (err, newObj) {
//                             if (err) res.json({token:req.headers['x-access-token'],success:0,message:err});
//                             if (newObj) {
//                                 if ((newObj.isCelebAccepted == true) && (newObj.isManagerAccepted == true) && (newObj.isActive == true)) {
//                                 } else if ((newObj.isCelebAccepted == true && newObj.isManagerAccepted == true && newObj.isCelebReqNew == true && newObj.isManagerReqNew == true)) {
//                                 } else if ((newObj.isCelebAccepted == true && newObj.isManagerAccepted == true && newObj.isCelebReqNew == true)) {
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": true,
//                                         "isCelebReqNew": true,
//                                         "isManagerReqNew": false,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if ((newObj.isCelebAccepted == true && newObj.isManagerAccepted == true)) {
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": true,
//                                         "isCelebReqNew": false,
//                                         "isManagerReqNew": false,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if (newObj.isCelebReqNew == true) {
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": isManagerAccepted,
//                                         "isCelebReqNew": true,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if (newObj.isCelebAccepted == true) {
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": isManagerAccepted,
//                                         "isCelebReqNew": isCelebReqNew,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if (newObj.isManagerAccepted == true) {
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "isCelebAccepted": isCelebAccepted,
//                                         "isManagerAccepted": true,
//                                         "isCelebReqNew": isCelebReqNew,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else {
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "isCelebAccepted": isCelebAccepted,
//                                         "isManagerAccepted": isManagerAccepted,
//                                         "isCelebReqNew": isCelebReqNew,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 }
//                             } else {
//                                 fObject = {};
//                                 fObject = celebManagerObj
//                                 Object.assign(fObject, {
//                                     "isCelebAccepted": false,
//                                     "isManagerAccepted": false,
//                                     "isCelebReqNew": false,
//                                     "isManagerReqNew": false,
//                                     "status": "",
//                                     "reqID": ""
//                                 })
//                                 managersArray.push(fObject);
//                             }
//                             callback()
//                         }).lean();

//                     }, function (err) {
//                         // if any of the file processing produced an error, err would equal that error
//                         if (err)
//                             res.status(200).json({
//                                 token:req.headers['x-access-token'],
//                                 success: 0,
//                                 message: `${err.message}`
//                             });
//                         else
//                         {
//                             console.log("adfdsafd")
//                             managersArray.sort(function (a,b) {
//                                 if (a._id < b._id)
//                                   return -1;
//                                 if (a._id > b._id)
//                                   return 1;
//                                 return 0;
//                               })
//                             res.status(200).json({
//                                 token:req.headers['x-access-token'],
//                                 success: 1,
//                                 data: managersArray
//                             });
//                         }
//                     });
//                 }
//             } else {
//                 return res.json({
//                     token:req.headers['x-access-token'],
//                     success: 1,
//                     data: [],
//                     message: "No results found!! Cheez :)"
//                 })
//             }
//         }
//     );
// }



const managerSearchWhenCelebrityLogin = (req, res, next) => {
    let memberId = req.params.memberId;
    memberId = ObjectId(memberId);
    let searchString = req.body.searchString;
    let managerIndustry = req.body.managerIndustry;
    let managerCategory = req.body.managerCategory;
    let country = req.body.country;
    let experience = req.body.experience;
    let OrArr = [];
    if (searchString != null && searchString != "null") {
        OrArr.push({ name: { $regex: "^" + searchString, $options: 'im' } });
    }
    if (managerIndustry != null && managerIndustry != "null") {
        OrArr.push({ managerIndustry: { $in: [ObjectId(managerIndustry)] } });
    }
    if (managerCategory != null && managerCategory != "null") {
        OrArr.push({ managerCategory: { $in: [managerCategory] } });
    }
    if (country != null && country != "null") {
        OrArr.push({ country: country });
    }
    if (experience != null && experience != "null") {
        OrArr.push({ "experience": { $gte: parseInt(experience) } });
    }
    let query = { $and: OrArr };
    FeedbackModel.aggregate([
        {
            $match: {
                reason: "Block/Report",
                celebrityId: memberId
            }
        },
        {
            $group: {
                _id: "$memberId"
            }
        }
    ], (err, blockedUser1) => {
        if (err) {
            console.log(err)
        }
        ServiceTransaction.aggregate([
            {
                $match: {
                    callRemarks: "Block/Report",
                    receiverId: memberId
                }
            },
            {
                $group: {
                    _id: "$senderId"
                }
            }
        ], (err, blockedUser2) => {
            if (err) {
                console.log(err)
            }
            let blockedUser = blockedUser1.concat(blockedUser2)
            selfAndBlockUser = blockedUser.map((buser) => {
                return buser._id;
            })
            selfAndBlockUser.push(memberId)
            User.aggregate([
                {
                    $match: {
                        _id: { "$nin": selfAndBlockUser },
                        isManager: true
                    }
                },
                {
                    $addFields: {
                        name: {
                            $concat: [
                                '$firstName',
                                ' ',
                                '$lastName',
                            ]
                        }
                    }
                },
                {
                    $match: query,
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        firstName: 1,
                        lastName: 1,
                        avtar_imgPath: 1,
                        profession: 1,
                        isCeleb: 1,
                        isManager: 1,
                        isOnline: 1,
                        isPromoted: 1,
                        isTrending: 1,
                        aboutMe: 1,
                        email: 1,
                        mobileNumber: 1,
                        isEditorChoice: 1,
                        industry: 1,
                        celebritiesWorkedFor: 1,
                        managerIndustry: 1
                    }
                },
                {
                    $lookup: {
                        from: "managerindustries",
                        localField: "managerIndustry",
                        foreignField: "_id",
                        as: "industryDetails"
                    }
                },
                {
                    $sort: { name: 1 }
                }, {
                    $project: {
                        _id: 1,
                        email: 1,
                        name: 1,
                        mobileNumber: 1,
                        celebritiesWorkedFor: 1,
                        managerIndustry: 1,
                        isManager: 1,
                        isPromoted: 1,
                        isEditorChoice: 1,
                        isOnline: 1,
                        isTrending: 1,
                        isCeleb: 1,
                        industry: 1,
                        profession: 1,
                        aboutMe: 1,
                        lastName: 1,
                        firstName: 1,
                        avtar_imgPath: 1,
                        industryDetails: 1,
                        isActive: { '$cond': [false, true, false] },
                        isRequested: { '$cond': [false, true, false] }
                    }
                }], (err, managerList1) => {
                    if (err) {
                        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else if (managerList1) {
                        OrArr = OrArr.filter((obj) => {
                            return obj.name == undefined;
                        });
                        let exceptId = [];
                        exceptId = managerList1.map((manager) => {
                            return manager._id
                        })
                        exceptId = exceptId.concat(selfAndBlockUser)
                        if (searchString != null && searchString != "null") {
                            OrArr.push({ name: { $ne: { $regex: "^" + searchString, $options: 'im' } } });
                            OrArr.push({ name: { $regex: searchString, $options: 'im' } });
                        }
                        let query = { $and: OrArr };

                        User.aggregate([
                            {
                                $match: {
                                    _id: { "$nin": exceptId },
                                    isManager: true
                                }
                            },
                            {
                                $addFields: {
                                    name: {
                                        $concat: [
                                            '$firstName',
                                            ' ',
                                            '$lastName',
                                        ]
                                    }
                                }
                            },
                            {
                                $match: query,
                            },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    firstName: 1,
                                    lastName: 1,
                                    avtar_imgPath: 1,
                                    profession: 1,
                                    isCeleb: 1,
                                    isManager: 1,
                                    isOnline: 1,
                                    isPromoted: 1,
                                    isTrending: 1,
                                    aboutMe: 1,
                                    email: 1,
                                    mobileNumber: 1,
                                    isEditorChoice: 1,
                                    industry: 1,
                                    celebritiesWorkedFor: 1,
                                    managerIndustry: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: "managerindustries",
                                    localField: "managerIndustry",
                                    foreignField: "_id",
                                    as: "industryDetails"
                                }
                            },
                            {
                                $sort: { name: 1 }
                            }, {
                                $project: {
                                    _id: 1,
                                    email: 1,
                                    name: 1,
                                    mobileNumber: 1,
                                    celebritiesWorkedFor: 1,
                                    managerIndustry: 1,
                                    isManager: 1,
                                    isPromoted: 1,
                                    isEditorChoice: 1,
                                    isOnline: 1,
                                    isTrending: 1,
                                    isCeleb: 1,
                                    industry: 1,
                                    profession: 1,
                                    aboutMe: 1,
                                    lastName: 1,
                                    firstName: 1,
                                    avtar_imgPath: 1,
                                    industryDetails: 1,
                                    isActive: { '$cond': [false, true, false] },
                                    isRequested: { '$cond': [false, true, false] }
                                }
                            }], (err, managerList2) => {
                                if (err) {
                                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                }
                                else if (managerList2) {
                                    let managerList = managerList1;
                                    if (managerList2.length) {
                                        managerList = managerList1.concat(managerList2)
                                    }
                                    if (managerList.length == 0) {
                                        return res.json({
                                            token: req.headers['x-access-token'],
                                            success: 1,
                                            data: [],
                                            message: "No manager found!! Cheez :)"
                                        })
                                    } else {
                                        CelebManagerService.checkActiveManagerOrNot(memberId, null, (err, celebManagerObj) => {
                                            if (err) {
                                                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                            } else if (celebManagerObj) {
                                                managerList.map((manager) => {
                                                    if (manager._id.equals(celebManagerObj.managerId)) {
                                                        manager.isActive = true;
                                                        manager.celeManagerRequestId = celebManagerObj._id
                                                    } else {
                                                        manager.isActive = false
                                                        manager.celeManagerRequestId = null
                                                    }
                                                    return manager;
                                                })
                                                return res.json({
                                                    token: req.headers['x-access-token'],
                                                    success: 1,
                                                    data: managerList
                                                })
                                            } else {
                                                CelebManagerService.checkRequestedByAnyOtherMainManagerOrNot(memberId, (err, celebManagerObj) => {
                                                    if (err) {
                                                        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                    } else if (celebManagerObj) {
                                                        managerList.map((manager) => {
                                                            if (manager._id.equals(celebManagerObj.managerId)) {
                                                                manager.celeManagerRequestId = celebManagerObj._id;
                                                                manager.isRequested = true
                                                            } else {
                                                                manager.celeManagerRequestId = null;
                                                                manager.isRequested = false
                                                            }
                                                            return manager;
                                                        })
                                                        return res.json({
                                                            token: req.headers['x-access-token'],
                                                            success: 1,
                                                            data: managerList
                                                        })
                                                    } else {
                                                        return res.json({
                                                            token: req.headers['x-access-token'],
                                                            success: 1,
                                                            data: managerList
                                                        })
                                                    }
                                                });
                                            }
                                        })

                                    }
                                }
                            });
                    }
                });
        })
    })
};

// const managerSearchWhenManagerLogin = (req, res, next) =>{
//     // console.log('body')
//     // console.log(req.params)
//     // console.log(req.body)
//     // console.log('end of body')
//     let memberId = req.params.memberId;
//     let isCelebAccepted = false;
//     let isManagerAccepted = false;
//     let isCelebReqNew = false;
//     let isManagerReqNew = false;
//     let status;
//     let managersArray = [];
//     let fObject;
//     //let searchString = "^"+req.body.searchString.replace(/\s+/g,' ');
//     let searchString = req.body.searchString;
//     let managerIndustry = req.body.managerIndustry;
//     let managerCategory = req.body.managerCategory;
//     let country = req.body.country;
//     let experience = req.body.experience;

//     let OrArr = [];
//     OrArr = [{ _id: { "$nin": [ObjectId(memberId)] } }, { isManager: true }];
//     let query = { $and: OrArr };
//     if (searchString != null && searchString != "null") {
//         OrArr.push({  name : { $regex: searchString, $options: 'im' }});
//     }
//     if (managerIndustry != null && managerIndustry != "null") {
//         OrArr.push({ managerIndustry: { $in:[ObjectId(managerIndustry)]}});
//     }
//     if (managerCategory != null && managerCategory != "null") {
//         OrArr.push({ managerCategory: { $in:[managerCategory]} });
//     }
//     if (country != null && country != "null") {
//         OrArr.push({ country: country });
//     }
//     if (experience != null && experience != "null") {
//         OrArr.push({ "experience": { $gte: parseInt(experience) } });
//     }
//     // console.log(OrArr)
//     User.aggregate(
//         [
//             {
//                 $addFields:{
//                     name:{
//                     $concat:[
//                         '$firstName',
//                         ' ',
//                         '$lastName',
//                     ]
//                     }
//                 }
//             },
//             {
//                 $match: query,
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     firstName: 1,
//                     lastName: 1,
//                     avtar_imgPath: 1,
//                     profession: 1,
//                     isCeleb: 1,
//                     isManager: 1,
//                     isOnline: 1,
//                     isPromoted: 1,
//                     isTrending: 1,
//                     aboutMe: 1,
//                     email: 1,
//                     mobileNumber: 1,
//                     isEditorChoice: 1,
//                     managerIndustry:1
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "managerindustries",
//                     localField: "managerIndustry",
//                     foreignField: "_id",
//                     as: "industryDetails"
//                 }
//             },
//             {
//                 $sort: { created_at : -1 }
//             }

//         ],
//         (err, CMresult)=>{
//             if (err) {
//                 res.json({token:req.headers['x-access-token'],success:0,message:err});
//             }
//             if (CMresult) {
//                 if (CMresult.length == 0) {
//                     return res.json({
//                         token:req.headers['x-access-token'],
//                         success: 1,
//                         data:[],
//                         message: "No results found!! Cheez :)"
//                     })
//                 } else {
//                     // console.log('****** START OF search results ********')
//                     // console.log(CMresult)
//                     // console.log('****** END OF search results ********')

//                     // check for the matched results from celebManagers collection
//                     async.each(CMresult, function (celebManagerObj, callback) {
//                         let query = { $and: [{ reportingTo: memberId }, { managerId: celebManagerObj._id }] }
//                         celebManager.findOne(query, function (err, newObj) {
//                             if (err) res.json({token:req.headers['x-access-token'],success:0,message:err});
//                             if (newObj) {
//                                 if ((newObj.isCelebAccepted == true) && (newObj.isManagerAccepted == true) && (newObj.isActive == true)) {
//                                     // console.log('Step1')
//                                 } else if ((newObj.isCelebAccepted == true && newObj.isManagerAccepted == true && newObj.isCelebReqNew == true && newObj.isManagerReqNew == true)) {
//                                     // console.log('Step 2')
//                                 } else if ((newObj.isCelebAccepted == true && newObj.isManagerAccepted == true && newObj.isCelebReqNew == true)) {
//                                     // console.log('Step 3')
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "reportingTo": newObj.reportingTo,
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": true,
//                                         "isCelebReqNew": true,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if ((newObj.isCelebAccepted == true && newObj.isManagerAccepted == true && newObj.isManagerReqNew == true)) {
//                                     // console.log('Step 4')
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "reportingTo": newObj.reportingTo,
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": true,
//                                         "isCelebReqNew": false,
//                                         "isManagerReqNew": true,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if ((newObj.isCelebAccepted == true && newObj.isManagerAccepted == true)) {
//                                     // console.log('Step 5')
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "reportingTo": newObj.reportingTo,
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": true,
//                                         "isCelebReqNew": false,
//                                         "isManagerReqNew": false,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if (newObj.isCelebReqNew == true) {
//                                     // console.log('Step 5')
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "reportingTo": newObj.reportingTo,
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": isManagerAccepted,
//                                         "isCelebReqNew": true,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if (newObj.isCelebAccepted == true) {
//                                     // console.log('Step 6')
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "reportingTo": newObj.reportingTo,
//                                         "isCelebAccepted": true,
//                                         "isManagerAccepted": isManagerAccepted,
//                                         "isCelebReqNew": isCelebReqNew,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else if (newObj.isManagerAccepted == true) {
//                                     // console.log('Step 7')
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "reportingTo": newObj.reportingTo,
//                                         "isCelebAccepted": isCelebAccepted,
//                                         "isManagerAccepted": true,
//                                         "isCelebReqNew": isCelebReqNew,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 } else {
//                                     // console.log('Step 8')
//                                     fObject = {};
//                                     fObject = celebManagerObj
//                                     Object.assign(fObject, {
//                                         "reportingTo": newObj.reportingTo,
//                                         "isCelebAccepted": isCelebAccepted,
//                                         "isManagerAccepted": isManagerAccepted,
//                                         "isCelebReqNew": isCelebReqNew,
//                                         "isManagerReqNew": isManagerReqNew,
//                                         "status": newObj.status,
//                                         "reqID": newObj._id
//                                     })
//                                     managersArray.push(fObject);
//                                 }
//                             } else {
//                                 // console.log('for null object')
//                                 fObject = {};
//                                 fObject = celebManagerObj
//                                 Object.assign(fObject, {
//                                     "reportingTo": "0",
//                                     "isCelebAccepted": false,
//                                     "isManagerAccepted": false,
//                                     "isCelebReqNew": false,
//                                     "isManagerReqNew": false,
//                                     "status": "",
//                                     "reqID": ""
//                                 })
//                                 // newcelebManagerObj["isCelebAccepted"] = true;
//                                 // newcelebManagerObj["isManagerAccepted"] = true;
//                                 managersArray.push(fObject);
//                             }
//                             callback()
//                         }).lean();

//                     }, function (err) {
//                         // if any of the file processing produced an error, err would equal that error
//                         if (err)
//                             res.status(200).json({
//                                 token:req.headers['x-access-token'],
//                                 success: 0,
//                                 message: `${err.message}`
//                             });
//                         else{
//                             managersArray.sort(function (a,b) {
//                                 if (a._id < b._id)
//                                   return -1;
//                                 if (a._id > b._id)
//                                   return 1;
//                                 return 0;
//                               })
//                             res.status(200).json({
//                                 token:req.headers['x-access-token'],
//                                 success: 1,
//                                 data: managersArray
//                             });
//                         }    
//                     });
//                 }
//             } else {
//                 return res.send({
//                     token:req.headers['x-access-token'],
//                     success: 1,
//                     data:[],
//                     message: "No results found!! Cheez :)"
//                 })
//             }
//         }
//     );
// }

const managerSearchWhenManagerLogin = (req, res, next) => {
    let memberId = req.params.memberId;
    let searchString = req.body.searchString;
    let managerIndustry = req.body.managerIndustry;
    let managerCategory = req.body.managerCategory;
    let country = req.body.country;
    let experience = req.body.experience;
    let selfId = req.body.selfId;

    let OrArr = [];
    OrArr = [{ _id: { "$nin": [ObjectId(memberId)] } }, { isManager: true }];
    let query = { $and: OrArr };
    if (searchString != null && searchString != "null") {
        OrArr.push({ name: { $regex: "^" + searchString, $options: 'im' } });
    }
    if (managerIndustry != null && managerIndustry != "null") {
        OrArr.push({ managerIndustry: { $in: [ObjectId(managerIndustry)] } });
    }
    if (managerCategory != null && managerCategory != "null") {
        OrArr.push({ managerCategory: { $in: [managerCategory] } });
    }
    if (country != null && country != "null") {
        OrArr.push({ country: country });
    }
    if (experience != null && experience != "null") {
        OrArr.push({ "experience": { $gte: parseInt(experience) } });
    }
    // console.log(OrArr)
    managerList = [];

    FeedbackModel.aggregate([
        {
            $match: {
                reason: "Block/Report",
                celebrityId: memberId
            }
        },
        {
            $group: {
                _id: "$memberId"
            }
        }
    ], (err, blockedUser1) => {
        if (err) {
            console.log(err)
        }
        ServiceTransaction.aggregate([
            {
                $match: {
                    callRemarks: "Block/Report",
                    receiverId: memberId
                }
            },
            {
                $group: {
                    _id: "$senderId"
                }
            }
        ], (err, blockedUser2) => {
            if (err) {
                console.log(err)
            }
            let blockedUser = blockedUser1.concat(blockedUser2)
            selfAndBlockUser = blockedUser.map((buser) => {
                return buser._id;
            })
            selfAndBlockUser.push(ObjectId(memberId))
            if (selfId)
                selfAndBlockUser.push(ObjectId(selfId));
            User.aggregate(
                [
                    {
                        $match: {
                            _id: { "$nin": selfAndBlockUser },
                            isManager: true
                        }
                    },
                    {
                        $addFields: {
                            name: {
                                $concat: [
                                    '$firstName',
                                    ' ',
                                    '$lastName',
                                ]
                            }
                        }
                    },
                    {
                        $match: query,
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            firstName: 1,
                            lastName: 1,
                            avtar_imgPath: 1,
                            profession: 1,
                            isCeleb: 1,
                            isManager: 1,
                            isOnline: 1,
                            isPromoted: 1,
                            isTrending: 1,
                            aboutMe: 1,
                            email: 1,
                            mobileNumber: 1,
                            isEditorChoice: 1,
                            industry: 1,
                            celebritiesWorkedFor: 1,
                            managerIndustry: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "managerindustries",
                            localField: "managerIndustry",
                            foreignField: "_id",
                            as: "industryDetails"
                        }
                    },
                    {
                        $sort: { name: 1 }
                    }, {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            mobileNumber: 1,
                            celebritiesWorkedFor: 1,
                            managerIndustry: 1,
                            isManager: 1,
                            isPromoted: 1,
                            isEditorChoice: 1,
                            isOnline: 1,
                            isTrending: 1,
                            isCeleb: 1,
                            industry: 1,
                            profession: 1,
                            aboutMe: 1,
                            lastName: 1,
                            firstName: 1,
                            avtar_imgPath: 1,
                            industryDetails: 1,
                            isActive: { '$cond': [false, true, false] },
                            isRequested: { '$cond': [false, true, false] }
                        }
                    }
                ],
                (err, managerList1) => {
                    if (err) {
                        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else if (managerList1) {
                        OrArr = OrArr.filter((obj) => {
                            return obj.name == undefined;
                        });
                        let exceptId = [];
                        // console.log(selfAndBlockUser)
                        exceptId = managerList1.map((manager) => {
                            return manager._id
                        })
                        exceptId = exceptId.concat(selfAndBlockUser)
                        // console.log(exceptId)
                        if (searchString != null && searchString != "null") {
                            OrArr.push({ name: { $ne: { $regex: "^" + searchString, $options: 'im' } } });
                            OrArr.push({ name: { $regex: searchString, $options: 'im' } });
                        }
                        let query = { $and: OrArr };
                        User.aggregate(
                            [
                                {
                                    $match: {
                                        _id: { "$nin": exceptId },
                                        isManager: true
                                    }
                                },
                                {
                                    $addFields: {
                                        name: {
                                            $concat: [
                                                '$firstName',
                                                ' ',
                                                '$lastName',
                                            ]
                                        }
                                    }
                                },
                                {
                                    $match: query,
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        avtar_imgPath: 1,
                                        profession: 1,
                                        isCeleb: 1,
                                        isManager: 1,
                                        isOnline: 1,
                                        isPromoted: 1,
                                        isTrending: 1,
                                        aboutMe: 1,
                                        email: 1,
                                        mobileNumber: 1,
                                        isEditorChoice: 1,
                                        industry: 1,
                                        celebritiesWorkedFor: 1,
                                        managerIndustry: 1
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "managerindustries",
                                        localField: "managerIndustry",
                                        foreignField: "_id",
                                        as: "industryDetails"
                                    }
                                },
                                {
                                    $sort: { name: 1 }
                                }, {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                        email: 1,
                                        mobileNumber: 1,
                                        celebritiesWorkedFor: 1,
                                        managerIndustry: 1,
                                        isManager: 1,
                                        isPromoted: 1,
                                        isEditorChoice: 1,
                                        isOnline: 1,
                                        isTrending: 1,
                                        isCeleb: 1,
                                        industry: 1,
                                        profession: 1,
                                        aboutMe: 1,
                                        lastName: 1,
                                        firstName: 1,
                                        avtar_imgPath: 1,
                                        industryDetails: 1,
                                        isActive: { '$cond': [false, true, false] },
                                        isRequested: { '$cond': [false, true, false] }
                                    }
                                }
                            ],
                            (err, managerList2) => {
                                if (err) {
                                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                }
                                let managerList = managerList1;
                                if (managerList2.length) {
                                    managerList = managerList1.concat(managerList2)
                                }

                                if (managerList.length == 0) {
                                    return res.json({
                                        token: req.headers['x-access-token'],
                                        success: 1,
                                        data: [],
                                        message: "No manager found!! Cheez :)"
                                    })
                                } else {

                                    CelebManagerService.allActiveManagerForCelebrity(memberId, (err, AllActiveManager) => {
                                        if (err) {
                                            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                        } else {
                                            if (AllActiveManager.length) {
                                                managerList.map((manager) => {
                                                    manager.isActive = AllActiveManager.some((activeManager) => {
                                                        return manager._id.equals(activeManager.managerId)
                                                    })
                                                    return manager;
                                                })
                                            }
                                            CelebManagerService.allRequestedManagerForCelebrity(memberId, (err, allReqestedManager) => {
                                                if (err) {
                                                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                }
                                                else if (allReqestedManager.length) {
                                                    managerList.map((manager) => {
                                                        manager.isRequested = allReqestedManager.some((requestedManager) => {
                                                            return manager._id.equals(requestedManager.managerId)
                                                        })
                                                        return manager;
                                                    })
                                                    return res.send({
                                                        token: req.headers['x-access-token'],
                                                        success: 1,
                                                        data: managerList
                                                    })
                                                }
                                                else {
                                                    return res.send({
                                                        token: req.headers['x-access-token'],
                                                        success: 1,
                                                        data: managerList
                                                    })
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                    }
                    else {
                        return res.send({
                            token: req.headers['x-access-token'],
                            success: 1,
                            data: [],
                            message: "No results found!! Cheez :)"
                        })
                    }
                });
        });
    });
}


const getManagerProfileByManagerId = (req, res) => {
    let managerId = ObjectId(req.params.managerId);
    User.aggregate([
        {
            $match: { _id: managerId }
        },
        {
            $lookup: {
                from: "countries",
                localField: "alternateCountry",
                foreignField: "dialCode",
                as: "alternateCountryDetails"
            }
        },
        {
            $unwind: "$alternateCountryDetails"
        }
    ], (err, userObj) => {
        if (err) {
            res.status(200).json({token: req.headers['x-access-token'], success: 0, message: `${err.message}`});
        }
        if (userObj.length) {
            userObj = userObj[0];
            ManagerIndustry.aggregate(
                [
                    {
                        $match: { $and: [{ parentIndustryId: null }] }
                    },
                    {
                        $lookup: {
                            from: "managerindustries",
                            localField: "_id",
                            foreignField: "parentIndustryId",
                            as: "Categories"
                        }
                    }
                ], (err, industriesList) => {
                    if (err) {
                        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else {
                        let resultArr = [];
                        industriesList.forEach(industry => {
                            let isIndustrySelected = false;
                            if (userObj.managerIndustry && userObj.managerIndustry.length > 0) {
                                userObj.managerIndustry.forEach(mIndustry => {
                                    if (mIndustry == industry._id) {
                                        isIndustrySelected = true
                                    }
                                });
                            }
                            let Categories = [];
                            industry.Categories.forEach(Category => {
                                let isActive = false;
                                if (userObj.managerCategory && userObj.managerCategory.length > 0) {
                                    userObj.managerCategory.forEach(mCategory => {
                                        if (mCategory == Category._id) {
                                            isActive = true;
                                            isIndustrySelected = true;
                                            // console.log(true)
                                        }
                                    });
                                }
                                Category.isActive = isActive;
                                Categories.push(Category);

                            });
                            industry.isIndustrySelected = isIndustrySelected;
                            industry.Categories = Categories;
                            resultArr.push(industry)
                        });
                        userObj.managerIndustry = resultArr;
                        res.json({ token: req.headers['x-access-token'], success: 1, data: userObj });
                    }
                });
        }
        else {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "No data found!" });
        }
    })

    // User.findById(managerId,{password:0},(err, userObj)=>{
    //     if(err)
    //     {
    //         res.status(200).json({
    //             token:req.headers['x-access-token'],
    //             success: 0,
    //             message: `${err.message}`
    //         });
    //     }
    //     if (userObj) {

    //     } else {
    //         res.json({token:req.headers['x-access-token'],success:0,message:"No data found!"});
    //     }
    // }).lean();
}

const updateCelebManagerStatus = (req, res) => {
    let id = req.params.reqID;
    let reqbody = req.body;
    reqbody.updatedAt = new Date();
    celebManager.findById(id, (err, CMObject) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        }
        else if (CMObject) {
            let celebrityId = ObjectId(CMObject.celebrityId);
            let managerId = ObjectId(CMObject.managerId);
            let reportingTo = ObjectId(CMObject.reportingTo);
            if (req.body.mode == "celebrityAccept") {
                if (CMObject.isManagerAccepted == true) {
                    let reqbody = {
                        "isActive": true,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                        if (err) {
                            return res.send(err);
                        } else {
                            res.json({ token: req.headers['x-access-token'], success: 1, message: "Manager request accepted and linked with profile successfully" });
                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "celebrityAccept", (err, send) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    //console.log(send)
                                }
                            })
                        }

                    });
                }
                else {
                    let reqbody = {
                        "isCelebAccepted": true,
                        "isCelebReq": true,
                        "status": "Pending",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                        if (err) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else {
                            res.json({ token: req.headers['x-access-token'], success: 1, message: "Celebrity request accepted successfully and pending acceptance from Manager side!" });
                            let celebrityId = CMObject.celebrityId;
                            let managerId = CMObject.managerId;
                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "celebrityAccept", (err, send) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    //console.log(send)
                                }
                            })
                        }
                    });
                }
            }
            else if (req.body.mode == "managerAccept") {
                if (CMObject.isCelebAccepted == true) {
                    //console.log('step 2')
                    let reqbody = {
                        "isManagerReqNew": true,
                        "isActive": true,
                        "isSuspended": false,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": CMObject.celebrityId
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                        if (err) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        }
                        else {
                            res.json({
                                token: req.headers['x-access-token'],
                                success: 1,
                                message: "Your request accepted successfully and linked with the profile!"
                            });
                            let celebrityId = CMObject.celebrityId;
                            let managerId = CMObject.managerId;
                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "managerAccept", (err, send) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    //console.log(send)
                                }
                            })
                            ManagerPermissionsAccessMasterService.updateManagerPermission(celebrityId, managerId, (err, managerPermission) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(managerPermission)
                                }
                            })
                        }
                    });
                } else {
                    //console.log('step5')
                    let reqbody = {
                        "isManagerAccepted": true,
                        "status": "requested",
                        "updatedAt": new Date(),
                        "updatedBy": CMObject.managerId
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                        if (err) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        }
                        else {
                            res.json({
                                token: req.headers['x-access-token'],
                                success: 1,
                                message: "Your request accepted successfully and pending acceptance from Celebrity side!"
                            });
                            let celebrityId = CMObject.celebrityId;
                            let managerId = CMObject.managerId;
                            CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "managerAccept", (err, send) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    //console.log(send)
                                }
                            })
                            ManagerPermissionsAccessMasterService.updateManagerPermission(celebrityId, managerId, (err, managerPermission) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(managerPermission)
                                }
                            })
                        }
                    });
                }
            }
            else if (req.body.mode == "subManagerAccept") {
                let reqbody = {
                    "isManagerReqNew": true,
                    "isActive": true,
                    "status": "approved",
                    "updatedAt": new Date(),
                    "updatedBy": CMObject.managerId,
                    "isSuspended": false
                };
                celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                    if (err) {
                        return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Your request accepted successfully and linked with the profile!"
                        });


                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "subManagerAccept", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId, managerId, result.reportingTo, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(managerPermission)
                            }
                        })
                    }
                });
            }
            else if (req.body.mode == "suspendManager") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "celebritySuspendManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isSuspended": true,
                    "isAdminReq": false
                };
                let updateIDs = [];

                celebManager.findByIdAndUpdate(id, { $set: reqbody }, { new: true }, (err, result) => {
                    if (err) {
                        return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Manager suspended successfully."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        let nQuery = { $and: [{ celebrityId: celebrityId }, { $or: [{ reportingTo: managerId }, { mainManagerId: managerId }] }] };
                        //when manager suspended submanager permission change
                        celebManager.find(nQuery, (err, AsstManagersList) => {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            if (AsstManagersList) {
                                if (AsstManagersList.length > 0) {
                                    AsstManagersList.forEach(AM => {
                                        if (!AM.isActive) {
                                            // celebManager.deleteOne({_id:ObjectId(AM._id)},(err,data)=>{

                                            // })
                                        }
                                        else {
                                            updateIDs.push(AM._id);
                                        }
                                        let celebrityId = AM.celebrityId;
                                        let managerId = AM.managerId;
                                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                //console.log(send)
                                            }
                                        })
                                    });
                                }
                            }
                        });
                        nQuery = { $and: [{ celebrityId: celebrityId }, { isActive: true }, { $or: [{ reportingTo: managerId }, { mainManagerId: managerId }] }] };

                        celebManager.updateMany(nQuery, { $set: reqbody }, { multi: true }, (err, result1) => {
                            if (err) {

                            }
                            else {
                                console.log(result1);
                                // if(result1)
                                // {
                                // ManagerPermission.remove({celebrityId:ObjectId(celebrityId),managerId:{$ne:ObjectId(managerId)}},
                                //     (err,data)=>{
                                //         if(err)
                                //         {

                                //         }
                                //         console.log(data);
                                //         console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
                                // });
                                // }
                            }
                        });
                    }
                });
            }
            else if (req.body.mode == "suspendSubManager") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "celebritySuspendManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isSuspended": true,
                    "isAdminReq": false
                };
                let updateIDs = [];

                celebManager.findByIdAndUpdate(id, { $set: reqbody }, { new: true }, (err, result) => {
                    if (err) {
                        return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Manager suspended successfully."
                        });
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        let nQuery = { $and: [{ celebrityId: celebrityId }, { $or: [{ reportingTo: managerId }, { mainManagerId: { $exists: true } }] }] };
                        //when manager suspended submanager permission change
                        celebManager.find(nQuery, (err, AsstManagersList) => {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            if (AsstManagersList) {
                                if (AsstManagersList.length > 0) {
                                    AsstManagersList.forEach(AM => {
                                        if (!AM.isActive) {
                                            // celebManager.deleteOne({_id:ObjectId(AM._id)},(err,data)=>{

                                            // })
                                        }
                                        else {
                                            updateIDs.push(AM._id);
                                        }
                                        let celebrityId = AM.celebrityId;
                                        let managerId = AM.managerId;
                                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                //console.log(send)
                                            }
                                        })
                                    });
                                    //    });
                                }
                            }
                        });
                        nQuery = { $and: [{ celebrityId: celebrityId }, { $or: [{ reportingTo: managerId }, { mainManagerId: { $exists: true } }] }] };

                        celebManager.updateMany(nQuery, { $set: reqbody }, { multi: true }, (err, result1) => {
                            if (err) {

                            }
                            else {
                                console.log(result1);
                                // if(result1)
                                // {
                                // ManagerPermission.remove({celebrityId:ObjectId(celebrityId),managerId:{$ne:ObjectId(managerId)}},
                                //     (err,data)=>{
                                //         if(err)
                                //         {

                                //         }
                                //         console.log(data);
                                //         console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
                                // });
                                // }
                            }
                        });
                    }
                });
            }
            else if (req.body.mode == "suspendSubSubManager") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "celebritySuspendManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isSuspended": true,
                    "isAdminReq": false
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager suspended and feedback submitted"
                    });
                    let celebrityId = CMObject.celebrityId;
                    let managerId = CMObject.managerId;
                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                        if (err) {
                            console.log(err)
                        } else {
                            //console.log(send)
                        }
                    })
                });
            }
            else if (req.body.mode == "suspendCelebrity") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "status": "suspendCelebrity",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isAdminReq": false
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager suspended and feedback submitted"
                    });
                });
            }
            else if (req.body.mode == "rejectManager") {
                let reqbody = {
                    "isCelebAccepted": false,
                    "isManagerAccepted": false,
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "rejectManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isAdminReq": false
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "You have rejected the request."
                    });

                    let celebrityId = CMObject.celebrityId;
                    let managerId = CMObject.managerId;
                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "rejectManager", (err, send) => {
                        if (err) {
                            console.log(err)
                        } else {
                            //console.log(send)
                        }
                    })
                });
            }
            else if (req.body.mode == "rejectMainManager") {
                let reqbody = {
                    "isCelebAccepted": false,
                    "isManagerAccepted": false,
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "rejectManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager rejected and feedback submitted"
                    });
                    User.findById(CMObject.reportingTo, function (err, mainManagerObject) {
                        User.findById(CMObject.managerId, function (err, managerObject) {
                            User.findById(CMObject.celebrityId, function (err, celebrityObject) {
                                let mainManagerEamil = mainManagerObject.email;
                                let cond = []
                                if (mainManagerObject.email && mainManagerObject.email != "") {
                                    cond.push({ email: mainManagerObject.email })
                                } else if (mainManagerObject.mobileNumber && mainManagerObject.mobileNumber != "") {
                                    cond.push({ mobileNumber: { $regex: mainManagerObject.mobileNumber } })
                                }
                                let query = {
                                    $or: cond
                                }
                                // Send Notification to Celebrity
                                logins.findOne(query, function (err, loginObject) {
                                    if (loginObject == null) {
                                    } else {
                                        let dToken = loginObject.deviceToken;
                                        ///////  FCM SENDING MESSAGE to Manager ////////
                                        // Save the TEXT in Notifications Collection and send the Notification to Manager
                                        let newNotification = new Notification({
                                            memberId: CMObject.reportingTo,
                                            activity: "Manager",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Rejected !!!",
                                            notificationFrom: managerObject._id,
                                            body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
                                            notificationType: "Manager"
                                        });
                                        //Insert Notification
                                        Notification.createNotification(newNotification, function (err, credits) {
                                            if (err) {
                                                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                            } else {
                                                //console.log('Notification sent successfully')
                                                /* res.send({
                                                  message: "Notification sent successfully"
                                                }); */

                                                let query = {
                                                    memberId: ObjectId(CMObject.reportingTo),
                                                    notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                    isEnabled: true
                                                };
                                                notificationSetting.find(query, function (err, rest) {
                                                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                    //console.log("t1", rest);
                                                    else if (rest.length) {
                                                        let data, notification;
                                                        if (loginObject.osType == "Android") {
                                                            data = {
                                                                title: 'Manager Rejected !!!', 
                                                                serviceType: "Manager",
                                                                body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
                                                                activity: "MANAGERREJECT"
                                                            }
                                                            otpService.sendAndriodPushNotification(loginObject.deviceToken, " Updates", data, (err, successNotificationObj) => {
                                                                if (err)
                                                                    console.log(err)
                                                                else {
                                                                    console.log(successNotificationObj)
                                                                }
                                                            })
                                                        } else if (loginObject.osType == "IOS") {
                                                            notification = {
                                                                title: 'Manager Rejected !!!',
                                                                serviceType: "Manager",
                                                               body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
                                                                activity: "MANAGERREJECT"
                                                            }
                                                            otpService.sendIOSPushNotification(loginObject.deviceToken, notification, (err, successNotificationObj) => {
                                                                if (err)
                                                                    console.log(err)
                                                                else {
                                                                    console.log(successNotificationObj)
                                                                }
                                                            });
                                                        }
                                                        
                                                        // var message = {
                                                        //     to: dToken,
                                                        //     collapse_key: 'Manager Updates',
                                                        //     serviceType: "Manager",
                                                        //     data: {
                                                        //         title: 'Manager Rejected !!!', 
                                                        //         serviceType: "Manager",
                                                        //         body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
                                                        //     },
                                                        //     notification: {
                                                        //         title: 'Manager Rejected !!!',
                                                        //          serviceType: "Manager",
                                                        //         body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
                                                        //     }
                                                        // };
                                                        // fcm.send(message, function (err, response) {
                                                        //     if (err) {
                                                        //         console.log(err)
                                                        //     } else {
                                                        //     }
                                                        // });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        });
                    });
                    ////////////////// ******** END OF NOIFICATION *************/////////////////////
                });
            }
            else if (req.body.mode == "rejectCelebrity") {
                if (CMObject.isCelebAccepted == true && CMObject.isManagerAccepted == true) {
                    let reqbody = {
                        "isAccess": false,
                        "isActive": false,
                        "isCelebReqNew": false,
                        "isManagerReqNew": false,
                        "status": "rejectCelebrity",
                        "feedBack": req.body.feedBack,
                        "updatedAt": new Date(),
                        "isAdminReq": false,
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isAdminReq) {
                        Object.assign(reqbody, { "isAdminReq": false });
                    }
                    celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "You have rejected the request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "rejectCelebrity", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                    });
                } else {
                    let reqbody = {
                        "isCelebAccepted": false,
                        "isManagerAccepted": false,
                        "isAccess": false,
                        "isActive": false,
                        "isCelebReqNew": false,
                        "isManagerReqNew": false,
                        "status": "rejectCelebrity",
                        "feedBack": req.body.feedBack,
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isAdminReq) {
                        Object.assign(reqbody, { "isAdminReq": false });
                    }

                    celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "You have rejected the request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "rejectCelebrity", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                    });
                }
            }
            else if (req.body.mode == "cancelManagerRequest") {
                if (CMObject.isCelebAccepted == true && CMObject.isManagerAccepted == true) {

                    let reqbody = {
                        "isCelebReq": false,
                        "isCelebReqNew": false,
                        "isAccess": false,
                        "isActive": false,
                        "status": "cancelManagerRequest",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isCelebReqNew) {
                        reqbody.status = "Suspended";
                    }
                    celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Successfully cancelled manager request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "rejectCelebrity", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                    });
                } else {
                    let reqbody = {
                        "isCelebReq": false,
                        "isCelebReqNew": false,
                        "isCelebAccepted": false,
                        "isManagerAccepted": false,
                        "isAccess": false,
                        "isActive": false,
                        "status": "cancelManagerRequest",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isCelebReqNew) {
                        reqbody.status = "Suspended";
                    }

                    celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Successfully cancelled manager request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "rejectCelebrity", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                    });
                }
            }
            else if (req.body.mode == "managePermissions") {
                let reqbody = {
                    "isAccess": Boolean(req.body.isAccess),
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                let updateIDs = [];

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Permissions settings updated!"
                    });
                    if (Boolean(req.body.isAccess) == false || Boolean(req.body.isAccess) == false) {
                        let nQuery = { $and: [{ reportingTo: CMObject.managerId }, { celebrityId: CMObject.celebrityId }] };
                        celebManager.find(nQuery, function (err, AsstManagersList) {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            if (AsstManagersList) {
                                if (AsstManagersList && AsstManagersList.length > 0) {
                                    AsstManagersList.forEach(AM => {
                                        updateIDs.push(AM._id);
                                    });
                                }
                            }
                            //console.log(updateIDs)
                            // Update Many
                            let query = { _id: { $in: updateIDs } }
                            celebManager.updateMany(query, { $set: reqbody },
                                { multi: true }, function (err, Uresult) {
                                    if (err) return console.log(err);
                                    //console.log(Uresult)
                                });
                        });
                    }
                });
            }
            else if (req.body.mode == "addCelebrityToAM") {
                let query = { $and: [{ celebrityId: req.body.celebrityId }, { managerId: CMObject.managerId }] };
                celebManager.findOne(query, function (err, newResult) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    //console.log(newResult)
                    if (newResult) {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 0,
                            message: "Profile already linked. Please check settings!"
                        });
                    } else {
                        let reqbody = {
                            "celebrityId": req.body.celebrityId,
                            "updatedAt": new Date(),
                            "updatedBy": req.body.updatedBy
                        };

                        celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            res.json({
                                token: req.headers['x-access-token'],
                                success: 1,
                                message: "Celebrity linked to the Assistant manager!"
                            });
                        });
                    }
                });
            }
            else {
                res.json({
                    token: req.headers['x-access-token'],
                    success: 0,
                    message: "Inavlid mode. Please check mode and try again"
                });
            }
        } else {
            res.json({
                token: req.headers['x-access-token'],
                success: 0,
                message: "CelebRequest not found / Invalid"
            });
        }
    });
}

const update = (req, res) => {
    let id = req.params.reqID;
    let isActiveManagerExist = false;
    let isSameManager = false;
    let isManagerAccepted = false;
    let reqbody = req.body;
    reqbody.updatedAt = new Date();
    celebManager.findById(id, (err, CMObject) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        }
        else if (CMObject) {
            /// ****** If celebrity Accept the Request ***** //////
            if (req.body.mode == "celebrityAccept") {
                // Check for an Active manager connection
                celebManager.find({
                    $and: [{
                        celebrityId: CMObject.celebrityId
                    }]
                }, (err, Mresult) => {
                    if (err) return send(err);
                    for (let i = 0; i < Mresult.length; i++) {
                        if (Mresult[i].isActive == true) {
                            isActiveManagerExist = true;
                        }
                        if ((Mresult[i].managerId == CMObject.managerId) && (Mresult[i].isManagerAccepted == true)) {
                            isManagerAccepted = true;
                        }
                        if (Mresult[i].managerId == CMObject.managerId) {
                            isSameManager = true;
                        }
                    }
                    if (isActiveManagerExist && isSameManager) {
                        res.status(200).json({
                            token: req.headers['x-access-token'],
                            success: 0,
                            message: "You are already linked with this Manager and Active. Cheers :)"
                        });
                    } else if (isActiveManagerExist) {
                        res.status(200).json({
                            token: req.headers['x-access-token'],
                            success: 0,
                            message: "you are already linked with an active Manager"
                        });
                    } else if (isSameManager && isManagerAccepted) {
                        let reqbody = {
                            "isActive": true,
                            "status": "approved",
                            "updatedAt": new Date(),
                            "updatedBy": req.body.updatedBy
                        };

                        celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                            if (err) {
                                return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            } else {
                                res.json({ token: req.headers['x-access-token'], success: 1, message: "Manager request accepted and linked with profile successfully" });
                                let celebrityId = CMObject.celebrityId;
                                let managerId = CMObject.managerId;
                                CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "celebrityAccept", (err, send) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        //console.log(send)
                                    }
                                })
                            }
                        });
                    } else if (isSameManager) {
                        let reqbody = {
                            "isCelebAccepted": true,
                            "status": "Pending",
                            "updatedAt": new Date(),
                            "updatedBy": req.body.updatedBy
                        };

                        celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            res.json({ token: req.headers['x-access-token'], success: 1, message: "Manager request accepted successfully and pending acceptance from Manager side!" });
                        });
                    } else {
                        let reqbody = {
                            "isCelebAccepted": true,
                            "isCelebReq": true,
                            "status": "Pending",
                            "updatedAt": new Date(),
                            "updatedBy": req.body.updatedBy
                        };

                        celebManager.findByIdAndUpdate(id, reqbody, (err, result) => {
                            if (err)
                                return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            res.json({ token: req.headers['x-access-token'], success: 1, message: "Celebrity request accepted successfully and pending acceptance from Manager side!" });
                        });                       //console.log('NO MATCH')
                    }
                }).lean();
            }
            /// ****** If Manager Accept the Request ***** //////
            else if (req.body.mode == "managerAccept") {
                if (CMObject.isActive == true) {
                    //console.log('step1')
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 0,
                        message: "You are already linked with the Celebrity!"
                    });
                } else if ((CMObject.isCelebAccepted == true) && (CMObject.isManagerAccepted == true) && (CMObject.isCelebReqNew == true)) {
                    //console.log('step 2')
                    let reqbody = {
                        "isManagerReqNew": true,
                        "isActive": true,
                        "isSuspended": false,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };
                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Your request accepted successfully and linked with the profile!"
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        let reportingTo = CMObject.celebrityId;
                        if (result.reportingTo) {
                            reportingTo = CMObject.reportingTo;
                        }
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "managerAccept", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        ManagerPermissionsAccessMasterService.updateManagerPermission(celebrityId, managerId, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(managerPermission)
                            }
                        })
                    });
                } else if ((CMObject.isCelebAccepted == true) && (CMObject.isActive == true)) {
                    //console.log('step3')
                    let reqbody = {
                        "isManagerAccepted": true,
                        "isActive": true,
                        "isSuspended": false,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Your request accepted successfully and linked with the profile!"
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        let reportingTo = CMObject.celebrityId;
                        if (result.reportingTo) {
                            reportingTo = CMObject.reportingTo;
                        }
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "managerAccept", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        ManagerPermissionsAccessMasterService.updateManagerPermission(celebrityId, managerId, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(managerPermission)
                            }
                        })
                    });
                } else if ((CMObject.isCelebAccepted == true)) {
                    // console.log('step4')
                    let reqbody = {
                        "isManagerAccepted": true,
                        "isActive": true,
                        "isSuspended": false,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Celebrity request accepted and active now!"
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        let reportingTo = CMObject.celebrityId;
                        if (result.reportingTo) {
                            reportingTo = CMObject.reportingTo;
                        }
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "managerAccept", (err, send) => {
                            if (err) {
                                reportingTo
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        ManagerPermissionsAccessMasterService.updateManagerPermission(celebrityId, managerId, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(managerPermission)
                            }
                        })
                    });
                } else if ((CMObject.isCelebAccepted == false)) {
                    //console.log('step5')
                    let reqbody = {
                        "isManagerAccepted": true,
                        "status": "requested",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Your request accepted successfully and pending acceptance from Celebrity side!"
                        });
                        ManagerPermissionsAccessMasterService.updateManagerPermission(celebrityId, managerId, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(managerPermission)
                            }
                        })
                    });
                }
            }
            /// ****** Sub Manager Accept the Request ***** //////
            else if (req.body.mode == "subManagerAccept") {

                if (CMObject.isActive == true) {
                    //console.log('step 0')
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 0,
                        message: "You are already linked with the Celebrity!"
                    });
                } else if ((CMObject.isCelebAccepted == true) && (CMObject.isManagerAccepted == true) && (CMObject.isCelebReqNew == true)) {
                    // console.log('step1')
                    let reqbody = {
                        "isManagerReqNew": true,
                        "isActive": true,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy,
                        "isSuspended": false
                    };
                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Your request accepted successfully and linked with the profile!"
                        });

                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        let reportingTo = CMObject.celebrityId;
                        if (result.reportingTo) {
                            reportingTo = CMObject.reportingTo;
                        }
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "subManagerAccept", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId, managerId, result.reportingTo, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(managerPermission)
                            }
                        })
                    });
                } else if ((CMObject.isCelebAccepted == true) && (CMObject.isActive == true)) {
                    //console.log('step2')
                    let reqbody = {
                        "isManagerAccepted": true,
                        "isSuspended": false,
                        "isActive": true,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Your request accepted successfully and linked with the profile!"
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        let reportingTo = CMObject.celebrityId;
                        if (result.reportingTo) {
                            reportingTo = CMObject.reportingTo;
                        }
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "subManagerAccept", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId, managerId, result.reportingTo, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(managerPermission)
                            }
                        })
                    });
                } else if ((CMObject.isCelebAccepted == true)) {
                    //console.log('step3')
                    //console.log('reqbody')
                    //console.log(req.body)
                    let reqbody = {
                        "isManagerAccepted": true,
                        "isActive": true,
                        "isSuspended": false,
                        "status": "approved",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Celebrity request accepted and active now!"
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        let reportingTo = CMObject.celebrityId;
                        if (result.reportingTo) {
                            reportingTo = CMObject.reportingTo;
                        }
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, reportingTo, "subManagerAccept", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                // //console.log(send)
                            }
                        })
                        ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId, managerId, result.reportingTo, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                // console.log(managerPermission)
                            }
                        })
                    });
                } else if ((CMObject.isCelebAccepted == false)) {
                    console.log('step4')
                    let reqbody = {
                        "isManagerAccepted": true,
                        "isSuspended": false,
                        "status": "requested",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };

                    celebManager.findByIdAndUpdate(id, reqbody, { new: true }, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Your request accepted successfully and pending acceptance from Celebrity side!"
                        });
                        ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId, managerId, result.reportingTo, (err, managerPermission) => {
                            if (err) {
                                console.log(err)
                            } else {
                                // console.log(managerPermission)
                            }
                        })
                    });
                } else {
                    //console.log('fasak')
                }
            }
            else if (req.body.mode == "suspendManager") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "celebritySuspendManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isSuspended": true,
                    "isAdminReq": false
                };
                let updateIDs = [];

                celebManager.findByIdAndUpdate(id, { $set: reqbody }, { new: true }, (err, result) => {
                    if (err) {
                        return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Manager suspended successfully."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                        let nQuery = { $and: [{ celebrityId: celebrityId }, { $or: [{ reportingTo: managerId }, { mainManagerId: managerId }] }] };
                        //when manager suspended submanager permission change
                        celebManager.find(nQuery, (err, AsstManagersList) => {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            if (AsstManagersList) {
                                if (AsstManagersList.length > 0) {
                                    AsstManagersList.forEach(AM => {
                                        if (!AM.isActive) {
                                            // celebManager.deleteOne({_id:ObjectId(AM._id)},(err,data)=>{

                                            // })
                                        }
                                        else {
                                            updateIDs.push(AM._id);
                                        }
                                        let celebrityId = AM.celebrityId;
                                        let managerId = AM.managerId;
                                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                // //console.log(send)
                                            }
                                        })
                                    });
                                }
                            }
                        });
                        nQuery = { $and: [{ celebrityId: celebrityId }, { $or: [{ reportingTo: managerId }, { mainManagerId: managerId }] }] };

                        celebManager.updateMany(nQuery, { $set: reqbody }, { multi: true }, (err, result1) => {
                            if (err) {

                            }
                            else {
                                console.log(result1);
                                // if(result1)
                                // {
                                // ManagerPermission.remove({celebrityId:ObjectId(celebrityId),managerId:{$ne:ObjectId(managerId)}},
                                //     (err,data)=>{
                                //         if(err)
                                //         {

                                //         }
                                //         console.log(data);
                                //         console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
                                // });
                                // }
                            }
                        });
                    }
                });
            }
            /// ****** Suspend a Manager ***** //////
            else if (req.body.mode == "suspendSubManager") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "celebritySuspendManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isSuspended": true,
                    "isAdminReq": false
                };
                let updateIDs = [];

                celebManager.findByIdAndUpdate(id, { $set: reqbody }, { new: true }, (err, result) => {
                    if (err) {
                        return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    else {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Manager suspended successfully."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendSubManager", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                // //console.log(send)
                            }
                        })
                        let nQuery = { $and: [{ celebrityId: celebrityId }, { $or: [{ reportingTo: managerId }, { mainManagerId: { $exists: true } }] }] };
                        //when manager suspended submanager permission change
                        celebManager.find(nQuery, (err, AsstManagersList) => {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            if (AsstManagersList) {
                                if (AsstManagersList.length > 0) {
                                    AsstManagersList.forEach(AM => {
                                        if (!AM.isActive) {
                                            // celebManager.deleteOne({_id:ObjectId(AM._id)},(err,data)=>{

                                            // })
                                        }
                                        else {
                                            updateIDs.push(AM._id);
                                        }

                                        let celebrityId = AM.celebrityId;
                                        let managerId = AM.managerId;
                                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendSubManager", (err, send) => {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                // //console.log(send)
                                            }
                                        })
                                    });
                                    //    });
                                }
                            }
                        });
                        nQuery = { $and: [{ celebrityId: celebrityId }, { $or: [{ reportingTo: managerId }, { mainManagerId: { $exists: true } }] }] };

                        celebManager.updateMany(nQuery, { $set: reqbody }, { multi: true }, (err, result1) => {
                            if (err) {

                            }
                            else {
                                console.log(result1);
                                // if(result1)
                                // {
                                // ManagerPermission.remove({celebrityId:ObjectId(celebrityId),managerId:{$ne:ObjectId(managerId)}},
                                //     (err,data)=>{
                                //         if(err)
                                //         {

                                //         }
                                //         console.log(data);
                                //         console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
                                // });
                                // }
                            }
                        });
                    }
                });
            }
            /// ****** Suspend a sub Manager ***** //////
            else if (req.body.mode == "suspendSubSubManager") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "celebritySuspendManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isSuspended": true,
                    "isAdminReq": false
                };


                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager suspended and feedback submitted"
                    });
                    let celebrityId = CMObject.celebrityId;
                    let managerId = CMObject.managerId;
                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "suspendManager", (err, send) => {
                        if (err) {
                            console.log(err)
                        } else {
                            // //console.log(send)
                        }
                    })
                });
            }
            else if (req.body.mode == "suspendCelebrity") {
                let reqbody = {
                    "isAccess": false,
                    "isActive": false,
                    "status": "suspendCelebrity",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isAdminReq": false
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager suspended and feedback submitted"
                    });
                });
            }
            /// ****** Reject a Manager ***** //////

            else if (req.body.mode == "rejectManager") {
                let reqbody = {
                    "isCelebAccepted": false,
                    "isManagerAccepted": false,
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "rejectManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy,
                    "isAdminReq": false
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "You have rejected the request."
                    });
                    let celebrityId = CMObject.celebrityId;
                    let managerId = CMObject.managerId;
                    CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "rejectManager", (err, send) => {
                        if (err) {
                            console.log(err)
                        } else {
                            // //console.log(send)
                        }
                    })
                });
            } /// ****** Reject a Main Manager ***** //////
            else if (req.body.mode == "rejectMainManager") {
                let reqbody = {
                    "isCelebAccepted": false,
                    "isManagerAccepted": false,
                    "isAccess": false,
                    "isActive": false,
                    "isCelebReqNew": false,
                    "isManagerReqNew": false,
                    "status": "rejectManager",
                    "feedBack": req.body.feedBack,
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Manager rejected and feedback submitted"
                    });
                    User.findById(CMObject.reportingTo, function (err, mainManagerObject) {
                        User.findById(CMObject.managerId, function (err, managerObject) {
                            User.findById(CMObject.celebrityId, function (err, celebrityObject) {
                                let mainManagerEamil = mainManagerObject.email;
                                let cond = []
                                if (mainManagerObject.email && mainManagerObject.email != "") {
                                    cond.push({ email: mainManagerObject.email })
                                } else if (mainManagerObject.mobileNumber && mainManagerObject.mobileNumber != "") {
                                    cond.push({ mobileNumber: { $regex: mainManagerObject.mobileNumber } })
                                }
                                let query = {
                                    $or: cond
                                }
                                // Send Notification to Celebrity
                                logins.findOne(query, function (err, loginObject) {
                                    if (loginObject == null) {
                                    } else {
                                        let dToken = loginObject.deviceToken;
                                        ///////  FCM SENDING MESSAGE to Manager ////////
                                        // Save the TEXT in Notifications Collection and send the Notification to Manager
                                        let newNotification = new Notification({
                                            memberId: CMObject.reportingTo,
                                            activity: "Manager",
                                            notificationSettingId: "5baf8b475129360870bcfe8f",
                                            title: "Manager Rejected !!!",
                                            notificationFrom: managerObject._id,
                                            body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
                                            notificationType: "Manager"
                                        });
                                        //Insert Notification
                                        Notification.createNotification(newNotification, function (err, credits) {
                                            if (err) {
                                                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                            } else {
                                                //console.log('Notification sent successfully')
                                                /* res.send({
                                                  message: "Notification sent successfully"
                                                }); */

                                                let query = {
                                                    memberId: ObjectId(CMObject.reportingTo),
                                                    notificationSettingId: ObjectId("5baf8b475129360870bcfe8f"),
                                                    isEnabled: true
                                                };
                                                notificationSetting.find(query, function (err, rest) {
                                                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                                    //console.log("t1", rest);
                                                    else if (rest.length) {
                                                        var message = {
                                                            to: dToken,
                                                            collapse_key: 'Manager Updates',
                                                            serviceType: "Manager",
                                                            data: {
                                                                title: 'Manager Rejected !!!', serviceType: "Manager",
                                                                body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
                                                            },
                                                            notification: {
                                                                title: 'Manager Rejected !!!', serviceType: "Manager",
                                                                body: managerObject.firstName + " " + managerObject.lastName + " has rejected your request 'to be my manager' for " + celebrityObject.firstName + " " + celebrityObject.lastName,
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
                    });
                    ////////////////// ******** END OF NOIFICATION *************/////////////////////
                });
            }
            /// ****** Reject a Celebrity ***** //////
            else if (req.body.mode == "rejectCelebrity") {
                if (CMObject.isCelebAccepted == true && CMObject.isManagerAccepted == true) {
                    let reqbody = {
                        "isAccess": false,
                        "isActive": false,
                        "isCelebReqNew": false,
                        "isManagerReqNew": false,
                        "status": "rejectCelebrity",
                        "feedBack": req.body.feedBack,
                        "updatedAt": new Date(),
                        "isAdminReq": false,
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isAdminReq) {
                        Object.assign(reqbody, { "isAdminReq": false });
                    }
                    celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "You have rejected the request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "rejectCelebrity", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                // //console.log(send)
                            }
                        })
                    });
                } else {
                    let reqbody = {
                        "isCelebAccepted": false,
                        "isManagerAccepted": false,
                        "isAccess": false,
                        "isActive": false,
                        "isCelebReqNew": false,
                        "isManagerReqNew": false,
                        "status": "rejectCelebrity",
                        "feedBack": req.body.feedBack,
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isAdminReq) {
                        Object.assign(reqbody, { "isAdminReq": false });
                    }

                    celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "You have rejected the request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, celebrityId, "rejectCelebrity", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                    });
                }
            }
            /// ****** Cancel a Manager Request ***** //////
            else if (req.body.mode == "cancelManagerRequest") {
                if (CMObject.isCelebAccepted == true && CMObject.isManagerAccepted == true) {

                    let reqbody = {
                        "isCelebReq": false,
                        "isCelebReqNew": false,
                        "isAccess": false,
                        "isActive": false,
                        "status": "cancelManagerRequest",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isCelebReqNew) {
                        reqbody.status = "Suspended";
                    }
                    celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Successfully cancelled manager request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "cancelManagerRequest", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                    });
                } else {
                    let reqbody = {
                        "isCelebReq": false,
                        "isCelebReqNew": false,
                        "isCelebAccepted": false,
                        "isManagerAccepted": false,
                        "isAccess": false,
                        "isActive": false,
                        "status": "cancelManagerRequest",
                        "updatedAt": new Date(),
                        "updatedBy": req.body.updatedBy
                    };
                    if (CMObject.isCelebReqNew) {
                        reqbody.status = "Suspended";
                    }

                    celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 1,
                            message: "Successfully cancelled manager request."
                        });
                        let celebrityId = CMObject.celebrityId;
                        let managerId = CMObject.managerId;
                        CelebManagerService.sendAndCreateNotification(celebrityId, managerId, managerId, "cancelManagerRequest", (err, send) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //console.log(send)
                            }
                        })
                    });
                }
            }
            /// ****** ON / OFF Access to Manager ***** //////
            else if (req.body.mode == "managePermissions") {
                let reqbody = {
                    "isAccess": Boolean(req.body.isAccess),
                    "updatedAt": new Date(),
                    "updatedBy": req.body.updatedBy
                };

                let updateIDs = [];

                celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    res.json({
                        token: req.headers['x-access-token'],
                        success: 1,
                        message: "Permissions settings updated!"
                    });
                    if (Boolean(req.body.isAccess) == false || Boolean(req.body.isAccess) == false) {
                        let nQuery = { $and: [{ reportingTo: CMObject.managerId }, { celebrityId: CMObject.celebrityId }] };
                        celebManager.find(nQuery, function (err, AsstManagersList) {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            if (AsstManagersList) {
                                if (AsstManagersList && AsstManagersList.length > 0) {
                                    AsstManagersList.forEach(AM => {
                                        updateIDs.push(AM._id);
                                    });
                                }
                            }
                            //console.log(updateIDs)
                            // Update Many
                            let query = { _id: { $in: updateIDs } }
                            celebManager.updateMany(query, { $set: reqbody },
                                { multi: true }, function (err, Uresult) {
                                    if (err) return console.log(err);
                                    //console.log(Uresult)
                                });
                        });
                    }
                });
            } /// ****** Add a Celebrity to Assistant Manager ***** //////
            else if (req.body.mode == "addCelebrityToAM") {
                let query = { $and: [{ celebrityId: req.body.celebrityId }, { managerId: CMObject.managerId }] };
                celebManager.findOne(query, function (err, newResult) {
                    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    //console.log(newResult)
                    if (newResult) {
                        res.json({
                            token: req.headers['x-access-token'],
                            success: 0,
                            message: "Profile already linked. Please check settings!"
                        });
                    } else {
                        let reqbody = {
                            "celebrityId": req.body.celebrityId,
                            "updatedAt": new Date(),
                            "updatedBy": req.body.updatedBy
                        };

                        celebManager.findByIdAndUpdate(id, reqbody, function (err, result) {
                            if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            res.json({
                                token: req.headers['x-access-token'],
                                success: 1,
                                message: "Celebrity linked to the Assistant manager!"
                            });
                        });
                    }
                });
            } else {
                res.json({
                    token: req.headers['x-access-token'],
                    success: 0,
                    message: "Inavlid mode. Please check mode and try again"
                });
            }
        } else {
            res.json({
                token: req.headers['x-access-token'],
                success: 0,
                message: "CelebRequest not found / Invalid"
            });
        }
    });
}

const newManagerSearch = (req, res, next) => {
    let memberId = req.params.memberId;
    //  let searchString = req.body.searchString;
    let isCelebAccepted = false;
    let isManagerAccepted = false;
    let isCelebReqNew = false;
    let isManagerReqNew = false;
    let status;
    let managersArray = [];
    let fObject;
    let searchString = req.body.searchString;
    let managerIndustry = req.body.managerIndustry;
    let managerCategory = req.body.managerCategory;
    let managerSubCategory = req.body.managerSubCategory;
    let experience = req.body.experience;

    let OrArr = [];
    let query = { memberId: { "$nin": [ObjectId(memberId)] }, isManager: true, $or: OrArr };
    //var query = [{ _id: { "$nin": [ObjectId(memberId)] } }, { isManager: true }];
    if (searchString != null && searchString != "null") {
        OrArr.push({ firstName: { $regex: searchString, $options: 'i' } }, { lastName: { $regex: searchString, $options: 'i' } });
    }
    if (managerIndustry != null && managerIndustry != "null") {
        OrArr.push({ managerIndustry: { $in: [ObjectId(managerIndustry)] } });
    }
    if (managerCategory != null && managerCategory != "null") {
        OrArr.push({ managerCategory: { $in: [managerCategory] } });
    }
    if (experience != null && experience != "null") {
        OrArr.push({ experience: experience });
    }

    //console.log(query);
    //console.log(OrArr)
    User.aggregate(
        [
            {
                $match: query,
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    avtar_imgPath: 1,
                    profession: 1,
                    isCeleb: 1,
                    isManager: 1,
                    isOnline: 1,
                    isPromoted: 1,
                    isTrending: 1,
                    aboutMe: 1,
                    email: 1,
                    mobileNumber: 1,
                    isEditorChoice: 1
                }
            }
        ],
        function (err, CMresult) {
            if (err) {
                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
            }
            if (CMresult) {
                if (CMresult.length == 0) {
                    return res.send({
                        "success": 0,
                        "message": "No results found!! Cheez :)"
                    })
                } else {

                    // check for the matched results from celebManagers collection
                    async.each(CMresult, function (celebManagerObj, callback) {
                        let query = { $and: [{ reportingTo: memberId }, { managerId: celebManagerObj._id }] }
                        celebManager.findOne(query, function (err, newObj) {
                            if (err) res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                            if (newObj) {
                                if ((newObj.isCelebAccepted == true) && (newObj.isManagerAccepted == true) && (newObj.isActive == true)) {
                                } else if ((newObj.isCelebAccepted == true && newObj.isManagerReqNew == true && newObj.isCelebReqNew == true && newObj.isManagerReqNew == true)) {
                                } else if ((newObj.isCelebAccepted == true && newObj.isManagerReqNew == true && newObj.isCelebReqNew == true)) {
                                    fObject = {};
                                    fObject = celebManagerObj
                                    Object.assign(fObject, {
                                        "reportingTo": newObj.reportingTo,
                                        "isCelebAccepted": true,
                                        "isManagerAccepted": true,
                                        "isCelebReqNew": true,
                                        "isManagerReqNew": isManagerReqNew,
                                        "status": newObj.status,
                                        "reqID": newObj._id
                                    })
                                    managersArray.push(fObject);
                                } else if ((newObj.isCelebAccepted == true && newObj.isManagerReqNew == true && newObj.isManagerReqNew == true)) {
                                    //console.log('Step 4')
                                    fObject = {};
                                    fObject = celebManagerObj
                                    Object.assign(fObject, {
                                        "reportingTo": newObj.reportingTo,
                                        "isCelebAccepted": true,
                                        "isManagerAccepted": true,
                                        "isCelebReqNew": false,
                                        "isManagerReqNew": true,
                                        "status": newObj.status,
                                        "reqID": newObj._id
                                    })
                                    managersArray.push(fObject);
                                } else if (newObj.isCelebReqNew == true) {
                                    //console.log('Step 5')
                                    fObject = {};
                                    fObject = celebManagerObj
                                    Object.assign(fObject, {
                                        "reportingTo": newObj.reportingTo,
                                        "isCelebAccepted": true,
                                        "isManagerAccepted": isManagerAccepted,
                                        "isCelebReqNew": true,
                                        "isManagerReqNew": isManagerReqNew,
                                        "status": newObj.status,
                                        "reqID": newObj._id
                                    })
                                    managersArray.push(fObject);
                                } else if (newObj.isCelebAccepted == true) {
                                    //console.log('Step 6')
                                    fObject = {};
                                    fObject = celebManagerObj
                                    Object.assign(fObject, {
                                        "reportingTo": newObj.reportingTo,
                                        "isCelebAccepted": true,
                                        "isManagerAccepted": isManagerAccepted,
                                        "isCelebReqNew": isCelebReqNew,
                                        "isManagerReqNew": isManagerReqNew,
                                        "status": newObj.status,
                                        "reqID": newObj._id
                                    })
                                    managersArray.push(fObject);
                                } else if (newObj.isManagerAccepted == true) {
                                    //console.log('Step 7')
                                    fObject = {};
                                    fObject = celebManagerObj
                                    Object.assign(fObject, {
                                        "reportingTo": newObj.reportingTo,
                                        "isCelebAccepted": isCelebAccepted,
                                        "isManagerAccepted": true,
                                        "isCelebReqNew": isCelebReqNew,
                                        "isManagerReqNew": isManagerReqNew,
                                        "status": newObj.status,
                                        "reqID": newObj._id
                                    })
                                    managersArray.push(fObject);
                                } else {
                                    //console.log('Step 8')
                                    fObject = {};
                                    fObject = celebManagerObj
                                    Object.assign(fObject, {
                                        "reportingTo": newObj.reportingTo,
                                        "isCelebAccepted": isCelebAccepted,
                                        "isManagerAccepted": isManagerAccepted,
                                        "isCelebReqNew": isCelebReqNew,
                                        "isManagerReqNew": isManagerReqNew,
                                        "status": newObj.status,
                                        "reqID": newObj._id
                                    })
                                    managersArray.push(fObject);
                                }
                            } else {
                                fObject = {};
                                fObject = celebManagerObj
                                Object.assign(fObject, {
                                    "reportingTo": "0",
                                    "isCelebAccepted": false,
                                    "isManagerAccepted": false,
                                    "isCelebReqNew": false,
                                    "isManagerReqNew": false,
                                    "status": "",
                                    "reqID": ""
                                })
                                managersArray.push(fObject);
                            }
                            callback()
                        }).lean();

                    }, function (err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err)
                            res.status(200).json({
                                success: 0,
                                message: `${err.message}`
                            });
                        else
                            res.status(200).json({
                                "success": 1,
                                "data": managersArray
                            });
                    });
                }
            }
        }
    );
}

const getAccessStatus = (req, res) => {
    let managerId = ObjectId(req.params.managerId);
    let celebrityId = ObjectId(req.params.celebrityId);

    let query = { $and: [{ managerId: managerId }, { celebrityId: celebrityId }] };
    celebManager.find(query, function (err, result) {
        if (result) {
            res.send(result);
        } else {
            res.json({
                error: "No data found!"
            });
        }
    }).sort({ createdAt: -1 });
}

const celebManagers = (req, res, next) => {

    let newCelebManager = new celebManager(
        req.body
    );

    celebManager.aggregate(
        [{
            $match: {
                $and: [{
                    celebrityId: req.body.celebrityId
                },
                {
                    managerId: req.body.managerId
                },
                ]
            }
        }],
        function (err, result) {
            if (err) {
                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
            }
            //console.log(result);
            res.status(200).send(result);

        }
    );
}

const getAssistantManagersListByManagerId = (req, res) => {
    let managerId = ObjectId(req.params.managerID);
    let result = [];
    let query = { reportingTo: managerId }


    celebManager.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: "users",
                localField: "celebrityId",
                foreignField: "_id",
                as: "celebrityProfile"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "managerId",
                foreignField: "_id",
                as: "assistantManagerProfile"
            }
        },
        {
            $unwind: { path: "$assistantManagerProfile" }
        },
        {
            $unwind: "$celebrityProfile"
        },
        {
            $sort: { updatedAt: -1 }
        },
        {
            $project: {
                "_id": 1,
                "celebrityId": 1,
                "managerId": 1,
                "isSuspended": 1,
                "updatedBy": 1,
                "createdBy": 1,
                "updatedAt": 1,
                "createdAt": 1,
                "isActive": 1,
                "isAccess": 1,
                "feedBack": 1,
                "status": 1,
                "isManagerAccepted": 1,
                "isCelebAccepted": 1,
                "isManagerReqNew": 1,
                "isCelebReqNew": 1,
                "isCelebReq": 1,
                "isAdminReq": 1,
                "reportingTo": 1,
                "celebrityProfile._id": 1,
                "celebrityProfile.email": 1,
                "celebrityProfile.username": 1,
                "celebrityProfile.mobileNumber": 1,
                "celebrityProfile.managerCategory": 1,
                "celebrityProfile.managerIndustry": 1,
                "celebrityProfile.isManager": 1,
                "celebrityProfile.isPromoter": 1,
                "celebrityProfile.IsDeleted": 1,
                "celebrityProfile.updated_at": 1,
                "celebrityProfile.created_at": 1,
                "celebrityProfile.Dnd": 1,
                "celebrityProfile.isCeleb": 1,
                "celebrityProfile.status": 1,
                "celebrityProfile.liveStatus": 1,
                "celebrityProfile.industry": 1,
                "celebrityProfile.profession": 1,
                "celebrityProfile.lastName": 1,
                "celebrityProfile.firstName": 1,
                "celebrityProfile.imageRatio": 1,
                "celebrityProfile.avtar_originalname": 1,
                "celebrityProfile.avtar_imgPath": 1,
                "assistantManagerProfile._id": 1,
                "assistantManagerProfile.email": 1,
                "assistantManagerProfile.username": 1,
                "assistantManagerProfile.mobileNumber": 1,
                "assistantManagerProfile.managerCategory": 1,
                "assistantManagerProfile.managerIndustry": 1,
                "assistantManagerProfile.isManager": 1,
                "assistantManagerProfile.isPromoter": 1,
                "assistantManagerProfile.IsDeleted": 1,
                "assistantManagerProfile.updated_at": 1,
                "assistantManagerProfile.created_at": 1,
                "assistantManagerProfile.Dnd": 1,
                "assistantManagerProfile.isCeleb": 1,
                "assistantManagerProfile.status": 1,
                "assistantManagerProfile.liveStatus": 1,
                "assistantManagerProfile.industry": 1,
                "assistantManagerProfile.profession": 1,
                "assistantManagerProfile.lastName": 1,
                "assistantManagerProfile.firstName": 1,
                "assistantManagerProfile.imageRatio": 1,
                "assistantManagerProfile.avtar_originalname": 1,
                "assistantManagerProfile.avtar_imgPath": 1
            }
        }
    ], (err, CMresult) => {
        if (err) {
            res.status(200).json({
                token: req.headers['x-access-token'],
                success: 0,
                message: `${err.message}`
            });
        }
        else if (CMresult) {
            async.each(CMresult, (celebManagerObj, callback) => {
                let isMainManagerAccess;
                celebManager.findOne({ $and: [{ isSuspended: false }, { managerId: celebManagerObj.reportingTo }, { celebrityId: celebManagerObj.celebrityId }] }, function (err, AccessPermission) {
                    if (err) console.log(err);
                    if (AccessPermission) {
                        isMainManagerAccess = AccessPermission.isAccess;
                    }
                    fObject = {}
                    fObject = celebManagerObj;
                    Object.assign(fObject, {
                        "isMainManagerAccess": isMainManagerAccess
                    })
                    result.push(fObject)
                    callback()
                }).lean();
            }, (err) => {
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
                        data: result
                    });
            });
        }
        else {
            res.json({
                token: req.headers['x-access-token'],
                success: 0,
                message: "Manager has no Celebrites linked / Send a valid ID"
            });
        }
    })
    // celebManager.find(query, function (err, CMresult) {
    //     if (err) res.json({token:req.headers['x-access-token'],success:0,message:err});
    //     if (CMresult) {
    //         let loop = 0;
    //         async.each(CMresult, function (celebManagerObj, callback) {
    //             // Perform operation on file here.
    //             User.findById(celebManagerObj.managerId, function (err, managerObject) {
    //                 if (err) return callback(new Error(`Server Error`), null);
    //                 if (managerObject) {
    //                     User.findById(celebManagerObj.celebrityId, function (err, celebrityObject) {
    //                         if (err) return callback(new Error(`Server Error`), null);
    //                         if (celebrityObject) {
    //                             let isMainManagerAccess;
    //                             celebManager.findOne({ $and: [{isSuspended : false},{ managerId: celebManagerObj.reportingTo }, { celebrityId: celebManagerObj.celebrityId }] }, function (err, AccessPermission) {
    //                                 if (err) console.log(err);
    //                                 if(AccessPermission)
    //                                 {
    //                                     isMainManagerAccess = AccessPermission.isAccess;
    //                                 }
    //                                 fObject = {}
    //                                 fObject = celebManagerObj;
    //                                 Object.assign(fObject, {
    //                                     "isMainManagerAccess": isMainManagerAccess,
    //                                     "celebrityProfile": celebrityObject,
    //                                     "assistantManagerProfile": managerObject
    //                                 })
    //                                 result.push(fObject)
    //                                 callback()
    //                             }).lean();
    //                         }
    //                     }).lean();
    //                 }
    //             }).lean();
    //         }, function (err) {
    //             // if any of the file processing produced an error, err would equal that error
    //             if (err)
    //                 res.status(200).json({
    //                     token:req.headers['x-access-token'],
    //                     success: 0,
    //                     message: `${err.message}`
    //                 });
    //             else
    //                 res.status(200).json({
    //                     token:req.headers['x-access-token'],
    //                     success: 1,
    //                     data: result
    //                 });
    //         });
    //     } else {
    //         res.json({
    //             token:req.headers['x-access-token'],
    //             success: 0,
    //             message: "Celeb has no managers / Send a valid ID"
    //         });
    //     }
    // }).lean();
}

const getAssistantManagersListBycelebAndManager = (req, res) => {
    let celebrityId = req.params.celebrityID;
    let managerId = req.params.managerID;
    let result = [];
    let query = { $and: [{ celebrityId: celebrityId }, { reportingTo: managerId }] }
    celebManager.find(query, function (err, CMresult) {
        if (err) res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        if (CMresult) {
            let loop = 0;
            async.each(CMresult, function (celebManagerObj, callback) {
                // Perform operation on file here.
                User.findById(celebManagerObj.managerId, function (err, managerObject) {
                    console.log(err)
                    //console.log(managerObject)
                    if (err) return callback(new Error(`Server Error`), null);
                    if (managerObject) {
                        fObject = {}
                        fObject = celebManagerObj;
                        Object.assign(fObject, {
                            "assistantManagerProfile": managerObject
                        })
                        result.push(fObject)
                        callback()
                    }
                }).lean();
            }, function (err) {
                // if any of the file processing produced an error, err would equal that error
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
                        data: result
                    });
            });
        } else {
            res.json({
                token: req.headers['x-access-token'],
                success: 0,
                message: "Celeb has no managers / Send a valid ID"
            });
        }
    }).lean();
}


module.exports = {
    celebToManagerRequest: celebToManagerRequest,
    managerToManagerRequest: managerToManagerRequest,
    linkCelebAndManagerFromAdmin: linkCelebAndManagerFromAdmin,
    findManagerByCelebrity: findManagerByCelebrity,
    getManagerListForCelebrity: getManagerListForCelebrity,
    getCelebrityListForManager: getCelebrityListForManager,
    managerSearchWhenCelebrityLogin: managerSearchWhenCelebrityLogin,
    managerSearchWhenManagerLogin: managerSearchWhenManagerLogin,
    getManagerProfileByManagerId: getManagerProfileByManagerId,
    update: update,
    getAccessStatus: getAccessStatus,
    newManagerSearch: newManagerSearch,
    celebManagers: celebManagers,
    getAssistantManagersListByManagerId: getAssistantManagersListByManagerId,
    getAssistantManagersListBycelebAndManager: getAssistantManagersListBycelebAndManager,
    sendRequestToManager: sendRequestToManager,
    updateCelebManagerStatus: updateCelebManagerStatus,
    celebToManagerRequest1: celebToManagerRequest1,
    managerToManagerRequest1: managerToManagerRequest1,
    linkCelebAndManagerFromAdmin1: linkCelebAndManagerFromAdmin1
}