let storyServices = require('./storyServices');

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

let getStory = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    console.log(memberId, createdAt);
    storyServices.findStoryByMemberId(memberId, getCreateTime, (err, listOfStoryObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the story", err })
        } else if (listOfStoryObj == null || listOfStoryObj.length <= 0) {
            return res.status(200).json({ success: 0, data: { message: "story not found" } })
        } else {
            return res.status(200).json({ success: 1, data: { story: listOfStoryObj } })
        }
    })

}

let storyController = {
    createStory: createStory,
    getStory: getStory
};
module.exports = storyController