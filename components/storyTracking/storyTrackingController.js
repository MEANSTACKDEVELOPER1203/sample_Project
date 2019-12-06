let storyTrackingServices = require('./storyTrackingServices');

let createStorySeenStatus = (req, res) => {
    // console.log(req.body);
    storyTrackingServices.saveStorySeenStatus(req.body, (err, createdStorySeenObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while save the story seen", err })
        } else {
            return res.status(200).json({ success: 1, data: { storySeenInfo: createdStorySeenObj } })
        }
    });
}



let storyTrackingController = {
    createStorySeenStatus: createStorySeenStatus,
    
}
module.exports = storyTrackingController;