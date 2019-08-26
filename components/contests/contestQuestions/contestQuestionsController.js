let contestQuestionsService = require("./contestQuestionsService");

// create contest questions object
var createContestQuestions = (req, res) => {
    contestQuestionsService.saveContestQuestions(req.body, (err, createdContestObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while creating the new Contest Questions Object."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Contest Questions object has created successfully."
            });
        }
    });
}

// update contest questions object
var updateContestQuestions = (req, res) => {
    contestQuestionsService.updateContestQuestions(req.params.contestQuestionsId, req.body, (err, updatedContestObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while updating the Contest questions."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Contest Questions object has been updated successfully."
            });
        }
    });
}
 
// get contest questions details by contest questions ID
var getContestQuestionsById = (req, res) => {
    contestQuestionsService.findContestQuestionsById(req.params.contestQuestionsId, (err, ContestQuestionsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest questions details."
            });
        } else {
            if(ContestQuestionsObj) {
                res.status(200).json({
                    success: 1,
                    contestQuestionsDetails: ContestQuestionsObj
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

var contestQuestionsController = {
    createContestQuestions: createContestQuestions,
    updateContestQuestions: updateContestQuestions,
    getContestQuestionsById: getContestQuestionsById
}

module.exports = contestQuestionsController;








































































































































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