let mongoose = require("mongoose");

let activityLogSchema = new mongoose.Schema({
    memberId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    activityOn :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    activityLogTypeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'activityLogTypes'
    },
    auditionId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'audition'
    },
    mediaId: {
        type:mongoose.Schema.Types.ObjectId
    },
    roleId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'role'
    },
    feedId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'feeds'
    },
    scheduleId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'slotMaster'
    },
    slotId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'slotMaster'
    },
    commentId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'mediaTracking'
    },
    likeId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'mediaTracking'
    },
    activityType:{
        type:String
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    isViewed:{
        type:Boolean,
        default:false,
    }
},{
    versionKey: false
});

let collName = "activityLogs";
let activityLog = mongoose.model('activityLogs', activityLogSchema, collName);
module.exports = activityLog;
