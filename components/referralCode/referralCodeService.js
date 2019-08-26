const Credits = require("../credits/creditsModel");
const ObjectId = require('mongodb').ObjectId;
const User = require("../users/userModel");
const ReferralCode = require("./referralCodeModel")

const payToReferrer = (memberId, ammount, callback) => {
    Credits.findOne({ memberId: ObjectId(memberId) }, (err, cBal) => {
        if (err) {
            callback(err, null, "Please Login again")
        }
        if (cBal) {
            let newReferralCreditValue = cBal.referralCreditValue + ammount;
            let newCredits = new Credits({
                memberId: memberId,
                creditType: "promotion",
                creditValue: cBal.creditValue,
                cumulativeCreditValue: cBal.cumulativeCreditValue,
                referralCreditValue: newReferralCreditValue,
                createdBy: memberId
            });
            Credits.createCredits(newCredits, (err, credits) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, credits)
                }
            });
        } else {
            let newCredits = new Credits({
                memberId: memberId,
                creditType: "promotion",
                creditValue: parseInt(0),
                cumulativeCreditValue: ammount,
                referralCreditValue: parseInt(0),
                createdBy: memberId
            });
            Credits.createCredits(newCredits, (err, credits) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, credits)
                }
            });
        }
    }).sort({ createdAt: -1 }).limit(1);
}


const generateReferalCode = (memberId, callback) => {
    User.findById(memberId, (err, usersDetails) => {
        if (err) {
            callback(err, null)
        }
        else if (usersDetails) {
            let fName = usersDetails.firstName;
            let fRes = fName.substring(0, 3);
            let lName = usersDetails.lastName;
            let lRes = lName.substring(0, 2);
            let token = Math.floor(Math.random() * 100000 + 54);
            let memberCode = fRes.toUpperCase() + lRes.toUpperCase() + token;
            let newreferralCode = new ReferralCode({
                memberId: memberId,
                memberCode: memberCode,
                referralCreditValue: 150,
                referreCreditValue: 0,
                createdBy: memberId
            });

            ReferralCode.createReferralCode(newreferralCode, (err, referralCodeObj) => {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, referralCodeObj)
                }
            });
        } else {
            callback(null, null)
        }
    });
}

const getReferalCode = (memberId, callback) => {
    User.findById(memberId, (err, usersDetails) => {
        if (err) {
            callback(err, null)
        }
        else if (usersDetails) {
            ReferralCode.findOne({ memberId: memberId }, { memberCode: 1 }, (err, referralCodeObj) => {
                if (err) {
                    callback(err, null)
                } else if (referralCodeObj) {
                    callback(null, referralCodeObj)
                } else {
                    let fName = usersDetails.firstName;
                    let fRes = fName.substring(0, 3);
                    let lName = usersDetails.lastName;
                    let lRes = lName.substring(0, 2);
                    let token = Math.floor(Math.random() * 100000 + 54);
                    let memberCode = fRes.toUpperCase() + lRes.toUpperCase() + token;
                    let newreferralCode = new ReferralCode({
                        memberId: memberId,
                        memberCode: memberCode,
                        referralCreditValue: 150,
                        referreCreditValue: 100,
                        createdBy: memberId
                    });

                    ReferralCode.createReferralCode(newreferralCode, (err, referralCodeObj) => {
                        if (err) {
                            callback(err, null)
                        } else {
                            callback(null, referralCodeObj)
                        }
                    });
                }
            }).sort({ createdAt: -1 })
        } else {
            callback("User Not found", null)
        }
    });
}

let updateReferralCreditValue = function (memberId, referralCreditValue, referreCreditValue, callback) {
    ReferralCode.findOneAndUpdate({ memberId: memberId }, { $set: { referralCreditValue: referralCreditValue, referreCreditValue: referreCreditValue } }, (err, referralCodeObj) => {
        if (!err)
            callback(null, referralCodeObj);
        else
            callback(err, null)
    })
}

module.exports = {
    payToReferrer: payToReferrer,
    getReferalCode: getReferalCode,
    generateReferalCode: generateReferalCode,
    updateReferralCreditValue: updateReferralCreditValue
}