const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectID;
const mediaTracking = require("./mediaTrackingModel");
const Feed = require("../../models/feeddata");
const async = require('async');
const feedlog = require('../feedLog/feedlogModel');
const User = require("../users/userModel");
const Feedback = require('../feedback/feedbackModel');
const ServiceTransaction = require('../serviceTransaction/serviceTransactionModel');
const activityLogService = require("../activityLog/activityLogService");


/********************************************************* Political Konnect Feeds Integration Start************************************************************************************************************************** */
// set Like feed
router.post('/setLike', (req, res, next) => {
    // console.log("Like Body=== ", req.body);
    var likeObj = req.body;
    let feedIdForMediaLike = likeObj.feedId
    likeObj.updated_at = new Date();
    likeObj.created_at = new Date();
    // let isFeedLike = false;
    // let queryForCeleb = { _id: ObjectId(likeObj.feedId) }
    // if ((likeObj.feedId != "" && likeObj.feedId != undefined) && (likeObj.mediaId != "" && likeObj.mediaId != undefined)) {
    //     isFeedLike = true
    //     // queryForCeleb = { _id: ObjectId(likeObj.feedId), media: { $elemMatch: { mediaId: ObjectId(likeObj.mediaId) } } }
    // }
    //check isliked 
    let activityType = "Like";
    if (likeObj.isLike == false)
        activityType = "unLike"

    Feed.findById(ObjectId(likeObj.feedId), { memberId: 1, media: 1 }, (err, feedObj) => {
        if (err)
            console.log("***** Error while fetching the feedback ********", err)
        else {
            // if (isFeedLike)
            //     likeObj.feedId = "";
            // console.log("feedObj ===== ", feedObj)
            if (feedObj.media.length <= 1 && (likeObj.mediaId != "" && likeObj.mediaId != undefined)) {
                likeObj.mediaId = "";
                delete likeObj.mediaId;
            }
            if (feedObj.media.length >= 1 && (likeObj.mediaId != "" && likeObj.mediaId != undefined)) {
                delete likeObj.feedId;
            }
            likeObj.celebId = "" + feedObj.memberId;
            // console.log("likeObj ===== ", likeObj)
            mediaTracking.findIsLiked(likeObj, (err, isLikedObj) => {
                // console.log("isLikedObj ============ ", isLikedObj)
                if (err) {
                    res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while like the member." + err.message });
                } else if (isLikedObj.length <= 0) {
                    mediaTracking.saveMedia(likeObj, (err, createdlikeObj) => {
                        if (err) {
                            res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while like the member." + err.message });
                        } else {
                            // console.log("Creating ........")
                            let body = {
                                memberId: likeObj.memberId,
                                feedId: feedIdForMediaLike,
                                mediaId: likeObj.mediaId,
                                activityOn: likeObj.celebId,
                                likeId: createdlikeObj._id
                            }
                            res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "Liked successfully", });
                            activityLogService.createActivityLogByProvidingActivityTypeNameAndContent(activityType, body, (err, newActivityLog) => {
                                if (err) {
                                    res.json({ success: 0, message: "Please try again." + err });
                                } else {
                                }
                            });
                        }
                    });
                } else if (isLikedObj.length > 0) {
                    // console.log("Creating22222 ........")
                    isLikedObj[0].isLike = likeObj.isLike;
                    mediaTracking.updateMedia(isLikedObj[0], (err, updatedMediaObj) => {
                        if (err) {
                            console.log(err.message);
                        } else {
                            let body = {
                                memberId: likeObj.memberId,
                                feedId: feedIdForMediaLike,
                                mediaId: likeObj.mediaId,
                                activityOn: likeObj.celebId,
                                likeId: isLikedObj[0]._id
                            }
                            let msg = "Unliked successfully";
                            if (likeObj.isLike)
                                msg = "Liked successfully";
                            res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: msg, });
                            activityLogService.createActivityLogByProvidingActivityTypeNameAndContent(activityType, body, (err, newActivityLog) => {
                                if (err) {
                                    res.json({ success: 0, message: "Please try again." + err });
                                } else {
                                }
                            });
                        }
                    })
                }
            });
        }
    })
});


// set Comment on feed
router.post('/setComments', (req, res, next) => {
    // console.log("body ", req.body)
    let commentObj = req.body;
    let isFeedLike = false;
    let feedIdForMediaComments = commentObj.feedId;
    let queryForCeleb = { _id: ObjectId(commentObj.feedId) }
    // if ((commentObj.feedId != "" && commentObj.feedId != undefined) && (commentObj.mediaId != "" && commentObj.mediaId != undefined)) {
    //     // commentObj.feedId = "";
    //     isFeedLike = true
    //     queryForCeleb = { _id: ObjectId(commentObj.feedId) }
    //     // queryForCeleb = { media: { $elemMatch: { mediaId: ObjectId(commentObj.mediaId) } } }
    // }
    Feed.find(queryForCeleb, (err, feedObj) => {
        if (err)
            console.log("***** Error while fetching the feedback ********", err)
        else {
            // console.log(feedObj);
            if (feedObj[0].media.length <= 1) {
                commentObj.mediaId = ""
                // console.log("single  feed here ")
            } else if (feedObj[0].media.length > 1 && (commentObj.mediaId != "" && commentObj.mediaId != undefined)) {
                commentObj.feedId = ""
            }
            // else{
            //     commentObj.feedId = ""
            //     // console.log("multiple  feed here ")
            // }
            commentObj.celebId = "" + feedObj[0].memberId;
            // console.log(commentObj)
            let feedbackQuery = {
                reason: "Block/Report", celebrityId: ObjectId(commentObj.celebId), memberId: ObjectId(commentObj.memberId)
            };
            Feedback.find(feedbackQuery, (err, feedbackListObj) => {
                if (err)
                    console.log("***** Error while fetching the feedback ********", err)
                else {
                    if (feedbackListObj.length > 0) {
                        return res.status(200).json({ success: 0, data: { senderId: commentObj.memberId, receiverId: commentObj.celebId }, message: "Celebrity has blocked you.!!!" });
                    }
                    let serviceTransquery = {
                        callRemarks: "Block/Report", receiverId: ObjectId(commentObj.celebId), senderId: ObjectId(commentObj.memberId)
                    };
                    ServiceTransaction.find(serviceTransquery, (err, serviceTransListObj) => {
                        if (err)
                            console.log("******** Error while fetching the service transaction ***********", err);
                        else {
                            if (serviceTransListObj.length > 0) {
                                return res.status(200).json({ success: 0, data: { senderId: commentObj.memberId, receiverId: commentObj.celebId }, message: "Celebrity has blocked you.!!!" });
                            } else {
                                mediaTracking.saveMedia(commentObj, (err, createdCommentObj) => {
                                    if (err) {
                                        res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while commented on the feed by member." });
                                    } else {
                                        User.findMemberById(createdCommentObj.memberId, (err, memberDetailsObj) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                let body = {
                                                    memberId: commentObj.memberId,
                                                    feedId: feedIdForMediaComments,
                                                    mediaId: commentObj.mediaId,
                                                    activityOn: commentObj.celebId,
                                                    commentId: createdCommentObj._id
                                                }
                                                activityLogService.createActivityLogByProvidingActivityTypeNameAndContent("Comment", body, (err, newActivityLog) => {
                                                    if (err) {
                                                        res.json({ success: 0, message: "Please try again." + err });
                                                    } else {
                                                    }
                                                });
                                                let memberObj = {};
                                                memberObj.username = memberDetailsObj.username;
                                                memberObj.avtar_imgPath = memberDetailsObj.avtar_imgPath;
                                                res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "commented successfully", data: createdCommentObj, memberObj });
                                            }
                                        })
                                    }
                                });

                            }
                        }
                    })
                }
            })
        }
    })

});


// set Share feed
router.post('/setShare', (req, res, next) => {
    let shareObj = req.body;
    mediaTracking.saveMedia(shareObj, (err, createdShareObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while Share feed by member." });
        } else {
            res.status(200).json({ success: 1, message: "Shared successfully" });
        }
    });
});

//update comments by id
router.put('/updateCommentsById/:comment_Id', (req, res) => {
    let commentId = ObjectId(req.params.comment_Id);
    //console.log(req.body);
    req.body.updated_at = new Date();
    let feedbackQuery = {
        reason: "Block/Report", celebrityId: ObjectId(req.body.celebId), memberId: ObjectId(req.body.memberId)
    };
    Feedback.find(feedbackQuery, (err, feedbackListObj) => {
        if (err)
            console.log("***** Error while fetching the feedback ********", err)
        else {
            if (feedbackListObj.length > 0) {
                return res.status(200).json({ success: 0, data: { senderId: req.body.memberId, receiverId: req.body.celebId }, message: "Celebrity has blocked you.!!!" });
            }
            let serviceTransquery = {
                callRemarks: "Block/Report", receiverId: ObjectId(req.body.celebId), senderId: ObjectId(req.body.memberId)
            };
            ServiceTransaction.find(serviceTransquery, (err, serviceTransListObj) => {
                if (err)
                    console.log("******** Error while fetching the service transaction ***********", err);
                else {
                    if (serviceTransListObj.length > 0) {
                        return res.status(200).json({ success: 0, data: { senderId: req.body.memberId, receiverId: req.body.celebId }, message: "Celebrity has blocked you.!!!" });
                    } else {
                        mediaTracking.updateCommentById(commentId, req.body, (err, updatedCommentObj) => {
                            if (err) {
                                res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while updating the comment by Id " + commentId })
                            } else {
                                res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "Updated successfully", data: updatedCommentObj });
                            }
                        })
                    }
                }
            });
        }
    })
});

//delete comments by id
router.delete('/deleteCommentsById/:comment_Id', (req, res) => {
    let commentId = ObjectId(req.params.comment_Id);
    //console.log(commentId);
    mediaTracking.findCommentById(commentId, (err, commentObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while fetching  comment by id." });
        } else {
            let feedId = "";
            let mediaId = ""
            let body = {
                memberId: commentObj.memberId,
                feedId: feedId,
                mediaId: mediaId,
                commentId: commentId
            }
            activityLogService.createActivityLogByProvidingActivityTypeNameAndContent('unComment', body, (err, newActivityLog) => {
                if (err) {
                    res.json({ success: 0, message: "Please try again." + err });
                } else {
                    mediaTracking.deleteCommentById(commentId, (err, deleteObj) => {
                        if (err) {
                            res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while delete commente by ID" + commentId });
                        } else {
                            res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "Deleted successfully" });
                        }
                    });
                }
            });
        }
    });
});















































/********************************************************* Political Konnect Feeds Integration End************************************************************************************************************************** */












































// Create a mediaTracking
router.post("/createmediaTracking", function (req, res) {
    let mediaId = ObjectId(req.body.mediaId);
    //let feedId = ObjectId(req.body.feedId);
    let memberId = req.body.memberId;
    let activityMemberID = req.body.activityMemberID;
    let activities = req.body.activities;
    let source = req.body.source;
    let status = req.body.status;
    let created_at = req.body.created_at;

    let newMediaTracking = new mediaTracking({
        //feedId: feedId,
        mediaId: mediaId,
        memberId: memberId,
        activityMemberID, activityMemberID,
        activities: activities,
        source: source,
        status: status,
        created_at: created_at
    });

    mediaTracking.createMediaTracking(newMediaTracking, function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.send({ message: "mediaTracking saved sucessfully" });
        }
    });
});
// End of Create a mediaTracking

// Set Feed Comment By mediaId
router.post("/setFeedCommentsByMediaId", function (req, res) {
    let feedId = ObjectId(req.body.feedId);
    let mediaId = ObjectId(req.body.mediaId);
    let memberId = ObjectId(req.body.memberId);
    let activityMemberID = ObjectId(req.body.activityMemberID);
    let activities = req.body.activities;
    let source = req.body.source;
    let status = req.body.status;
    let created_at = req.body.created_at;

    let newMediaTracking = new mediaTracking({
        mediaId: mediaId,
        feedId: feedId,
        memberId: memberId,
        activityMemberID: activityMemberID,
        activities: activities,
        source: source,
        status: status,
        created_at: created_at
    });

    mediaTracking.createMediaTracking(newMediaTracking, function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.send({ message: "Comment saved sucessfully" });
        }
    });
});
// End of Set Feed Comment By mediaId

// Set Feed View by mediaId
router.post("/setFeedViewByMediaId", function (req, res) {
    let feedId = ObjectId(req.body.feedId);
    let mediaId = ObjectId(req.body.mediaId);
    let memberId = ObjectId(req.body.memberId);
    let activityMemberID = ObjectId(req.body.activityMemberID);
    let activities = req.body.activities;

    let newMediaTracking = new mediaTracking({
        feedId: feedId,
        mediaId: mediaId,
        memberId: memberId,
        activityMemberID: activityMemberID,
        activities: activities
    });

    let query = { $and: [{ "mediaId": mediaId }, { "memberId": memberId }, { "activities": activities }] }

    mediaTracking.find(query, function (err, fmediaTracking) {
        if (err) return next(err);
        if (fmediaTracking.length == 0) {
            mediaTracking.createMediaTracking(newMediaTracking, function (err, user) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ message: "mediaTracking saved sucessfully" });
                }
            });
        } else if (fmediaTracking.length == 1) {
            let id = fmediaTracking[0]._id;
            mediaTracking.findByIdAndRemove(id, function (err, user) {
                if (err) {
                    res.send(err);
                }
                res.send({ message: "mediaTracking Updated Successfully" });
            });
        } else {
            res.json({ error: "Feed not found / Invalid" });
        }

    });


});
// End of Set Feed View by mediaId

// set feed share by mediaId
router.post("/setFeedShareByMediaId", function (req, res) {
    let feedId = ObjectId(req.body.feedId);
    let mediaId = ObjectId(req.body.mediaId);
    let memberId = ObjectId(req.body.memberId);
    let activityMemberID = ObjectId(req.body.activityMemberID);
    let activities = req.body.activities;
    let source = req.body.source;
    let status = req.body.status;
    let created_at = req.body.created_at;

    let newMediaTracking = new mediaTracking({
        mediaId: mediaId,
        feedId: feedId,
        memberId: memberId,
        activityMemberID: activityMemberID,
        activities: activities,
        source: source,
        status: status,
        created_at: created_at
    });

    let query = { $and: [{ "mediaId": mediaId }, { "memberId": memberId }, { "activities": activities }] }

    mediaTracking.find(query, function (err, smediaTracking) {
        if (err) return next(err);
        if (smediaTracking.length == 0) {
            mediaTracking.createMediaTracking(newMediaTracking, function (err, user1) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ message: "Feed shared sucessfully" });
                }
            });
        } else if (smediaTracking.length == 1) {
            let id = smediaTracking[0]._id;
            mediaTracking.setShare(id, source, function (err, user2) {
                if (err) {
                    res.send(err);
                }
                res.send({ message: "mediaTracking updated successfully" });
            });
        } else {
            res.json({ error: "Media not found / Invalid" });
        }

    });


});
// End of set feed share by mediaId

// Get All Feed Logs
router.get("/getmediaTrackingList", function (req, res) {
    mediaTracking.find(function (err, users) {
        if (err) return next(err);
        res.json(users);
    });
});
// End of Get All Feed Logs

// Edit a mediaTracking
router.put("/editMediaTracking/:mediaId", function (req, res) {

    let id = req.params.mediaId;
    let mediaId = ObjectId(req.body.mediaId);
    let feedId = ObjectId(req.body.feedId);
    let memberId = ObjectId(req.body.memberId);
    let activities = req.body.activities;
    let source = req.body.source;
    let status = req.body.status;
    let created_at = req.body.created_at;
    let updated_at = req.body.updated_at;
    let reqbody = req.body;
    reqbody.updated_at = new Date;
    reqbody.mediaId = mediaId;


    mediaTracking.editmediaTracking(id, reqbody, function (err, result) {
        if (err) return next(err);
        res.send(result);
    });

});
// End of Edit a mediaTracking

// Find by mediaTrackingId
router.get("/getMediaTrackingById/:id", function (req, res) {
    let id = req.params.id;
    mediaTracking.getmediaTrackingById(id, function (err, result) {
        if (err) return next(err);
        res.send(result);
    });
});
// End of Find by mediaTrackingId

// Get mediaTracking by MemberID
router.post("/findBymemberId", function (req, res) {
    let id = req.body.id;
    let memberId = ObjectId(req.body.memberId);

    let query = {
        $and: [{ id: id }, { memberId: memberId }]
    };

    mediaTracking.find(query, function (err, result) {
        if (err) return res.send(err);
        res.send(result);
    });
});
// End of Get mediaTracking by MemberID  


// Delete by mediaTracking ID
router.delete("/deletemediaTracking/:id", function (req, res, next) {

    let id = req.params.id;

    mediaTracking.findById(id, function (err, result) {
        if (err) return res.send(err);
        if (result) {
            mediaTracking.findByIdAndRemove(id, function (err, post) {
                if (err) return next(err);
                res.json({ message: "Deleted Feed Successfully" });
            });
        } else {
            res.json({ error: "mediaId not found / Invalid" });
        }
    });

});
// End of Delete by mediaTracking ID

// Get Feed Comments by mediaId
router.get("/getFeedCommentsByMediaId/:mediaId", function (req, res) {
    let mediaId = ObjectId(req.params.mediaId);
    mediaTracking.aggregate(
        [
            {
                $match: { $and: [{ mediaId: ObjectId(mediaId) }, { activities: "comment" }] }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "memberId",
                    foreignField: "_id",
                    as: "memberProfile"
                }
            },
            {
                $project: {
                    _id: 1,
                    source: 1,
                    created_at: 1,
                    "memberProfile._id": 1,
                    "memberProfile.email": 1,
                    "memberProfile.firstName": 1,
                    "memberProfile.lastName": 1,
                    "memberProfile.aboutMe": 1,
                    "memberProfile.isCeleb": 1,
                    "memberProfile.profession": 1,
                    "memberProfile.avtar_imgPath": 1
                }
            }
        ],
        function (err, result) {
            if (err) {
                res.send(err);
            }
            res.send(result)
        }
    );
});
// End of Get Feed Comments by mediaId

// End of Get Feed Comments by mediaId



// Get Feed likes by mediaId
router.get("/getFeedLikesByMediaId/:mediaId", function (req, res) {
    let mediaId = ObjectId(req.params.mediaId);
    mediaTracking.aggregate(
        [
            {
                $match: { $and: [{ mediaId: ObjectId(mediaId) }, { activities: "views" }] }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "memberId",
                    foreignField: "_id",
                    as: "memberProfile"
                }
            },
            {
                $match: {
                    $and: [
                        { memberProfile: { $ne: [] } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    //source: 1,
                    //created_at: 1,
                    "memberProfile._id": 1,
                    "memberProfile.isCeleb": 1,
                    "memberProfile.email": 1,
                    "memberProfile.firstName": 1,
                    "memberProfile.aboutMe": 1,
                    "memberProfile.profession": 1,
                    "memberProfile.lastName": 1,
                    "memberProfile.avtar_imgPath": 1
                }
            }
        ],
        function (err, result) {
            if (err) {
                res.send(err);
            }
            res.send(result)
        }
    );
});
// End of Get Feed likes by mediaId

// Get Feed likes count by mediaId
router.get("/getFeedLikesCountByMediaId/:feedId", function (req, res) {
    let feedId = ObjectId(req.params.feedId);
    mediaTracking.aggregate(
        [
            {
                $match: { $and: [{ feedId: ObjectId(feedId) }] }
            },
            {
                $lookup: {
                    from: "feeddata",
                    localField: "feedId",
                    foreignField: "_id",
                    as: "mediaStats" // to get all the views, comments, shares count
                }
            }

        ],
        function (err, result) {
            if (err) {
                res.send(err);
            }
            // Filter FeedStats to get views, shares, follow and comment count

            //   for (let i = 0; i < result.length; i++) {
            //     console.log(result);
            //     let likesCount = 0;
            //     let sharesCount = 0;
            //     let commentsCount = 0;
            //     let likeStatus = false;
            //     let viewStatus = false;

            //       if (result[i].activities == "views") {
            //         if ((result[i].memberId) && (result[i].activities == "views")) {
            //             likeStatus = true;
            //             console.log("2:",i);
            //         }
            //         likesCount = likesCount + 1;
            //         //console.log("3:",likesCount);
            //       }
            //       if (result[i].activities == "share") {
            //         sharesCount = sharesCount + 1;
            //       }
            //       if (result[i].activities == "comment") {
            //         commentsCount = result[i].source.length + commentsCount;
            //       }
            //     //}
            //     // Append the counts to main object
            //     //console.log(result[i].feedStats[i]);
            //     result[i].likesCount = likesCount;
            //     result[i].sharesCount = sharesCount;
            //     result[i].commentsCount = commentsCount;
            //     result[i].likeStatus = likeStatus;
            //     result[i].viewStatus = viewStatus;

            //   }
            res.send(result);
        }
    );
});
// End of Get Feed likes by mediaId




module.exports = router;
