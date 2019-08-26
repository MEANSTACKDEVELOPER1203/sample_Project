let ExerciseType = require('./exerciseTypeModel');
let ExerciseQuestions = require('./exerciseQuestionsModel');
let ExerciseQuestionOptions = require('./exerciseQuestionOptionsModel');
let ExerciseAnswer = require('./exerciseAnswerModel');
let ObjectId = require('mongodb').ObjectId;

let saveExerciseType = function (exerciseTypObj, callback) {
    let exerciseTypeInfo = new ExerciseType({
        title: exerciseTypObj.title,
        description: exerciseTypObj.description,
        banner: exerciseTypObj.banner,
        exerciseType: exerciseTypObj.exerciseType,
        startDate: exerciseTypObj.startDate,
        endDate: exerciseTypObj.endDate,
        createdBy: exerciseTypObj.createdBy
    });
    ExerciseType.create(exerciseTypeInfo, (err, createdExeTypeObj) => {
        if (!err)
            callback(null, createdExeTypeObj);
        else
            callback(err, null)
    })
}

let saveQuestions = function (questionObjInfo, callback) {
    ExerciseQuestions.create(questionObjInfo, (err, createdQuestionObj) => {
        if (!err)
            callback(null, createdQuestionObj);
        else
            callback(err, null);
    });
}

let saveExerciseOptions = function (optionsArray, callback) {
    ExerciseQuestionOptions.insertMany(optionsArray, (err, createdOptionObj) => {
        if (!err)
            callback(null, createdOptionObj);
        else
            callback(err, null)
    });
}

let findExerciseType = function (query, callback) {
    ExerciseType.find(query, (err, listOfExeTypeObj) => {
        if (!err)
            callback(null, listOfExeTypeObj);
        else
            callback(err, null)
    }).sort({ createdDate: -1 });
}

let findAnswersByExeTypeId = function (exeTypeId, callback) {
    exeTypeId = ObjectId(exeTypeId);
    ExerciseAnswer.aggregate([
        {
            $match: {
                exerciseTypeId: exeTypeId
            }
        },
        { "$group": { "_id": { memberId: "$memberId" } } }
    ], function (err, listOfExerciseAnsObj) {
        if (!err)
            callback(null, listOfExerciseAnsObj);
        else
            callback(err, null);
    })
}

let findQuestionByExeTypeId = function (exeTypeId, callback) {
    ExerciseQuestions.find({ exerciseTypeId: exeTypeId }, (err, listOfQuesObj) => {
        if (!err)
            callback(null, listOfQuesObj);
        else
            callback(err, null)
    });
}

let findOptions = function (questionId, callback) {
    ExerciseQuestionOptions.find({ questionId: questionId }, (err, listOfOptions) => {
        if (!err)
            callback(null, listOfOptions);
        else
            callback(err, null)
    })
}




let exerciseTypService = {
    saveExerciseType: saveExerciseType,
    saveQuestions: saveQuestions,
    saveExerciseOptions: saveExerciseOptions,
    findExerciseType: findExerciseType,
    findAnswersByExeTypeId: findAnswersByExeTypeId,
    findQuestionByExeTypeId: findQuestionByExeTypeId,
    findOptions: findOptions
}
module.exports = exerciseTypService;