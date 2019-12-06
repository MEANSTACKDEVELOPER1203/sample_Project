// let express = require("express");
// let router = express.Router();
// let ObjectId = require("mongodb").ObjectID;
// let auditLog = require("./auditLogModel");
// let Feed = require("../../models/feeddata");
// let User = require("../users/userModel");
// let Credits = require("../credits/creditsModel");
// let async = require("async");
// let serviceSchedule = require("../serviceSchedule/serviceScheduleModel");
// let mediaTracking = require("../mediaTracking/mediaTrackingModel");

// // Create an auditLog
// router.post("/create", function (req, res) {
//   let type = req.body.type;
//   let tranRefId = req.body.tranRefId;
//   let memberId = req.body.memberId;
//   req.body.ipAddr = req.connection.remoteAddress;
//   let ipAddr = req.body.ipAddr;
//   let status = req.body.status;
//   let createdAt = req.body.createdAt;

//   let newAuditLog = new auditLog({
//     type: type,
//     tranRefId: tranRefId,
//     memberId: memberId,
//     ipAddr: ipAddr,
//     status: status,
//     createdAt: createdAt
//   });

//   auditLog.createAuditLog(newAuditLog, function (err, user) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.send({ message: "auditLog saved successfully" });
//     }
//   });
// });
// // End of Create an auditLog

// // Update an auditLog
// router.put("/edit/:auditLogID", function (req, res) {
//   let id = req.params.auditLogID;

//   let reqbody = req.body;

//   reqbody.updatedAt = new Date();

//   auditLog.findById(id, function (err, result) {
//     if (result) {
//       auditLog.editAuditLog(id, reqbody, function (err, aResult) {
//         if (err) return res.send(err);
//         res.json({ message: "auditLog Updated Successfully" });
//       });
//     } else {
//       res.json({ error: "auditLogID not found / Invalid" });
//     }
//   });
// });
// // End of Update an auditLog

// // Find by Audit Log ID
// router.get("/getauditlog/:auditLogID", function (req, res) {
//   let id = req.params.auditLogID;
//   auditLog.getAuditLogById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({ error: "auditLogID not found / Invalid" });
//     }
//   });
// });
// // End of Find by Audit Log ID

// // Find by UserId (auditLog)
// router.get("/getByUserID/:UserID", function (req, res) {
//   let id = req.params.UserID;

//   auditLog.getByUserID(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({ error: "auditLogID not found / Invalid" });
//     }
//   });
// });
// // End of Find by UserId (auditLog)

// // Get List of all Audit Log records
// router.get("/getAll", function (req, res) {
//   auditLog.find({}, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   });
// });
// // End of Get List of all Audit Log records

// // Delete by auditLog ID
// router.delete("/delete/:auditLogID", function (req, res, next) {
//   let id = req.params.auditLogID;

//   auditLog.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       auditLog.findByIdAndRemove(id, function (err, post) {
//         if (err) return res.send(err);
//         res.json({ message: "Deleted auditLog Successfully" });
//       });
//     } else {
//       res.json({ error: "auditLogID not found / Invalid" });
//     }
//   });
// });
// // End of Delete by auditLog ID


// // Migration Script Feeds
// router.get("/migration", function (req, res) {
//   let feedMemberIds = [];
//   let userIds = [];
//   let invalidMemberIds = [];
//   // ASYNC Waterfall for performing step by step operations
//   async.waterfall([
//     /// Fetch Total Feed Count
//     function (callback) {
//       Feed.count({}, function (err, result) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         let Count;
//         Count = result
//         let feedCount = { count: Count }
//         callback(null, feedCount);
//       });
//     },
//     /// fetch all the member id's from all feeds and check with database wether exists or not
//     function (feedCount, callback) {
//       Feed.find({}, function (err, feedsData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         feedsData.forEach(feedObj => {
//           feedMemberIds.push(feedObj.memberId)
//         });
//         callback(null, feedMemberIds);
//       });
//     },
//     function (feedMemberIds, callback) {
//       User.find({}, function (err, userData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         userData.forEach(userObj => {
//           userIds.push(userObj._id)
//         });
//         //console.log('feedmemberIds', feedMemberIds.length)
//         //console.log('userIds', userIds.length)
//         feedMemberIds = feedMemberIds.filter(val => !userIds.includes(val));
//         /* var index;
//         for (var i = 0; i < userIds.length; i++) {
//           index = feedMemberIds.indexOf(userIds[i]);
//           if (index > -1) {
//             feedMemberIds.splice(index, 1);
//           }
//         } */
//         //console.log('newIds', feedMemberIds.length)

//         callback(null, userIds);
//       }).lean();
//     }
//   ], function (err, memberObj) {
//     // result now equals 'done'
//     if (err)
//       res.status(200).json({
//         success: 0,
//         message: `${err.message}`
//       });
//     else
//       res.status(200).json({
//         success: 1,
//         feedData: feedMemberIds
//       });
//   });
//   // End of ASYNC
// });
// // End of Migration Script

// // Migration Script Credits
// router.get("/Creditdmigration", function (req, res) {
//   let CreditsMemberIds = [];
//   let userIds = [];
//   let invalidMemberIds = [];
//   // ASYNC Waterfall for performing step by step operations
//   async.waterfall([
//     /// Fetch Total Feed Count
//     function (callback) {
//       Credits.count({}, function (err, result) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         let Count;
//         Count = result
//         let creditsCount = { count: Count }
//         callback(null, creditsCount);
//       });
//     },
//     /// fetch all the member id's from all feeds and check with database wether exists or not
//     function (creditsCount, callback) {
//       Credits.find({}, function (err, creditsData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         creditsData.forEach(creditObj => {
//           CreditsMemberIds.push(creditObj.memberId)
//         });
//         callback(null, CreditsMemberIds);
//       });
//     },
//     function (CreditsMemberIds, callback) {
//       User.find({}, function (err, userData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         userData.forEach(userObj => {
//           userIds.push(userObj._id)
//         });
//         //console.log('creditIds', CreditsMemberIds.length)
//         //console.log('userIds', userIds.length)
//         CreditsMemberIds = CreditsMemberIds.filter(val => !userIds.includes(val));
//         /* dudes = [1,2,3,4,5,6,7]
//         dudesOrginal = [1,2,4,5]
//         console.log('creditIds', dudes.length)
//         console.log(dudes)
//         console.log('userIds', dudesOrginal.length)
//         console.log(dudesOrginal)
//         dudes = dudes.filter(val => !dudesOrginal.includes(val));
//         console.log(dudes) */
//         //console.log('newIds', CreditsMemberIds.length)

//         callback(null, userIds);
//       }).lean();
//     }
//   ], function (err, memberObj) {
//     // result now equals 'done'
//     if (err)
//       res.status(200).json({
//         success: 0,
//         message: `${err.message}`
//       });
//     else
//       res.status(200).json({
//         success: 1,
//         creditsData: CreditsMemberIds
//       });
//   });
//   // End of ASYNC
// });
// // End of Migration Script

// // Migration Script Schedules
// router.get("/Schedulemigration", function (req, res) {
//   let CollectionMemberIds = [];
//   let userIds = [];
//   let invalidMemberIds = [];
//   // ASYNC Waterfall for performing step by step operations
//   async.waterfall([
//     /// Fetch Total Feed Count
//     function (callback) {
//       serviceSchedule.count({}, function (err, result) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         let Count;
//         Count = result
//         let creditsCount = { count: Count }
//         callback(null, creditsCount);
//       });
//     },
//     /// fetch all the member id's from all feeds and check with database wether exists or not
//     function (creditsCount, callback) {
//       serviceSchedule.find({}, function (err, creditsData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         creditsData.forEach(creditObj => {
//           CollectionMemberIds.push(creditObj.senderId)
//           CollectionMemberIds.push(creditObj.receiverId)
//         });
//         callback(null, CollectionMemberIds);
//       });
//     },
//     function (CollectionMemberIds, callback) {
//       User.find({}, function (err, userData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         userData.forEach(userObj => {
//           userIds.push(userObj._id)
//         });
//         //console.log('collectionIds', CollectionMemberIds.length)
//         //console.log('userIds', userIds.length)
//         CollectionMemberIds = CollectionMemberIds.filter(val => !userIds.includes(val));
//         /* dudes = [1,2,3,4,5,6,7]
//         dudesOrginal = [1,2,4,5]
//         console.log('creditIds', dudes.length)
//         console.log(dudes)
//         console.log('userIds', dudesOrginal.length)
//         console.log(dudesOrginal)
//         dudes = dudes.filter(val => !dudesOrginal.includes(val));
//         console.log(dudes) */
//         console.log('newIds', CollectionMemberIds.length)

//         callback(null, userIds);
//       }).lean();
//     }
//   ], function (err, memberObj) {
//     // result now equals 'done'
//     if (err)
//       res.status(200).json({
//         success: 0,
//         message: `${err.message}`
//       });
//     else
//       res.status(200).json({
//         success: 1,
//         collectionMemberIds: CollectionMemberIds
//       });
//   });
//   // End of ASYNC
// });
// // End of Migration Script

// // Migration Script Schedules
// router.get("/Mediamigration", function (req, res) {
//   let CollectionMemberIds = [];
//   let userIds = [];
//   let invalidMemberIds = [];
//   // ASYNC Waterfall for performing step by step operations
//   async.waterfall([
//     /// Fetch Total Feed Count
//     function (callback) {
//       mediaTracking.count({}, function (err, result) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         let Count;
//         Count = result
//         let creditsCount = { count: Count }
//         callback(null, creditsCount);
//       });
//     },
//     /// fetch all the member id's from all feeds and check with database wether exists or not
//     function (creditsCount, callback) {
//       mediaTracking.find({}, function (err, memberData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         memberData.forEach(creditObj => {
//           CollectionMemberIds.push(creditObj.memberId)
//         });
//         callback(null, CollectionMemberIds);
//       });
//     },
//     function (CollectionMemberIds, callback) {
//       User.find({}, function (err, userData) {
//         if (err) return callback(new Error(`Error While fetching member details : ${err}`), null);
//         userData.forEach(userObj => {
//           userIds.push(userObj._id)
//         });
//         //console.log('collectionIds', CollectionMemberIds.length)
//         //console.log('userIds', userIds.length)
//         CollectionMemberIds = CollectionMemberIds.filter(val => !userIds.includes(val));
//         //console.log('newIds', CollectionMemberIds.length)
//         /* dudes = [1,2,3,4,5,6,7]
//         dudesOrginal = [1,2,4,5, 6,7,8,9,10,11,12,13]
//         console.log('creditIds', dudes.length)
//         console.log(dudes)
//         console.log('userIds', dudesOrginal.length)
//         console.log(dudesOrginal)
//         dudes = dudes.filter(val => !dudesOrginal.includes(val));
//         console.log(dudes) */
//         callback(null, userIds);
//       }).lean();
//     }
//   ], function (err, memberObj) {
//     // result now equals 'done'
//     if (err)
//       res.status(200).json({
//         success: 0,
//         message: `${err.message}`
//       });
//     else
//       res.status(200).json({
//         success: 1,
//         collectionMemberIds: CollectionMemberIds
//       });
//   });
//   // End of ASYNC
// });
// // End of Migration Script
// module.exports = router;
