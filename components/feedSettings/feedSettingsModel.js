let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
var Schema = new mongoose.Schema;

// Schema for Notification Settings

let feedSettingsSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    //required: true
  },
  feedId: { 
    type: mongoose.Schema.Types.ObjectId, 
    //required: true
  },
  celebId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    //required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: ""
  },
  updatedBy: {
    type: String,
    default: ""
  },
}, {
    versionKey: false
  });

let feedSettings = (module.exports = mongoose.model("feedSettings", feedSettingsSchema));

// Create New Record

module.exports.createNewRecord = function (newRecord, callback) {
  newRecord.save(callback);
};

// Update a Record