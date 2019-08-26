const Memberpreferences = require('./memberpreferencesModel');
const Preferences = require('../preferences/preferencesModel');
const CelebrityContract = require('../celebrityContract/celebrityContractsModel');
const NotificationServices = require("../notification/notificationServices");
const User = require('../users/userModel');
const ObjectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const FeedMapping = require('../feed/feedMappingModel');
const FeedMappingService = require('../feed/feedServices');
const PayCredits = require('../payCredits/payCreditsModel');
const Credits = require('../credits/creditsModel');
const CelebrityContractServices = require('../celebrityContract/celebrityContractsService');
const CreditServices = require('../credits/creditServices');
const Feedback = require('../feedback/feedbackModel');
const ServiceTransaction = require("../serviceTransaction/serviceTransactionModel");

let getMemberFanFollowers = (userObj, callback) => {
    //console.log(userObj)
    let currentUserPreferenceObj = {};
    CelebrityContract.distinct("memberId", (err, contractCelebArayObj) => {
        if (err)
            callback(err, null)
        else {
            let celebContractArray = contractCelebArayObj.map(s => mongoose.Types.ObjectId(s));
            Memberpreferences.findOne({ memberId: userObj._id }, { preferences: 1, celebrities: 1 }, (err, memberPreferancesObj) => {
                if (err)
                    callback(err, null)
                else if (memberPreferancesObj.celebrities.length <= 0 && userObj.isCeleb == false) {
                    User.aggregate([
                        {
                            $match: {
                                _id: { $in: celebContractArray },
                                _id: { $ne: userObj._id }, IsDeleted: false, isCeleb: true,
                                preferenceId: { $in: memberPreferancesObj.preferences },
                            }
                        },
                        {
                            $addFields: {
                                isFollower:
                                    { $add: [0] }
                            }
                        },
                        {
                            $project: {
                                _id: 1, username: 1, isCeleb: 1, firstName: 1, lastName: 1, aboutMe: 1,
                                profession: 1, avtar_imgPath: 1, imageRatio: 1, preferenceId: 1,
                                isFollower: 1
                            }
                        },
                        {
                            $limit: 30
                        }
                    ], function (err, celebListObj) {
                        if (err)
                            callback(err, null);
                        else {
                            //console.log("AAAAAAAAAAAA", celebListObj)
                            let isAddPreference = false
                            if (memberPreferancesObj.preferences.length < 3)
                                isAddPreference = true
                            currentUserPreferenceObj.suggestions = celebListObj;
                            currentUserPreferenceObj.fanFollowers = [];
                            currentUserPreferenceObj.recommended = [];
                            currentUserPreferenceObj.isFanFollow = false;
                            currentUserPreferenceObj.isAddPreference = isAddPreference;
                            callback(null, currentUserPreferenceObj);
                        }
                    })
                    // let suggetionsArray = suggetionsList(userObj._id, celebContractArray, memberPreferancesObj.preferences)
                    // currentUserPreferenceObj.suggetions = suggetionsArray;
                    // currentUserPreferenceObj.fanFollowers = [];
                    // console.log("AAAAAAAAAAAAAAA", currentUserPreferenceObj)
                    // callback(null, currentUserPreferenceObj)

                } else {
                    let fanFollowersArray = memberPreferancesObj.celebrities;
                    // .map((celebId) => {
                    //     return (celebId.CelebrityId)
                    // })
                    if (userObj.isCeleb == true) {
                        userInfo = {}
                        userInfo.CelebrityId = userObj._id;
                        userInfo.createdAt = userObj.created_at;
                        userInfo.isFollower = true
                        fanFollowersArray.push(userInfo);
                    }
                    let followingCelebs = fanFollowersArray.map((celebId) => {
                        return (celebId.CelebrityId);
                    })
                    //console.log("followingCelebs ========== ", followingCelebs)
                    //fanFollowersArray.push(userObj._id);
                    User.aggregate([
                        {
                            $match: {
                                _id: { $in: celebContractArray },
                                _id: { $nin: followingCelebs }, IsDeleted: false, isCeleb: true,
                                preferenceId: { $in: memberPreferancesObj.preferences },
                            }
                        },
                        {
                            $addFields: {
                                isFollower:
                                    { $add: [0] }
                            }
                        },
                        {
                            $project: {
                                _id: 1, username: 1, isCeleb: 1, firstName: 1, lastName: 1, aboutMe: 1,
                                profession: 1, avtar_imgPath: 1, imageRatio: 1,
                                isFollower: 1
                            }
                        },
                        {
                            $limit: 30
                        }
                    ], function (err, celebListObj) {
                        if (err)
                            callback(err, null);
                        else {
                            //console.log("BBBBBBBBBBBBB", celebListObj)
                            let isAddPreference = false
                            if (memberPreferancesObj.preferences.length < 3)
                                isAddPreference = true
                            currentUserPreferenceObj.suggestions = celebListObj;
                            currentUserPreferenceObj.fanFollowers = fanFollowersArray;
                            currentUserPreferenceObj.recommended = celebListObj;
                            currentUserPreferenceObj.isFanFollow = true;
                            currentUserPreferenceObj.isAddPreference = isAddPreference;
                            callback(null, currentUserPreferenceObj);
                        }
                    })
                    // console.log("BBBBBBBBBBBBBBBB", currentUserPreferenceObj)
                    // let suggetionsArray = suggetionsList(userObj._id, celebContractArray, memberPreferancesObj.preferences);
                    // console.log("suggetionsArray", suggetionsArray)
                    // currentUserPreferenceObj.suggetions = suggetionsArray;
                    // currentUserPreferenceObj.fanFollowers = fanFollowersArray;
                    // callback(null, currentUserPreferenceObj)
                }
            }).lean();
        }
    })

}

//used in usercontroller
const getFanFollowFromMemberPreferancesOfMember = (memberId, callback) => {
    Memberpreferences.findOne({ memberId: memberId }, { celebrities: 1, preferences: 1 }, (err, listOfMyPreferences) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, listOfMyPreferences)
        }
    });
}


let findAllMyPreferencesByMemberId = function (memberId, callback) {
    //console.log("mem Preference ", memberId)
    Memberpreferences.findOne({ memberId: ObjectId(memberId) }, { preferences: 1 }, (err, memberPreferances) => {
        if (err) {
            callback(err, null)
        }
        else {
            Memberpreferences.aggregate([
                {
                    $match: {
                        memberId: ObjectId(memberId)
                    }
                },
                // {
                //     $addFields: {
                //         "celebrities": {
                //             $filter: {
                //                 input: "$celebrities",
                //                 as: "celebrities",
                //                 cond: {
                //                     $or: [
                //                         {
                //                             $eq: ["$$celebrities.isFollower", true]
                //                         },
                //                         {
                //                             $eq: ["$$celebrities.isFan", true]
                //                         }
                //                     ]
                //                 },
                //             }
                //         }
                //     }
                // },
                {
                    $unwind: "$celebrities"
                },
                {
                    $group: {
                        _id: "$celebrities.CelebrityId",
                        // preferences:{ $push : "$preferences" }
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
                    // celebrityIds = celebrityIds.map((celebId)=>{
                    //     return celebId._id;
                    // })

                    let memberPreferenceJsonObj = {};
                    // if (memberpreferencesObj[0].celebrities.length > 0) {
                    //     for (let i = 0; i < memberpreferencesObj[0].celebrities.length; i++) {
                    //         //let celebId = memberpreferencesObj[0].celebrities[i].CelebrityId;
                    //         memberListArray.push(memberpreferencesObj[0].celebrities[i].CelebrityId)
                    //     }
                    // }

                    memberPreferenceJsonObj.preferences = memberPreferances.preferences;
                    memberPreferenceJsonObj.memberListArray = celebrityIds.map((celebId) => {
                        return celebId._id;
                    });

                    return callback(null, memberPreferenceJsonObj)
                }
            })
        }
    }).lean()

}


let saveMemberPreference = (userObj, callback) => {
    let preferences = [];
    id = userObj.memberId ? userObj.memberId : userObj._id
    Memberpreferences.findOne({ "memberId": userObj.memberId }, (err, memberPreferance) => {
        if (err) {
            callback(err, null)
        } else if (memberPreferance) {
            callback(err, memberPreferance)
        } else {
            let memberPreferancesInfo = new Memberpreferences({
                memberId: userObj.memberId,
                preferences: preferences,
                createdBy: "celebkonect",
                created_at: new Date(),
                celebrities: []
            })
            Memberpreferences.create(memberPreferancesInfo, (err, memberPreferancesObj) => {
                if (!err)
                    callback(null, memberPreferancesObj);
                else
                    callback(err, null)
            })
        }
    })
}


const checkAlreadyFanFollowOrNot = (memberId, CelebrityId, action, callback) => {
    let query = {}
    if (action == "fan" || action == "unfan" || action.mode == "block") {
        query = { "celebrities.CelebrityId": CelebrityId, "celebrities.isFan": true }
    } else if (action == "follow" || action == "unfollow") {
        query = { "celebrities.CelebrityId": CelebrityId, "celebrities.isFollow": true }
    }
    console.log("memberPreferencesStatus")
    Memberpreferences.aggregate([
        {
            $match: {
                memberId: memberId
            }
        },
        {
            $unwind: "$celebrities"
        },
        {
            $match: query
        }
    ], (err, memberPreferencesStatus) => {
        if (err) {
            callback(err, null)
        }
        else if (memberPreferencesStatus.length) {
            console.log(memberPreferencesStatus)
            if (action == "fan")
                callback("User already a Fan", memberPreferencesStatus)
            else if (action == "unfollow" || action == "unfan" || action.mode == "block")
                callback(null, null)
            else if (action == "follow")
                callback("User already a Follower", memberPreferencesStatus)
        } else {
            callback(null, null)
        }
    });
}


const payForSetAsFan = (memberId, CelebrityId, callback) => {
    CelebrityContractServices.getCelebContractsForFan(CelebrityId, (err, CelebContractObj) => {
        if (err) {
            console.log(err);
        } else if (CelebContractObj) {
            CreditServices.getCreditBalance(memberId, (err, memebrCreditBalance) => {
                if (err) {
                    callback(err, null)
                } else if (memebrCreditBalance) {
                    if (memebrCreditBalance.cumulativeCreditValue > CelebContractObj.serviceCredits) {
                        CreditServices.getCreditBalance(CelebrityId, (err, celebCreditBalance) => {
                            if (err) {
                                console.log(err);
                            } else {
                                cBalObj = celebCreditBalance;
                                let newReferralCreditValue = cBalObj.referralCreditValue;
                                let oldCumulativeCreditValue = parseFloat(cBalObj.cumulativeCreditValue);
                                let credits = CelebContractObj.serviceCredits;
                                let payByMember = credits;
                                let sharingPercentage = CelebContractObj.sharingPercentage;
                                let test = credits * sharingPercentage / 100;
                                let ckCredits = credits - test;
                                newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(test);
                                let newPayCredits = new PayCredits({
                                    memberId: CelebrityId,
                                    creditValue: credits,
                                    celebPercentage: test,
                                    celebKonnectPercentage: ckCredits,
                                    createdBy: memberId
                                });
                                PayCredits.createPayCredits(newPayCredits, (err, newpaycredits) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(newpaycredits);
                                    }
                                });
                                let newCredits = new Credits({
                                    memberId: CelebrityId,
                                    creditType: "credit",
                                    creditValue: test,
                                    cumulativeCreditValue: newCumulativeCreditValue,
                                    referralCreditValue: newReferralCreditValue,
                                    remarks: "Service Earnings for Fan",
                                    createdBy: "Admin"
                                });
                                // Insert Into Credit Table
                                Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        let newCredits = new Credits({
                                            memberId: memberId,
                                            creditType: "debit",
                                            creditValue: test,
                                            cumulativeCreditValue: memebrCreditBalance.cumulativeCreditValue - payByMember,
                                            remarks: "Service pay for Fan",
                                            createdBy: memberId
                                        });
                                        Credits.createCredits(newCredits, function (err, credits) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                            }
                                        });
                                    }
                                });
                            }
                        })
                    } else {
                        callback("Insuffcient Balance", null)
                    }
                } else {
                    CreditServices.createCreditBalance(memberId, (err, creditObj) => {
                        callback("Insuffcient Balance", null)
                    })
                }
            })
        } else {
            console.log("CelebContractObj not found for celebrity ID" + CelebrityId)
        }
    })
}

const setCelebrityMemberRelationByAction = (memberId, CelebrityId, action, memberPreferenceObj, callback) => {
    let today = new Date();
    let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    User.findById(ObjectId(CelebrityId), (err, celebInfo) => {
        if (err) {
            callback(err, null)
        }
        else {
            if (action.mode == "block") {

                let feedbackInfo = new Feedback({
                    memberId: memberId,
                    celebrityId: CelebrityId,
                    reason: "Block/Report",
                    feedback: action.feedback
                });
                Feedback.create(feedbackInfo, (err, createdFeedbackObj) => {
                    if (err) {
                        callback(err, null)
                    }
                    else {
                        Memberpreferences.updateOne({ memberId: memberId },
                            {
                                $pull: {
                                    celebrities: { CelebrityId: CelebrityId, isFan: true }
                                }
                            }, (err, updatedresult) => {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    if (memberPreferenceObj.celebrities.length == 1) {
                                        FeedMappingService.updateFeedMappingObj(memberId, (err, data) => {

                                        })
                                        let message = "You have stopped following " + celebInfo.firstName
                                        callback(null, message)
                                    } else {
                                        let message = "You have stopped following " + celebInfo.firstName
                                        callback(null, message)
                                    }
                                }
                            });
                    }
                });

            }
            else if (action == "fan") {
                Memberpreferences.updateOne({ memberId: memberId },
                    { $addToSet: { celebrities: { CelebrityId: CelebrityId, isFan: true, createdAt: lastWeek } } }
                    , { new: 1 }, (err, updatedMemberPreferancesObj) => {
                        if (err) {
                            callback(err, null)
                        }
                        else {
                            callback(null, "Successfully Became fan.")
                            payForSetAsFan(memberId, CelebrityId, (err, result) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(result)
                                }
                            })
                        }
                    });
            } else if (action == "unfan") {
                Memberpreferences.updateOne({ memberId: memberId },
                    {
                        $pull: {
                            celebrities: { CelebrityId: CelebrityId, isFan: true }
                        }
                    }, (err, updatedresult) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            if (memberPreferenceObj.celebrities.length - 1 == 0) {
                                FeedMappingService.updateFeedMappingObj(memberId, (err, data) => {

                                })
                                let message = "You have successfully unsubscribed to " + celebInfo.firstName.charAt(0).toUpperCase() + celebInfo.firstName.slice(1)
                                callback(null, message)
                            } else {

                                let message = "You have successfully unsubscribed to " + celebInfo.firstName.charAt(0).toUpperCase() + celebInfo.firstName.slice(1)
                                callback(null, message)
                            }
                        }
                    });
            } else if (action == "follow") {
                Memberpreferences.updateOne({ memberId: memberId },
                    { $addToSet: { celebrities: { CelebrityId: CelebrityId, isFollower: true, createdAt: lastWeek } } }
                    , { new: 1 }, (err, memberPreferenceObj) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            callback(null, "Successfully following")
                        }
                    });
            } else if (action == "unfollow") {
                Memberpreferences.updateOne({ memberId: memberId },
                    {
                        $pull: {
                            celebrities: { CelebrityId: CelebrityId, isFollower: true }
                        }
                    }, (err, updatedresult) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            if (memberPreferenceObj.celebrities.length == 1) {
                                FeedMappingService.updateFeedMappingObj(memberId, (err, data) => {

                                })
                                let message = "You have stopped following " + celebInfo.firstName
                                callback(null, message)
                            } else {
                                let message = "You have stopped following " + celebInfo.firstName
                                callback(null, message)
                            }
                        }
                    });
            }
        }
    });
}



const makeVertualFollower = (celebrityId, count, callback) => {
    celebrityId = ObjectId(celebrityId);
    let today = new Date();
    let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    User.findById(celebrityId, (err, userInfo) => {
        if (err) {
            callback(err, null)
        } else if (userInfo) {
            Memberpreferences.aggregate(
                [
                    {
                        $match: { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFollower: true } } }
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
                        $match: { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
                    },
                    {
                        $unwind: "$memberProfile"
                    }
                ], (err, followers) => {
                    if (err) {
                        callback(err, null)
                    } else {
                        let alreadyFollowers = followers.map((follower) => {
                            return follower.memberProfile._id
                        })
                        console.log(alreadyFollowers)

                        User.aggregate([
                            {
                                $match: {
                                    IsDeleted: false,
                                    dua: true,
                                    _id: { $nin: alreadyFollowers }
                                }
                            },
                            {
                                $sample:
                                {
                                    size: count
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    email: 1
                                }
                            }], (err, beingFollower) => {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    let following = {
                                        CelebrityId: celebrityId,
                                        isFollower: true,
                                        createdAt: lastWeek
                                    }
                                    let addingFollower = beingFollower.map((user) => {
                                        return user._id
                                    })
                                    console.log(addingFollower)
                                    //priviolsy we are updating all at once but the time coming same so pagination
                                    //not working so we need to insert one by one on random time
                                    addingFollower.forEach((id) => {
                                        var date = new Date();
                                        date.setMilliseconds(Math.floor(Math.random() * 20));
                                        date.setMinutes(Math.floor(Math.random() * 20))
                                        date.setSeconds(Math.floor(Math.random() * 20))
                                        following.createdAt = date;
                                        Memberpreferences.updateOne({ memberId: id }, { $addToSet: { celebrities: following } }, (err, updatedMemberPreferancesObj) => {
                                            if (err) {

                                            } else {

                                            }
                                        });
                                    })
                                    return callback(null, addingFollower);
                                    // Memberpreferences.updateMany({memberId:{$in:addingFollower}}, { $addToSet: { celebrities:following} },(err, updatedMemberPreferancesObj) => {
                                    //     if (err) {
                                    //         return callback(err,null);
                                    //     } else {
                                    //         return callback(null,updatedMemberPreferancesObj);
                                    //     }
                                    // });
                                }
                            })
                    }
                });
        } else {
            callback("Celebrity not found", null)
        }
    })
}

const updateMemberPreferances = (memberId, CelebrityId, action, callback) => {
    memberId = ObjectId(memberId);
    CelebrityId = ObjectId(CelebrityId);
    User.findById(memberId, (err, user) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        }
        else if (user) {
            Memberpreferences.findOne({ memberId: memberId }, { _id: 1, celebrities: 1 }, (err, memberPreferenceObj) => {
                if (err) {
                    res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
                } else if (memberPreferenceObj) {
                    checkAlreadyFanFollowOrNot(memberId, CelebrityId, action, (err, memberPreferencesStatus) => {
                        if (err || memberPreferencesStatus) {
                            callback(err, null)
                        } else {
                            setCelebrityMemberRelationByAction(memberId, CelebrityId, action, memberPreferenceObj, (err, updatedMemberPreferancesObj) => {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    callback(null, updatedMemberPreferancesObj)
                                }
                            })
                        }
                    })
                } else {
                    saveMemberPreference(user, (err, newMemebrPreferanceObj) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            setCelebrityMemberRelationByAction(memberId, CelebrityId, action, memberPreferenceObj, (err, updatedMemberPreferancesObj) => {
                                if (err) {
                                    callback(err, null)
                                } else {
                                    callback(null, updatedMemberPreferancesObj)
                                }
                            })
                        }
                    })
                }
            });
        }
        else {
            callback("user not found", null)
        }
    });
}

const getMemberPreferancesCount = (memberId, callback) => {
    Memberpreferences.findOne({ memberId: ObjectId(memberId) }, { preferences: 1 }, (err, memberPreferanceObj) => {
        if (err) {
            callback(err, null)
        } else {
            if (memberPreferanceObj && memberPreferanceObj.preferences.length >= 3) {
                callback(null, { isPreferencesSelected: true })
            }
            else {
                callback(null, { isPreferencesSelected: false })
            }
        }
    })
}

const sendNotificationToFan = (memberId, message, callback) => {
    Memberpreferences.aggregate([
        {
            $match: { celebrities: { $elemMatch: { CelebrityId: ObjectId(memberId), isFan: true } } }
        },
        {
            $lookup: {
                from: "logins",
                localField: "memberId",
                foreignField: "memberId",
                as: "memberLoginInfo"
            }
        },
        {
            $unwind: "$memberLoginInfo"
        },
        {
            $match: { $and: [{ "memberLoginInfo.deviceToken": { $ne: null } }, { "memberLoginInfo.deviceToken": { $ne: "" } }] }
        },
        {
            $project: {
                memberLoginInfo: {
                    memberId: 1,
                    deviceToken: 1
                }
            }
        }
    ], (err, users) => {
        if (err) {
            console.log(err)
        } else {
            users.forEach(user => {
                message.to = user.memberLoginInfo.deviceToken;
                message.notification.memberId = user.memberLoginInfo.memberId;
                NotificationServices.sendAndCreateNotification(message, (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {

                    }
                })
            });
            callback(null, users)
        }
    });
}

const sendNotificationToFollower = (memberId, message, callback) => {
    Memberpreferences.aggregate([
        {
            $match: { celebrities: { $elemMatch: { CelebrityId: ObjectId(memberId), isFollower: true } } }
        },
        {
            $lookup: {
                from: "logins",
                localField: "memberId",
                foreignField: "memberId",
                as: "memberLoginInfo"
            }
        },
        {
            $unwind: "$memberLoginInfo"
        },
        {
            $match: { $and: [{ "memberLoginInfo.deviceToken": { $ne: null } }, { "memberLoginInfo.deviceToken": { $ne: "" } }] }
        },
        {
            $project: {
                memberLoginInfo: {
                    memberId: 1,
                    deviceToken: 1
                }
            }
        }
    ], (err, users) => {
        if (err) {
            callback(err, null)
        } else {
            users.forEach(user => {
                message.to = user.memberLoginInfo.deviceToken;
                message.notification.memberId = user.memberLoginInfo.memberId;
                NotificationServices.sendAndCreateNotification(message, (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {

                    }
                })
                callback(null, users)
            });
        }
    });
}

const sendNotificationToFanAndFollower = (memberId, message, callback) => {
    Memberpreferences.aggregate([
        {
            $match: { "celebrities.CelebrityId": ObjectId(memberId) }
        },
        {
            $lookup: {
                from: "logins",
                localField: "memberId",
                foreignField: "memberId",
                as: "memberLoginInfo"
            }
        },
        {
            $unwind: "$memberLoginInfo"
        },
        {
            $match: { $and: [{ "memberLoginInfo.deviceToken": { $ne: null } }, { "memberLoginInfo.deviceToken": { $ne: "" } }] }
        },
        {
            $project: {
                memberLoginInfo: {
                    memberId: 1,
                    deviceToken: 1,
                    osType: 1
                }
            }
        }
    ], (err, users) => {
        if (err) {
            console.log(err)
        } else {
            users.forEach(user => {
                message.to = user.memberLoginInfo.deviceToken;
                message.notification.memberId = user.memberLoginInfo.memberId;
                message.notification.osType = user.memberLoginInfo.osType;
                NotificationServices.sendAndCreateNotification(message, (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {

                    }
                })
            });
            callback(null, users)
        }
    });
}

const getBlockUserList = (celebrityId, paginationDate, callback) => {
    if (paginationDate == "0")
        paginationDate = new Date();
    else
        paginationDate = new Date(paginationDate)

    // console.log(paginationDate)
    let limit = 30;
    Feedback.count({ "celebrityId": ObjectId(celebrityId), "reason": "Block/Report" }, (err, totalBlockCount) => {
        if (err) {
            callback(err, null, null)
        } else {
            console.log("Block Count", totalBlockCount)
            Feedback.aggregate([
                {
                    $sort: { createdDate: -1 }
                },
                {
                    $match: {
                        $or: [{
                            $and: [{
                                reason: "Block/Report",
                                celebrityId: ObjectId(celebrityId),
                                createdDate: { $lt: paginationDate }
                            }]
                        }],
                    }
                },

                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "memberId",
                        foreignField: "_id",
                        as: "memberDetails"
                    }
                },
                {
                    $unwind: "$memberDetails"
                },
                {
                    $group: {
                        _id: "$memberDetails",
                        createdDate: { $first: "$createdDate" },
                        updatedDate: { $first: "$updatedDate" },
                        feedback: { $first: "$feedback" },
                    }
                },
                {
                    $match: {
                        _id: { $ne: null }
                    }
                },
                {
                    $project: {
                        _id: {
                            // firstName:1,
                            // lastName:1,
                            // _id: 1,
                            // email: 1,
                            // username: 1,
                            // osType: 1,
                            // mobileNumber:1,
                            // isCeleb:1,
                            // isManager:1,
                            // profession:1,
                            // avtar_imgPath:1,
                            // avtar_originalname:1
                            pastProfileImages: 0,
                            password: 0,
                            languages: 0,
                        }
                    }
                }
            ], (err, blockUser1) => {
                // console.log("BBBBBBBBB ======= ", blockUser1)
                if (err) {
                    callback(err, null, null)
                } else {
                    blockUser1 = blockUser1.map((blockUser) => {
                        let userObj = blockUser._id;
                        userObj.paginationDate = blockUser.createdDate;  //new Date() 
                        userObj.blockedDate = blockUser.updatedDate;  //new Date() 
                        userObj.feedback = blockUser.feedback;
                        return userObj
                    })
                    let expectId = blockUser1.map((blockUser) => {
                        return blockUser._id
                    })
                    limit = limit - blockUser1.length
                    ServiceTransaction.aggregate([
                        {
                            $match: {
                                callRemarks: "Block/Report",
                                receiverId: ObjectId(celebrityId),
                                senderId: { $nin: expectId },
                                createdAt: { $lt: paginationDate }
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
                                localField: "senderId",
                                foreignField: "_id",
                                as: "memberDetails"
                            }
                        },
                        {
                            $unwind: "$memberDetails"
                        },
                        {
                            $group: {
                                _id: "$memberDetails",
                                createdAt: { $first: "$createdAt" },
                                updatedAt: { $first: "$updatedAt" },
                                reason: { $first: "$reason" },
                            }
                        },
                        {
                            $match: {
                                _id: { $ne: null }
                            }
                        },
                        {
                            $project: {
                                _id: {
                                    // firstName:1,
                                    // lastName:1,
                                    // _id: 1,
                                    // email: 1,
                                    // username: 1,
                                    // osType: 1,
                                    // mobileNumber:1,
                                    // isCeleb:1,
                                    // isManager:1,
                                    // profession:1,
                                    // avtar_imgPath:1,
                                    // avtar_originalname:1
                                    pastProfileImages: 0,
                                    password: 0,
                                    languages: 0,
                                }
                            }
                        }
                    ], (err, blockUser2) => {
                        // console.log("block from transaction ==== ", blockUser2)
                        if (err) {
                            callback(null, blockUser1, totalBlockCount)
                        }
                        else {
                            blockUser2 = blockUser2.map((blockUser) => {
                                let userObj = blockUser._id;
                                userObj.paginationDate = blockUser.createdAt;  //new Date() 
                                userObj.blockedDate = blockUser.updatedAt;  //new Date() 
                                userObj.feedback = blockUser.reason;
                                return userObj
                            })
                            blockUser = blockUser2.concat(blockUser1)
                            blockUser.sort(function (x, y) {
                                var dateA = new Date(x.paginationDate), dateB = new Date(y.paginationDate);
                                return dateB - dateA;
                            })
                            callback(null, blockUser, totalBlockCount)
                        }
                    })
                }
            })
        }
    })

}

const unblockMember = (body, callback) => {
    let celebrityId = ObjectId(body.celebrityId)
    let memberId = ObjectId(body.memberId)
    let feedback = body.feedback
    // console.log("AAAAAAAAAA ========= ",body);
    Feedback.updateMany({ celebrityId: celebrityId, memberId: memberId, reason: "Block/Report" }, { reason: "Unblock", feedback: feedback, lastTimeUnBlocked: new Date(), updatedDate: new Date() }, (err, update) => {
        if (err) {
            callback(err, null)
        } else {
            ServiceTransaction.updateMany({ callRemarks: "Block/Report", receiverId: celebrityId, senderId: memberId }, { callRemarks: "Unblock", reason: feedback, lastTimeUnBlocked: new Date(), updatedAt: new Date() }, (err, updateServiceTransaction) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, updateServiceTransaction)
                    let body = {
                        memberId: memberId,
                        activityOn: celebrityId
                    }
                    // ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("UnBlock", body, (err, newActivityLog) => {
                    //     if (err) {
                    //         // res.json({success: 0,message: "Please try again." + err});
                    //     } else {

                    //     }
                    // })
                }
            })
        }
    })
}

const getBlockersList = (memberId, callback) => {
    Feedback.aggregate([
        {
            $match: {
                reason: "Block/Report",
                memberId: ObjectId(memberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "celebrityId",
                foreignField: "_id",
                as: "memberDetails"
            }
        },
        {
            $unwind: "$memberDetails"
        },
        {
            $group: {
                _id: "$memberDetails"
            }
        },
        {
            $match: {
                _id: { $ne: null }
            }
        },
        {
            $project: {
                _id: {
                    firstName: 1,
                    lastName: 1,
                    _id: 1,
                    email: 1,
                    username: 1,
                    osType: 1,
                    mobileNumber: 1,
                    isCeleb: 1,
                    isManager: 1,
                    profession: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1
                }
            }
        }
    ], (err, blockUser1) => {
        if (err) {
            callback(err, null)
        } else {
            blockUser1 = blockUser1.map((blockUser) => {
                return blockUser._id
            })
            let expectId = blockUser1.map((blockUser) => {
                return blockUser._id
            })
            ServiceTransaction.aggregate([
                {
                    $match: {
                        callRemarks: "Block/Report",
                        senderId: ObjectId(memberId),
                        receiverId: { $nin: expectId }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "receiverId",
                        foreignField: "_id",
                        as: "memberDetails"
                    }
                },
                {
                    $unwind: "$memberDetails"
                },
                {
                    $group: {
                        _id: "$memberDetails"
                    }
                },
                {
                    $match: {
                        _id: { $ne: null }
                    }
                },
                {
                    $project: {
                        _id: {
                            firstName: 1,
                            lastName: 1,
                            _id: 1,
                            email: 1,
                            username: 1,
                            osType: 1,
                            mobileNumber: 1,
                            isCeleb: 1,
                            isManager: 1,
                            profession: 1,
                            avtar_imgPath: 1,
                            avtar_originalname: 1
                        }
                    }
                }
            ], (err, blockUser2) => {
                if (err) {
                    callback(null, blockUser1)
                }
                else {
                    console.log(blockUser2)
                    blockUser2 = blockUser2.map((blockUser) => {
                        return blockUser._id
                    })
                    blockUser = blockUser2.concat(blockUser1)
                    callback(null, blockUser)
                }
            })
        }
    })
}

const getAllBlockUser = (params, callback) => {
    let limit = parseInt(params.limit);
    let createdAt = params.createdAt
    let getDataByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getDataByTime = createdAt
    }
    Feedback.aggregate([
        {
            $match: {
                createdDate: { $lt: new Date(getDataByTime) },
                reason: "Block/Report"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "memberId",
                foreignField: "_id",
                as: "memberDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "celebrityId",
                foreignField: "_id",
                as: "celebrityDetails"
            }
        },
        {
            $unwind: "$memberDetails"
        },
        {
            $unwind: "$celebrityDetails"
        },
        {
            $sort: {
                createdDate: -1
            }
        },
        {
            $limit: limit
        },
        {
            $project: {
                memberDetails: {
                    firstName: 1,
                    lastName: 1,
                    _id: 1,
                    email: 1,
                    username: 1,
                    osType: 1,
                    mobileNumber: 1,
                    isCeleb: 1,
                    isManager: 1,
                    profession: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1
                },
                celebrityDetails: {
                    firstName: 1,
                    lastName: 1,
                    _id: 1,
                    email: 1,
                    username: 1,
                    osType: 1,
                    mobileNumber: 1,
                    isCeleb: 1,
                    isManager: 1,
                    profession: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1
                },
                _id: 1,
                memberId: 1,
                celebrityId: 1,
                reason: 1,
                feedback: 1,
                status: 1,
                createdDate: 1
            }
        }
    ], (err, blockUser1) => {
        if (err) {
            callback(err, null)
        } else {
            blockUser1 = blockUser1.map((blockObj) => {
                blockObj.createdAt = blockObj.createdDate;
                return blockObj
            })
            if (blockUser1.length != limit) {
                let newLen = parseInt(limit - blockUser1.length);
                ServiceTransaction.aggregate([
                    {
                        $match: {
                            createdAt: { $lt: new Date(getDataByTime) },
                            callRemarks: "Block/Report",
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId",
                            foreignField: "_id",
                            as: "celebrityDetails"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "senderId",
                            foreignField: "_id",
                            as: "memberDetails"
                        }
                    },
                    {
                        $unwind: "$celebrityDetails"
                    },
                    {
                        $unwind: "$memberDetails"
                    },
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },
                    {
                        $limit: newLen
                    },
                    {
                        $project: {
                            memberDetails: {
                                firstName: 1,
                                lastName: 1,
                                _id: 1,
                                email: 1,
                                username: 1,
                                osType: 1,
                                mobileNumber: 1,
                                isCeleb: 1,
                                isManager: 1,
                                profession: 1,
                                avtar_imgPath: 1,
                                avtar_originalname: 1
                            },
                            celebrityDetails: {
                                firstName: 1,
                                lastName: 1,
                                _id: 1,
                                email: 1,
                                username: 1,
                                osType: 1,
                                mobileNumber: 1,
                                isCeleb: 1,
                                isManager: 1,
                                profession: 1,
                                avtar_imgPath: 1,
                                avtar_originalname: 1
                            },
                            _id: 1,
                            memberId: 1,
                            celebrityId: 1,
                            reason: 1,
                            status: 1,
                            callRemarks: 1,
                            createdAt: 1
                        }
                    }
                ], (err, blockUser2) => {
                    if (err) {
                        callback(null, blockUser1)
                    }
                    else {
                        blockUser2 = blockUser2.map((blockObj) => {
                            blockObj.feedback = blockObj.reason;
                            blockObj.reason = blockObj.callRemarks;
                            return blockObj
                        })
                        blockUser = blockUser1.concat(blockUser2)
                        blockUser.sort((a, b) => {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        })
                        callback(null, blockUser)
                    }
                })
            } else {
                callback(null, blockUser1)
            }
        }
    })
}

const followingCelebritiesByMember = (params, callback) => {
    let id = params.userId;
    let limit = parseInt(params.limit);
    let createdAt = params.createdAt
    let getNotificatonByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    Memberpreferences.findOne({ memberId: ObjectId(id) }, { celebrities: 1 }, (err, followObj) => {
        if (err) {
            //return res.status(404).json({ success: 0, message: "Error while fetching the FAN count" })
            callback(err, null, null)
        } else {
            let totalFanCount = 0;
            followObj.celebrities.map((celeb) => {
                if (celeb.isFollower == true)
                    totalFanCount = totalFanCount + 1
                return celeb
            });
            Memberpreferences.aggregate(
                [
                    { $match: { memberId: ObjectId(id) } },
                    { $unwind: "$celebrities" },
                    { $match: { "celebrities.isFollower": true, "celebrities.createdAt": { $lt: new Date(getNotificatonByTime) } } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "celebrities.CelebrityId",
                            foreignField: "_id",
                            as: "celebProfile"
                        }
                    },
                    {
                        $unwind: "$celebProfile"
                    },
                    {
                        $sort: {
                            "celebrities.createdAt": -1
                        }
                    },
                    {
                        $match: {
                            $and: [
                                { "celebProfile._id": { $ne: ObjectId(id) } },
                                { celebProfile: { $ne: [] } }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            celebrities: { $push: { "celebrities": "$celebrities", "celebProfile": "$celebProfile" } },
                            total: { $sum: 1 }
                        }
                    },
                    {
                        $unwind: "$celebrities"
                    },
                    {
                        $limit: limit
                    },
                    {
                        $project: {
                            _id: 0,
                            celebProfile: 1,
                            celebrities: 1,
                            total: 1
                        }
                    }
                ],
                (err, data) => {
                    if (err) {
                        callback(err, null, null)
                    }
                    if (data.length > 0) {
                        data = data.map((celebrity) => {
                            let celebrityDetails = celebrity.celebrities.celebProfile;
                            celebrityDetails.createdAt = celebrity.celebrities.celebrities.createdAt;
                            celebrityDetails.total = celebrity.total;
                            return celebrityDetails
                        })
                        callback(null, data, totalFanCount)
                    } else {
                        callback(null, data, totalFanCount)
                    }
                });
        }
    });

}

const fanCelebritiesbyMember = (params, callback) => {
    let id = params.userId;
    let limit = parseInt(params.limit);
    let createdAt = params.createdAt
    let getNotificatonByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    Memberpreferences.findOne({ memberId: ObjectId(id) }, { celebrities: 1 }, (err, fanObj) => {
        if (err) {
            //return res.status(404).json({ success: 0, message: "Error while fetching the FAN count" })
            callback(err, null, null)
        } else {
            let totalFanCount = 0;
            fanObj.celebrities.map((celeb) => {
                if (celeb.isFan == true)
                    totalFanCount = totalFanCount + 1
                return celeb
            });
            // console.log(totalFanCount)
            Memberpreferences.aggregate(
                [
                    { $match: { $and: [{ memberId: ObjectId(id) }] } },
                    { $unwind: "$celebrities" },
                    { $match: { "celebrities.isFan": true, "celebrities.createdAt": { $lt: new Date(getNotificatonByTime) } } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "celebrities.CelebrityId",
                            foreignField: "_id",
                            as: "celebProfile"
                        }
                    },
                    {
                        $unwind: "$celebProfile"
                    },
                    {
                        $sort: {
                            "celebrities.createdAt": -1
                        }
                    },
                    {
                        $match: {
                            $and: [
                                { "celebProfile._id": { $ne: ObjectId(id) } },
                                { celebProfile: { $ne: [] } }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            celebrities: { $push: { "celebrities": "$celebrities", "celebProfile": "$celebProfile" } },
                            total: { $sum: 1 }
                        }
                    },
                    {
                        $unwind: "$celebrities"
                    },
                    {
                        $limit: limit
                    },
                    {
                        $project: {
                            _id: 0,
                            celebProfile: 1,
                            celebrities: 1,
                            total: 1
                        }
                    }
                ],
                (err, data) => {
                    if (err) {
                        callback(err, null, null)
                    }
                    if (data.length > 0) {
                        data = data.map((celebrity) => {
                            let celebrityDetails = celebrity.celebrities.celebProfile;
                            celebrityDetails.createdAt = celebrity.celebrities.celebrities.createdAt;
                            celebrityDetails.total = celebrity.total;
                            return celebrityDetails
                        })
                        callback(null, data, totalFanCount)
                    } else {
                        callback(null, data, totalFanCount)
                    }
                }
            );
        }
    });


}

const fanMembersbyCelebrity = (params, callback) => {
    let id = params.celebId;
    let limit = parseInt(params.limit);
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    Memberpreferences.count({ celebrities: { $elemMatch: { CelebrityId: ObjectId(id), isFan: true } } }, (err, totalFanCount) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the FAN count" })
        } else {
            // console.log("Total Count", totalFanCount, getNotificatonByTime)
            Memberpreferences.aggregate(
                [
                    // { $match: { "celebrities.CelebrityId": { $in: [ObjectId(id)] } } },
                    { $unwind: "$celebrities" },
                    {
                        $match: { "celebrities.CelebrityId": ObjectId(id), "celebrities.isFan": true, "celebrities.createdAt": { $lt: new Date(getNotificatonByTime) } }
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
                        $unwind: "$memberProfile"
                    },
                    {
                        $sort: {
                            "celebrities.createdAt": -1
                        }
                    },
                    {
                        $match: {
                            "memberProfile._id": { $ne: ObjectId(id) }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            celebrities: { $push: { "celebrities": "$celebrities", "memberProfile": "$memberProfile" } },
                            total: { $sum: 1 }
                        }
                    },
                    {
                        $unwind: "$celebrities"
                    },
                    {
                        $limit: limit
                    },
                    {
                        $project: {
                            _id: 0,
                            memberProfile: 1,
                            celebrities: 1,
                            total: 1
                        }
                    }
                ],
                function (err, data) {
                    if (err) {
                        callback(err, null, null)
                    }
                    if (data.length > 0) {
                        data = data.map((follower) => {
                            let memberDetails = follower.celebrities.memberProfile;
                            memberDetails.createdAt = follower.celebrities.celebrities.createdAt;
                            memberDetails.total = follower.total;
                            return memberDetails
                        })
                        callback(null, data, totalFanCount)
                    } else {
                        callback(null, data, totalFanCount)
                    }
                }
            );
        }
    })


}

const followingMembersbyCelebrity = (params, callback) => {
    let id = params.celebId;
    let limit = parseInt(params.limit);
    let createdAt = params.createdAt;
    let getNotificatonByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getNotificatonByTime = createdAt
    }
    // console.log(getNotificatonByTime)

    Memberpreferences.count({ celebrities: { $elemMatch: { CelebrityId: ObjectId(id), isFollower: true } } }, (err, totalFollowerCount) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the FOLLOWER count" })
        } else {
            // console.log("Total Count F", totalFollowerCount)
            Memberpreferences.aggregate(
                [
                    // { $match: { "celebrities.CelebrityId": { $in: [ObjectId(id)] } } },
                    { $unwind: "$celebrities" },
                    {
                        $match: { "celebrities.CelebrityId": ObjectId(id), "celebrities.isFollower": true, "celebrities.createdAt": { $lt: new Date(getNotificatonByTime) } }
                    },
                    {
                        $sort: {
                            "celebrities.createdAt": -1
                        }
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
                        $unwind: "$memberProfile"
                    },
                    // {
                    //     $sort: {
                    //         "celebrities.createdAt": -1
                    //     }
                    // },
                    {
                        $match: {
                            "memberProfile._id": { $ne: ObjectId(id) }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            celebrities: { $push: { "celebrities": "$celebrities", "memberProfile": "$memberProfile" } },
                            total: { $sum: 1 }
                        }
                    },
                    {
                        $unwind: "$celebrities"
                    },
                    // {
                    //     $limit: limit
                    // },
                    {
                        $project: {
                            _id: 0,
                            memberProfile: 1,
                            celebrities: 1,
                            total: 1
                        }
                    }
                ],
                (err, data) => {
                    // console.log(data, err)
                    if (err) {
                        callback(err, null, null)
                    }
                    if (data.length > 0) {
                        data = data.map((follower) => {
                            let memberDetails = follower.celebrities.memberProfile;
                            memberDetails.createdAt = follower.celebrities.celebrities.createdAt;
                            memberDetails.total = follower.total;
                            return memberDetails
                        })
                        callback(null, data, totalFollowerCount)
                    } else {
                        callback(null, data, totalFollowerCount)
                    }
                }
            );
        }
    });
}

const getAllUnfanWithReason = (params, callback) => {
    let limit = parseInt(params.limit);
    let createdAt = params.createdAt
    let getDataByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getDataByTime = createdAt
    }
    Feedback.aggregate([
        {
            $match: {
                createdDate: { $lt: new Date(getDataByTime) },
                reason: "Unfan"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "memberId",
                foreignField: "_id",
                as: "memberDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "celebrityId",
                foreignField: "_id",
                as: "celebrityDetails"
            }
        },
        {
            $unwind: "$memberDetails"
        },
        {
            $unwind: "$celebrityDetails"
        },
        {
            $sort: {
                createdDate: -1
            }
        },
        {
            $limit: limit
        },
        {
            $project: {
                memberDetails: {
                    firstName: 1,
                    lastName: 1,
                    _id: 1,
                    email: 1,
                    username: 1,
                    osType: 1,
                    mobileNumber: 1,
                    isCeleb: 1,
                    isManager: 1,
                    profession: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1
                },
                celebrityDetails: {
                    firstName: 1,
                    lastName: 1,
                    _id: 1,
                    email: 1,
                    username: 1,
                    osType: 1,
                    mobileNumber: 1,
                    isCeleb: 1,
                    isManager: 1,
                    profession: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1
                },
                _id: 1,
                memberId: 1,
                celebrityId: 1,
                reason: 1,
                feedback: 1,
                status: 1,
                createdDate: 1
            }
        }
    ], (err, unfanUserObj) => {
        if (err) {
            callback(err, null)
        } else {
            unfanUserObj = unfanUserObj.map((unfanObj) => {
                unfanObj.createdAt = unfanObj.createdDate;
                return unfanObj
            })
            callback(null, unfanUserObj)
        }
    });
}

const getUnfanWithReasonByCelebrityId = (params, callback) => {
    let limit = parseInt(params.limit);
    let celebrityId = ObjectId(params.memberId);
    let createdAt = params.createdAt
    let getDataByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getDataByTime = createdAt
    }
    Feedback.aggregate([
        {
            $match: {
                celebrityId: celebrityId,
                createdDate: { $lt: new Date(getDataByTime) },
                reason: "Unfan"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "memberId",
                foreignField: "_id",
                as: "memberDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "celebrityId",
                foreignField: "_id",
                as: "celebrityDetails"
            }
        },
        {
            $unwind: "$memberDetails"
        },
        {
            $unwind: "$celebrityDetails"
        },
        {
            $sort: {
                createdDate: -1
            }
        },
        {
            $limit: limit
        },
        {
            $project: {
                memberDetails: {
                    firstName: 1,
                    lastName: 1,
                    _id: 1,
                    email: 1,
                    username: 1,
                    osType: 1,
                    mobileNumber: 1,
                    isCeleb: 1,
                    isManager: 1,
                    profession: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1
                },
                celebrityDetails: {
                    firstName: 1,
                    lastName: 1,
                    _id: 1,
                    email: 1,
                    username: 1,
                    osType: 1,
                    mobileNumber: 1,
                    isCeleb: 1,
                    isManager: 1,
                    profession: 1,
                    avtar_imgPath: 1,
                    avtar_originalname: 1
                },
                _id: 1,
                memberId: 1,
                celebrityId: 1,
                reason: 1,
                feedback: 1,
                status: 1,
                createdDate: 1
            }
        }
    ], (err, unfanUserObj) => {
        if (err) {
            callback(err, null)
        } else {
            unfanUserObj = unfanUserObj.map((unfanObj) => {
                unfanObj.createdAt = unfanObj.createdDate;
                return unfanObj
            })
            callback(null, unfanUserObj)
        }
    });
}

let findFanFollowByMemberId = function (memberId, callback) {
    Memberpreferences.findOne({ memberId: ObjectId(memberId) }, { memberId: 1, celebrities: 1 }, (err, memberPreferenceObj) => {
        if (!err)
            callback(null, memberPreferenceObj);
        else
            callback(err, null)
    });
}

let memberPreferenceServices = {
    findAllMyPreferencesByMemberId: findAllMyPreferencesByMemberId,
    saveMemberPreference: saveMemberPreference,
    getMemberFanFollowers: getMemberFanFollowers,
    updateMemberPreferances: updateMemberPreferances,
    checkAlreadyFanFollowOrNot: checkAlreadyFanFollowOrNot,
    setCelebrityMemberRelationByAction: setCelebrityMemberRelationByAction,
    payForSetAsFan: payForSetAsFan,
    makeVertualFollower: makeVertualFollower,
    getMemberPreferancesCount: getMemberPreferancesCount,
    sendNotificationToFan: sendNotificationToFan,
    sendNotificationToFollower: sendNotificationToFollower,
    sendNotificationToFanAndFollower: sendNotificationToFanAndFollower,
    getBlockUserList: getBlockUserList,
    unblockMember: unblockMember,
    getBlockersList: getBlockersList,
    fanCelebritiesbyMember: fanCelebritiesbyMember,
    followingCelebritiesByMember: followingCelebritiesByMember,
    followingMembersbyCelebrity: followingMembersbyCelebrity,
    fanMembersbyCelebrity: fanMembersbyCelebrity,
    getAllBlockUser: getAllBlockUser,
    getAllUnfanWithReason: getAllUnfanWithReason,
    getUnfanWithReasonByCelebrityId: getUnfanWithReasonByCelebrityId,
    getFanFollowFromMemberPreferancesOfMember: getFanFollowFromMemberPreferancesOfMember,
    findFanFollowByMemberId: findFanFollowByMemberId
}

module.exports = memberPreferenceServices