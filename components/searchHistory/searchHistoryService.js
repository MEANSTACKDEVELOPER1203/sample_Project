const SearchHistoryModel = require("./searchHistoryModel");
const ObjectId = require("mongodb").ObjectID;

const isAlreadySearched = (memberId, celebrityId, callback) => {
    SearchHistoryModel.aggregate([
        {
            $match: {
                memberId: ObjectId(memberId)
            }
        },
        {
            $unwind: "$history"
        },
        {
            $match: {
                "history.celebrityId": ObjectId(celebrityId)
            }
        }
    ], (err, searchOrNot) => {
        // console.log(searchOrNot)
        if (err) {
            callback(err, null)
        } else if (searchOrNot.length) {
            callback(null, true)
        } else {
            callback(null, false)
        }
    })
}

const saveSearchHistory = (body, callback) => {
    // console.log(body)
    SearchHistoryModel.findOne({ memberId: ObjectId(body.memberId) }, { _id: 1 }, (err, searchHistoryObj) => {
        if (err) {
            callback(err, null)
        } else if (searchHistoryObj) {
            isAlreadySearched(body.memberId, body.celebrityId, (err, searchOrNot) => {
                if (err) {
                    callback(err, null)
                } else {
                    if (searchOrNot) {
                        SearchHistoryModel.updateOne({ memberId: body.memberId, "history.celebrityId": body.celebrityId }, { $set: { "history.$.createdAt": new Date() } }, (err, newSearchHistoryObj) => {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, newSearchHistoryObj)
                            }
                        })
                    } else {
                        SearchHistoryModel.updateOne({ memberId: body.memberId }, { $addToSet: { history: { celebrityId: body.celebrityId, createdAt: new Date() } } }, (err, newSearchHistoryObj) => {
                            if (err) {
                                callback(err, null)
                            } else {
                                callback(null, newSearchHistoryObj)
                            }
                        })
                    }
                }
            })
        } else {
            let newSearchHistoryObj = {
                memberId: body.memberId,
                history: [{ celebrityId: body.celebrityId }]
            }
            SearchHistoryModel.create(newSearchHistoryObj, (err, newSearchHistoryObj) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, newSearchHistoryObj)
                }
            })
        }
    })
}

const editSearchHistoryById = (id, body, callback) => {
    body.updatedAt = new Date();
    SearchHistoryModel.findByIdAndUpdate(id, { $set: { updatedAt: updatedAt } }, { $addToSet: { history: { celebrityId: body.celebrityId } } }, { new: true }, (err, updateActivityLog) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, updatedSearchHistory)
        }
    })
}

const editSearchHistoryByMemberId = (body, callback) => {
    body.updatedAt = new Date();
    SearchHistoryModel.findOneAndUpdate({ memberId: body.memberId }, { $set: { updatedAt: updatedAt } }, { $addToSet: { history: { celebrityId: body.celebrityId } } }, { new: true }, (err, updateActivityLog) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, updateActivityLog)
        }
    })
}

const getLastClearHistoryTime = (memberId, callback) => {
    SearchHistoryModel.findOne({ memberId: memberId }, { lastClearHistory: 1 }, (err, searchHistoryObj) => {
        if (err) {
            callback(err, null)
        } else if (searchHistoryObj) {
            callback(null, searchHistoryObj)
        }
        else {
            let newSearchHistoryObj = {
                memberId: memberId,
                history: []
            }
            SearchHistoryModel.create(newSearchHistoryObj, (err, newSearchHistoryObj) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, newSearchHistoryObj)
                }
            })
        }
    });
}

const getSearchHistoryByMemberId = (params, callback) => {
    let memberId = ObjectId(params.memberId);
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    let limit = parseInt(params.limit);
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    getLastClearHistoryTime(memberId, (err, searchHistoryObj) => {
        if (err) {
            callback(err, null)
        } else {
            SearchHistoryModel.aggregate([
                {
                    $match: {
                        memberId: memberId
                    }
                },
                {
                    $unwind: "$history"
                },
                {
                    $match: {
                        $and: [
                            { "history.createdAt": { $gt: new Date(searchHistoryObj.lastClearHistory) } },
                            { "history.createdAt": { $lt: new Date(getNotificatonByTime) } }
                        ]
                    }
                },
                {
                    $sort: { "history.createdAt": -1 }
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "history.celebrityId",
                        foreignField: "_id",
                        as: "celebrityDetails"
                    }
                },
                { $unwind: { path: "$celebrityDetails", preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        celebrityDetails: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: memberId,
                        history: {
                            $push: {
                                celebrityId: "$history.celebrityId",
                                createdAt: "$history.createdAt",
                                celebrityDetails: "$celebrityDetails",
                                username: "$celebrityDetails.username",
                                mobileNumber: "$celebrityDetails.mobileNumber",
                                avtar_imgPath: "$celebrityDetails.avtar_imgPath",
                                avtar_originalname: "$celebrityDetails.avtar_originalname",
                                imageRatio: "$celebrityDetails.imageRatio",
                                email: "$celebrityDetails.email",
                                name: "$celebrityDetails.name",
                                firstName: "$celebrityDetails.firstName",
                                lastName: "$celebrityDetails.lastName",
                                prefix: "$celebrityDetails.prefix",
                                aboutMe: "$celebrityDetails.aboutMe",
                                cover_imgPath: "$celebrityDetails.cover_imgPath",
                                profession: "$celebrityDetails.profession",
                                category: "$celebrityDetails.category",
                                _id: "$celebrityDetails._id",
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        history: {
                            celebrityId: 1,
                            createdAt: 1,
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
                            aboutMe: 1,
                            cover_imgPath: 1,
                            profession:1,
                            category:1,
                            _id:1
                        }
                    }
                }
            ], (err, allSearchHistory) => {
                if (err) {
                    callback(err, null)
                } else if (allSearchHistory.length) {
                    callback(null, allSearchHistory[0])
                } else {
                    callback(null, allSearchHistory)
                }
            })
        }
    })
}

const getAllSearchHistoryByMemberId = (params, callback) => {
    let memberId = ObjectId(params.memberId);
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    let limit = parseInt(params.limit);
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    getLastClearHistoryTime(memberId, (err, searchHistoryObj) => {
        if (err) {
            callback(err, null)
        } else {
            SearchHistoryModel.aggregate([
                {
                    $match: {
                        memberId: memberId
                    }
                },
                {
                    $unwind: "$history"
                },
                {
                    $match: {
                        "history.createdAt": { $lt: new Date(getNotificatonByTime) }
                    }
                },
                {
                    $sort: { "history.createdAt": -1 }
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "history.celebrityId",
                        foreignField: "_id",
                        as: "celebrityDetails"
                    }
                },
                { $unwind: { path: "$celebrityDetails", preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        celebrityDetails: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: memberId,
                        history: {
                            $push: {
                                celebrityId: "$history.celebrityId",
                                createdAt: "$history.createdAt",
                                celebrityDetails: "$celebrityDetails"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        history: {
                            celebrityDetails: {
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
                            celebrityId: 1,
                            createdAt: 1
                        }
                    }
                }
            ], (err, allSearchHistory) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, allSearchHistory)
                }
            })
        }
    })
}


const clearAllSearchHistory = (params, callback) => {
    let memberId = ObjectId(params.memberId);
    let createdAt = new Date();
    SearchHistoryModel.updateOne({ memberId: ObjectId(memberId) }, { lastClearHistory: createdAt }, (err, clearAllSearchHistory) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, clearAllSearchHistory)
        }
    })
}

const deleteSearchHistoryByCelebrityId = (params, callback) => {
    let memberId = ObjectId(params.memberId);
    let celebrityId = ObjectId(params.celebrityId);
    getLastClearHistoryTime(memberId, (err, searchHistoryObj) => {
        if (err) {
            callback(err, null)
        } else {
            SearchHistoryModel.updateOne({ memberId: memberId, "history.celebrityId": celebrityId }, { $set: { updatedAt: new Date(), "history.$.createdAt": new Date(searchHistoryObj.lastClearHistory) } }, (err, newSearchHistoryObj) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, newSearchHistoryObj)
                }
            })
        }
    });
}

module.exports = {
    isAlreadySearched: isAlreadySearched,
    getLastClearHistoryTime: getLastClearHistoryTime,
    saveSearchHistory: saveSearchHistory,
    editSearchHistoryByMemberId: editSearchHistoryByMemberId,
    getSearchHistoryByMemberId: getSearchHistoryByMemberId,
    clearAllSearchHistory: clearAllSearchHistory,
    deleteSearchHistoryByCelebrityId: deleteSearchHistoryByCelebrityId,
    editSearchHistoryById: editSearchHistoryById,
    getAllSearchHistoryByMemberId: getAllSearchHistoryByMemberId
};
