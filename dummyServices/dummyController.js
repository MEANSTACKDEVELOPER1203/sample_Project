let userService = require('./dummyServices');
let ObjectId = require('mongodb').ObjectId;
let async = require('async');
let Memberpreferences = require('../components/memberpreferences/memberpreferencesModel');

var deleteMemberAllDetails = (req, res) => {
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2")
    let memberDetails = (req.params.member_Details) ? req.params.member_Details : '';
    let password = (req.params.password) ? req.params.password : '';
    userService.findUserDetails(memberDetails, password, (err, userObj) => {
        // console.log(err)
        // console.log(userObj)
        if (err) {
            if (err == "invalid password") {
                return res.status(200).json({ success: 0, message: "Please enter the valid password" })
            }
            return res.status(404).json({ success: 0, message: "Error while fetching the user details", err });
        }
        else if (!userObj || userObj == null)
            return res.status(200).json({ success: 0, message: "Please enter the valid you details" })
        else {
            console.log("******** 1 ***********");
            //res.json({success:1, data:userObj})
            userService.deleteUserAccount(userObj._id, (err, delet) => {
                if (err)
                    console.log("******* Error while delete User Account *********", err)
                else {
                    //console.log("Deleted User Account ", delet);
                    //res.json({success:1, data:delet})
                    console.log("******** 2 ***********");
                    userService.deleteLoginAccount(userObj._id, (err, delet) => {
                        if (err)
                            console.log("******* Error while delete User Account *********", err)
                        else {
                            console.log("******** 3 ***********");
                            userService.deleteMemberPreference(userObj._id, (err, delet) => {
                                if (err)
                                    console.log("******* Error while delete User Account *********", err)
                                else {
                                    console.log("******** 4 ***********");
                                    userService.deleteMemberMediaTracking(userObj._id, (err, delet) => {
                                        if (err)
                                            console.log("******* Error while delete User Account *********", err)
                                        else {
                                            console.log("******** 5 ***********");
                                            userService.deleteMemberCreditsHistory(userObj._id, (err, delet) => {
                                                if (err)
                                                    console.log("******* Error while delete User Account Credits *********", err)
                                                else {
                                                    console.log("******** 6 ***********");
                                                    userService.deleteMemberNotificationHistory(userObj._id, (err, delet) => {
                                                        if (err)
                                                            console.log("******* Error while delete User Account Notification *********", err)
                                                        else {
                                                            console.log("******** 7 ***********");
                                                            userService.deleteMemberMediaHistory(userObj._id, (err, delet) => {
                                                                if (err)
                                                                    console.log("******* Error while delete User Account Media *********", err)
                                                                else {
                                                                    console.log("******** 8 ***********");
                                                                    userService.deleteMemberFeedHistory(userObj._id, (err, delet) => {
                                                                        if (err)
                                                                            console.log("******* Error while delete User Account Feed *********", err)
                                                                        else {
                                                                            console.log("******** 9 ***********");
                                                                            userService.deleteMemberServiceScheduleHistory(userObj._id, (err, delet) => {
                                                                                if (err)
                                                                                    console.log("******* Error while delete User Account Service Schedule *********", err)
                                                                                else {
                                                                                    console.log("******** 10 ***********");
                                                                                    userService.deleteMemberChatHistory(userObj._id, (err, delet) => {
                                                                                        if (err)
                                                                                            console.log("******* Error while delete User Account Chat *********", err)
                                                                                        else {
                                                                                            console.log("******** 11 ***********");
                                                                                            userService.deleteMemberCartsHistory(userObj._id, (err, delet) => {
                                                                                                if (err)
                                                                                                    console.log("******* Error while delete User Account Chat *********", err)
                                                                                                else {
                                                                                                    console.log("******** 12 ***********");
                                                                                                    userService.deleteServiceTransactionHistory(userObj._id, (err, delet) => {
                                                                                                        if (err)
                                                                                                            console.log("******* Error while delete User Account Chat *********", err)
                                                                                                        else {
                                                                                                            console.log("******** 13 ***********");
                                                                                                            userService.deleteCelebContractHistory(userObj._id, (err, delet) => {
                                                                                                                if (err)
                                                                                                                    console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                else {
                                                                                                                    console.log("******** 14 ***********");
                                                                                                                    userService.deletePaymentHistory(userObj._id, (err, delet) => {
                                                                                                                        if (err)
                                                                                                                            console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                        else {
                                                                                                                            console.log("******** 15 ***********");
                                                                                                                            userService.deletePayCreditsHistory(userObj._id, (err, delet) => {
                                                                                                                                if (err)
                                                                                                                                    console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                                else {
                                                                                                                                    console.log("******** 16 ***********");
                                                                                                                                    userService.deleteNotificationSettingHistory(userObj._id, (err, delet) => {
                                                                                                                                        if (err)
                                                                                                                                            console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                                        else {
                                                                                                                                            console.log("******** 17 ***********");
                                                                                                                                            userService.deleteLiveTimeLogsHistory(userObj._id, (err, delet) => {
                                                                                                                                                if (err)
                                                                                                                                                    console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                                                else {
                                                                                                                                                    console.log("******** 18 ***********");
                                                                                                                                                    userService.deleteFeedBackHistory(userObj._id, (err, delet) => {
                                                                                                                                                        if (err)
                                                                                                                                                            console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                                                        else {
                                                                                                                                                            userService.removeFromFanFollowHistory(userObj._id, (err, delet) => {
                                                                                                                                                                if (err)
                                                                                                                                                                    console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                                                                else {
                                                                                                                                                                    userService.removeReferelCodeFromUsersHistory(userObj._id, (err, delet) => {
                                                                                                                                                                        if (err)
                                                                                                                                                                            console.log("******* Error while delete User Account Chat *********", err)
                                                                                                                                                                        else {
                                                                                                                                                                            console.log("******** Finally Done ***********");
                                                                                                                                                                            res.json({ success: 1, message: "Deleted successfully" });
                                                                                                                                                                        }
                                                                                                                                                                    });
                                                                                                                                                                }
                                                                                                                                                            });
                                                                                                                                                        }
                                                                                                                                                    });
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                }
                                                                                                                            });
                                                                                                                        }
                                                                                                                    });
                                                                                                                }
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            })
        }
    })
}

let getTrandingUsers = (req, res) => {
    userService.findAllCelebs((err, celebIds) => {
        if (err)
            return res.status(404).json({ success: 0, message: err });
        else {
            userService.findActiveCelebInApp((err, activeCelebObj) => {
                if (err)
                    return res.status(404).json({ success: 0, message: err })
                else {
                    userService.findFanFollowTrandingCelebs(celebIds, (err, listOfFanFollowTrandingCelebObj) => {
                        if (err)
                            return res.status(404).json({ success: 0, message: err })
                        else {
                            let lastestTrending = listOfFanFollowTrandingCelebObj.slice(0, 5);
                            return res.status(200).json({ success: 1, data: activeCelebObj, data1: lastestTrending })
                        }
                    })
                }
            })
        }
    })

}

let addCredits = (req, res) => {
    let memberDetails = (req.params.member_Details) ? req.params.member_Details : '';
    let creditValue = (req.params.credit_Value) ? req.params.credit_Value : '';
    creditValue = parseInt(creditValue);
    //console.log(creditValue)
    if (creditValue > 100) {
        return res.status(200).json({ success: 0, message: "Max credit limit is 100 " });
    }
    else {
        userService.findUser(memberDetails, (err, userObj) => {
            if (err)
                return res.status(200).json({ success: 1, message: "Error pls check credential" }, err);
            else if (!userObj || userObj == null) {
                return res.status(200).json({ success: 0, message: "Please enter the valid you details" });
            } else {
                userService.findLastCredit(userObj._id, creditValue, (err, creditValueObj) => {
                    if (err) {
                        if (err.name = "CastError") {
                            return res.status(200).json({ success: 0, message: "Please enter the credit in number only." });
                        }
                        console.log(err)
                    }
                    else {
                        return res.status(200).json({ success: 1, message: "Credit added successfully. Check your account." });
                    }
                });
            }
        })
    }
}

// let getMemberMedia = (req, res) => {
//     let memberId = (req.params.member_Id) ? req.params.member_Id : '';
//     let mediaType = (req.params.media_Type) ? req.params.media_Type : '';
//     let paginationDate = (req.params.pagination_Date) ? req.params.pagination_Date : '';
//     let query = {};
//     if (paginationDate == "0") {
//         paginationDate = new Date();
//     }
//     query.memberId = memberId;
//     query.mediaType = mediaType;
//     query.paginationDate = paginationDate;
//     userService.findMemberMedia(query, (err, memberMediaObj) => {
//         if (err) {
//             return res.status(404).json({ success: 0, message: "Error while fetching the memeber media", err })
//         } else if (memberMediaObj.length <= 0) {
//             return res.status(200).json({ success: 0, message: "no record found!! " });
//         } else {
//             return res.status(200).json({ success: 1, data: memberMediaObj })
//         }
//     })

// }

// let getMemberMediaBothSide = (req, res) => {
//     let memberId = (req.params.member_Id) ? req.params.member_Id : '';
//     let mediaType = (req.params.media_Type) ? req.params.media_Type : '';
//     let paginationDate = (req.params.pagination_Date) ? req.params.pagination_Date : '';
//     let query = {};
//     if (paginationDate == "0") {
//         paginationDate = new Date();
//     }
//     query.memberId = memberId;
//     query.mediaType = mediaType;
//     query.paginationDate = paginationDate;
//     userService.findMemberMediaBothSide(query, (err, memberMediaObj) => {
//         if (err) {
//             return res.status(404).json({ success: 0, message: "Error while fetching the memeber media", err })
//         } else if (memberMediaObj.length <= 0) {
//             return res.status(200).json({ success: 0, message: "no record found!! " });
//         } else {
//             return res.status(200).json({ success: 1, data: memberMediaObj })
//         }
//     })

// }

let dummyController = {
    deleteMemberAllDetails: deleteMemberAllDetails,
    getTrandingUsers: getTrandingUsers,
    addCredits: addCredits,
    //getMemberMedia: getMemberMedia,
    //getMemberMediaBothSide: getMemberMediaBothSide
}

module.exports = dummyController;