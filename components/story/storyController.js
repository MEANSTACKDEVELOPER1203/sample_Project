let storyServices = require('./storyServices');
let storyTrackingServices = require('../storyTracking/storyTrackingServices');
let createStory = (req, res) => {
    console.log(req.files)
    console.log(req.body.story);
    let storyObj = JSON.parse(req.body.story);
    let files = req.files;
    // res.json({ success: 1 });
    storyServices.saveStory(storyObj, files, (err, createdStoryObj) => {
        console.log(err)
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while save story!!!", err })
        } else {
            return res.status(200).json({ success: 1, message: "Story created successfuly!", data: { data: createdStoryObj } })
        }
    })
}

let getStoryProfile = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    // console.log(memberId, createdAt);
    storyServices.findStoryProfileByMemberId(memberId, getCreateTime, (err, listOfStoryObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the story", err })
        } else if (listOfStoryObj == null || listOfStoryObj.length <= 0) {
            return res.status(200).json({ success: 1, data: { message: "stories profile not found", storyProfileInfo: [] } })
        } else {
            return res.status(200).json({ success: 1, data: { storyProfileInfo: listOfStoryObj } })
        }
    })

}

let getStory = (req, res) => {
    let celebId = (req.params.celeb_Id) ? req.params.celeb_Id : '';
    let currentUserId = (req.params.currentUser_Id) ? req.params.currentUser_Id : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    storyServices.findStory(celebId, getCreateTime, currentUserId, (err, listOfStoryObj, celebInfoObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the story", err })
        } else if (listOfStoryObj == null || listOfStoryObj.length <= 0) {
            return res.status(200).json({ success: 1, message: "stories not found", data: { story: [], celebInfoObj: {} } })
        } else {
            return res.status(200).json({ success: 1, data: { story: listOfStoryObj, celebInfo: celebInfoObj } })
        }
    })
}
let getStory1 = (req, res) => {
    let celebId = (req.params.celeb_Id) ? req.params.celeb_Id : '';
    let currentUserId = (req.params.currentUser_Id) ? req.params.currentUser_Id : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    storyServices.findStory1(celebId, getCreateTime, currentUserId, (err, listOfStoryObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the story", err })
        } else if (listOfStoryObj == null || listOfStoryObj.length <= 0) {
            return res.status(200).json({ success: 1, message: "stories not found", data: { story: []} })
        } else {
            return res.status(200).json({ success: 1, data: { story: listOfStoryObj } })
        }
    })
}

let getStorySeenStatus = (req, res) => {
    let query = {};
    let storyId = (req.params.story_Id) ? req.params.story_Id : '';
    let limit = (req.params.limit) ? req.params.limit : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    query.storyId = storyId;
    query.limit = limit;
    query.createdAt = getCreateTime
    storyTrackingServices.getStoryCountWithProfile(query, (err, storyObj, count) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the story seen status", err })
        } else {
            return res.status(200).json({ success: 1, data: { story: storyObj, count: count } })
        }
    })
}

let deleteStoryById = (req, res) => {
    let storyId = (req.params.story_Id) ? req.params.story_Id : '';
    storyServices.deleteStoryId(storyId, (err, deletedStoryObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while deleting the story", err })
        } else {
            return res.status(200).json({ success: 1, data: { message: "Story have been successfully deleted", story: deletedStoryObj } })
        }
    });
}

let storyController = {
    createStory: createStory,
    getStoryProfile: getStoryProfile,
    getStory: getStory,
    getStorySeenStatus: getStorySeenStatus,
    deleteStoryById: deleteStoryById,
    getStory1:getStory1
};
module.exports = storyController