let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId

var ContestEntriesSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    bannerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    memberContestCode: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "inActive"],
        default: "active"
    },
    isDeleted: {
        type: Boolean,
        default: "false"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
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
    }
}, {
    versionKey: false
});

let collName = "ContestEntries";
let ContestEntries = mongoose.model('ContestEntries', ContestEntriesSchema, collName);
module.exports = ContestEntries;

module.exports.createContestEntry = function (newContestEntry, callback) {
    newContestEntry.save(callback);
  };