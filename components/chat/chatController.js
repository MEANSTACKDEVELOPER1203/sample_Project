let chatServices = require('./chatServices');
let Chat = require('../../models/chat');
let Credits = require('../credits/creditsModel');
let ObjectId = require('mongodb').ObjectId;
let User = require("../users/userModel");
let CelebrityContracts = require('../celebrityContract/celebrityContractsModel');
let Login = require('../loginInfo/loginInfoModel');
let PayCredits = require('../payCredits/payCreditsModel');
let MemberPreferences = require('../memberpreferences/memberpreferencesModel');
let ServiceTransaction = require('../serviceTransaction/serviceTransactionModel');
let Feedback = require('../feedback/feedbackModel');
//push notification
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
const apn = require('apn');
var apnProvider = new apn.Provider({
    token: {
        key: 'AuthKey_47HAS9Y4S8.p8', // Path to the key p8 file
        keyId: '47HAS9Y4S8', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
        teamId: '3J79KQEY26', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
    },
    production: false // Set to true if sending a notification to a production iOS app
});
//let apnProvider = new apn.Provider(options);
//let notification = new apn.Notification()


let getCurrentMemberChat = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    chatServices.findAllChatRoomForCurrentMember(memberId, (err, listOfChatRoomIdObj) => {
        if (err) {
            return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching current member chat Room ID by member ID" })
        }
        else if (listOfChatRoomIdObj.length <= 0) {
            return res.status(200).json({ success: 1, data: [] })
        }
        else {
            chatServices.findChatsByCurrentMember(memberId, listOfChatRoomIdObj, (err, listOfChatsObj) => {
                if (err) {
                    return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching current member chat by member ID" })
                } else {
                    MemberPreferences.findOne({ memberId: ObjectId(memberId) }, (err, memberFanObj) => {
                        if (err)
                            console.log("******** Error while feching my preferences ************", err);
                        else {
                            function foo(cb) {
                                var results = [];
                                listOfChatsObj.forEach(msgObj => {
                                    let lastMsgObj = {};
                                    lastMsgObj._id = msgObj._id;
                                    lastMsgObj.senderId = msgObj.senderId;
                                    lastMsgObj.receiverId = msgObj.receiverId;
                                    lastMsgObj.message = msgObj.message;
                                    lastMsgObj.chatStatus = msgObj.chatStatus;
                                    lastMsgObj.createdAt = msgObj.createdAt;
                                    lastMsgObj.messageStatus = msgObj.messageStatus;
                                    lastMsgObj.receiverInfo = msgObj.receiverInfo;
                                    lastMsgObj.senderInfo = msgObj.senderInfo;
                                    //lastMsgObj.senderInfoFan = msgObj.senderInfoFan;
                                    //lastMsgObj.receiverInfoFan = msgObj.receiverInfoFan;
                                    //console.log(msgObj.createdAt);
                                    Chat.countDocuments({ chatRoomId: lastMsgObj._id, receiverId: ObjectId(memberId), isRead: false }, function callback(err, totalUnReadMsgCount) {
                                        if (err) {
                                            console.log(err)
                                            cb(err, null)
                                        } else {
                                            //console.log("********* totalUnReadMsgCount ***********", totalUnReadMsgCount);
                                            //console.log("*****************************************************");
                                            let celebrityId = "";
                                            let isFan = false;
                                            if (lastMsgObj.senderInfo._id != memberId) {
                                                celebrityId = lastMsgObj.senderInfo._id;
                                            } else {
                                                celebrityId = lastMsgObj.receiverInfo._id
                                            }
                                            //console.log(celebrityId);
                                            //console.log(lastMsgObj);
                                            //console.log("****************** Member preference*************************")
                                            //console.log(memberFanObj);
                                            if (memberFanObj && memberFanObj != null) {
                                                let memberCelebArray = memberFanObj.celebrities;
                                                memberCelebArr = memberCelebArray.filter(function (obj) {
                                                    //console.log(typeof ""+obj.CelebrityId)
                                                    //console.log(typeof ""+celebrityId)
                                                    return "" + obj.CelebrityId === "" + celebrityId && obj.isFan === true
                                                });
                                                if (memberCelebArr.length > 0 && memberCelebArr[0].isFan == true)
                                                    isFan = true
                                                //console.log(memberCelebArr)
                                                //console.log("***************");
                                            }
                                            if (celebrityId === lastMsgObj.senderInfo._id) {
                                                Object.assign(lastMsgObj.senderInfo, { "isFan": isFan })
                                            } else {
                                                Object.assign(lastMsgObj.receiverInfo, { "isFan": isFan })
                                            }
                                            Object.assign(lastMsgObj, { "counter": totalUnReadMsgCount });
                                            results.push(lastMsgObj);
                                            if (results.length === listOfChatsObj.length) {
                                                cb(null, results);
                                            }
                                            //console.log("*****************************************************")
                                        }
                                    })
                                });
                            }
                            foo(function (err, resultArr) {
                                if (err)
                                    return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: `Fail to fetch activities ${err}` });

                                resultArr.sort(function (x, y) {
                                    var dateA = new Date(x.createdAt), dateB = new Date(y.createdAt);
                                    return dateB - dateA;
                                });
                                return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: resultArr });
                            });
                        }
                    });
                }
            });
        }
    })
}


function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}

let getAllChatMessages = (req, res) => {
    let senderId = (req.params.sender_Id) ? req.params.sender_Id : '';
    let receiverId = (req.params.receiver_Id) ? req.params.receiver_Id : '';
    let paginationDate = (req.params.pagination_Date) ? req.params.pagination_Date : '';
    let limit = (req.params.limit) ? req.params.limit : '';
    let query = {};

    query.senderId = senderId;
    query.receiverId = receiverId;
    query.paginationDate = paginationDate;
    query.limit = limit;
    chatServices.findAllChatMessages(query, (err, listOfChatMessageObj) => {
        if (err) {
            return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching all messages!" });
        }
        //  else if (!listOfChatMessageObj || listOfChatMessageObj == null || listOfChatMessageObj.length <= 0) {
        //     return res.status(200).json({ success: 0, message: "record not found!" })
        // }
        else {
            Credits.find({ memberId: ObjectId(senderId) }, (err, senderUpdatedcreditsObj) => {
                if (err)
                    console.log("**** Error while fetch the Sender Credit value *************", err)
                else {
                    senderUpdatedcreditsObj[0].cumulativeCreditValue = senderUpdatedcreditsObj[0].cumulativeCreditValue + senderUpdatedcreditsObj[0].memberReferCreditValue;
                    Credits.find({ memberId: ObjectId(receiverId) }, (err, receiverUpdatedcreditsObj) => {
                        if (err)
                            console.log("**** Error while fetch the receiver Credit value *************", err);
                        else {
                            receiverUpdatedcreditsObj[0].cumulativeCreditValue = receiverUpdatedcreditsObj[0].cumulativeCreditValue + receiverUpdatedcreditsObj[0].memberReferCreditValue;
                            CelebrityContracts.findOne({ memberId: receiverId, serviceType: "chat" }, (err, celebContractObj) => {
                                if (!celebContractObj)
                                    celebContractObj = "";

                                listOfChatMessageObj.sort(function (x, y) {
                                    return x.createdAt - y.createdAt;
                                });
                                let welcomeMessage = {
                                    senderId: senderId,
                                    receiverId: receiverId,
                                    _id: senderId,
                                    createdAt: new Date(),
                                    isWelcomeMessage: true,
                                    //message: "Message you send to this chat calls are now secure with end-to-end encrypted..."
                                    message: "Your first message of 160 characters is FREE."
                                };
                                //console.log(listOfChatMessageObj)
                                if (listOfChatMessageObj.length == 0)
                                    listOfChatMessageObj.push(welcomeMessage);
                                return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: { listOfChatMessageObj: listOfChatMessageObj, senderUpdatedCredits: senderUpdatedcreditsObj[0], receiverUpdatedCredits: receiverUpdatedcreditsObj[0], celebCharge: celebContractObj } });
                            });
                        }
                    }).sort({ createdAt: -1 }).limit(1);
                }
            }).sort({ createdAt: -1 }).limit(1);

        }
    })


}

var getLastMessagesByReceiverId = (req, res) => {
    let chatId = (req.params.chat_Id) ? req.params.chat_Id : '';
    let senderId = (req.params.sender_Id) ? req.params.sender_Id : '';
    chatServices.findLatestChatMessagesByReceiverId(chatId, (err, latestMegObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching last message by receiver id" })
        } else {
            Chat.countDocuments({ chatRoomId: latestMegObj.chatRoomId, senderId: ObjectId(senderId), isRead: false }, function callback(err, totalUnReadMsgCount) {
                if (err) {
                    console.log(err)
                } else {
                    Object.assign(latestMegObj, { "counter": totalUnReadMsgCount })
                    return res.status(200).json({ success: 1, token: req.headers['x-access-token'], data: latestMegObj });
                }
            });

        }
    })
}

var createChatMessage = (req, res) => {
    // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    // console.log(req.body);
    // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    let senderId = req.body.senderId;
    let receiverId = req.body.receiverId;
    let isCeleb = req.body.isCeleb;
    let os = req.body.os;
    let isFan = false;
    let memberPreferencesId = null;
    // console.log(req.body)
    if (req.body.isCeleb == true) {
        memberPreferencesId = req.body.receiverId;
    } else {
        memberPreferencesId = req.body.senderId
    }
    // check receiver status if off line then send the push  notification
    let receiverStatus = req.body.receiverStatus;
    if (receiverStatus == "online") {
        req.body.messageStatus = "delivered";
        req.body.messageDeliveredDate = new Date();
        req.body.messageSentDate = new Date();
    }
    else {
        req.body.messageStatus = "sent";
        req.body.messageSentDate = new Date();
    }
    //console.log(req.body);
    let query = { senderId: ObjectId(senderId), receiverId: ObjectId(receiverId) }
    //$and: []
    //reason: "Block/Report", $or: [{ celebrityId: ObjectId(receiverId) }, { memberId: ObjectId(senderId) }]
    let feedbackQuery = {
        reason: "Block/Report", celebrityId: ObjectId(receiverId), memberId: ObjectId(senderId)
    };
    Feedback.find(feedbackQuery, (err, feedbackListObj) => {
        if (err)
            console.log("***** Error while fetching the feedback ********", err)
        else {
            if (feedbackListObj.length > 0) {
                return res.status(200).json({ success: 0, data: { senderId: senderId, receiverId: receiverId }, message: "Celebrity has blocked you.!!!" });
            }
            //$and: [{ callRemarks: "Block/Report" }, { receiverId: ObjectId(receiverId) }, { senderId: ObjectId(senderId) }]
            //reason: "Block/Report", $or: [{ receiverId: ObjectId(receiverId) }, { senderId: ObjectId(senderId) }]
            let serviceTransquery = {
                callRemarks: "Block/Report", receiverId: ObjectId(receiverId), senderId: ObjectId(senderId)
            };
            ServiceTransaction.find(serviceTransquery, (err, serviceTransListObj) => {
                if (err)
                    console.log("******** Error while fetching the service transaction ***********", err);
                else {
                    if (serviceTransListObj.length > 0) {
                        return res.status(200).json({ success: 0, data: { senderId: senderId, receiverId: receiverId }, message: "Celebrity has blocked you.!!!" });
                    }
                    MemberPreferences.findOne({ memberId: ObjectId(memberPreferencesId) }, (err, currentMemberPreferenceObj) => {
                        if (err)
                            console.log("******** Error while fetching the current member preference *********", err)
                        else {
                            if (currentMemberPreferenceObj && currentMemberPreferenceObj.celebrities.length > 0) {
                                isFan = currentMemberPreferenceObj.celebrities.some((celebObj) => {
                                    let celebId = celebObj.CelebrityId;
                                    celebId = "" + celebId;
                                    return (celebId == receiverId && celebObj.isFan == true)
                                });
                            }
                            //console.log("IS Celeb Fan status ", isFan);
                            User.findById(Object(receiverId), { _id: 1, email: 1, mobileNumber: 1, firstName: 1, lastName: 1, avtar_imgPath: 1, isCeleb: 1 }, (err, userObj) => {
                                if (err)
                                    console.log("********** Error while fetching the user Details******* ", err)
                                else {
                                    //console.log("******* User Details ******* ", userObj)
                                    Login.findOne({ memberId: ObjectId(receiverId) }, (err, userDeviceInfoObj) => {
                                        if (err)
                                            console.log("****** Error while  fetch data *******", err);
                                        else {
                                            // console.log("****** Receiver  Device Info *******", userDeviceInfoObj);
                                            // if (userDeviceInfoObj.callingDeviceToken == "" || userDeviceInfoObj.callingDeviceToken == null)
                                            //     os = "android"
                                            // else
                                            //     os = "ios"
                                            chatServices.countNumberOfTodayMessage(query, (err, totalMsgCountForToday) => {
                                                if (err)
                                                    console.log("Error while count number of today message", err)
                                                else {
                                                    let noOfMessage = req.body.numberOfMessages;
                                                    //console.log(req.body);
                                                    if (totalMsgCountForToday == 0 && req.body.numberOfMessages > 1) {
                                                        noOfMessage = req.body.numberOfMessages;
                                                        req.body.numberOfMessages = req.body.numberOfMessages - 1
                                                        // console.log("********************************************************************", noOfMessage)
                                                    }
                                                    // console.log(req.body);
                                                    // console.log(totalMsgCountForToday);
                                                    // console.log(typeof totalMsgCountForToday);
                                                    if ((totalMsgCountForToday == 0 && noOfMessage == 1) || (isCeleb == true && userObj.isCeleb == true)) {
                                                        req.body.credits = "0";
                                                        //console.log("********************************************************************")
                                                        chatServices.saveMessage(req.body, (err, createdChatMessageObj) => {
                                                            if (err) {
                                                                console.log(err)
                                                            } else {

                                                                // console.log("succesfully saved messgar")
                                                                // console.log(req.body)
                                                                // console.log(receiverStatus)
                                                                chatServices.getUnreadMessageCount(ObjectId(receiverId), (err, unReadMesssageCount) => {
                                                                    if (err)
                                                                        console.log("********* Error while fetching unseen message by reciever id********************", err);
                                                                    else {
                                                                        //console.log(unReadMesssageCount);
                                                                        Credits.find({ memberId: ObjectId(senderId) }, (err, senderUpdatedCreditsObj) => {
                                                                            if (err)
                                                                                console.log("****** Error while fetching sender updated credits*******", err);
                                                                            else {
                                                                                senderUpdatedCreditsObj[0].cumulativeCreditValue = senderUpdatedCreditsObj[0].cumulativeCreditValue + senderUpdatedCreditsObj[0].memberReferCreditValue
                                                                                Credits.find({ memberId: ObjectId(receiverId) }, (err, receiverUpdatedCreditsObj) => {
                                                                                    if (err)
                                                                                        console.log("******* Error while fetching  updatds receiver credits **********", err);
                                                                                    else {
                                                                                        receiverUpdatedCreditsObj[0].cumulativeCreditValue = receiverUpdatedCreditsObj[0].cumulativeCreditValue + receiverUpdatedCreditsObj[0].memberReferCreditValue
                                                                                        if (receiverStatus == "offline") {
                                                                                            if (userDeviceInfoObj.osType == "Android") {
                                                                                                // console.log("Lesh than 0ne")
                                                                                                let message = {
                                                                                                    to: userDeviceInfoObj.deviceToken,
                                                                                                    collapse_key: 'Service-alerts',
                                                                                                    data: {
                                                                                                        serviceType: "chat",
                                                                                                        title: req.body.senderFirstName + " " + req.body.senderLastName,
                                                                                                        body: req.body.message,
                                                                                                        memberId: senderId,
                                                                                                        receiverId: receiverId,
                                                                                                        isCeleb: req.body.isCeleb,
                                                                                                        senderFirstName: req.body.senderFirstName,
                                                                                                        senderLastName: req.body.senderLastName,
                                                                                                        senderAvatar: req.body.senderAvatar,
                                                                                                        isFan: isFan,
                                                                                                        chatCount: unReadMesssageCount.chatCount,
                                                                                                        unSeenMessageCount: unReadMesssageCount.unSeenMessageCount
                                                                                                    }
                                                                                                }
                                                                                                fcm.send(message, function (err, response) {
                                                                                                    if (err) {
                                                                                                        console.log("Something has gone wrong!", err);
                                                                                                    } else {
                                                                                                        console.log("Successfully sent with response Andriod: ", response);
                                                                                                    }
                                                                                                });
                                                                                            } else {
                                                                                                let message = {
                                                                                                    to: userDeviceInfoObj.deviceToken,
                                                                                                    collapse_key: 'Service-alerts',
                                                                                                    notification: {
                                                                                                        serviceType: "chat",
                                                                                                        title: req.body.senderFirstName + " " + req.body.senderLastName,
                                                                                                        body: req.body.message,
                                                                                                        memberId: senderId,
                                                                                                        receiverId: receiverId,
                                                                                                        isCeleb: req.body.isCeleb,
                                                                                                        senderFirstName: req.body.senderFirstName,
                                                                                                        senderLastName: req.body.senderLastName,
                                                                                                        senderAvatar: req.body.senderAvatar,
                                                                                                        isFan: isFan,
                                                                                                        chatCount: unReadMesssageCount.chatCount,
                                                                                                        unSeenMessageCount: unReadMesssageCount.unSeenMessageCount
                                                                                                    }
                                                                                                }
                                                                                                fcm.send(message, function (err, response) {
                                                                                                    if (err) {
                                                                                                        console.log("Something has gone wrong!", err);
                                                                                                    } else {
                                                                                                        console.log("Successfully sent with response IOS: ", response);
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                        return res.status(200).json({ success: 1, data: createdChatMessageObj, message: "message created successfully.", senderUpdatedCredits: senderUpdatedCreditsObj[0], receiverUpdatedCredits: receiverUpdatedCreditsObj[0], token: req.headers['x-access-token'] });
                                                                                    }
                                                                                }).sort({ createdAt: -1 }).limit(1)
                                                                            }
                                                                        }).sort({ createdAt: -1 }).limit(1);
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        CelebrityContracts.findOne({ memberId: receiverId, serviceType: "chat" }, (err, celebContractObj) => {
                                                            if (err)
                                                                console.log("****** Error while fetching to Credit ****** ", celebContractObj);
                                                            {
                                                                //console.log(celebContractObj);
                                                                let creditsChargePerMessage = 0;
                                                                let celebCreditPercentage = 0;
                                                                //if (isCeleb == true)
                                                                if (!celebContractObj || celebContractObj == null) {
                                                                    creditsChargePerMessage = 0;
                                                                } else {
                                                                    creditsChargePerMessage = celebContractObj.serviceCredits;
                                                                }
                                                                //console.log("******** creditsChargePerMessage ******88",creditsChargePerMessage);
                                                                Credits.find({ memberId: ObjectId(senderId) }, (err, creditsObj) => {
                                                                    if (err) {
                                                                        return res.status(404).json({ success: 0, message: "Error while fetching last credits by sender ID " })
                                                                    } else {
                                                                        let creditCharge = req.body.numberOfMessages;
                                                                        let currentCumulativeCreditValue = creditsObj[0].cumulativeCreditValue + creditsObj[0].memberReferCreditValue;
                                                                        currentCumulativeCreditValue = parseInt(currentCumulativeCreditValue);
                                                                        creditCharge = parseInt(creditCharge);
                                                                        //let creditsPerMessage = req.body.credits;
                                                                        creditsChargePerMessage = parseInt(creditsChargePerMessage);
                                                                        creditCharge = creditCharge * creditsChargePerMessage;
                                                                        //console.log("******* Total Credits Avialable *********** ", currentCumulativeCreditValue);
                                                                        //console.log("***********Credit charge  for this message ******** ", creditCharge);
                                                                        if (creditCharge > currentCumulativeCreditValue) {
                                                                            return res.status(200).json({ success: 0, data: { senderId: senderId, receiverId: receiverId }, message: "Insufficient credits to send message. Please add credits." });
                                                                        } else {
                                                                            req.body.credits = creditCharge
                                                                            if (isCeleb == true)
                                                                                req.body.credits = "0";
                                                                            chatServices.saveMessage(req.body, (err, createdChatMessageObj) => {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                } else {
                                                                                    // console.log("succesfully saved messgar")
                                                                                    // console.log(req.body)
                                                                                    // console.log(receiverStatus)
                                                                                    chatServices.getUnreadMessageCount(ObjectId(receiverId), (err, unReadMesssageCount) => {
                                                                                        if (err)
                                                                                            console.log("********* Error while fetching unseen message by reciever id********************", err);
                                                                                        else {
                                                                                            let remainingCredits = 0;
                                                                                            let debitFromMemberReferralCreditValue = 0;
                                                                                            let debitFromMainCreditValue = 0;
                                                                                            let oldNewCumulativeCreditValue = creditsObj[0].cumulativeCreditValue;
                                                                                            let newReferralCreditValue = creditsObj[0].referralCreditValue;
                                                                                            let oldMemberReferCreditValue = creditsObj[0].memberReferCreditValue;
                                                                                            if (oldMemberReferCreditValue >= creditCharge) {
                                                                                                newMemberReferCreditValue = parseInt(oldMemberReferCreditValue) - parseInt(creditCharge);
                                                                                                newCumulativeCreditValue = oldNewCumulativeCreditValue
                                                                                                debitFromMemberReferralCreditValue = creditCharge;
                                                                                            } else if (oldMemberReferCreditValue > 0 && oldMemberReferCreditValue < creditCharge) {
                                                                                                remainingCredits = parseInt(creditCharge) - parseInt(oldMemberReferCreditValue);
                                                                                                newMemberReferCreditValue = 0;
                                                                                                newCumulativeCreditValue = parseInt(oldNewCumulativeCreditValue) - parseInt(remainingCredits);
                                                                                                debitFromMemberReferralCreditValue = oldMemberReferCreditValue;
                                                                                                debitFromMainCreditValue = remainingCredits;
                                                                                            } else {
                                                                                                newMemberReferCreditValue = oldMemberReferCreditValue;
                                                                                                newCumulativeCreditValue = parseInt(creditsObj[0].cumulativeCreditValue) - parseInt(creditCharge);
                                                                                                debitFromMainCreditValue = creditCharge;
                                                                                            }

                                                                                            if (isCeleb == true) {
                                                                                                newCumulativeCreditValue = creditsObj[0].cumulativeCreditValue;
                                                                                                creditCharge = "0";
                                                                                            }
                                                                                            if (isCeleb == false) {
                                                                                                Credits.find({ memberId: ObjectId(receiverId) }, (err, celebCreditObj) => {
                                                                                                    if (err)
                                                                                                        console.log("***** Errror while fetch credits for celeb *********", err)
                                                                                                    else {
                                                                                                        //console.log("********* 111111 creditCharge 1111111111 ************", creditCharge)
                                                                                                        let celebrityCreditObj = {};
                                                                                                        celebrityCreditObj = celebCreditObj[0];
                                                                                                        //console.log("********   Fetch celebrityCreditObj ***********", celebrityCreditObj)
                                                                                                        let celebPermessagePercentage = parseFloat(celebContractObj.sharingPercentage);
                                                                                                        let totalCelebPercentage = parseFloat(creditCharge) * parseFloat(celebPermessagePercentage) / 100;
                                                                                                        totalCelebPercentage = totalCelebPercentage.toFixed(2);
                                                                                                        let celebCreditValue = totalCelebPercentage;
                                                                                                        let celebKonectAppCharge = totalCelebPercentage
                                                                                                        //console.log("********   333333 cumulativeCreditValue ***********", celebrityCreditObj.cumulativeCreditValue)
                                                                                                        //console.log("********   333333 totalCelebPercentage ***********", totalCelebPercentage)
                                                                                                        totalCelebPercentage = parseFloat(celebrityCreditObj.cumulativeCreditValue) + parseFloat(totalCelebPercentage)
                                                                                                        totalCelebPercentage = totalCelebPercentage.toFixed(2);
                                                                                                        // console.log("********   444444 totalCelebPercentage ***********", totalCelebPercentage)
                                                                                                        let newCreditInfoForCeleb = new Credits({
                                                                                                            memberId: receiverId,
                                                                                                            creditType: "credit",
                                                                                                            status: "active",
                                                                                                            referralCreditValue: celebrityCreditObj.referralCreditValue,
                                                                                                            memberReferCreditValue: celebrityCreditObj.memberReferCreditValue,
                                                                                                            cumulativeCreditValue: totalCelebPercentage,
                                                                                                            creditValue: celebCreditValue,
                                                                                                            remarks: "credited for chat"
                                                                                                        })
                                                                                                        Credits.create(newCreditInfoForCeleb, (err, celebCreditUpdatedObj) => {
                                                                                                            if (err)
                                                                                                                console.log("****** Error while upadte celeb credit cutted by user *******", err)
                                                                                                            else {
                                                                                                                let totalCelebKonectAppCharge = parseFloat(creditCharge) - parseFloat(celebKonectAppCharge);
                                                                                                                totalCelebKonectAppCharge = parseFloat(totalCelebKonectAppCharge);
                                                                                                                let payCreditsInfo = new PayCredits({
                                                                                                                    payType: "chat",
                                                                                                                    creditValue: creditCharge,
                                                                                                                    celebPercentage: celebKonectAppCharge,
                                                                                                                    managerPercentage: "0",
                                                                                                                    celebKonnectPercentage: totalCelebKonectAppCharge,
                                                                                                                    memberId: receiverId,
                                                                                                                    celebId: senderId,
                                                                                                                    createdAt: new Date(),
                                                                                                                    debitFromMemberReferralCreditValue: debitFromMemberReferralCreditValue,
                                                                                                                    debitFromMainCreditValue: debitFromMainCreditValue,
                                                                                                                })
                                                                                                                PayCredits.create(payCreditsInfo, (err, payCreditsObj) => {
                                                                                                                    if (err)
                                                                                                                        console.log("*** Error while create the payCredit for admin reports **", err)
                                                                                                                })
                                                                                                                //console.log("******Celeb credit updated *******", celebCreditUpdatedObj);
                                                                                                            }
                                                                                                        })
                                                                                                        //console.log("*****Add celeb credit parcentage*****", celebrityCreditObj);
                                                                                                    }
                                                                                                }).sort({ createdAt: -1 }).limit(1);
                                                                                            }
                                                                                            let newCredits = new Credits({
                                                                                                memberId: senderId,
                                                                                                creditType: "debit",
                                                                                                status: "active",
                                                                                                referralCreditValue: newReferralCreditValue,
                                                                                                cumulativeCreditValue: newCumulativeCreditValue,
                                                                                                memberReferCreditValue: newMemberReferCreditValue,
                                                                                                creditValue: creditCharge,                                                                                               
                                                                                                remarks: "debited for chat"
                                                                                            });
                                                                                            Credits.create(newCredits, (err, createdCreditObj) => {
                                                                                                if (err)
                                                                                                    console.log("****** Error After debit for chat message ** ", err)
                                                                                                else {
                                                                                                    Credits.find({ memberId: ObjectId(senderId) }, (err, senderUpdatedCreditsObj) => {
                                                                                                        if (err)
                                                                                                            console.log("****** Error while fetching sender updated credits*******", err);
                                                                                                        else {
                                                                                                            senderUpdatedCreditsObj[0].cumulativeCreditValue = senderUpdatedCreditsObj[0].cumulativeCreditValue + senderUpdatedCreditsObj[0].memberReferCreditValue
                                                                                                            Credits.find({ memberId: ObjectId(receiverId) }, (err, receiverUpdatedCreditsObj) => {
                                                                                                                if (err)
                                                                                                                    console.log("******* Error while fetching  updatds receiver credits **********", err);
                                                                                                                else {
                                                                                                                    receiverUpdatedCreditsObj[0].cumulativeCreditValue = receiverUpdatedCreditsObj[0].cumulativeCreditValue + receiverUpdatedCreditsObj[0].memberReferCreditValue
                                                                                                                    User.findOne({ _id: senderId }, (err, uResult) => {
                                                                                                                        nId = uResult._id;
                                                                                                                        oldValue = parseInt(uResult.cumulativeSpent);
                                                                                                                        let newbody = {};
                                                                                                                        newbody.cumulativeSpent = parseInt(creditCharge) + parseInt(oldValue);
                                                                                                                        User.findByIdAndUpdate(nId, newbody, (err, upResult) => {
                                                                                                                            if (err)
                                                                                                                                console.log("*** Error while update member Credit in user table **** ", err)
                                                                                                                            else {
                                                                                                                                if (receiverStatus == "offline") {
                                                                                                                                    if (userDeviceInfoObj.osType == "Android") {
                                                                                                                                        // console.log("MOre than 0ne")
                                                                                                                                        let message = {
                                                                                                                                            to: userDeviceInfoObj.deviceToken,
                                                                                                                                            collapse_key: 'Service-alerts',
                                                                                                                                            data: {
                                                                                                                                                serviceType: "chat",
                                                                                                                                                title: req.body.senderFirstName + " " + req.body.senderLastName,
                                                                                                                                                body: req.body.message,
                                                                                                                                                memberId: senderId,
                                                                                                                                                receiverId: receiverId,
                                                                                                                                                isCeleb: req.body.isCeleb,
                                                                                                                                                senderFirstName: req.body.senderFirstName,
                                                                                                                                                senderLastName: req.body.senderLastName,
                                                                                                                                                senderAvatar: req.body.senderAvatar,
                                                                                                                                                isFan: isFan,
                                                                                                                                                chatCount: unReadMesssageCount.chatCount,
                                                                                                                                                unSeenMessageCount: unReadMesssageCount.unSeenMessageCount
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        fcm.send(message, function (err, response) {
                                                                                                                                            if (err) {
                                                                                                                                                console.log("Something has gone wrong!", err);
                                                                                                                                            } else {
                                                                                                                                                console.log("Successfully sent with response Andriod: ", response);
                                                                                                                                            }
                                                                                                                                        });
                                                                                                                                    } else {
                                                                                                                                        let message = {
                                                                                                                                            to: userDeviceInfoObj.deviceToken,
                                                                                                                                            collapse_key: 'Service-alerts',
                                                                                                                                            notification: {
                                                                                                                                                serviceType: "chat",
                                                                                                                                                title: req.body.senderFirstName + " " + req.body.senderLastName,
                                                                                                                                                body: req.body.message,
                                                                                                                                                memberId: senderId,
                                                                                                                                                receiverId: receiverId,
                                                                                                                                                isCeleb: req.body.isCeleb,
                                                                                                                                                senderFirstName: req.body.senderFirstName,
                                                                                                                                                senderLastName: req.body.senderLastName,
                                                                                                                                                senderAvatar: req.body.senderAvatar,
                                                                                                                                                isFan: isFan,
                                                                                                                                                chatCount: unReadMesssageCount.chatCount,
                                                                                                                                                unSeenMessageCount: unReadMesssageCount.unSeenMessageCount
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        fcm.send(message, function (err, response) {
                                                                                                                                            if (err) {
                                                                                                                                                console.log("Something has gone wrong!", err);
                                                                                                                                            } else {
                                                                                                                                                console.log("Successfully sent with response IOS: ", response);
                                                                                                                                            }
                                                                                                                                        });
                                                                                                                                    }
                                                                                                                                }
                                                                                                                                return res.status(200).json({ success: 1, data: createdChatMessageObj, message: "message created successfully.", senderUpdatedCredits: senderUpdatedCreditsObj[0], receiverUpdatedCredits: receiverUpdatedCreditsObj[0], token: req.headers['x-access-token'] })
                                                                                                                            }
                                                                                                                        });
                                                                                                                    });
                                                                                                                }
                                                                                                            }).sort({ createdAt: -1 }).limit(1)
                                                                                                        }
                                                                                                    }).sort({ createdAt: -1 }).limit(1);

                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                }).sort({ createdAt: -1 }).limit(1);
                                                            }
                                                        })
                                                    }
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
    });

}

var getMessageById = (req, res) => {
    let messageId = (req.params.message_Id) ? req.params.message_Id : '';
    chatServices.findMessageById(messageId, (err, messageObj) => {
        if (err) {
            return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching message by ID " })
        } else {
            return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: messageObj });
        }
    })

}

getUnreadMessageCount = function (req, res) {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    chatServices.getUnreadMessageCount(ObjectId(memberId), (err, unReadMesssageCount) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while fetching the un read message count" })
        }
        else {
            res.status(200).json({ success: 1, data: unReadMesssageCount })
        }
    });
}

function addKeyValue(obj, key, data) {
    obj[key] = data;
}

const getSeenCount = countQuery => {
    return Promise((resolve, reject) => {
        Chat.find(countQuery)
            //return setTimeout((counter) => resolve(counter), 10)
            .then((counter) => resolve(counter))
    })
}

const fruitBasket = {
    apple: 27,
    grape: 100,
    pear: 14
}
const getNumFruit = fruit => {
    return fruitBasket[fruit]
}

let getCurrentMemberChatAsync = async (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    try {
        const listOfChatRoomIdObj1 = await chatServices.findAllChatRoomForCurrentMember1(memberId);
        if (listOfChatRoomIdObj1.length <= 0) {
            return res.status(200).json({ success: 1, data: [] })
        } else {
            // console.log("listOfChatRoomIdObj1", listOfChatRoomIdObj1.length);
            let query = {
                memberId: memberId,
                listOfChatRoomId: listOfChatRoomIdObj1
            }
            const listOfChatsObj1 = await chatServices.findChatsByCurrentMember1(query);
            if (listOfChatsObj1) {
                // console.log("listOfChatsObj1 === ", listOfChatsObj1.length);
                const memberFanObj1 = await MemberPreferences.findOne({ memberId: ObjectId(memberId) })
                if (memberFanObj1) {
                    // console.log("memberFanObj1 === ", memberFanObj1);
                    let unReadMsgQuery = {
                        memberId: memberId,
                        listOfChatRoomId: listOfChatRoomIdObj1
                    }
                    const unReadMesssageObj1 = await chatServices.findUnReadMessage(unReadMsgQuery);
                    // console.log("unReadMesssageObj1 === ", unReadMesssageObj1);
                    let memberCelebArray = memberFanObj1.celebrities;
                    listOfChatsObj1.map((chatObj) => {
                        let counter = 0;
                        let celebrityId = "";
                        let isFan = false;
                        if (chatObj.senderInfo._id != memberId) {
                            celebrityId = chatObj.senderInfo._id;
                        } else {
                            celebrityId = chatObj.receiverInfo._id
                        }
                        unReadMesssageObj1.map((count) => {
                            if (chatObj._id == count._id) {
                                counter = count.count
                            }
                        })
                        chatObj.counter = counter
                        memberCelebArr = memberCelebArray.filter(function (obj) {
                            // console.log(typeof "======= " + obj.CelebrityId)
                            // console.log(typeof " ======= " + celebrityId)
                            return "" + obj.CelebrityId === "" + celebrityId && obj.isFan === true
                        });
                        // console.log("memberCelebArr", memberCelebArr)
                        if (memberCelebArr.length > 0 && memberCelebArr[0].isFan == true)
                            isFan = true;
                        if (celebrityId === chatObj.senderInfo._id) {
                            chatObj.senderInfo.isFan = isFan
                        } else {
                            chatObj.receiverInfo.isFan = isFan
                        }

                    })
                    listOfChatsObj1.sort(function (x, y) {
                        var dateA = new Date(x.createdAt), dateB = new Date(y.createdAt);
                        return dateB - dateA;
                    });
                    return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfChatsObj1 });
                } else {
                    return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching current member preferences" });
                }
            } else {
                return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while fetching current member chat by member ID" });
            }
        }
    } catch (error) {
        res.status(401).json({ message: 'Something went wrong', error: error });
    }
}

var chatController = {
    getCurrentMemberChat: getCurrentMemberChat,
    getAllChatMessages: getAllChatMessages,
    getLastMessagesByReceiverId: getLastMessagesByReceiverId,
    createChatMessage: createChatMessage,
    getMessageById: getMessageById,
    getUnreadMessageCount: getUnreadMessageCount,
    getCurrentMemberChatAsync: getCurrentMemberChatAsync
}

module.exports = chatController;