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

const getBlockUserList = (req, res) => {
    if ((req.params.celebrityId == "" || req.params.celebrityId == null) && (req.params.pagination_Date == "" || req.params.pagination_Date == null)) {
        return res.json({ success: 0, token: req.headers['x-access-token'], message: "Please provide celebrityId" });
    }
    MemberPrefernacesService.getBlockUserList(req.params.celebrityId, req.params.pagination_Date, (err, blockUserList, count) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: {dataList: blockUserList, count: count } });
        }
    });
}

let fanCelebritiesbyMember = (req, res) => {
    MemberPrefernacesService.fanCelebritiesbyMember(req.params, (err, data, count) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
        }
    })
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


let followingCelebritiesByMember = (req, res) => {
    MemberPrefernacesService.followingCelebritiesByMember(req.params, (err, data, count) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
        }
    })
}

const fanMembersbyCelebrity = (req, res) => {
    MemberPrefernacesService.fanMembersbyCelebrity(req.params, (err, data, count) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
        }
    })
}


const followingMembersbyCelebrity = (req, res) => {
    MemberPrefernacesService.followingMembersbyCelebrity(req.params, (err, data, count) => {
        if (err) {
            return res.json({ success: 0, token: req.headers['x-access-token'], message: `${err}` });
        } else {
            return res.json({ success: 1, token: req.headers['x-access-token'], data: { dataList: data, count: count } });
        }
    })
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