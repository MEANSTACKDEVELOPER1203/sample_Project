let Story = require('./storyModel');
let userService = require('../users/userService');
let User = require('../users/userModel');
let ObjectId = require('mongodb').ObjectId;
let async = require('async');
var Jimp = require('jimp');
let memberPreferenceServices = require('../memberpreferences/memberPreferenceServices');
let StoryTracking = require('../storyTracking/storyTrackingModel');

let provideData = {
    _id: 1, avtar_imgPath: 1, avtar_originalname: 1, cover_imgPath: 1, custom_imgPath: 1,
    imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
    isTrending: 1, aboutMe: 1, category: 1, preferenceId: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
}


// let saveStory = function (storyObj, files, callback) {
//     // console.log(storyObj)

// }

const saveStory = query =>
    new Promise((resolve, reject) => {
        let now = new Date()
        let endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        // console.log(files)
        now = new Date()
        let storyArr = [];
        if (query.files.length > 0) {
            for (let i = 0; i < query.files.length; i++) {
                let storyInfo1 = {}
                let src = {};
                let thumbnailUrl = "";
                let mediaRatio = parseFloat(query.storyObj.media[i].mediaRatio);
                if (query.storyObj.media[i].mediaType == "video") {
                    videoUrl = query.files[i].path; //video path url
                    thumbnailUrl = query.files[i + 1].path; //thumbnail url 
                    thumbnailName = query.files[i + 1].filename; //thumbnail name
                    thumbnail = 'uploads/storyThumbnails/' + thumbnailName;
                    var thumbNailPath = "uploads/story/" + thumbnailName;
                    var destThumbnailPath = 'uploads/storyThumbnails/' + thumbnailName;
                    query.files.splice(i + 1, 1);

                    function convert(thumbNailPath, destThumbnailPath, height, width) {
                        return new Promise(function (resolve, reject) {
                            Jimp.read(thumbNailPath, (err, lenna) => {
                                if (err) {
                                    Story.update({ "memberId": ObjectId(query.storyObj.memberId), 'src.thumbnailUrl': destThumbnailPath }, { 'src.thumbnailUrl': thumbNailPath }, (err, updated) => {
                                        // console.log("Article -- Update Story thumnail--1 ", updated)
                                    });
                                }
                                else {
                                    lenna
                                        .resize(width, height) // resize
                                        .quality(60) // set JPEG quality
                                        // .greyscale() // set greyscale
                                        .write(destThumbnailPath, (err, data) => {
                                            if (!err)
                                                resolve(destThumbnailPath);
                                        });
                                    // save
                                }
                            });
                        })
                    }
                    async function main() {

                        width = 500;
                        height = mediaRatio * width;
                        await convert(thumbNailPath, destThumbnailPath, height, width);
                    }
                    main();
                }
                else {
                    thumbnailName = query.files[i].filename;
                    thumbnail = 'uploads/storyThumbnails/' + thumbnailName;
                    var thumbNailPath = "uploads/story/" + thumbnailName;
                    var destThumbnailPath = 'uploads/storyThumbnails/' + thumbnailName;
                    function convert(thumbNailPath, destThumbnailPath, height, width) {
                        return new Promise(function (resolve, reject) {

                            Jimp.read(thumbNailPath, (err, lenna) => {
                                if (err) {
                                    Story.update({ "memberId": ObjectId(query.storyObj.memberId), 'src.thumbnailUrl': destThumbnailPath }, { $set: { 'src.thumbnailUrl': thumbNailPath } }, (err, updated) => {
                                        // console.log("444444", updated)
                                    })
                                }
                                else {
                                    lenna
                                        .resize(width, height) // resize
                                        .quality(60) // set JPEG quality
                                        // .greyscale() // set greyscale
                                        .write(destThumbnailPath, (err, data) => {
                                            if (!err) {
                                                // console.log("saved")
                                                resolve(destThumbnailPath);
                                            }
                                            else {
                                                console.log("err")
                                            }

                                        }); // save
                                }
                            });
                        })
                    }
                    async function main() {
                        width = 500;
                        height = mediaRatio * width;
                        await convert(thumbNailPath, destThumbnailPath, height, width);
                    }
                    main();
                }
                let mediaUrl = query.files[i].path;
                mimeType = query.files[i].mimetype;
                let mediaName = query.files[i].filename;
                src.mediaUrl = mediaUrl;
                src.thumbnailUrl = thumbnail;
                let mediaCaption = query.storyObj.media[i].mediaCaption;
                let videoDuration = parseFloat(query.storyObj.media[i].videoDuration);
                let mediaType = query.storyObj.media[i].mediaType;
                storyInfo1 = new Story({
                    memberId: query.storyObj.memberId,
                    startTime: now,
                    endTime: endTime,
                    mediaType: mediaType,
                    mediaName: mediaName,
                    src: src,
                    mediaRatio: mediaRatio,
                    mediaCaption: mediaCaption,
                    videoDuration: videoDuration
                })
                storyArr.push(storyInfo1);
            }
        } else {
            let storyInfo = new Story({
                title: query.storyObj.title,
                memberId: query.storyObj.memberId,
                startTime: now,
                endTime: endTime,
                mediaType: "text"
            });
            storyArr.push(storyInfo);
        }
        //createdStoryObj
        Story.insertMany(storyArr).then(createdStoryObj => resolve(createdStoryObj))
            .catch(err => reject(err))
        // => {
        //     if (!err)
        //         callback(null, createdStoryObj);
        //     else
        //         callback(err, null)
        // })
    })


const findStoryProfileByMemberIdAsync = query =>
    new Promise((resolve, reject) => {
        query.fanFollowList.push(ObjectId(query.memberId));
        let now = new Date();
        // console.log("list ===== ",query.fanFollowList)
        // let nowTs = now.getTime();
        let endTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        // new Date(now.setUTCHours(now.getUTCHours() - 24));
        // let endTimeTs = endTime.getTime();
        // console.log("memberId === ", typeof query.memberId)

        Story.aggregate([
            {
                $match: { memberId: { $in: query.fanFollowList }, createdAt: { $lt: new Date(now), $gt: new Date(endTime) }, isDeleted: false }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: 30
            },
            {
                $lookup: {
                    "from": "storyTracking",
                    "let": { "storyId": "$_id" },
                    "pipeline": [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$storyId", "$$storyId"] },
                                        { '$eq': ['$memberId', ObjectId(query.memberId)] },
                                    ]
                                }
                            }
                        },
                    ],
                    "as": "storyTrackingByCurrentUser"
                }
            },
            {
                $unwind: {
                    path: "$storyTrackingByCurrentUser",
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                "$group": {
                    "_id": { memberId: "$memberId" },
                    totalStoryCount: { $sum: 1 },
                    "memberId": { $first: "$memberId" },
                    "createdAt": { $first: "$createdAt" },
                    "storyTrackingByCurrentUser": { $push: "$storyTrackingByCurrentUser" },

                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.memberId",
                    foreignField: "_id",
                    as: "storyMemberInfo"
                }
            },
            {
                $unwind: "$storyMemberInfo"
            },
            {
                $project: {
                    memberId: 1,
                    createdAt: 1,
                    totalStoryCount: 1,
                    storyTrackingByCurrentUser: 1,
                    storyMemberInfo: {
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
                    }
                }
            },
        ]).then(listOfStoryObj => resolve(listOfStoryObj))
            .catch(err => reject(err))
    })

let getMemberFanFollow = function (memberId, callback) {
    memberPreferenceServices.findFanFollowByMemberId(memberId, (err, memberPreferenceObj) => {
        if (!err)
            callback(null, memberPreferenceObj);
        else
            callback(err, null)
    })
}

let findStory = (celebId, createdAt, currentUserId, callback) => {
    celebId = ObjectId(celebId);
    let now = new Date();
    // let nowTs = now.getTime();
    let endTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    //new Date(now.setHours() - 24);
    // let endTimeTs = endTime.getTime();
    // console.log("Between start", now, "to end", endTime);
    userService.getCelebDetailsById(celebId, (err, celebInfoObj) => {
        if (err)
            callback(err, null, null, null);
        else {
            Story.aggregate([
                {
                    $match: { $and: [{ memberId: celebId, createdAt: { $lt: new Date(now), $gt: new Date(endTime) }, isDeleted: false }] }
                },
                {
                    $sort: { createdAT: -1 }
                },
                {
                    $lookup: {
                        from: "storyTracking",
                        localField: "_id",
                        foreignField: "storyId",
                        as: "storyStats"
                    }
                },
                {
                    $lookup: {
                        "from": "storyTracking",
                        "let": { "storyId": "$_id" },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        $and: [{ "$eq": ["$storyId", "$$storyId"] }
                                            // { "$eq": ["$seenBy", "other"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    "from": "users",
                                    "let": { "memberId": "$memberId" },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    $and: [
                                                        { "$eq": ["$_id", "$$memberId"] },
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "as": "userDetails"
                                }
                            }
                        ],
                        "as": "storyTrackingDetails"
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "src": 1,
                        "mediaCaption": 1,
                        "videoDuration": 1,
                        "mediaType": 1,
                        "mediaName": 1,
                        "memberId": 1,
                        "title": 1,
                        "createdAt": 1,
                        "faceFeatures": 1,
                        "isDeleted": 1,
                        "storyTrackingDetails": 1,
                        "userDetails": 1,
                        seenCount: {
                            $size: {
                                $filter: {
                                    input: "$storyStats",
                                    cond: { $and: [{ "$eq": ["$$this.isSeen", true] }, { "$eq": ["$$this.seenBy", "other"] }] }
                                }
                            }
                        },
                        isSeen: {
                            $size: {
                                $filter: {
                                    input: "$storyStats",
                                    cond: {
                                        $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(currentUserId)] }] },
                                        { "$eq": ["$$this.isSeen", true] }]
                                    }
                                }
                            }
                        },
                    }
                }
            ], function (err, listOfStoryObj) {
                if (err)
                    callback(err, null, null, null)
                else {
                    // console.log("Tehere is indivual story for user", listOfStoryObj);
                    let isSeenCount = 0;
                    let seenProfilesArr = [];
                    // console.log("PPPPPPPPP1111", isSeenCount);
                    listOfStoryObj.map((story) => {
                        story.storyTrackingDetails.map((statsObj, index) => {
                            let memberId = statsObj.memberId
                            // console.log("PPPPPPPPP1111", statsObj);
                            // memberId = "" + memberId;
                            if ("" + memberId == "" + currentUserId) {
                                isSeenCount = isSeenCount + 1;
                            }
                            if ("" + celebId == "" + currentUserId) {
                                if ("" + memberId == "" + celebId)
                                    story.storyTrackingDetails.splice(index, 1)
                            }
                        })
                    });
                    // console.log("PPPPPPPPP2222", isSeenCount);
                    listOfStoryObj.map((story) => {
                        if (story.storyTrackingDetails.length > 0) {
                            let seenLength = 5;
                            let seenProfileObj = {};
                            let storytrackingDetailsArr = story.storyTrackingDetails;
                            let count = 0
                            if (storytrackingDetailsArr.length < 5)
                                seenLength = storytrackingDetailsArr.length
                            for (let i = 0; i < seenLength; i++) {
                                seenProfileObj = {};
                                seenProfileObj._id = storytrackingDetailsArr[i].userDetails[0]._id;
                                seenProfileObj.isCeleb = storytrackingDetailsArr[i].userDetails[0].isCeleb;
                                seenProfileObj.isManager = storytrackingDetailsArr[i].userDetails[0].isManager;
                                seenProfileObj.isOnline = storytrackingDetailsArr[i].userDetails[0].isOnline;
                                seenProfileObj.avtar_imgPath = storytrackingDetailsArr[i].userDetails[0].avtar_imgPath;
                                seenProfileObj.firstName = storytrackingDetailsArr[i].userDetails[0].firstName;
                                seenProfileObj.lastName = storytrackingDetailsArr[i].userDetails[0].lastName;
                                seenProfileObj.profession = storytrackingDetailsArr[i].userDetails[0].profession;
                                seenProfileObj.gender = storytrackingDetailsArr[i].userDetails[0].gender;
                                seenProfileObj.username = storytrackingDetailsArr[i].userDetails[0].username;
                                seenProfileObj.country = storytrackingDetailsArr[i].userDetails[0].country;
                                seenProfileObj.cover_imgPath = storytrackingDetailsArr[i].userDetails[0].cover_imgPath;
                                // console.log(storytrackingDetailsArr[i].userDetails[0].firstName)
                                seenProfilesArr.push(seenProfileObj);
                            }
                            story.storySeenProfiles = seenProfilesArr;
                            seenProfilesArr = [];
                            story.storyTrackingDetails = [];
                            // console.log(story.storytrackingDetails.length)
                        } else {
                            story.storySeenProfiles = [];
                        }
                        return story
                    })
                    callback(null, listOfStoryObj, celebInfoObj, isSeenCount)
                }
            })
        }
    })
}

let findStory1 = function (celebId, createdAt, currentUserId, callback) {
    celebId = ObjectId(celebId);
    let now = new Date();
    let endTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    // console.log("Between start", now, "to end", endTime);
    getUserDetails(currentUserId, (err, userObj) => {
        if (err)
            callback(err, null);
        else {
            getMemberFanFollow(currentUserId, (err, listOfFanFollowObj) => {
                if (err)
                    callback(err, null)
                else if (!listOfFanFollowObj || listOfFanFollowObj.celebrities.length <= 0) {
                    callback(null, null)
                }
                else {
                    let fanFollowCelebIds = listOfFanFollowObj.celebrities.map((celebObj) => {
                        return (celebObj.CelebrityId);
                    });
                    if (userObj.isCeleb == true)
                        fanFollowCelebIds.push(userObj._id);
                    getCurrentCelebForStory(fanFollowCelebIds, (err, celebIds) => {
                        if (err)
                            callback(err, null);
                        else {
                            // console.log(celebIds);
                            User.aggregate([
                                { $match: { _id: { $in: celebIds }, IsDeleted: false } },
                                {
                                    $lookup: {
                                        from: "story",
                                        "let": { "memberId": "$_id" },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            { $eq: ["$memberId", "$$memberId"] },
                                                            { '$lte': ['$createdAt', new Date(now)] },
                                                            { '$gte': ['$createdAt', new Date(endTime)] },
                                                            { $eq: ["$isDeleted", false] }
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $lookup: {
                                                    from: "storyTracking",
                                                    let: { "storyId": "$_id" },
                                                    pipeline: [{
                                                        $match: {
                                                            "$expr": {
                                                                $and: [{ "$eq": ["$storyId", "$$storyId"] },
                                                                    //{ "$eq": ["$seenBy", "other"] }
                                                                ]
                                                            }
                                                            // $expr: {
                                                            //     $eq: ["$storyId", "$$storyId"]
                                                            // }
                                                        }
                                                    },
                                                    {
                                                        $lookup: {
                                                            "from": "users",
                                                            "let": { "memberId": "$memberId" },
                                                            "pipeline": [
                                                                { "$match": { "$expr": { "$eq": ["$_id", "$$memberId"] } } }
                                                            ],
                                                            "as": "userDetails"

                                                        }
                                                    },
                                                    {
                                                        $unwind: {
                                                            path: "$userDetails",
                                                            preserveNullAndEmptyArrays: true
                                                        }
                                                    }
                                                    ],
                                                    "as": "storyStats"
                                                }
                                            },
                                        ],
                                        "as": "storyDetails"
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        isCeleb: 1,
                                        isManager: 1,
                                        isOnline: 1,
                                        avtar_imgPath: 1,
                                        profession: 1,
                                        gender: 1,
                                        country: 1,
                                        cover_imgPath: 1,
                                        aboutMe: 1,
                                        storyDetails: 1
                                    }
                                }
                            ], function (err, listOfStoryObj) {
                                if (err)
                                    callback(err, []);
                                else {
                                    let parentArr = [];
                                    let celebInfo = {};
                                    let storyArr = [];
                                    let isSeen = 0;
                                    let seenProfilesArr = [];
                                    // let seenLength = 5;
                                    let seenProfileObj = {};
                                    listOfStoryObj.map((story) => {
                                        celebInfo = {};
                                        storyArr = []
                                        celebInfo._id = story._id;
                                        celebInfo.isCeleb = story.isCeleb;
                                        celebInfo.isManager = story.isManager;
                                        celebInfo.isOnline = story.isOnline;
                                        celebInfo.avtar_imgPath = story.avtar_imgPath;
                                        celebInfo.firstName = story.firstName;
                                        celebInfo.lastName = story.lastName;
                                        celebInfo.profession = story.profession;
                                        celebInfo.gender = story.gender;
                                        celebInfo.username = story.username;
                                        celebInfo.country = story.country;
                                        celebInfo.cover_imgPath = story.cover_imgPath;
                                        celebInfo.aboutMe = story.aboutMe;
                                        story.storyDetails.map((storyObj) => {
                                            seenProfilesArr = [];
                                            storyObj.seenCount = storyObj.storyStats.filter(count => count.seenBy == 'other').length;
                                            storyArr.push(storyObj);
                                            storyObj.storyStats.map((storyStatsObj, index) => {
                                                seenProfileObj = {};
                                                let memberId = storyStatsObj.memberId;
                                                memberId = "" + memberId;
                                                if (currentUserId == memberId)
                                                    isSeen = 1
                                                if (index < 5 && storyStatsObj.seenBy == 'other') {
                                                    seenProfileObj._id = storyStatsObj.userDetails._id;
                                                    seenProfileObj.isCeleb = storyStatsObj.userDetails.isCeleb;
                                                    seenProfileObj.isManager = storyStatsObj.userDetails.isManager;
                                                    seenProfileObj.isOnline = storyStatsObj.userDetails.isOnline;
                                                    seenProfileObj.avtar_imgPath = storyStatsObj.userDetails.avtar_imgPath;
                                                    seenProfileObj.firstName = storyStatsObj.userDetails.firstName;
                                                    seenProfileObj.lastName = storyStatsObj.userDetails.lastName;
                                                    seenProfileObj.profession = storyStatsObj.userDetails.profession;
                                                    seenProfileObj.gender = storyStatsObj.userDetails.gender;
                                                    seenProfileObj.username = storyStatsObj.userDetails.username;
                                                    seenProfileObj.country = storyStatsObj.userDetails.country;
                                                    seenProfileObj.cover_imgPath = storyStatsObj.userDetails.cover_imgPath;
                                                    seenProfilesArr.push(seenProfileObj);
                                                }
                                            });
                                            storyObj.isSeen = isSeen;
                                            storyObj.storySeenProfiles = seenProfilesArr;
                                            storyObj.storyStats = [];
                                            isSeen = 0;
                                        })
                                        let addObj = {
                                            celebInfo: celebInfo,
                                            storyArr: storyArr
                                        }
                                        parentArr.push(addObj)
                                    })
                                    callback(null, parentArr)
                                }
                            })
                        }
                    });
                }
            });
        }
    })
}

let deleteStoryId = function (storyId, callback) {
    Story.findByIdAndUpdate(ObjectId(storyId), { $set: { isDeleted: true } }, { new: true }, (err, deleteStoryObj) => {
        if (!err)
            callback(null, deleteStoryObj);
        else
            callback(err, null)
    })
}

let getUserDetails = function (memberId, callback) {
    userService.getCelebDetailsById(memberId, (err, userObj) => {
        if (!err)
            callback(null, userObj);
        else
            callback(err, null)
    })
}

let getCurrentCelebForStory = function (fanFollowCelebIds, callback) {
    let now = new Date();
    let endTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    Story.distinct("memberId", { memberId: { $in: fanFollowCelebIds }, createdAt: { $lt: new Date(now), $gt: new Date(endTime) } }, (err, celebsId) => {
        if (!err)
            callback(null, celebsId);
        else
            callback(err, null)
    })
}

let storyServices = {
    saveStory: saveStory,
    findStory: findStory,
    deleteStoryId: deleteStoryId,
    findStory1: findStory1,
    findStoryProfileByMemberIdAsync: findStoryProfileByMemberIdAsync,
};
module.exports = storyServices;