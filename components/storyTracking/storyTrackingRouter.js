let express = require('express');
let router = express.Router();
let storyTrackingController = require('./storyTrackingController');

//@desc save story seen status and this service is calling through Socket
//@method POST
//@access public
router.post('/createStoryTracking', storyTrackingController.createStorySeenStatus);


module.exports = router;