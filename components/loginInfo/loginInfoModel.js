let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let bcrypt = require("bcryptjs");
let Android, IOS, Web;

// Members Schema
let loginsSchema = mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  email: {
    type: String,
    index: true
  },
  username: {
    type: String
  },
  mobile: {
    type: String
  },
  mobileNumber: {
    type: String
  },
  password: {
    type: String,
    default:""
  },
  osType: {
    type: String,
    enum: [Android, IOS, Web],
    default:Web
  },
  token: {
    type: String,
    default:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjNmFhODQyMjUwZDMxMTRmZmU2NzExMiIsImlhdCI6MTU1NDQ3MTk1MCwiZXhwIjoxNTU3MDYzOTUwfQ.ol-C1u7Dag82oMBQJE9ILwE2qYr21FV4sjJOR6_rqGQ"
  },
  lastLoginLocation: {
    type: String,
    default: "IN"
  },
  verified:{
    type: Boolean,
    default: false
  },
  lastLoginDate: { type: Date, default: Date.now  },
  lastLogoutDate: { type: Date, default: Date.now },
  pwdChangeDate: { type: Date },
  resetPasswordToken: {
    type: String,
    default: null
  },
  deviceToken: {
    type: String,
    default: null
  },
  managerDeviceTokens: {
    type: Array,
    default: []
  },
  callingDeviceToken: {
    type: String,
    default: null
  },
  os:{
    type:String,
    default:""
  },
  timezone: {
    type: String,
    default: "+0530"
  },
  resetPasswordExpires: { type: Date, default: null },
  refCreditValue:{
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: Number,
    default: 0
  },
  mobileVerificationCode: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date,
    default: Date.now 
  },
  updatedAt: { 
    type: Date,
    default: Date.now 
  },
  created_by: {
    type: String,
    default: ""
  },
  updated_by: {
    type: String,
    default: ""
  },
},{
  versionKey: false
});

let logins = (module.exports = mongoose.model("logins", loginsSchema));

module.exports.createLoginInfo = function(newLoginInfo, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newLoginInfo.password, salt, function(err, hash) {
      newLoginInfo.password = hash;
      newLoginInfo.save(callback);
    });
  });
};

module.exports.editLoginInfo = function (id, reqbody, callback) {

   logins.findByIdAndUpdate(id, { $set: {password : reqbody.password, resetPasswordToken : reqbody.resetPasswordToken, resetPasswordExpires : reqbody.resetPasswordExpires} },callback);
};

module.exports.getloginInfoByEmail = function(email, callback) {
  let query = { email: email };
  logins.findOne(query, callback);
};
module.exports.getloginInfoBymobileNumber = function(email, callback) {
  let query = { mobileNumber: email };
  logins.findOne(query, callback);
};
module.exports.getloginInfoByUsername = function(email, callback) {
  let query = { username: email };
  logins.findOne(query, callback);
};
module.exports.loginInfoByisCeleb = function(isCeleb, callback) {
  let query = { isCeleb: isCeleb };
  logins.findOne(query, callback);
};

module.exports.getloginInfoById = function(id, callback) {
  logins.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  console.log(candidatePassword)
  console.log(hash)
  console.log("comparePassword inside+++++++++++++++++++++++++++++++++++++")
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};
module.exports.getUserByEmail = function(email, callback) {
  let query = {
    $or: [
      { email: email.toLowerCase() },
      { mobile: email }
    ]
  }
  logins.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  logins.findById(id, callback);
};