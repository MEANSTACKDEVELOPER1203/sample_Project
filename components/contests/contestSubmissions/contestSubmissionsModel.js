let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId

var ContestSubmissionsSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedOption: {
        type: Array,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    result: {
        type: String,
        enum: ["correct", "inCorrect"],
        default: ""
    },
    submissionLocation: {
        type: String,
        default : ""
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

let collName = "ContestSubmissions";
let ContestSubmissions = mongoose.model('ContestSubmissions', ContestSubmissionsSchema, collName);
module.exports = ContestSubmissions;