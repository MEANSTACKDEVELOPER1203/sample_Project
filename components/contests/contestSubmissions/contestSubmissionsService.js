//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let ContestSubmission = require("../contestSubmissions/contestSubmissionsModel");

var saveContestSubmission = function (contestSubmissionObj, callback) {
    /* let query = {
        $and: [{
            contestId: contestSubmissionObj.contestId
        }, {
            memberId: contestSubmissionObj.memberId
        }, {
            questionId: contestSubmissionObj.questionId
        }]
    } */
    ContestSubmission.create(contestSubmissionObj, (err, createdcontestSubmissionObj) => {
        if (!err)
            callback(null, createdcontestSubmissionObj);
        else
            callback(err, null);
    });
    /* ContestSubmission.find(query, (err, createdcontestSubmissionObj) => {
        if (err) {
            callback(err, null);
        } else {
            if (createdcontestSubmissionObj.length == 0) {
                //////////// CREATE CODE HERE
            } else {
                callback(null, {"message" : "Already submitted!"})
            }
        }
    }); */
}

var updateContestSubmission = function (contestSubmissionId, contestSubmissionObj, callback) {
    ContestSubmission.findByIdAndUpdate(contestSubmissionId, contestSubmissionObj, (err, updatedcontestSubmissionObj) => {
        if (!err)
            callback(null, updatedcontestSubmissionObj);
        else
            callback(err, null);
    });
}

var findContestSubmissionById = function (contestQuestionsId, cb) {
    ContestSubmission.findById({
        _id: contestQuestionsId
    }, (err, contestQuestionsDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, contestQuestionsDetailsObj);
        }
    });
}

var contestSubmissionService = {
    saveContestSubmission: saveContestSubmission,
    updateContestSubmission: updateContestSubmission,
    findContestSubmissionById: findContestSubmissionById
}

module.exports = contestSubmissionService;






































































































































































/*
var getAllUserProfile = function (callback) {
    User.find((err, listOfUsersObj) => {
        if (!err) {
            callback(null, listOfUsersObj);
        } else {
            callback(err, null);
        }
    });
}

var saveUserProfile = function (userProfileObj, callback) {
    var userProfile = new User({
        firstName: userProfileObj.firstName,
        lastName: userProfileObj.lastName,
        userName: userProfileObj.userName,
        emailId: userProfileObj.emailId,
        mobileNo: userProfileObj.mobileNo,
        createDate: userProfileObj.createDate,
        imageUrl:userProfileObj.imageUrl,
        imageName:userProfileObj.imageName
        

    });
    User.create(userProfile, (err, createdUserObj) => {
        if (!err) {
            callback(null, createdUserObj);
        } else {
            callback(err, null);
        }
    })
}

var updateUserProfileById = function (userId, userObj, callback) {
    //console.log(userObj);
    User.findByIdAndUpdate(ObjectId(userId), userObj, { new: true }, (err, updatedUserObj) => {
        if (!err) {
            callback(null, updatedUserObj);
        } else {
            callback(err, null);
        }
    });
}

var findUserByCreatedDate = function (createDate, callback) {
    //{ "$gte": new Date(createDate), "$lt": new Date(createDate) }
    let query = {
        createDate: new Date(createDate)
    }
    User.find(query, (err, userObj) => {
        if (!err) {
            callback(null, userObj);
        } else {
            callback(err, null);
        }
    });
}
var userProfile = {
    getAllUserProfile: getAllUserProfile,
    saveUserProfile: saveUserProfile,
    updateUserProfileById: updateUserProfileById,
    findUserByCreatedDate: findUserByCreatedDate
}

module.exports = userProfile;

*/