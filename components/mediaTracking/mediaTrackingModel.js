let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let follow;
let comment;
let bookmark;
let views;
let share;
let active;
let inactive;
let mediaTrackingSchema = new mongoose.Schema({
    feedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feed',
        index: true
    },
    mediaId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    activities: {
        type: String,
        enum: [follow, comment, bookmark, views, share]
    },
    isLike: {
        type: Boolean
    },
    description: {
        type: String,
    },
    source: {
        type: String

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
    },
    createdBy: {
        type: String,
        default: ""
    },
    updatedBy: {
        type: String,
        default: ""
    },
}, {
        versionKey: false,
        autoIndex: true
    });
mediaTrackingSchema.index({ feedId: 1 }, { unique: true });
let mediaTracking = (module.exports = mongoose.model("mediaTracking", mediaTrackingSchema));


module.exports.createMediaTracking = function (newMediaTracking, callback) {
    newMediaTracking.save(callback);
};

// setFollow

module.exports.setFollow = function (id, callback) {
    mediaTracking.findByIdAndUpdate(id, { $set: { "status": "inactive" } }, callback);
};

// setComment

module.exports.setComment = function (id, source, callback) {
    mediaTracking.updateOne({ _id: id }, { $push: { source: source[0] } }, callback);
};

// setBookMark

module.exports.setBookMark = function (id, reqbody, callback) {
    mediaTracking.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// setShare

module.exports.setShare = function (id, source, callback) {
    mediaTracking.updateOne({ _id: id }, { $push: { source: source[0] } }, callback);
};

// Edit a mediaTracking

module.exports.editMediaTracking = function (id, reqbody, callback) {
    mediaTracking.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getMediaTrackingById = function (id, callback) {
    mediaTracking.findById(ObjectId(id), callback);
};


/*************************** Services P-K *************************** */

// isLiked by current usser
module.exports.findIsLiked = function (mediaTrackingObj, callback) {
    if (mediaTrackingObj.mediaId) {
        mediaTracking.find({ memberId: ObjectId(mediaTrackingObj.memberId), mediaId: ObjectId(mediaTrackingObj.mediaId), activities: "views" }, (err, islikedObj) => {
            if (!err)
                callback(null, islikedObj);
            else
                callback(err, null);
        });
    }
    if (mediaTrackingObj.feedId) {
        mediaTracking.find({ memberId: ObjectId(mediaTrackingObj.memberId), feedId: ObjectId(mediaTrackingObj.feedId), activities: "views" }, (err, islikedObj) => {
            if (!err)
                callback(null, islikedObj);
            else
                callback(err, null);
        });
    }
}



//set like
module.exports.saveMedia = function (mediaTrackingObj, callback) {
    var mediaObj;
    if (mediaTrackingObj.feedId) {
        mediaObj = new mediaTracking({
            feedId: ObjectId(mediaTrackingObj.feedId),
            memberId: ObjectId(mediaTrackingObj.memberId),
            isLike: mediaTrackingObj.isLike,
            activities: mediaTrackingObj.activities,
            source: mediaTrackingObj.source,
            description: mediaTracking.description,
            createdDate: new Date(),
            status: "Active"
        });
    }
    else if (mediaTrackingObj.mediaId) {
        mediaObj = new mediaTracking({
            mediaId: ObjectId(mediaTrackingObj.mediaId),
            isLike: mediaTrackingObj.isLike,
            memberId: ObjectId(mediaTrackingObj.memberId),
            activities: mediaTrackingObj.activities,
            source: mediaTrackingObj.source,
            description: mediaTracking.description,
            createdDate: new Date(),
            status: "Active"
        })
    }

    mediaTracking.create(mediaObj, (err, mediaTrackingObj) => {
        if (!err)
            callback(null, mediaTrackingObj);
        else
            callback(err, null);
    });
}



//update media 
module.exports.updateMedia = function (mediaTrackingObj, callback) {

    if (mediaTrackingObj.feedId) {
        mediaTracking.updateOne({ memberId: mediaTrackingObj.memberId, feedId: mediaTrackingObj.feedId }, { isLike: mediaTrackingObj.isLike, updated_at: new Date(), created_at: new Date() }, (err, mediaTrackingObj) => {
            if (!err)
                callback(null, mediaTrackingObj);
            else
                callback(err, null);
        });
    }
    if (mediaTrackingObj.mediaId) {
        mediaTracking.updateOne({ memberId: mediaTrackingObj.memberId, mediaId: mediaTrackingObj.mediaId }, { isLike: mediaTrackingObj.isLike, updated_at: new Date(), created_at: new Date() }, (err, mediaTrackingObj) => {
            if (!err)
                callback(null, mediaTrackingObj);
            else
                callback(err, null);
        });
    }
}


//update comments by id
module.exports.updateCommentById = function (commentId, commentObj, callback) {
    mediaTracking.findByIdAndUpdate(commentId, { $set: { source: commentObj.source } }, { new: true }, (err, updateCommentObj) => {
        if (!err)
            callback(null, updateCommentObj);
        else
            callback(err, null);
    });
}

//delete comment by id
module.exports.deleteCommentById = function (commentId, callback) {
    mediaTracking.findByIdAndRemove(commentId, (err, deleteCommentObj) => {
        if (!err)
            callback(null, deleteCommentObj);
        else
            callback(err, null);
    })
}
module.exports.findCommentById = function (commentId, callback) {
    mediaTracking.findById(commentId, (err, deleteCommentObj) => {
        if (!err)
            callback(null, deleteCommentObj);
        else
            callback(err, null);
    })
}
/*************************** Services P-K *************************** */
