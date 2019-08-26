const express = require('express');
let router = express.Router();
let favoritesController = require("../favorites/favoritesController");


// register a favorites for audition
router.post('/create', favoritesController.createfavorites);
// update a favorites by favoritesId
router.put('/update/:favoritesId', favoritesController.updatefavorites);


// get favorites by favoritesId
router.get('/getfavoritesById/:favoritesId', favoritesController.getfavoritesById);
// search by role
router.get('/getAllMembersForFavoritesById/:memberId', favoritesController.getAllMembersForAuditionById);
router.get('/getAllAuditionsForFavoritesById/:auditionId', favoritesController.getAllAuditionsForFavoritesId);

//admin
//get all favorites 
router.get('/getAllfavorites', favoritesController.getAllfavorites);
router.post('/checkFavorite', favoritesController.checkFavorite);



/********************************* talent favorite  *********************************/
//create talent favorite
router.post('/createTalentFavorite', favoritesController.createTalentFavorite);
//get all my favourite talent for auditionProfile_Id
router.get('/getAllFavouriteTalent/:auditionProfile_Id', favoritesController.getAllfavouritesTalent);

//get all my favourite Audition for auditionProfile_Id
router.get('/getAllFavouritedAuditions/:auditionProfile_Id', favoritesController.getAllfavouritedAuditions);



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