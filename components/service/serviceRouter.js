const express = require('express');
let multer = require('multer');
var FileReader = require('filereader')
let router = express.Router();
let serviceController = require("../service/serviceController");


// register a service
router.post('/create', serviceController.createservice);
// update a service by serviceId
router.put('/update/:serviceId', serviceController.updateservice);
// get service by serviceId
router.get('/getserviceById/:serviceId', serviceController.getserviceById);

// get seperate service based on audition id
router.get('/getservicesByAuditionId/:audition_Id', serviceController.getservicesByAuditionId);
//get service based on hair style (color);
router.get('/getservicesByHairColor', serviceController.getservicesByHairColor);

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