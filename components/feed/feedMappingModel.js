let mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;

let feedMappingSchema = new mongoose.Schema({
    memberId: mongoose.Schema.Types.ObjectId,
    currentSeenFeedDate: {
        type: Date,
        default: new Date()
    },
    lastSeenFeedDate: {
        type: Date,
        default: new Date(),
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    status: {
        type: String,
        default: "Active"
    }

}, { versionKey: false });

let collName = "feedMapping";
let FeedMapping = mongoose.model('FeedMapping', feedMappingSchema, collName);
module.exports = FeedMapping;

module.exports.findFeedMappingByMemberId = function (memberId, callback) {
    FeedMapping.findOne({ memberId: memberId }, (err, feedMappingObj) => {
        if (!err)
            callback(null, feedMappingObj);
        else
            callback(err, null)
    });
}
module.exports.saveFeedMapping = function (memberId, callback) {
    let curreTime = new Date();
    let feedMappingInfo = new FeedMapping({
        memberId: memberId,
        currentSeenFeedDate: curreTime,
        lastSeenFeedDate: curreTime
    });
    FeedMapping.create(feedMappingInfo, (err, createdFeedMappingObj) => {
        if (!err)
            callback(null, createdFeedMappingObj);
        else
            callback(err, null)
    });
}

module.exports.findOneAndDeleteObject = function (memberId, callback) {
    FeedMapping.findOne({ memberId: memberId }, (err, feedMappingObj) => {
        if (err)
            callback(err, null)
        else {
            let createdFeedMappingDate = new Date(feedMappingObj.createdAt)
            FeedMapping.updateOne({ memberId: memberId }, { $set: { lastSeenFeedDate: createdFeedMappingDate, currentSeenFeedDate: createdFeedMappingDate } }, (err, deletedObj) => {
                if (!err)
                    callback(null, deletedObj);
                else
                    callback(err, null)
            });
        }
    })
    // FeedMapping.updateOne({ memberId: memberId }, { $set: { lastSeenFeedDate: curreTime, currentSeenFeedDate: curreTime } }, (err, deletedObj) => {
    //     if (!err)
    //         callback(null, deletedObj);
    //     else
    //         callback(err, null)
    // })
    // FeedMapping.remove({ memberId: memberId }, (err, deletedObj) => {
    //     if (!err)
    //         callback(null, deletedObj);
    //     else
    //         callback(err, null)
    // })
}
module.exports.saveFeedMappingData = function (feedMappingObj, callback) {
    let curreTime = new Date();
    let feedMappingInfo = new FeedMapping({
        memberId: feedMappingObj.memberId,
        currentSeenFeedDate: new Date(feedMappingObj.currentSeenFeedDate),
        lastSeenFeedDate: new Date(feedMappingObj.lastSeenFeedDate),
        createdAt: new Date(feedMappingObj.currentSeenFeedDate)
    });
    FeedMapping.create(feedMappingInfo, (err, createdFeedMappingObj) => {
        if (!err)
            callback(null, createdFeedMappingObj);
        else
            callback(err, null)
    });
}

module.exports.updateFeemMapping = function (feedMappingObj, callback) {
    //console.log("feedMappingObj", feedMappingObj);
    FeedMapping.findByIdAndUpdate(feedMappingObj.id, feedMappingObj, { new: true }, (err, updatedObj) => {
        //console.log(err);
        if (!err)
            callback(null, updatedObj);
        else
            callback(err, null)
    })
}






