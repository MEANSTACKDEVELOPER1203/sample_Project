let ObjectId = require('mongodb').ObjectId;
let  reportFeedback = require('./reportFeedbackModel');

var postFeedbackOnReport =  (postFeedbackObj, callback)=> {
    var newReportFeedbackObj = new reportFeedback({
        feedbackItem:postFeedbackObj.feedbackItem
    });
    reportFeedback.create(newReportFeedbackObj,(err, newReportFeedbackObj) => {
        if (!err)
            callback(null, newReportFeedbackObj);
        else
            callback(err, null);
    });
}

var getAllFeedbackItems = function(callback) {
    reportFeedback.find({},{feedbackItem:1,_id:1},(err,allFeedbackComment) => {
        if (!err)
            callback(null, allFeedbackComment);
        else
            callback(err, null);
    }).sort({feedbackItem :1});
}



var reportFeedbacServices = {
    postFeedbackOnReport:postFeedbackOnReport,
    getAllFeedbackItems:getAllFeedbackItems
}

module.exports = reportFeedbacServices;
