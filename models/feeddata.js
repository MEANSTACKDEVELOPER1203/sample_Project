let mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose, 3);
let ObjectId = require("mongodb").ObjectID;
const post = require("../constants").post;
const image = require("../constants").image;
const video = require("../constants").video;
const gif = require("../constants").gif;
let MediaTracking = require('../components/mediaTracking/mediaTrackingModel');
let paid;
let promoted;
let free;
let quickPost;
let audio;
let teaser;
let releasePoster;
let audioRelease;
let fan;
let follow;
let fan_follow;
let public;
let premium;
let created;
let underReview;
let approved;
let rejected;
let archived;
let mediaPost;
let everyone;
let self;
let doNotAllow;
let allowIndividualFiles;
let allMediaFiles;
let allowIndividualPages;
let entireSeries;
let Both;

let FeedSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //if switched from manager to celebrity profile
    //if post by manager
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    service_type: {
        type: String,
        enum: [quickPost, mediaPost, premium]
    },
    content_type: {
        type: String,
        enum: [post, video, audio, teaser, releasePoster, audioRelease]
    },
    title: {
        type: String,
        default: ""
    },
    mediaSrc: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        default: ""
    },
    profanityCheck: {
        type: Boolean,
        default: false
    },
    tags: {
        type: Array,
        default: []
    },
    viewOptions: {
        type: String,
        default: "",
        enum: [fan, follow, everyone, fan_follow, self]
    },
    industry: {
        type: String,
        default: ""
    },
    hideObj: {
        isHide: {
            type: Boolean,
            default: false
        },
        hideById: {
            type: mongoose.Schema.Types.ObjectId,
            default: ObjectId("5c6aa7fc250d3114ffe670ff") //provide dummy id for query satisfaction
        }
    },
    media: [{
        mediaId: mongoose.Schema.Types.ObjectId,
        mediaRatio: {
            type: Float,
            default: 0.000
        },
        mediaCaption: {
            type: String,
            default: "",
        },
        mediaType: {
            type: String,
            default: "",
            enum: [image, video, audio, gif]
        },
        mediaSize: {
            type: Float
            //default: 0.000
        },
        mediaCreditValue: {
            type: Number,
            default: 0.0
        },
        src: {
            mediaUrl: {
                type: String,
                default: ""
            },
            mediaName: {
                type: String,
                default: ""
            },
            videoUrl: {
                type: String,
                default: ""
            },
            thumbnail: {
                type: String,
                default: ""
            }
        },
        faceFeatures: [{
            posX: {
                type: Number,
            },
            posY: {
                type: Number,
            },
            width: {
                type: Number,
            },
            height: {
                type: Number,
            }
        }]
    }],
    contentArray: [{
        content_id: mongoose.Schema.Types.ObjectId,
        contentTitle: {
            type: String,
            default: ""
        },
        contentDescription: {
            type: String,
            default: ""
        },
        contentType: {
            type: String,
            enum: [image, video, audio]
        },
        contentUrl: String,
        contentCreditValue: Number,
        contentStatus: {
            type: Boolean,
            default: false
        },
    }],
    downloadOptions: {
        downloadType: {
            type: String,
            enum: [doNotAllow, allowIndividualFiles, allMediaFiles]
        },
        downloadStatus: {
            type: Boolean,
            default: false
        },
    },
    subscriptionType: {
        type: String,
        enum: [allowIndividualPages, entireSeries, Both],
        default: ""
    },
    offlineStatus: {
        type: Boolean,
        default: false
    },
    boostSettings: {
        proposedBudget: {
            type: Number,
            default: 0
        },
        proposedReach: {
            type: Number,
            default: 0
        }
    },
    isPrometed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: [created, underReview, approved, rejected, archived],
        default: "created"
    },
    approvedBy: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date,
        default: new Date()
    },
    createdBy: {
        type: String
    },
    updatedBy: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isDraft: {
        type: Boolean,
        default: false
    },
    countryCode: {
        type: String
    },
    state: {
        type: String
    }
},
    {
        versionKey: false
    });


let Feed = (module.exports = mongoose.model("Feed", FeedSchema));

// Create a Feed

// module.exports.createFeed = function (Feed, callback) {
//     Feed.save(callback);
// };

// Edit a Feed

// module.exports.editFeed = function (id, reqbody, callback) {
//     Feed.findByIdAndUpdate(id, { $set: reqbody }, { new: true }, callback);
// };

// Find by Id

module.exports.getFeedById = (id, callback) => {
    Feed.findById(ObjectId(id), callback);
};

/************************All services PK Start ******************************* */


let provideData = {
    _id: 1, avtar_imgPath: 1, avtar_originalname: 1, cover_imgPath: 1, custom_imgPath: 1,
    imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
    isTrending: 1, aboutMe: 1, category: 1, preferenceId: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
}

module.exports.getFeedById_PK = function (query, callback) {
    //Feed.findById(ObjectId(id), callback);
    let memberId = query.memberId;
    Feed.aggregate([
        {
            $match: { _id: ObjectId(query.feedId) }
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
                feedByMemberDetails: provideData,
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
        },
    ], function (err, listOfFeedObj) {
        if (err)
            callback(err, null);
        else {
            if (listOfFeedObj.length > 0)
                callback(null, listOfFeedObj[0]);
            else
                callback(null, [])
        }
    })
};




module.exports.saveFeed_PK = function (feedObj, callback) {

    var feedInfo = new Feed({
        memberId: feedObj.memberId,
        content: feedObj.content,
        title: feedObj.title,
        memberName: feedObj.username,
        profilePicPath: feedObj.profilePicPath,
        media: feedObj.mediaArray,
        created_at: new Date(),
        status: "Active",
        createdBy: feedObj.createdBy,
        location: feedObj.location,
        content_type: feedObj.content_type,
        service_type: feedObj.service_type,
        isDelete: false,
        mediaSize: feedObj.mediaSize,
        countryCode: feedObj.countryCode,
        state: feedObj.state

    });
    Feed.create(feedInfo, (err, saveFeedObj) => {
        if (!err) {
            return callback(null, saveFeedObj);
        }
        else
            return callback(err, null);
    });
}

//get all feeds

module.exports.findAllFeed = function (query, callback) {
    //console.log(query)
    let matchQuery = ""
    let matchQuery2 = ""
    let matchQuery3 = ""
    let memberId = query.memberId;
    let created_at = query.created_at;
    if (query.countryCode == "0" && query.countryCode == null && query.state == "0" && query.state == null) {
        if (query.created_at == "0")
            created_at = new Date();
        matchQuery = [
            { isDelete: false },
            { created_at: { $lt: new Date(created_at) } }
        ]
        matchQuery2 = [
            { isDelete: "" }
        ]
        matchQuery3 = [
            { isDelete: "" }
        ]
    }
    else if (created_at === "0") {
        matchQuery = [
            { isDelete: false },
            { countryCode: query.countryCode },
            { state: query.state }

        ]
        matchQuery2 = [
            { isDelete: false },
            { countryCode: query.countryCode },
            { state: { $ne: query.state } }
        ]
        matchQuery3 = [
            { isDelete: false },
            { countryCode: { $ne: query.countryCode } },
            { state: { $ne: query.state } }
        ]
    }
    else {
        matchQuery = [
            { isDelete: false },
            { countryCode: query.countryCode },
            { state: query.state },
            { created_at: { $lt: new Date(created_at) } }

        ]
        matchQuery2 = [
            { isDelete: false },
            { countryCode: query.countryCode },
            { state: { $ne: query.state } },
            { created_at: { $lt: new Date(created_at) } }
        ]
        matchQuery3 = [
            { isDelete: false },
            { countryCode: { $ne: query.countryCode } },
            { state: { $ne: query.state } },
            { created_at: { $lt: new Date(created_at) } }
        ]
    }

    Feed.aggregate([

        {
            "$facet": {
                "c1": [
                    {
                        "$match": {
                            $and: matchQuery
                        }
                    },
                    {
                        $sort: { created_at: -1 }
                    }
                ],
                "c2": [
                    {
                        "$match": {
                            $and: matchQuery2
                        }
                    },
                    {
                        $sort: { created_at: -1 }
                    }
                ],
                "c3": [
                    {
                        "$match": {
                            $and: matchQuery3
                        }
                    },
                    {
                        $sort: { created_at: -1 }
                    }
                ]
            }
        },
        {
            "$project": {
                "data": {
                    "$concatArrays": ["$c1", "$c2", "$c3"]
                }
            }
        },
        { "$unwind": "$data" },
        {
            $limit: 10
        },
        { "$replaceRoot": { "newRoot": "$data" } },
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
                as: "feedStats" // to get all the views, comments, shares count
            },

        },
        {
            $lookup: {
                from: "mediatrackings",
                localField: "media.mediaId",
                foreignField: "mediaId",
                as: "mediaStats"
            },
        },
        {
            $sort: { created_at: -1 }
        },
        {
            $project: {
                "_id": 1,
                "downloadOptions": 1,
                "boostSettings": 1,
                "title": 1,
                "mediaSrc": 1,
                "content": 1,
                "imageRatio": 1,
                "profanityCheck": 1,
                "tags": 1,
                "viewOptions": 1,
                "industry": 1,
                "subscriptionType": 1,
                "offlineStatus": 1,
                "isPrometed": 1,
                "status": 1,
                "approvedBy": 1,
                "updatedBy": 1,
                "location": 1,
                "isDelete": 1,
                "memberId": 1,
                "media": 1,
                "created_at": 1,
                "contentArray": 1,
                "updated_at": 1,
                "feedLikesCount": 1,
                "feedCommentsCount": 1,
                "isFeedLikedByCurrentUser": 1,
                "state": 1,
                "countryCode": 1,
                mediaStats: 1,
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
                },
                feedlikesCount: {
                    $size: {
                        $filter: {
                            input: "$feedStats",
                            cond: { "$eq": ["$$this.activities", "views"] }
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
                            cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
                        }
                    }
                }
            }
        }
    ], function (err, listOfFeedObj) {

        // console.log(listOfFeedObj)
        if (err)
            callback(err, null)
        else {
            callback(null, listOfFeedObj);
        }
    });
}

module.exports.updateFeedById = function (feedId, feedObj, callback) {
    Feed.findByIdAndUpdate(feedId, feedObj, { new: true }).lean().exec((err, updatedObj) => {
        if (!err)
            callback(null, updatedObj);
        else
            callback(err, null)

    })
}


//get feed likes by feed id
module.exports.findFeedLikesById = function (feedId, createdAt, callback) {
    // let createdAt = params.createdAt;
    let getLikesByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getLikesByTime = createdAt
    }
    feedId = ObjectId(feedId);
    // console.log(getLikesByTime)
    MediaTracking.aggregate([
        {
            $match: { $and: [{ feedId: feedId }, { activities: "views" }, { isLike: true }, { created_at: { $lt: new Date(getLikesByTime) } }] }
        },
        {
            $sort: { created_at: -1 }
        },
        {
            $limit: 50
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
            $match: { $and: [{ memberProfile: { $ne: [] } }] }
        },
        { "$unwind": "$memberProfile" },
        {
            $project: {
                _id: 1,
                isLike: 1,
                created_at: 1,
                updated_at: 1,
                "memberProfile._id": 1,
                "memberProfile.username": 1,
                "memberProfile.avtar_imgPath": 1,
                "memberProfile.email": 1,
                "memberProfile.name": 1,
                "memberProfile.firstName": 1,
                "memberProfile.lastName": 1,
                "memberProfile.isCeleb": 1,
                "memberProfile.profession": 1,
                "memberProfile.aboutMe": 1,

            }
        }

    ], function (err, listOfFeedLikesObj) {
        // console.log(listOfFeedLikesObj.length)
        if (!err)
            callback(null, listOfFeedLikesObj);
        else
            callback(err, null);
    }
    )
}

//get media likes by feed id
// module.exports.findMediaLikesById = function (mediaId, createdAt, callback) {
//     let getLikesByTime = new Date();
//     if (createdAt != "null" && createdAt != "0") {
//         getLikesByTime = createdAt
//     }
//     mediaId = ObjectId(mediaId);
//     MediaTracking.aggregate([
//         {
//             $match: { $and: [{ mediaId: mediaId }, { activities: "views" }, { isLike: true }, { created_at: { $lt: new Date(getLikesByTime) } }] }
//         },
//         {
//             $sort: { created_at: -1 }
//         },
//         {
//             $limit: 50
//         },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "memberId",
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
//                 isLike: 1,
//                 created_at: 1,
//                 updated_at: 1,
//                 "memberProfile._id": 1,
//                 "memberProfile.username": 1,
//                 "memberProfile.avtar_imgPath": 1,
//                 "memberProfile.email": 1,
//                 "memberProfile.name": 1,
//                 "memberProfile.firstName": 1,
//                 "memberProfile.lastName": 1,
//                 "memberProfile.isCeleb": 1,
//                 "memberProfile.profession": 1,
//                 "memberProfile.aboutMe": 1,
//             }
//         }
//     ], function (err, listOfMediaLikesObj) {
//         if (!err)
//             callback(null, listOfMediaLikesObj);
//         else
//             callback(err, null);
//     }
//     )
// }

//get feed Comments by feed id pagination
module.exports.findFeedCommentsByFeedId = (params, callback) => {
    let feedId = ObjectId(params.feed_Id);
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    let limit = parseInt(20)
    if (feedId && createdAt && limit) {
        MediaTracking.aggregate([
            {
                $match: { feedId: feedId, activities: "comment", created_at: { $lt: new Date(getNotificatonByTime) } }
            },
            {
                $sort: { created_at: -1 }
            },
            {
                $limit: limit
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
                $match: { $and: [{ memberProfile: { $ne: [] } }] }
            },
            { "$unwind": "$memberProfile" },
            {
                $project: {
                    _id: 1,
                    isLike: 1,
                    source: 1,
                    created_at: 1,
                    "memberProfile._id": 1,
                    "memberProfile.username": 1,
                    "memberProfile.avtar_imgPath": 1,
                    "memberProfile.email": 1,
                    "memberProfile.name": 1,
                    "memberProfile.firstName": 1,
                    "memberProfile.lastName": 1,
                    "memberProfile.isCeleb": 1,
                    "memberProfile.profession": 1,
                    "memberProfile.aboutMe": 1,
                }
            }
        ], (err, listOfCommentsLikesObj) => {
            if (!err)
                callback(null, listOfCommentsLikesObj);
            else
                callback(err, null);
        })
    } else {
        callback("Please Provide all params(feedId,limit,createdAt)", null)
    }
}

module.exports.findMediaCommentsByMediaId = (params, callback) => {
    let mediaId = ObjectId(params.mediaId);
    let feedId = ObjectId(params.feedId);
    let conditionObj = {};
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    let limit = parseInt(10)
    Feed.findById(feedId, (err, feedObj) => {
        if (err)
            console.log("Error while fetching the feed ");
        else {
            if (feedObj.media.length <= 1) {
                conditionObj = { feedId: feedId, activities: "comment", created_at: { $lt: new Date(getNotificatonByTime) } }
            } else {
                conditionObj = { mediaId: mediaId, activities: "comment", created_at: { $lt: new Date(getNotificatonByTime) } }
            }
            // console.log(conditionObj, "condition ")
            MediaTracking.aggregate([
                {
                    $match: conditionObj
                },
                {
                    $sort: { created_at: -1 }
                },
                {
                    $limit: limit
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
                    $match: { $and: [{ memberProfile: { $ne: [] } }] }
                },
                { "$unwind": "$memberProfile" },
                {
                    $project: {
                        _id: 1,
                        isLike: 1,
                        source: 1,
                        created_at: 1,
                        "memberProfile._id": 1,
                        "memberProfile.username": 1,
                        "memberProfile.avtar_imgPath": 1,
                        "memberProfile.email": 1,
                        "memberProfile.name": 1,
                        "memberProfile.firstName": 1,
                        "memberProfile.lastName": 1,
                        "memberProfile.isCeleb": 1,
                        "memberProfile.profession": 1,
                        "memberProfile.aboutMe": 1,
                    }
                }
            ], function (err, listOfMediaCommentsObj) {
                if (!err)
                    callback(null, listOfMediaCommentsObj);
                else
                    callback(err, null);
            })

        }
    })


}
/************************All services PK End ******************************* */