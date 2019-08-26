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
    let preferenceCelebArray = []
    async.waterfall([function (callback) {
        userModel.getUserById(ObjectId(memberId), (err, userObj) => {
            if (err) {
                //return res.status(404).json({ success: 0, message: "Error while fetching the user details", err })
                return callback(new Error(`Error while fetching the user details : ${err}`), null, null)
            } else {
                ViewFeedHistory.findViewFeedHistoryByMemberId(ObjectId(memberId), (err, viewFeedHistoryObj) => {
                    if (err)
                        return callback(new Error(`Error while fetching the View feed history details : ${err}`), null, null);
                    else {
                        //console.log("****************viewFeedHistoryObj111111***********************", viewFeedHistoryObj)
                        return callback(null, userObj, viewFeedHistoryObj);
                    }
                })
                //return callback(null, userObj);
            }
        })
    }, function (userObj, viewFeedHistoryObj, callback) {
        memberPreferenceServices.findAllMyPreferencesByMemberId(memberId, (err, memberPreferenceObj) => {
            if (err)
                return callback(new Error(`Error while fetching the Feeds : ${err}`), null, null, null)
            //return res.status(404).json({ success: 0, message: " ", err });
            else {
                //console.log(memberPreferenceObj)
                //console.log(userObj)
                let viewFeedArray = [];
                query.viewFeedArray = viewFeedArray
                if (viewFeedHistoryObj)
                    query.viewFeedArray = viewFeedHistoryObj.feedId;
                if (userObj.isCeleb == true)
                    memberPreferenceObj.memberListArray.push(ObjectId(memberId));
                query.memberId = memberId;
                query.paginationDate = paginationDate
                //query.isDataFromMemberPreferences = true;
                if (paginationDate == 0)
                    query.paginationDate = new Date();
                query.memberListArray = memberPreferenceObj.memberListArray;
                query.limit = limit;
                preferenceCelebArray = memberPreferenceObj.memberListArray;
                //
                feedServices.findFeedByMemberId(query, (err, listOfFeedObj) => {
                    if (err) {
                        return callback(new Error(`Error while fetching the Feeds by member list : ${err}`), null, null, null)
                        //return res.status(404).json({ success: 0, message: "Error while fetching the Feeds by member list", err })
                    } else {
                        let feedIdArray = listOfFeedObj.map((feedId) => {
                            return feedId._id;
                        })
                        //console.log("*&&&&&&&&&&&&&&&&&&&&&&&&&&feedIdArray", feedIdArray.length)
                        let create = true
                        if (viewFeedHistoryObj)
                            create = false
                        let viewFeedHistoryJson = {};
                        viewFeedHistoryJson.feedIdArray = feedIdArray;
                        viewFeedHistoryJson.memberId = memberId;
                        viewFeedHistoryJson.create = create;
                        ViewFeedHistory.saveViewHistory(viewFeedHistoryJson, (err, createdViewFeedHistory) => {
                            if (err)
                                return callback(new Error(`Error while creating view feed history : ${err}`), null, null, null);
                            else {
                                //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%createdViewFeedHistory===== ", createdViewFeedHistory, "listOfFeedObj",listOfFeedObj.length)
                                return callback(null, userObj, memberPreferenceObj, listOfFeedObj);
                            }
                        })
                        //return res.status(200).json({ success: 1, data: listOfFeedObj, memberPreferenceObj });
                        //return callback(null, userObj, memberPreferenceObj, listOfFeedObj);
                    }
                });
                //res.status(200).json({ success: 1, message: "Get All Feeds", memberPreferenceObj })
            }
        });
    }, function (userObj, memberPreferenceObj, listOfFeedObj, callback) {
        if (listOfFeedObj.length < limit) {
            //console.log("FSAKAKAKAKAKAKAKAKAK", listOfFeedObj.length);
            //return callback(null, null, null);
            //limit = 20
            // if (userObj.isCeleb == true)
            //     query.memberListArray.push(ObjectId(memberId));
            preferenceServices.findCelebrityByMemberPreference(memberPreferenceObj, (err, memberListByPreference) => {
                if (err)
                    return callback(new Error(`Error while find the member list preference : ${err}`), null, null, null)
                //return res.status(404).json({ success: 0, message: "Error while find the member list preference", err })
                else {
                    //console.log("pppppppppprrrrrrrrreeeeeeeee    ==== ", memberListByPreference);
                    query.limit = limit - listOfFeedObj.length;
                    query.memberListArray = memberListByPreference;
                    //query.viewFeedArray = [];
                    query.isDataFromMemberPreferences = true;
                    feedServices.findFeedByMemberId(query, (err, listOfFeedByMemberPreferenceObj) => {
                        if (err)
                            return callback(new Error(`Error while find the feeds by member preference : ${err}`), null, null, null)
                        else {
                            preferenceCelebArray.push(...memberListByPreference)
                            listOfFeedObj.push(...listOfFeedByMemberPreferenceObj)
                            return callback(null, userObj, listOfFeedObj, memberListByPreference);
                        }
                    })
                    //return callback(null, userObj, listOfFeedObj, memberListByPreference);
                    //return res.status(200).json({ success: 1, data: listOfFeedObj, memberPreferenceObj, memberListByPreference });
                }
            })
        } else {
            //return callback(null, userObj, listOfFeedObj);
            return callback(null, userObj, listOfFeedObj, null);
        }
        //return callback(null,  userObj, listOfFeedObj);

    }, function (userObj, listOfFeedObj, Obj, callback) {
        if (listOfFeedObj.length < limit) {
            //console.log("FSAKAKAKAKAKAKAKAKAK 22222222222222222222222222", listOfFeedObj.length);
            query.limit = limit - listOfFeedObj.length;
            userServices.findCelebByCountry(userObj, preferenceCelebArray, (err, listOfCelebsByCountry) => {
                if (err)
                    return callback(new Error(`Error while find the celeb by country (GEO) : ${err}`), null, null, null);
                else {
                    query.memberListArray = listOfCelebsByCountry;
                    query.viewFeedArray = [];
                    feedServices.findFeedByMemberId(query, (err, listOfFeedByGeoObj) => {
                        if (err)
                            return callback(new Error(`Error while find the feeds by member preference : ${err}`), null, null, null)
                        else {
                            //preferenceCelebArray.push(...memberListByPreference)
                            listOfFeedObj.push(...listOfFeedByGeoObj);
                            return callback(null, userObj, listOfFeedObj, listOfCelebsByCountry);
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