let mongoose = require('mongoose');

var commentFeedbackSchema = new mongoose.Schema({
    commentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'mediaTracking',
        required: true
    },
    feedbackPostedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    feedbackItemID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'commentFeedback',
        required: true
    },
    createdDate:{
        type:Date,
        default: Date.now
    },
    updatedDate:{
        type:Date,
        default: Date.now
    },
    remark:{
        type:String,
        default: ""
    },
},{
    versionKey:false
});

let collName = "feedCommentFeedbacks";
let feedCommentFeedbacks = mongoose.model('feedCommentFeedbacks', commentFeedbackSchema, collName);
module.exports = feedCommentFeedbacks;