// let express = require("express");
// let router = express.Router();
// let ObjectId = require("mongodb").ObjectID;
// let Chat = require("../models/chat");
// let Credits = require("../components/credits/creditsModel");
// let User = require("../components/users/userModel");

// // Create a Chat
// router.post("/createChat", function (req, res) {
//   let senderId = req.body.senderId;
//   let receiverId = req.body.receiverId;
//   let message = req.body.message;
//   let sTransactionId = req.body.sTransactionId;
//   let credits = req.body.credits;
//   let creditStatus = req.body.creditStatus;
//   let chatStatus = req.body.chatStatus;
//   let senderUUID = req.body.senderUUID;
//   let receiverUUID = req.body.receiverUUID;

//   let newChat = new Chat({
//     senderId: senderId,
//     receiverId: receiverId,
//     message: message,
//     sTransactionId: sTransactionId,
//     credits: credits,
//     creditStatus: creditStatus,
//     chatStatus: chatStatus,
//     senderUUID: senderUUID,
//     receiverUUID: receiverUUID
//   });

//   Chat.createChat(newChat, function (err, user) {
//     if (err) {
//       res.send(err);
//     } else {
//       // Start of Fetch Latest Credits Information
//       //console.log(req.body);

//       Credits.find(
//         { memberId: senderId },
//         null,
//         { sort: { createdAt: -1 } },
//         function (err, cBal) {
//           if (err) return res.send(err);
//           if (cBal) {
//             cBalObj = cBal[0];
//             if (cBalObj <= 0) {
//               res.send({
//                 error: "Insufficiant credits"
//               });
//             } else {
//               oldCumulativeCreditValue = parseInt(cBalObj.cumulativeCreditValue);
//               newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(credits);
//               newReferralCreditValue = cBalObj.referralCreditValue;
//               let newCredits = new Credits({
//                 memberId: senderId,
//                 creditType: "debit",
//                 status: "active",
//                 referralCreditValue: newReferralCreditValue,
//                 creditValue: user.credits,
//                 cumulativeCreditValue: newCumulativeCreditValue,
//                 memberReferCreditValue: cBalObj.memberReferCreditValue,
//                 remarks: "debited for chat"
//               });
//               // Insert Into Credit Table
//               Credits.createCredits(newCredits, function (err, credits1) {
//                 if (err) {
//                   //res.send(err);
//                 } else {
//                   // res.send({
//                   //   message: "Credits updated successfully",
//                   //   creditsData: credits
//                   // });
//                   // Update Cumulative Spent in User Object
//                   User.findOne({ _id: senderId }, function (err, uResult) {
//                     nId = uResult._id;
//                     oldValue = parseInt(uResult.cumulativeSpent);
//                     let newbody = {};
//                     newbody.cumulativeSpent = parseInt(credits) + parseInt(oldValue);
//                     User.findByIdAndUpdate(nId, newbody, function (
//                       err,
//                       upResult
//                     ) { });
//                   });
//                   // end of Update Cumulative Spent in User Object
//                 }
//               });
//             }
//             // End of Inset into Credit Table
//           } else {
//             // console.log("credits not exists");
//           }
//         }
//       ); // End of Create Credits
//       res.send({ message: "Chat saved sucessfully" });
//     }
//   });
// });
// // End of Create a Chat

// // Update a Chat
// router.put("/editChat/:id", function (req, res) {
//   let reqbody = req.body;

//   Chat.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
//     if (err) return res.send(err);
//     res.json({ message: "Chat Updated Successfully" });
//   });
// });
// // End of Update a Chat

// // Find by ChatID
// router.get("/findByChatId/:Id", function (req, res) {
//   let id = req.params.Id;

//   Chat.getChatById(id, function (err, result) {
//     if (err) return res.send(err);
//     res.send(result);
//   });

// });
// // End of Find by ChatID

// // Find chat history by Id's
// router.post("/findByChat", function (req, res) {
//   let senderId = req.body.senderId;
//   let receiverId = req.body.receiverId;
//   let query = {
//     $and: [{ senderId: senderId }, { receiverId: receiverId }]
//   };
//   Chat.find(query, function (err, result) {
//     if (err) return res.send(err);
//     res.send(result);
//   });
// });
// // End of Find chat history by Id's

// // Delete chat by ID
// router.delete("/deleteChatById/:id", function (req, res, next) {
//   let id = req.params.id;

//   Chat.findByIdAndRemove(id, function (err, post) {
//     if (err) return next(err);
//     res.json({ message: "Deleted Chat Successfully" });
//   });
// });
// // End of Delete chat by ID

module.exports = router;
