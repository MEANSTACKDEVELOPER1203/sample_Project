//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let applyAuditions = require("../applyAuditions/applyAuditionsModel");
let auditionProfileModel = require("../auditionsProfiles/auditionsProfilesModel");
let roleModel = require("../roles/roleModel");
//let role = require("../roles/roleModel");

// var saveApplyAuditions = (applyAuditionsObj, callback) =>{
//     var applyAuditionsObj = new applyAuditions({
//         auditionId: applyAuditionsObj.auditionId,
//         memberId: applyAuditionsObj.memberId,
//         roleId: applyAuditionsObj.roleId,
//         auditionProfileId: applyAuditionsObj.auditionProfileId,
//         imageUrl: applyAuditionsObj.imageUrl,
//         videoUrl: applyAuditionsObj.videoUrl,
//         documentUrl: applyAuditionsObj.documentUrl,
//         status: applyAuditionsObj.status,
//         createdBy: applyAuditionsObj.createdBy,
//         updatedBy: applyAuditionsObj.updatedBy
//     });
//     // auditionProfileModel.find(applyAuditionsObj.auditionProfileId, (err, AuditionsObj) => {
//     //     console.log(AuditionsObj);


//     // });

//     roleModel.find({_id:applyAuditionsObj.roleId}, (err, AuditionsProfielObj) => {
//         console.log("P1",AuditionsProfielObj);
//      if(AuditionsProfielObj){
//          //let role = createroleObj[i].roleType;
//     let gender = AuditionsProfielObj[0].gender;
//     let ageStart = AuditionsProfielObj[0].ageStart;
//     let ageEnd = AuditionsProfielObj[0].ageEnd;
//     //console.log("gender",AuditionsProfielObj[0].gender)


//     currentDate = new Date();
//     let newAge = currentDate.getFullYear() - ageStart;
//     let endAge = currentDate.getFullYear() - ageEnd;
//     let ageN = new Date(newAge + "-01-01");
//     let ageO = new Date(endAge + "-01-01");
//     console.log(ageN)
//     let query1 = {
//         $and: [{ gender: gender }, { dob: { $gte: ageO, $lte: ageN } }]
//     };
//     console.log(query1)

//     auditionProfileModel.find(query1, (err, AuditionsObj) => {
//         console.log("P",AuditionsObj);
//         if(AuditionsObj.length > 0){
        
//             //console.log("P", DetailsObj);
//             let query = {
//                 $and: [{ roleId: applyAuditionsObj.roleId }, { auditionProfileId: applyAuditionsObj.auditionProfileId }, { auditionId: applyAuditionsObj.auditionId }]
//             };
        
//             applyAuditions.find(query, (err, AuditionsObj) => {
//                 console.log(AuditionsObj);
//                 if (AuditionsObj.length == 0) {
//                     applyAuditions.create(applyAuditionsObj, (err, createApplyAuditionsObj) => {
//                         if (!err)
//                             callback(null, createApplyAuditionsObj);
//                         else
//                             callback(err, null);
//                     });
        
//                 }
//                 else {
//                     if(AuditionsObj.length > 0)
//                     {
//                     callback(null, {
//                         success: 0,
//                         message: "You have already applied to this Audition!"
//                     });
//                 }else{
//                     callback(null, {
//                         success: 0,
//                         message: "your profile does not match the role to apply"
//                     });

//                 }
//                 }
//             });
//         } else {
//             callback(null, {
//                 success: 0,
//                 message: "your profile does not match the role to apply"
//             });

//         }

//         });

//      }else{
         
//      }
    
//     });
// }

var saveApplyAuditions = (applyAuditionsObj, callback)=> {
    // console.log(applyAuditionsObj)
    let query = {
        $and: [{ roleId: applyAuditionsObj.roleId }, { auditionProfileId: applyAuditionsObj.auditionProfileId }, { auditionId: applyAuditionsObj.auditionId }]
    };
    applyAuditions.findOne(query, (err, AuditionsObj) => {
        if(err)
        {
            callback(null, {
                success: 0,
                message: "error while finding apllyAudition Details!"
            });    
        }
        else if(AuditionsObj)
        {
            callback(null, {
                success: 0,
                message: "You have already applied to this Audition!"
            });
        }
        else
        {
            if(applyAuditionsObj.osType != "IOS" && !applyAuditionsObj.attachment.length)
            {
                callback(null, {
                    success: 0,
                    message: "Please attach media"
                });
            }
            else{
                roleModel.findOne({_id:applyAuditionsObj.roleId}, (err, roleDetails) => {
                    if(err)
                    {
                        callback(null, {
                            success: 0,
                            message: "error while getting role details!"
                        });
                    }
                    else if(roleDetails)
                    {
                        let currentDate = new Date();
                        currentDate.setHours(0,0,0,0);
                        // console.log(currentDate + "currentDate")
                        // console.log(currentDate.getDate());
                        // console.log(currentDate.getMonth());
                        // console.log(currentDate.getFullYear());
                        // console.log(roleDetails.auditionId.auditionExipires)
                        let expireDate = new Date(roleDetails.auditionId.auditionExipires)
                        // console.log(expireDate + "expireDate")
                        // console.log(roleDetails.auditionId.auditionExipires.getDate());
                        // console.log(roleDetails.auditionId.auditionExipires.getMonth());
                        // console.log(roleDetails.auditionId.auditionExipires.getFullYear());
                        // console.log(expireDate);
                        if(!(roleDetails.auditionId && roleDetails.auditionId.auditionExipires))
                        {
                            callback(null, {
                                success: 0,
                                message: "Audition not available for role"
                            });
                        }
                        else if(expireDate < currentDate)
                        {
                            callback(null, {
                                success: 0,
                                message: "Audition expired"
                            });
                        }
                        else{
                            let gender = roleDetails.gender;
                            let ageStart = roleDetails.ageStart;
                            let ageEnd = roleDetails.ageEnd;
                            let roleType = roleDetails.roleType;
                            auditionProfileModel.findById(ObjectId(applyAuditionsObj.auditionProfileId),(err,auditionProfileObject)=>{
                                if(err)
                                {
                                    callback(null, {
                                        success: 0,
                                        message: "Error while finding audition profile details!"
                                    });
                                }
                                else if(!auditionProfileObject)
                                {
                                    callback(null, {
                                        success: 0,
                                        message: "Unable to find audition profile!"
                                    });
                                }
                                else{
                                    let isRole = auditionProfileObject.skills.some((skill)=>{
                                        return skill == roleType
                                    })
                                    if(((( auditionProfileObject.ageStart >= parseInt(ageStart)  && 
                                    ( auditionProfileObject.ageStart <= parseInt(ageEnd) ))) ||
                                    (( auditionProfileObject.ageEnd >= parseInt(ageStart) )) &&
                                    (( auditionProfileObject.ageEnd <= parseInt(ageEnd) )) ||
                                    (( auditionProfileObject.ageStart <= parseInt(ageStart) )) &&
                                    (( auditionProfileObject.ageEnd >= parseInt(ageEnd) ))
                                    )
                                     && (auditionProfileObject.gender==gender) && isRole)
                                    {
                                        var newApplyAuditionsObj = new applyAuditions({
                                            auditionId: applyAuditionsObj.auditionId,
                                            memberId: applyAuditionsObj.memberId,
                                            roleId: applyAuditionsObj.roleId,
                                            auditionProfileId: applyAuditionsObj.auditionProfileId,
                                            imageUrl: applyAuditionsObj.imageUrl,
                                            videoUrl: applyAuditionsObj.videoUrl,
                                            documentUrl: applyAuditionsObj.documentUrl,
                                            status: applyAuditionsObj.status,
                                            createdBy: applyAuditionsObj.createdBy,
                                            updatedBy: applyAuditionsObj.updatedBy,
                                            attachment: applyAuditionsObj.attachment
                                        });
                                        applyAuditions.create(newApplyAuditionsObj, (err, createdApplyAuditionsObj) => {
                                            if (!err)
                                                callback(null, createdApplyAuditionsObj);
                                            else
                                                callback(err, null);
                                        });
                                    }
                                    else{
                                        callback(null, {
                                            success: 0,
                                            message: "Your profile does not match the role to apply"
                                        });
                                    }
                                }
                            })
                        }
                    }
                    else{
                        callback(null, {
                            success: 0,
                            message: "Unable to find role details!"
                        });
                    }
                }).populate('auditionId')
            }


        }
    });
}

var updateApplyAuditions = (applyAuditionsId, applyAuditionsObj, callback)=> {
    applyAuditions.findByIdAndUpdate(applyAuditionsId, applyAuditionsObj, (err, updateapplyAuditionsObj) => {
        if (!err)
            callback(null, updateapplyAuditionsObj);
        else
            callback(err, null);
    });
}

//get content details by applyAuditions id
var findApplyAuditionsById = (applyAuditionsId, cb) =>{
    applyAuditions.findById({
        _id: applyAuditionsId
    }, (err, applyAuditionsDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, applyAuditionsDetailsObj);
        }
    });
}

var findTotalCountOfApplyAudition = (ids, callback)=> {
    applyAuditions.find({ auditionId: { $in: ids } }, (err, listOfApplyAudition) => {
        if (!err)
            callback(null, listOfApplyAudition);
        else
            callback(err, null)
    })
}


var findTotalCountOfApplyForRole = (ids, callback)=> {
    applyAuditions.find({ roleId: { $in: ids } }, (err, listOfApplyRoles) => {
        if (!err)
            callback(null, listOfApplyRoles);
        else
            callback(err, null)
    })
}

//Old code for findAllMemberDetailsById giving only for auditionid START
// var findAllMemberDetailsById = (auditionId, callback)=> {
//     applyAuditions.aggregate([
//         {
//             $match: { $and: [{ auditionId: auditionId }] }
//         },
//         {
//             $lookup: {
//                 from: "auditionsProfiles",
//                 localField: "auditionProfileId",
//                 foreignField: "_id",
//                 as: "memberProfile"
//             }
//         },
//         {
//             $match: { $and: [{ memberProfile: { $ne: [] } }] }
//         },
//         { "$unwind": "$memberProfile" },
//         {
//             $project: {
//                 _id: 1,
//                 createdBy: 1,
//                 "memberProfile._id": 1,
//                 "memberProfile.bodyType":1,
//                 "memberProfile.createdAt": 1,
//                 "memberProfile.dob": 1,
//                 "memberProfile.ethnicity": 1,
//                 "memberProfile.gender": 1,
//                 "memberProfile.height": 1,
//                 "memberProfile.memberId": 1,
//                 "memberProfile.mobileNumber": 1,
//                 "memberProfile.profilePicUrl": 1,
//                 "memberProfile.firstName": 1,
//                 "memberProfile.lastName": 1,
//                 "memberProfile.screenName": 1,
//                 "memberProfile.skills": 1,
//                 "memberProfile.weight": 1

//             }
//         }, {
//             $sort: {
//                 createdAt: -1
//             }
//         }
//     ], (err, listOfApplyAuditionObj)=> {
//        // console.log(listOfApplyAuditionObj)
//         if (!err)
//             callback(null, listOfApplyAuditionObj);
//         else
//             callback(err, null);
//     });
// }
//Old code for findAllMemberDetailsById giving only for auditionid END

//NEW code for findAllMemberDetailsById grouping  by roleid START
var findAllMemberDetailsById = (auditionId, callback)=> {
    applyAuditions.aggregate([
        {
            $match: { $and: [{ auditionId: auditionId }] }
        },
        {
            $lookup: {
                from: "auditionsProfiles",
                localField: "auditionProfileId",
                foreignField: "_id",
                as: "memberProfile"
            }
        },
        {
            $lookup: {
                from: "role",
                localField: "roleId",
                foreignField: "_id",
                as: "roleId"
            }
        },
        {
            $match: { $and: [{ memberProfile: { $ne: [] } }] }
        },
        { "$unwind": "$memberProfile" },
        {
            $group:{
                _id : "$roleId",
                memberProfile:{
                    $push:{
                        _id : "$memberProfile._id",
                        bodyType : "$memberProfile.bodyType",                        
                        createdAt : "$memberProfile.createdAt",
                        dob : "$memberProfile.dob",
                        ethnicity  :"$memberProfile.ethnicity",
                        gender :"$memberProfile.gender",                        
                        height :"$memberProfile.height",
                        memberId:"$memberProfile.memberId",
                        mobileNumber:"$memberProfile.mobileNumber",
                        profilePicUrl:"$memberProfile.profilePicUrl",
                        firstName:"$memberProfile.firstName"  ,                     
                        lastName:"$memberProfile.lastName",
                        screenName:"$memberProfile.screenName",
                        skills:"$memberProfile.skills",
                        weight:"$memberProfile.weight",
                        applyAuditionId:"$_id"
                    }
                }
            }
        },
        {
            $unwind:"$_id"
        },
        {
            $project: {
                _id: 1,
                createdBy: 1,
                auditionId:1,
                roleId:1,
                "memberProfile._id": 1,
                "memberProfile.bodyType":1,
                "memberProfile.createdAt": 1,
                "memberProfile.dob": 1,
                "memberProfile.ethnicity": 1,
                "memberProfile.gender": 1,
                "memberProfile.height": 1,
                "memberProfile.memberId": 1,
                "memberProfile.mobileNumber": 1,
                "memberProfile.profilePicUrl": 1,
                "memberProfile.firstName": 1,
                "memberProfile.lastName": 1,
                "memberProfile.screenName": 1,
                "memberProfile.skills": 1,
                "memberProfile.weight": 1,
                "memberProfile.applyAuditionId": 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ], (err, listOfApplyAuditionObj)=> {
       // console.log(listOfApplyAuditionObj)
        if (!err)
            callback(null, listOfApplyAuditionObj);
        else
            callback(err, null);
    });
}
//NEW code for findAllMemberDetailsById grouping  by roleid ENd

applyAuditions.find({ memberId: ObjectId("5bace25de4ca7e39085b4ff5") }).populate({
    path: 'roleId',
    match: {
        "roleType" : "Musician"
    }
  }).exec((err, users)=> {
    users = users.filter((user)=> {
      return user.roleName; // return only users with email matching 'type: "Gmail"' query
    });
    // console.log(users);
  });
var findAllApplyAuditionByMemberId = (memberId, callback) =>{
    applyAuditions.aggregate([
        {
            $match: { $and: [{ memberId: memberId }] }
        },
        {
            $lookup: {
                from: "role",
                localField: "roleId",
                foreignField: "_id",
                as: "rolenDetails"
            }
        },
        { "$unwind": "$rolenDetails" },
        {
            $lookup: {
                from: "audition",
                localField: "rolenDetails.auditionId",
                foreignField: "_id",
                as: "auditionDetails"
            }
        },
        //{ "$unwind": "$auditionDetails" },
        { "$unwind": "$auditionDetails" },
        {
            $sort: {
                createdAt: -1
            }
        }
    ],(err, listOfMemberApplyAuditionObj)=>{
        if (!err)
            callback(null, listOfMemberApplyAuditionObj);
        else
            callback(err, null);
    })
}

//admin
var findAllMemberDetailsApplyForAudition = (roleId, callback)=> {
    applyAuditions.aggregate([
        {
            $match: { $and: [{ roleId: ObjectId(roleId) }] }
        },
        {
            $lookup: {
                from: "auditionsProfiles",
                localField: "auditionProfileId",
                foreignField: "_id",
                as: "memberProfile"
            }
        },
        { "$unwind": "$memberProfile" },
        {
            $project: {
                _id: 1,
                createdBy: 1,
                "memberProfile._id": 1,
                "memberProfile.bodyType":1,
                "memberProfile.createdAt": 1,
                "memberProfile.dob": 1,
                "memberProfile.ethnicity": 1,
                "memberProfile.gender": 1,
                "memberProfile.height": 1,
                "memberProfile.memberId ": 1,
                "memberProfile.mobileNumber ": 1,
                "memberProfile.profilePicUrl ": 1,
                "memberProfile.firstName": 1,
                "memberProfile.lastName": 1,
                "memberProfile.screenName": 1,
                "memberProfile.skills": 1,
                "memberProfile.weight": 1

            }
        }, {
            $sort: {
                createdAt: -1
            }
        }
    ], (err, listOfMemberApplyAuditionObjs)=> {
        if (!err)
            callback(null, listOfMemberApplyAuditionObjs);
        else
            callback(err, null);
    })
}

var getAllMemberForApplyAuditionByRoleIdWithLimit = (params, callback)=> {
    let createdAt = params.createdAt;
    let getDataByTime = new Date();
    if(createdAt!="null" && createdAt!="0"){
        getDataByTime = createdAt
    }
    let limit = parseInt(params.limit)
    let roleId = (params.role_Id) ? params.role_Id : '';
    applyAuditions.aggregate([
        {
            $match: { roleId: ObjectId(roleId),createdAt:{ $lt: new Date(getDataByTime) } }
        },
        { $sort: { createdAt: -1 } },
        {
            $limit:limit
        },
        {
            $lookup: {
                from: "auditionsProfiles",
                localField: "auditionProfileId",
                foreignField: "_id",
                as: "memberProfile"
            }
        },
        { "$unwind": "$memberProfile" },
        {
            $project: {
                _id: 1,
                createdBy: 1,
                createdAt:1,
                "memberProfile._id": 1,
                "memberProfile.bodyType":1,
                "memberProfile.createdAt": 1,
                "memberProfile.dob": 1,
                "memberProfile.ethnicity": 1,
                "memberProfile.gender": 1,
                "memberProfile.height": 1,
                "memberProfile.memberId ": 1,
                "memberProfile.mobileNumber ": 1,
                "memberProfile.profilePicUrl ": 1,
                "memberProfile.firstName": 1,
                "memberProfile.lastName": 1,
                "memberProfile.screenName": 1,
                "memberProfile.skills": 1,
                "memberProfile.weight": 1

            }
        }
    ], (err, listOfMemberApplyAuditionObjs)=> {
        if (!err)
            callback(null, listOfMemberApplyAuditionObjs);
        else
            callback(err, null);
    })
}



var applyAuditionsServices = {
    saveApplyAuditions: saveApplyAuditions,
    updateApplyAuditions: updateApplyAuditions,
    findApplyAuditionsById: findApplyAuditionsById,
    findTotalCountOfApplyAudition: findTotalCountOfApplyAudition,
    findTotalCountOfApplyForRole: findTotalCountOfApplyForRole,
    findAllMemberDetailsById: findAllMemberDetailsById,
    findAllApplyAuditionByMemberId: findAllApplyAuditionByMemberId,
    //admin
    findAllMemberDetailsApplyForAudition: findAllMemberDetailsApplyForAudition,
    getAllMemberForApplyAuditionByRoleIdWithLimit:getAllMemberForApplyAuditionByRoleIdWithLimit
}

module.exports = applyAuditionsServices;
