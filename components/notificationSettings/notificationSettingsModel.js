let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for Notification Settings

let notificationSettingsSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  notificationSettingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref :'notificationMaster',
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: false
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

let notificationSettings = (module.exports = mongoose.model("notificationSettings", notificationSettingsSchema));

// Create New Record

module.exports.createNewRecord = function (newRecord, callback) {
  newRecord.save(callback);
};

// Update a Record

// module.exports.editNotificationSetting = function (id, reqbody, callback) {

//   let isEnabled = reqbody.isEnabled;
//   let id  = ObjectID(req.body.memberId);

//   console.log(id);

//   notificationSettings.findByIdAndUpdate(id, { $set: { isEnabled: isEnabled } }, callback);
// };
