let contestService = require("../contest/contestService");
let contestQuestionsService = require("../contestQuestions/contestQuestionsService");


// create contest
var createContest = (req, res) => {
    contestService.saveContest(req.body, (err, createdContestObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while creating the new Contest."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Contest has created successfully."
            });
        }
    });
}

// update contest
var updateContest = (req, res) => {
    contestService.updateContest(req.params.contestId, req.body, (err, updatedContestObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while updating the Contest."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Contest has updated successfully."
            });
        }
    });
}

// get contest details by contest ID
var getContestById = (req, res) => {
    contestService.findContestById(req.params.contestId, (err, ContestObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                contestDetails: ContestObj
            });
        }
    });
}

// get contest questions for a contest
var getContestQuestions = (req, res) => {
    contestService.findContestQuestions(req.params.contestId, (err, ContestQuestionsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
           // console.log('/////////////// contest questions /////////////////')
            if (ContestQuestionsObj == 'undefined' || ContestQuestionsObj.length == 0 || ContestQuestionsObj == null) {
                res.status(200).json({
                    success: 0,
                    message: "No questions exist for the Contest!"
                });
            } else {
                //console.log(ContestQuestionsObj);
                var arrayNum = ContestQuestionsObj[0].contestQuestions;
                var selected = [];
                for (var i = 0; i < 3; i++) {
                    rand();
                }

                ContestQuestionsObj[0]['contestQuestions'] = selected;

                function rand() {
                    var ran = arrayNum[Math.floor(Math.random() * arrayNum.length)];
                    if (selected.indexOf(ran) == -1)
                        selected.push(ran);
                    else
                        rand();
                }
                res.status(200).json({
                    success: 1,
                    contestDetails: ContestQuestionsObj
                });
            }
        }
    });
}

/// GET contest questions by Contest Name

// get contest questions for a contest
var getContestQuestionsByContestCode = (req, res) => {
    contestService.findContestQuestionsByContestCode(req.params.contestCode, (err, ContestQuestionsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            if (ContestQuestionsObj == 'undefined' || ContestQuestionsObj.length == 0 || ContestQuestionsObj == null || ContestQuestionsObj.message == 'No questions exist for the Contest!') {
                res.status(200).json({
                    success: 0,
                    message: "No questions exist for the Contest!"
                });
            } else {
                var arrayNum = ContestQuestionsObj[0].contestQuestions;
                var selected = [];
                for (var i = 0; i < 3; i++) {
                    rand();
                }

                ContestQuestionsObj[0]['contestQuestions'] = selected;

                function rand() {
                    var ran = arrayNum[Math.floor(Math.random() * arrayNum.length)];
                    if (selected.indexOf(ran) == -1)
                        selected.push(ran);
                    else
                        rand();
                }
                res.status(200).json({
                    success: 1,
                    contestDetails: ContestQuestionsObj
                });
            }
        }
    });
}


var contestController = {
    createContest: createContest,
    updateContest: updateContest,
    getContestById: getContestById,
    getContestQuestions: getContestQuestions,
    getContestQuestionsByContestCode: getContestQuestionsByContestCode
}

module.exports = contestController;








































































































































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