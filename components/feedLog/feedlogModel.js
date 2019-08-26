let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let follow;
let comment;
let bookmark;
let views;
let share;
let active;
let inactive;
let FeedlogSchema = new mongoose.Schema({
    feedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Feed',
        required: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    activities: {
        type: String,
        enum: [follow, comment, bookmark, views, share],
        required: true
    },
    isLike:{
        type:Boolean
    }, 
    source: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: [active, inactive],
        default: active
    },
    created_at: { 
        type: Date,
        default: Date.now 
    },
    updated_at: { 
        type: Date,
        default: Date.now 
    }
},{
    versionKey: false
});

let Feedlog = (module.exports = mongoose.model("Feedlog", FeedlogSchema));

// Create a Feedlog
module.exports.createFeedlog = function (Feedlog, callback) {
    Feedlog.save(callback);
};

// setFollow

module.exports.setFollow = function (id, callback) {
    Feedlog.findByIdAndUpdate(id, { $set: { "status": "inactive" } }, callback);
};

// setComment

module.exports.setComment = function (id, source, callback) {
    Feedlog.updateOne({ _id: id }, { $push: { source: source[0] } }, callback);
};

// setBookMark

module.exports.setBookMark = function (id, reqbody, callback) {
 Feedlog.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// setShare

module.exports.setShare = function (id, source, callback) {
    Feedlog.updateOne({ _id: id }, { $push: { source: source[0] } }, callback);
};

// Edit a Feedlog

module.exports.editFeedlog = function (id, reqbody, callback) {
    Feedlog.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getFeedlogById = function (id, callback) {
    Feedlog.findById(ObjectId(id), callback);
};


