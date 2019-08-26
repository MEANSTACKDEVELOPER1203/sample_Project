let express = require('express');
let feedbackController = require('./feedbackController');
let router = express.Router();

router.post('/createFeedBack', feedbackController.createFeedback)


module.exports = router;