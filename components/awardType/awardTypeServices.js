let ObjectId = require('mongodb').ObjectId;
let  AwardTypeModel = require('./awardTypeModel');

var createAwardType = function (newAwardTypeObj, callback) {
    var newCreatedAwardTypeObj = new AwardTypeModel({
        awardTypeName:newAwardTypeObj.awardTypeName,
    });
    AwardTypeModel.create(newCreatedAwardTypeObj,(err, newCreatedAwardTypeObj) => {
        if (!err)
            callback(null, newCreatedAwardTypeObj);
        else
            callback(err, null);
    });
}

var updateAwardType = function(awardTypeId, updateAwardTypeObj, callback) {
    updateAwardTypeObj.updatedDate = new Date();
    AwardTypeModel.findByIdAndUpdate(awardTypeId, { $set: updateAwardTypeObj },{new:true},(err, updatedAwardTypeObj) => {
        if (!err)
            callback(null, updatedAwardTypeObj);
        else
            callback(err, null);
    });
}

var getAllAwardType = function(callback) {
    AwardTypeModel.find({},{awardTypeName:1},(err, allAwardType) => {
        if (!err)
            callback(null, allAwardType);
        else
            callback(err, null);
    }).sort({awardTypeName:1});
}

var getAwardTypeById = function (awardTypeId, callback) {
    AwardTypeModel.findById(awardTypeId,{awardTypeName:1},(err, awardDetails) => {
        if (!err)
            callback(null, awardDetails);
        else
            callback(err, null);
    });
}

var awardTypeServices = {
    createAwardType:createAwardType,
    updateAwardType:updateAwardType,
    getAllAwardType:getAllAwardType,
    getAwardTypeById:getAwardTypeById
}

module.exports = awardTypeServices;
