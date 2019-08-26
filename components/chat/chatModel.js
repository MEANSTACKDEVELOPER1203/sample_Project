// let mongoose = require("mongoose");
// let ObjectId = require("mongodb").ObjectID;
// let active, inactive;

// let chatSchema = new mongoose.Schema({
//     senderId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     receiverId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     sTransactionId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     credits: Number,
//     message: String,
//     creditStatus: String,
//     chatStatus: {
//         type: String,
//         enum: [active, inactive],
//         default: active
//     },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date }
// },{
//         versionKey: false
// });

// let collName = "chats";
// let Chat = mongoose.model("Chat", chatSchema, collName);

// module.exports = Chat;