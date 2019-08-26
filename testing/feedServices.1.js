let Feed = require('../models/feeddata');
let ObjectId = require('mongodb').ObjectId;
let findFeedByMemberId = function (query, callback) {

    // let lstFanFallowFeeds =[];
    // let lstPreferenceFeeds =[];
    // let lstGEOLocalFeeds =[];
    // let lstGEONonLocalFeeds =[];

    //console.log("AAAAAA6",query)
    let memberId = query.memberId;
    //let uniqueMemberList = []
    //let arr = query.memberListArray
    //console.log(query)
    Feed.aggregate([
        {
            $sort: { created_at: -1 }
        },
        // {
        //     $match: { memberId: { $in: query.memberListArray }, created_at: { $lt: new Date(query.paginationDate) }, isDelete: false, _id: { $nin: query.viewFeedArray } }
        // },
        {
            $match: { memberId: { $in: query.memberListArray }, created_at: { $lt: new Date(query.paginationDate) }, isDelete: false }
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
            $limit: query.limit
        },
        // {
        //     $lookup: {
        //         from: "mediatrackings",
        //         localField: "_id",
        //         foreignField: "feedId",
        //         as: "feedStats"
        //     }
        // },
        {
            $lookup: {
                from: "mediatrackings",
                let: { mediaFeedId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$feedId", "$$mediaFeedId"] },
                                    { $eq: ["$activities", "views"] }
                                ]
                            }
                        }
                    }
                ],
                as: "likes"
            }
        },
        // {
        //     $lookup: {
        //         from: "mediatrackings",
        //         let: { mediaFeedId: "$_id" },
        //         pipeline: [
        //             {
        //                 $match: {
        //                     $expr: {
        //                         $and: [
        //                             { $eq: ["$feedId", "$$mediaFeedId"] },
        //                             { $eq: ["$activities", "comment"] }
        //                         ]
        //                     }
        //                 }
        //             }
        //         ],
        //         as: "comments"
        //     }
        // },
        {
            $lookup: {
                from: "mediatrackings",
                let: { mediaFeedId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$feedId", "$$mediaFeedId"] },
                                    { $eq: ["$activities", "views"] },
                                    { $eq: ["$memberId", ObjectId(query.memberId)] }
                                ]
                            }
                        }
                    }
                ],
                as: "isCurrentMemberLiked"
            }
        },
        {
            "$unwind": "$isCurrentMemberLiked"
        },
        // {
        //     $lookup: {
        //         from: "mediatrackings",
        //         localField: "_id",
        //         foreignField: "feedId",
        //         as: "memberfeed"
        //     },
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
                "mediaStats": {
                    feedId: 1,
                    memberId: 1,
                    isLike: 1,
                    activities: 1
                },
                "feedStatus": {
                    "likes": { "$size": "$likes" },
                    //"comments": { "$size": "$comments" },
                    //"isCurrentMemberLiked": {
                        feedId: "$isCurrentMemberLiked.feedId",
                        memberId: "$isCurrentMemberLiked.memberId",
                        isLike: "$isCurrentMemberLiked.isLike",
                        activities: "$isCurrentMemberLiked.activities"
                    //}

                },
                // "isCurrentMemberLiked": {
                //     feedId: 1,
                //     memberId: 1,
                //     isLike: 1,
                //     activities: 1
                // },
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
        },
        // {
        //     allowDiskUse: true
        // }

    ], function (err, listOfFeedObj) {
        //console.log(listOfFeedObj)
        // < 20
        // preferences
        if (!err) {
            // for (let i = 0; i < listOfFeedObj.length; i++) {
            //     //Feed count
            //     //console.log(listOfFeedObj[i].created_at)
            //     //console.log(listOfFeedObj[i]._id)
            //     let feedObj = {};
            //     let mediaStats = [];
            //     feedObj = listOfFeedObj[i];
            //     if (feedObj.media.length <= 0) {
            //         feedObj.mediaStats = [];
            //     }
            //     // if (feedObj.media.length >= 0 || feedObj.media.length <= 0) {
            //     //     feedObj.mediaStats = [];
            //     // }
            //     let feedStatsCount = {};
            //     let feedlikesCount = 0;
            //     let feedCommentsCount = 0;

            //     let isFeedLikedByCurrentUser = false;
            //     let feedCommentsStatus = false;

            //     //Media count
            //     let mediaCountObj = {};
            //     let mediaCountArray = [];
            //     let medialikesCount = 0;
            //     let mediaCommentsCount = 0;

            //     let isMediaLikedByCurrentUser = false;
            //     let mediaCommentsStatus = false;


            //     //this for loop for feed count
            //     // for (let j = 0; j < listOfFeedObj[i].feedStats.length; j++) {
            //     //     if (listOfFeedObj[i].feedStats[j].activities == "views" && listOfFeedObj[i].feedStats[j].isLike === true) {
            //     //         if (listOfFeedObj[i].feedStats[j].memberId == memberId) {
            //     //             isFeedLikedByCurrentUser = true;
            //     //         }
            //     //         feedlikesCount = feedlikesCount + 1;
            //     //     } else if (listOfFeedObj[i].feedStats[j].activities == "comment") {
            //     //         feedCommentsCount = feedCommentsCount + 1;
            //     //     }

            //     // }

            //     //this for loop for media count
            //     for (let j = 0; j < listOfFeedObj[i].media.length; j++) {
            //         mediaCountObj = {};
            //         medialikesCount = 0;
            //         mediaCommentsCount = 0;
            //         isMediaLikedByCurrentUser = false;
            //         listOfFeedObj[i].media = listOfFeedObj[i].media.filter((mediaObj) => {
            //             if (mediaObj && mediaObj.mediaRatio) {
            //                 return mediaObj
            //             }
            //         })
            //         // console.log(listOfFeedObj[i].media)
            //         if (listOfFeedObj[i].media.length) {
            //             // console.log(listOfFeedObj[i].media)
            //             // console.log("****************************************************")
            //             let mediaArray = listOfFeedObj[i].media;
            //             let mediaIdFromDb = mediaArray[j].mediaId;
            //             mediaIdFromDb = "" + mediaIdFromDb;
            //             for (var k = 0; k < listOfFeedObj[i].mediaStats.length; k++) {
            //                 let mediaId = listOfFeedObj[i].mediaStats[k].mediaId;
            //                 mediaId = "" + mediaId;
            //                 if (mediaIdFromDb == mediaId) {
            //                     let actionTypeFromDb = listOfFeedObj[i].mediaStats[k].activities;
            //                     if (actionTypeFromDb == "views" && listOfFeedObj[i].mediaStats[k].isLike === true) {
            //                         if (listOfFeedObj[i].mediaStats[k].memberId == memberId) {
            //                             isMediaLikedByCurrentUser = true;
            //                         }
            //                         medialikesCount = medialikesCount + 1;
            //                     } else if (actionTypeFromDb == "comment") {
            //                         mediaCommentsCount = mediaCommentsCount + 1;
            //                     }
            //                 }
            //             }
            //             listOfFeedObj[i].media[j].mediaLikesCount = medialikesCount;
            //             listOfFeedObj[i].media[j].mediaCommentsCount = mediaCommentsCount;
            //             listOfFeedObj[i].media[j].isMediaLikedByCurrentUser = isMediaLikedByCurrentUser;
            //             //listOfFeedObj[i].mediaStats = [];
            //         }

            //     }

            //     listOfFeedObj[i].feedLikesCount = feedlikesCount;
            //     listOfFeedObj[i].feedCommentsCount = feedCommentsCount;
            //     listOfFeedObj[i].isFeedLikedByCurrentUser = isFeedLikedByCurrentUser;
            //     //listOfFeedObj[i].feedStats = [];
            //     if (listOfFeedObj[i].feedByMemberDetails[0] != undefined) {
            //         listOfFeedObj[i].isCeleb = listOfFeedObj[i].feedByMemberDetails[0].isCeleb ? true : false;
            //         listOfFeedObj[i].isManager = listOfFeedObj[i].feedByMemberDetails[0].isManager ? true : false;
            //     }
            // }
            callback(null, listOfFeedObj);
        }

        else
            callback(err, null)
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
    //$match: { memberId: { $in: query.memberListArray }, created_at: { $lt: new Date(query.paginationDate) }, isDelete: false }
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
let feedServices = {
    findFeedByMemberId: findFeedByMemberId,
    findFeedByFeedPreferences: findFeedByFeedPreferences
}

module.exports = feedServices;