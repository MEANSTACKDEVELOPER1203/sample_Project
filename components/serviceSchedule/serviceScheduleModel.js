let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let audio;
let video;
let chat;
let dropped;
let created;
let approved;
let rejected;
let waitingToProcess;
let underProcess;
let processedSuceessfully;
let processFailed;
let rescheduled;
let scheduled,membercalling, celebritycalling, memberAccepted,memberRejected,celebAccepted,celebRejected,celebdisconnected,memberNotResponded,celebNotResponded,celebNotResponded2,celebNotResponded3,reschduled,canceled,blocked,completed,deleted;

let serviceScheduleSchema = new mongoose.Schema({
  service_type:{
    type: String,
    enum: [audio, video, chat],
    required: true
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  startTime: { 
    type: Date, 
    required: true
  },
  endTime: { 
    type: Date
  },
  credits: {
    type : Number,
    default: 0
  },
  schuduledDuration: {
    type : Number,
    default: 0
  },
  actualChargedCredits: {
    type : Number,
    default: 0
  },
  serviceSchduleStatus: {
    type: String,
    enum: [created,scheduled,membercalling,celebritycalling,memberAccepted,memberRejected,celebAccepted,celebRejected,celebdisconnected,memberNotResponded,celebNotResponded,celebNotResponded2,celebNotResponded3,reschduled,canceled,blocked,completed,deleted],
    default: "scheduled"
  },
  transactionStatus: {
    type: String,
    enum: [waitingToProcess,underProcess,processedSuceessfully,processFailed,rescheduled,blocked],
    default: "waitingToProcess"
  },
  refSlotId: { 
    type: mongoose.Schema.Types.ObjectId
  },
  refCartId: { 
    type: mongoose.Schema.Types.ObjectId
  },
  createdBy: {
    type : String, 
    default: ""
  },
  updatedBy:  {
    type : String, 
    default: ""
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
},{
  versionKey: false
});

let serviceSchedule = (module.exports = mongoose.model("serviceSchedule", serviceScheduleSchema));

// create ServiceSchedule

module.exports.createServiceSchedule = function(newServiceSchedule, callback) {
  newServiceSchedule.save(callback);
};

// Edit serviceSchedule

module.exports.editServiceSchedule = function(id, reqbody, callback) {
  serviceSchedule.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody },callback);
};

// Find by Id (getServiceScheduletatus)

module.exports.getServiceScheduleById = function(id, callback) {
  serviceSchedule.findById(ObjectId(id), callback);
};

// Find by UserId (getServiceScheduletatus)

module.exports.getByUserID = function(id, callback) {
  let query = { $or: [ {senderId : id}, {receiverId : id} ] };
  serviceSchedule.find(query, callback);
};