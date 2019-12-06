let StoryTracking = require('./storyTrackingModel');
let ObjectId = require('mongodb').ObjectId;


let provideData = {
    _id: 1, avtar_imgPath: 1, avtar_originalname: 1, cover_imgPath: 1, custom_imgPath: 1,
    imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
    isTrending: 1, aboutMe: 1, category: 1, preferenceId: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
}


let saveStorySeenStatus = function (body, callback) {
    let now = new Date();
    // let nowTs = now.getTime();
    let storySeenInfo = new StoryTracking({
        memberId: body.memberId,
        storyId: body.storyId,
        isSeen: body.isSeen,
        seenBy: body.seenBy,
        seenTime: now,
        // seenTimeTS: nowTs,
        createdAt: now
    });
    StoryTracking.create(storySeenInfo, (err, storySeenObj) => {
        if (!err)
            callback(null, storySeenObj);
        else
            callback(err, null);
    })
}
let getStoryCountWithProfile = function (query, callback) {
    limit = parseInt(query.limit)
    StoryTracking.countDocuments({ storyId: ObjectId(query.storyId), seenBy: "other" }, (err, storyViewerCount) => {
        if (err)
            callback(err, [], 0)
        else {
            StoryTracking.aggregate([
                {
                    $match: { storyId: ObjectId(query.storyId), seenBy: "other" }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: "users",
                        localField: 'memberId',
                        foreignField: '_id',
                        as: "storyByMemberDetails"
                    }
                },
                {
                    "$unwind": "$storyByMemberDetails"
                },
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        isSeen: 1,
                        storyByMemberDetails: provideData
                    }
                }
            ], function (err, storyViewerProfile) {
                if (!err)
                    callback(null, storyViewerProfile, storyViewerCount);
                else
                    callback(err, null, 0)
            })
        }

    })
}

let storyTrackingServices = {
    saveStorySeenStatus: saveStorySeenStatus,
    getStoryCountWithProfile: getStoryCountWithProfile
}
module.exports = storyTrackingServices;