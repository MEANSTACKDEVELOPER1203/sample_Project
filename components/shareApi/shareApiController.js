let ShareApiService = require('./shareApiService');
let ObjectId = require("mongodb").ObjectID;

var shareAudition = (req, res) => {
    ShareApiService.shareAuition(req.params.auditionId,(err, AuditionObj) => {
        if (err) {
            return res.status(501).json({
                success: 0,
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            res.status(200).json({
                success: 1,
                data: AuditionObj,
                token: req.headers['x-access-token']
            });
        }
    })
}

var shareAuitionProfile = (req, res) => {
    ShareApiService.shareAuitionProfile(ObjectId(req.params.memberId),(err, auditionsProfilesObj) => {
        // console.log(err)
        if (err) {
            return res.status(501).json({
                success: 0,
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            return res.status(200).json({
                success: 1,
                data:{
                    auditionsProfilesObj:auditionsProfilesObj
                }
            });
        }
    })
}

var shareFeed = (req, res) => {
    ShareApiService.shareFeed(ObjectId(req.params.feedId),(err,feedInfo)=>{
        if (err) {
            return res.status(501).json({
                success: 0,
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            return res.status(200).json({
                success: 1,
                data:feedInfo,
                token: req.headers['x-access-token']
            });
        }
    })
}
var shareFeedByLikeStatus = (req, res) => {
    ShareApiService.shareFeedByLikeStatus(ObjectId(req.params.feedId),ObjectId(req.params.memberId),(err,feedInfo)=>{
        if (err) {
            return res.status(501).json({
                success: 0,
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            return res.status(200).json({
                success: 1,
                data:feedInfo,
                token: req.headers['x-access-token']
            });
        }
    })
}


var shareAuditionWithRole = (req, res) => {
    ShareApiService.shareAuditionWithRole(req.params.auditionId,req.params.roleId,(err, AuditionObj) => {
        if (err) {
            return res.status(501).json({
                success: 0,
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            res.status(200).json({
                success: 1,
                data: AuditionObj,
                token: req.headers['x-access-token']
            });
        }
    })
}


var shareAuditionWithRoleAndFevDatatus = (req, res) => {
    ShareApiService.shareAuditionWithRoleAndFevDatatus(req.params.auditionId,req.params.roleId,req.params.memberId,(err, AuditionObj) => {
        if (err) {
            return res.status(501).json({
                success: 0,
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            res.status(200).json({
                success: 1,
                data: AuditionObj,
                token:req.params,
                token: req.headers['x-access-token']
            });
        }
    })
}



var shareAuitionProfileByFevStatus = (req, res) => {
    ShareApiService.shareAuitionProfileByFevStatus(ObjectId(req.params.memberId),ObjectId(req.params.selfMemberId),(err, auditionsProfilesObj) => {
        // console.log(err)
        if (err) {
            return res.status(501).json({
                success: 0,
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            return res.status(200).json({
                success: 1,
                data:{
                    data:auditionsProfilesObj,
                    token: req.headers['x-access-token']
                }
            });
        }
    })
}

let shareApiController = {
    shareAudition: shareAudition,
    shareAuitionProfile:shareAuitionProfile,
    shareFeed:shareFeed,
    shareAuditionWithRole:shareAuditionWithRole,
    shareAuditionWithRoleAndFevDatatus:shareAuditionWithRoleAndFevDatatus,
    shareFeedByLikeStatus:shareFeedByLikeStatus,
    shareAuitionProfileByFevStatus:shareAuitionProfileByFevStatus
}
module.exports = shareApiController;