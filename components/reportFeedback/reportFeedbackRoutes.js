const express = require("express");
const router = express.Router();
const reportFeedbackController = require('./reportFeedbackController')

router.post('/postFeedbackOnReport',reportFeedbackController.postFeedbackOnReport)

router.get('/getAllFeedbackItems',reportFeedbackController.getAllFeedbackItems)



module.exports = router;