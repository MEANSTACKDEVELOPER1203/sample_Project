// let express = require("express");
// let router = express.Router();
// let ObjectId = require("mongodb").ObjectID;
// let Feedlog = require("./feedlogModel");
// let Feed = require("../../models/feeddata");

// Create a FeedLog
// router.post("/createFeedlog", function (req, res) {
//     let feedId = ObjectId(req.body.feedId);
//     let memberId = req.body.memberId;
//     let activities = req.body.activities;
//     let source = req.body.source;
//     let status = req.body.status;
//     let created_at = req.body.created_at;

//     let newFeedlog = new Feedlog({
//         feedId: feedId,
//         memberId: memberId,
//         activities: activities,
//         source: source,
//         status: status,
//         created_at: created_at
//     });

//     Feedlog.createFeedlog(newFeedlog, function (err, user) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.send({ message: "Feedlog saved sucessfully" });
//         }
//     });
// });
// End of Create a FeedLog

// Set Feed Follow for a feed
// router.post("/setFeedFollowByFeedID", function (req, res) {
//     let feedId = ObjectId(req.body.feedId);
//     let memberId = ObjectId(req.body.memberId);
//     let activities = req.body.activities;

//     let newFeedlog = new Feedlog({
//         feedId: feedId,
//         memberId: memberId,
//         activities: activities
//     });

//     let query = { $and: [{ "feedId": feedId }, { "memberId": memberId }, { "activities": activities }]}

//     Feedlog.find(query, function (err, feedlog) {
//         if (err) return next(err);
//         if(feedlog.length == 0) {
//             Feedlog.createFeedlog(newFeedlog, function (err, user) {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     res.send({ message: "Feedlog saved sucessfully" });
//                 }
//             });
//         } else if(feedlog.length == 1) {
//             let id = feedlog[0]._id;
//             Feedlog.setFollow(id,  function(err, user) {
//                 if (err) {
//                   res.send(err);
//                 }
//                 res.send({ message: "Feedlog Updated Successfully" });
//               });
//         } else {
//             res.json({ error: "Feed not found / Invalid" });
//         }
        
//     });    
// });
// End of Set Feed Follow for a feed

// Set Feed Comment By FeedID
// router.post("/setFeedCommentsByFeedID", function (req, res) {
//     let feedId = ObjectId(req.body.feedId);
//     let memberId = ObjectId(req.body.memberId);
//     let activities = req.body.activities;
//     let source = req.body.source;
//     let status = req.body.status;
//     let created_at = req.body.created_at;

//     let newFeedlog = new Feedlog({
//         feedId: feedId,
//         memberId: memberId,
//         activities: activities,
//         source: source,
//         status: status,
//         created_at: created_at
//     });

//     Feedlog.createFeedlog(newFeedlog, function (err, user) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.send({ message: "Comment saved sucessfully" });
//         }
//     });
// });
// End of Set Feed Comment By FeedID

// Set Feed BookMark By FeedID
// router.post("/setFeedBookMarkByFeedID", function (req, res) {
//     let feedId = ObjectId(req.body.feedId);
//     let memberId = ObjectId(req.body.memberId);
//     let activities = req.body.activities;

//     let reqbody = req.body;

//     let newFeedlog = new Feedlog({
//         feedId: feedId,
//         memberId: memberId,
//         activities: activities
//     });

//     let query = { $and: [{ "feedId": feedId }, { "memberId": memberId }, { "activities": activities }]}

//     Feedlog.find(query, function (err, feedlog) {
//         if (err) return next(err);
//         if(feedlog.length == 0) {
//             Feedlog.createFeedlog(newFeedlog, function (err, user) {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     res.send({ message: "Bookmark saved sucessfully" });
//                 }
//             });
//         } else if(feedlog.length == 1) {
//             let id = feedlog[0]._id;
//             Feedlog.findByIdAndRemove(id, reqbody, function(err, user) {
//                 if (err) {
//                   res.send(err);
//                 }
//                 res.send({ message: "Bookmark Updated Successfully" });
//               });
//         } else {
//             res.json({ error: "Feed not found / Invalid" });
//         } 
//     });
// });
// End of Set Feed BookMark By FeedID

// Set Feed View by FeedID
// router.post("/setFeedViewByFeedID", function (req, res) {
//     let feedId = ObjectId(req.body.feedId);
//     let memberId = ObjectId(req.body.memberId);
//     let activities = req.body.activities;

//     let newFeedlog = new Feedlog({
//         feedId: feedId,
//         memberId: memberId,
//         activities: activities
//     });

//     let query = { $and: [{ "feedId": feedId }, { "memberId": memberId }, { "activities": activities }]}

//     Feedlog.find(query, function (err, feedlog) {
//         if (err) return next(err);
//         if(feedlog.length == 0) {
//             Feedlog.createFeedlog(newFeedlog, function (err, user) {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     res.send({ message: "Feedlog saved sucessfully" });
//                 }
//             });
//         } else if(feedlog.length == 1) {
//             let id = feedlog[0]._id;
//             Feedlog.findByIdAndRemove(id,  function(err, user) {
//                 if (err) {
//                   res.send(err);
//                 }
//                 res.send({ message: "Feedlog Updated Successfully" });
//               });
//         } else {
//             res.json({ error: "Feed not found / Invalid" });
//         }
        
//     });

    
// });
// End of Set Feed View by FeedID

// set feed share by FeedID
// router.post("/setFeedShareByFeedID", function (req, res) {
//     let feedId = ObjectId(req.body.feedId);
//     let memberId = ObjectId(req.body.memberId);
//     let activities = req.body.activities;
//     let source = req.body.source;
//     let status = req.body.status;
//     let created_at = req.body.created_at;

//     let newFeedlog = new Feedlog({
//         feedId: feedId,
//         memberId: memberId,
//         activities: activities,
//         source: source,
//         status: status,
//         created_at: created_at
//     });

//     let query = { $and: [{ "feedId": feedId }, { "memberId": memberId }, { "activities": activities }]}

//     Feedlog.find(query, function (err, feedlog) {
//         if (err) return next(err);
//         if(feedlog.length == 0) {
//             Feedlog.createFeedlog(newFeedlog, function (err, user) {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     res.send({ message: "Feed shared sucessfully" });
//                 }
//             });
//         } else if(feedlog.length == 1) {
//             let id = feedlog[0]._id;
//             Feedlog.setShare(id, source, function(err, user) {
//                 if (err) {
//                   res.send(err);
//                 }
//                 res.send({ message: "feedlog updated successfully" });
//               });
//         } else {
//             res.json({ error: "Feed not found / Invalid" });
//         }
        
//     });

    
// });
// End of set feed share by FeedID

// Get All Feed Logs
// router.get("/getFeedlogList", function (req, res) {
//     Feedlog.find(function (err, users) {
//         if (err) return next(err);
//         res.json(users);
//     });
// });
// End of Get All Feed Logs

// Edit a Feedlog
// router.put("/editFeedlog/:feedId", function (req, res) {

//     let id = req.params.feedId;
//     let feedId = ObjectId(req.body.feedId);
//     let memberId = ObjectId(req.body.memberId);
//     let activities = req.body.activities;
//     let source = req.body.source;
//     let status = req.body.status;
//     let created_at = req.body.created_at;
//     //let updated_at = req.body.updated_at;
//     let reqbody = req.body;
//     reqbody.updated_at = new Date();
//     //reqbody.updatedAt = new Date();
//     reqbody.feedId = feedId;
    
// //console.log("CK",reqbody);
//     Feedlog.editFeedlog(id, reqbody, function (err, result) {
//         if (err) return next(err);
//         res.send(result);
//     });

// });
// End of Edit a feedlog

// Find by FeedlogId
// router.get("/getFeedlogById/:id", function (req, res) {
//     let id = req.params.id;
//     Feedlog.getFeedlogById(id, function (err, result) {
//         if (err) return next(err);
//         res.send(result);
//     });
// });
// End of Find by FeedlogId

// Get FeedLog by MemberID
// router.post("/findBymemberId", function(req, res) {
//     let id = req.body.id;
//     let memberId = ObjectId(req.body.memberId);
  
//     let query = {
//       $and: [{ id: id }, { memberId: memberId }]
//     };

//     Feedlog.find(query, function(err, result) {
//         if (err) return res.send(err);
//       res.send(result);
//     });
//   });
// End of Get FeedLog by MemberID  


// Delete by feedLog ID
// router.delete("/deleteFeedlog/:id", function (req, res, next) {

//     let id = req.params.id;

//     Feedlog.findById(id, function (err, result) {
//         if (err) return res.send(err);
//         if (result) {
//             Feedlog.findByIdAndRemove(id, function (err, post) {
//                 if (err) return next(err);
//                 res.json({ message: "Deleted Feed Successfully" });
//             });
//         } else {
//             res.json({ error: "FeedID not found / Invalid" });
//         }
//     });

// });
// End of Delete by feedLog ID

// Get Feed Comments by FeedID
// router.get("/getFeedCommentsByFeedId/:feedId", function(req, res) {
//     let feedId = ObjectId(req.params.feedId);
//     Feedlog.aggregate(
//         [
//           {
//             $match: { $and: [{ feedId: ObjectId(feedId) }, { activities: "comment" }] }
//           },
//           {
//             $lookup: {
//               from: "users",
//               localField: "memberId",
//               foreignField: "_id",
//               as: "memberProfile"
//             }
//           },
//           {
//             $project: {
//               _id: 1,
//               source: 1,
//               created_at: 1,
//               "memberProfile._id" : 1,
//               "memberProfile.email" : 1,
//               "memberProfile.firstName" : 1,
//               "memberProfile.lastName" : 1,
//               "memberProfile.aboutMe" : 1,
//               "memberProfile.isCeleb" : 1,
//               "memberProfile.profession" : 1,
//               "memberProfile.avtar_imgPath" : 1
//             }
//           }
//         ],
//         function(err, result) {
//           if (err) {
//             res.send(err);
//           }
//           res.send(result)
//         }
//       );
//   });
// End of Get Feed Comments by FeedID

// End of Get Feed Comments by FeedID



// Get Feed likes by FeedID
// router.get("/getFeedLikesByFeedId/:feedId", function(req, res) {
//     let feedId = ObjectId(req.params.feedId);
//     Feedlog.aggregate(
//         [
//           {
//             $match: { $and: [{ feedId: ObjectId(feedId) }, { activities: "views" }] }
//           },
//           {
//             $lookup: {
//               from: "users",
//               localField: "memberId",
//               foreignField: "_id",
//               as: "memberProfile"
//             }
//           },
//           {
//             $match: {
//               $and: [
//                 { memberProfile: { $ne: [] } }
//               ]
//             }
//           },
//           {
//             $project: {
//               _id: 1,
//               //source: 1,
//               //created_at: 1,
//               "memberProfile._id" : 1,
//               "memberProfile.isCeleb" : 1,
//               "memberProfile.email" : 1,
//               "memberProfile.firstName" : 1,
//               "memberProfile.aboutMe" : 1,
//               "memberProfile.profession" : 1,
//               "memberProfile.lastName" : 1,
//               "memberProfile.avtar_imgPath" : 1
//             }
//           }
//         ],
//         function(err, result) {
//           if (err) {
//             res.send(err);
//           }
//           res.send(result)
//         }
//       );
//   });
// End of Get Feed likes by FeedID



module.exports = router;
