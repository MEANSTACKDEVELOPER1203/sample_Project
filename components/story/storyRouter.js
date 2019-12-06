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
router.get('/getIndividualStory/:celeb_Id/:currentUser_Id/:created_At', storyController.getIndividualStory);
//desc get all celeb story
//method GET
//access public
router.get('/getStory/:celeb_Id/:currentUser_Id/:created_At', storyController.getStory);

//@desc Get story seen status
//@method GET
//@access public
router.get('/getStorySeenStatus/:story_Id/:limit/:created_At', storyController.getStorySeenStatus);

//@desc Delete story by Id
//@method DELETE
//@access public
router.put('/deleteStoryById/:story_Id', storyController.deleteStoryById);

//@desc storyImages
//@method GET
//@access public
router.get("/storyImages", function (req, res) {
    let imageArray = ["uploads/stickers/sticker-bday.png","uploads/stickers/sticker-bdaycap.png","uploads/stickers/sticker-burger.png","uploads/stickers/sticker-cool.png","uploads/stickers/sticker-dream.png","uploads/stickers/sticker-goodmorning.png","uploads/stickers/sticker-goodnight.png","uploads/stickers/sticker-goodvibes.png","uploads/stickers/sticker-happybday.png","uploads/stickers/sticker-hello.png","uploads/stickers/sticker-hot.png","uploads/stickers/sticker-like.png","uploads/stickers/sticker-lol.png","uploads/stickers/sticker-love.png","uploads/stickers/sticker-loveit.png","uploads/stickers/sticker-nope.png","uploads/stickers/sticker-selfi.png","uploads/stickers/sticker-shades.png","uploads/stickers/sticker-wow.png"]
    res.status(200).json({ success: 1, data: imageArray })
  });

module.exports = router