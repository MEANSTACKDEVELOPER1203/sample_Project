const express = require('express');
let multer = require('multer');
var FileReader = require('filereader')
let router = express.Router();
let contestQuestionsController = require("./contestQuestionsController");


// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/contests");
    },
    filename: function (req, file, cb) {
        var today = new Date();
        var todayParse = Date.parse(today);
        todayParse = "" + todayParse;
        var todayParse = todayParse.substr(7);
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        cb(null, "cb" + "_" + date + "_" + todayParse + "_" + file.originalname);
    }
});

let upload = multer({
    storage: storage
});
// End of Multer Plugin Settings (Images Upload)

// register a contest questions document
router.post('/create', contestQuestionsController.createContestQuestions);
// update a contest questions by contest questions Id
router.put('/update/:contestQuestionsId', contestQuestionsController.updateContestQuestions);
// get contest questions by contestId
router.get('/getByContestQuestionsId/:contestQuestionsId', contestQuestionsController.getContestQuestionsById);


module.exports = router;





































































































































/*
//get all list of user
router.get('/getUserProfile', userController.getUserProfile);
//save user details
router.post('/createUserProfile', upload.any(), userController.createUserProfile);
//update user profile based on user id
router.put('/updateUserProfileById/:user_Id', userController.updateUserProfile);
//get user by register date
router.get('/getUserProfileByDate/:createdDate', userController.getUserProfileByDate);


module.exports = router;
*/