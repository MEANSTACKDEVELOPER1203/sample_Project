//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let audition = require("../auditions/auditionModel");
let role = require("../roles/roleModel");
const Favourite = require('../favorites/favoritesModel');


var saveAudition = (auditionObj, res, callback) => {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let auditionExipires = new Date(auditionObj.auditionExipires);
    if (currentDate > auditionObj.auditionExipires) {
        return res.status(200).json({
            success: 0,
            message: "Please choose a different expiry date."
        });
    }
    else {
        // auditionExipires.setUTCHours(23,59,59,0);
        // console.log("Afetr add time Date ===== ", auditionExipires);
        var auditionObj = new audition({
            memberId: auditionObj.memberId,
            auditionProfileId: (auditionObj.auditionProfileId == "0") ? null : auditionObj.auditionProfileId,
            productionTitle: auditionObj.productionTitle,
            productionType: auditionObj.productionType,
            subProductionType: auditionObj.subProductionType,
            productionCompany: auditionObj.productionCompany,
            productionPersonName: auditionObj.productionPersonName,
            productionDescription: auditionObj.productionDescription,
            startDate: auditionObj.startDate,
            auditionExipires: auditionExipires,
            draftMode: auditionObj.draftMode,
            keywords: auditionObj.keywords,
            role: roleObj,
            createdBy: auditionObj.createdBy,
            updatedBy: auditionObj.updatedBy
        });
        // callback("null", null);
        audition.create(auditionObj, (err, createAuditionObj) => {
            if (!err)
                callback(null, createAuditionObj);
            else
                callback(err, null);
        });
    }

}


var searchAudition = (auditionObj, callback) => {

    var auditionObj = new audition({
        memberId: auditionObj.auditionObj,
        productionTitle: auditionObj.productionTitle,
        productionType: auditionObj.productionType,
        productionCompany: auditionObj.productionCompany,
        productionPersonName: auditionObj.productionPersonName,
        productionDescription: auditionObj.productionDescription,
        startDate: auditionObj.startDate,
        auditionExipires: auditionObj.auditionExipires,
        draftMode: auditionObj.draftMode,
        keywords: auditionObj.keywords,
        role: roleObj,
        createdBy: auditionObj.createdBy,
        updatedBy: auditionObj.updatedBy
    });
    audition.create(auditionObj, (err, createAuditionObj) => {
        if (!err)
            callback(null, createAuditionObj);
        else
            callback(err, null);
    });
}
var updateAudition = (auditionId, auditionObj, res, callback) => {
    // console.log(auditionObj)
    audition.findById(auditionId, (err, auditionObjx) => {
        if (err)
            callback(err, null);
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        let auditionExipires = new Date(auditionObjx.auditionExipires)
        if (auditionObj.auditionExipires) {
            auditionExipires = new Date(auditionObj.auditionExipires)
            // auditionExipires.setHours(23);
            // auditionExipires.setMinutes(00);
            // auditionExipires.setSeconds(00);
            auditionObj.auditionExipires = auditionExipires;
        }

        // console.log(auditionExipires)
        // console.log(currentDate)
        if (currentDate > auditionExipires) {
            return res.status(200).json({
                success: 0,
                message: "Please choose a different expiry date."
            });
        }
        else {
            audition.findByIdAndUpdate(auditionId, auditionObj, { new: true }, (err, updateAuditionObj) => {
                if (!err)
                    callback(null, updateAuditionObj);
                else
                    callback(err, null);
            });
        }
    });
}

//get content details by audition id
var findAuditionById = (auditionId, cb) => {
    // audition.findById({
    //     _id: auditionId
    // }, (err, auditionDetailsObj) => {
    //     if (err) {
    //         return cb(err, null);
    //     } else {
    //         return cb(null, auditionDetailsObj);
    //     }
    // }).lean();

    audition.aggregate(
        [
            {
                $match: {
                    _id: ObjectId(auditionId)
                }
            },
            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionId",
                    as: "roles"
                }
            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionExipires: 1,
                    subProductionType: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    created_at: 1,
                    memberId: 1,
                    isFavorite: 1,
                    "roles._id": 1,
                    "roles.gender": 1,
                    "roles.ageStart": 1,
                    "roles.ageEnd": 1,
                    "roles.ethnicity": 1,
                    "roles.mediaRequired": 1,
                    "roles.roleDescription": 1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionId": 1,
                    "roles.startHeight": 1,
                    "roles.endHeight": 1
                }
            }


        ],
        (err, auditionDetailsObj) => {
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionDetailsObj[0]);
            }



        }
    );
}

//get content details by audition id
var getDraftsByMemberId = (memberId, cb) => {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0)
    let query = {
        $and: [{ memberId: memberId }, { draftMode: "true" }]
    };
    audition.find(query, (err, auditionDetailsObj) => {
        //console.log("tets",auditionDetailsObj)
        if (err) {
            return cb(err, null);
        } else {

            auditionDetailsObj.map((audition) => {
                if (currentDate < audition.auditionExipires) {
                    audition.isExpired = true
                }
                else {
                    audition.isExpired = false
                }
            })
            return cb(null, auditionDetailsObj);
        }
    }).sort({ createdAt: -1 }).lean();
}


// get role by string
var getRoleByString = (text, memberIdOfUser, cb) => {
    Favourite.find({ "isFavorite": true, "memberId": ObjectId(memberIdOfUser), roleId: { $exists: true } }, { roleId: 1 }, (err, fevAudition) => {
        if (err) {
            res.json({ success: 0, message: err })
        } else {
            let searchString = text
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0)
            //let id = req.body.userID;
            //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
            audition.aggregate(
                [
                    {
                        $match: {
                            "draftMode": false
                        }
                    },
                    {
                        $lookup: {
                            from: "role",
                            localField: "_id",
                            foreignField: "auditionId",
                            as: "roles"
                        }
                    },
                    {
                        $lookup: {
                            from: "favorites",
                            localField: "_id",
                            foreignField: "auditionId",
                            as: "favoriteDetails"
                        }
                    },
                    {
                        $lookup: {
                            from: "applyAuditions",
                            localField: "_id",
                            foreignField: "auditionId",
                            as: "auditionApplyDetails"
                        }
                    },
                    //{ "$unwind": "$favoriteDetails" },  
                    {
                        $unwind: "$roles"
                    },
                    {
                        $match: {
                            "roles.roleType": { $regex: searchString, $options: 'i' },
                            // "roles.": { $elemMatch: { roleType: { $regex: searchString, $options: 'i' } } },
                        },
                    },
                    { $sort: { updatedAt: -1 } },
                    {
                        $project: {
                            _id: 1,
                            productionTitle: 1,
                            productionCompany: 1,
                            startDate: 1,
                            auditionExipires: 1,
                            keywords: searchString,
                            productionType: 1,
                            subProductionType: 1,
                            productionPersonName: 1,
                            productionDescription: 1,
                            draftMode: 1,
                            created_at: 1,
                            auditionProfileId: 1,
                            subProductionType: 1,
                            favoritedBy: 1,
                            memberId: 1,
                            isExpired: { $lt: ["$auditionExipires", currentDate] },
                            // roles: {
                            //     $filter: {
                            //         input: '$roles',
                            //         as: 'roles',
                            //         cond: { $eq: ['$$roles.roleType', searchString] }
                            //     }
                            // },
                            // //isFavorite:1,
                            "roles._id": 1,
                            "roles.gender": 1,
                            "roles.ageStart": 1,
                            "roles.ageEnd": 1,
                            "roles.ethnicity": 1,
                            "roles.mediaRequired": 1,
                            "roles.roleDescription": 1,
                            "roles.hairColour": 1,
                            "roles.bodyType": 1,
                            "roles.eyeColour": 1,
                            "roles.roleName": 1,
                            "roles.roleType": 1,
                            "roles.startHeight": 1,
                            "roles.endHeight": 1,
                            "favoriteDetails.auditionId": 1,
                            "favoriteDetails.isFavorite": 1,
                            "auditionApplyDetails.auditionId": 1,
                            "auditionApplyDetails.status": 1,
                            "auditionApplyDetails.roleId": 1,
                            "auditionApplyDetails.createdBy": 1,
                            "roles.auditionId": 1,
                        }
                    }
                ],
                (err, auditionSearchDetailsObj) => {
                    if (err) {
                        return cb(err, null);
                        console.log(err);
                    }
                    else {
                        // let currentDate = new Date();
                        // console.log(fevAudition)
                        auditionSearchDetailsObj = auditionSearchDetailsObj.map((audition) => {

                            if (audition.favoritedBy) {
                                audition.isFavorite = fevAudition.some((fevRole) => {
                                    // console.log(fevRole.roleId)
                                    // console.log(audition.roles._id)
                                    // console.log("*****************************************")
                                    return audition.roles._id.toString() == fevRole.roleId.toString()
                                })
                                // audition.isFavorite = audition.favoritedBy.some((fevorator) => {
                                //     return fevorator.memberId == memberIdOfUser.toString()
                                // })
                            }
                            else {
                                audition.isFavorite == false
                            }
                            // if(audition.auditionExipires < currentDate)
                            // {
                            //     audition.isExpired = true;
                            // }
                            // else{
                            //     audition.isExpired = false;
                            // }
                            return audition;
                        });
                        return cb(null, auditionSearchDetailsObj);
                    }



                }
            );

            //}
        }
    })


}

// get role by string
var getRoleByAllFilters = (roleType, gender, eyeColour, hairColour, bodyType, ethnicity, ageStart, ageEnd, startHeight, endHeight, memberId, cb) => {

    Favourite.find({ "isFavorite": true, "memberId": ObjectId(memberId), roleId: { $exists: true } }, { roleId: 1 }, (err, fevAudition) => {
        if (err) {
            res.json({ success: 0, message: err })
        } else {
            // let eyeColour = eyeColour;
            // let hairColour = hairColour;
            // let bodyType = bodyType;
            //eyeColour = req.body.eyeColour;
            //let gender = gender;
            //let id = req.body.userID;
            var query = [{ "draftMode": false }];
            let queryAfterUnwiind = [];
            var conditionFilter = [];
            var project = {};
            let roleTypeString = roleType;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0)
            if (roleTypeString != null && roleTypeString != "null") {
                query.push({ "roles": { $elemMatch: { roleType: { $regex: roleTypeString, $options: 'i' } } } })
                conditionFilter.push({ $eq: ["$$roles.roleType", roleType] })
                queryAfterUnwiind.push({ "roles.roleType": { $regex: roleType, $options: 'i' } })
            }
            // if (gender != null && gender != "null" && ageStart != null && ageStart != "null" && ageEnd != null && ageEnd != "null") {
            //     // query.push({"roles":{$elemMatch: {gender:{ $regex: /^m/, $options: 'm' }}}})
            //     conditionFilter.push({ $eq: ["$$roles.gender", gender] })
            //     query.push({ "roles.gender": new RegExp("^" + gender.toLowerCase(), "i") });

            // }
            if (gender != null && gender != "null") {
                // query.push({"roles":{$elemMatch: {gender:{ $regex: /^m/, $options: 'm' }}}})
                query.push({ "roles.gender": new RegExp("^" + gender.toLowerCase(), "i") });
                conditionFilter.push({ $eq: ["$$roles.gender", gender] })
                queryAfterUnwiind.push({ "roles.gender": new RegExp("^" + gender.toLowerCase(), "i") })
                // project = {
                //     _id: 1,
                //     productionTitle: 1,
                //     productionCompany: 1,
                //     startDate: 1,
                //     auditionExipires: 1,
                //     keywords: roleTypeString,
                //     productionType: 1,
                //     productionPersonName: 1,
                //     productionDescription: 1,
                //     subProductionType: 1,
                //     draftMode: 1,
                //     created_at: 1,
                //     favoritedBy: 1,
                //     memberId: 1,
                //     isFavorite: 1,
                //     isExpired: { $lt: ["$auditionExipires", currentDate] },
                //     roles: {
                //         $filter: {
                //             input: '$roles',
                //             as: 'roles',
                //             // cond: {$eq: ['$$roles.gender', gender]}
                //             cond: {
                //                 $and: [
                //                     { $eq: ["$$roles.roleType", roleType] },
                //                     { $eq: ["$$roles.gender", gender] }
                //                 ]
                //             }
                //         }
                //     }
                // }
            }
            // else {
            // project = {
            //     _id: 1,
            //     productionTitle: 1,
            //     productionCompany: 1,
            //     startDate: 1,
            //     auditionExipires: 1,
            //     keywords: roleTypeString,
            //     productionType: 1,
            //     productionPersonName: 1,
            //     productionDescription: 1,
            //     subProductionType: 1,
            //     draftMode: 1,
            //     created_at: 1,
            //     favoritedBy: 1,
            //     memberId: 1,
            //     isFavorite: 1,
            //     isExpired: { $lt: ["$auditionExipires", currentDate] },
            //     roles: {
            //         $filter: {
            //             input: '$roles',
            //             as: 'roles',
            //             // cond: {$eq: ['$$roles.gender', gender]}
            //             cond: {
            //                 $and: [
            //                     { $eq: ["$$roles.roleType", roleType] }
            //                     // { $eq: [ "$$roles.gender", gender ] }
            //                 ]
            //             }
            //         }
            //     }
            // }
            // }
            if (bodyType != null && bodyType != "null") {
                query.push({ "roles.bodyType": { $regex: bodyType, $options: 'i' } });
                conditionFilter.push({ $eq: ["$$roles.bodyType", bodyType] })
                queryAfterUnwiind.push({ "roles.bodyType": { $regex: bodyType, $options: 'i' } })
            }
            if (hairColour != null && hairColour != "null") {
                query.push({ "roles.hairColour": { $regex: hairColour, $options: 'i' } });
                conditionFilter.push({ $eq: ["$$roles.hairColour", hairColour] })
                queryAfterUnwiind.push({ "roles.hairColour": { $regex: hairColour, $options: 'i' } });
            }
            if (eyeColour != null && eyeColour != "null") {
                query.push({ "roles.eyeColour": { $regex: eyeColour, $options: 'i' } });
                conditionFilter.push({ $eq: ["$$roles.eyeColour", eyeColour] })
                queryAfterUnwiind.push({ "roles.eyeColour": { $regex: eyeColour, $options: 'i' } });
            }
            if (ethnicity != null && ethnicity != "null") {
                query.push({ "roles.ethnicity": { $regex: "^" + ethnicity, $options: 'i' } });
                conditionFilter.push({ $eq: ["$$roles.ethnicity", ethnicity] })
                queryAfterUnwiind.push({ "roles.ethnicity": { $regex: "^" + ethnicity, $options: 'i' } });
            }
            // if (ageStart != null && ageStart != "null") {
            //     query.push({ "roles.ageStart": { $gte: parseInt(ageStart) } });
            // }
            // if (ageEnd != null && ageEnd != "null") {
            //     query.push({ "roles.ageEnd": { $lte: parseInt(ageEnd) } });
            // }
            // if (startHeight != null && startHeight != "null") {
            //     query.push({ "roles.startHeight": { $gte: parseInt(startHeight) } });
            // }
            // if (endHeight != null && endHeight != "null") {
            //     query.push({ "roles.endHeight": { $lte: parseInt(endHeight) } });
            // }
            if ((ageStart != null && ageStart != "null") || (ageEnd != null && ageEnd != "null")) {
                query.push({

                    // $or: [
                    //     { $and: [{ "roles.ageStart": { $gte: parseInt(ageStart) } }, { "roles.ageStart": { $lte: parseInt(ageEnd) } }] },
                    //     { $and: [{ "roles.ageEnd": { $gte: parseInt(ageStart) } }, { "roles.ageEnd": { $lte: parseInt(ageEnd) } }] }
                    // ]
                    $or: [
                        {
                            $and: [
                                { "roles.ageStart": { $gte: parseInt(ageStart) } },
                                { "roles.ageStart": { $lte: parseInt(ageEnd) } }
                            ]
                        },
                        {
                            $and: [
                                { "roles.ageEnd": { $gte: parseInt(ageStart) } },
                                { "roles.ageEnd": { $lte: parseInt(ageEnd) } }
                            ],

                        },
                        {
                            $and: [
                                { "roles.ageStart": { $lte: parseInt(ageStart) } },
                                { "roles.ageEnd": { $gte: parseInt(ageEnd) } }
                            ]
                        }
                    ]
                })
                queryAfterUnwiind.push({

                    // $or: [
                    //     { $and: [{ "roles.ageStart": { $gte: parseInt(ageStart) } }, { "roles.ageStart": { $lte: parseInt(ageEnd) } }] },
                    //     { $and: [{ "roles.ageEnd": { $gte: parseInt(ageStart) } }, { "roles.ageEnd": { $lte: parseInt(ageEnd) } }] }
                    // ]
                    $or: [
                        {
                            $and: [
                                { "roles.ageStart": { $gte: parseInt(ageStart) } },
                                { "roles.ageStart": { $lte: parseInt(ageEnd) } }
                            ]
                        },
                        {
                            $and: [
                                { "roles.ageEnd": { $gte: parseInt(ageStart) } },
                                { "roles.ageEnd": { $lte: parseInt(ageEnd) } }
                            ],

                        },
                        {
                            $and: [
                                { "roles.ageStart": { $lte: parseInt(ageStart) } },
                                { "roles.ageEnd": { $gte: parseInt(ageEnd) } }
                            ]
                        }
                    ]
                })
                conditionFilter.push({
                    $or: [
                        { $and: [{ $gte: ["$$roles.ageStart", parseInt(ageStart)] }, { $lte: ["$$roles.ageStart", parseInt(ageEnd)] }] },
                        { $and: [{ $gte: ["$$roles.ageEnd", parseInt(ageStart)] }, { $lte: ["$$roles.ageEnd", parseInt(ageEnd)] }] },
                        { $and: [{ $lte: ["$$roles.ageStart", parseInt(ageStart)] }, { $gte: ["$$roles.ageEnd", parseInt(ageEnd)] }] }
                    ]
                })
            }
            if ((startHeight != null && startHeight != "null") || (endHeight != null && endHeight != "null")) {
                query.push({
                    // $or: [
                    //     { $and: [{ "roles.startHeight": { $gte: parseInt(startHeight) } }, { "roles.startHeight": { $lte: parseInt(endHeight) } }] },
                    //     { $and: [{ "roles.endHeight": { $gte: parseInt(startHeight) } }, { "roles.endHeight": { $lte: parseInt(endHeight) } }] },
                    // ]
                    $or: [
                        {
                            $and: [
                                { "roles.startHeight": { $gte: parseInt(startHeight) } },
                                { "roles.startHeight": { $lte: parseInt(endHeight) } }
                            ]
                        },
                        {
                            $and: [
                                { "roles.endHeight": { $gte: parseInt(startHeight) } },
                                { "roles.endHeight": { $lte: parseInt(endHeight) } }
                            ],

                        },
                        {
                            $and: [
                                { "roles.startHeight": { $lte: parseInt(startHeight) } },
                                { "roles.endHeight": { $gte: parseInt(endHeight) } }
                            ]
                        }
                    ]
                });
                queryAfterUnwiind.push({
                    // $or: [
                    //     { $and: [{ "roles.startHeight": { $gte: parseInt(startHeight) } }, { "roles.startHeight": { $lte: parseInt(endHeight) } }] },
                    //     { $and: [{ "roles.endHeight": { $gte: parseInt(startHeight) } }, { "roles.endHeight": { $lte: parseInt(endHeight) } }] },
                    // ]
                    $or: [
                        {
                            $and: [
                                { "roles.startHeight": { $gte: parseInt(startHeight) } },
                                { "roles.startHeight": { $lte: parseInt(endHeight) } }
                            ]
                        },
                        {
                            $and: [
                                { "roles.endHeight": { $gte: parseInt(startHeight) } },
                                { "roles.endHeight": { $lte: parseInt(endHeight) } }
                            ],

                        },
                        {
                            $and: [
                                { "roles.startHeight": { $lte: parseInt(startHeight) } },
                                { "roles.endHeight": { $gte: parseInt(endHeight) } }
                            ]
                        }
                    ]
                });
                conditionFilter.push({
                    $or: [
                        { $and: [{ $gte: ["$$roles.startHeight", parseInt(startHeight)] }, { $lte: ["$$roles.startHeight", parseInt(endHeight)] }] },
                        { $and: [{ $gte: ["$$roles.endHeight", parseInt(startHeight)] }, { $lte: ["$$roles.endHeight", parseInt(endHeight)] }] },
                        { $and: [{ $lte: ["$$roles.startHeight", parseInt(startHeight)] }, { $gte: ["$$roles.endHeight", parseInt(endHeight)] }] },
                    ]
                })
                // query.push({$or:[{ "roles.startHeight": { $gte: parseInt(startHeight) } },
                // { "roles.startHeight": { $lte: parseInt(endHeight) } },
                // { "roles.endHeight": { $lte: parseInt(endHeight) } }]});
            }
            // console.log(queryAfterUnwiind)
            if (query.length == 0) {
                return cb(null, [])
            }
            else {
                project = {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionExipires: 1,
                    keywords: roleTypeString,
                    productionType: 1,
                    productionPersonName: 1,
                    productionDescription: 1,
                    subProductionType: 1,
                    draftMode: 1,
                    created_at: 1,
                    favoritedBy: 1,
                    memberId: 1,
                    isFavorite: 1,
                    isExpired: { $lt: ["$auditionExipires", currentDate] },
                    // roles: {
                    //     $filter: {
                    //         input: '$roles',
                    //         as: 'roles',
                    //         // cond: {$eq: ['$$roles.gender', gender]}
                    //         cond: {
                    //             $and: conditionFilter
                    //         }
                    //     }
                    // }
                    roles: 1
                }

                // console.log(project)
                audition.aggregate(
                    [

                        {
                            $lookup: {
                                from: "role",
                                localField: "_id",
                                foreignField: "auditionId",
                                as: "roles"
                            }
                        },
                        {
                            $match: { $and: query },
                        },
                        {
                            $unwind: "$roles"
                        },
                        {
                            $match: { $and: queryAfterUnwiind }
                        },
                        { $sort: { updatedAt: -1 } },
                        {
                            $project: project
                        }


                    ], (err, auditionSearchByAllFilterDetailsObj) => {
                        if (err) {
                            return cb(err, null);
                            console.log(err);
                        }
                        else {
                            // console.log(auditionSearchByAllFilterDetailsObj)
                            auditionSearchByAllFilterDetailsObj = auditionSearchByAllFilterDetailsObj.filter((audition) => {
                                if (audition.favoritedBy) {
                                    // audition.isFavorite = audition.favoritedBy.some((fevorator) => {
                                    //     return fevorator.memberId == memberId.toString()
                                    // })
                                    audition.isFavorite = fevAudition.some((fevRole) => {
                                        // console.log(fevRole.roleId)
                                        // console.log(audition.roles._id)
                                        // console.log("*****************************************")
                                        return audition.roles._id.toString() == fevRole.roleId.toString()
                                    })
                                }
                                else {
                                    audition.isFavorite == false
                                }
                                let filter = false;
                                if (audition.roles) {
                                    filter = true;
                                } else {
                                    filter = false;
                                }

                                if (filter)
                                    return audition;
                            })
                            return cb(null, auditionSearchByAllFilterDetailsObj);
                        }
                    }
                );
            }


            //console.log(query)


            //}
        }
    });

}

//get search
var getHairColourByString1 = (gender, eyeColour, hairColour, bodyType, ethnicity, ageStart, ageEnd, cb) => {
    // let eyeColour = eyeColour;
    // let hairColour = hairColour;
    // let bodyType = bodyType;
    //eyeColour = req.body.eyeColour;
    //let gender = gender;
    //let id = req.body.userID;
    var query = [];
    if (gender != null && gender != "null") {
        query.push({ gender: gender });
    }
    if (bodyType != null && bodyType != "null") {
        query.push({ bodyType: { $regex: bodyType, $options: 'i' } });
    }
    if (hairColour != null && hairColour != "null") {
        query.push({ hairColour: { $regex: hairColour, $options: 'i' } });
    }
    if (eyeColour != null && eyeColour != "null") {
        query.push({ eyeColour: { $regex: eyeColour, $options: 'i' } });
    }
    if (ethnicity != null && ethnicity != "null") {
        query.push({ ethnicity: { $regex: ethnicity, $options: 'i' } });
    }
    // if (ageStart != null && ageStart != "null") {
    //     query.push({ ageStart: { $gte: parseInt(ageStart) } });
    // }
    // if (ageEnd != null && ageEnd != "null") {
    //     query.push({ ageEnd: { $lte: parseInt(ageEnd) } });
    // }
    if ((ageStart != null && ageStart != "null") || (ageEnd != null && ageEnd != "null")) {
        query.push({ $and: [{ "roles.ageStart": { $gte: parseInt(ageStart) } }, { "roles.ageEnd": { $lte: parseInt(ageEnd) } }] });
    }
    if (query.length == 0) {
        return cb(null, [])
    }
    else {
        role.aggregate(
            [

                {
                    $lookup: {
                        from: "audition",
                        localField: "roleName",
                        foreignField: "role.roleName",
                        as: "roles"
                    }
                },
                {
                    $match: { $and: query },

                },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        "roles._id": 1,
                        "roles.productionTitle": 1,
                        "roles.productionCompany": 1,
                        "roles.startDate": 1,
                        "roles.auditionExipires": 1,
                        "roles.keywords": 1,
                        "roles.productionType": 1,
                        "roles.productionPersonName": 1,
                        "roles.productionDescription": 1,
                        "roles.draftMode": 1,
                        "roles.created_at": 1,
                        "roles.memberId": 1,
                        "roles.startHeight": 1,
                        "roles.endHeight": 1,
                        _id: 1,
                        gender: 1,
                        ageStart: 1,
                        ageEnd: 1,
                        ethnicity: 1,
                        mediaRequired: 1,
                        roleDescription: 1,
                        hairColour: 1,
                        bodyType: 1,
                        eyeColour: 1,
                        roleName: 1,
                        roleType: 1,
                        auditionId: 1,
                        isFavorite: 1
                    }
                }


            ],
            (err, auditionSearchByHairColourDetailsObj) => {
                if (err) {
                    return cb(err, null);
                    console.log(err);
                }
                else {
                    //console.log(auditionSearchByHairColourDetailsObj);
                    return cb(null, auditionSearchByHairColourDetailsObj);
                }



            }
        );
    }
    //console.log(query)


    //}
}

// get BodyType by string
var getBodyTypeByString = (text, cb) => {
    let searchString = text
    //let id = req.body.userID;
    //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    audition.aggregate(
        [

            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionId",
                    as: "roles"
                }
            },
            {
                $match: {
                    "roles.bodyType": { $regex: searchString, $options: 'i' }
                },

            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionExipires: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    subProductionType: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    created_at: 1,
                    isFavorite: 1,
                    "roles._id": 1,
                    "roles.gender": 1,
                    "roles.ageStart": 1,
                    "roles.ageEnd": 1,
                    "roles.ethnicity": 1,
                    "roles.mediaRequired": 1,
                    "roles.roleDescription": 1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionId": 1,
                    "roles.startHeight": 1,
                    "roles.endHeight": 1
                }
            }


        ],
        (err, auditionSearchByBodyTypeDetailsObj) => {
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionSearchByBodyTypeDetailsObj);
            }



        }
    );

    //}
}

// get keywords by string
var getKeywordsByString = (text, cb) => {
    let searchString = text
    //let id = req.body.userID;
    //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    audition.aggregate(
        [

            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionId",
                    as: "roles"
                }
            },
            {
                $match: {
                    keywords: { $regex: searchString, $options: 'i' }
                },

            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionExipires: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    created_at: 1,
                    subProductionType: 1,
                    isFavorite: 1,
                    "roles._id": 1,
                    "roles.gender": 1,
                    "roles.ageStart": 1,
                    "roles.ageEnd": 1,
                    "roles.ethnicity": 1,
                    "roles.mediaRequired": 1,
                    "roles.roleDescription": 1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionId": 1,
                    "roles.startHeight": 1,
                    "roles.endHeight": 1
                }
            }


        ],
        (err, auditionSearchByKeywordsDetailsObj) => {
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionSearchByKeywordsDetailsObj);
            }



        }
    );

    //}
}

// get eyeColour by string
var getEyeColourByString = (text, cb) => {
    let searchString = text
    //let id = req.body.userID;
    //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    audition.aggregate(
        [
            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionId",
                    as: "roles"
                }
            },
            {
                $match: {
                    "roles.eyeColour": { $regex: searchString, $options: 'i' }
                },

            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionExipires: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    created_at: 1,
                    subProductionType: 1,
                    isFavorite: 1,
                    "roles._id": 1,
                    "roles.gender": 1,
                    "roles.ageStart": 1,
                    "roles.ageEnd": 1,
                    "roles.ethnicity": 1,
                    "roles.mediaRequired": 1,
                    "roles.roleDescription": 1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionId": 1,
                    "roles.startHeight": 1,
                    "roles.endHeight": 1
                }
            }


        ],
        (err, auditionSearchByEyeColourDetailsObj) => {
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionSearchByEyeColourDetailsObj);
            }



        }
    );

    //}
}

var findAuditionByMemberId = (memberId, callback) => {
    audition.find({ memberId: memberId, draftMode: false }, (err, listOfAuditionObj) => {
        if (!err)
            callback(null, listOfAuditionObj);
        else
            callback(err, null)
    }).sort({ updatedAt: -1 }).lean();
}

var findAllAudition = (callback) => {
    audition.find((err, listOfAuditionObj) => {
        if (!err)
            callback(null, listOfAuditionObj);
        else
            callback(err, null);
    }).sort({ createdAt: -1 });
}


var getAllAuditionByLimit = (params, callback) => {
    let pageNo = parseInt(params.pageNo);
    let startFrom = params.limit * (pageNo - 1);
    let limit = parseInt(params.limit);
    audition.count({}, (err, count) => {
        if (err) {
            callback(err, null);
        }
        else {
            audition.find({}, (err, listOfAuditionObj) => {
                if (err) {
                    callback(err, null);
                }
                else {
                    let data = {};
                    data.result = listOfAuditionObj
                    let total_pages = count / limit
                    let div = count % limit;
                    data.pagination = {
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages) + 1,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null, data);
                }
            }).skip(startFrom).limit(limit).sort({ createdAt: -1 })
        }
    })
}

var getAllFavouriteAuditions = (callback) => {


    // audition.find({isFavorite:true},(err, listOfFavouriteAuditionObj) => {
    //     if (!err)
    //         callback(null, listOfFavouriteAuditionObj);
    //     else
    //         callback(err, null);
    // }).sort({ createdAt: -1 });

    audition.aggregate(
        [
            {
                $match: {
                    isFavorite: true
                }
            },
            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionId",
                    as: "role"
                }
            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionExipires: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    subProductionType: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    created_at: 1,
                    memberId: 1,
                    isFavorite: 1,
                    "role._id": 1,
                    "role.gender": 1,
                    "role.ageStart": 1,
                    "role.ageEnd": 1,
                    "role.ethnicity": 1,
                    "role.mediaRequired": 1,
                    "role.roleDescription": 1,
                    "role.hairColour": 1,
                    "role.bodyType": 1,
                    "role.eyeColour": 1,
                    "role.roleName": 1,
                    "role.roleType": 1,
                    "role.auditionId": 1,
                    "role.startHeight": 1,
                    "role.endHeight": 1,
                    "role.ageRange": 1,
                    "role.height": 1
                }
            }


        ],
        (err, auditionDetailsObj) => {
            if (err) {
                return callback(err, null);
                console.log(err);
            }
            else {
                //console.log(data);

                return callback(null, auditionDetailsObj);
            }

        });
}

var findAuditionAndRolesByIds = (auditionId, roleId, memberId, callback) => {

    Favourite.find({ "isFavorite": true, "memberId": ObjectId(memberId), roleId: { $exists: true } }, { roleId: 1 }, (err, fevAudition) => {
        if (err) {
            res.json({ success: 0, message: err })
        } else {
            let auditionObjJson = {}, roleArray = [];
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0)
            audition.findById(ObjectId(auditionId), { role: 0 }, (err, auditionObj) => {
                if (err)
                    callback(err, null);
                else {
                    role.findById(ObjectId(roleId), (err, roleObj) => {
                        if (err) {
                            console.log(err)
                        } else {
                            auditionObjJson = auditionObj;
                            // roleArray.push(roleObj);
                            auditionObjJson.role = roleObj;
                            if (auditionObjJson.favoritedBy.length && auditionObjJson.role) {
                                // auditionObjJson.isFavorite = auditionObjJson.favoritedBy.some((fevorator) => {
                                //     return fevorator.memberId == memberId.toString()
                                // })
                                // console.log(fevAudition)
                                auditionObjJson.isFavorite = fevAudition.some((fevRole) => {
                                    // console.log(fevRole.roleId)
                                    // console.log(audition.role._id)
                                    // console.log("*****************************************")
                                    return auditionObjJson.role._id.toString() == fevRole.roleId.toString()
                                })
                            }
                            else {
                                audition.isFavorite == false
                            }
                            if (auditionObjJson.auditionExipires < currentDate) {
                                auditionObjJson.isExpired = true;
                            }
                            else {
                                auditionObjJson.isExpired = false;
                            }
                            callback(null, auditionObjJson)
                        }

                    }).lean()
                }
            }).lean()
        }
    });
}



var auditionServices = {
    saveAudition: saveAudition,
    updateAudition: updateAudition,
    findAuditionById: findAuditionById,
    getRoleByString: getRoleByString,
    getRoleByAllFilters: getRoleByAllFilters,
    getBodyTypeByString: getBodyTypeByString,
    getKeywordsByString: getKeywordsByString,
    getEyeColourByString: getEyeColourByString,
    findAuditionByMemberId: findAuditionByMemberId,
    getDraftsByMemberId: getDraftsByMemberId,
    findAllAudition: findAllAudition,
    getHairColourByString1: getHairColourByString1,
    findAuditionAndRolesByIds: findAuditionAndRolesByIds,
    getAllFavouriteAuditions: getAllFavouriteAuditions,
    getAllAuditionByLimit: getAllAuditionByLimit
}

module.exports = auditionServices;
