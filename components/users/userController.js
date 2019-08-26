let userService = require('./userService');
let ObjectId = require('mongodb').ObjectId;
let async = require('async');
let Memberpreferences = require('../memberpreferences/memberpreferencesModel');
let MemberpreferencesServices = require('../memberpreferences/memberPreferenceServices');



var MembersList = (req, res) => {
    userService.MembersList(req.params, (err, userDetails) => {
        if (err) {
            res.json({ success: 0, message: err })
        }
        else {
            res.json({ success: 1, data: userDetails })
        }
    })
}

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

const getAllCelebrityListForMember1 = (req, res) => {
    let memberId = req.params.memberId;
    MemberpreferencesServices.getFanFollowFromMemberPreferancesOfMember(memberId, (err, listOfMyPreferences) => {
        if (err) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        } else {
            MemberpreferencesServices.getBlockersList(memberId, (err, youblockedByCelebrity) => {
                if (err) {
                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                } else {
                    userService.getCelebrityWhoHasContract(memberId, (err, contractsCelebArray) => {
                        if (err) {
                            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else {
                            userService.getAllCelebrity(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, allCelebrities) => {
                                if (err) {
                                    res.json({ success: 0, message: err, err: err })
                                }
                                else {
                                    userService.getAllEditorChoice(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, editorChoiceCelebrities) => {
                                        if (err) {
                                            res.json({ success: 0, message: err, err: err })
                                        }
                                        else {
                                            userService.getOnlineCelebrity(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, listOfOnlineCelebraties) => {
                                                if (err) {
                                                    res.json({ success: 0, message: err, err: err })
                                                }
                                                else {
                                                    userService.getTrendingCelebrities(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, trendingCelebrities) => {
                                                        if (err) {
                                                            res.json({ success: 0, message: err, err: err })
                                                        }
                                                        else {
                                                            userService.getSugessionByPreferances(memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, (err, recommendedCelebrities) => {
                                                                if (err) {
                                                                    res.json({ success: 0, message: err, err: err })
                                                                }
                                                                else {
                                                                    recommendedCeleb = recommendedCelebrities.filter((recomandedObj, index) => {
                                                                        let celebId = recomandedObj._id;
                                                                        celebId = "" + celebId;
                                                                        if (celebId == memberId)
                                                                            recommendedCelebrities.splice(index, 1);
                                                                        else
                                                                            return recomandedObj
                                                                    })
                                                                    res.json({ success: 1, data: { celebrities: allCelebrities, recommendedCelebrities: recommendedCeleb, editorChoiceCelebrities: editorChoiceCelebrities, listOfOnlineCelebraties: listOfOnlineCelebraties, trendingCelebrities: trendingCelebrities } })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    });
                                }
                            })
                        }
                    })
                }
            })
        }
    })
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


let userController = {
    checkOnLineUserIsCelebrityOrNot: checkOnLineUserIsCelebrityOrNot,
    memberRegistrationAndProfileUpdate: memberRegistrationAndProfileUpdate,
    getSugessionByPreferances: getSugessionByPreferances,
    getTrendingCelebrities: getTrendingCelebrities,
    getAllCelebrityListForMember1: getAllCelebrityListForMember1,
    getUserDetailsById: getUserDetailsById,
    isPasswordverified: isPasswordverified,
    MembersList: MembersList,
    getVideoByMemberID: getVideoByMemberID,
    getImagesByMemberID: getImagesByMemberID,
    getAllDetailsOfCelebrityForMemberId: getAllDetailsOfCelebrityForMemberId,
    getAllDetailsOfCelebrity: getAllDetailsOfCelebrity,
    getBrandsByMemberID: getBrandsByMemberID
}

module.exports = userController;