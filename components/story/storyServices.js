let Story = require('./storyModel');
let userService = require('../users/userService');
let User = require('../users/userModel');
let ObjectId = require('mongodb').ObjectId;
let memberPreferenceServices = require('../memberpreferences/memberPreferenceServices');

let saveStory = function (storyObj, files, callback) {
    // console.log(storyObj)
    let now = new Date()
    // let startTimeTS = now.getTime();
    // console.log("current time ", now);
    // console.log("current time ", now.getTime());
    let endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    // new Date(now.setHours(now.getHours() + 24));
    // let endTimeTS = endTime.getTime();
    // console.log(files)
    now = new Date()
    let storyArr = [];
    let mimeType;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            let storyInfo1 = {}
            let src = {};
            let mediaUrl = files[i].path;
            mimeType = files[i].mimetype;
            let mediaName = files[i].filename;
            // let mediaType = ""
            // if (mimeType != "image/jpeg" || mimeType != "image/png")
            //     mediaType = "image"
            // else
            //     mediaType = "video";
            src.mediaUrl = mediaUrl;
            src.thumbnailUrl = "";
            let mediaCaption = storyObj.media[i].mediaCaption;
            let mediaType = storyObj.media[i].mediaType;
            storyInfo1 = new Story({
                memberId: storyObj.memberId,
                startTime: now,
                endTime: endTime,
                // startTimeTS: startTimeTS,
                // endTimeTS: endTimeTS,
                mediaType: mediaType,
                mediaName: mediaName,
                src: src,
                mediaCaption: mediaCaption
            })
            storyArr.push(storyInfo1);
        }
    } else {
        let storyInfo = new Story({
            title: storyObj.title,
            memberId: storyObj.memberId,
            startTime: now,
            endTime: endTime,
            // startTimeTS: startTimeTS,
            // endTimeTS: endTimeTS,
            mediaType: "text"
        });
        storyArr.push(storyInfo);
    }
    // console.log(storyArr)
    // console.log("current time ", endTime);
    // console.log("current time ", endTime.getTime());
    // console.log(now, endTime)
    // console.log(new Date())
    // callback(null, {})
    Story.insertMany(storyArr, (err, createdStoryObj) => {
        if (!err)
            callback(null, createdStoryObj);
        else
            callback(err, null)
    })
}

let findStoryProfileByMemberId = function (memberId, date, callback) {
    // console.log("memberId", memberId)
    let currentUserId = memberId
    getMemberFanFollow(memberId, (err, listOfFanFollowObj) => {
        if (err)
            callback(err, null)
        else if (!listOfFanFollowObj || listOfFanFollowObj.celebrities.length <= 0) {
            callback(null, null)
        }
        else {
            let fanFollowCelebIds = listOfFanFollowObj.celebrities.map((celebObj) => {
                return (celebObj.CelebrityId);
            });
            memberId = ObjectId(memberId);
            fanFollowCelebIds.splice(0, 0, memberId);
            // console.log("Remove fan/follow duplicates ", fanFollowCelebIds);
            let now = new Date();
            // let nowTs = now.getTime();
            let endTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            // new Date(now.setUTCHours(now.getUTCHours() - 24));
            // let endTimeTs = endTime.getTime();
            // console.log("createATTS", nowTs, endTimeTs)
            Story.aggregate([
                {
                    $match: { memberId: { $in: fanFollowCelebIds }, createdAt: { $lt: new Date(now), $gt: new Date(endTime) } }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: 30
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "memberId",
                        foreignField: "_id",
                        as: "storyMemberInfo"
                    }
                },
                {
                    $unwind: "$storyMemberInfo"
                },
                {
                    "$group": {
                        "_id": { memberId: "$memberId" },
                        // "isSeen": { $first: "$isSeen" },
                        "memberId": { $first: "$memberId" },
                        "createdAt": { $first: "$createdAt" },
                        "storyMemberInfo": { $push: "$storyMemberInfo" },
                    }
                },
                {
                    $project: {
                        memberId: 1,
                        // isSeen: 1,
                        createdAt: 1,
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
            ], function (err, storyListObj) {
                if (err)
                    callback(err, null)
                else {
                    let storyListArr = storyListObj.map(obj => {
                        let storyObj = {}
                        storyObj.memberId = obj.memberId;
                        storyObj.createdAt = obj.createdAt;
                        storyObj.storyMemberInfo = obj.storyMemberInfo[0];
                        return (storyObj)
                    })
                    myProfileObj = {};
                    storyListArr.map((obj, index, aar2) => {
                        let createdMemberId = obj.memberId;
                        createdMemberId = "" + createdMemberId;
                        if (createdMemberId == currentUserId) {
                            console.log("matching index ", index)
                            myProfileObj.memberId = obj.memberId;
                            myProfileObj.createdAt = obj.createdAt;
                            myProfileObj.storyMemberInfo = obj.storyMemberInfo;
                            storyListArr.splice(index, 1)
                        }
                    })
                    storyListArr.sort(function (x, y) {
                        var dateA = new Date(x.createdAt), dateB = new Date(y.createdAt);
                        return dateB - dateA;
                    });
                    storyListArr.unshift(myProfileObj)
                    callback(null, storyListArr)
                }

            })
        }
    })
}

let getMemberFanFollow = function (memberId, callback) {
    memberPreferenceServices.findFanFollowByMemberId(memberId, (err, memberPreferenceObj) => {
        if (!err)
            callback(null, memberPreferenceObj);
        else
            callback(err, null)
    })
}

let findStory = function (celebId, createdAt, currentUserId, callback) {
    celebId = ObjectId(celebId);
    let now = new Date();
    // let nowTs = now.getTime();
    let endTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    //new Date(now.setHours() - 24);
    // let endTimeTs = endTime.getTime();
    console.log("Between start", now, "to end", endTime);
    userService.getCelebDetailsById(celebId, (err, celebInfoObj) => {
        if (err)
            callback(err, null, null);
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
                            { "$match": { "$expr": { "$eq": ["$storyId", "$$storyId"] } } },
                            {
                                $lookup: {
                                    "from": "users",
                                    "let": { "memberId": "$memberId" },
                                    "pipeline": [
                                        { "$match": { "$expr": { "$eq": ["$_id", "$$memberId"] } } }
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
                                    cond: { "$eq": ["$$this.isSeen", true] }
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
                    callback(err, null, null)
                else {
                    let seenProfilesArr = [];
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
                                story.storySeenProfiles = seenProfilesArr;
                            }
                            story.storyTrackingDetails = [];
                            // console.log(story.storytrackingDetails.length)
                        } else {
                            story.storySeenProfiles = [];
                        }
                        return story
                    })
                    callback(null, listOfStoryObj, celebInfoObj)
                }
            })
        }
    })

}

let findStory1 = function (celebId, createdAt, currentUserId, callback) {
    celebId = ObjectId(celebId);
    let now = new Date();
    let endTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    console.log("Between start", now, "to end", endTime);
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
                                                            { '$gte': ['$createdAt', new Date(endTime)] },
                                                            { '$lte': ['$createdAt', new Date(now)] },
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
                                                            $expr: {
                                                                $eq: ["$storyId", "$$storyId"]
                                                            }
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
                                    let seenCount = 0;
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
                                        story.storyDetails.map((storyObj) => {
                                            seenProfilesArr = [];
                                            storyObj.seenCount = storyObj.storyStats.length;
                                            storyArr.push(storyObj);
                                            storyObj.storyStats.map((storyStatsObj, index) => {
                                                // console.log("index   index  index  ", index)
                                                seenProfileObj = {};
                                                let memberId = storyStatsObj.memberId;
                                                memberId = "" + memberId;
                                                if (currentUserId == memberId)
                                                    isSeen = 1
                                                if (index < 5) {
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
    findStoryProfileByMemberId: findStoryProfileByMemberId,
    findStory: findStory,
    deleteStoryId: deleteStoryId,
    findStory1: findStory1
};
module.exports = storyServices;