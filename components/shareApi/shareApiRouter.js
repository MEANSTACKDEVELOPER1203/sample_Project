const express = require('express');
const ShareApiController = require('./shareApiController');
let router = express.Router();

router.get('/shareAudition/:auditionId', ShareApiController.shareAudition);
router.get('/shareAudition/:auditionId/:roleId', ShareApiController.shareAuditionWithRole);
router.get('/shareAudition/:auditionId/:roleId/:memberId', ShareApiController.shareAuditionWithRoleAndFevDatatus);
router.get('/shareAuitionProfile/:memberId', ShareApiController.shareAuitionProfile);
router.get('/shareAuitionProfile/:memberId/:selfMemberId', ShareApiController.shareAuitionProfileByFevStatus);
router.get('/shareFeed/:feedId', ShareApiController.shareFeed);
router.get('/shareFeed/:feedId/:memberId', ShareApiController.shareFeedByLikeStatus);

module.exports = router;