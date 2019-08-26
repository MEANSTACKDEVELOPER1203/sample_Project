let express = require('express');
let router = express.Router();
let feedController = require('./feedController');
/********************************** Get Feed by Fan & follow************************************************ */
router.get('/getFeeds/:member_Id/:pagination_date/:country_Code/:state', feedController.getFeeds );
router.get('/getFeedById/:feed_Id/:member_Id', feedController.getFeedById);


//@public access
router.get("/getFeedByFeedPreferenc", feedController.getFeedByFeedPreference);

/********************************** end  Get Feed by Fan & follow************************************************ */










module.exports = router