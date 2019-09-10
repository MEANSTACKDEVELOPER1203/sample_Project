let express = require('express');
let multer = require('multer');
let storyController = require('./storyController');
let router = express.Router();

// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/story");
    },
    filename: function (req, file, cb) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        cb(null, "ck" + "_" + date + "_" + Date.now() + "_" + file.originalname);
    }
});
let upload = multer({
    storage: storage
});
// End of Multer Plugin Settings (Images Upload)

//desc create story
//method POST
//access public
router.post('/createStory', upload.any(), storyController.createStory)
//desc get latest story profile based on fan/follow
//method GET
//access public
router.get('/getStoryProfile/:member_Id/:created_At', storyController.getStoryProfile);

//desc get celeb story based on celeb ID
//method GET
//access public
// router.get('/getStory/:celeb_Id/:currentUser_Id/:created_At', storyController.getStory);
router.get('/getStory/:celeb_Id/:currentUser_Id/:created_At', storyController.getStory1);

//@desc Get story seen status
//@method GET
//@access public
router.get('/getStorySeenStatus/:story_Id/:limit/:created_At', storyController.getStorySeenStatus);

//@desc Delete story by Id
//@method DELETE
//@access public
router.put('/deleteStoryById/:story_Id', storyController.deleteStoryById);

module.exports = router