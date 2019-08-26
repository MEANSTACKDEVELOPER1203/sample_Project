let AditionProfile = require('../auditionsProfiles/auditionsProfilesModel');
let Audition = require('../auditions/auditionModel');
let Feed = require('../../models/feeddata');
let ObjectId = require('mongodb').ObjectId;
let role = require("../roles/roleModel");
const Favourite = require('../favorites/favoritesModel');
const MediaTracking = require('../mediaTracking/mediaTrackingModel');

var shareAuition = (auditionId,callback) => {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0)
    Audition.aggregate(
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
                    favoritedBy: 1,
                    isExpired: { $lt: ["$auditionExipires", currentDate] },
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
        ],(err, auditionDetailsObj)=>{
            if (err) {
                return callback(err, null);
            }
            else {
                auditionDetailsObj[0].isFavorite == false
                // if (auditionDetailsObj[0].favoritedBy) {
                //     auditionDetailsObj[0].isFavorite = auditionDetailsObj[0].favoritedBy.some((fevorator) => {
                //         return fevorator.memberId == memberIdOfUser.toString()
                //     })
                // }
                // else {
                //     auditionDetailsObj[0].isFavorite == false
                // }
                return callback(null, auditionDetailsObj[0]);
            }
        });
}

var shareAuitionProfile = (memberId,callback) => {
    AditionProfile.findOne({memberId: memberId},(err, auditonProfileInfo) => {
        if (!err)
            callback(null, auditonProfileInfo);
        else
            callback(err, null);
    });
}

var shareAuitionProfileByFevStatus = (memberId,selfMemberId,callback) => {
    AditionProfile.findOne({memberId: memberId},(err, auditonProfileInfo) => {
        if (!err)
        {
            Favourite.findOne({"isFavoriteType" : "talent","memberId" : selfMemberId,"auditionProfileId" : auditonProfileInfo._id},{_id:1},(err,fevObj)=>{
                if(err)
                {
                    callback(err, null);
                }
                else{
                    if(fevObj)
                    {
                        auditonProfileInfo.isFavorite = true;
                        callback(null, auditonProfileInfo);
                    }
                    else{
                        auditonProfileInfo.isFavorite = false;
                        callback(null, auditonProfileInfo);
                    }
                }   
            })
        }
        else
        {
            callback(err, null);
        }
    }).lean();
}


var shareFeed = (feedId,callback) => {
    let memberId = "5cc02ac5d0316537a5a9a4b3"
    Feed.aggregate([
        { $match: { _id: ObjectId(feedId), isDelete: false } },
        {
            $lookup: {
                from: "users",
                localField: 'memberId',
                foreignField: '_id',
                as: "feedByMemberDetails"
            }
        },
        {
            "$unwind": "$feedByMemberDetails"
        },
        {
            $lookup: {
                from: "mediatrackings",
                localField: "_id",
                foreignField: "feedId",
                as: "feedStats"
            }
        },
        {
            $project: {
                "_id": 1,
                "title": 1,
                "content": 1,
                "imageRatio": 1,
                "industry": 1,
                "status": 1,
                "location": 1,
                "isDelete": 1,
                "memberId": 1,
                "media": 1,
                "created_at": 1,
                "state": 1,
                "countryCode": 1,
                "updated_at": 1,
                //"mediaStats": 1,
                //"feedStats": 1,
                feedByMemberDetails: {
                    _id: 1,
                    isCeleb: 1,
                    isManager: 1,
                    isOnline: 1,
                    avtar_imgPath: 1,
                    firstName: 1,
                    lastName: 1,
                    profession: 1,
                    gender: 1,
                    username: 1,
                    cover_imgPath:1
                }, feedLikesCount: {
                    $size: {
                        $filter: {
                            input: "$feedStats",
                            cond: { $and: [{ "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }] }
                        }
                    }
                },
                feedCommentsCount: {
                    $size: {
                        $filter: {
                            input: "$feedStats",
                            cond: { "$eq": ["$$this.activities", "comment"] }
                        }
                    }
                },
                isFeedLikedByCurrentUser: {
                    $size: {
                        $filter: {
                            input: "$feedStats",
                            //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
                            cond: {
                                $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(memberId)] }] },
                                { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
                            }
                        }
                    }
                }
            }
        },

    ], (err, feedDetails) => {
        if (err) {
            callback(err, null)
        } else if (feedDetails.length <= 0) {
            callback(null, null)
        }
        else if (feedDetails.length) {
            //console.log(feedDetails)
            Feed.aggregate([
                { $match: { _id: ObjectId(feedId), isDelete: false } },
                {
                    $lookup: {
                        from: "mediatrackings",
                        localField: "media.mediaId",
                        foreignField: "mediaId",
                        as: "mediaStats"
                    }
                },
                {
                    "$unwind": "$mediaStats"
                },
                {
                    $group: {
                        "_id": {
                            "mediaId": "$mediaStats.mediaId",
                            "activities": "$mediaStats.activities",
                            "isLike": "$mediaStats.isLike"
                        },
                        mediaLikes: { $push: "$mediaStats" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        mediaLikes: 1,
                        isMediaLikedByCurrentUser: {
                            $size: {
                                $filter: {
                                    input: "$mediaLikes",
                                    //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
                                    cond: {
                                        $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(memberId)] }] },
                                        { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
                                    }
                                }
                            }
                        }
                    }
                }
            ], (err, mediaLikeCount) => {
                async function f() {
                    //console.log(mediaLikeCount)
                    let promise = new Promise((resolve, reject) => {
                        feedDetails[0].media.map((FeedMediaObj) => {
                            FeedMediaObj.isMediaLikedByCurrentUser = 0;
                            FeedMediaObj.mediaLikesCount = 0;
                            FeedMediaObj.mediaCommentsCount = 0;
                            return FeedMediaObj;
                        });
                        if (feedDetails[0].media.length) {
                            feedDetails[0].media.map((FeedMediaObj, index, arr) => {
                                mediaLikeCount.forEach((mediaObj) => {
                                    if (FeedMediaObj.mediaId + "" == mediaObj._id.mediaId + "" && mediaObj._id.activities == 'views' && mediaObj._id.isLike == true) {
                                        FeedMediaObj.isMediaLikedByCurrentUser = mediaObj.isMediaLikedByCurrentUser;
                                        FeedMediaObj.mediaLikesCount = mediaObj.count;
                                    }
                                    else if (FeedMediaObj.mediaId + "" == mediaObj._id.mediaId + "" && mediaObj._id.activities == 'comment') {
                                        FeedMediaObj.mediaCommentsCount = mediaObj.count;
                                    }
                                })
                                if (index == arr.length - 1) {
                                    resolve("done!")
                                }
                                return FeedMediaObj;
                            })
                        } else {
                            resolve("done!")
                        }

                    })
                    let result = await promise; // wait till the promise resolves (*)
                    callback(null, feedDetails[0]);
                    //console.log(result); // "done!"
                }
                f();
            })
        }
    });
    // Feed.aggregate(
    //     [{
    //       $match: {
    //         _id: ObjectId(feedId)
    //       }
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: 'memberId',
    //             foreignField: '_id',
    //             as: "feedByMemberDetails"
    //         }
    //     },
    //     {
    //       $lookup: {
    //         from: "mediatrackings",
    //         localField: "_id",
    //         foreignField: "feedId",
    //         as: "feedStats"
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "mediatrackings",
    //         localField: "media.mediaId",
    //         foreignField: "mediaId",
    //         as: "mediaStats"
    //       }
    //     },
    //     {
    //         "$unwind": "$feedByMemberDetails"
    //     },
    //     {
    //         $project:{
    //             "_id": 1,
    //             "downloadOptions": 1,
    //             "boostSettings":1,
    //             "memberName": 1,
    //             "prefix": 1,
    //             "profession": 1,
    //             "profilePicPath": 1,
    //             "title": 1,
    //             "mediaSrc": 1,
    //             "content": 1,
    //             "imageRatio": 1,
    //             "profanityCheck": 1,
    //             "tags": 1,
    //             "viewOptions": 1,
    //             "industry": 1,
    //             "subscriptionType": 1,
    //             "offlineStatus": 1,
    //             "isPrometed": 1,
    //             "status": 1,
    //             "approvedBy": 1,
    //             "updated_at": 1,
    //             "location": 1,
    //             "isDelete": 1,
    //             "memberId": 1,
    //             "media": 1,
    //             "created_at": 1,
    //             "createdBy": "Chenna Rao",
    //             "contentArray": [],
    //             "countryCode": "IN",
    //             "feedByMemberDetails": {
    //                 "_id": 1,
    //                 "avtar_imgPath": 1,
    //                 "avtar_originalname": 1,
    //                 "imageRatio":1,
    //                 "name": 1,
    //                 "profession" : 1,
    //                 "isManager" : 1, 
    //                 "isPromoter" : 1, 
    //                 "IsDeleted" : 1, 
    //                 "isMobileVerified" : 1, 
    //                 "callStatus" : 1, 
    //                 "isEmailVerified" : 1, 
    //                 "isPromoted" : 1, 
    //                 "isEditorChoice" : 1, 
    //                 "isOnline" : 1, 
    //                 "isTrending" : 1, 
    //                 "isCeleb" : 1, 
    //                 "status" : 1, 
    //                 "liveStatus" : 1,
    //                 "firstName": 1,
    //                 "lastName": 1,
    //                 "prefix": 1,
    //                 "aboutMe": 1,
    //                 "country": 1,
    //                 "gender": 1,
    //                 "email": 1,
    //                 "username": 1,
    //                 "mobileNumber": 1,
    //                 "created_at":1,
    //                 "pastProfileImages": 1,
    //                 "isPramoted": 1,
    //                 "dua": 1
    //             },
    //             "feedStats":1,
    //             "mediaStats": 1,
    //             "feedLikesCount": 1,
    //             "feedCommentsCount": 1,
    //             "isFeedLikedByCurrentUser": 1
    //         }
    //     }
    //     ],
    //     (err, listOfFeedObj)=>{
    //         if (err) {
    //             callback(err,null)
    //         }
    //         //let memberId = listOfFeedObj[0].memberId;
    //         for (let i = 0; i < listOfFeedObj.length; i++) {
    //             //Feed count
    //             let feedObj = {};
    //             feedObj = listOfFeedObj[i];
    //             if (feedObj.media.length <= 0) {
    //             feedObj.mediaStats = [];
    //             }
    //             let feedlikesCount = 0;
    //             let feedCommentsCount = 0;
    //             let medialikesCount = 0;
    //             let mediaCommentsCount = 0;
        
    //             //this for loop for feed count
    //             for (let j = 0; j < listOfFeedObj[i].feedStats.length; j++) {
    //             if (listOfFeedObj[i].feedStats[j].activities == "views" && listOfFeedObj[i].feedStats[j].isLike === true) {
    //                 // if (listOfFeedObj[i].feedStats[j].memberId == memberId) {
    //                 // isFeedLikedByCurrentUser = true;
    //                 // }
    //                 feedlikesCount = feedlikesCount + 1;
    //             } else if (listOfFeedObj[i].feedStats[j].activities == "comment") {
    //                 feedCommentsCount = feedCommentsCount + 1;
    //             }
        
    //             }
        
    //             //this for loop for media count
    //             for (let j = 0; j < listOfFeedObj[i].media.length; j++) {
    //             mediaCountObj = {};
    //             medialikesCount = 0;
    //             mediaCommentsCount = 0;
    //             isMediaLikedByCurrentUser = false;
        
    //             let mediaArray = listOfFeedObj[i].media;
    //             let mediaIdFromDb = mediaArray[j].mediaId;
    //             mediaIdFromDb = "" + mediaIdFromDb;
    //             for (var k = 0; k < listOfFeedObj[i].mediaStats.length; k++) {
    //                 let mediaId = listOfFeedObj[i].mediaStats[k].mediaId;
    //                 mediaId = "" + mediaId;
    //                 if (mediaIdFromDb == mediaId) {
    //                 let actionTypeFromDb = listOfFeedObj[i].mediaStats[k].activities;
    //                 if (actionTypeFromDb == "views" && listOfFeedObj[i].mediaStats[k].isLike === true) {
    //                     medialikesCount = medialikesCount + 1;
    //                 } else if (actionTypeFromDb == "comment") {
    //                     mediaCommentsCount = mediaCommentsCount + 1;
    //                 }
    //                 }
    //             }
    //             listOfFeedObj[i].media[j].mediaLikesCount = medialikesCount;
    //             listOfFeedObj[i].media[j].mediaCommentsCount = mediaCommentsCount;
    //             listOfFeedObj[i].media[j].isMediaLikedByCurrentUser = false;
    //             }
    //             listOfFeedObj[i].feedLikesCount = feedlikesCount;
    //             listOfFeedObj[i].feedCommentsCount = feedCommentsCount;
    //             listOfFeedObj[i].isFeedLikedByCurrentUser = false;
    //         }
    //         callback(null, listOfFeedObj)
    // });
}

var shareFeedByLikeStatus = (feedId,memberId,callback) => {
    Feed.aggregate([
        { $match: { _id: ObjectId(feedId), isDelete: false } },
        {
            $lookup: {
                from: "users",
                localField: 'memberId',
                foreignField: '_id',
                as: "feedByMemberDetails"
            }
        },
        {
            "$unwind": "$feedByMemberDetails"
        },
        {
            $lookup: {
                from: "mediatrackings",
                localField: "_id",
                foreignField: "feedId",
                as: "feedStats"
            }
        },
        {
            $project: {
                "_id": 1,
                "title": 1,
                "content": 1,
                "imageRatio": 1,
                "industry": 1,
                "status": 1,
                "location": 1,
                "isDelete": 1,
                "memberId": 1,
                "media": 1,
                "created_at": 1,
                "state": 1,
                "countryCode": 1,
                "updated_at": 1,
                //"mediaStats": 1,
                //"feedStats": 1,
                feedByMemberDetails: {
                    _id: 1,
                    isCeleb: 1,
                    isManager: 1,
                    isOnline: 1,
                    avtar_imgPath: 1,
                    firstName: 1,
                    lastName: 1,
                    profession: 1,
                    gender: 1,
                    username: 1
                }, feedLikesCount: {
                    $size: {
                        $filter: {
                            input: "$feedStats",
                            cond: { $and: [{ "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }] }
                        }
                    }
                },
                feedCommentsCount: {
                    $size: {
                        $filter: {
                            input: "$feedStats",
                            cond: { "$eq": ["$$this.activities", "comment"] }
                        }
                    }
                },
                isFeedLikedByCurrentUser: {
                    $size: {
                        $filter: {
                            input: "$feedStats",
                            //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
                            cond: {
                                $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(memberId)] }] },
                                { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
                            }
                        }
                    }
                }
            }
        },

    ], (err, feedDetails) => {
        if (err) {
            callback(err, null)
        } else if (feedDetails.length <= 0) {
            callback(null, null)
        }
        else if (feedDetails.length) {
            //console.log(feedDetails)
            Feed.aggregate([
                { $match: { _id: ObjectId(feedId), isDelete: false } },
                {
                    $lookup: {
                        from: "mediatrackings",
                        localField: "media.mediaId",
                        foreignField: "mediaId",
                        as: "mediaStats"
                    }
                },
                {
                    "$unwind": "$mediaStats"
                },
                {
                    $group: {
                        "_id": {
                            "mediaId": "$mediaStats.mediaId",
                            "activities": "$mediaStats.activities",
                            "isLike": "$mediaStats.isLike"
                        },
                        mediaLikes: { $push: "$mediaStats" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        mediaLikes: 1,
                        isMediaLikedByCurrentUser: {
                            $size: {
                                $filter: {
                                    input: "$mediaLikes",
                                    //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
                                    cond: {
                                        $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(memberId)] }] },
                                        { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
                                    }
                                }
                            }
                        }
                    }
                }
            ], (err, mediaLikeCount) => {
                async function f() {
                    //console.log(mediaLikeCount)
                    let promise = new Promise((resolve, reject) => {
                        feedDetails[0].media.map((FeedMediaObj) => {
                            FeedMediaObj.isMediaLikedByCurrentUser = 0;
                            FeedMediaObj.mediaLikesCount = 0;
                            FeedMediaObj.mediaCommentsCount = 0;
                            return FeedMediaObj;
                        });
                        if (feedDetails[0].media.length) {
                            feedDetails[0].media.map((FeedMediaObj, index, arr) => {
                                mediaLikeCount.forEach((mediaObj) => {
                                    if (FeedMediaObj.mediaId + "" == mediaObj._id.mediaId + "" && mediaObj._id.activities == 'views' && mediaObj._id.isLike == true) {
                                        FeedMediaObj.isMediaLikedByCurrentUser = mediaObj.isMediaLikedByCurrentUser;
                                        FeedMediaObj.mediaLikesCount = mediaObj.count;
                                    }
                                    else if (FeedMediaObj.mediaId + "" == mediaObj._id.mediaId + "" && mediaObj._id.activities == 'comment') {
                                        FeedMediaObj.mediaCommentsCount = mediaObj.count;
                                    }
                                })
                                if (index == arr.length - 1) {
                                    resolve("done!")
                                }
                                return FeedMediaObj;
                            })
                        } else {
                            resolve("done!")
                        }

                    })
                    let result = await promise; // wait till the promise resolves (*)
                    callback(null, feedDetails[0]);
                    //console.log(result); // "done!"
                }
                f();
            })
        }
    });
    // Feed.aggregate(
    //     [{
    //       $match: {
    //         _id: ObjectId(feedId)
    //       }
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: 'memberId',
    //             foreignField: '_id',
    //             as: "feedByMemberDetails"
    //         }
    //     },
    //     {
    //       $lookup: {
    //         from: "mediatrackings",
    //         localField: "_id",
    //         foreignField: "feedId",
    //         as: "feedStats"
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "mediatrackings",
    //         localField: "media.mediaId",
    //         foreignField: "mediaId",
    //         as: "mediaStats"
    //       }
    //     },
    //     {
    //         "$unwind": "$feedByMemberDetails"
    //     },
    //     {
    //         $project:{
    //             "_id": 1,
    //             "downloadOptions": 1,
    //             "boostSettings":1,
    //             "memberName": 1,
    //             "prefix": 1,
    //             "profession": 1,
    //             "profilePicPath": 1,
    //             "title": 1,
    //             "mediaSrc": 1,
    //             "content": 1,
    //             "imageRatio": 1,
    //             "profanityCheck": 1,
    //             "tags": 1,
    //             "viewOptions": 1,
    //             "industry": 1,
    //             "subscriptionType": 1,
    //             "offlineStatus": 1,
    //             "isPrometed": 1,
    //             "status": 1,
    //             "approvedBy": 1,
    //             "updated_at": 1,
    //             "location": 1,
    //             "isDelete": 1,
    //             "memberId": 1,
    //             "media": 1,
    //             "created_at": 1,
    //             "createdBy": "Chenna Rao",
    //             "contentArray": [],
    //             "countryCode": "IN",
    //             "feedByMemberDetails": {
    //                 "_id": 1,
    //                 "avtar_imgPath": 1,
    //                 "avtar_originalname": 1,
    //                 "imageRatio":1,
    //                 "name": 1,
    //                 "profession" : 1,
    //                 "isManager" : 1, 
    //                 "isPromoter" : 1, 
    //                 "IsDeleted" : 1, 
    //                 "isMobileVerified" : 1, 
    //                 "callStatus" : 1, 
    //                 "isEmailVerified" : 1, 
    //                 "isPromoted" : 1, 
    //                 "isEditorChoice" : 1, 
    //                 "isOnline" : 1, 
    //                 "isTrending" : 1, 
    //                 "isCeleb" : 1, 
    //                 "status" : 1, 
    //                 "liveStatus" : 1,
    //                 "firstName": 1,
    //                 "lastName": 1,
    //                 "prefix": 1,
    //                 "aboutMe": 1,
    //                 "country": 1,
    //                 "gender": 1,
    //                 "email": 1,
    //                 "username": 1,
    //                 "mobileNumber": 1,
    //                 "created_at":1,
    //                 "pastProfileImages": 1,
    //                 "isPramoted": 1,
    //                 "dua": 1
    //             },
    //             "feedStats":1,
    //             "mediaStats": 1,
    //             "feedLikesCount": 1,
    //             "feedCommentsCount": 1,
    //             "isFeedLikedByCurrentUser": 1
    //         }
    //     }
    //     ],
    //     (err, listOfFeedObj)=>{
    //         if (err) {
    //             callback(err,null)
    //         }
    //         else{
    //             let isFeedLikedByCurrentUser = false;
    //             // console.log(listOfFeedObj)
    //                 let feedObj = {};
    //                 feedObj = listOfFeedObj[0];
    //                 if (feedObj.media.length <= 0) {
    //                     feedObj.mediaStats = [];
    //                 }
    //                 let feedlikesCount = 0;
    //                 let feedCommentsCount = 0;
    //                 let medialikesCount = 0;
    //                 let mediaCommentsCount = 0;
                    
    
    //                 //this for loop for feed count

    //                 feedObj.feedStats.forEach(element => {
    //                     if (element.activities == "views" && element.isLike === true) {
                        
    //                         if (element.memberId+"" == memberId+"") {
    //                             isFeedLikedByCurrentUser = true;
    //                         }
    //                         feedlikesCount = feedlikesCount + 1;
    //                     } else if (element.activities == "comment") {
    //                         feedCommentsCount = feedCommentsCount + 1;
    //                     }
    //                 });
    //                 // for (let j = 0; j < listOfFeedObj[0].feedStats.length; j++) {
    //                 // if (listOfFeedObj[0].feedStats[j].activities == "views" && listOfFeedObj[0].feedStats[j].isLike === true) {
                        
    //                 //     if (listOfFeedObj[0].feedStats[j].memberId+"" == memberId+"") {
    //                 //         isFeedLikedByCurrentUser = true;
    //                 //     }
    //                 //     feedlikesCount = feedlikesCount + 1;
    //                 // } else if (listOfFeedObj[0].feedStats[j].activities == "comment") {
    //                 //     feedCommentsCount = feedCommentsCount + 1;
    //                 // }
            
    //                 // }
            
    //                 //this for loop for media count
    //                 for (let j = 0; j < listOfFeedObj[0].media.length; j++) {
    //                 mediaCountObj = {};
    //                 medialikesCount = 0;
    //                 mediaCommentsCount = 0;
    //                 isMediaLikedByCurrentUser = false;
            
    //                 let mediaArray = listOfFeedObj[0].media;
    //                 let mediaIdFromDb = mediaArray[j].mediaId;
    //                 mediaIdFromDb = "" + mediaIdFromDb;
    //                 for (var k = 0; k < listOfFeedObj[0].mediaStats.length; k++) {
    //                     let mediaId = listOfFeedObj[0].mediaStats[k].mediaId;
    //                     mediaId = "" + mediaId;
    //                     if (mediaIdFromDb == mediaId) {
    //                     let actionTypeFromDb = listOfFeedObj[0].mediaStats[k].activities;
    //                     if (actionTypeFromDb == "views" && listOfFeedObj[0].mediaStats[k].isLike === true) {
    //                         medialikesCount = medialikesCount + 1;
    //                     } else if (actionTypeFromDb == "comment") {
    //                         mediaCommentsCount = mediaCommentsCount + 1;
    //                     }
    //                     }
    //                 }
    //                 listOfFeedObj[0].media[j].mediaLikesCount = medialikesCount;
    //                 listOfFeedObj[0].media[j].mediaCommentsCount = mediaCommentsCount;
    //                 listOfFeedObj[0].media[j].isMediaLikedByCurrentUser = false;
    //                 }
    //                 listOfFeedObj[0].feedLikesCount = feedlikesCount;
    //                 listOfFeedObj[0].feedCommentsCount = feedCommentsCount;
    //                 listOfFeedObj[0].isFeedLikedByCurrentUser = isFeedLikedByCurrentUser;
    //             }
    //             MediaTracking.findOne({activities:"views",isLike:true,memberId:memberId,feedId:feedId},{_id:1},(err,isLike)=>{
    //                 if (err) {
    //                     callback(err,null)
    //                 }
    //                 else if(isLike){
    //                     listOfFeedObj[0].isFeedLikedByCurrentUser = true;
    //                     callback(null, listOfFeedObj)
    //                 }else{
    //                     callback(null, listOfFeedObj)
    //                 }
    //             })
    // });
}

const shareAuditionWithRole = (auditionId,roleId,callback)=>{
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0)
    Audition.aggregate(
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
                $unwind:"$roles"
            },
            {
                $match:{
                    "roles._id":ObjectId(roleId)
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
                    favoritedBy: 1,
                    isExpired: { $lt: ["$auditionExipires", currentDate] },
                    // roles: {
                    //     $filter: {
                    //         input: '$roles',
                    //         as: 'roles',
                    //         cond: { $eq: ['$$roles._id', ObjectId(roleId)] }
                    //     }
                    // },
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
        ],(err, auditionDetailsObj)=>{
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, auditionDetailsObj[0]);
            }
        });
}

const shareAuditionWithRoleAndFevDatatus = (auditionId,roleId,memberId,callback)=>{
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0)
    Favourite.findOne({"isFavorite" : true,"memberId" : ObjectId(memberId),roleId:ObjectId(roleId)},{_id:1,roleId:1},(err,fevAudition)=>{
        if(err)
        {
            res.json({success:0,message:err})
        }else{
            Audition.aggregate(
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
                    $unwind:"$roles"
                },
                {
                    $match:{
                        "roles._id":ObjectId(roleId)
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
                        favoritedBy: 1,
                        isExpired: { $lt: ["$auditionExipires", currentDate] },
                        // roles: {
                        //     $filter: {
                        //         input: '$roles',
                        //         as: 'roles',
                        //         cond: { $eq: ['$$roles._id', ObjectId(roleId)] }
                        //     }
                        // },
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
            ],(err, auditionDetailsObj)=>{
                if (err) {
                    return callback(err, null);
                }
                else {
                    if (fevAudition) {
                        auditionDetailsObj[0].isFavorite = true
                    }
                    else {
                        auditionDetailsObj[0].isFavorite == false
                    }
                    return callback(null, auditionDetailsObj[0]);
                }
            });
        }
    });
}


let shareApiServices = {
    shareAuition: shareAuition,
    shareAuitionProfile:shareAuitionProfile,
    shareFeed:shareFeed,
    shareAuditionWithRole:shareAuditionWithRole,
    shareAuditionWithRoleAndFevDatatus:shareAuditionWithRoleAndFevDatatus,
    shareFeedByLikeStatus:shareFeedByLikeStatus,
    shareAuitionProfileByFevStatus:shareAuitionProfileByFevStatus
}
module.exports = shareApiServices;