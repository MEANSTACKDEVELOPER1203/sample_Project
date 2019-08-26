let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let bcrypt = require("bcryptjs");

let view, viewAndEdit, FullAccess;

//Admin Schema
let AdminSchema = mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  password: {
    type: String,
    trim: true,
    required: true
  },
  mobileNumber: {
    type: Number,
    trim: true
  },
  avtarImgPath: {
    type: String,
    trim: true,
    default: ""
  },
  avtarOriginalname: {
    type: String,
    trim: true,
    default: ""
  },
  dateOfBirth: {
    type: String,
    default: ""
  },
  emailVerificationStatus: {
    type: String,
    default: ""
  },
  mobileVerificationStatus: {
    type: String,
    index: true
  },
  accountStatus: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: ""
  },
  permissions: [
    {
      //id: mongoose.Schema.Types.ObjectId,
      moduleName: {
        type: String,
        required: true
      },
      parentMenuId: {
        type: String,
        default: null
      },
      parentModuleId: {
        type: String,
        default: null
      },
      access: {
        type: String,
        enum: [view, viewAndEdit, FullAccess],
        default: "view"
      }
    }
  ],
  createdBy: {
    type: String,
    default: ""
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: {
    type: String,
    default: ""
  },
  updatedDate: { 
    type: Date, 
    default: Date.now 
  },
  isDeleted: {
    type: String,
    default: ""
  },
  lastLoginDate: { 
    type: Date, default: "" 
  },
  lastLogoutDate: { 
    type: Date, default: "" 
  },
  lastLoginLocation: {
    type: String,
    default: ""
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  token:{
    type: String,
    default: null
  },
  resetPasswordExpires: { type: Date, default: null },
},
  {
    versionKey: false
  });

let Admin = (module.exports = mongoose.model("Admin", AdminSchema));

module.exports.createAdmin = function (newUser, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports.getUserById = function (id, callback) {
  Admin.findById(id, callback);
};