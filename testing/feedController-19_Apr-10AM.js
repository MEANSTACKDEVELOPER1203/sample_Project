let feedServices = require('./feedServices');
let memberPreferenceServices = require('../memberpreferences/memberPreferenceServices')
let userServices = require('../users/userService');
let userModel = require('../users/userModel');
let ObjectId = require('mongodb').ObjectId;
let preferenceServices = require('../preferences/preferenceServices');
let async = require('async');
let ViewFeedHistory = require('./viewFeedHistoryModel');

let getFeeds = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let paginationDate = (req.params.pagination_date) ? req.params.pagination_date : '';
    let countryCode = (req.params.country_Code) ? req.params.country_Code : '';
    let state = (req.params.state) ? req.params.state : '';
    let query = {};
    let limit = 10;

    //console.log("!!!!!!!!!!!!!!!!!!!!! memeber Id======", memberId, paginationDate)
    let preferenceCelebArray = [];
    let noFanFallowers = false;
    let noPreferences = false;
    let noGEOLocationLocal = false;
    let noGEOLocationNonLocal = false;
    let viewFeedHistoryJson = {};
    let isFirstTime = true
    if (paginationDate == "0") {
        let tempDate = new Date();
        viewFeedHistoryJson.fanFollowDate = tempDate;
        viewFeedHistoryJson.preferenceDate = tempDate;
        viewFeedHistoryJson.geoLocalDate = tempDate;
        viewFeedHistoryJson.geoNonLocalDate = tempDate;
        paginationDate = new Date();
        tempDate = null;
    }
    else {
        isFirstTime = false;
    }
    async.waterfall([function (callback) {
        userModel.getUserById(ObjectId(memberId), (err, userObj) => {
            if (err) {
                //return res.status(404).json({ success: 0, message: "Error while fetching the user details", err })
                return callback(new Error(`Error while fetching the user details : ${err}`), null, null)
            } else {
                ViewFeedHistory.findViewFeedHistoryByMemberId(ObjectId(memberId), userObj, (err, viewFeedHistoryObj) => {
                    if (err)
                        return callback(new Error(`Error while fetching the View feed history details : ${err}`), null, null);
                    else {
                        let create = true
                        if (viewFeedHistoryObj) {
                            create = false;
                            viewFeedHistoryJson._id = viewFeedHistoryObj._id;
                            if (isFirstTime) {
                                tempDate = new Date();
                                viewFeedHistoryJson.fanFollowDate = tempDate;
                                viewFeedHistoryJson.preferenceDate = tempDate;
                                viewFeedHistoryJson.geoLocalDate = tempDate;
                                viewFeedHistoryJson.geoNonLocalDate = tempDate;
                                tempDate = null;
                            }
                            else{
                                viewFeedHistoryJson.fanFollowDate = viewFeedHistoryObj.fanFollowDate;
                                viewFeedHistoryJson.preferenceDate = viewFeedHistoryObj.preferenceDate;
                                viewFeedHistoryJson.geoLocalDate = viewFeedHistoryObj.geoLocalDate;
                                viewFeedHistoryJson.geoNonLocalDate = viewFeedHistoryObj.geoNonLocalDate;
                            }
                            viewFeedHistoryJson.feedId = [];
                        }
                        viewFeedHistoryJson.memberId = memberId;
                        viewFeedHistoryJson.create = create;
                        ViewFeedHistory.saveViewHistory(viewFeedHistoryJson, (err, createdViewFeedHistory) => {
                            if (err)
                                return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
                            else {
                                ViewFeedHistory.findOne({memberId:ObjectId(memberId)}, (err, viewFeedHistoryUpdatedObj) => {
                                    if (err)
                                        return callback(new Error(`Error while Fetchinf view feed history : ${err}`), null, null, null);
                                    else {
                                        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory)
                                        //return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
                                        return callback(null, userObj, viewFeedHistoryUpdatedObj);

                                    }

                                })

                            }
                        })
                    }
                })
            }
        })
    }, function (userObj, viewFeedHistoryObj, callback) {
        /*** Get FEEDS By memeber Fan Follow *** */
        memberPreferenceServices.findAllMyPreferencesByMemberId(memberId, (err, memberPreferenceObj) => {
            if (err)
                return callback(new Error(`Error while fetching the Feeds : ${err}`), null, null, null)
            //return res.status(404).json({ success: 0, message: " ", err });
            else {
                if (memberPreferenceObj.memberListArray.length <= 0) {
                    noFanFallowers = true
                } else {
                    if (userObj.isCeleb == true)
                        memberPreferenceObj.memberListArray.push(userObj._id);
                }
                query.viewFeedArray = []
                if (viewFeedHistoryObj)
                    query.viewFeedArray = viewFeedHistoryObj.feedId.map((feedId) => {
                        return (feedId.feedId)
                    });
                query.memberId = memberId;
                //query.paginationDate = paginationDate
                query.paginationDate = viewFeedHistoryObj.fanFollowDate;
                query.memberListArray = memberPreferenceObj.memberListArray;
                query.limit = limit;
                preferenceCelebArray = memberPreferenceObj.memberListArray;
                query.isFanFollow = true;
                query.isPreferences = false;
                query.isGeoLocation = false;
                query.isNonGeoLocation = false;
                feedServices.findFeedByMemberId(query, (err, listOfFeedObj) => {
                    if (err) {
                        return callback(new Error(`Error while fetching the Feeds by member list : ${err}`), null, null, null)
                        //return res.status(404).json({ success: 0, message: "Error while fetching the Feeds by member list", err })
                    } else {
                        let feedIdArray = listOfFeedObj.map((feedId) => {
                            return { feedId: feedId._id, memberId: feedId.memberId };
                        })
                        create = false
                        if (viewFeedHistoryObj && listOfFeedObj.length > 0) {
                            //create = false;
                            viewFeedHistoryJson.fanFollowDate = listOfFeedObj[listOfFeedObj.length - 1].created_at
                        }
                        else {
                            tempDate = new Date();
                            viewFeedHistoryJson.fanFollowDate = tempDate;
                            viewFeedHistoryJson.preferenceDate = tempDate;
                            viewFeedHistoryJson.geoLocalDate = tempDate;
                            viewFeedHistoryJson.geoNonLocalDate = tempDate;
                            tempDate = null;
                        }
                        viewFeedHistoryJson._id = viewFeedHistoryObj._id
                        //viewFeedHistoryJson.feedId = viewFeedHistoryObj.feedId.length > 0 && feedIdArray!= null && feedIdArray.length > 0 ? viewFeedHistoryObj.feedId.push(...feedIdArray) : viewFeedHistoryObj.feedId;
                        viewFeedHistoryJson.feedId = [];
                        if (feedIdArray.length > 0)
                            viewFeedHistoryJson.feedId = viewFeedHistoryObj.feedId.length > 0 ? feedIdArray.concat(viewFeedHistoryObj.feedId) : feedIdArray;
                        viewFeedHistoryJson.memberId = memberId;
                        viewFeedHistoryJson.create = create;
                        ViewFeedHistory.saveViewHistory(viewFeedHistoryJson, (err, createdViewFeedHistory) => {
                            if (err)
                                return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
                            else {
                                //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory, "listOfFeedObj",listOfFeedObj.length)
                                return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
                            }
                        })
                        //return res.status(200).json({ success: 1, data: listOfFeedObj, memberPreferenceObj });
                        //return callback(null, userObj, memberPreferenceObj, listOfFeedObj);
                    }
                });
                //res.status(200).json({ success: 1, message: "Get All Feeds", memberPreferenceObj })
            }
        });
    }
        , function (userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj, callback) {
            /*** Get FEEDS By memeber Preferences *** */
            // console.log("noFanFallowers===", noFanFallowers)
            // console.log("noPreferences===", noPreferences)
            if (listOfFeedObj.length < limit) {
                let feedIdArray = listOfFeedObj.map((feedId) => {
                    return feedId._id;
                })
                // console.log("Remove feed from Preference ===== ", feedIdArray)
                preferenceServices.findCelebrityByMemberPreference(memberPreferenceObj, userObj, (err, memberListByPreference) => {
                    if (err)
                        return callback(new Error(`Error while find the member list preference : ${err}`), null, null, null)
                    //return res.status(404).json({ success: 0, message: "Error while find the member list preference", err })
                    else {
                        //console.log("pppppppppprrrrrrrrreeeeeeeee    ==== ", memberListByPreference);
                        if (memberListByPreference.length <= 0)
                            noPreferences = true
                        if (noFanFallowers && noPreferences && userObj.isCeleb == true)
                            memberListByPreference.push(userObj._id)
                        query.viewFeedArray = []
                        if (viewFeedHistoryObj)
                            query.viewFeedArray = viewFeedHistoryObj.feedId;
                        query.limit = limit - listOfFeedObj.length;
                        query.memberListArray = memberListByPreference;
                        query.isPreferences = true;
                        query.isFanFollow = false;
                        query.isGeoLocation = false;
                        query.isNonGeoLocation = false;
                        if (!noFanFallowers && viewFeedHistoryObj)
                            query.viewFeedArray = viewFeedHistoryObj.feedId == null ? [] : viewFeedHistoryObj.feedId;
                        query.currentFeedArray = feedIdArray;
                        query.isDataFromMemberPreferences = true;
                        query.paginationDate = viewFeedHistoryObj.preferenceDate;
                        //console.log("########################Preference query@@@@@@@@@@@@@@@@@@@@@@@@", query)
                        feedServices.findFeedByMemberId(query, (err, listOfFeedByMemberPreferenceObj) => {
                            if (err)
                                return callback(new Error(`Error while find the feeds by member preference : ${err}`), null, null, null)
                            else {
                                //console.log("listOfFeedObj lenght preference", memberListByPreference.length)
                                create = false
                                if (viewFeedHistoryObj && listOfFeedByMemberPreferenceObj.length > 0) {
                                    //create = false;
                                    viewFeedHistoryJson.preferenceDate = listOfFeedByMemberPreferenceObj[listOfFeedByMemberPreferenceObj.length - 1].created_at;
                                    viewFeedHistoryJson.fanFollowDate = viewFeedHistoryObj.fanFollowDate;
                                    viewFeedHistoryJson.geoLocalDate = viewFeedHistoryObj.geoLocalDate;
                                    viewFeedHistoryJson.geoNonLocalDate = viewFeedHistoryObj.geoNonLocalDate;
                                }
                                else {
                                    tempDate = new Date();
                                    viewFeedHistoryJson.fanFollowDate = tempDate;
                                    viewFeedHistoryJson.preferenceDate = tempDate;
                                    viewFeedHistoryJson.geoLocalDate = tempDate;
                                    viewFeedHistoryJson.geoNonLocalDate = tempDate;
                                    tempDate = null;
                                }
                                viewFeedHistoryJson.feedId = [];
                                viewFeedHistoryJson._id = viewFeedHistoryObj._id
                                viewFeedHistoryJson.memberId = memberId;
                                viewFeedHistoryJson.create = create;
                                preferenceCelebArray.push(...memberListByPreference)
                                listOfFeedObj.push(...listOfFeedByMemberPreferenceObj)
                                ViewFeedHistory.saveViewHistory(viewFeedHistoryJson, (err, createdViewFeedHistory) => {
                                    if (err)
                                        return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
                                    else {
                                        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory, "listOfFeedObj",listOfFeedObj.length)
                                        // return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
                                        return callback(null, userObj, listOfFeedObj, memberListByPreference, viewFeedHistoryObj);
                                    }
                                })


                            }
                        })
                        //return callback(null, userObj, listOfFeedObj, memberListByPreference);
                        //return res.status(200).json({ success: 1, data: listOfFeedObj, memberPreferenceObj, memberListByPreference });
                    }
                })
            } else {
                //return callback(null, userObj, listOfFeedObj);
                return callback(null, userObj, listOfFeedObj, null, viewFeedHistoryObj);
            }
            //return callback(null,  userObj, listOfFeedObj);

        }
        , function (userObj, listOfFeedObj, Obj, viewFeedHistoryObj, callback) {
            /******** GET Feeds By Geo Location *************** */
            // console.log("noFanFallowers===", noFanFallowers)
            // console.log("noPreferences===", noPreferences)
            // console.log("noGEOLocationLocal===", noGEOLocationLocal)
            if (listOfFeedObj.length < limit) {
                query.limit = limit - listOfFeedObj.length;
                let feedIdArray = listOfFeedObj.map((feedId) => {
                    return feedId._id;
                })
                // console.log("Remove feed from GEO ===== ", feedIdArray)
                userServices.findCelebByCountry(userObj, preferenceCelebArray, noPreferences, (err, listOfCelebsByCountry) => {
                    if (err)
                        return callback(new Error(`Error while find the celeb by country (GEO) : ${err}`), null, null, null);
                    else {
                        if (listOfCelebsByCountry.length <= 0)
                            noGEOLocationLocal = true
                        if (noFanFallowers && noPreferences && noGEOLocationLocal && userObj.isCeleb == true)
                            listOfCelebsByCountry.push(userObj._id)
                        query.viewFeedArray = [];
                        // if (listOfCelebsByCountry.length <= 0 && viewFeedHistoryObj)
                        //     query.viewFeedArray = viewFeedHistoryObj.feedId;
                        query.memberListArray = listOfCelebsByCountry;
                        query.currentFeedArray = feedIdArray;
                        query.isGeoLocation = true;
                        query.isFanFollow = false;
                        query.isPreferences = false;
                        query.isNonGeoLocation = false;
                        query.paginationDate = viewFeedHistoryObj.geoLocalDate;
                        // console.log("&&&&&&&&&&&&&&&&&&&&&&GEO query@@@@@@@@@@@@@@@@@@@@@@@@", query)
                        feedServices.findFeedByMemberId(query, (err, listOfFeedByGeoObj) => {
                            if (err)
                                return callback(new Error(`Error while find the feeds by member preference : ${err}`), null, null, null)
                            else {
                                create = false
                                if (viewFeedHistoryObj && listOfFeedByGeoObj.length > 0) {
                                    //create = false;
                                    viewFeedHistoryJson.geoLocalDate = listOfFeedByGeoObj[listOfFeedByGeoObj.length - 1].created_at;
                                }
                                else {
                                    tempDate = new Date();
                                    viewFeedHistoryJson.fanFollowDate = tempDate;
                                    viewFeedHistoryJson.preferenceDate = tempDate;
                                    viewFeedHistoryJson.geoLocalDate = tempDate;
                                    viewFeedHistoryJson.geoNonLocalDate = tempDate;
                                    tempDate = null;
                                }
                                viewFeedHistoryJson.feedId = [];
                                viewFeedHistoryJson._id = viewFeedHistoryObj._id;
                                viewFeedHistoryJson.memberId = memberId;
                                viewFeedHistoryJson.create = create;
                                ViewFeedHistory.saveViewHistory(viewFeedHistoryJson, (err, createdViewFeedHistory) => {
                                    if (err)
                                        return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
                                    else {
                                        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory, "listOfFeedObj",listOfFeedObj.length)
                                        // return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
                                        //return callback(null, userObj, listOfFeedObj, memberListByPreference, viewFeedHistoryObj);
                                        listOfFeedObj.push(...listOfFeedByGeoObj);
                                        return callback(null, userObj, listOfFeedObj, listOfCelebsByCountry, viewFeedHistoryObj);
                                    }
                                })
                                //preferenceCelebArray.push(...memberListByPreference)
                                // console.log("listOfFeedByGeoObj lenght", listOfFeedByGeoObj.length)

                            }
                        });
                        //return callback(null, userObj, listOfFeedObj, null);
                    }
                })
            } else {
                return callback(null, userObj, listOfFeedObj, null, viewFeedHistoryObj);
            }

        }, function (userObj, listOfFeedObj, Obj, viewFeedHistoryObj, callback) {
            /******** GET Feeds By NON Geo Location *************** */
            // console.log("noFanFallowers===", noFanFallowers)
            // console.log("noPreferences===", noPreferences)
            // console.log("noGEOLocationLocal===", noGEOLocationLocal)
            // console.log("noGEOLocationNonLocal===", noGEOLocationNonLocal)
            if (listOfFeedObj.length < limit) {
                query.limit = limit - listOfFeedObj.length;
                let feedIdArray = listOfFeedObj.map((feedId) => {
                    return feedId._id;
                })
                // console.log("Remove feed from GEO ===== ", feedIdArray)
                userServices.findCelebNonCountry(userObj, noGEOLocationLocal, (err, listOfCelebsByNonCountry) => {
                    if (err)
                        return callback(new Error(`Error while find the celeb by country (GEO) : ${err}`), null, null, null);
                    else {
                        if (listOfCelebsByNonCountry.length <= 0)
                            noGEOLocationNonLocal = true
                        if (noFanFallowers && noPreferences && noGEOLocationLocal && noGEOLocationLocal && userObj.isCeleb == true)
                            noGEOLocationLocal.push(userObj._id);
                        query.viewFeedArray = [];
                        // if (listOfCelebsByNonCountry.length <= 0 && viewFeedHistoryObj)
                        //     query.viewFeedArray = viewFeedHistoryObj.feedId;
                        query.memberListArray = listOfCelebsByNonCountry;
                        query.currentFeedArray = feedIdArray;
                        query.isNonGeoLocation = true;
                        query.isGeoLocation = true;
                        query.isFanFollow = false;
                        query.isPreferences = false;
                        query.paginationDate = viewFeedHistoryObj.geoNonLocalDate;
                        // console.log("%%%%%%%%%%%%%%%%%%%%%%%%Non Geo query@@@@@@@@@@@@@@@@@@@@@@@@", query)
                        feedServices.findFeedByMemberId(query, (err, listOfFeedByNonGeoObj) => {
                            if (err)
                                return callback(new Error(`Error while find the feeds by member preference : ${err}`), null, null, null)
                            else {
                                create = false
                                if (viewFeedHistoryObj && listOfFeedByNonGeoObj.length > 0) {
                                    //create = false;
                                    viewFeedHistoryJson.geoNonLocalDate = listOfFeedByNonGeoObj[listOfFeedByNonGeoObj.length - 1].created_at;
                                }
                                else {
                                    tempDate = new Date();
                                    viewFeedHistoryJson.fanFollowDate = tempDate;
                                    viewFeedHistoryJson.preferenceDate = tempDate;
                                    viewFeedHistoryJson.geoLocalDate = tempDate;
                                    viewFeedHistoryJson.geoNonLocalDate = tempDate;
                                    tempDate = null;
                                }
                                viewFeedHistoryJson.feedId = [];
                                viewFeedHistoryJson._id = viewFeedHistoryObj._id;
                                viewFeedHistoryJson.memberId = memberId;
                                viewFeedHistoryJson.create = create;
                                ViewFeedHistory.saveViewHistory(viewFeedHistoryJson, (err, createdViewFeedHistory) => {
                                    if (err)
                                        return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
                                    else {
                                        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory, "listOfFeedObj",listOfFeedObj.length)
                                        // return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
                                        //return callback(null, userObj, listOfFeedObj, memberListByPreference, viewFeedHistoryObj);
                                        // listOfFeedObj.push(...listOfFeedByGeoObj);
                                        // return callback(null, userObj, listOfFeedObj, listOfCelebsByCountry, viewFeedHistoryObj);
                                        listOfFeedObj.push(...listOfFeedByNonGeoObj);
                                        return callback(null, userObj, listOfFeedObj, null);
                                    }
                                })
                                // console.log("listOfFeedByNonGeoObj", listOfFeedByNonGeoObj.length)
                                //preferenceCelebArray.push(...memberListByPreference)
                                // listOfFeedObj.push(...listOfFeedByNonGeoObj);
                                // return callback(null, userObj, listOfFeedObj, null);
                            }
                        });
                        //return callback(null, userObj, listOfFeedObj, null);
                    }
                })
            } else {
                return callback(null, userObj, listOfFeedObj, null);
            }

        }

    ], function (err, userObj, listOfFeedObj, preferenceObj) {
        if (err) {
            console.log(err);
            return res.status(404).json({ success: 0, message: `${err}` });
        } else {
            // listOfFeedObj.sort(function (x, y) {
            //     var dateA = new Date(x.created_at), dateB = new Date(y.created_at);
            //     return dateB - dateA;
            // });
            // let results = getUnique(listOfFeedObj, "comp");
            // console.log(results.length)
            return res.status(200).json({ success: 1, testdata: null, data: listOfFeedObj });
        }
    });

    //console.log(userObj)

}

function getUnique(arr, comp) {

    const unique = arr
        .map(e => e[comp])

        // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)

        // eliminate the dead keys & store unique objects
        .filter(e => arr[e]).map(e => arr[e]);

    return unique;
}



// console.log("Feed list", listOfFeedObj.length)
// if (listOfFeedObj.length < 3) {
//     preferenceServices.findCelebrityByMemberPreference(memberPreferenceObj, (err, memberListByPreference) => {
//         if (err)
//             return res.status(404).json({ success: 0, message: "Error while find the member list preference", err })
//         else {
//             return res.status(200).json({ success: 1, data: listOfFeedObj, memberPreferenceObj, memberListByPreference });
//         }
//     })

// }


let getFeedByFeedPreference = (req, res) => {
    feedServices.findFeedByFeedPreferences((err, listOfFeeds) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while get feed by feed preference", err })
        } else if (listOfFeeds.length <= 0) {
            return res.status(200).json({ success: 0, message: "there is no feed by preferences" });
        } else {
            return res.status(200).json({ success: 1, data: listOfFeeds });
        }

    })
}



let feedController = {
    getFeeds: getFeeds,
    getFeedByFeedPreference: getFeedByFeedPreference
}

module.exports = feedController;