let contestSubmissionService = require("../contestSubmissions/contestSubmissionsService");
let ContestSubmission = require("../contestSubmissions/contestSubmissionsModel");

// create contest submission object
var createContestSubmission = (req, res) => {
//console.log(req.body)
    for (let i = 0; i < req.body.selectedOptions.length; i++) {
        let reqbody = {};
        let selectedAnswer = req.body.selectedOptions[i];
        let correctAnswer = req.body.correctAnswers[i];
        if (selectedAnswer == correctAnswer) {
            ContestSubmission.create({
                contestId: req.body.contestId,
                memberId: req.body.memberId,
                questionId: req.body.questionIds[i],
                selectedOption: req.body.selectedOptions[i],
                correctAnswer: req.body.correctAnswers[i],
                submissionLocation: req.body.submissionLocation,
                result: "correct"
            });
        } else {
            ContestSubmission.create({
                contestId: req.body.contestId,
                memberId: req.body.memberId,
                questionId: req.body.questionIds[i],
                selectedOption: req.body.selectedOptions[i],
                correctAnswer: req.body.correctAnswers[i],
                submissionLocation: req.body.submissionLocation,
                result: "inCorrect"
            });
        }
    }
    res.status(200).json({
        success: 1,
        message: "You have completed the contest successfully."
    });

}

// update contest submission object
var updateContestSubmission = (req, res) => {
    contestSubmissionService.updateContestSubmission(req.params.contestSubmissionId, req.body, (err, updatedContestObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while updating the Contest Submission."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Contest Submission object has been updated successfully."
            });
        }
    });
}

// get contest submissions details by contest submission ID
var getContesSubmissionsById = (req, res) => {
    contestSubmissionService.findContestSubmissionById(req.params.contestSubmissionId, (err, contestSubmissionObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest submission details."
            });
        } else {
            if (contestSubmissionObj) {
                res.status(200).json({
                    success: 1,
                    contestSubmissionDetails: contestSubmissionObj
                });
            } else {
                res.status(200).json({
                    success: 0,
                    message: "Invalid Id / Not found"
                });
            }
        }
    });
}

var contestSubmissionsController = {
    createContestSubmission: createContestSubmission,
    updateContestSubmission: updateContestSubmission,
    getContesSubmissionsById: getContesSubmissionsById
}

module.exports = contestSubmissionsController;








































































































































/*var getUserProfile = (req, res) => {
    userService.getAllUserProfile((err, listOfUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while retrieving the user profile" });
        } else {
            res.status(200).json({ success: 1, data: listOfUserProfileObj });
        }
    });
}

var createUserProfile = (req, res) => {
    let userObj = req.body;
    let files = req.files;
    userObj.imageUrl = files[0].path;
    userObj.imageName = files[0].filename;
    req.body = userObj
    userService.saveUserProfile(req.body, (err, createdUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while creating user profile" });
        } else {
            res.status(200).json({ success: 1, data: createdUserProfileObj });
        }
    })
}

var updateUserProfile = (req, res) => {
    let userId = (req.params.user_Id) ? req.params.user_Id : '';
    userService.updateUserProfileById(userId, req.body, (err, updateUserObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while update user profile " + err.message });
        } else {
            res.status(200).json({ success: 1, data: updateUserObj });
        }
    });
}

var getUserProfileByDate = (req, res) =>{
   let createdDate = (req.params.createdDate) ? req.params.createdDate : '';
   userService.findUserByCreatedDate(createdDate, (err, userByDateObj)=>{
       if(err){
           res.status(404).json({success:0, message:"Error while retrieving user by date"});
       }else{
           res.status(200).json({success:1, data:userByDateObj});
       }

   });
}

var userProfile = {
    getUserProfile: getUserProfile,
    createUserProfile: createUserProfile,
    updateUserProfile: updateUserProfile,
    getUserProfileByDate: getUserProfileByDate
}


module.exports = userProfile;

*/