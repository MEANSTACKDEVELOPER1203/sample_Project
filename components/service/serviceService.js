//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
//let service = require("../service/serviceModel");
let serviceTransaction = require("../../models/serviceTransaction");

var saveservice = function (serviceObj, callback) {
    //console.log(serviceObj);
    let newserviceObj = JSON.stringify(serviceObj);

    service.create(serviceObj, (err, createserviceObj) => {
        console.log(err)
        if (!err)
            callback(null, createserviceObj);
        else
            callback(err, null);
    });


}

var updateservice = function (serviceId, serviceObj, callback) {
    service.findByIdAndUpdate(serviceId, serviceObj, (err, updateserviceObj) => {
        if (!err)
            callback(null, updateserviceObj);
        else
            callback(err, null);
    });
}

//get content details by service id
var findserviceById = function (serviceId, cb) {
    service.findById({
        _id: serviceId
    }, (err, serviceDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, serviceDetailsObj);
        }
    });
}

var findservicesByAuditionId = function (auditionId, callback) {
    service.find({ auditionId: ObjectId(auditionId) }, (err, listOFservices) => {
        if (!err)
            callback(null, listOFservices);
        else
            callback(err, null)
    }).lean();
}

//       , 
//     ,

var findserviceByHairColor = function (callback) {
    service.find({
        $and : [
            { $or : [ { hairColour : "Black" }, { hairColour : "Dark Brown" },
            {hairColour:"Medium Brown"}, {hairColour:"Light Brown"},
            {hairColour:"Dark Blonde"}, {hairColour:"Medium Blonde"}, {hairColour:"Light Blonde"}] }
        ]
    }, (err, listOfservices) => {
        if (!err)
            callback(null, listOfservices);
        else
            callback(err, null);
    });
}

var serviceServices = {
    saveservice: saveservice,
    updateservice: updateservice,
    findserviceById: findserviceById,
    findservicesByAuditionId: findservicesByAuditionId,
    findserviceByHairColor: findserviceByHairColor
}

module.exports = serviceServices;






































































































































































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