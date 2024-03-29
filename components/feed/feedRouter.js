let express = require('express');
let router = express.Router();
let feedController = require('./feedController');
/********************************** Get Feed by Fan & follow************************************************ */
//not in use
// router.get('/getFeeds/:member_Id/:pagination_date/:country_Code/:state', feedController.getFeeds );
router.get('/getFeedById/:feed_Id/:member_Id', feedController.getFeedById);
//desc delete feed get api after below successed
// method GET
//access public
router.get('/getFeedsNew/:member_Id/:pagination_Date',feedController.getFeedsNew);

//@public access
// router.get("/getFeedByFeedPreferenc", feedController.getFeedByFeedPreference);

//@desc hide and unhide the feed
//@methos POST
//@access public
router.post('/hideAndUnhideFeed', feedController.hideAndUnhideFeed);

//@desc get feed individual media with like/comment count (using for IOS only)
//@method GET
//@access public
router.get('/getIndividualMediaCount/:member_Id/:media_Id/:feed_Id', feedController.getIndividualMediaCount);

//@desc ger media like by user profile
//method GET
//access public
router.get('/getMediaLikedProfilesById/:feed_Id/:media_Id/:createdAt', feedController.getMediaLikesProfileById)


/********************************** end  Get Feed by Fan & follow************************************************ */


//getTrending feed
// router.get('/getTrendingFeed/:member_Id/:startFrom/:endTo',feedController.getTrendingFeed);









module.exports = router