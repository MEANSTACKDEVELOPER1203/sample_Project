const express = require("express");
const router = express.Router();
const commentFeedbackController = require('./commentFeedbackController')

router.post('/createCommentFeedback',commentFeedbackController.createCommentFeedback)

router.put('/updateCommentFeedback/:commentFeedbackId',commentFeedbackController.updateCommentFeedback)

router.get('/getAllFeedbackItems',commentFeedbackController.getAllFeedbackItems)

router.get('/getCommentFeedbackById/:commentFeedbackId',commentFeedbackController.getCommentFeedbackById)

module.exports = router;