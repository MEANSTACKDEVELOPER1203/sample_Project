let audition = require("../auditions/auditionService");
let role = require("../roles/roleModel");
let audition1 = require("../auditions/auditionModel");
let applyAuditionsService = require('../applyAuditions/applyAuditionsService');
let ObjectId = require('mongodb').ObjectId;
let Notification = require("../notification/notificationModel");
let auditionsProfiles = require('../auditionsProfiles/auditionsProfilesModel');
let notificationSetting = require("../notificationSettings/notificationSettingsModel");
let notificationMaster = require("../notificationMaster/notificationMasterModel");

// create auditions
var createAudition = (req, res) => {
    roleObj = req.body.roleObj;
    var newNotificationArray = [];
    audition.saveAudition(req.body,res,(err, createAuditionObj) => {
        if (err) {
            return res.status(404).json({
                token:req.headers['x-access-token'],
                success: 0,
                message: "Error while creating the new Audition."
            });
            
        } else {
            if (req.body.draftMode == true) {
                res.status(200).json({
                    token:req.headers['x-access-token'],
                    success: 1,
                    message: "Audition saved to Drafts."
                });
                test1 = createAuditionObj._id

                for (i = 0; i < roleObj.length; i++) {
                    //console.log("pavan",roleObj);
                    Object.assign(roleObj[i], {
                        "auditionId": test1
                    });
                }
                role.insertMany(roleObj, (err, createroleObj) => {
                    if (err) {
                        console.log(err)
                    } else {
                    }
                });
            } else {
                res.status(200).json({
                    token:req.headers['x-access-token'],
                    success: 1,
                    message: "Audition published successfully.",
                    data: createAuditionObj
                });
                test1 = createAuditionObj._id

                for (i = 0; i < roleObj.length; i++) {
                    //console.log("pavan",roleObj);
                    Object.assign(roleObj[i], {
                        "auditionId": test1
                    });
                }
                var NotificationAuditionId = ObjectId("5baf8b4a5129360870bcfe90")
                notificationMaster.findOne({"notificationType" : "Auditions Updates","notificationName" : "Auditions Updates"},{_id:1},(err,settingAuditionId)=>{
                    if(!err)
                    {
                        NotificationAuditionId = settingAuditionId._id;
                    }
                    role.insertMany(roleObj, (err, createroleObj) => {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log(createroleObj)
                            for (i = 0; i < createroleObj.length; i++) {
                                // console.log("***************************************************************************************")
                                // console.log(createroleObj[i])
                                // console.log("***************************************************************************************")
                                let role = createroleObj[i].roleType;
                                let gender = createroleObj[i].gender;
                                let ageStart = createroleObj[i].ageStart;
                                let ageEnd = createroleObj[i].ageEnd;
                                let roleId = createroleObj[i]._id;
                              
                                let createdBy = ObjectId(createAuditionObj.memberId)
                                auditionsProfiles.aggregate(
                                    [
                                        {
                                            $match: {
                                                $and: [
                                                    { memberId: { $ne: createdBy } },
                                                    { skills: { $elemMatch: { $eq: role } } }, { gender: gender },
                                                    {
                                                        $or:[
                                                            {
                                                                $and:[
                                                                    { "ageStart": { $gte: parseInt(ageStart) } },
                                                                    { "ageStart": { $lte: parseInt(ageEnd) } }
                                                                ]
                                                            },
                                                            {
                                                                $and:[
                                                                    { "ageEnd": { $gte: parseInt(ageStart) } },
                                                                    { "ageEnd": { $lte: parseInt(ageEnd) } }
                                                                ],
                                                            
                                                            },
                                                            {
                                                                $and:[
                                                                    { "ageStart": { $lte: parseInt(ageStart) }},
                                                                    { "ageEnd": { $gte: parseInt(ageEnd) } }
                                                                ]  
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                        }
                                    ],
                                    (err, DetailsObj)=>{
                                        console.log("P", DetailsObj.length);
                                        console.log("P", DetailsObj);
                                        for (i = 0; i < DetailsObj.length; i++) {
                                            let query = { $and: [{ memberId: ObjectId(DetailsObj[i].memberId) }, { notificationSettingId: NotificationAuditionId }, { isEnabled: true }] };
                                            let memberIdD = DetailsObj[i].memberId;
                                            let notificationIcon = Notification.getnotificationIconByRoleType(role)
                                            let dRole = DetailsObj[i].skills;
                                            notificationSetting.findOne(query,(err, rest)=> {
                                                if (err) return res.send(err);
                                                // // Insert into Notfications Collection 
                                                if (rest) {
                                                    let newNotification = new Notification({
                                                        memberId: memberIdD,
                                                        roleId: roleId,
                                                        notificationFrom:createAuditionObj.memberId,
                                                        notificationIcon: notificationIcon,
                                                        activity: "audition",
                                                        auditionId: createAuditionObj._id,
                                                        title: "Audition for " + role,
                                                        body: " " + createAuditionObj.productionTitle + " for " + role + " matched your profile",
                                                        notificationType: "audition"
                                                    });
                                                    Notification.create(newNotification, (err, notifications)=> {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log(notifications)
                                                        }
                                                    });
                                                } else {
    
                                                }
                                            })
                                        }
                                    }
                                );
                            }
                        }
                    });
                })
            }
        }
    });
    
}

// create Roles
var search = (req, res) => {
    audition.create(req.body, (err, searchObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while creating the new Role."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Roles inserted successfully."
            });
        }
    });
}

// update contest
var updateAudition = (req, res) => {
    if (req.body.roleObj) {
        roleObj = req.body.roleObj;
        req.body.role = roleObj;
    }
    req.body.updatedAt = new Date();
    audition.updateAudition(req.params.auditionId, req.body, res, (err, updateAuditionObj) => {
        if (err) {
            return res.status(404).json({
                token:req.headers['x-access-token'],
                success: 0,
                message: "Error while updating the Contest."
            });
        } else {
                if (updateAuditionObj.draftMode == true) {
                    res.status(200).json({
                        token:req.headers['x-access-token'],
                        success: 1,
                        message: "Audition saved to Drafts."
                    });
                    if (req.body.roleObj) {
                        role.remove({ auditionId: ObjectId(updateAuditionObj._id) }, (err, removed) => {
                            if (err)
                                console.log(err)
                            else {
                                test1 = updateAuditionObj._id
                                roleObj.map((role) => {
                                    role.auditionId = test1
                                })
                                role.insertMany(roleObj, (err, createroleObj) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        // console.log(createroleObj)
                                    }
                                })
                            }
                        })
                    }
                } else {
                    res.status(200).json({
                        token:req.headers['x-access-token'],
                        success: 1,
                        message: "Audition Published successfully."
                    });
                    if (!req.body.roleObj) {
                        let NotificationAuditionId = ObjectId("5baf8b4a5129360870bcfe90")
                        notificationMaster.findOne({"notificationType" : "Auditions Updates","notificationName" : "Auditions Updates"},{_id:1},(err,settingAuditionId)=>{
                            if(!err)
                            {
                                NotificationAuditionId = settingAuditionId._id;
                            }
                            role.find({ auditionId: ObjectId(updateAuditionObj._id) }, (err, createroleObj) => {
                                for (i = 0; i < createroleObj.length; i++) {
                                    //console.log(createroleObj[i].roleType)
                                    let role = createroleObj[i].roleType;
                                    let gender = createroleObj[i].gender;
                                    let ageStart = createroleObj[i].ageStart;
                                    let ageEnd = createroleObj[i].ageEnd;
                                    let roleId = createroleObj[i]._id;
                                    let createdBy = ObjectId(updateAuditionObj.memberId)
                                    auditionsProfiles.aggregate(
                                        [
                                            {
                                                $match: {
                                                    $and: [
                                                        { memberId: { $ne: createdBy } },
                                                        { skills: { $elemMatch: { $eq: role } } }, { gender: gender },
                                                        {
                                                            $or:[
                                                                {
                                                                    $and:[
                                                                        { "ageStart": { $gte: parseInt(ageStart) } },
                                                                        { "ageStart": { $lte: parseInt(ageEnd) } }
                                                                    ]
                                                                },
                                                                {
                                                                    $and:[
                                                                        { "ageEnd": { $gte: parseInt(ageStart) } },
                                                                        { "ageEnd": { $lte: parseInt(ageEnd) } }
                                                                    ],
                                                                
                                                                },
                                                                {
                                                                    $and:[
                                                                        { "ageStart": { $lte: parseInt(ageStart) }},
                                                                        { "ageEnd": { $gte: parseInt(ageEnd) } }
                                                                    ]  
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                            }
                                        ],
                                        (err, DetailsObj)=> {
        
                                            // console.log("P", DetailsObj);
                                            for (i = 0; i < DetailsObj.length; i++) {
                                                // console.log(DetailsObj[i].memberId)
                                                let query = { $and: [{ memberId: ObjectId(DetailsObj[i].memberId) }, { notificationSettingId: NotificationAuditionId }, { isEnabled: true }] };
                                                //let query = { memberId: DetailsObj[i].memberId, notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") };
                                                let memberIdD = DetailsObj[i].memberId;
                                                let notificationIcon = Notification.getnotificationIconByRoleType(role)
                                                let dRole = DetailsObj[i].skills;
                                                notificationSetting.findOne(query,(err, rest)=>{
                                                    // console.log(rest)
                                                    if (err) return res.send(err);
                                                    // // Insert into Notfications Collection 
                                                    if (rest) {
                                                        let newNotification = new Notification({
                                                            memberId: memberIdD,
                                                            roleId: roleId,
                                                            notificationIcon: notificationIcon,
                                                            notificationFrom:updateAuditionObj.memberId,
                                                            activity: "audition",
                                                            auditionId: updateAuditionObj._id,
                                                            title: "Audition for " + role,
                                                            body: " " + updateAuditionObj.productionTitle + " for " + role + " matched your profile",
                                                            notificationType: "audition"
                                                        });
                                                        // newNotificationArray.push(newNotification);
                                                        // console.log(newNotificationArray)
                                                        Notification.create(newNotification, (err, notifications)=> {
                                                            if (err) {
                                                                console.log(err);
                                                                //res.send(err);
                                                            } else {
                                                                // console.log(notifications)
                                                                // res.send({
                                                                //     message: "Notification sent successfully"
                                                                // });
                                                            }
                                                        });
                                                    } else {
        
                                                    }
                                                })
                                            }
                                        }
                                    );
                                }
                            });
                        });
                    }
                    else {
                        let NotificationAuditionId = ObjectId("5baf8b4a5129360870bcfe90")
                        notificationMaster.findOne({"notificationType" : "Auditions Updates","notificationName" : "Auditions Updates"},{_id:1},(err,settingAuditionId)=>{
                            if(!err)
                            {
                                NotificationAuditionId = settingAuditionId._id;
                            }
                            role.remove({ auditionId: ObjectId(updateAuditionObj._id) }, (err, removed) => {
                                if (err){
                                    console.log(err)
                                }
                                else {
                                    test1 = updateAuditionObj._id
                                    roleObj.map((role) => {
                                        role.auditionId = test1
                                    })
                                    role.insertMany(roleObj, (err, createroleObj) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            for (i = 0; i < createroleObj.length; i++) {
                                                //console.log(createroleObj[i].roleType)
                                                let role = createroleObj[i].roleType;
                                                let gender = createroleObj[i].gender;
                                                let ageStart = createroleObj[i].ageStart;
                                                let ageEnd = createroleObj[i].ageEnd;
                                                let roleId = createroleObj[i]._id;
        
                                                auditionsProfiles.aggregate(
                                                    [
                                                        {
                                                            $match: {
                                                                $and: [{ memberId: { $ne: ObjectId(updateAuditionObj.memberId) } },
                                                                { skills: { $elemMatch: { $eq: role } } }, { gender: gender },
                                                                {
                                                                    $or:[
                                                                        {
                                                                            $and:[
                                                                                { "ageStart": { $gte: parseInt(ageStart) } },
                                                                                { "ageStart": { $lte: parseInt(ageEnd) } }
                                                                            ]
                                                                        },
                                                                        {
                                                                            $and:[
                                                                                { "ageEnd": { $gte: parseInt(ageStart) } },
                                                                                { "ageEnd": { $lte: parseInt(ageEnd) } }
                                                                            ],
                                                                        
                                                                        },
                                                                        {
                                                                            $and:[
                                                                                { "ageStart": { $lte: parseInt(ageStart) }},
                                                                                { "ageEnd": { $gte: parseInt(ageEnd) } }
                                                                            ]  
                                                                        }
                                                                    ]
                                                                }
                                                                ]
                                                            },
                                                        }
                                                    ],
                                                    (err, DetailsObj)=> {
        
                                                        //console.log("P", DetailsObj);
                                                        for (i = 0; i < DetailsObj.length; i++) {
                                                            // console.log(DetailsObj[i].memberId)
                                                            let query = { $and: [{ memberId: ObjectId(DetailsObj[i].memberId) }, { notificationSettingId: NotificationAuditionId }, { isEnabled: true }] };
                                                            //let query = { memberId: DetailsObj[i].memberId, notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") };
                                                            let memberIdD = DetailsObj[i].memberId;
                                                            let notificationIcon = Notification.getnotificationIconByRoleType(role)
                                                            let dRole = DetailsObj[i].skills;
                                                            notificationSetting.findOne(query,(err, rest)=>{
                                                                // console.log(rest)
                                                                if (err) return res.send(err);
                                                                // // Insert into Notfications Collection 
                                                                if (rest) {
                                                                    let newNotification = new Notification({
                                                                        memberId: memberIdD,
                                                                        roleId: roleId,
                                                                        notificationFrom:updateAuditionObj.memberId,
                                                                        notificationIcon: notificationIcon,
                                                                        activity: "audition",
                                                                        auditionId: updateAuditionObj._id,
                                                                        title: "Audition for " + role,
                                                                        body: updateAuditionObj.productionTitle + " for " + role + " matched your profile",
                                                                        notificationType: "audition"
                                                                    });
                                                                    // newNotificationArray.push(newNotification);
                                                                    // console.log(newNotificationArray)
                                                                    Notification.create(newNotification,(err, notifications)=>{
                                                                        if (err) {
                                                                            console.log(err);
                                                                            //res.send(err);
                                                                        } else {
                                                                            // console.log(notifications)
                                                                            // res.send({
                                                                            //     message: "Notification sent successfully"
                                                                            // });
                                                                        }
                                                                    });
                                                                } else {
        
                                                                }
                                                            })
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    })
                                }
                            })
                        });
                        
                    }
                }
            } 
    });
}

// get contest details by contest ID
var getAuditionById = (req, res) => {
    audition.findAuditionById(req.params.auditionId, (err, AuditionObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                auditionDetails: AuditionObj
            });
        }
    });
}

// get Search by role
var getRoleByString = (req, res) => {
    audition.getRoleByString(req.params.text, req.params.memberId, (err, auditionSearchDetailsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: auditionSearchDetailsObj
            });
        }
    });
}

// get Search by HairColour
var getRoleByAllFilters = (req, res) => {
    audition.getRoleByAllFilters(req.params.text, req.params.gender, req.params.eyeColour, req.params.hairColour, req.params.bodyType, req.params.ethnicity, req.params.ageStart, req.params.ageEnd, req.params.startHeight, req.params.endHeight, req.params.memberId, (err, auditionSearchByHairColourDetailsObj) => {
        if (err) {
            return res.status(404).json({
                token:req.headers['x-access-token'],
                success: 0,
                message: `Error while fetching the Contest details. + ${err}`
            });
        } else {
            res.status(200).json({
                token:req.headers['x-access-token'],
                success: 1,
                data: auditionSearchByHairColourDetailsObj
            });
        }
    });
}



// get Search by BodyType
var getBodyTypeByString = (req, res) => {
    audition.getBodyTypeByString(req.params.text, (err, auditionSearchByBodyTypeDetailsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: auditionSearchByBodyTypeDetailsObj
            });
        }
    });
}

// get Search by eyeColour
var getEyeColourByString = (req, res) => {
    audition.getEyeColourByString(req.params.text, (err, auditionSearchByEyeColourDetailsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: auditionSearchByEyeColourDetailsObj
            });
        }
    });
}

// get Search by eyeColour
var getDraftsByMemberId = (req, res) => {
    audition.getDraftsByMemberId(req.params.memberId, (err, auditionDetailsObj) => {
        // console.log(auditionDetailsObj)
        if (err) {
            return res.status(404).json({token:req.headers['x-access-token'],success: 0, message: "Error while fetching the Contest details."});
        } else {
            auditionDetailsObj.map((audition) => {
                // console.log(audition.auditionExipires)
                audition.isExpired = (audition.auditionExipires < new Date()) ? true : false;
                return audition;
            })
            res.status(200).json({token:req.headers['x-access-token'],success: 1,data: auditionDetailsObj});
        }
    });
}

// get Search by keywords
var getKeywordsByString = (req, res) => {
    audition.getKeywordsByString(req.params.text, (err, auditionSearchByKeywordsDetailsObj) => {
        if (err) {
            return res.status(404).json({
                token:req.headers['x-access-token'],
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                token:req.headers['x-access-token'],
                success: 1,
                auditionDetails: auditionSearchByKeywordsDetailsObj
            });
        }
    });
}

// get Search by getDrafts
var getDrafts = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    audition1.find({ draftMode: "true" }, (err, auditionSearchByKeywordsDetailsObj) => {
        if (err) {
            return res.status(404).json({
                token:req.headers['x-access-token'],
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                token:req.headers['x-access-token'],
                success: 1,
                auditionDetails: auditionSearchByKeywordsDetailsObj
            });
        }
    }).sort({ createdAt: -1 });
}

var getAuditionByMemberId = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let auditionIdLists = [];
    audition.findAuditionByMemberId(ObjectId(memberId), (err, listOfMemberAudionObj) => {
        if (err) {
            return res.status(404).json({ token:req.headers['x-access-token'],success: 0, message: "Error while fetching the audition!" })
        } else if (!listOfMemberAudionObj || listOfMemberAudionObj == null) {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 0, message: "There are no Audition!" });
        } else {
            listOfMemberAudionObj.forEach((item) => {
                auditionIdLists.push((item._id))//removed object data
            });
            applyAuditionsService.findTotalCountOfApplyAudition(auditionIdLists, (err, totalCountOfAudition) => {
                if (err) {
                    console.log(err)
                } else {
                    let applyAuditionCount = 0;
                    let listOfMemberAudionObjWithCount = [];
                    for (let i = 0; i < listOfMemberAudionObj.length; i++) {
                        applyAuditionCount = 0;
                        let auditionObj = {};
                        listOfMemberAudionObj[i].isExpired = (listOfMemberAudionObj[i].auditionExipires < new Date()) ? true : false;
                        auditionObj = listOfMemberAudionObj[i];
                        let id = auditionObj._id
                        id = "" + id;
                        // console.log("***********id************")
                        // console.log(id);
                        // console.log(typeof id);
                        for (let j = 0; j < totalCountOfAudition.length; j++) {
                            let auditionId = totalCountOfAudition[j].auditionId;
                            auditionId = "" + auditionId;
                            if (id === auditionId) {
                                applyAuditionCount += 1;
                            }
                        }

                        Object.assign(auditionObj, { "applyAuditionCount": applyAuditionCount });
                        listOfMemberAudionObjWithCount.push(auditionObj);
                    }
                    res.status(200).json({ token:req.headers['x-access-token'],success: 1, data: listOfMemberAudionObjWithCount });
                }
            });
        }
    })
}
// get Search by getDrafts
var getPublishedDocuments = (req, res) => {
    audition1.find({ draftMode: "false" }, (err, auditionSearchByKeywordsDetailsObj) => {
        if (err) {
            return res.status(404).json({
                token:req.headers['x-access-token'],
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                token:req.headers['x-access-token'],
                success: 1,
                data: auditionSearchByKeywordsDetailsObj
            });
        }
    }).sort({ createdAt: -1 });
}

var getAllAudition = (req, res) => {
    audition.findAllAudition((err, listOfAuditionObj) => {
        if (err) {
            return res.json({ success: 0, message: "Error while fetching the all audition" });
        } else if (!listOfAuditionObj || listOfAuditionObj == null) {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 0, message: "Record not found!" });
        } else {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 1, data: listOfAuditionObj });
        }
    })
}

var getAllAuditionByLimit = (req, res) => {
    audition.getAllAuditionByLimit(req.params,(err, listOfAuditionObj) => {
        if (err) {
            return res.json({ success: 0, message: "Error while fetching the all audition" });
        } else if (!listOfAuditionObj || listOfAuditionObj == null) {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 0, message: "Record not found!" });
        } else {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 1, data: listOfAuditionObj });
        }
    })
}

var getAllFavouriteAuditions = (req, res) => {
    audition.getAllFavouriteAuditions((err, listOfFavouriteAuditionObj) => {
        if (err) {
            return res.json({ success: 0, message: "Error while fetching the all audition" });
        } else if (!listOfFavouriteAuditionObj || listOfFavouriteAuditionObj == null) {
            return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "Record not found!" });
        } else {
            return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfFavouriteAuditionObj });
        }
    })
}

var getAllAuditionAndRolesByIds = (req, res) => {
    let auditionId = (req.params.audition_Id) ? req.params.audition_Id : '';
    let roleId = (req.params.role_Id) ? req.params.role_Id : '';
    let memberId = (req.params.memberId) ? req.params.memberId : '';
    audition.findAuditionAndRolesByIds(auditionId, roleId,memberId, (err, auditionObj) => {
        if (err) {
            return res.status(404).json({ token:req.headers['x-access-token'],success: 0, message: "Error while fetching the Audintion and roles by ids.." })
        } else if (!audition || auditionObj == null) {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 0, message: "Please try again!" });
        } else {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 1, data: auditionObj });
        }
    });
}


/// GET contest questions by Contest Name



var auditionController = {
    createAudition: createAudition,
    updateAudition: updateAudition,
    getAuditionById: getAuditionById,
    getRoleByString: getRoleByString,
    search: search,
    getDrafts: getDrafts,
    getRoleByAllFilters: getRoleByAllFilters,
    getBodyTypeByString: getBodyTypeByString,
    getEyeColourByString: getEyeColourByString,
    getKeywordsByString: getKeywordsByString,
    getAuditionByMemberId: getAuditionByMemberId,
    getPublishedDocuments: getPublishedDocuments,
    getDraftsByMemberId: getDraftsByMemberId,
    //getDraftsByMemberId: getDraftsByMemberId,
    getAllAudition: getAllAudition,
    getAllAuditionAndRolesByIds: getAllAuditionAndRolesByIds,
    getAllFavouriteAuditions: getAllFavouriteAuditions,
    getAllAuditionByLimit:getAllAuditionByLimit
}

module.exports = auditionController;








































































































































/*var getUserProfile = (req, res) => {
    userService.getAllUserProfile((err, listOfUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while retrieving the user profile" });
        } else {
            res.status(200).json({ success: 1, data: listOfUserProfileObj });
        }
    });
}

var createUserProfile = (req, res) => {
    let userObj = req.body;
    let files = req.files;
    userObj.imageUrl = files[0].path;
    userObj.imageName = files[0].filename;
    req.body = userObj
    userService.saveUserProfile(req.body, (err, createdUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while creating user profile" });
        } else {
            res.status(200).json({ success: 1, data: createdUserProfileObj });
        }
    })
}

var updateUserProfile = (req, res) => {
    let userId = (req.params.user_Id) ? req.params.user_Id : '';
    userService.updateUserProfileById(userId, req.body, (err, updateUserObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while update user profile " + err.message });
        } else {
            res.status(200).json({ success: 1, data: updateUserObj });
        }
    });
}

var getUserProfileByDate = (req, res) =>{
   let createdDate = (req.params.createdDate) ? req.params.createdDate : '';
   userService.findUserByCreatedDate(createdDate, (err, userByDateObj)=>{
       if(err){
           res.status(404).json({success:0, message:"Error while retrieving user by date"});
       }else{
           res.status(200).json({success:1, data:userByDateObj});
       }

   });
}

var userProfile = {
    getUserProfile: getUserProfile,
    createUserProfile: createUserProfile,
    updateUserProfile: updateUserProfile,
    getUserProfileByDate: getUserProfileByDate
}


module.exports = userProfile;

*/