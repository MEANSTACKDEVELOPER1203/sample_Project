const express = require('express');
let router = express.Router();
let auditionsProfilesController = require('./auditionsProfilesController');
let multer = require("multer");
let User = require("../users/userModel");

// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
  destination: (req, file, cb)=> {
    cb(null, "uploads/auditions");
  },
  filename: (req, file, cb)=> {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
  }
});

let upload = multer({
  storage: storage
});
// End of Multer Plugin Settings (Images Upload)

// register a auditionsProfiles
router.post('/create', upload.any(),  auditionsProfilesController.createAuditionsProfiles);
// update a auditionsProfiles by auditionsProfilesId
router.put('/update/:auditionsProfiles_Id', upload.any(), auditionsProfilesController.updateAuditionsProfiles);
// get auditionsProfiles by auditionsProfilesId
router.get('/getauditionsProfilesById/:auditionsProfilesId', auditionsProfilesController.getAuditionsProfilesById);
router.get('/getAuditionsProfilesByMemberId/:memberId', auditionsProfilesController.getAuditionsProfilesByMemberId);
// search by role
router.get('/getRoleByString/:text', auditionsProfilesController.getRoleByString);
// search by HairColour
router.get('/getHairColourByString/:text', auditionsProfilesController.getHairColourByString);
// search by BodyType
router.get('/getBodyTypeByString/:text', auditionsProfilesController.getBodyTypeByString);
// search by BodyType
router.get('/getKeywordsByString/:text', auditionsProfilesController.getKeywordsByString);
// search by eyeColour
router.get('/getEyeColourByString/:text', auditionsProfilesController.getEyeColourByString);
// search by HairColour
router.get('/getSearchByString/:auditioProfile_Id/:skills/:hairColour/:bodyType/:eyeColour/:gender/:ethnicity/:ageStart/:ageEnd/:startHeight/:endHeight/:passport/:license', auditionsProfilesController.getAuditionProfileByAllFilters);
//update tlent in tilent array
router.post('/updateTilentsWithRating',auditionsProfilesController.updateTilentsWithRating);
//update achivemnet in tilent array
router.post('/updateAchievements',auditionsProfilesController.updateAchievements);
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