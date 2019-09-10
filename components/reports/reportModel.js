let mongoose = require('mongoose');

var reportSchema = new mongoose.Schema({
    memberId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    feedId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Feed'
    },
    reportReasonId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'reportFeedbacks'
    },
    createdDate:{
        type:Date,
        default: Date.now
    },
    updatedDate:{
        type:Date,
        default: Date.now
    },
    isDeleted:{
        type:Boolean,
        default: false
    }
},{
    versionKey:false
});

let collName = "reports";
let feedCommentFeedbacks = mongoose.model('reports', reportSchema, collName);
module.exports = feedCommentFeedbacks;