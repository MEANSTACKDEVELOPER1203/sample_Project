let mongoose = require('mongoose');

let single;
var exerciseQuestionSchema = new mongoose.Schema({

    exerciseTypeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"exerciseTypes",
        required:true
    },
    question:{
        type:String
    },
    optionType:{
        type: String,
        enum: [single],
        default: single
    },
    status:{
        type:Boolean,
        default: true
    },
    isDeleted:{
        type:Boolean,
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

var collName = "exerciseQuestions";
var exerciseQuestion = mongoose.model('exerciseQuestion', exerciseQuestionSchema, collName);

module.exports = exerciseQuestion;