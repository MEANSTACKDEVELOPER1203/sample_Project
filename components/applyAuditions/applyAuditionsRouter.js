const express = require('express');
let router = express.Router();
let applyAuditionsController = require("../applyAuditions/applyAuditionsController");


// register a applyAuditions
router.post('/create', applyAuditionsController.createApplyAuditions);
// update a applyAuditions by applyAuditionsId
router.put('/update/:applyAuditionsId', applyAuditionsController.updateApplyAuditions);
// get applyAuditions by applyAuditionsId
router.get('/getApplyAuditionsById/:applyAuditionsId', applyAuditionsController.getApplyAuditionsById);
//get member details who have applied for audition? by audition id
router.get('/getAllMembersForAuditionById/:audition_Id', applyAuditionsController.getAllMembersForAuditionById);
// get all apply audition applied by member.
router.get('/getAllApplyAuditionByMemberId/:member_Id', applyAuditionsController.getAllApplyAuditionByMemberId);


//admin
router.get('/getAllMemberForApplyAuditionByRoleId/:role_Id', applyAuditionsController.getAllMemberForApplyAuditionByRoleId);

router.get('/getAllMemberForApplyAuditionByRoleId/:role_Id/:createdAt/:limit', applyAuditionsController.getAllMemberForApplyAuditionByRoleIdWithLimit);
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