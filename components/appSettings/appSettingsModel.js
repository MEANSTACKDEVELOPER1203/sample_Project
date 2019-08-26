let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for App Settings

let appSettingsSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required: true
  },
  nightMode: {
     type: Boolean, 
     default: true 
  },
  doNotDisturb: { 
    type: Boolean, 
    default: true 
  },
  dndDuration: { 
    type: Number, 
    default: 0 
  }, // In Minutes
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date,
    default: Date.now  
  }
},
{
  versionKey: false
});

let appSettings = (module.exports = mongoose.model("appSettings", appSettingsSchema));

module.exports.createAppSetting = function (newAppSetting, callback) {
  newAppSetting.save(callback);
};
