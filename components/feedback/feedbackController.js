let feedbackService = require('./feedbackService');


var createFeedback = (req, res) => {
    //console.log("P1",req.body);
    feedbackService.saveMemberFeedback(req.body, (err, createdFeedbackObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while create the feedback " + err })
        } else {
            return res.status(200).json({ success: 1, message: "Feedback has been created successfully.", data: createdFeedbackObj })
        }
    });
}


let feedbackController = {
    createFeedback: createFeedback
}
module.exports = feedbackController