const express = require('express');
let multer = require('multer');
var FileReader = require('filereader')
let router = express.Router();
let roleController = require("../roles/roleController");


// register a role
router.post('/create', roleController.createRole);
// update a role by roleId
router.put('/update/:roleId', roleController.updateRole);
// get role by roleId
router.get('/getroleById/:roleId', roleController.getRoleById);
//share APi get data of audition and role
router.get('/shareRole/:roleId', roleController.shareRole);

// get seperate role based on audition id
router.get('/getRolesByAuditionId/:audition_Id', roleController.getRolesByAuditionId);
//get role based on hair style (color);
router.get('/getRolesByHairColor', roleController.getRolesByHairColor);

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