let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let Active, inActive, sent, delivered, seen;

let ChatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  sTransactionId: {
    type: mongoose.Schema.Types.ObjectId
    //required: true
  },
  credits: {
    type:Number,
    default:"0"
  },
  message: {
    type:String,
    default:"0"
  },
  creditStatus: {
    type:String,
    default:"0"
  },
  chatStatus: {
    type: String,
    enum: [Active, inActive],
    default: Active
  },
  messageStatus:{
    type:String,
    enum:[sent, delivered, seen],
    default:sent
  },
  messageSentDate:{
    type:Date
  },
  messageDeliveredDate:{
    type:Date
  },
  messageSeenDate:{
    type:Date
  },
  chatRoomId:{
    type:String,
  },
  isRead:{
    type:Boolean,
    default:false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date ,
    default: Date.now 
  }
}, {
    versionKey: false
});
let collName = "chats";
let Chat = (module.exports = mongoose.model("Chat", ChatSchema, collName));

// Create a Chat

module.exports.createChat = function (newChat, callback) {
  newChat.save(callback);
};

// Edit a Chat

module.exports.editChat = function (id, reqbody, callback) {
  Chat.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getChatById = function (id, callback) {
  Chat.findById(ObjectId(id), callback);
};

// Find by email

module.exports.getChatByEmail = function (email, callback) {
  let query = { email: email };
  Chat.find(query, callback);
};
