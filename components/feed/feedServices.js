let Feed = require('../../models/feeddata');
let ObjectId = require('mongodb').ObjectId;
const MediaTracking = require("../mediaTracking/mediaTrackingModel")
const FeedMappingModel = require("./feedMappingModel");
let User = require('../users/userModel');
// let MediaTracking = require('../mediaTracking/mediaTrackingModel');

let findCelebFeedDate = function (celebId, callback) {
    let today = new Date();
    let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    Feed.find({ memberId: celebId, isDelete: false, created_at: { $lt: today, $gte: lastWeek } }, { created_at: 1 }, (err, updateDateObj) => {
        if (err)
            callback(err, null)
        else if (updateDateObj.length > 0)
            callback(null, lastWeek);
        else {
            Feed.find({ memberId: celebId, isDelete: false }, { created_at: 1 }, (err, lastFeedObj) => {
                if (err)
                    callback(err, null);
                else {
                    let lastWeekDate = new Date;
                    // if(lastFeedObj.length>1){
                    //     lastWeekDate = new Date(lastFeedObj[1].created_at)
                    // }else 
                    if (lastFeedObj.length == 1) {
                        let feedCreatedAt = new Date(lastFeedObj[0].created_at);
                        lastWeekDate = new Date(feedCreatedAt.getFullYear(), feedCreatedAt.getMonth(), feedCreatedAt.getDate(), feedCreatedAt.getHours(), feedCreatedAt.getMinutes(), feedCreatedAt.getSeconds() - 5);
                    } else {
                        lastWeekDate = lastWeek
                    }
                    callback(null, lastWeekDate)
                }
            }).sort({ created_at: -1 }).limit(1)
        }
    })
}



let createFeedMappingObj = (memberId, callback) => {
    let today = new Date();
    let feedMappingInfo = {
        memberId: memberId,
        currentSeenFeedDate: today,
        lastSeenFeedDate: today
    }
    FeedMapping.saveFeedMappingData(feedMappingInfo, function (err, feedMappObj) {
        if (err)
            callback(err, null)
        else {
            callback(null, feedMappObj)
        }
    })
}

let updateFeedMappingObj = (memberId, callback) => {
    let today = new Date();
    let feedMappingInfo = {
        currentSeenFeedDate: today,
        lastSeenFeedDate: today
    }
    FeedMappingModel.update({ memberId: memberId }, { $set: feedMappingInfo }, (err, updatedObj) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, updatedObj)
        }
    })
}

let findFeedByMemberIdNew = function (query, callback) {
    //console.log(query)
    let condition;
    let memberId = query.memberId;
    var fanFollowQuery;
    fanFollowQuery = query.fanFollowers.map((celeb) => {
        let x = { $and: [{ memberId: celeb.CelebrityId }, { created_at: { $lt: new Date(query.pagenationDate), $gte: celeb.createdAt } }, { isDelete: false }] }
        return x;
    })
    condition = {
        $or: fanFollowQuery
    }
    Feed.aggregate([
        {
            $match: condition
        },
        {
            $sort: { created_at: -1 }
        },
        {
            $limit: query.limit
        },
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
                isHide: {
                    $cond: { if: { $and: [{ "$eq": ["$hideObj.hideById", ObjectId(memberId)] }, { "$eq": ["$hideObj.isHide", true] }] }, then: true, else: false }
                },
                country: {
                    $cond: {
                        if: { $eq: ["$feedByMemberDetails.country", query.country] }, then: 1,
                        else: 0
                    }
                },
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
                    country: 1,
                    cover_imgPath: 1
                },
                feedLikesCount: {
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
                            cond: {
                                $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(memberId)] }] },
                                { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
                            }
                        }
                    }
                }
            }
        }, {
            $sort: { created_at: -1, country: -1 }
        },
    ], function (err, listOfFeedObj) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, listOfFeedObj)
        }
    });
}




let findFeedByMemberId = function (query, callback) {

    // let lstPreferenceFeeds =[];
    // let lstGEOLocalFeeds =[];
    // let lstGEONonLocalFeeds =[];
    // var nowdate = new Date();
    // const numberOfDaysToLookBack = 7;
    // let oneWeek = nowdate.getTime() - (numberOfDaysToLookBack * 24 * 60 * 60 * 1000);
    // console.log("oneWeek  ==== ", oneWeek)
    // console.log("oneWeek  ==== ", new Date(oneWeek))
    // var monthStartDay = new Date(nowdate.getFullYear(), nowdate.getMonth(), 1);
    // var monthEndDay = new Date(nowdate.getFullYear(), nowdate.getMonth(), 0);
    // console.log("monthStartDay   ===== ", monthStartDay);
    // console.log("monthEndDay   ===== ", monthEndDay)// let lstFanFallowFeeds =[];
    // var lastWeek = new Date();
    // lastWeek.setDate(lastWeek.getDate() - 7);
    // console.log("lastWeek   ===== ", lastWeek);

    let memberId = query.memberId;
    //let arr = query.memberListArray
    //console.log(query)
    // created_at: { $lt: new Date(query.pagenationDate) },
    let condition;
    if (query.isFanFollow == true) {
        console.log("Fan Follow Condition");
        condition = {
            memberId: { $in: query.memberListArray },
            //created_at: { $lt: new Date(nowdate), $gte: new Date(oneWeek) },
            created_at: { $lt: new Date(query.pagenationDate) },
            isDelete: false, _id: { $nin: query.viewedFeedHistory }, _id: { $nin: query.viewFeedArray }
        }
    } else if (query.isPreferences == true) {
        console.log("Preferences Condition");
        condition = {
            $and: [{ $or: [{ memberId: { $in: query.memberListArray } }] }, {
                created_at: { $lt: new Date(query.pagenationDate) },
                isDelete: false, _id: { $nin: query.viewedFeedHistory }
            }],
        }
    } else if (query.isGeoLocation == true || query.isNonGeoLocation == true) {
        console.log("GEO Location Condition");
        condition = {
            $and: [{ $or: [{ memberId: { $in: query.memberListArray } }] }, {
                created_at: { $lt: new Date(query.pagenationDate) },
                isDelete: false, _id: { $nin: query.viewedFeedHistory }
            }],
        }
        // {
        //     memberId: { $in: query.memberListArray },
        //     created_at: { $lt: new Date(query.pagenationDate) },
        //     isDelete: false, _id: { $nin: query.viewFeedArray }
        // }
    }

    // condition.created_at = { $lt: new Date(query.pagenationDate) };
    // condition.isDelete = false;
    // if (query.isDataFromMemberPreferences != null && query.isDataFromMemberPreferences) {
    //     condition.$or = [{ memberId: { $in: query.memberListArray } }, { _id: { $in: query.viewFeedArray } }]
    // }
    // else {
    //     condition.memberId = { $in: query.memberListArray };
    //     condition._id = { $nin: query.viewFeedArray };
    // }
    //console.log(condition);
    Feed.aggregate([
        {
            // $match: {  memberId: { $in: query.memberListArray },
            //           created_at: { $lt: new Date(query.pagenationDate) }, 
            //           isDelete: false, 
            //           _id:  { $nin: query.viewFeedArray } 
            //         }
            $match: condition
        },
        {
            $sort: { created_at: -1 }
        },
        {
            $limit: query.limit
        },
        // {
        //     $match: { memberId: { $in: query.memberListArray }, created_at: { $lt: new Date(query.pagenationDate) }, isDelete: false }
        // },
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
                //"$feedByMemberDetails.country"
                //mycountry : query.country,
                country: {
                    $cond: {
                        if: { $eq: ["$feedByMemberDetails.country", query.country] }, then: 1,
                        else: 0
                    }
                },
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
                    country: 1
                },
                feedLikesCount: {
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
        }, {
            $sort: { created_at: -1, country: -1 }
        },
    ], function (err, listOfFeedObj) {
        if (err) {
            callback(err, null)
        }
        else {
            callback(null, listOfFeedObj);

        }
    });
}
let findFeedByFeedPreferences = function (callback) {

    // let lstFanFallowFeeds =[];
    // let lstPreferenceFeeds =[];
    // let lstGEOLocalFeeds =[];
    // let lstGEONonLocalFeeds =[];

    //console.log("AAAAAA6",query)
    let memberId = "5b9b3159c3632d11b21f1013";
    //let uniqueMemberList = []
    //let arr = query.memberListArray
    //console.log(query)
    //$match: { memberId: { $in: query.memberListArray }, created_at: { $lt: new Date(query.pagenationDate) }, isDelete: false }
    Feed.aggregate([
        {
            $sort: { created_at: -1 }
        },
        {
            $match: { media: { $elemMatch: { "mediaType": "video" } }, isDelete: false }
        },
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
            $limit: 10
        },
        {
            $lookup: {
                from: "mediatrackings",
                localField: "_id",
                foreignField: "feedId",
                as: "feedStats"
            }
        },
        // {
        //     $lookup: {
        //         from: "mediatrackings",
        //         as: "mediaStats",
        //         // localField: "media.mediaId",
        //         // foreignField: "mediaId",
        //         "let": { "mediaId": "$mediaId" },
        //         "pipeline": [
        //             {
        //                 "$match": {
        //                     //"mediaId": "$media.mediaId"
        //                     //"mediaId": { "$gte": 0, "$lte": 0 },
        //                     "$expr": { "$eq": ["$$mediaId", "$media.mediaId"] }
        //                 }
        //             }
        //         ]

        //     }
        // },
        {
            $lookup: {
                from: "mediatrackings",
                localField: "media.mediaId",
                foreignField: "mediaId",
                as: "mediaStats"
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
                //"feedLikesCount": 1,
                //"feedCommentsCount": 1,
                //"isFeedLikedByCurrentUser": 1,
                "state": 1,
                "countryCode": 1,
                "mediaStats": 1,
                "feedStats": 1,
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
                }
                //"downloadOptions": 1,
                //"boostSettings": 1,
                //"memberName": 1,
                //"prefix": 1,
                //"profession": 1,
                //"profilePicPath": 1,
                //"subscriptionType": 1,
                // "offlineStatus": 1,
                //"isPrometed": 1,
                //"mediaSrc": 1,
                //"profanityCheck": 1,
                //"tags": 1,
                //"viewOptions": 1,
                //"approvedBy": 1,
                //"updatedBy": 1,
                //"contentArray": 1,
                //"updated_at": 1,
            }
        }

    ], function (err, listOfFeedObj) {
        //console.log(listOfFeedObj)
        // < 20
        // preferences
        if (!err) {
            // for (let i = 0; i < listOfFeedObj.length; i++) {
            //         for (let j = 0; j < listOfFeedObj[i].media.length; j++) {
            //            if(listOfFeedObj[i].media[j].mediaType == "image"){
            //                listOfFeedObj[i].media[j].splice(0, j)
            //            }
            //         }
            // }

            for (let i = 0; i < listOfFeedObj.length; i++) {
                //Feed count
                //console.log(listOfFeedObj[i].created_at)
                //console.log(listOfFeedObj[i]._id)
                let feedObj = {};
                let mediaStats = [];
                feedObj = listOfFeedObj[i];
                if (feedObj.media.length <= 0) {
                    feedObj.mediaStats = [];
                }
                // if (feedObj.media.length >= 0 || feedObj.media.length <= 0) {
                //     feedObj.mediaStats = [];
                // }
                let feedStatsCount = {};
                let feedlikesCount = 0;
                let feedCommentsCount = 0;

                let isFeedLikedByCurrentUser = false;
                let feedCommentsStatus = false;

                //Media count
                let mediaCountObj = {};
                let mediaCountArray = [];
                let medialikesCount = 0;
                let mediaCommentsCount = 0;

                let isMediaLikedByCurrentUser = false;
                let mediaCommentsStatus = false;


                //this for loop for feed count
                for (let j = 0; j < listOfFeedObj[i].feedStats.length; j++) {
                    if (listOfFeedObj[i].feedStats[j].activities == "views" && listOfFeedObj[i].feedStats[j].isLike === true) {
                        if (listOfFeedObj[i].feedStats[j].memberId == memberId) {
                            isFeedLikedByCurrentUser = true;
                        }
                        feedlikesCount = feedlikesCount + 1;
                    } else if (listOfFeedObj[i].feedStats[j].activities == "comment") {
                        feedCommentsCount = feedCommentsCount + 1;
                    }

                }

                //this for loop for media count
                for (let j = 0; j < listOfFeedObj[i].media.length; j++) {
                    mediaCountObj = {};
                    medialikesCount = 0;
                    mediaCommentsCount = 0;
                    isMediaLikedByCurrentUser = false;
                    listOfFeedObj[i].media = listOfFeedObj[i].media.filter((mediaObj) => {
                        if (mediaObj && mediaObj.mediaRatio) {
                            return mediaObj
                        }
                    })
                    // console.log(listOfFeedObj[i].media)
                    if (listOfFeedObj[i].media.length) {
                        // console.log(listOfFeedObj[i].media)
                        // console.log("****************************************************")
                        let mediaArray = listOfFeedObj[i].media;
                        let mediaIdFromDb = mediaArray[j].mediaId;
                        mediaIdFromDb = "" + mediaIdFromDb;
                        for (var k = 0; k < listOfFeedObj[i].mediaStats.length; k++) {
                            let mediaId = listOfFeedObj[i].mediaStats[k].mediaId;
                            mediaId = "" + mediaId;
                            if (mediaIdFromDb == mediaId) {
                                let actionTypeFromDb = listOfFeedObj[i].mediaStats[k].activities;
                                if (actionTypeFromDb == "views" && listOfFeedObj[i].mediaStats[k].isLike === true) {
                                    if (listOfFeedObj[i].mediaStats[k].memberId == memberId) {
                                        isMediaLikedByCurrentUser = true;
                                    }
                                    medialikesCount = medialikesCount + 1;
                                } else if (actionTypeFromDb == "comment") {
                                    mediaCommentsCount = mediaCommentsCount + 1;
                                }
                            }
                        }
                        listOfFeedObj[i].media[j].mediaLikesCount = medialikesCount;
                        listOfFeedObj[i].media[j].mediaCommentsCount = mediaCommentsCount;
                        listOfFeedObj[i].media[j].isMediaLikedByCurrentUser = isMediaLikedByCurrentUser;
                        //listOfFeedObj[i].mediaStats = [];
                    }

                }

                listOfFeedObj[i].feedLikesCount = feedlikesCount;
                listOfFeedObj[i].feedCommentsCount = feedCommentsCount;
                listOfFeedObj[i].isFeedLikedByCurrentUser = isFeedLikedByCurrentUser;
                listOfFeedObj[i].feedStats = [];
                if (listOfFeedObj[i].feedByMemberDetails[0] != undefined) {
                    listOfFeedObj[i].isCeleb = listOfFeedObj[i].feedByMemberDetails[0].isCeleb ? true : false;
                    listOfFeedObj[i].isManager = listOfFeedObj[i].feedByMemberDetails[0].isManager ? true : false;
                }
            }
            callback(null, listOfFeedObj);
        }

        else
            callback(err, null)
    });
}

let getTrendingFeed = (memberId, startFrom, endTo, callback) => {

    MediaTracking.aggregate([
        {
            $match: {
                $and: [
                    { created_at: { $lte: new Date(startFrom) } },
                    { created_at: { $gte: new Date(endTo) } }
                ]
            }
        },
        {
            $group: {
                _id: "$feedId",
                len: { $sum: 1 }
            }
        },
        { $sort: { len: -1 } },
        {
            $lookup: {
                from: "feeds",
                localField: "_id",
                foreignField: "_id",
                as: "feedDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "feedDetails.memberId",
                foreignField: "_id",
                as: "celebProfile"
            }
        },
        {
            $unwind: "$feedDetails"
        },
        {
            $unwind: "$celebProfile"
        },
        {
            $project: {
                len: 1,
                feedDetails: 1,
                celebProfile: {
                    _id: 1,
                    email: 1,
                    username: 1,
                    pastProfileImages: 1,
                    avtar_originalname: 1,
                    avtar_imgPath: 1,
                    aboutMe: 1,
                    isCeleb: 1
                }
            }
        }
    ], (err, feedDetails) => {
        if (err) {
            callback(err, null)
        } else {
            return callback(null, { feedDetails: feedDetails, startFrom: startFrom, endTo: endTo })
        }
    })
}

let findFeedById = (feedId, memberId, callback) => {
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
                    cover_imgPath: 1
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
}

let hideAndUnhideFeed = function (body, callback) {
    let hideObj = {
        isHide: body.isHide,
        hideById: body.memberId
    }
    Feed.findByIdAndUpdate(ObjectId(body.feedId), { $set: { hideObj: hideObj } }, { new: true }, (err, hideObj) => {
        if (!err)
            callback(null, hideObj);
        else
            callback(err, null)
    })
}

let feedServices = {
    findFeedByMemberId: findFeedByMemberId,
    findFeedByFeedPreferences: findFeedByFeedPreferences,
    findFeedById: findFeedById,
    findFeedByMemberIdNew: findFeedByMemberIdNew,
    getTrendingFeed: getTrendingFeed,
    createFeedMappingObj: createFeedMappingObj,
    updateFeedMappingObj: updateFeedMappingObj,
    findCelebFeedDate: findCelebFeedDate,
    hideAndUnhideFeed: hideAndUnhideFeed
}

module.exports = feedServices;