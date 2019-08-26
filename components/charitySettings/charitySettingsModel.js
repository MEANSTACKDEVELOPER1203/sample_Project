let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for Charity Settings

let charitySettingsSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  charityName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ""
  },
  charityRegistrationID: {
    type: String,
    required: true
  },
  certificateURL: {
    type: String,
    default: ""
  },
  bankName: {
    type: String,
    default: ""
  },
  beneficiaryName: {
    type: String,
    default: ""
  },
  accountNo: {
    type: Number
  },
  routingNo: {
    type: Number
  },
  branchName: {
    type: String,
    default: ""
  },
  swiftOrIfscCode: {
    type: String,
    default: ""
  },
  charityTrustDesc: {
    type: String,
    default: ""
  },
  payoutSettings: [{
    // settingsId: {
    // type: mongoose.Schema.Types.ObjectId
    // },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    video: {
      type: Number
    },
    audio: {
      type: Number
    },
    chat: {
      type: Number
    },
    ecommerce: {
      type: Number
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: ""
  },
  updatedAt: {
    type: Date,
    default: Date.now 
  },
  updatedBy: {
    type: String,
    default: ""
  },
}, {
  versionKey: false
});

let charitySettings = (module.exports = mongoose.model("charitySettings", charitySettingsSchema));

module.exports.createCharitySetting = function (newCharitySetting, callback) {
  newCharitySetting.save(callback);
};

// Edit a charitySettings

module.exports.editCharitySettings = function (charityId, reqbody, callback) {
  charitySettings.findByIdAndUpdate(charityId, {
    $set: reqbody
  }, callback);
};

// Find by Id

module.exports.getCharitySettingsById = function (id, callback) {
  charitySettings.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
  let query = {
    memberId: id
  };
  charitySettings.find(query, callback);
};