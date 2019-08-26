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
//desc get story based on fan/follow
//method GET
//access public
router.get('/getStory/:member_Id/:created_At', storyController.getStory);

module.exports = router