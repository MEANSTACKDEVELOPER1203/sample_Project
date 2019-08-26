let mongoose = require('mongoose');

var exerciseQuestionOptionsSchema = mongoose.Schema({

    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exerciseQuestions",
        required: true
    },
    option: {
        type: String,
    },
    isAnswer: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date, default: Date.now
    },
    createdBy: {
        type: String
    },
    updatedDate: {
        type: Date
    },
    updatedBy: {
        type: String
    }
},
    {
        versionKey: false
    });

var collName = "questionOptions";
var questionOptions = mongoose.model('questionOptions', exerciseQuestionOptionsSchema, collName);

module.exports = questionOptions;