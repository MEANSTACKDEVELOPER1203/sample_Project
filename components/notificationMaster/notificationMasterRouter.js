let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let async = require('async');
let notificationMaster = require("./notificationMasterModel");
let notificationSetting = require("../notificationSettings/notificationSettingsModel");
let userService = require('../users/userService');

// Create a notificationMaster item
router.post("/createNotificationMaster", function (req, res) {
    let notificationName = req.body.notificationName;
    let notificationType = req.body.notificationType;
    let notificationStatus = req.body.notificationStatus;
    let createdAt = req.body.createdAt;
    let createdBy = req.body.createdBy;
    let updatedBy = req.body.updatedBy;
    let updatedAt = req.body.updatedAt;

    let newNotificationMaster = new notificationMaster({
        notificationName: notificationName,
        notificationType: notificationType,
        notificationStatus: notificationStatus,
        createdBy: createdBy,
        updatedBy: updatedBy,
        createdAt: createdAt,
        updatedAt: updatedAt
    });

    notificationMaster.createNotificationMaster(newNotificationMaster, function (
        err,
        notificationMaster
    ) {
        if (err) {
            res.send(err);
        } else {
            res.json({ message: "notificationMaster saved successfully" });
        }
    });
});
// End of Create a notificationMaster item

// Edit a notificationMaster record
router.put("/editNotificationMaster/:id", function (req, res) {
    let reqbody = req.body;
    reqbody.updatedBy = req.body.updatedBy;
    reqbody.updatedDateTime = new Date();

    notificationMaster.findByIdAndUpdate(req.params.id, reqbody, function (
        err,
        result
    ) {
        if (err) {
            res.json({
                error: "notificationMaster Not Exists / Send a valid UserID"
            });
        } else {
            res.json({ message: "notificationMaster Updated Successfully" });
        }
    });
});
// End of Edit a notificationMaster record

// Find by notificationMasterId
router.get("/findNotificationMasterId/:notificationMasterId", function (req, res) {
    let id = req.params.notificationMasterId;

    notificationMaster.getnotificationMasterById(id, function (err, result) {
        if (result) {
            res.send(result);
        } else {
            res.json({
                error: "notificationMaster document Not Exists / Send a valid ID"
            });
        }
    });
});
// End of Find by notificationMasterId

// get list all credit exchange info
router.get("/getAll/:memberId", function (req, res) {
    let id = req.params.memberId
    userService.getCelebDetailsById(id, (err, userObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while fetching user details" });
        } else {
            let query = {};
            if (userObj.isCeleb == true && userObj.isManager == false) {
                query = {};
            } else if (userObj.isCeleb == false && userObj.isManager == true) {
                query = { "_id": { $nin: [ObjectId("5b5ebe31fef3737e09fb3849")] } };
            } else if (userObj.isCeleb == true && userObj.isManager == true) {
                query = {};
            } else {
                query = { "_id": { $nin: [ObjectId("5b5ebe31fef3737e09fb3849"), ObjectId("5baf8b475129360870bcfe8f")] } };
            }
            // console.log(query)
            notificationMaster.find(query, { _id: 1, notificationType: 1, notificationName: 1 }, (err, currentUserNotificationSettingObj) => {
                if (err) {
                    return res.status(400).json({ success: 0, message: "Error while fetching the current user notification setting" })
                } else {
                    let notiSettingId = currentUserNotificationSettingObj.map((notiSettingId) => {
                        return (notiSettingId._id);
                    })
                    // console.log(notiSettingId)
                    notificationSetting.find({ memberId: ObjectId(id), notificationSettingId: { $in: notiSettingId }, isEnabled: true }, (err, userNotificationSettingObj) => {
                        if (err) {
                            return res.status(400).json({ success: 0, message: "Error while fetching the user notification setting" })
                        } else {
                            let results = currentUserNotificationSettingObj.map((masterObj) => {
                                let obj = {};
                                obj = masterObj;
                                userNotificationSettingObj.map((userSetting) => {
                                    let obj2 = {};
                                    obj2 = userSetting;
                                    if ("" + obj._id == "" + obj2.notificationSettingId) {
                                        masterObj.notificationStats = obj2
                                    }

                                })
                                // console.log(masterObj.notificationStats)
                                if(masterObj.notificationStats == undefined){
                                    // console.log("Cond",masterObj.notificationStats)
                                    masterObj.notificationStats = {
                                        "memberId": id,
                                        "notificationSettingId": obj._id,
                                        "isEnabled": false
                                    }
                                }
                                return masterObj
                            })
                            return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: results})
                        }
                    })

                }
            }).lean();
            // console.log(userObj)
            // notificationMaster.aggregate(
            //     [

            //         {
            //             $lookup: {
            //                 from: "notificationsettings",
            //                 localField: "_id",
            //                 foreignField: "notificationSettingId",
            //                 as: "notificationStats"
            //             }

            //         },
            //         {
            //             $project: {
            //                 notificationType : 1,
            //                 notificationName: 1,
            //                 notificationStats: {
            //                   $filter: {
            //                      input: "$notificationStats",
            //                      as: "notificationStats",
            //                      cond: { $eq: [ "$$notificationStats.memberId", ObjectId(id) ] }
            //                   }
            //                }
            //             }
            //          }

            //     ],
            //     function (err, result) {
            //         if (err) {
            //             res.json({token:req.headers['x-access-token'],success:0,message:err});
            //         }
            //         res.json({token:req.headers['x-access-token'],success:1,data:result});
            //     }
            // );
        }
    })

});
// End of get list all credit exchange info

// Delete Credit Exchange
router.delete("/deleteNotificationMasterById/:id", function (req, res, next) {
    let id = req.params.id;

    notificationMaster.findByIdAndRemove(id, function (err, post) {
        if (err) {
            res.json({
                error: "notificationMaster document Not Exists / Send a valid ID"
            });
        } else {
            res.json({ message: "Deleted notificationMaster Successfully" });
        }
    });
});
// End of Delete Credit Exchange

module.exports = router;
