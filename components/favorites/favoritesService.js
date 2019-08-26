//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let favorites = require("../favorites/favoritesModel");
let role = require("../roles/roleModel");
let Audition = require('../auditions/auditionModel');

var savefavorites = (favoritesObj, callback)=>{
    var favoritesObj = new favorites({
        auditionProfileId: favoritesObj.auditionProfileId,
        memberId: favoritesObj.memberId,
        roleId:favoritesObj.roleId,
        auditionId: favoritesObj.auditionId,
        isFavorite: true,
        createdBy: favoritesObj.createdBy,
        updatedBy: favoritesObj.updatedBy
    });
    favorites.create(favoritesObj, (err, createfavoritesObj) => {
        if (!err)
            callback(null, createfavoritesObj);
        else
            callback(err, null);
    });
}

var updatefavorites = function (favoritesId, favoritesObj, callback) {
    favorites.findByIdAndUpdate(favoritesId, { $set: { isFavorite: favoritesObj.isFavorite } },{new:true},(err, updatefavoritesObj) => {
        if (!err)
            callback(null, updatefavoritesObj);
        else
            callback(err, null);
    });
}

//get content details by favorites id
var findfavoritesById = function (favoritesId, cb) {
    favorites.findById({
        _id: favoritesId
    }, (err, favoritesDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, favoritesDetailsObj);
        }
    });
}
var findFavoriteByAuditionId = function (reqbody, callback) {
    favorites.findOne({ auditionProfileId: ObjectId(reqbody.auditionProfileId),roleId: ObjectId(reqbody.roleId),auditionId: ObjectId(reqbody.auditionId) }, (err, listOfMyFavoriteObj) => {
        if (!err)
            callback(null, listOfMyFavoriteObj);
        else
            callback(err, null);
    });
}
var checkFavorite = function (reqbody, callback) {
    role.find({ auditionId: ObjectId(reqbody.auditionId) }, function (err, listOfRoleObj) {
        if (!err)
            callback(null, listOfRoleObj);
        else {
            callback(err, null);
        }
    }).lean();
}

//get content details by favorites id
var getDraftsByMemberId = function (memberId, cb) {
    let query = {
        $and: [{ memberId: memberId }, { draftMode: "true" }]
    };
    favorites.find(query, (err, favoritesDetailsObj) => {
        //console.log("tets",favoritesDetailsObj)
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, favoritesDetailsObj);
        }
    }).sort({ createdAt: -1 });
}

var findAllMemberDetailsById = function (memberId, callback) {
    favorites.aggregate([
        {
            $match: { $and: [{ memberId: memberId }] }
        },
        {
            $lookup: {
                from: "auditionsProfiles",
                localField: "memberId",
                foreignField: "memberId",
                as: "memberProfile"
            }
        },
        {
            $match: { $and: [{ memberProfile: { $ne: [] } }] }
        },
        { "$unwind": "$memberProfile" },
        {
            $project: {
                _id: 1,
                createdBy: 1,
                auditionProfileId: 1,
                memberId: 1,
                roleId: 1,
                auditionId: 1,
                isFavorite: 1,
                "memberProfile._id": 1,
                "memberProfile.bodyType": 1,
                "memberProfile.createdAt": 1,
                "memberProfile.dob": 1,
                "memberProfile.ethnicity": 1,
                "memberProfile.gender": 1,
                "memberProfile.height": 1,
                "memberProfile.startHeight": 1,
                "memberProfile.startWeight": 1,
                "memberProfile.memberId": 1,
                "memberProfile.mobileNumber": 1,
                "memberProfile.profilePicUrl": 1,
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
    ], function (err, listOfApplyAuditionObj) {
        // console.log(listOfApplyAuditionObj)
        if (!err)
            callback(null, listOfApplyAuditionObj);
        else
            callback(err, null);
    });
}

var getAllAuditionsForFavoritesId = function (auditionId, callback) {
    //console.log("tez",auditionId)
    //console.log(auditionId favoriteId)
    favorites.aggregate([
        {
            $match: { $and: [{ auditionId: auditionId }] }
        },
        {
            $lookup: {
                from: "audition",
                localField: "auditionId",
                foreignField: "_id",
                as: "auditionDetails"
            }
        },

        {
            $project: {
                _id: 1,
                createdBy: 1,
                auditionProfileId: 1,
                memberId: 1,
                roleId: 1,
                auditionId: 1,
                isFavorite: 1,
                "auditionDetails._id": 1,
                "auditionDetails.memberId": 1,
                "auditionDetails.auditionProfileId": 1,
                "auditionDetails.productionTitle": 1,
                "auditionDetails.productionType": 1,
                "auditionDetails.productionPersonName": 1,
                "favouriteAuditions.subProductionType": 1,
                "auditionDetails.productionDescription": 1,
                "auditionDetails.draftMode": 1,
                "auditionDetails.createdBy": 1,
                "roleDetails.roleName": 1,
                "roleDetails._id": 1,
                "roleDetails.roleType": 1,
                "roleDetails.eyeColour": 1,
                "roleDetails.bodyType": 1,
                "roleDetails.hairColour": 1,
                "roleDetails.roleDescription": 1,
                "roleDetails.mediaRequired": 1,
                "roleDetails.ethnicity": 1,
                "roleDetails.ageEnd": 1,
                "roleDetails.ageStart": 1,
                "roleDetails.gender": 1,
                "roleDetails.auditionId": 1,
                "roleDetails.startHeight": 1,
                "roleDetails.endHeight": 1
                //"auditionDetails.role": 1

            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ], function (err, listOfApplyAuditionObj) {
        // console.log(listOfApplyAuditionObj)
        if (!err)
            callback(null, listOfApplyAuditionObj);
        else
            callback(err, null);
    });
}


var findAllfavorites = function (callback) {
    favorites.find((err, listOffavoritesObj) => {
        if (!err)
            callback(null, listOffavoritesObj);
        else
            callback(err, null);
    }).sort({ createdAt: -1 });
}

/********************************* talent favorite Services  *********************************/
var findTalent = function (reqBody, callback) {
    favorites.findOne({ auditionProfileId: ObjectId(reqBody.auditionProfileId), memberId: ObjectId(reqBody.memberId), isFavoriteType: "talent" }, (err, talentObj) => {
        if (!err)
            callback(null, talentObj);
        else
            callback(err, null)
    });
}

var saveFavoriteTalent = function (reqBody, callback) {
    var favoriteTalentInfo = new favorites({
        auditionProfileId: reqBody.auditionProfileId,
        memberId: reqBody.memberId,
        isFavoriteType: reqBody.isFavoriteType,
        isFavorite: true,
        createdBy: reqBody.createdBy
    });
    favorites.create(favoriteTalentInfo, (err, createdFavoriteTalentObj) => {
        if (!err)
            callback(null, createdFavoriteTalentObj);
        else
            callback(err, null)
    })

}

var updateFavoriteTalent = function (favoriteTalentId, updateFavoriteTalentObj, callback) {
    // console.log(favoriteTalentId)
    // console.log(updateFavoriteTalentObj)
    favorites.findByIdAndUpdate(favoriteTalentId, updateFavoriteTalentObj, { new: true }, (err, updatedFavoriteTalentObj) => {
        if (!err)
            callback(null, updatedFavoriteTalentObj);
        else
            callback(err, null);
    })
}

var findAllCurrentMemberFavoriteTalent = function (auditionProfileId, callback) {
    favorites.find({ auditionProfileId: ObjectId(auditionProfileId), isFavoriteType: "talent", isFavorite: true }, (err, listOfFavoriteTalentObj) => {
        if (!err)
            callback(null, listOfFavoriteTalentObj);
        else
            callback(err, null)
    })
}

var findAllFavouriteTalent = function (auditionProfileId, callback) {
    favorites.aggregate([
        {
            $match:{$and:[{auditionProfileId:auditionProfileId}, {isFavoriteType:"talent"}, {isFavorite:true}]}
        },
        { $sort : { createdAt : -1} },
        {
            $lookup:{
                from:"auditionsProfiles",
                localField:"memberId",
                foreignField:"_id",
                as:"favouriteTalent"
            }
        },
         {
             $project: {
                _id:0,
                "favouriteTalent.isFavorite":"$isFavorite",
                "favouriteTalent.favouriteObjId":"$_id",
                "favouriteTalent.hasBeenFavorited":"true",
                "favouriteTalent._id": 1,
                "favouriteTalent.gender": 1,
                "favouriteTalent.memberId":1,
                "favouriteTalent.ethnicity": 1,
                "favouriteTalent.mediaRequired": 1,
                "favouriteTalent.roleDescription": 1,
                "favouriteTalent.hairColour": 1,
                "favouriteTalent.bodyType": 1,
                "favouriteTalent.eyeColour": 1,
                "favouriteTalent.profilePicUrl":1,
                "favouriteTalent.firstName":1,
                "favouriteTalent.lastName":1,
                "favouriteTalent.screenName":1,
                "favouriteTalent.ageStart":1,
                "favouriteTalent.ageEnd":1,
                "favouriteTalent.dob":1,
                "favouriteTalent.height":1,
                "favouriteTalent.weight":1,
                "favouriteTalent.mobileNumber":1,
                "favouriteTalent.roleType":1,
                "favouriteTalent.skills":1,
                "favouriteTalent.startHeight": 1,
                "favouriteTalent.startWeight": 1,
                "favouriteTalent.showAge": 1,
                //"year": { $year: "dob" },
                "favouriteTalent.country":1,
                "favouriteTalent.createdAt":1,
                "favouriteTalent.achievements":1,
                "favouriteTalent.tilents":1
            }
         }

    ], function (err, listOfFavoriteTalentObj) {
        if (!err){
            let favoutiteTalentArray=[];
            favoutiteTalentArray = listOfFavoriteTalentObj
            .filter((favoritedObj)=>{
                return favoritedObj.favouriteTalent[0] != null;
            }).map((favoritedObj)=>{
                return favoritedObj.favouriteTalent[0];
            });
            callback(null, favoutiteTalentArray);
        }
        else
            callback(err, null)
    })
}

var findAllFavouritedAuditions = function (auditionProfileId, callback) {
    let currentDate = new Date();
    favorites.aggregate([
        {
            $match:{
                $and:[
                    {auditionProfileId:auditionProfileId},
                    {
                        isFavoriteType: { $exists: false }
                    },
                    {isFavorite:true}]
                }
        },
        { $sort : { createdAt : -1} },
        {
            $lookup:{
                from:"audition",
                localField:"auditionId",
                foreignField:"_id",
                as:"favouriteAuditions"
            }
        },
        {
            $lookup: {
                from: "role",
                localField: "roleId",
                foreignField: "_id",
                as: "role"
            }
        },
        {
            $unwind:"$role"
        },
        // {
        //     $lookup: {
        //         from: "role",
        //         localField: "favouriteAuditions._id",
        //         foreignField: "auditionId",
        //         as: "roles"
        //     }
        // },
         {
             $project: {
                _id:0,
                "favouriteAuditions.isFavorite":"$isFavorite",
                "favouriteAuditions.favouriteObjId":"$_id",
                "favouriteAuditions._id": 1,
                "favouriteAuditions.productionCompany": 1,
                "favouriteAuditions.memberId":1,
                "favouriteAuditions.auditionExipires": 1,
                "favouriteAuditions.subProductionType": 1,
                "favouriteAuditions.startDate": 1,
                "favouriteAuditions.favoritedBy": 1,
                "favouriteAuditions.productionTitle": 1,
                "favouriteAuditions.productionType": 1,
                "favouriteAuditions.productionPersonName": 1,
                "favouriteAuditions.productionDescription":1,
                "favouriteAuditions.draftMode":1,
                "favouriteAuditions.createdAt":1,
                "favouriteAuditions.createdBy":1,
                "favouriteAuditions.updatedAt":1,
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
                // "roles._id": 1,
                // "roles.gender": 1,
                // "roles.ageStart": 1,
                // "roles.ageEnd": 1,
                // "roles.ethnicity": 1,
                // "roles.mediaRequired": 1,
                // "roles.roleDescription": 1,
                // "roles.hairColour": 1,
                // "roles.bodyType": 1,
                // "roles.eyeColour": 1,
                // "roles.roleName": 1,
                // "roles.roleType": 1,
                // "roles.auditionId": 1,
                // "roles.startHeight": 1,
                // "roles.endHeight": 1

            }
         }

    ], function (err, listOfFavoriteAuditionObj) {
        if (!err){
            let favoutitedAuditionArray=[];
            favoutitedAuditionArray = listOfFavoriteAuditionObj
            .filter((favoritedObj)=>{
                return favoritedObj.favouriteAuditions[0] != null;
            }).map((favoritedObj)=>{
                favoritedObj.favouriteAuditions[0].role = favoritedObj.role;
                if(currentDate > favoritedObj.favouriteAuditions[0].auditionExipires)
                    favoritedObj.favouriteAuditions[0].isExpired = true
                else
                    favoritedObj.favouriteAuditions[0].isExpired = false
                return favoritedObj.favouriteAuditions[0];
            })
            callback(null, favoutitedAuditionArray);
        }
        else
            callback(err, null)
    })
}





var favoritesServices = {
    savefavorites: savefavorites,
    updatefavorites: updatefavorites,
    findfavoritesById: findfavoritesById,
    getDraftsByMemberId: getDraftsByMemberId,
    findAllfavorites: findAllfavorites,
    findFavoriteByAuditionId: findFavoriteByAuditionId,
    checkFavorite: checkFavorite,
    findAllMemberDetailsById: findAllMemberDetailsById,
    getAllAuditionsForFavoritesId: getAllAuditionsForFavoritesId,

    findTalent: findTalent,
    saveFavoriteTalent: saveFavoriteTalent,
    updateFavoriteTalent: updateFavoriteTalent,
    findAllCurrentMemberFavoriteTalent: findAllCurrentMemberFavoriteTalent,
    findAllFavouriteTalent:findAllFavouriteTalent,
    findAllFavouritedAuditions:findAllFavouritedAuditions

}

module.exports = favoritesServices;
