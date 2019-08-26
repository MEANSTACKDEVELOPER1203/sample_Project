let Feedback = require('./feedbackModel');

let saveMemberFeedback = function (feedbackObj, callback) {
    let feedbackInfo = new Feedback({
        memberId:feedbackObj.memberId,
        celebrityId:feedbackObj.celebrityId,
        reason:feedbackObj.reason,
        feedback:feedbackObj.feedback,
    });
    //console.log("Test",feedbackInfo);
    Feedback.create(feedbackInfo, (err, createdFeedbackObj) => {
        if (!err)
            callback(null, createdFeedbackObj);
        else
            callback(err, null)
    })
    
}

let feedbackService = {
    saveMemberFeedback: saveMemberFeedback
}

module.exports = feedbackService;