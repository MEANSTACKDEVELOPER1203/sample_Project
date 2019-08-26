
//let applyAuditions = require("../applyAuditions/applyAuditionsservice");
let applyAuditions = require("../applyAuditions/applyAuditionsService");
let ObjectId = require('mongodb').ObjectId;

//let role = require("../roles/roleModel");
//let applyAuditions1 = require("../applyapplyAuditionss/applyAuditionsModel");

// create applyapplyAuditionss
var createApplyAuditions = (req, res) => {
    applyAuditions.saveApplyAuditions(req.body, (err, createApplyAuditionsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while creating the new applyAuditions."
            });
        }
        // console.log("P12",createApplyAuditionsObj)
        if (createApplyAuditionsObj) {
            if (createApplyAuditionsObj.success == 0) {
                res.status(200).json({
                    success: 0,
                    token:req.headers['x-access-token'],
                    message: createApplyAuditionsObj.message
                });
            }
            else {
                res.status(200).json({
                    success: 1,
                    message: "Successfully applied for the audition.",
                    token:req.headers['x-access-token'],
                    data: createApplyAuditionsObj.message
                });
            }
        }

    });
}

// update contest
var updateApplyAuditions = (req, res) => {
    applyAuditions.updateApplyAuditions(req.params.applyAuditionsId, req.body, (err, updateApplyAuditionsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while updating the Contest.",
                token:req.headers['x-access-token'],
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Auditions has updated successfully.",
                token:req.headers['x-access-token'],
                data: updateApplyAuditionsObj
            });
        }
    });
}

// get contest details by contest ID
var getApplyAuditionsById = (req, res) => {
    applyAuditions.findApplyAuditionsById(req.params.applyAuditionsId, (err, applyAuditionsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: applyAuditionsObj
            });
        }
    });
}

var getAllMembersForAuditionById = (req, res) => {
    let auditionId = (req.params.audition_Id) ? req.params.audition_Id : '';
    applyAuditions.findAllMemberDetailsById(ObjectId(auditionId), (err, listOfApplyAuditionObj) => {
        console.log(err)
        if (err) {
            res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while fetching the member detail " })
        } else if (!listOfApplyAuditionObj || listOfApplyAuditionObj == null) {
            return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "There are no applied yet!" });
        } else {
            return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfApplyAuditionObj });
        }
    });
}

var getAllApplyAuditionByMemberId = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    applyAuditions.findAllApplyAuditionByMemberId(ObjectId(memberId), (err, listOfMemberApplyAuditionObj) => {
        if (err) {
            console.log(err)
            return res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while fetching the apply audition by member id" })
        } else if (!listOfMemberApplyAuditionObj || listOfMemberApplyAuditionObj == null) {
            return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "You don't have applied any audition yet!" })
        } else {
            let currentTime = new Date();
            listOfMemberApplyAuditionObj.map((appliedAudition)=>{
                appliedAudition.auditionDetails.isExpired = (appliedAudition.auditionDetails    .auditionExipires < new Date()) ? true : false;
            })
            return res.json({ success: 1,token:req.headers['x-access-token'], data: listOfMemberApplyAuditionObj });
        }
    });
}
/// GET contest questions by Contest Name

//admin
var getAllMemberForApplyAuditionByRoleId = (req, res) => {
    let roleId = (req.params.role_Id) ? req.params.role_Id : '';
    applyAuditions.findAllMemberDetailsApplyForAudition(roleId, (err, listOfMemberApplyAuditionObjs) => {
        if (err) {
            return res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while fetching the roles by audtion id" });
        } else if (!listOfMemberApplyAuditionObjs || listOfMemberApplyAuditionObjs == null) {
            return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "There are no applied yet!" });
        } else {
            return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfMemberApplyAuditionObjs })
        }
    })
}

var getAllMemberForApplyAuditionByRoleIdWithLimit = (req, res) => {
    applyAuditions.getAllMemberForApplyAuditionByRoleIdWithLimit(req.params, (err, listOfMemberApplyAuditionObjs) => {
        if (err) {
            return res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while fetching the roles by audtion id" });
        } else if (!listOfMemberApplyAuditionObjs || listOfMemberApplyAuditionObjs == null) {
            return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "There are no applied yet!" });
        } else {
            return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfMemberApplyAuditionObjs })
        }
    })
}

var applyAuditionsController = {
    createApplyAuditions: createApplyAuditions,
    updateApplyAuditions: updateApplyAuditions,
    getApplyAuditionsById: getApplyAuditionsById,
    getAllMembersForAuditionById: getAllMembersForAuditionById,
    getAllApplyAuditionByMemberId: getAllApplyAuditionByMemberId,
    //admin
    getAllMemberForApplyAuditionByRoleIdWithLimit:getAllMemberForApplyAuditionByRoleIdWithLimit,
    getAllMemberForApplyAuditionByRoleId: getAllMemberForApplyAuditionByRoleId
}

module.exports = applyAuditionsController;








































































































































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