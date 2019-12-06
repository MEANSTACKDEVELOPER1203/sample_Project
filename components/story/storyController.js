let storyServices = require('./storyServices');
let storyTrackingServices = require('../storyTracking/storyTrackingServices');
let memberPreferenceServices = require('../memberpreferences/memberPreferenceServices')
let ObjectId = require('mongodb').ObjectId;
let createStory = async (req, res) => {
    // console.log(req.files)
    // console.log(req.body.story);
    let storyObj = JSON.parse(req.body.story);
    let files = req.files;
    // res.json({ success: 1 });
    // let query = {}
    try {
        let query = {
            storyObj: storyObj,
            files: files
        }
        const createdStoryObj = await storyServices.saveStory(query);
        if (createdStoryObj) {
            return res.status(200).json({ success: 1, message: "Story created successfully!", data: { data: createdStoryObj } })
        }
    } catch (error) {
        // console.log(error)
        return res.status(404).json({ success: 0, message: "Error while save story!!!", err })
    }
    // storyServices.saveStory(storyObj, files, (err, createdStoryObj) => {
    //     // console.log(err)
    //     if (err) {
    //         return res.status(404).json({ success: 0, message: "Error while save story!!!", err })
    //     } else {
    //         return res.status(200).json({ success: 1, message: "Story created successfully!", data: { data: createdStoryObj } })
    //     }
    // })
}

let getStoryProfile = async (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    // console.log(memberId, createdAt);
    let query = {};
    try {
        query = {
            memberId: memberId
        }
        let fanFollowListObj = await memberPreferenceServices.getFanFollowFromMemberPreferancesOfMemberAsync(query)
        let fanFollowList = fanFollowListObj.celebrities.map((celebObj) => {
            return (celebObj.CelebrityId);
        });
        query = {
            memberId: memberId,
            fanFollowList: fanFollowList
        }
        let listOfStoryObj = await storyServices.findStoryProfileByMemberIdAsync(query)

        if (listOfStoryObj == null || listOfStoryObj.length <= 0) {
            return res.status(200).json({ success: 1, data: { message: "stories profile not found", storyProfileInfo: [] } })
        } else {
            // console.log("listOfStoryObj", listOfStoryObj)
            let isStorySeen = false;
            let storySeenCountByCurrentUser = 0;
            let storyListArr = listOfStoryObj.map(obj => {
                storySeenCountByCurrentUser = 0;
                let storyObj = {}
                isStorySeen = false;
                storyObj.memberId = obj.memberId;
                storyObj.createdAt = obj.createdAt;
                storyObj.storyMemberInfo = obj.storyMemberInfo;
                obj.storyTrackingByCurrentUser.map((seenObj) => {
                    if ("" + memberId == "" + seenObj.memberId) {
                        storySeenCountByCurrentUser = storySeenCountByCurrentUser + 1
                    }
                })

                if (storySeenCountByCurrentUser == obj.totalStoryCount)
                    isStorySeen = true;
                storyObj.isStorySeen = isStorySeen;
                return (storyObj)
            })
            myProfileObj = null;
            storyListArr.map((obj, index, aar2) => {
                let createdMemberId = obj.memberId;
                createdMemberId = "" + createdMemberId;
                if (createdMemberId == memberId) {
                    myProfileObj = {}
                    myProfileObj.memberId = obj.memberId;
                    myProfileObj.createdAt = obj.createdAt;
                    myProfileObj.storyMemberInfo = obj.storyMemberInfo;
                    myProfileObj.isStorySeen = obj.isStorySeen;
                    storyListArr.splice(index, 1)
                }
            })
            storyListArr.sort(function (x, y) {
                var dateA = new Date(x.createdAt), dateB = new Date(y.createdAt);
                return dateB - dateA;
            });
            // console.log("storyListArr", storyListArr)
            // storyListArr.sort(function (x, y) {
            //     return (x === y) ? 0 : x ? 1 : -1;
            // });
            if (myProfileObj != null)
                storyListArr.unshift(myProfileObj)
            //console.log("story2",listOfStoryObj);
            return res.status(200).json({ success: 1, data: { storyProfileInfo: storyListArr } })
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: 'Something went wrong', error: error });
    }
}

let getIndividualStory = (req, res) => {
    let celebId = (req.params.celeb_Id) ? req.params.celeb_Id : '';
    let currentUserId = (req.params.currentUser_Id) ? req.params.currentUser_Id : '';
    let createdAt = (req.params.created_At) ? req.params.created_At : '';
    let getCreateTime = createdAt;
    if (createdAt == "null" || createdAt == "0") {
        getCreateTime = new Date();
    }
    storyServices.findStory(celebId, getCreateTime, currentUserId, (err, listOfStoryObj, celebInfoObj, isSeenCount) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the story", err })
        } else if (listOfStoryObj == null || listOfStoryObj.length <= 0) {
            return res.status(200).json({ success: 1, message: "stories not found", data: { story: [], celebInfoObj: {}, statusSeenCount: 0 } })
        } else {
            return res.status(200).json({ success: 1, data: { story: listOfStoryObj, celebInfo: celebInfoObj, statusSeenCount: isSeenCount } })
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
    storyServices.findStory1(celebId, getCreateTime, currentUserId, (err, listOfStoryObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the story", err })
        } else if (listOfStoryObj == null || listOfStoryObj.length <= 0) {
            return res.status(200).json({ success: 1, message: "stories not found", data: { story: [] } })
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
    getIndividualStory: getIndividualStory,
    getStorySeenStatus: getStorySeenStatus,
    deleteStoryById: deleteStoryById,
    getStory: getStory,
};
module.exports = storyController