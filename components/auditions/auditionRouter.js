const express = require('express');
let router = express.Router();
let auditionController = require("../auditions/auditionController");


// register a audition
router.post('/create', auditionController.createAudition);
// update a audition by auditionId
router.put('/update/:auditionId', auditionController.updateAudition);
// get audition by auditionId
router.get('/getAuditionById/:auditionId', auditionController.getAuditionById);
// search by role
router.get('/getRoleByString/:text/:memberId', auditionController.getRoleByString);
// search by HairColour
router.get('/getSearchByString/:text/:gender/:eyeColour/:hairColour/:bodyType/:ethnicity/:ageStart/:ageEnd/:startHeight/:endHeight/:memberId', auditionController.getRoleByAllFilters);
// search by BodyType
router.get('/getBodyTypeByString/:text', auditionController.getBodyTypeByString);
// search by BodyType
router.get('/getKeywordsByString/:text', auditionController.getKeywordsByString);
// search by eyeColour
router.get('/getEyeColourByString/:text', auditionController.getEyeColourByString);
router.get('/getDrafts', auditionController.getDrafts);
router.get('/getDrafts/:memberId', auditionController.getDraftsByMemberId);
//get member audition by member id
router.get('/getAuditionByMemberId/:member_Id', auditionController.getAuditionByMemberId);
router.get('/getPublishedDocuments', auditionController.getPublishedDocuments);

//get audition and roles based on IDS
router.get('/getAuditionAndRolesById/:audition_Id/:role_Id', auditionController.getAllAuditionAndRolesByIds);
router.get('/getAuditionAndRolesById/:audition_Id/:role_Id/:memberId', auditionController.getAllAuditionAndRolesByIds);

//admin
//get all audition 
router.get('/getAllAudition', auditionController.getAllAudition);
router.get('/getAllAudition/:pageNo/:limit', auditionController.getAllAuditionByLimit);
router.get('/getAllFavouriteAuditions', auditionController.getAllFavouriteAuditions);



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