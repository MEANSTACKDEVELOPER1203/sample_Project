let StoryTracking = require('./storyTrackingModel');
let ObjectId = require('mongodb').ObjectId;

let saveStorySeenStatus = function (body, callback) {
    let now = new Date();
    // let nowTs = now.getTime();
    let storySeenInfo = new StoryTracking({
        memberId: body.memberId,
        storyId: body.storyId,
        isSeen: body.isSeen,
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
    StoryTracking.count({ storyId: ObjectId(query.storyId) }, (err, storyViewerCount) => {
        if (err)
            callback(err, [], 0)
        else {
            StoryTracking.aggregate([
                {
                    $match: { storyId: ObjectId(query.storyId) }
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
                        storyByMemberDetails: {
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