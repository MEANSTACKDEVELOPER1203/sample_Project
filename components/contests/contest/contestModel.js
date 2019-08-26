let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId

var contestSchema = new mongoose.Schema({
    contestName: {
        type: String,
        required: true
    },
    contestCode: {
        type: String,
        required: true
    },
    contestDescription: {
        type: String,
        default: ""
    },
    contestCoverPicPath: {
        type: String,
        default: "uploads/avtars/default-avatar.png"
    },
    contestStartDate: {
        type: Date,
        default: ""
    },
    contestEndDate: {
        type: Date,
        default: ""
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

let collName = "contest";
let Contest = mongoose.model('Contest', contestSchema, collName);
module.exports = Contest;