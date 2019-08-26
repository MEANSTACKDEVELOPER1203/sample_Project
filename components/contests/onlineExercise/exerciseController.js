let ExerciseService = require('./exerciseService');
let ExerciseQuestions = require('./exerciseQuestionsModel');
let async = require('async');
let ObjectId = require('mongodb').ObjectId;
let createExercise = (req, res) => {
    //console.log(req.body);
    if (req.body.exerciseType == "Voting") {
        ExerciseService.saveExerciseType(req.body, (err, createdExeTypeObj) => {
            if (err) {
                return res.status(404).json({ success: 0, message: "Error while creatin the Exe. type" });
            } else {
                if (createdExeTypeObj.exerciseType == "Voting") {
                    let quesAndOptions = req.body.questionsAndOptions;
                    //console.log(quesAndOptions.length)
                    async.forEachSeries((quesAndOptions), function (ques, callback) {
                        let questionInfo = new ExerciseQuestions({
                            exerciseTypeId: createdExeTypeObj._id,
                            question: ques.question,
                            optionType: ques.optionType,
                            createdBy: ques.createdBy,
                            createdBy: req.body.createdBy
                        });
                        //save questions here
                        ExerciseService.saveQuestions(questionInfo, (err, createdQuesObj) => {
                            if (err) {
                                callback(err, null);
                            } else {
                                let optionsArray = [];
                                (ques.options).forEach(opt => {
                                    optionsArray.push({
                                        questionId: createdQuesObj._id,
                                        option: opt.option,
                                        isAnswer: opt.isAnswer,
                                        createdBy: req.body.createdBy
                                    });
                                });
                                //save Options here
                                //console.log(optionsArray)
                                ExerciseService.saveExerciseOptions(optionsArray, (err, createdExeOptionsObj) => {
                                    if (err) {
                                        callback(err, null)
                                    } else {
                                        callback(null, createdExeOptionsObj)
                                    }
                                });
                            };
                        });

                    }, function (err, results) {
                        if (!err)
                            return res.status(200).json({ success: 1, message: "Created Successfully" });
                        return res.status(404).json({ success: 0, message: "Error while create the Contest" });
                    });
                }
            }
        });

    } else {
        return res.status(200).json({ success: 0, message: "Please Enter the valid exercise type!" })
    }

}

let getExeciseByExeType = (req, res) => {
    let exerciseType = (req.params.exercise_Type) ? req.params.exercise_Type : '';
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let query = {};
    if (exerciseType == "0")
        query = { isDeleted: false }
    else
        query = { exerciseType: exerciseType, isDeleted: false };
    ExerciseService.findExerciseType(query, (err, listOfExerciseTypeObj) => {
        if (err)
            return res.status(404).json({ success: 0, message: "Error while fetching the exercise types" });
        else if (listOfExerciseTypeObj.lenth < 0)
            return res.status(200).json({ success: 0, message: "record not found" });
        else {
            function foo(cb) {
                let results = [];
                listOfExerciseTypeObj.forEach(p => {
                    let exeTypeObj = {};
                    exeTypeObj._id = p._id;
                    exeTypeObj.title = p.title;
                    exeTypeObj.description = p.description;
                    exeTypeObj.startDate = p.startDate;
                    exeTypeObj.endDate = p.endDate;
                    exeTypeObj.exerciseTypeId = p._id;
                    exeTypeObj.status = p.status;
                    exeTypeObj.isDeleted = p.isDeleted;
                    exeTypeObj.createdDate = p.createdDate;
                    exeTypeObj.createdBy = p.createdBy;
                    let exeTypeId = p._id;

                    ExerciseService.findAnswersByExeTypeId(exeTypeId, function (err, listOfexeAnsObj) {
                        if (err)
                            cb(err, null);
                        else {
                            //console.log(listOfexeAnsObj);
                            let partcipentsCount = listOfexeAnsObj.length;
                            let key = 0;
                            listOfexeAnsObj.forEach(d => {
                                if ("" + d._id.memberId == memberId)
                                    key = 1;
                            });
                            Object.assign(exeTypeObj, { "isModerated": key })
                            Object.assign(exeTypeObj, { "partcipentsCount": partcipentsCount });
                            results.push(exeTypeObj);
                            if (results.length == listOfExerciseTypeObj.length)
                                cb(null, results)
                        }
                    })
                });

            }
            foo(function (err, resultArr) {
                if (err) {
                    return res.status(200).json({ success: 0, message: `Fail to fetch activities ${err}` });
                } else {
                    resultArr.sort(function (x, y) {
                        return x.endDate - y.endDate;
                    });
                    return res.status(200).json({ success: 1, data: resultArr });
                }


            });
            //return res.status(200).json({ success: 1, data: listOfExerciseTypeObj })
        }

    });
}

let getAllQuestions = (req, res) => {
    let exerciseTypeId = (req.params.exerciseType_Id) ? req.params.exerciseType_Id : '';
    ExerciseService.findQuestionByExeTypeId(ObjectId(exerciseTypeId), (err, listOfQuestionObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the question" });
        } else if (listOfQuestionObj.length < 0) {
            return res.status(200).json({ success: 0, message: "record not found " });
        } else {
            function foo(cb) {
                let results = [];
                listOfQuestionObj.forEach(e => {
                    if (!e || e == "")
                        return res.status(200).json({ success: 0, messages: 'no exercise found' });
                    else {
                        //find options for individual question
                        ExerciseService.findOptions(e._id, function callback(err, listOfOptionsObj) {
                            if (err)
                                cb(err, null);
                            else {
                                let questionsAndOptions = [];
                                let prepareQusOpts = [];
                                let prepareQusOpt = {};
                                //console.log(exerciseAnswersObj);
                                //prepareQusOpt.participents = exerciseAnswersObj.length;
                                prepareQusOpt.questionId = e._id
                                prepareQusOpt.exerciseTypeId = e.exerciseTypeId
                                prepareQusOpt.createdDate = e.createdDate
                                prepareQusOpt.optionType = e.optionType
                                prepareQusOpt.question = e.question
                                listOfOptionsObj.forEach(d => {
                                    let optionObj = {};
                                    optionObj.option_id = d._id;
                                    optionObj.option = d.option;
                                    prepareQusOpts.push(optionObj);
                                })
                                prepareQusOpt.questionOptions = prepareQusOpts;
                                // questionsAndOptions.push(prepareQusOpt);
                                // console.log(prepareQusOpt);
                                //console.log(listOfQuestionObj.length);
                                results.push(prepareQusOpt);
                                if (listOfQuestionObj.length == results.length) {
                                    results.sort(function (x, y) {
                                        return x.createdDate - y.createdDate;
                                    });
                                    cb(null, results);
                                }
                            }
                        })
                    }
                })
            } foo(function (err, resultArr) {
                if (err)
                    return res.status(200).json({ success: 0, message: `Fail to fetch activities ${err}` });
                return res.status(200).json({ success: 1, data: resultArr });
            });
        }
    })
}

let createParticipatedDetails = (req, res) => {
    console.log(req.body);
    res.json({ success:0 });
}











let exerciseController = {
    createExercise: createExercise,
    getExeciseByExeType: getExeciseByExeType,
    getAllQuestions: getAllQuestions,
    createParticipatedDetails: createParticipatedDetails

}
module.exports = exerciseController