let ObjectId = require('mongodb').ObjectId;
let  reportModel = require('./reportModel');

var createReport = function (newreportObj, callback) {
    var newCreatedreportObj = new reportModel({
        reportReasonId:ObjectId(newreportObj.reportReasonId),
        memberId:ObjectId(newreportObj.memberId),
        feedId:ObjectId(newreportObj.feedId)
    });
    reportModel.create(newCreatedreportObj,(err, newCreatedreportObj) => {
        if (!err)
            callback(null, newCreatedreportObj);
        else
            callback(err, null);
    });
}

var updateReport = function(reportId, updatereportObj, callback) {
    updatereportObj.updatedDate = new Date();
    reportModel.findByIdAndUpdate(reportId, { $set: updatereportObj },{new:true},(err, updatedreportObj) => {
        if (!err)
            callback(null, updatedreportObj);
        else
            callback(err, null);
    });
}

var getAllReport = function(callback) {
    reportModel.find({},{reportName:1},(err, allreport) => {
        if (!err)
            callback(null, allreport);
        else
            callback(err, null);
    }).sort({reportName:1});
}

var getreportById = function (reportId, callback) {
    reportModel.findById(reportId,{reportName:1},(err, awardDetails) => {
        if (!err)
            callback(null, awardDetails);
        else
            callback(err, null);
    });
}

var reportServices = {
    createReport:createReport,
    updateReport:updateReport,
    getAllReport:getAllReport,
    getreportById:getreportById
}

module.exports = reportServices;
