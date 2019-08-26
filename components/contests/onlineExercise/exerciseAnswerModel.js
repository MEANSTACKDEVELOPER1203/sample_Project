
let mongoose = require('mongoose');

var exerciseAnswerSchema = new mongoose.Schema({
    memberId: mongoose.Schema.Types.ObjectId,
    exerciseTypeId: mongoose.Schema.Types.ObjectId,
    questionId: mongoose.Schema.Types.ObjectId,
    selectedOption: {
        type: Array
    },
    isText: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    submitedDate: {
        type: Date, default: Date.now
    },
    submitedBy: {
        type: String
    }
},
    {
        versionKey: false
    });

let collName = "exerciseAnswers";
var ExerciseAnswer = mongoose.model('ExerciseAnswer', exerciseAnswerSchema, collName);
module.exports = ExerciseAnswer;

