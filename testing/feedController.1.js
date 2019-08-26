let feedServices = require('../components/feed/feedServices');
let memberPreferenceServices = require('../components/memberpreferences/memberPreferenceServices')
let userServices = require('../components/users/userService');
let userModel = require('../components/users/userModel');
let ObjectId = require('mongodb').ObjectId;
let preferenceServices = require('../components/preferences/preferenceServices');
let async = require('async');
let ViewFeedHistory = require('../components/feed/viewFeedHistoryModel');

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
    let isNewSession = false
    if (paginationDate == "0") {
        viewFeedHistoryJson.viewFeedHistory = []
        isFirstTime = true;
    } else if (paginationDate == "-1") {
        isNewSession = true
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
                        let create = true;
                        tempDate = new Date();
                        if (viewFeedHistoryObj) {
                            create = false;
                            if (!isFirstTime) tempDate = viewFeedHistoryObj.fanFollowDate;
                            if (isFirstTime) viewFeedHistoryObj.viewFeedHistory = [];
                        }
                        else {
                            tempDate = new Date();
                        }
                        let newViewHisObj = prepareViewHistory(1, viewFeedHistoryJson, viewFeedHistoryObj, tempDate, memberId, create, isFirstTime);
                        tempDate = null;
                        ViewFeedHistory.saveViewHistory(newViewHisObj, (err, createdViewFeedHistory) => {
                            if (err)
                                return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
                            else {
                                viewFeedHistoryObj = createdViewFeedHistory;
                                return callback(null, userObj, viewFeedHistoryObj);
                            }
                        })
                    }
                })
            }
        })
    }, function (userObj, viewFeedHistoryObj, callback) {
        /************** Check User fan follow  and preferences ************************* */
        memberPreferenceServices.getMemberFanFollowers(userObj, (err, fanFollowersObj) => {
            if (err)
                return callback(new Error(`Error while fetching the View feed history details : ${err}`), null);
            else {
                //console.log("ZZZZZZZZZZZZZZZZZzz ", fanFollowersObj)
                return callback(null, userObj, viewFeedHistoryObj, fanFollowersObj)
            }
        })
    },
    function (userObj, viewFeedHistoryObj, fanFollowersObj, callback) {
        /*** Get FEEDS By memeber Fan Follow *** */
        // memberPreferenceServices.findAllMyPreferencesByMemberId(memberId, (err, memberPreferenceObj) => {
        //     if (err)
        //         return callback(new Error(`Error while fetching the Feeds : ${err}`), null)
        //     //return res.status(404).json({ success: 0, message: " ", err });
        //     else {
                //console.log("Fan Follow ", memberPreferenceObj)
                // if (userObj.isCeleb == true)
                //     memberPreferenceObj.memberListArray.push(userObj._id);
                if (fanFollowersObj.fanFollowers.length <= 0) {
                    noFanFallowers = true
                }
                query.viewFeedArray = []
                query.viewedFeedHistory = [];
                query.country = userObj.country;
                if (viewFeedHistoryObj) {
                    if (viewFeedHistoryObj.feedId.length > 0)
                        query.viewFeedArray = viewFeedHistoryObj.currentFanFollowfeedId;
                    if (viewFeedHistoryObj.viewFeedHistory.length > 0)
                        query.viewedFeedHistory = viewFeedHistoryObj.viewFeedHistory;
                }

                //preferenceCelebArray = memberPreferenceObj.memberListArray;
                prepareFeedQuery(1, query, memberId, limit, fanFollowersObj.fanFollowers, viewFeedHistoryObj.fanFollowDate)
                feedServices.findFeedByMemberId(query, (err, listOfFeedObj) => {
                    if (err) {
                        return callback(new Error(`Error while fetching the Feeds by member list : ${err}`), null)
                    } else {
                        let feedIdArray = listOfFeedObj.map((feedId) => {
                            return { feedId: feedId._id, memberId: feedId.memberId };
                        })
                        let viewFeedHistoryIds = listOfFeedObj.map((feedId) => {
                            return feedId._id
                        })
                        create = false
                        viewFeedHistoryJson._id = viewFeedHistoryObj._id
                        //viewFeedHistoryJson.feedId = viewFeedHistoryObj.feedId.length > 0 && feedIdArray!= null && feedIdArray.length > 0 ? viewFeedHistoryObj.feedId.push(...feedIdArray) : viewFeedHistoryObj.feedId;
                        viewFeedHistoryJson.feedId = [];
                        if (feedIdArray.length > 0) {
                            viewFeedHistoryJson.feedId = viewFeedHistoryObj.feedId.length > 0 ? feedIdArray.concat(viewFeedHistoryObj.feedId) : feedIdArray;
                            viewFeedHistoryJson.viewFeedHistory = viewFeedHistoryObj.viewFeedHistory.length > 0 ? viewFeedHistoryIds.concat(viewFeedHistoryObj.viewFeedHistory) : viewFeedHistoryIds;
                        }
                        let newViewHisObj2
                        if (viewFeedHistoryObj && listOfFeedObj.length > 0) {
                            //create = false;
                            newViewHisObj2 = prepareViewHistory(1, viewFeedHistoryJson, viewFeedHistoryObj, listOfFeedObj[listOfFeedObj.length - 1].created_at, memberId, create, isFirstTime);
                        }
                        else {
                            newViewHisObj2 = prepareViewHistory(1, viewFeedHistoryJson, viewFeedHistoryObj, viewFeedHistoryObj.fanFollowDate, memberId, create), isFirstTime;
                        }
                        ViewFeedHistory.saveViewHistory(newViewHisObj2, (err, createdViewFeedHistory) => {
                            if (err)
                                return callback(new Error(`Error while creating view feed history : ${err}`), null);
                            else {
                                if (listOfFeedObj.length <= 0 && fanFollowersObj.fanFollowers.length <= 0) {
                                    suggestionsObj = {};
                                    suggestionsObj.type = 1;
                                    suggestionsObj.suggestions = fanFollowersObj.suggestions;
                                    listOfFeedObj.push(suggestionsObj)
                                }
                                return callback(null, listOfFeedObj);
                            }
                        })
                    }
                });
        //     }
        // });
    }
        // , function (userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj, callback) {
        //     /*** Get FEEDS By memeber Preferences *** */
        //     // console.log("noFanFallowers===", noFanFallowers)
        //     // console.log("noPreferences===", noPreferences)
        //     if (listOfFeedObj.length < limit) {
        //         let feedIdArray = listOfFeedObj.map((feedId) => {
        //             return feedId._id;
        //         })
        //         // console.log("Remove feed from Preference ===== ", feedIdArray)
        //         preferenceServices.findCelebrityByMemberPreference(memberPreferenceObj, userObj, (err, memberListByPreference) => {
        //             if (err)
        //                 return callback(new Error(`Error while find the member list preference : ${err}`), null, null, null)
        //             //return res.status(404).json({ success: 0, message: "Error while find the member list preference", err })
        //             else {
        //                 //console.log("pppppppppprrrrrrrrreeeeeeeee    ==== ", memberListByPreference);
        //                 if (memberListByPreference.length <= 0)
        //                     noPreferences = true
        //                 // if (noFanFallowers && noPreferences && userObj.isCeleb == true)
        //                 //     memberListByPreference.push(userObj._id)
        //                 query.viewFeedArray = [];
        //                 query.viewedFeedHistory = []
        //                 if (viewFeedHistoryObj) {
        //                     query.viewFeedArray = viewFeedHistoryObj.currentFanFollowfeedId;
        //                     //memberListByPreference.push(viewFeedHistoryObj.currentFanFollowMemberId)
        //                     if (!noPreferences && memberListByPreference.length > 0) {
        //                         viewFeedHistoryObj.currentFanFollowMemberId.forEach((celebId) => {
        //                             memberListByPreference.push(ObjectId(celebId));
        //                         })
        //                     }

        //                     //console.log("prefererence list with fan ", memberListByPreference)
        //                     // viewFeedHistoryObj.feedId.map((feedId) => {
        //                     //     return feedId.feedId
        //                     // });
        //                     query.viewedFeedHistory = viewFeedHistoryObj.viewFeedHistory;
        //                 }

        //                 // if (!noFanFallowers && viewFeedHistoryObj)
        //                 //     query.viewFeedArray = viewFeedHistoryObj.feedId == null ? [] : viewFeedHistoryObj.feedId;
        //                 query.currentFeedArray = feedIdArray;
        //                 query.country = userObj.country;
        //                 query.isDataFromMemberPreferences = true;
        //                 if (!isFirstTime)
        //                     prepareFeedQuery(2, query, memberId, limit - listOfFeedObj.length, memberListByPreference, viewFeedHistoryObj.preferenceDate);
        //                 else
        //                     prepareFeedQuery(2, query, memberId, limit - listOfFeedObj.length, memberListByPreference, new Date())
        //                 //console.log("########################Preference query@@@@@@@@@@@@@@@@@@@@@@@@", query)
        //                 feedServices.findFeedByMemberId(query, (err, listOfFeedByMemberPreferenceObj) => {
        //                     if (err)
        //                         return callback(new Error(`Error while find the feeds by member preference : ${err}`), null, null, null)
        //                     else {
        //                         //console.log("listOfFeedObj lenght preference", memberListByPreference.length)
        //                         let viewFeedHistoryIds = listOfFeedByMemberPreferenceObj.map((feedId) => {
        //                             return feedId._id
        //                         });
        //                         if (viewFeedHistoryIds.length > 0) {
        //                             viewFeedHistoryJson.viewFeedHistory = viewFeedHistoryObj.viewFeedHistory.length > 0 ? viewFeedHistoryIds.concat(viewFeedHistoryObj.viewFeedHistory) : viewFeedHistoryIds;
        //                         }
        //                         create = false
        //                         viewFeedHistoryJson.feedId = [];
        //                         let newViewHisObj3
        //                         if (viewFeedHistoryObj && listOfFeedByMemberPreferenceObj.length > 0) {
        //                             newViewHisObj3 = prepareViewHistory(2, viewFeedHistoryJson, viewFeedHistoryObj, listOfFeedByMemberPreferenceObj[listOfFeedByMemberPreferenceObj.length - 1].created_at, memberId, create, isFirstTime);
        //                         }
        //                         else {
        //                             newViewHisObj3 = prepareViewHistory(2, viewFeedHistoryJson, viewFeedHistoryObj, viewFeedHistoryObj.preferenceDate, memberId, create, isFirstTime);
        //                         }
        //                         preferenceCelebArray.push(...memberListByPreference)
        //                         listOfFeedObj.push(...listOfFeedByMemberPreferenceObj)
        //                         ViewFeedHistory.saveViewHistory(newViewHisObj3, (err, createdViewFeedHistory) => {
        //                             if (err)
        //                                 return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
        //                             else {
        //                                 //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory, "listOfFeedObj",listOfFeedObj.length)
        //                                 // return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
        //                                 viewFeedHistoryObj = createdViewFeedHistory;
        //                                 return callback(null, userObj, listOfFeedObj, memberListByPreference, viewFeedHistoryObj);
        //                             }
        //                         })


        //                     }
        //                 })
        //                 //return callback(null, userObj, listOfFeedObj, memberListByPreference);
        //                 //return res.status(200).json({ success: 1, data: listOfFeedObj, memberPreferenceObj, memberListByPreference });
        //             }
        //         })
        //     } else {
        //         //return callback(null, userObj, listOfFeedObj);
        //         return callback(null, userObj, listOfFeedObj, null, viewFeedHistoryObj);
        //     }
        //     //return callback(null,  userObj, listOfFeedObj);

        // }
        // , function (userObj, listOfFeedObj, Obj, viewFeedHistoryObj, callback) {
        //     /******** GET Feeds By Geo Location *************** */
        //     // console.log("noFanFallowers===", noFanFallowers)
        //     // console.log("noPreferences===", noPreferences)
        //     // console.log("noGEOLocationLocal===", noGEOLocationLocal)
        //     if (listOfFeedObj.length < limit) {
        //         // query.limit = limit - listOfFeedObj.length;
        //         let feedIdArray = listOfFeedObj.map((feedId) => {
        //             return feedId._id;
        //         })
        //         // console.log("Remove feed from GEO ===== ", feedIdArray)
        //         userServices.findCelebByCountry(userObj, preferenceCelebArray, noPreferences, (err, listOfCelebsByCountry) => {
        //             if (err)
        //                 return callback(new Error(`Error while find the celeb by country (GEO) : ${err}`), null, null, null);
        //             else {
        //                 if (listOfCelebsByCountry.length <= 0)
        //                     noGEOLocationLocal = true
        //                 // if (noFanFallowers && noPreferences && noGEOLocationLocal && userObj.isCeleb == true)
        //                 //     listOfCelebsByCountry.push(userObj._id)
        //                 query.viewFeedArray = [];
        //                 // if (listOfCelebsByCountry.length <= 0 && viewFeedHistoryObj)
        //                 //     query.viewFeedArray = viewFeedHistoryObj.feedId;
        //                 query.currentFeedArray = feedIdArray;
        //                 query.viewedFeedHistory = []
        //                 query.country = userObj.country;
        //                 if (viewFeedHistoryObj) {
        //                     if (noPreferences) {
        //                         viewFeedHistoryObj.currentFanFollowMemberId.forEach((celebId) => {
        //                             listOfCelebsByCountry.push(ObjectId(celebId));
        //                         })
        //                     }
        //                     query.viewedFeedHistory = viewFeedHistoryObj.viewFeedHistory;
        //                 }
        //                 //query.paginationDate = viewFeedHistoryObj.geoLocalDate;
        //                 if (!isFirstTime)
        //                     prepareFeedQuery(3, query, memberId, limit - listOfFeedObj.length, listOfCelebsByCountry, viewFeedHistoryObj.geoLocalDate)
        //                 else
        //                     prepareFeedQuery(3, query, memberId, limit - listOfFeedObj.length, listOfCelebsByCountry, new Date())
        //                 // console.log("&&&&&&&&&&&&&&&&&&&&&&GEO query@@@@@@@@@@@@@@@@@@@@@@@@", query)
        //                 feedServices.findFeedByMemberId(query, (err, listOfFeedByGeoObj) => {
        //                     if (err)
        //                         return callback(new Error(`Error while find the feeds by member preference : ${err}`), null, null, null)
        //                     else {
        //                         let viewFeedHistoryIds = listOfFeedByGeoObj.map((feedId) => {
        //                             return feedId._id
        //                         });
        //                         if (viewFeedHistoryIds.length > 0) {
        //                             viewFeedHistoryJson.viewFeedHistory = viewFeedHistoryObj.viewFeedHistory.length > 0 ? viewFeedHistoryIds.concat(viewFeedHistoryObj.viewFeedHistory) : viewFeedHistoryIds;
        //                         }
        //                         create = false;
        //                         viewFeedHistoryJson.feedId = [];
        //                         let newViewHisObj4
        //                         if (viewFeedHistoryObj && listOfFeedByGeoObj.length > 0) {
        //                             //create = false;
        //                             newViewHisObj4 = prepareViewHistory(3, viewFeedHistoryJson, viewFeedHistoryObj, listOfFeedByGeoObj[listOfFeedByGeoObj.length - 1].created_at, memberId, create, isFirstTime);
        //                         }
        //                         else {
        //                             newViewHisObj4 = prepareViewHistory(3, viewFeedHistoryJson, viewFeedHistoryObj, viewFeedHistoryObj.geoLocalDate, memberId, create, isFirstTime);
        //                         }
        //                         ViewFeedHistory.saveViewHistory(newViewHisObj4, (err, createdViewFeedHistory) => {
        //                             if (err)
        //                                 return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
        //                             else {
        //                                 //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory, "listOfFeedObj",listOfFeedObj.length)
        //                                 // return callback(null, userObj, memberPreferenceObj, listOfFeedObj, viewFeedHistoryObj);
        //                                 //return callback(null, userObj, listOfFeedObj, memberListByPreference, viewFeedHistoryObj);
        //                                 viewFeedHistoryObj = createdViewFeedHistory;
        //                                 listOfFeedObj.push(...listOfFeedByGeoObj);
        //                                 return callback(null, userObj, listOfFeedObj, listOfCelebsByCountry, viewFeedHistoryObj);
        //                             }
        //                         })
        //                         //preferenceCelebArray.push(...memberListByPreference)
        //                         // console.log("listOfFeedByGeoObj lenght", listOfFeedByGeoObj.length)

        //                     }
        //                 });
        //                 //return callback(null, userObj, listOfFeedObj, null);
        //             }
        //         })
        //     } else {
        //         return callback(null, userObj, listOfFeedObj, null, viewFeedHistoryObj);
        //     }

        // },


    ], function (err, listOfFeedObj) {
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
            return res.status(200).json({ success: 1, data: listOfFeedObj });
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

let prepareViewHistory = function (type, viewHistoryJson, viewHistoryDB, dateToSet, memberId, create, isFirstTime) {
    if (viewHistoryDB) {
        viewHistoryJson._id = viewHistoryDB._id;
        viewHistoryJson.fanFollowDate = viewHistoryDB.fanFollowDate;
        viewHistoryJson.preferenceDate = viewHistoryDB.preferenceDate;
        viewHistoryJson.geoLocalDate = viewHistoryDB.geoLocalDate;
        viewHistoryJson.geoNonLocalDate = viewHistoryDB.geoNonLocalDate;
        viewHistoryJson.feedId = viewHistoryJson.feedId == null ? viewHistoryDB.feedId : viewHistoryJson.feedId;
        viewHistoryJson.viewFeedHistory = viewHistoryJson.viewFeedHistory == null ? viewHistoryDB.viewFeedHistory : viewHistoryJson.viewFeedHistory;
    }
    if (create) {
        viewHistoryJson.feedId = [];
        viewHistoryJson.viewFeedHistory = []
    }
    if (isFirstTime || create) {
        let tempDate = new Date();
        viewHistoryJson.fanFollowDate = tempDate;
        viewHistoryJson.preferenceDate = tempDate;
        viewHistoryJson.geoLocalDate = tempDate;
        viewHistoryJson.geoNonLocalDate = tempDate;
        //paginationDate = new Date();
        tempDate = null;
    }

    viewHistoryJson.memberId = memberId;
    viewHistoryJson.create = create;
    switch (type) {
        //fan / fallow
        case 1: viewHistoryJson.fanFollowDate = dateToSet; break;
        // preferences
        case 2: viewHistoryJson.preferenceDate = dateToSet; break;
        // geo local
        case 3: viewHistoryJson.geoLocalDate = dateToSet; break;
        // geo non local
        case 4: viewHistoryJson.geoNonLocalDate = dateToSet; break;
    }
    //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ viewFeedHistoryObj======= ", viewHistoryJson)
    return viewHistoryJson;
}

let prepareFeedQuery = function (type, query, memberId, limit, memberListArray, pagenationDate) {
    query.memberId = memberId;
    query.limit = limit;
    query.memberListArray = memberListArray;
    query.pagenationDate = pagenationDate;
    query.isFanFollow = false;
    query.isPreferences = false;
    query.isGeoLocation = false;
    query.isNonGeoLocation = false;
    switch (type) {
        //fan / fallow
        case 1: query.isFanFollow = true; break;
        // preferences
        case 2: query.isPreferences = true; break;
        // geo local
        case 3: query.isGeoLocation = true; break;
        // geo non local
        case 4: query.isNonGeoLocation = true; break;
    }
    //console.log("wwwwwwww query======= ", query)
}


let getFeedById = (req, res) => {
    let feedId = (req.params.feed_Id) ? req.params.feed_Id : '';
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    feedServices.findFeedById(feedId, memberId, (err, feedObj) => {
        if (err)
            return res.status(404).json({ success: 0, message: "Error while feching feed Id ", err });
        else {
            return res.status(200).json({ success: 1, data: feedObj })
        }
    })
}

let feedController = {
    getFeeds: getFeeds,
    getFeedById: getFeedById,
    getFeedByFeedPreference: getFeedByFeedPreference
}

module.exports = feedController;