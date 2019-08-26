const express = require("express");
const router = express.Router();
const feedCommentFeedbackController = require('./feedCommentFeedbackController')

router.post('/postFeedbackOnComment',feedCommentFeedbackController.postFeedbackOnComment)

router.put('/updateFeedbackOnComment/:commentFeedbackId',feedCommentFeedbackController.updateFeedbackOnComment)

router.get('/getAllFeedbackOnCommentByFeedId/:feedId',feedCommentFeedbackController.getAllFeedbackOnCommentByFeedId)

router.get('/getAllFeedbackOnComment/:pageNo/:limit',feedCommentFeedbackController.getAllFeedbackOnComment)

router.get('/getAllFeedbackOnCommentByCommentId/:commentId',feedCommentFeedbackController.getAllFeedbackOnCommentByCommentId)

module.exports = router;