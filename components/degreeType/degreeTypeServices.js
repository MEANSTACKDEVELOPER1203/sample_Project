let  DegreeType = require('./degreeTypeModel');

var createDegreeType = function (postFeedbackObj, callback) {
    var newDegreeTypeObj = new DegreeType({
        degreeTypeName:postFeedbackObj.degreeTypeName
    });
    DegreeType.create(newDegreeTypeObj,(err, newDegreeTypeObj) => {
        if (!err)
            callback(null, newDegreeTypeObj);
        else
            callback(err, null);
    });
}

var updateDegreeType = function(degreeTypeId, updateDegreeType, callback) {
    updateDegreeType.updatedDate = new Date();
    DegreeType.findByIdAndUpdate(degreeTypeId, { $set: updateDegreeType },{new:true},(err, updatedDegreeType) => {
        if (!err)
            callback(null, updatedDegreeType);
        else
            callback(err, null);
    });
}

var getAllDegreeType = function(callback) {
    DegreeType.find({},{degreeTypeName:1},(err, getAllDegreeType) => {
        if (!err)
            callback(null, getAllDegreeType);
        else
            callback(err, null);
    }).sort({degreeTypeName:1});
}

var getDegreeTypeById = function (degreeTypeId, callback) {
    DegreeType.findById(degreeTypeId,{degreeTypeName:1},(err, degreeTypeDetails) => {
        if (!err)
            callback(null, degreeTypeDetails);
        else
            callback(err, null);
    });
}

var degreeTypeServices = {
    createDegreeType:createDegreeType,
    updateDegreeType:updateDegreeType,
    getAllDegreeType:getAllDegreeType,
    getDegreeTypeById:getDegreeTypeById
}

module.exports = degreeTypeServices;
