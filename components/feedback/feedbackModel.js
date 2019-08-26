let mongoose = require('mongoose');
let feedbackSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    celebrityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reason: {
        type: String
    },
    feedback: {
        type: String,
        default:""
    },
    lastTimeUnBlocked: {
        type: Date
    },
    createdDate: {
        type: Date,
        default: new Date()
    },
    createdBy: {
        type: String,
    },
    updatedDate: {
        type: Date,
        default: new Date()
    },
    updatedBy: {
        type: String,
    },
    status:{
        type:String,
        default:"Active"
    }
}, {
        versionKey: false
    });
let collName = "feedback";
let FeedBack = mongoose.model('FeedBack', feedbackSchema, collName);
module.exports = FeedBack;