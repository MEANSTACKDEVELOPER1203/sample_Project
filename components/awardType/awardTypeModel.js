let mongoose = require('mongoose');

var awardTypeSchema = new mongoose.Schema({
    awardTypeName:{
        type:String,
        default: ""
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

let collName = "awardtypes";
let feedCommentFeedbacks = mongoose.model('awardtypes', awardTypeSchema, collName);
module.exports = feedCommentFeedbacks;