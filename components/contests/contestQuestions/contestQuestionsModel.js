let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId

var ContestQuestionsSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId
    },
    questionType: {
        type: String,
        enum: ["multipleChoice", "Boolean", "text", "checkbox", "radio"],
        default: "multipleChoice"
    },
    question: {
        type: String,
        default: ""
    },
    questionHint: {
        type: String,
        default: ""
    },
    questionOptions: {
        type: Array,
        default: []
    },
    correctAnswer: {
        type: String,
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

let collName = "ContestQuestions";
let ContestQuestions = mongoose.model('ContestQuestions', ContestQuestionsSchema, collName);
module.exports = ContestQuestions;