let ObjectId = require('mongodb').ObjectId;
let CommentFeedBack = require('./commentFeedbackModel');

var createCommentFeedback = function (commentFeedbackObj, callback) {
    var newCommentFeedbackObj = new CommentFeedBack({
        feedbackItem : commentFeedbackObj.feedbackItem
    });
    CommentFeedBack.create(newCommentFeedbackObj,(err, createdCommentFeedbackObj) => {
        if (!err)
            callback(null, createdCommentFeedbackObj);
        else
            callback(err, null);
    });
}

var updateCommentFeedback = function(commentFeedbackId, commentFeedbackObj, callback) {
    commentFeedbackObj.updatedDate = new Date();
    CommentFeedBack.findByIdAndUpdate(commentFeedbackId, { $set: commentFeedbackObj },{new:true},(err, updatedCommentFeedbackObj) => {
        if (!err)
            callback(null, updatedCommentFeedbackObj);
        else
            callback(err, null);
    });
}

var getAllFeedbackItems = function(callback) {
    CommentFeedBack.find({},{feedbackItem:1,_id:1},(err,allFeedbackComment) => {
        if (!err)
            callback(null, allFeedbackComment);
        else
            callback(err, null);
    }).sort({feedbackItem :1});
}

var getCommentFeedbackById = function (commentFeedbackId, callback) {
    CommentFeedBack.findById(commentFeedbackId,(err, commentFeedbackObj) => {
        if (!err)
            callback(null, commentFeedbackObj);
        else
            callback(err, null);
    });
}

var CommentFeedBackServices = {
    createCommentFeedback:createCommentFeedback,
    updateCommentFeedback:updateCommentFeedback,
    getAllFeedbackItems:getAllFeedbackItems,
    getCommentFeedbackById:getCommentFeedbackById
}

module.exports = CommentFeedBackServices;
