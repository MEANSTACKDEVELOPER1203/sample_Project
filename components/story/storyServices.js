let Story = require('./storyModel');
let ObjectId = require('mongodb').ObjectId;
let memberPreferenceServices = require('../memberpreferences/memberPreferenceServices');

let saveStory = function (storyObj, files, callback) {
    // console.log(storyObj)
    let now = new Date()
    let startTimeTS = now.getTime();
    // console.log("current time ", now);
    // console.log("current time ", now.getTime());
    let endTime = new Date(now.setUTCHours(now.getUTCHours() + 24));
    let endTimeTS = endTime.getTime();
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
            let mediaType = ""
            if (mimeType != "image/jpeg" || mimeType != "image/png")
                mediaType = "image"
            else
                mediaType = "video"
            src.mediaUrl = mediaUrl;
            src.thumbnailUrl = "";
            let mediaCaption = storyObj.media[i].mediaCaption;
            storyInfo1 = new Story({
                memberId: storyObj.memberId,
                startTime: now,
                endTime: endTime,
                startTimeTS: startTimeTS,
                endTimeTS: endTimeTS,
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
            startTimeTS: startTimeTS,
            endTimeTS: endTimeTS,
            mediaType: "text"
        });
        storyArr.push(storyInfo);
    }
    console.log(storyArr)
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

let findStoryByMemberId = function (memberId, date, callback) {
    getMemberFanFollow(memberId, (err, listOfFanFollowObj) => {
        if (err)
            callback(err, null)
        else if (!listOfFanFollowObj || listOfFanFollowObj.celebrities.length <= 0) {
            callback(null, null)
        }
        else {
            // console.log("memberFanFollowList", listOfFanFollowObj.celebrities);
            let fanFollowCelebIds = listOfFanFollowObj.celebrities.map((celebObj) => {
                return (celebObj.CelebrityId);
            });
            console.log("Remove fan/follow duplicates ", fanFollowCelebIds);
            let now = new Date();
            let nowTs = now.getTime();
            let endTime = new Date(now.setUTCHours(now.getUTCHours() - 24));
            let endTimeTs = endTime.getTime();
            // console.log("createATTS", nowTs, endTimeTs)
            Story.aggregate([
                {
                    $match: { memberId: { $in: fanFollowCelebIds }, createdAtTS: { $lt: nowTs, $gt: endTimeTs } }
                },
                {
                    $sort: { createdAT: -1 }
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
                // {
                //     "$group": {
                //         "_id": { memberId: "$memberId" },
                //         "isSeen": { $first: "$isSeen" },
                //         "storyMemberInfo": { $push: "$storyMemberInfo" },
                //     }
                // },
                {
                    $project: {
                        memberId: 1,
                        isSeen: 1,
                        storyMemberInfo: {
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
                }
                // {
                //     $sort: { isSeen: -1, createdAT: -1 }
                // },
            ], function (err, storyListObj) {
                if (err)
                    callback(err, null)
                else {
                    var marvelHeroes = storyListObj.filter((storyObj) => {
                        return storyObj
                    })
                    callback(null, marvelHeroes)
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

let storyServices = {
    saveStory: saveStory,
    findStoryByMemberId: findStoryByMemberId
};
module.exports = storyServices;