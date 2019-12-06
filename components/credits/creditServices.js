const CreditModel = require("./creditsModel");
let paymentTransactionServices = require('../paymentTransaction/paymentTransactionServices');
let logins = require('../loginInfo/loginInfoModel');
let Notification = require('../notification/notificationModel');
let notificationSetting = require("../notificationSettings/notificationSettingsModel");
let otpService = require('../otp/otpRouter');
let ObjectId = require("mongodb").ObjectID;
let User = require('../users/userModel');
let celebrityContractsService = require('../celebrityContract/celebrityContractsService')


const createCreditBalance = (memberId, callBack) => {
    let newCredits = new CreditModel({
        memberId: memberId,
        creditType: "",
        creditValue: parseInt(0),
        cumulativeCreditValue: parseInt(0),
        referralCreditValue: "",
        memberReferCreditValue: parseInt(0),
        createdBy: memberId
    });

    CreditModel.createCredits(newCredits, (err, credits) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, credits)
        }
    });
}

const getCreditBalance = (memberId, callBack) => {
    CreditModel.find({ memberId: memberId }, (err, creditBalance) => {
        if (err) {
            callBack(err, null)
        }
        if (creditBalance) {
            creditBalance = creditBalance[0];
            callBack(null, creditBalance)
        }
        else {
            createCreditBalance(memberId, (err, creditBalance) => {
                if (err) {
                    callBack(err, null)
                } else {
                    callBack(null, creditBalance)
                }
            })
        }
    }).sort({ createdAt: -1 }).limit(1); //end of credits
}

const insertCreditForBeingOnline = (body, callback) => {
    let memberId = body.memberId;
    getCreditBalance(memberId, (err, result) => {
        if (err) {
            callback(err, null)
        }
        if (result) {
            let newCredits = new CreditModel({
                memberId: result.memberId,
                creditType: result.creditType,
                creditValue: result.creditValue,
                cumulativeCreditValue: parseInt(result.cumulativeCreditValue) + parseInt(1),
                referralCreditValue: result.referralCreditValue,
                memberReferCreditValue: result.memberReferCreditValue,
                createdBy: result.memberId,
                remarks: "BeingOnlineEarning",
            });
            CreditModel.createCredits(newCredits, (err, credits) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, credits)
                }
            });
        } else {
            createCreditBalance(memberId, (err, creditBalance) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, creditBalance)
                }
            })
        }
    })
}

const getAll = (params, callback) => {
    let pageNo = parseInt(params.pageNo);
    let startFrom = params.limit * (pageNo - 1);
    let limit = parseInt(params.limit);
    CreditModel.countDocuments({}, (err, count) => {
        if (err) {
            callback(err, null)
        }
        else {
            CreditModel.find({}, (err, result) => {
                if (err) {
                    callback(err, null)
                }
                else {
                    let data = {};
                    data.result = result
                    let total_pages = count / limit
                    let div = count % limit;
                    data.pagination = {
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages) + 1,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null, data)
                }
            }).skip(startFrom).limit(limit).sort({ createdAt: -1 });
        }
    })
}


const getCreditHistoryByMemberID = (params, callBack) => {
    let id = params.memberId;
    let createdAt = params.createdAt;
    let getDataByTime = new Date();
    if (createdAt != "null" && createdAt != "0") {
        getDataByTime = createdAt
    }
    let limit = parseInt(params.limit)
    CreditModel.find({
        memberId: ObjectId(id), createdAt: { $lt: new Date(getDataByTime) }
    }, (err, result) => {
        if (err) {
            callBack(err, null)
        }
        else {
            callBack(null, result)
        }
    }).sort({ createdAt: -1 }).limit(limit);
}

let getCreditBalanceByTransactionId = function (transactionId, callBack) {
    CreditModel.findOne({ paymentTranRefId: transactionId }, (err, creditObj) => {
        if (err)
            callBack(err, null);
        else
            callBack(null, creditObj)
    })
}

//Create Credit After Transaction success using paypal
let updateCreditValue = function (body, callBack) {
    // console.log("credit value", body);
    logins.findOne({ memberId: ObjectId(body.memberId) }, {}, (err, memberDeviceDetailsObj) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: err });
        } else {
            CreditModel.find({ memberId: ObjectId(body.memberId) }, null, { sort: { createdAt: -1 } }, (err, cBal) => {
                if (err) {
                    return res.json({ success: 0, token: req.headers['x-access-token'], message: err });
                }
                if (cBal) {
                    cBalObj = cBal[0];
                    oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
                    newCumulativeCreditValue =
                        parseInt(oldCumulativeCreditValue) + parseInt(body.creditValue);
                    newReferralCreditValue = cBalObj.referralCreditValue;
                    newMemberReferCreditValue = cBalObj.memberReferCreditValue;
                    paymentTranRefId = body.paymentTranRefId;
                    creditRefCartId = body.creditRefCartId;
                    memberId = body.memberId;
                    creditValue = body.creditValue;
                    creditType = body.creditType;
                    remarks = body.remarks;
                    couponCode = body.couponCode;
                    createdBy = body.createdBy;
                    let newCredits = new CreditModel({
                        creditRefCartId: creditRefCartId,
                        memberId: memberId,
                        paymentTranRefId: paymentTranRefId,
                        creditType: creditType,
                        creditValue: creditValue,
                        cumulativeCreditValue: newCumulativeCreditValue,
                        referralCreditValue: newReferralCreditValue,
                        memberReferCreditValue: newMemberReferCreditValue,
                        remarks: remarks,
                        couponCode: couponCode,
                        createdBy: createdBy
                    });
                    // Insert Into Credit Table
                    CreditModel.createCredits(newCredits, (err, credits) => {
                        if (err) {
                            return res.json({ success: 0, token: req.headers['x-access-token'], message: err });
                        } else {
                            // paymentTransactionServices.updateCreditStatus(ObjectId(paymentTranRefId), (err, updatedPaymentTransaction) => {
                            //     if (err)
                            //         console.log(err)
                            //     else {
                            //   res.send({ success: 1, token: req.headers['x-access-token'], message: "Credits updated successfully", data: req.body });
                            //let query = { $and: [{ memberId: memberId }, { notificationSettingId: ObjectId("5b5ebd64fef3737e09fb3844") }, { isEnabled: true }] };
                            let query = { memberId: memberId, notificationSettingId: ObjectId("5b5ebd64fef3737e09fb3844") };
                            notificationSetting.find(query, (err, rest) => {
                                if (err)
                                    return res.send(err);
                                // if (rest.length)
                                else {
                                    // Insert into Notfications Collection 
                                    let newNotification = new Notification({
                                        memberId: memberId,
                                        notificationFrom: memberId,
                                        notificationType: "Credit",
                                        activity: "PURCHASEDCREDITS",
                                        title: "You" + " " + "purchased" + " " + creditValue + " credits",
                                        body: "This is to notify you purchased " + creditValue + " Credits. Happy Konecting!!",
                                        status: "active"
                                    });
                                    // Insert Notification
                                    Notification.createNotification(newNotification, (err, createdNotiObj) => {
                                        if (err) {
                                            callBack(err, null)
                                        } else {
                                            callBack(null, credits)
                                            if (rest.length <= 0 || rest[0].isEnabled == true) {
                                                if (memberDeviceDetailsObj.osType == "Android") {
                                                    let data = {
                                                        serviceType: "PURCHASEDCREDITS",
                                                        notificationType: "Credit",
                                                        title: 'Purchased Credits Alert!!',
                                                        memberId: memberId,
                                                        activity: "PURCHASEDCREDITS",
                                                        body: "Your account is credited by " + creditValue + " credits. Now credit Bal: " + newCumulativeCreditValue + " by UPI Ref No " + paymentTranRefId + ". T&C apply. Grab now:",
                                                        //body: "you have purchased " + creditValue + " credits. ",
                                                    }
                                                    otpService.sendAndriodPushNotification(memberDeviceDetailsObj.deviceToken, "", data, (err, successNotificationObj) => {
                                                        if (err)
                                                            console.log(err)
                                                        else {
                                                            console.log(successNotificationObj)
                                                        }
                                                    });
                                                } else {
                                                    let notification = {
                                                        serviceType: "PURCHASEDCREDITS",
                                                        notificationType: "Credit",
                                                        title: 'Purchased Credits Alert!!',
                                                        memberId: memberId,
                                                        activity: "PURCHASEDCREDITS",
                                                        body: "Your account is credited by " + creditValue + " credits. Now credit Bal: " + newCumulativeCreditValue + " by UPI Ref No " + paymentTranRefId + ". T&C apply. Grab now:",
                                                        //body: "Greetings from CelebKonect, this is to notify you earned " + creditValue + " Credits. Happy Konecting!!",
                                                    }
                                                    otpService.sendIOSPushNotification(memberDeviceDetailsObj.deviceToken, notification, (err, successNotificationObj) => {
                                                        if (err)
                                                            console.log(err)
                                                        else {
                                                            console.log(successNotificationObj)
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    // End of Inset Notification
                                }
                            });
                            //     }
                            // })

                        }
                    });
                    // End of Inset into Credit Table
                } else {
                    callBack(null, null)
                }
            }); // End of Create Credits
        }
    })
}

const getMemberAllDetails = function (memberId, callBack) {
    let data = {};
    User.findById(ObjectId(memberId), { pastProfileImages: 0, preferenceId: 0, pastCoverImages: 0, celebritiesWorkedFor: 0 }, (err, userInfo) => {
        if (err)
            callBack(err, null);
        else {
            logins.findOne({ memberId: ObjectId(memberId) }, (err, memberDeviceInfo) => {
                if (err)
                    callBack(err, null);
                else {
                    CreditModel.find({ memberId: memberId }, (err, creditBalanceInfo) => {
                        if (err) {
                            callBack(err, null)
                        }
                        let query = { $and: [{ memberId: ObjectId(memberId) }, { notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") }, { isEnabled: true }] };  //check current member notification setting
                        notificationSetting.findOne(query, (err, memberNotificationInfo) => {
                            if (err)
                                callBack(err, null);
                            else {
                                data.memberInfo = userInfo;
                                data.memberDeviceInfo = memberDeviceInfo;
                                data.creditBalanceInfo = creditBalanceInfo[0];
                                data.memberNotificationInfo = memberNotificationInfo
                                callBack(null, data)
                            }
                        })
                    }).sort({ createdAt: -1 }).limit(1); //end of credits
                }
            })
        }
    })

}

const getCelebAllDetails = function (celebId, callBack) {
    let data = {};
    User.findById(ObjectId(celebId), { pastProfileImages: 0, preferenceId: 0, pastCoverImages: 0, celebritiesWorkedFor: 0 }, (err, userInfo) => {
        if (err)
            callBack(err, null);
        else {
            logins.findOne({ memberId: ObjectId(celebId) }, (err, memberDeviceInfo) => {
                if (err)
                    callBack(err, null);
                else {
                    CreditModel.find({ memberId: celebId }, (err, creditBalanceInfo) => {
                        if (err) {
                            callBack(err, null)
                        }
                        let query = { $and: [{ memberId: ObjectId(celebId) }, { notificationSettingId: ObjectId("5b5ebe31fef3737e09fb3849") }, { isEnabled: true }] };  //check current member notification setting
                        notificationSetting.findOne(query, (err, memberNotificationInfo) => {
                            if (err)
                                callBack(err, null);
                            else {
                                celebrityContractsService.getCelebContractsForFan(celebId, (err, celebContractInfo)=>{
                                    if(err)
                                    callBack(err, null)
                                    else{
                                        data.celebInfo = userInfo;
                                        data.celebDeviceInfo = memberDeviceInfo;
                                        data.celebCreditBalanceInfo = creditBalanceInfo[0];
                                        data.celebNotificationInfo = memberNotificationInfo
                                        data.celebContractInfo = celebContractInfo
                                        callBack(null, data)
                                    }
                                })

                              
                            }
                        })
                    }).sort({ createdAt: -1 }).limit(1); //end of credits
                }
            })
        }
    })
}


module.exports = {
    getCreditBalance: getCreditBalance,
    createCreditBalance: createCreditBalance,
    insertCreditForBeingOnline: insertCreditForBeingOnline,
    getCreditHistoryByMemberID: getCreditHistoryByMemberID,
    getAll: getAll,
    getCreditBalanceByTransactionId: getCreditBalanceByTransactionId,
    updateCreditValue: updateCreditValue,
    getMemberAllDetails: getMemberAllDetails,
    getCelebAllDetails: getCelebAllDetails
}