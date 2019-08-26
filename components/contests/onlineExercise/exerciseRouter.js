let ExerciseController = require('./exerciseController');
let express = require('express');
let router = express.Router();



router.post('/createExercise', ExerciseController.createExercise);
router.get('/getExerciseByExeType/:exercise_Type/:member_Id', ExerciseController.getExeciseByExeType);
router.get('/getQuestionByExeTypeId/:exerciseType_Id', ExerciseController.getAllQuestions)




router.post('/submitParticipated', ExerciseController.createParticipatedDetails);



















module.exports = router;












