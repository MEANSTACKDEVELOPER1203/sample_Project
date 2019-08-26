//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let Contest = require("../contest/contestModel");
let ContestQuestions = require("../contestQuestions/contestQuestionsModel");

var saveContest = function (contestObj, callback) {
    var contestObj = new Contest({
        contestName: contestObj.contestName,
        contestCode: contestObj.contestCode,
        contestDescription: contestObj.contestDescription,
        contestCoverPicPath: contestObj.contestCoverPicPath
    });
    Contest.create(contestObj, (err, createdContestObj) => {
        if (!err)
            callback(null, createdContestObj);
        else
            callback(err, null);
    });
}

var updateContest = function (contestId, contestObj, callback) {
    Contest.findByIdAndUpdate(contestId, contestObj, (err, updatedContestObj) => {
        if (!err)
            callback(null, updatedContestObj);
        else
            callback(err, null);
    });
}

//get content details by contest id
var findContestById = function (contestId, cb) {
    Contest.findById({
        _id: contestId
    }, (err, contestDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, contestDetailsObj);
        }
    });
}

// get contest questions for a contest ID

var findContestQuestions = function (contestId, cb) {
    Contest.aggregate([{
            $match: {
                _id: ObjectId(contestId)
            }
        },
        {
            $lookup: {
                from: "ContestQuestions",
                localField: "_id",
                foreignField: "contestId",
                as: "contestQuestions"
            }
        },
        {
            $sample: {
                size: 2
            }
        },
        // {
        //     $project: {
        //         _id: 1,
        //         isLike: 1,
        //         createdDate:1,
        //         "memberProfile._id": 1,
        //         "memberProfile.userName": 1,
        //         "memberProfile.profilePicPath": 1,
        //     }
        // }
    ], function (err, ContestQuestionsObj) {
        if (!err)
            cb(null, ContestQuestionsObj);
        else
            cb(err, null);
    })
}

/// Get contest questions by contest name

// get contest questions for a contest ID by ContestCode

var findContestQuestionsByContestCode = function (contestCode, cb) {
    Contest.findOne({
        contestCode: contestCode
    }, (err, contestDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            if (contestDetailsObj == 'undefined' || contestDetailsObj == null || contestDetailsObj.length == 0) {
                callback(null, {"message" : "No questions exist for the Contest!"})
            } else {
                Contest.aggregate([{
                        $match: {
                            _id: ObjectId(contestDetailsObj._id)
                        }
                    },
                    {
                        $lookup: {
                            from: "ContestQuestions",
                            localField: "_id",
                            foreignField: "contestId",
                            as: "contestQuestions"
                        }
                    },
                ], function (err, ContestQuestionsObj) {
                    if (!err)
                        cb(null, ContestQuestionsObj);
                    else
                        cb(err, null);
                })
            }
        }
    });
}

var contestServices = {
    saveContest: saveContest,
    updateContest: updateContest,
    findContestById: findContestById,
    findContestQuestions: findContestQuestions,
    findContestQuestionsByContestCode: findContestQuestionsByContestCode
}

module.exports = contestServices;






































































































































































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