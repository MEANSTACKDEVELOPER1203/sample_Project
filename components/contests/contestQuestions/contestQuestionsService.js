//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let ContestQuestions = require("../contestQuestions/contestQuestionsModel");

var saveContestQuestions = function (contestQuestionsObj, callback) {
            var contestQuestionsObj = new ContestQuestions({
                contestId : contestQuestionsObj.contestId,
                questionType : contestQuestionsObj.questionType,
                question: contestQuestionsObj.question,
                questionHint : contestQuestionsObj.questionHint,
                questionOptions : contestQuestionsObj.questionOptions,
                correctAnswer : contestQuestionsObj.correctAnswer,
                createdBy : contestQuestionsObj.createdBy
            });
            ContestQuestions.create(contestQuestionsObj, (err, createdContestQuestionsObj) => {
                if (!err)
                    callback(null, createdContestQuestionsObj);
                else
                    callback(err, null);
            });
}

var updateContestQuestions = function (contestQuestionsId, contestQuestionsObj, callback) {
    ContestQuestions.findByIdAndUpdate(contestQuestionsId, contestQuestionsObj, (err, updatedContestQuestionsObj) => {
        if (!err)
            callback(null, updatedContestQuestionsObj);
        else
            callback(err, null);
    });
}

//get content questions details by contest question id
var findContestQuestionsById = function (contestQuestionsId, cb) {
    ContestQuestions.findById({ _id: contestQuestionsId }, (err, contestQuestionsDetailsObj) => {
        if (err) {
          return cb(err, null);
        } else {
           return cb(null, contestQuestionsDetailsObj);
        }
    });
}

var contestQuestionsServices = {
    saveContestQuestions: saveContestQuestions,
    updateContestQuestions: updateContestQuestions,
    findContestQuestionsById: findContestQuestionsById
}

module.exports = contestQuestionsServices;






































































































































































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