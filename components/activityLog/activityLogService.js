const ActivityLogs = require("./activityLogModel");
const ObjectId = require("mongodb").ObjectID;
const ActivityLogType = require("../activityLogTypes/activityLogTypesService");

const createActivityLog = (body, callback) => {
    let newActivityLog = {
        memberId: body.memberId,
        activityOn: body.activityOn,
        activityLogTypeId: body.activityLogTypeId,
        createdBy: body.createdBy
    }
    if (body.auditionId != undefined) {
        newActivityLog.auditionId = body.auditionId
    }
    if (body.roleId != undefined) {
        newActivityLog.roleId = body.roleId
    }
    if (body.feedId != undefined && body.feedId != "") {
        newActivityLog.feedId = body.feedId,
        newActivityLog.activityType = "post"
    }
    if (body.mediaId != undefined && body.mediaId != "") {
        newActivityLog.mediaId = body.mediaId,
        newActivityLog.activityType = "photos"
    }
    if (body.scheduleId != undefined) {
        newActivityLog.scheduleId = body.scheduleId
    }
    if (body.slotId != undefined) {
        newActivityLog.slotId = body.slotId
    }
    if (body.commentId != undefined) {
        newActivityLog.commentId = body.commentId
    }
    if (body.likeId != undefined) {
        newActivityLog.likeId = body.likeId
    }
    ActivityLogs.create(newActivityLog, (err, newActivityLog) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, newActivityLog)
        }
    })
}

const editActivityLog = (id, body, callback) => {
    body.updatedAt = new Date();
    ActivityLogs.findByIdAndUpdate(id, { $set: body }, { new: true }, (err, updateActivityLog) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, updateActivityLog)
        }
    })
}

const getActivityLogByMemberId = (params, callback) => {
    let memberId = ObjectId(params.memberId);
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    let limit = parseInt(params.limit);
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    ActivityLogs.aggregate([
        {
            $match: {
                memberId: memberId,
                createdAt: { $lt: new Date(getNotificatonByTime) }
            }
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
                localField: "memberId",
                foreignField: "_id",
                as: "selfProfile"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "activityOn",
                foreignField: "_id",
                as: "activityOnProfile"
            }
        },
        {
            $lookup: {
                from: "activityLogTypes",
                localField: "activityLogTypeId",
                foreignField: "_id",
                as: "activityTypeInfo"
            }
        },
        // {
        //     $lookup: {
        //         from: "mediatrackings",
        //         localField: "commentId",
        //         foreignField: "_id",
        //         as: "activityCommentInfo"
        //     }
        // },
        // {
        //     $lookup: {
        //         from: "mediatrackings",
        //         localField: "likeId",
        //         foreignField: "_id",
        //         as: "activityLikeInfo"
        //     }
        // },
        { $unwind: { path: "$selfProfile", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$activityTypeInfo", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$activityOnProfile", preserveNullAndEmptyArrays: true } },
        // { $unwind: { path: "$activityCommentInfo", preserveNullAndEmptyArrays: true } },
        // { $unwind: { path: "$activityLikeInfo", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                memberId: 1,
                activityOn: 1,
                activityType:1,
                activityLogTypeId: 1,
                updatedAt: 1,
                createdAt: 1,
                auditionId: 1,
                roleId: 1,
                feedId: 1,
                scheduleId: 1,
                slotId: 1,
                commentId: 1,
                likeId: 1,
                mediaId:1,
                selfProfile: {
                    username: 1,
                    mobileNumber: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1,
                    imageRatio: 1,
                    email: 1,
                    name: 1,
                    firstName: 1,
                    lastName: 1,
                    prefix: 1,
                    aboutMe: 1
                },
                activityOnProfile: {
                    username: 1,
                    mobileNumber: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1,
                    imageRatio: 1,
                    email: 1,
                    name: 1,
                    firstName: 1,
                    lastName: 1,
                    prefix: 1,
                    aboutMe: 1
                },
                activityTypeInfo: {
                    thirdMessagePart: 1,
                    secondMessagePart: 1,
                    firstMessagePart: 1,
                    iconUrl: 1,
                    name: 1
                },
                // activityCommentInfo: {
                //     _id: 1,
                //     memberId: 1,
                //     activities: 1,
                //     source: 1,
                //     status: 1
                // },
                // activityLikeInfo: {
                //     _id: 1,
                //     memberId: 1,
                //     activities: 1,
                //     source: 1,
                //     status: 1
                // }
            }
        }
    ], (err, allActivityLog) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, allActivityLog)
        }
    })
}



const getAllActivityLogByMemberIdAndType = (params, callback) => {
    let memberId = ObjectId(params.memberId);
    let createdAt = params.createdAt;
    let activityLogTypeId = ObjectId(params.activityLogTypeId);
    let getNotificatonByTime = new Date();
    let limit = parseInt(params.limit);
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    ActivityLogs.aggregate([
        {
            $match: {
                memberId: memberId,
                activityLogTypeId: activityLogTypeId,
                createdAt: { $lt: new Date(getNotificatonByTime) }
            }
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
                localField: "memberId",
                foreignField: "_id",
                as: "selfProfile"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "activityOn",
                foreignField: "_id",
                as: "activityOnProfile"
            }
        },
        {
            $lookup: {
                from: "activityLogTypes",
                localField: "activityLogTypeId",
                foreignField: "_id",
                as: "activityTypeInfo"
            }
        },
        { $unwind: { path: "$selfProfile", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$activityTypeInfo", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$activityOnProfile", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                memberId: 1,
                activityOn: 1,
                activityLogTypeId: 1,
                updatedAt: 1,
                createdAt: 1,
                auditionId: 1,
                roleId: 1,
                feedId: 1,
                scheduleId: 1,
                slotId: 1,
                commentId: 1,
                likeId: 1,
                selfProfile: {
                    username: 1,
                    mobileNumber: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1,
                    imageRatio: 1,
                    email: 1,
                    name: 1,
                    firstName: 1,
                    lastName: 1,
                    prefix: 1,
                    aboutMe: 1
                },
                activityOnProfile: {
                    username: 1,
                    mobileNumber: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1,
                    imageRatio: 1,
                    email: 1,
                    name: 1,
                    firstName: 1,
                    lastName: 1,
                    prefix: 1,
                    aboutMe: 1
                },
                activityTypeInfo: {
                    thirdMessagePart: 1,
                    secondMessagePart: 1,
                    firstMessagePart: 1,
                    iconUrl: 1,
                    name: 1
                }
            }
        }
    ], (err, allActivityLog) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, allActivityLog)
        }
    })
}

const deleteActivityLog = (params, body, callback) => {
    let id = ObjectId(params.id);
    body.updatedAt = new Date();
    ActivityLogs.findByIdAndDelete(id, { new: true }, (err, deletedActivityLog) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, deletedActivityLog)
        }
    });
}


const createActivityLogByProvidingActivityTypeNameAndContent = (name, body, callback) => {
    // console.log("AAAAAAAAAAAAAAa", name)
    if (name == "Like" || name == "Comment") {
        ActivityLogType.getActivityLogTypebyName({ name: name }, (err, activityLogType) => {
            if (err) {
                callback(err, null)
            } else {
                body.activityLogTypeId = activityLogType._id;
                createActivityLog(body, (err, newActivityLog) => {
                    if (err) {
                        callback(err, null)
                    }
                    else {
                        callback(null, newActivityLog)
                    }
                })
            }
        })
    } else if (name == "unLike" || name == "unComment") {
        findAndDeleteActivityLogs(name, body, (err, updatedObj) => {
            if (!err)
                callback(null, updatedObj);
            else
                callback(err, null)
        })
    } else {
        callback(null, null)
    }
}

const findAndDeleteActivityLogs = (name, body, callback) => {
    if (name == "unLike")
        name = "Like"
    if (name == "unComment")
        name = "Comment"

    ActivityLogType.getActivityLogTypebyName({ name: name }, (err, activityLogTypeObj) => {
        if (err) {
            callback(err, null)
        }
        else {
            let updateObj = { isDeleted: true }
            let query = {};
            if (body.feedId != undefined && body.feedId != "") {
                query = { memberId: body.memberId, feedId: body.feedId, activityLogTypeId: activityLogTypeObj._id }
            }
            if (body.mediaId != undefined && body.mediaId != "") {
                query = { memberId: body.memberId, mediaId: body.mediaId, activityLogTypeId: activityLogTypeObj._id }
            }
            if (body.commentId != undefined && body.commentId != "") {
                query = { memberId: body.memberId, commentId: body.commentId, activityLogTypeId: activityLogTypeObj._id }
            }
            // if (body.scheduleId != undefined) {
            //     newActivityLog.scheduleId = body.scheduleId
            // }
            // if (body.slotId != undefined) {
            //     newActivityLog.slotId = body.slotId
            // }
            // if (body.auditionId != undefined) {
            //     newActivityLog.auditionId = body.auditionId
            // }
            // if (body.roleId != undefined) {
            //     newActivityLog.roleId = body.roleId
            // }

            ActivityLogs.findOneAndRemove(query, (err, updatedObj) => {
                if (!err)
                    callback(null, updateObj);
                else {
                    callback(err, null)
                }
            });
        }
    })

}


module.exports = {
    createActivityLog: createActivityLog,
    editActivityLog: editActivityLog,
    getActivityLogByMemberId: getActivityLogByMemberId,
    getAllActivityLogByMemberIdAndType: getAllActivityLogByMemberIdAndType,
    deleteActivityLog: deleteActivityLog,
    createActivityLogByProvidingActivityTypeNameAndContent: createActivityLogByProvidingActivityTypeNameAndContent,
    findAndDeleteActivityLogs: findAndDeleteActivityLogs

};
