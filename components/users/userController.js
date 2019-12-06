let userService = require('./userService');
let ObjectId = require('mongodb').ObjectId;
let async = require('async');
let User = require('./userModel');
let Memberpreferences = require('../memberpreferences/memberpreferencesModel');
let MemberpreferencesServices = require('../memberpreferences/memberPreferenceServices');
let MediaTracking = require('../mediaTracking/mediaTrackingModel');
const CelebrityContract = require("../celebrityContract/celebrityContractsModel");
const celebrityContractsService = require('../celebrityContract/celebrityContractsService');
var cron = require('node-cron');
const mongoose = require("mongoose");
global.trendingCelebrityList = [];
global.editorChoiceCelebrities = [];
global.editorChoiceCelebritiesRes = [];
global.trendingCelebrityListRes = [];


// var MembersList = (req, res) => {
//     userService.MembersList(req.params, (err, userDetails) => {
//         if (err) {
//             res.json({ success: 0, message: err })
//         }
//         else {
//             res.json({ success: 1, data: userDetails })
//         }
//     })
// }

var checkOnLineUserIsCelebrityOrNot = (req, res) => {
    userService.checkOnLineUserIsCelebrityOrNot(ObjectId(req.params.member_Id), (err, userDetails) => {
        if (err) {
            res.json({ success: 0, userDetails: { isCeleb: false } })
        }
        else if (userDetails)
            res.json({ success: 1, userDetails: userDetails })
        else {
            res.json({ success: 0, userDetails: { isCeleb: false } })
        }
    })
}

const memberRegistrationAndProfileUpdate = (req, res) => {
    // console.log("memberRegistrationAndProfileUpdate  AAAA=== ", req.body.profile)
    // console.log("memberRegistrationAndProfileUpdate BBBB === ", req.params.memberId)
    // console.log("memberRegistrationAndProfileUpdate CCCCC === ", req.files)
    userService.memberRegistrationAndProfileUpdate(req.params.memberId, req.body, req.files, (err, userInfo, message) => {
        if (err) {
            res.json({ success: 0, token: (userInfo ? userInfo.token : ""), data: userInfo, message: err, err: err })
        }
        else {
            res.json({ success: 1, token: (userInfo ? userInfo.token : ""), data: userInfo, message: message })
        }
    })
}


const getSugessionByPreferances = (req, res) => {
    let memberId = ObjectId(req.params.memberId);
    MemberpreferencesServices.getFanFollowFromMemberPreferancesOfMember(memberId, (err, listOfMyPreferences) => {
        if (err) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        } else {
            MemberpreferencesServices.getBlockersList(memberId, (err, youblockedByCelebrity) => {
                if (err) {
                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                } else {
                    userService.getCelebrityWhoHasContract((err, contractsCelebArray) => {
                        if (err) {
                            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else {
                            userService.getSugessionByPreferances(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, celebProfileArray) => {
                                if (err) {
                                    res.json({ success: 0, data: celebProfileArray, message: err, err: err })
                                }
                                else {
                                    res.json({ success: 1, data: celebProfileArray })
                                }
                            })
                        }
                    });
                }
            });
        }
    });
}

const getTrendingCelebrities = (req, res) => {
    let memberId = ObjectId(req.params.memberId);
    MemberpreferencesServices.getFanFollowFromMemberPreferancesOfMember(memberId, (err, listOfMyPreferences) => {
        if (err) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        } else {
            MemberpreferencesServices.getBlockersList(memberId, (err, youblockedByCelebrity) => {
                if (err) {
                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                } else {
                    userService.getCelebrityWhoHasContract((err, contractsCelebArray) => {
                        if (err) {
                            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else {
                            userService.getTrendingCelebrities(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, celebProfileArray) => {
                                if (err) {
                                    res.json({ success: 0, data: celebProfileArray, message: err, err: err })
                                }
                                else {
                                    res.json({ success: 1, data: celebProfileArray })
                                }
                            })
                        }
                    });
                }
            });
        }
    });
}

const isPasswordverified = (req, res) => {
    userService.isPasswordverified(req.params.memberId, (err, isPasswordVerified) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], data: { isPasswordVerified: isPasswordVerified }, message: err, err: err })
        }
        else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: { isPasswordVerified: isPasswordVerified } })
        }
    })
}

const getUserDetailsById = (req, res, next) => {
    let id = req.params.user_id;
    userService.getUserDetailsById(id, (err, userDetails) => {
        if (err) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "Please enter valid id" });
        } else {
            res.json({ token: req.headers['x-access-token'], success: 1, data: userDetails });
        }
    })
}

let getAllCelebrityListForMember1 = async (req, res) => {
    let memberId = req.params.memberId;
    let trendingCelebrityLocalArray = [];
    let editorChoiceCelebritiesLocalArray = [];
    try {
        let query = {
            memberId: memberId
        }
        const listOfMyPreferences = await MemberpreferencesServices.getFanFollowFromMemberPreferancesOfMemberAsync(query)
        if (listOfMyPreferences) {
            let blockUser1 = await MemberpreferencesServices.getBlockersListAsync1(query)
            query = {};
            query = {
                memberId: memberId,
                blockUser1: blockUser1
            }
            let blockUser2 = await MemberpreferencesServices.getBlockersListAsync2(query);
            let youblockedByCelebrity = [...blockUser1, ...blockUser2];
            query = {};
            query = {
                memberId: memberId,
            };
            let contractsCelebArray = await userService.getCelebrityWhoHasContractAsync(query);
            contractsCelebArray = contractsCelebArray.map(function (id, index) {
                if (id == memberId)
                    contractsCelebArray.splice(index, 1);
            })
            query = {};
            query = {
                memberId: memberId,
                contractsCelebArray: contractsCelebArray,
                listOfMyPreferences: listOfMyPreferences,
                youblockedByCelebrity: youblockedByCelebrity
            };
            if (editorChoiceCelebrities.length) {
                editorChoiceCelebritiesLocalArray = editorChoiceCelebrities
            }
            if (global.editorChoiceCelebritiesRes <= 0) {
                editorChoiceCelebritiesLocalArray.map((celebDetails) => {
                    if (listOfMyPreferences && listOfMyPreferences.celebrities) {
                        celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
                            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
                        });
                        celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
                            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
                        });
                    }
                    else {
                        celebDetails.isFan = false;
                        celebDetails.isFollower = false;
                    }
                    if (youblockedByCelebrity && youblockedByCelebrity.length) {
                        celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
                            return (celebDetails._id + "" == s.celebrityId + "")
                        });
                    }
                    else {
                        celebDetails.isBlocked = false;
                    }
                })
                global.editorChoiceCelebritiesRes = editorChoiceCelebrities;
            }
            let recommendedCelebrities = await userService.getSugessionByPreferancesAsync(query);
            recommendedCelebrities.map((celebDetails) => {
                if (listOfMyPreferences && listOfMyPreferences.celebrities) {
                    celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
                        return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
                    });
                    celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
                        return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
                    });
                }
                else {
                    celebDetails.isFan = false;
                    celebDetails.isFollower = false;
                }
                if (youblockedByCelebrity && youblockedByCelebrity.length) {
                    celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
                        return (celebDetails._id + "" == s.celebrityId + "")
                    });
                }
                else {
                    celebDetails.isBlocked = false;
                }
            })

            if (trendingCelebrityList.length) {
                trendingCelebrityLocalArray = trendingCelebrityList
            }
            if (global.trendingCelebrityListRes <= 0) {
                trendingCelebrityLocalArray.map((celebDetails) => {
                    if (listOfMyPreferences && listOfMyPreferences.celebrities) {
                        celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
                            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
                        });
                        celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
                            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
                        });
                    }
                    else {
                        celebDetails.isFan = false;
                        celebDetails.isFollower = false;
                    }
                    if (youblockedByCelebrity && youblockedByCelebrity.length) {
                        celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
                            return (celebDetails._id + "" == s.celebrityId + "")
                        });
                    }
                    else {
                        celebDetails.isBlocked = false;
                    }
                })
                global.trendingCelebrityListRes = trendingCelebrityLocalArray;
            }
            res.json({ success: 1, data: { recommendedCelebrities: recommendedCelebrities, editorChoiceCelebrities: editorChoiceCelebritiesRes, trendingCelebrities: trendingCelebrityListRes } })
        } else {
            return res.status(404).json({ success: 0, message: "Error while fetching current member preference." })
        }
    } catch (error) {
        // console.log("Error here &&&&&&&&&& ", error);
        return res.status(404).json({ success: 0, message: "Error while get All celebs " + error })
    }

}

const getVideoByMemberID = (req, res) => {
    userService.getVideoByMemberID(req.params, (err, videoObjects) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: err, err: err })
        }
        else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: videoObjects })
        }
    })
}

const getBrandsByMemberID = (req, res) => {
    userService.getBrandsByMemberID(req.params, (err, videoObjects) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: err, err: err })
        }
        else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: videoObjects })
        }
    })
}

const getImagesByMemberID = (req, res) => {
    userService.getImagesByMemberID(req.params, (err, imageObject) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: err, err: err })
        }
        else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: imageObject })
        }
    })
}

const getAllDetailsOfCelebrityForMemberId = (req, res) => {
    userService.getAllDetailsOfCelebrityForMemberId(req.params, (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: err, err: err })
        }
        else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: result })
        }
    })
}

const getAllDetailsOfCelebrity = (req, res) => {
    userService.getAllDetailsOfCelebrity(req.params, (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: err, err: err })
        }
        else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: result })
        }
    })
}
//24 12 * * * ever 12PM
//1 * * * * * every mins
//*/5 * * * * *
// let cronJon = '1 * * * * *'
// global.isCronJobFirstTime = false;
// if (global.isCronJobFirstTime == true)
//     cronJon = '2 * * * * *'
// var trandingCelebrity = cron.schedule('*/50 * * * * *', function (req, res) {
//     // console.log("***************************** Cron job tranding ************************", new Date())

// }, false);
// trandingCelebrity.start();






//Get Trending ceeleb
const CronJob = require('cron').CronJob
const CronTime = require('cron').CronTime
const a = new CronJob('*/4 * * * * *', function () {
    run() // function called inside cron
}, null, false);

let run = () => {
    // console.log('Get all trending list here ', new Date())
    global.editorChoiceCelebritiesRes = [];
    global.trendingCelebrityListRes = [];
    CelebrityContract.distinct("memberId", (err, contractsCelebArray) => {
        if (err) {
            console.log("Error while celeb contract by cron job", err)
        } else {
            let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
            let provideData = {
                _id: 1, avtar_imgPath: 1, avtar_originalname: 1, cover_imgPath: 1, custom_imgPath: 1,
                imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
                isTrending: 1, aboutMe: 1, category: 1, preferenceId: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
            }
            User.find({ _id: { $in: objectIdArray }, isCeleb: true, IsDeleted: false, isEditorChoice: true }, provideData, (err, editorChoiceCelebs) => {
                if (err)
                    console.log(err)
                else {
                    let today = new Date();
                    let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);
                    Memberpreferences.aggregate([
                        { $unwind: "$celebrities" },
                        { $match: { "celebrities.createdAt": { $gte: yesterday } } },
                        { $group: { _id: "$celebrities.CelebrityId", len: { $sum: 1 } } },
                        {
                            $match: { _id: { $in: objectIdArray } }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "celebProfile"
                            }
                        },
                        { $sort: { len: -1 } },
                        { $limit: 30 },
                        { $unwind: "$celebProfile" },
                        {
                            $project: {
                                len: 1,
                                celebProfile: provideData
                            }
                        }
                    ], (err, trandingCeleArray1) => {
                        if (err) {
                            callback(err, null)
                        }
                        else if (trandingCeleArray1.length == 30) {
                            trandingCeleArray1 = trandingCeleArray1.map((celeb) => {
                                return celeb.celebProfile
                            })
                            global.trendingCelebrityList = trandingCeleArray1;
                            global.editorChoiceCelebrities = editorChoiceCelebs;
                        }
                        else {
                            let length = 30 - trandingCeleArray1.length;
                            let today = new Date();
                            let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
                            MediaTracking.aggregate([
                                {
                                    $match: {
                                        created_at: { $gte: yesterday }, isLike: true
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$feedId",
                                        len: { $sum: 1 }
                                    }
                                },
                                { $sort: { len: -1 } },

                                {
                                    $lookup: {
                                        from: "feeds",
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "feedDetails"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "users",
                                        localField: "feedDetails.memberId",
                                        foreignField: "_id",
                                        as: "celebProfile"
                                    }
                                }, {
                                    $unwind: "$celebProfile"
                                },
                                { $limit: length },
                                {
                                    $project: {
                                        len: 1,
                                        celebProfile: provideData
                                    }
                                }
                            ], (err, trandingCeleArray2) => {
                                if (err) {
                                    console.log("Error while fetching fetching trending celeb by cron job ")
                                } else {
                                    trandingCeleArray = trandingCeleArray1.concat(trandingCeleArray2)
                                    trandingCeleArray = trandingCeleArray.map((celeb) => {
                                        return celeb.celebProfile
                                    })
                                    trandingCeleArray.forEach((user) => {
                                        for (i = 0; i < trandingCeleArray.length; i++) {
                                            if ((user._id.toString() == trandingCeleArray[i]._id.toString()) && i != trandingCeleArray.indexOf(user)) {
                                                trandingCeleArray.splice(i, 1);
                                            }
                                        }
                                    })
                                    global.trendingCelebrityList = trandingCeleArray;
                                    global.editorChoiceCelebrities = editorChoiceCelebs;
                                }
                            })
                        }
                    })
                }
            }).lean().sort({ firstName: 1 });
        }
    });
}

let scheduler = () => {
    // console.log('CRON JOB STARTED WILL RUN IN EVERY 4 SECOND')
    a.start()
}

let schedulerStop = () => {
    a.stop()
    // console.log('scheduler stopped')
}

let schedulerStatus = () => {
    // console.log('cron running status ---->>>', a.running)
}

let changeTime = (input) => {
    a.setTime(new CronTime(input))
    // console.log('changed to every 1 second')
}

scheduler()
setTimeout(() => { schedulerStatus() }, 1000)
setTimeout(() => { schedulerStop() }, 9000)
setTimeout(() => { schedulerStatus() }, 10000)
setTimeout(() => { changeTime('05 00 * * *') }, 11000)
setTimeout(() => { scheduler() }, 12000)
// setTimeout(() => { schedulerStop() }, 16000)

const getOnlineAndOfflineCelebs = async (req, res) => {
    try {
        let query = {
            memberId: (req.params.member_Id) ? req.params.member_Id : ''
        }
        let celebContractIds = await celebrityContractsService.getCelebIdWhoHaveContract();
        let memberFanFollowObj = await MemberpreferencesServices.getFanFollowFromMemberPreferancesOfMemberAsync(query)
        query.celebContractIds = celebContractIds; celebContractIds
        let celebDetailsObj = await userService.getOnlineAndOfflineCelebsAsync(query);
        if (celebDetailsObj.length) {
            let onlineArr = [];
            let offLineArr = [];
            celebDetailsObj.map((user) => {
                user.isFan = false;
                user.isFollower = false;
                if (memberFanFollowObj.celebrities.length) {
                    user.isFan = memberFanFollowObj.celebrities.some((s) => {
                        return ((user._id + "" == s.CelebrityId + "") && (s.isFan == true))
                    });
                    user.isFollower = memberFanFollowObj.celebrities.some((s) => {
                        return ((user._id + "" == s.CelebrityId + "") && (s.isFollower == true))
                    });
                }
                if (user.isOnline == true)
                    onlineArr.push(user)
                else
                    offLineArr.push(user)

            })
            onlineArr.sort(function (a, b) {
                if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
                if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
                return 0;
            })
            offLineArr.sort(function (a, b) {
                if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
                if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
                return 0;
            })
            const celebObjs = [...onlineArr, ...offLineArr];
            res.json({ token: req.headers['x-access-token'], success: 1, data: celebObjs });

        } else {
            return res.status(200).json({ success: 1, message: "Record not found" })
        }
    } catch (error) {
        console.log(error)
        return res.status(404).json({ success: 0, message: `something went wrong ${error}` });
    }
}


let userController = {
    checkOnLineUserIsCelebrityOrNot: checkOnLineUserIsCelebrityOrNot,
    memberRegistrationAndProfileUpdate: memberRegistrationAndProfileUpdate,
    getSugessionByPreferances: getSugessionByPreferances,
    getTrendingCelebrities: getTrendingCelebrities,
    getAllCelebrityListForMember1: getAllCelebrityListForMember1,
    getUserDetailsById: getUserDetailsById,
    isPasswordverified: isPasswordverified,
    // MembersList: MembersList,
    getVideoByMemberID: getVideoByMemberID,
    getImagesByMemberID: getImagesByMemberID,
    getAllDetailsOfCelebrityForMemberId: getAllDetailsOfCelebrityForMemberId,
    getAllDetailsOfCelebrity: getAllDetailsOfCelebrity,
    getBrandsByMemberID: getBrandsByMemberID,
    getOnlineAndOfflineCelebs: getOnlineAndOfflineCelebs
}

module.exports = userController;