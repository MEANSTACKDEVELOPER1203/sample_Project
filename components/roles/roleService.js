//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let role = require("../roles/roleModel");


var saveRole = function (roleObj, callback) {
    //console.log(roleObj);
    let newRoleObj = JSON.stringify(roleObj);

    role.insertMany(roleObj, (err, createroleObj) => {
        // console.log(err)
        if (!err)
            callback(null, createroleObj);
        else
            callback(err, null);
    });
}

var updateRole = function (roleId, roleObj, callback) {
    role.findByIdAndUpdate(roleId, roleObj, (err, updateroleObj) => {
        if (!err)
            callback(null, updateroleObj);
        else
            callback(err, null);
    });
}

//get content details by role id
var findRoleById = function (roleId, cb) {
    role.findById({
        _id: roleId
    }, (err, roleDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, roleDetailsObj);
        }
    });
}

//share and get content details by role 
var shareRoleById = function (roleId, cb) {
    role.findById(ObjectId(roleId), (err, roleDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            var returnObj = {
                "auditionId": roleDetailsObj.auditionId._id,
                "productionTitle": roleDetailsObj.auditionId.productionTitle,
                "productionType": roleDetailsObj.auditionId.productionType,
                "productionPersonName": roleDetailsObj.auditionId.productionPersonName,
                "productionDescription": roleDetailsObj.auditionId.productionDescription,
                "createdBy": roleDetailsObj.auditionId.createdBy,
                "auditionExipires": roleDetailsObj.auditionId.auditionExipires,
                "startDate": roleDetailsObj.auditionId.startDate,
                "productionCompany": roleDetailsObj.auditionId.productionCompany,
                "subProductionType": roleDetailsObj.auditionId.subProductionType,
                "_id": roleDetailsObj._id,
                "roleName": roleDetailsObj.roleName,
                "roleType": roleDetailsObj.roleType,
                "updatedBy": roleDetailsObj.updatedBy,
                "createdBy": roleDetailsObj.createdBy,
                "updatedAt": roleDetailsObj.updatedAt,
                "createdAt": roleDetailsObj.createdAt,
                "eyeColour": roleDetailsObj.eyeColour,
                "bodyType": roleDetailsObj.bodyType,
                "hairColour": roleDetailsObj.hairColour,
                "roleDescription": roleDetailsObj.roleDescription,
                "mediaRequired": roleDetailsObj.mediaRequired,
                "ethnicity":roleDetailsObj.ethnicity,
                "ageEnd": roleDetailsObj.ageEnd,
                "ageStart": roleDetailsObj.ageStart,
                "gender": roleDetailsObj.gender,
                // "startHeight":roleDetailsObj.gender,
                // "endHeight":roleDetailsObj.gender
            }
            return cb(null, returnObj);
        }
    }).populate('auditionId','productionTitle productionType productionPersonName productionDescription createdBy subProductionType productionCompany startDate auditionExipires');
}

var findRolesByAuditionId = function (auditionId, callback) {
    role.find({ auditionId: ObjectId(auditionId) }, (err, listOFRoles) => {
        if (!err)
            callback(null, listOFRoles);
        else
            callback(err, null)
    }).lean();
}


var findRoleByHairColor = function (callback) {
    role.find({
        $and : [
            { $or : [ { hairColour : "Black" }, { hairColour : "Dark Brown" },
            {hairColour:"Medium Brown"}, {hairColour:"Light Brown"},
            {hairColour:"Dark Blonde"}, {hairColour:"Medium Blonde"}, {hairColour:"Light Blonde"}] }
        ]
    }, (err, listOfRoles) => {
        if (!err)
            callback(null, listOfRoles);
        else
            callback(err, null);
    });
}

var roleServices = {
    saveRole: saveRole,
    updateRole: updateRole,
    findRoleById: findRoleById,
    findRolesByAuditionId: findRolesByAuditionId,
    findRoleByHairColor: findRoleByHairColor,
    shareRoleById:shareRoleById
}

module.exports = roleServices;






































































































































































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