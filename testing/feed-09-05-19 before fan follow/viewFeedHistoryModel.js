let mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;
let Memberpreferences = require('../memberpreferences/memberpreferencesModel');
let viewFeedHistorySchema = new mongoose.Schema({
    memberId: mongoose.Schema.Types.ObjectId,
    feedId: {
        type: Array,
        default: []
    },
    // feedId: [
    //     {
    //         feedId: mongoose.Schema.Types.ObjectId,
    //         memberId: mongoose.Schema.Types.ObjectId
    //     }
    // ],
    viewFeedHistory: {
        type: Array
    },
    fanFollowDate: {
        type: Date
    },
    preferenceDate: {
        type: Date
    },
    geoLocalDate: {
        type: Date
    },
    geoNonLocalDate: {
        type: Date
    },
    lastSeenFeeds:{
        type:Date
    },
    createdDate: {
        type: Date,
        default: new Date()
    }
},
    {
        versionKey: false
    });

let collName = "viewFeedHistory";
let ViewFeedHistory = mongoose.model('ViewFeedHistory', viewFeedHistorySchema, collName);
module.exports = ViewFeedHistory;



module.exports.findViewFeedHistoryByMemberId = function (memberId, userObj, callback) {
    Memberpreferences.aggregate([
        {
            $match: {
                memberId: ObjectId(memberId)
            }
        },
        {
            $unwind: "$celebrities"
        },
        {
            $group: {
                _id: "$celebrities.CelebrityId",
            }
        },
        {
            $project: {
                _id: 1,
                preferences: 1
            }
        },
    ], (err, celebrityIds) => {
        if (err) {
            callback(err, null)
        }
        else {
            let fanFollowId = celebrityIds.map((celebId) => {
                return celebId._id;
            });
            if (userObj.isCeleb == true)
                fanFollowId.push(userObj._id);
            //feedId: { $elemMatch: { memberId: { $in: { fanFollowId } } } } 
            ViewFeedHistory.findOne({ memberId: ObjectId(memberId) }, (err, viewFeedHistoryObj) => {
                if (err)
                    callback(err, null);
                else {
                    let viewedFeedsId = [];
                    if (viewFeedHistoryObj) {
                        for (let i = 0; i < fanFollowId.length; i++) {
                            let celebId = fanFollowId[i];
                            celebId = "" + celebId;
                            for (let j = 0; j < viewFeedHistoryObj.feedId.length; j++) {
                                let feedObj = {}
                                feedObj = viewFeedHistoryObj.feedId[j];
                                let viewMemberId = feedObj.memberId;
                                viewMemberId = "" + viewMemberId;
                                if (celebId == viewMemberId) {
                                    viewedFeedsId.push(feedObj.feedId)
                                }

                            }
                        }
                        viewFeedHistoryObj = viewFeedHistoryObj
                    }
                    callback(null, viewFeedHistoryObj);
                }
            }).lean();
            //return callback(null, memberPreferenceJsonObj)
        }
    })


    // Memberpreferences.find({ memberId: ObjectId(memberId) }, { celebrities: 1 }, (err, memberPreferenceObj) => {
    //     if (err)
    //         callback(err, null)
    //     else {
    //         let fanFollowId = memberPreferenceObj.celebrities.map((celebId) => {
    //             return celebId.CelebrityId;
    //         })
    //         console.log(fanFollowId)
    //         if (userObj.isCeleb == true)
    //             fanFollowId.push(userObj._id);
    //         console.log(fanFollowId)
    //         ViewFeedHistory.findOne({ memberId: memberId }, (err, viewFeedHistoryObj) => {
    //             if (err)
    //                 callback(err, null);
    //             else {
    //                 console.log("####################### 1111 ", viewFeedHistoryObj);
    //                 callback(null, viewFeedHistoryObj);
    //             }
    //         })
    //     }
    // })

}

module.exports.saveViewHistory = function (viewFeedHistoryObj, callback) {
    //console.log("PPPPPPPPPPPPPP @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ viewFeedHistoryObj======= ", viewFeedHistoryObj)
    if (viewFeedHistoryObj.create == true) {
        let viewFeedHistoryInfo = new ViewFeedHistory({
            memberId: viewFeedHistoryObj.memberId,
            fanFollowDate: viewFeedHistoryObj.fanFollowDate,
            preferenceDate: viewFeedHistoryObj.preferenceDate,
            geoLocalDate: viewFeedHistoryObj.geoNonLocalDate,
            geoNonLocalDate: viewFeedHistoryObj.geoNonLocalDate,
            feedId: viewFeedHistoryObj.feedId,
            viewFeedHistory: viewFeedHistoryObj.viewFeedHistory,
            createdDate: new Date()
        });
        ViewFeedHistory.create(viewFeedHistoryInfo, (err, createdObj) => {
            if (err)
                callback(err, null);
            else
                callback(null, createdObj);
        })

    } else {
        let query = {}
        // if (!viewFeedHistoryObj.create && viewFeedHistoryObj.feedId.length > 0) {
        //     query = {
        //         feedId: viewFeedHistoryObj.feedId,
        //         fanFollowDate: viewFeedHistoryObj.fanFollowDate,
        //         preferenceDate: viewFeedHistoryObj.preferenceDate,
        //         geoLocalDate: viewFeedHistoryObj.geoLocalDate,
        //         geoNonLocalDate: viewFeedHistoryObj.geoNonLocalDate
        //     }
        // } else {
        //     query = {
        //         fanFollowDate: viewFeedHistoryObj.fanFollowDate,
        //         preferenceDate: viewFeedHistoryObj.preferenceDate,
        //         geoLocalDate: viewFeedHistoryObj.geoLocalDate,
        //         geoNonLocalDate: viewFeedHistoryObj.geoNonLocalDate
        //     }
        // }
        query = {
            feedId: viewFeedHistoryObj.feedId,
            viewFeedHistory: viewFeedHistoryObj.viewFeedHistory,
            fanFollowDate: viewFeedHistoryObj.fanFollowDate,
            preferenceDate: viewFeedHistoryObj.preferenceDate,
            geoLocalDate: viewFeedHistoryObj.geoLocalDate,
            geoNonLocalDate: viewFeedHistoryObj.geoNonLocalDate
        }
        if (!viewFeedHistoryObj.create && viewFeedHistoryObj.feedId.length <= 0) {
            delete query.feedId;
        } 
        // else if (!viewFeedHistoryObj.create && viewFeedHistoryObj.viewFeedHistory.length <= 0) {
        //  query.viewFeedHistory:[];
        // }
        ViewFeedHistory.update({ memberId: ObjectId(viewFeedHistoryObj.memberId) },
            query, { upsert: true, unique: true }, (err, updatedObj) => {
                //console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^updatedObj ======= ", updatedObj)
                if (err)
                    callback(err, null)
                else {
                    ViewFeedHistory.findOne({ memberId: ObjectId(viewFeedHistoryObj.memberId) }, (err, viewFeedHistoryUpdatedObj) => {
                        if (err)
                            return callback(new Error(`Error while Fetching view feed history : ${err}`), null, null, null);
                        else {
                            Memberpreferences.findOne({ memberId: ObjectId(viewFeedHistoryObj.memberId) }, { celebrities: 1 }, (err, currentMemberFanFollow) => {
                                if (err)
                                    return callback(new Error(`Error while Fetching fan follow list  : ${err}`), null, null, null);
                                else {
                                    let fanFollowId = currentMemberFanFollow.celebrities.map((celebId) => {
                                        return celebId.CelebrityId;
                                    });
                                    fanFollowId.push(ObjectId(viewFeedHistoryObj.memberId));
                                    let viewedFeedsId = [];
                                    if (viewFeedHistoryUpdatedObj) {
                                        for (let i = 0; i < fanFollowId.length; i++) {
                                            let celebId = fanFollowId[i];
                                            celebId = "" + celebId;
                                            for (let j = 0; j < viewFeedHistoryUpdatedObj.feedId.length; j++) {
                                                let feedObj = {}
                                                feedObj = viewFeedHistoryUpdatedObj.feedId[j];
                                                let viewMemberId = feedObj.memberId;
                                                viewMemberId = "" + viewMemberId;
                                                if (celebId == viewMemberId) {
                                                    viewedFeedsId.push(feedObj.feedId)
                                                }
                                            }
                                        }
                                        viewFeedHistoryUpdatedObj.currentFanFollowfeedId = viewedFeedsId;
                                        viewFeedHistoryUpdatedObj.currentFanFollowMemberId = fanFollowId;
                                    }
                                    callback(null, viewFeedHistoryUpdatedObj)
                                }
                            })
                            //console.log("ADDDDDDD%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%viewFeedHistoryUpdatedObj===== ", viewFeedHistoryUpdatedObj)
                            //return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
                            //return callback(null, userObj, viewFeedHistoryUpdatedObj);


                        }

                    }).lean();

                    // callback(null, updatedObj)
                }

            })
    }

}

module.exports.findViewHistoryById = function (id, callback) {
    ViewFeedHistory.findById(id, (err, history) => {
        if (err)
            callback(err, null)
        else {
            callback(null, history);
        }

    })
}

// {
//     feedId: viewFeedHistoryObj.feedIdArray, fanFollowDate: viewFeedHistoryObj.fanFollowDate,
//     preferenceDate: viewFeedHistoryObj.preferenceDate,
//     geoLocalDate: viewFeedHistoryObj.geoLocalDate,
//     geoNonLocalDate: viewFeedHistoryObj.geoNonLocalDate
// }