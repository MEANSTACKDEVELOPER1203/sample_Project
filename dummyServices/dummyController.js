let userService = require('./dummyServices');
let ObjectId = require('mongodb').ObjectId;
let async = require('async');
let Memberpreferences = require('../components/memberpreferences/memberpreferencesModel');

let otpServices = require('../components/otp/otpRouter');
// const FCM = require('fcm-push');
// const serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
// const fcm = new FCM(serverkey);

// var admin = require("firebase-admin");
// var serviceAccount = require("../lib/celebkoncetgcm-firebase-adminsdk-0ai66-4f5e0a9d44.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://celebkoncetgcm.firebaseio.com"
// });

//    var payload = {
//   notification: {
//     title: "Account Deposit",
//     body: "A deposit to your savings account has just cleared."
//   },
//   data: {
//     account: "Savings",
//     balance: "$3020.25"
//   }
// };

let createTopics = (req, res) => {
    let topic = "celeb-Konect"
    let ids = []
    let deviceToken = "di0TQnrUbLg:APA91bEB_Oo0cDm2unkp2grd1EwPjyh28vFZa7kM8TqpZPhbGPf_Z-SW2ZGx52tIHDAzd2PdULdOfW6xmt1csUBqjGBVsMSQpfi_qV_a2I6RDOfES6d2F3wubB2GC9LybOI9eTlbC512";
    ids.push(deviceToken)
    for (let index = 0; index < 5; index++) {
        // if(index == 0){
        //     ids.push(deviceToken)
        // }
        ids.push(deviceToken)
    }
    ;

    admin.messaging().subscribeToTopic(ids, topic)
        .then(function (response) {
            // See the MessagingTopicManagementResponse reference documentation
            // for the contents of response.
            console.log('Successfully subscribed to topic:', response);
        })
        .catch(function (error) {
            console.log('Error subscribing to topic:', error);
        });
    console.log(ids.length)
    res.json({ success: 1, tokens: ids })

    // otpServices.subscribeToTopics(ids, "bhaskarreddy", (err, res) => {
    //     if (err)
    //         console.log("Error while subscribe the FCM === ", err)
    //     else {
    //         console.log(res);
    //         // data = {
    //         //     topic:"bhaskarreddy",
    //         //     body: "Testing push notification"
    //         // }
    //         // otpServices.sendAndriodPushNotification(ids, "Feed Alert!!", data, (err, successNotificationObj) => {
    //         //     if (err)
    //         //         console.log(err)
    //         //     else {
    //         //         console.log(successNotificationObj)
    //         //     }
    //         // });
    //     }
    // })


}

let sendPushNotification = (req, res) => {
    let topic = "celeb-Konect";
    /************* Version 1 ************* */
    //     var          payload = {

    //     notification: {
    //         title: "Account Deposit V-1",
    //         body: "A deposit to your savings account has just cleared."
    //     },
    //   data: {
    //     account: "Savings",
    //     balance: "$3020.25"
    //   }
    // };

    // admin.messaging().sendToTopic(topic, data)
    //   .then(function(response) {
    //     console.log("Successfully sent message:", response);
    //     res.json({success:1, Version:1})
    //   })
    //   .catch(function(error) {
    //     console.log("Error sending message:", error);
    //   });

    /************* Version 2 ************* */
    var message = {
        data: {
            title: "Account Deposit V-2",
            body: "A deposit to your savings account has just cleared."
        },
        topic: topic
    };

    // Send a message to devices subscribed to the combination of topics
    // specified by the provided condition.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            res.json({ success: 1, Version: 2 })
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });

    /************* Version 2 ************* */

    /************* Version 3 ************* */


    // var message = {
    //   data: {
    //     title: "Account Deposit V-3",
    //     body: "A deposit to your savings account has just cleared.",
    //     url:"https://rukminim1.flixcart.com/image/832/832/j1fb98w0/poster/z/m/8/medium-rk0266-radhakripa-ileana-d-cruz-poster-original-imaejgazaqbz6ydw.jpeg?q=70"
    //   },
    //   notification: {
    //         title: "Account Deposit V-3.1",
    //         body: "A deposit to your savings account has just cleared.",
    //         url:"https://rukminim1.flixcart.com/image/832/832/j1fb98w0/poster/z/m/8/medium-rk0266-radhakripa-ileana-d-cruz-poster-original-imaejgazaqbz6ydw.jpeg?q=70"
    //     },
    //   topic: topic
    // };
    //
    // // Send a message to devices subscribed to the combination of topics
    // // specified by the provided condition.
    // admin.messaging().send(message)
    //   .then((response) => {
    //     // Response is a message ID string.
    //     console.log('Successfully sent message:', response);
    //                 res.json({success:1, Version:3})
    //   })
    //   .catch((error) => {
    //     console.log('Error sending message:', error);
    //   });


    /************* Version 3 ************* */


}


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
        } else if (!userObj || userObj == null)
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
                                                                                                                                                                            res.json({
                                                                                                                                                                                success: 1,
                                                                                                                                                                                message: "Deleted successfully"
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
    } else {
        userService.findUser(memberDetails, (err, userObj) => {
            if (err)
                return res.status(200).json({ success: 1, message: "Error pls check credential" }, err);
            else if (!userObj || userObj == null) {
                return res.status(200).json({ success: 0, message: "Please enter the valid you details" });
            } else {
                userService.findLastCredit(userObj._id, creditValue, (err, creditValueObj) => {
                    if (err) {
                        if (err.name = "CastError") {
                            return res.status(200).json({
                                success: 0,
                                message: "Please enter the credit in number only."
                            });
                        }
                        console.log(err)
                    } else {
                        return res.status(200).json({
                            success: 1,
                            message: "Credit added successfully. Check your account."
                        });
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

let removeSeenStatus = (req, res) => {
    let memberId = ObjectId(req.params.member_Id)
    userService.deleteStorySeenStatus(memberId, (err, obj) => {
        if (err)
            return res.status(404).json({ success: 1, message: "Error while remove story seen status" })
        else
            return res.status(200).json({ success: 1, message: "Deleted successfully" })
    })
}
let celebrityContract = require("../components/celebrityContract/celebrityContractsModel");
let User = require("../components/users/userModel");
let mongoose = require('mongoose');


let getCelebSearchDummy = (req, res) => {
    let searchString = req.params.string.toLowerCase();
    searchString = searchString.trim();
    let id = req.params.userID;
    let isCeleb = true;
    let paginationDate = new Date();
    let keyword = new RegExp('^' + searchString);  //"/^"+"vamshi krishna"+"/i"

    // console.log("######keyword", keyword, "######keyword")
    celebrityContract.distinct("memberId", { memberId: { $nin: [id] } }, (err, contractsCelebArray) => {
        if (err) {
            res.json({ usersDetail: null, err: err })
        }
        else {
            let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
            let getCeleByTime = req.params.createdAt;
            limit = parseInt(30);
            if (getCeleByTime == null || getCeleByTime == "null" || getCeleByTime == "0") {
                getCeleByTime = new Date();
            }
            User.aggregate(
                [
                    {
                        $addFields: {
                            name: {
                                $concat: [
                                    '$firstName',
                                    ' ',
                                    '$lastName',
                                ]
                            },
                        }
                    },
                    {
                        "$match": {
                            $or: [{
                                $and: [
                                    { _id: { $in: objectIdArray } },
                                    { firstName: { $regex: keyword, '$options': 'i' } },
                                    { isCeleb: true },
                                    { IsDeleted: false },
                                    { created_at: { $lt: new Date(getCeleByTime) } }
                                ]
                            }]
                        }
                    },
                    {
                        $sort: { created_at: -1 }
                    },
                    {
                        $limit: limit
                    },
                    {
                        $project: {
                            _id: 1,
                            firstName: 1,
                            lastName: 1,
                            avtar_imgPath: 1,
                            profession: 1,
                            isCeleb: 1,
                            isOnline: 1,
                            isPromoted: 1,
                            isTrending: 1,
                            aboutMe: 1,
                            email: 1,
                            isEditorChoice: 1,
                            username: 1,
                            created_at: 1,
                        }
                    },
                ],
                function (err, data) {
                    // console.log("Data L ==== ", data.length, searchString)
                    if (err) {
                        res.json({ success: 0, message: err })
                    }
                    else if (data.length == limit) {
                        data.forEach((user) => {
                            for (i = 0; i < data.length; i++) {
                                if ((user._id.toString() == data[i]._id.toString()) && i != data.indexOf(user)) {
                                    data.splice(i, 1);
                                }
                            }
                        })
                        paginationDate = data[data.length - 1].created_at;
                        data.sort(function (a, b) {
                            if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
                            if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
                            return 0;
                        })
                        return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: { celebSearchInfo: data, paginationDate: paginationDate } });
                    } else {
                        limit = limit - data.length;
                        fNameIds = data.map((user) => {
                            return (user._id)
                        });
                        // console.log("ARTICLE-1", fNameIds.length)
                        User.aggregate(
                            [
                                {
                                    $addFields: {
                                        name: {
                                            $concat: [
                                                '$firstName',
                                                ' ',
                                                '$lastName',
                                            ]
                                        },
                                    }
                                },
                                {
                                    "$match": {
                                        $or: [{
                                            $and: [
                                                { _id: { $in: objectIdArray } },
                                                { _id: { $nin: fNameIds } },
                                                { lastName: { $regex: keyword, '$options': 'i' } },
                                                { isCeleb: true },
                                                { IsDeleted: false },
                                                { created_at: { $lt: new Date(getCeleByTime) } }
                                            ],
                                            $and: [
                                                { _id: { $in: objectIdArray } },
                                                { _id: { $nin: fNameIds } },
                                                { name: { $regex: keyword, '$options': 'i' } },
                                                { isCeleb: true },
                                                { IsDeleted: false },
                                                { created_at: { $lt: new Date(getCeleByTime) } }
                                            ]
                                        }]
                                    }
                                },
                                {
                                    $sort: { created_at: -1 }
                                },
                                {
                                    $limit: limit
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        avtar_imgPath: 1,
                                        profession: 1,
                                        isCeleb: 1,
                                        isOnline: 1,
                                        isPromoted: 1,
                                        isTrending: 1,
                                        aboutMe: 1,
                                        email: 1,
                                        isEditorChoice: 1,
                                        username: 1,
                                        created_at: 1,
                                    }
                                },
                                {
                                    $limit: limit
                                },
                            ],
                            function (err, data2) {
                                if (err) {
                                    return res.json({ success: 0, message: "Error while search lastname ", err })
                                } else {
                                    // console.log("ARTICLE-2", data2.length)
                                    data.forEach((user) => {
                                        for (i = 0; i < data.length; i++) {
                                            if ((user._id.toString() == data[i]._id.toString()) && i != data.indexOf(user)) {
                                                data.splice(i, 1);
                                            }
                                        }
                                    })

                                    if (data.length)
                                        paginationDate = data[data.length - 1].created_at;
                                    data.sort(function (a, b) {
                                        if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
                                        if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
                                        return 0;
                                    })
                                    data2.sort(function (a, b) {
                                        if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) { return -1; }
                                        if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) { return 1; }
                                        return 0;
                                    })
                                    const arr3 = [...data, ...data2];
                                    return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: { celebSearchInfo: arr3, paginationDate: paginationDate } });
                                }
                            })
                    }
                });
        }
    });
}

let getIndividualStory = async (req, res) => {
    const query = {};
    let celebId = (req.params.celeb_Id) ? req.params.celeb_Id : '';
    let currentUserId = (req.params.currentUser_Id) ? req.params.currentUser_Id : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    query.celebId = celebId;
    query.currentUserId = currentUserId;
    query.createdAt = createdAt
    try {
        const value = await square(10);
        console.log(value);
        console.log("TRY inside ===== ", query);
        const celebObj = "";
        if (value > 0)
            celebObj = await userService.getCelebDetailsById1(query);
        console.log(celebObj);
        if (!celebObj || celebObj == null) {
            res.status(200).json({ success: 0, message: 'Enter valid credencial' })
        } else {
            const storyObj = await userService.findStory(query);
            if (storyObj)
                return res.status(200).json({ success: 1, data: { story: storyObj, celebInfo: celebObj, statusSeenCount: 0 } })
        }
    } catch (error) {
        res.status(404).json({ message: "Something went wrong", error: error });
    }
}

// const getCelebDetailsById1 = (query) => {
// console.log("AAAAAAAAAA ==== ", qu)
// }

const square = (x) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(Math.pow(x, 2));
        }, 200);
    });
}

const fanSubscription = async (req, res) => {
    try {
        let query = {
            id: req.params.id
        }
        let fanObj = await userService.findFanSubscriptionAsync(query);
        if (fanObj) {
            return res.status(200).json({ success: 1, data: fanObj })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: 0, message: error })
    }

}


let dummyController = {
    deleteMemberAllDetails: deleteMemberAllDetails,
    getTrandingUsers: getTrandingUsers,
    addCredits: addCredits,
    createTopics: createTopics,
    sendPushNotification: sendPushNotification,
    removeSeenStatus: removeSeenStatus,
    getCelebSearchDummy: getCelebSearchDummy,
    getIndividualStory: getIndividualStory,
    //getMemberMedia: getMemberMedia,
    //getMemberMediaBothSide: getMemberMediaBothSide

    fanSubscription: fanSubscription
}

module.exports = dummyController;