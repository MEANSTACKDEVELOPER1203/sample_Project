let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let activity;
let financial;
let service;
let success;
let failure;

let auditLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [activity, financial, service],
    default: activity
  },
  tranRefId: {
    type: mongoose.Schema.Types.ObjectId
  },
  memberId: { 
    type: mongoose.Schema.Types.ObjectId ,
    ref:'User'
  },
  ipAddr: { 
    type: String,
    default: "" 
  },
  status: {
    type: String,
    enum: [success, failure],
    default: success
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

let auditLog = (module.exports = mongoose.model("auditLog", auditLogSchema));

module.exports.createAuditLog = function (newAuditLog, callback) {
  newAuditLog.save(callback);
};

// Edit auditLog

module.exports.editAuditLog = function (id, reqbody, callback) {
  auditLog.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (auditLogStatus)

module.exports.getAuditLogById = function (id, callback) {
  auditLog.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getByUserID = function (id, callback) {
  let query = { memberId: id }
  auditLog.find(query, callback);
};

// Find by userName

module.exports.getElogByUserName = function (username, callback) {

  let query = { username: username };
  comLog.find(query, callback);
};