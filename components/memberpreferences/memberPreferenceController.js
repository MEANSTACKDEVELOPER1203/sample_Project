const MemberPrefernacesService = require("./memberPreferenceServices")
const MemberPreferences = require("./memberpreferencesModel");
let ObjectId = require("mongodb").ObjectID;

const beFanOfCelebrity = (req, res) => {
    MemberPrefernacesService.updateMemberPreferances(req.params.memberId, req.body.CelebrityId, "fan", (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], message: "fan successfullly", data: result });
        }
    });
}

const unFanCelebrity = (req, res) => {
    MemberPrefernacesService.updateMemberPreferances(req.params.memberId, req.body.CelebrityId, "unfan", (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], message: "unfan successfullly", data: result });
        }
    });
}

const followCelebrity = (req, res) => {
    MemberPrefernacesService.updateMemberPreferances(req.params.memberId, req.body.CelebrityId, "follow", (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], message: "follow successfullly", data: result });
        }
    });
}

const getMemberPreferancesCount = (req, res) => {
    MemberPrefernacesService.getMemberPreferancesCount(req.params.memberId, (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], message: "", data: result });
        }
    });
}

const unfollowCelebrity = (req, res) => {
    MemberPrefernacesService.updateMemberPreferances(req.params.memberId, req.body.CelebrityId, "unfollow", (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], message: "Unfollow successfullly", data: result });
        }
    });
}

const blockMember = (req, res) => {
    let feedback = req.body.feedback;
    MemberPrefernacesService.updateMemberPreferances(req.params.memberId, req.body.CelebrityId, { mode: "block", "feedback": feedback }, (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], message: "Block successfullly", data: result });
        }
    });
}

const makeVertualFollower = (req, res) => {
    if (!req.body.CelebrityId) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "Please provide celebrityId" });
    } else if (!req.body.followingCount) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "Please provide count" });
    }
    MemberPrefernacesService.makeVertualFollower(req.body.CelebrityId, req.body.followingCount, (err, result) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: result });
        }
    });
}

const getBlockUserList = async (req, res) => {
    if ((req.params.celebrityId == "" || req.params.celebrityId == null) && (req.params.pagination_Date == "" || req.params.pagination_Date == null)) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "Please provide celebrityId" });
    }
    try {
        let limit = 20;
        let query = {
            celebrityId: req.params.celebrityId,
            paginationDate: req.params.pagination_Date,
            limit: limit
        }
        let fanCount = await MemberPrefernacesService.getFanCount(query); //celeb fan count
        let followerCount = await MemberPrefernacesService.getFollowCount(query); //celeb follower count
        let blockedCount = await MemberPrefernacesService.getBlockedCount(query) //blocked by celeb
        let blockUsersFronFeedback = await MemberPrefernacesService.getBlockUserFromFeedbackListAsync(query);
        if (blockUsersFronFeedback)
            blockUsersFronFeedback = blockUsersFronFeedback.map((blockUser) => {
                let userObj = blockUser._id;
                userObj.paginationDate = blockUser.createdDate;  //new Date() 
                userObj.blockedDate = blockUser.updatedDate;  //new Date() 
                userObj.feedback = blockUser.feedback;
                return userObj
            })
        let expectId = blockUsersFronFeedback.map((blockUser) => {
            return blockUser._id
        })
        limit = limit - blockUsersFronFeedback.length
        query = {
            celebrityId: req.params.celebrityId,
            paginationDate: req.params.pagination_Date,
            expectId: expectId,
            limit: limit
        }
        let blockUsersFromServiceTransaction = await MemberPrefernacesService.getBlockUserFromServiceTransactionListAsync(query);
        blockUsersFromServiceTransaction = blockUsersFromServiceTransaction.map((blockUser) => {
            let userObj = blockUser._id;
            userObj.paginationDate = blockUser.createdAt;  //new Date() 
            userObj.blockedDate = blockUser.updatedAt;  //new Date() 
            userObj.feedback = blockUser.reason;
            return userObj
        });
        blockUsers = blockUsersFromServiceTransaction.concat(blockUsersFronFeedback)
        blockUsers.sort(function (x, y) {
            var dateA = new Date(x.paginationDate), dateB = new Date(y.paginationDate);
            return dateB - dateA;
        })
        return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: blockUsers, fanCount: fanCount, followerCount: followerCount, blockedCount: blockedCount } });
    } catch (error) {
        // console.log(error)
        return res.json({ success: 0, token: req.headers['x-access-token'], message: `${error}` });
    }

    // MemberPrefernacesService.getBlockUserList(req.params.celebrityId, req.params.pagination_Date, (err, blockUserList, count) => {
    //     if (err) {
    //         res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
    //     } else {
    //         res.json({ success: 1, token: req.headers['x-access-token'], data: {dataList: blockUserList, count: count } });
    //     }
    // });
}

let fanCelebritiesbyMember = async (req, res) => {
    try {
        let query = {
            id: req.params.userId,
            limit: parseInt(req.params.limit),
            createdAt: req.params.createdAt
        }
        let fanCount = await MemberPrefernacesService.getMemberFanCount(query);
        let followerCount = await MemberPrefernacesService.getMemberFollowerCount(query);
        let memberFanListObj = await MemberPrefernacesService.fanCelebritiesbyMemberAsync(query)
        memberFanListObj = memberFanListObj.map((celebrity) => {
            let celebrityDetails = celebrity.celebrities.celebProfile;
            celebrityDetails.createdAt = celebrity.celebrities.celebrities.createdAt;
            return celebrityDetails
        })
        // memberFanListObj.forEach((user) => {
        //     for (i = 0; i < memberFanListObj.length; i++) {
        //         if ((user._id.toString() == memberFanListObj[i]._id.toString()) && i != memberFanListObj.indexOf(user)) {
        //             memberFanListObj.splice(i, 1);
        //         }
        //     }
        // })
        return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: memberFanListObj, fanCount: fanCount, followerCount: followerCount, } });
    } catch (error) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: `${error}` });
    }
    // MemberPrefernacesService.fanCelebritiesbyMember(req.params, (err, data, count) => {
    //     if (err) {
    //         return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
    //     } else {
    //         return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
    //     }
    // })
}

const unblockMember = (req, res) => {
    if (req.body.celebrityId == undefined || req.body.celebrityId == "" || req.body.celebrityId == null) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "Please provide celebrityId" });
    }
    if (req.body.memberId == undefined || req.body.memberId == "" || req.body.memberId == null) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "Please provide memberId" });
    }
    MemberPrefernacesService.unblockMember(req.body, (err, unblockStatus) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: unblockStatus, message: "Unblock successfully" });
        }
    });
}

const getBlockersList = (req, res) => {
    if (req.params.memberId == "" || req.params.memberId == null) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "Please provide memberId" });
    }
    MemberPrefernacesService.getBlockersList(req.params.memberId, (err, blockUserList) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: blockUserList });
        }
    });
}


let followingCelebritiesByMember = async (req, res) => {
    try {
        let query = {
            id: req.params.userId,
            limit: parseInt(req.params.limit),
            createdAt: req.params.createdAt
        }
        let fanCount = await MemberPrefernacesService.getMemberFanCount(query);
        let followerCount = await MemberPrefernacesService.getMemberFollowerCount(query);
        let memberFollowerObj = await MemberPrefernacesService.followingCelebritiesByMemberAsync(query)
        memberFollowerObj = memberFollowerObj.map((celebrity) => {
            let celebrityDetails = celebrity.celebrities.celebProfile;
            celebrityDetails.createdAt = celebrity.celebrities.celebrities.createdAt;
            return celebrityDetails
        });
        return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: memberFollowerObj, fanCount: fanCount, followerCount: followerCount, } });
    } catch (error) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: `${error}` });
    }

    // MemberPrefernacesService.followingCelebritiesByMember(req.params, (err, data, count) => {
    //     if (err) {
    //         return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
    //     } else {
    //         return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
    //     }
    // })
}

const fanMembersbyCelebrity = async (req, res) => {
    try {
        let query = {
            celebrityId: req.params.celebId,
            createdAt: req.params.createdAt,
            limit: parseInt(req.params.limit)
        }
        let fanCount = await MemberPrefernacesService.getFanCount(query); //celeb fan count
        let followerCount = await MemberPrefernacesService.getFollowCount(query); //celeb follower count
        let blockedCount = await MemberPrefernacesService.getBlockedCount(query) //blocked by celeb
        let celebFanListObj = await MemberPrefernacesService.fanMembersbyCelebrityAsync(query);
        celebFanListObj = celebFanListObj.map((fan) => {
            let memberDetails = fan.celebrities.memberProfile;
            memberDetails.createdAt = fan.celebrities.celebrities.createdAt;
            return memberDetails
        })
        // console.log(celebFanListObj)
        return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: celebFanListObj, fanCount: fanCount, followerCount: followerCount, blockedCount: blockedCount } });
    } catch (error) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: `${error}` });
    }


    // MemberPrefernacesService.fanMembersbyCelebrity(req.params, (err, data, count) => {
    //     if (err) {
    //         return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
    //     } else {
    //         return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
    //     }
    // })
}


const followingMembersbyCelebrity = async (req, res) => {
    try {
        let query = {
            celebrityId: req.params.celebId,
            limit: parseInt(req.params.limit),
            createdAt: req.params.createdAt,
        }
        let fanCount = await MemberPrefernacesService.getFanCount(query); //celeb fan count
        let followerCount = await MemberPrefernacesService.getFollowCount(query); //celeb follower count
        let blockedCount = await MemberPrefernacesService.getBlockedCount(query) //blocked by celeb
        let celebrityFollowersListObj = await MemberPrefernacesService.followingMembersbyCelebrityAsync(query)

        celebrityFollowersListObj = celebrityFollowersListObj.map((follower) => {
            console.log(follower.celebrities.celebrities.createdAt)
            let memberDetails = follower.celebrities.memberProfile;
            memberDetails.createdAt = follower.celebrities.celebrities.createdAt;
            memberDetails.total = follower.total;
            return memberDetails
        });
        // console.log(celebFanListObj)
        return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: celebrityFollowersListObj, fanCount: fanCount, followerCount: followerCount, blockedCount: blockedCount } });
    } catch (error) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: `${error}` });
    }

    // MemberPrefernacesService.followingMembersbyCelebrity(req.params, (err, data, count) => {
    //     if (err) {
    //         return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
    //     } else {
    //         return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
    //     }
    // })
}

const getAllBlockUser = (req, res) => {
    MemberPrefernacesService.getAllBlockUser(req.params, (err, data) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: data });
        }
    })
}

const getAllUnfanWithReason = (req, res) => {
    MemberPrefernacesService.getAllUnfanWithReason(req.params, (err, data) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: data });
        }
    })
}

const getUnfanWithReasonByCelebrityId = (req, res) => {
    MemberPrefernacesService.getUnfanWithReasonByCelebrityId(req.params, (err, data) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: data });
        }
    })
}

module.exports = {
    beFanOfCelebrity: beFanOfCelebrity,
    unFanCelebrity: unFanCelebrity,
    followCelebrity: followCelebrity,
    unfollowCelebrity: unfollowCelebrity,
    blockMember: blockMember,
    makeVertualFollower: makeVertualFollower,
    getMemberPreferancesCount: getMemberPreferancesCount,
    getBlockUserList: getBlockUserList,
    unblockMember: unblockMember,
    getBlockersList: getBlockersList,
    fanCelebritiesbyMember: fanCelebritiesbyMember,
    followingCelebritiesByMember: followingCelebritiesByMember,
    fanMembersbyCelebrity: fanMembersbyCelebrity,
    followingMembersbyCelebrity: followingMembersbyCelebrity,
    getAllBlockUser: getAllBlockUser,
    getAllUnfanWithReason: getAllUnfanWithReason,
    getUnfanWithReasonByCelebrityId: getUnfanWithReasonByCelebrityId
}