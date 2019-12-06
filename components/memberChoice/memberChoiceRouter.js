// let express = require("express");
// let router = express.Router();
// let ObjectId = require("mongodb").ObjectID;
// let memberChoice = require("./memberChoiceModel");
// let User = require("../users/userModel");
// let multer = require("multer");

// // Image Upload Settings
// let storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, "uploads/memberChoice/");
//   },
//   filename: function(req, file, cb) {
//     var today = new Date();
//     var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//     cb(null, "ck"+"_pr2"+"_"+date+"_"+Date.now()+"_"+file.originalname);
//   }
// });

// let upload = multer({
//   storage: storage
// });
// // End of Image upload settings

// // Create a MemberChoice
// router.post("/createMemberChoice", upload.any(), function(req, res) {
//   let memberId = req.body.memberId;
//   let celebrityName = req.body.celebrityName.toLowerCase();
//   let createdBy = req.body.createdBy;
//   let industry = req.body.industry;
//   let memberChoice_imgPath = req.body.memberChoice_imgPath;
//   let memberChoice_originalname = req.body.memberChoice_originalname;
//   let files = req.files;
//   if (files) {
//     if (files.length > 0) {
//       let memberChoice_imgPath = req.files[0].path;
//       let memberChoice_originalname = req.files[0].originalname;
//       let newMemberChoice = new memberChoice({
//         memberId: memberId,
//         celebrityName: celebrityName,
//         industry: industry,
//         createdBy: createdBy,
//         memberChoice_imgPath: memberChoice_imgPath,
//         memberChoice_originalname: memberChoice_originalname
//       });

//       memberChoice.createMemberChoice(newMemberChoice, function(err, post) {
//         if (err) {
//           res.send(err);
//         } else {
//           res.json({
//             message: "memberChoice added sucessfully",
//             newMemberChoice: newMemberChoice
//           });
//           newBody = {};
//           newBody.celebRecommendations = true;
//           newBody.updatedAt = new Date();

//           User.findByIdAndUpdate(memberId, newBody, function(err, result) {
//             if (err) return res.send(err);
//           });
//         }
//       });
//     } else {
//       let newMemberChoice = new memberChoice({
//         memberId: memberId,
//         celebrityName: celebrityName,
//         industry: industry,
//         createdBy: createdBy,
//         memberChoice_imgPath: memberChoice_imgPath,
//         memberChoice_originalname: memberChoice_originalname
//       });

//       memberChoice.createMemberChoice(newMemberChoice, function(err, post) {
//         if (err) {
//           res.send(err);
//         } else {
//           res.json({
//             message: "memberChoice added sucessfully",
//             newMemberChoice: newMemberChoice
//           });
//           newBody = {};
//           newBody.celebRecommendations = true;
//           newBody.updatedAt = new Date();

//           User.findByIdAndUpdate(memberId, newBody, function(err, result) {
//             if (err) return res.send(err);
//           });
//         }
//       });
//     }
//     // End of 1st Else If
//   } else {
//     let newMemberChoice = new memberChoice({
//       memberId: memberId,
//       celebrityName: celebrityName,
//       industry: industry,
//       createdBy: createdBy,
//       memberChoice_imgPath: memberChoice_imgPath,
//       memberChoice_originalname: memberChoice_originalname
//     });

//     memberChoice.createMemberChoice(newMemberChoice, function(err, post) {
//       if (err) {
//         res.send(err);
//       } else {
//         res.json({
//           message: "memberChoice added sucessfully",
//           newMemberChoice: newMemberChoice
//         });
//         newBody = {};
//         newBody.celebRecommendations = true;
//         newBody.updatedAt = new Date();

//         User.findByIdAndUpdate(memberId, newBody, function(err, result) {
//           if (err) return res.send(err);
//         });
//       }
//     });
//   }
// });
// // End of Create a MemberChoice

// // Update a MemberChoice
// router.put("/editMemberChoice/:memberChoiceID", function(req, res) {
//   let id = req.params.memberChoiceID;

//   let reqbody = req.body;

//   memberChoice.findByIdAndUpdate(id, reqbody, function(err, result) {
//     if (err) {
//       res.json({
//         error: "MemberChoice Not Exists / Send a valid UserID"
//       });
//     } else {
//       res.json({ message: "MemberChoice Updated Successfully" });
//     }
//   });
// });
// // End of Update a MemberChoice

// // Get Recommended LeaderBoard
// router.get("/getRecommendedLeaderBoard/:CelebName", function(req, res) {
//   let cName = req.params.CelebName;
//   memberChoice.find({ celebrityName: cName.toLowerCase() }, function(
//     err,
//     result
//   ) {
//     if (err) return res.send(err);
//     if (result) {
//       res.json({ count: result.length });
//     } else {
//       res.json({
//         error: "MemberChoice document Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
// // End of Get Recommended LeaderBoard

// // Find by memberChoice ID
// router.get("/findById/:memberChoiceId", function(req, res) {
//   let id = req.params.memberChoiceId;

//   memberChoice.findOne({ _id: id }, function(err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "MemberChoice document Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
// // End of Find by memberChoice ID

// // Find member choices by UserID
// router.get("/getByUserID/:UserID", function(req, res) {
//   let id = req.params.UserID;

//   memberChoice.getMemberChoiceById(id, function(err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "MemberChoice document Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
// // End of Find member choices by UserID

// // get list of all memberchoices
// router.get("/getAll", function(req, res) {
//   memberChoice.find({}, function(err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   }).sort({createdAt:-1});
// });
// // End of get list of all memberchoices

// // Delete a memberchoice
// router.delete("/delete/:id", function(req, res, next) {
//   let id = req.params.id;

//   memberChoice.findByIdAndRemove(id, function(err, post) {
//     if (err) {
//       res.json({
//         error: "MemberChoice document Not Exists / Send a valid ID"
//       });
//     } else {
//       res.json({ message: "Deleted MemberChoice Successfully" });
//     }
//   });
// });
// // End of Delete a memberchoice

// module.exports = router;
