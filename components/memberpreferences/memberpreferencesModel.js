let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let MemberPreferencesSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  preferences: {
    type: Array,
    default: []
  },
  celebrities: {
    type: Array,
    default: [],
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
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
    autoIndex: true,
    versionKey: false
  });
MemberPreferencesSchema.index({ memberId: 1, "celebrities.CelebrityId": 1 }, { unique: true });
let MemberPreferences = (module.exports = mongoose.model("MemberPreferences", MemberPreferencesSchema));

// Create New Record

module.exports.createNewRecord = function (newRecord, callback) {
  newRecord.save(callback);
};

// Update a Record

module.exports.editMemberPreferences = function (id, reqbody, callback) {

  let newArr = reqbody.preferences;
  let preferences = newArr.map(function (id) {
    return ObjectId(id);
  });

  //console.log(id);

  MemberPreferences.findByIdAndUpdate(id, { $set: { preferences: preferences } }, callback);
};

// setMemberCelebrityAsFollower

module.exports.setFollower = function (id, reqbody, callback) {

  MemberPreferences.findByIdAndUpdate(id, { $push: { "celebrities": { CelebrityId: ObjectId(reqbody.CelebrityId), isFollower: reqbody.isFollower } } }, callback);
};

// setMemberCelebrityAsFan

module.exports.setFan = function (id, reqbody, callback) {
  MemberPreferences.findByIdAndUpdate(id, { $push: { "celebrities": { CelebrityId: ObjectId(reqbody.CelebrityId), isFan: reqbody.isFan } } }, callback);
};
