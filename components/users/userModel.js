let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const member = require("../../constants").member;
const manager = require("../../constants").manager;
const follower = require("../../constants").follower;
const fan = require("../../constants").fan;
let ObjectId = require("mongodb").ObjectID;
let viewer;
let administrator;
let contributor;
let A;
let B;
let C;
let D;
let Android, IOS, Web;
// Members Schema
let UserSchema = mongoose.Schema({
  username: {
    type: String
  },
  mobileNumber: {
    type: String
  },//with country code
  mobile: {
    type: String
  },//without country code
  isUsernameVerified: {
    type: Boolean,
    default: false
  },
  avtar_imgPath: {
    type: String,
    trim: true,
    default: "/"
  },
  avtar_originalname: {
    type: String,
    trim: true,
    default: ""
  },
  imageRatio: {
    type: String,
    default: ""
  },
  password: {
    type: String,
    default: ""
  },
  email: {
    type: String,
  },
  name: {
    type: String,
    default: ""
  },
  firstName: {
    type: String,
    default: ""
  },
  lastName: {
    type: String,
    default: ""
  },
  prefix: {
    type: String,
    default: ""
  },
  aboutMe: {
    type: String,
    default: ""
  },
  // location: {
  //   type: String,
  //   default: ""
  // },
  country: {
    type: String,
    default: ""
  },
  loginType: {
    type: String,
    default: ""
  },
  location: {
    latitude: {
      type: String,
      default: ""
    },
    longitude: {
      type: String,
      default: ""
    },
    areaName: {
      type: String,
      default: ""
    }
  },
  socialMediaType: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: [member, manager],
    default: member
  },
  gender: {
    type: String,
    default: ""
  },
  dateOfBirth: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  referralCode: {
    type: String,
    default: ""
  },
  cumulativeSpent: {
    type: Number,
    default: 0
  },
  cumulativeEarnings: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: String, // format should be like "ServiceType-DateTime"
    default: ""
  },
  profession: {
    type: String,
    default: ""
  },
  industry: {
    type: String,
    default: ""
  },
  userCategory: {
    type: String,
    enum: [A, B, C, D],
    default: ""
  },
  liveStatus: {
    type: String,
    default: "offline"
  },
  status: {
    type: Boolean,
    default: true
  },
  isCeleb: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isEditorChoice: {
    type: Boolean,
    default: false
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  callStatus: {
    type: String,
    default: "false"
  },
  isMobileVerified: {
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
  celebRecommendations: {
    type: Boolean,
    default: false
  },
  Dnd: {
    type: String,
    default: false
  },
  celebToManager: {
    type: Array,
    default: []
  },
  author_status: {
    type: String,
    enum: [viewer, contributor, administrator],
    default: viewer
  },
  iosUpdatedAt: {
    type: String,
    default: ""
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
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
  IsDeleted: {
    type: Boolean,
    default: false
  },
  isPromoter: {
    type: Boolean,
    default: false
  },
  isManager: {
    type: Boolean,
    default: false
  },
  managerRefId: {
    type: String,
    default: null
  },
  promoterRefId: {
    type: String,
    default: null
  },
  charityRefId: {
    type: String,
    default: null
  },
  celebCredits: {
    type: String,
    default: ""
  },
  /// Manager Profile Parameters
  alternateEmail: {
    type: String,
    default: ""
  },
  alternateCountry: {
    type: String,
    default: ""
  },
  alternateMobile: {
    type: String,
    default: ""
  },
  areaOfSpecialization: {
    type: String,
    default: ""
  },
  managerIndustry: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  managerCategory: {
    type: [],
    default: []
  },
  managerSubCategory: {
    type: [],
    default: []
  },
  experience: {
    type: Number,
    default: 0
  },
  languages: {
    type: Array,
    default: []
  },
  celebritiesWorkedFor: {
    type: [{
      celebrityName: { type: String, default: "" },
      experienceInYear: { type: String, default: "" },
      experienceInMonths: { type: String, default: "" }
    }],
    default: []
  },
  website: {
    type: String,
    default: ""
  },
  facebookLink: {
    type: String,
    default: ""
  },
  twitterLink: {
    type: String,
    default: ""
  },
  osType: {
    type: String,
    enum: [Android, IOS, Web],
  },
  preferenceId: mongoose.Schema.Types.ObjectId,
  pastProfileImages: {
    type: [{
      avtar_imgPath: {
        type: String,
        trim: true,
        default: ""
      },
      updated_at: {
        type: Date,
        default: Date.now
      },
      mimetype: {
        type: String,
        default: "image/png"
      },
      size: {
        type: Number,
        default: 0
      },
      _id: 0
    }],
    default: []
  },
  cover_imgPath: {
    type: String,
    default: ""
  },
  cover_originalname: {
    type: String,
    default: ""
  },
  pastCoverImages: {
    type: [{
      avtar_imgPath: {
        type: String,
        trim: true,
        default: ""
      },
      updated_at: {
        type: Date,
        default: Date.now
      },
      mimetype: {
        type: String,
        default: "image/png"
      },
      size: {
        type: Number,
        default: 0
      },
      _id: 0
    }],
    default: []
  },
  custom_imgPath: {
    type: String,
    default: ""
  },
  dua: {
    type: Boolean,
    default: false
  },
  category: {
    type: String
  }
}, {
  versionKey: false
});

let User = (module.exports = mongoose.model("User", UserSchema));

module.exports.createUser = function (newUser, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

// Edit celeb status

module.exports.editCelebStatus = function (id, reqbody, callback) {
  User.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

module.exports.getUserByEmail = function (email, callback) {
  // let query = { email: email };
  let query = {
    $or: [
      { email: email.toLowerCase() },
      { mobile: email }
    ]
  }
  User.findOne(query, callback);
};

module.exports.getUserBymobileNumber = function (email, callback) {
  let query = { mobileNumber: email };
  User.findOne(query, callback);
};

module.exports.getUserByUsername = function (email, callback) {
  let query = { username: email };
  User.findOne(query, callback);
};

module.exports.getUserByisCeleb = function (isCeleb, id, callback) {
  let query = { $and: [{ isCeleb: true }, { _id: { $ne: id } }] };
  User.find(query, { password: 0 }, callback);
};

module.exports.getCelebSearch = function (isCeleb, id, string, callback) {
  let query = {
    $and: [
      { isCeleb: true },
      { _id: { $ne: ObjectId(id) } },
      { firstName: string }
    ]
  };
  User.find(query, callback);
};

module.exports.getUserByisTrending = function (isTrending, callback) {
  let query = { $and: [{ isTrending: isTrending }, { isCeleb: true }] };
  User.find(query, callback);
};

module.exports.getUserByisOnline = function (isOnline, userID, callback) {
  //console.log(isOnline, userID);
  let query = {
    $and: [{ isOnline: isOnline }, { isCeleb: true }, { _id: { $ne: userID } }]
  };
  User.find(query, callback);
};

module.exports.getUserByisEditorChoice = function (isEditorChoice, callback) {
  let query = { $and: [{ isEditorChoice: isEditorChoice }, { isCeleb: true }] };
  User.find(query, callback);
};

module.exports.getUserByisPromoted = function (isPromoted, callback) {
  let query = { $and: [{ isPromoted: isPromoted }, { isCeleb: true }] };
  User.find(query, callback);
};
module.exports.getUserByisManager = function (isManager, callback) {
  let query = { $and: [{ isManager: isManager }] };
  User.find(query, callback);
};
module.exports.getUserByisPromoter = function (isPromoter, callback) {
  let query = { $and: [{ isPromoter: isPromoter }] };
  User.find(query, callback);
};

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};



/***********************P-K***********************/


//get member details by id
module.exports.findMemberById = function (memberId, cb) {
  User.findById({ _id: memberId }, { password: 0 }, (err, userDetailsObj) => {
    if (err) {
      return cb(err, null);
    } else {
      return cb(null, userDetailsObj);
    }
  });
}

module.exports.findOnlineCelebrities = function (objectIdArray, cb) {
  let query = {
    $and: [{ '_id': { $in: objectIdArray } }, { isOnline: true }, { liveStatus: "online" }, { isCeleb: true }, { IsDeleted: false }]
  };
  User.find(query, { aboutMe: 1, profession: 1, isCeleb: 1, isOnline: 1, username: 1, firstName: 1, lastName: 1, imageRatio: 1, avtar_imgPath: 1, cover_imgPath: 1 }, (err, listOfOnlineCelebObj) => {
    if (!err)
      return cb(null, listOfOnlineCelebObj);
    else
      return cb(err, null)
  }).lean();
}

module.exports.findOnlineCelebritiesForSocket = function (objectIdArray, cb) {
  //{ isOnline: true },
  let query = {
    $and: [{ '_id': { $in: objectIdArray } }, { isOnline: true }, { liveStatus: "online" }, { isCeleb: true }, { IsDeleted: false }]
  };
  User.find(query, { aboutMe: 1, profession: 1, isCeleb: 1, isOnline: 1, username: 1, firstName: 1, lastName: 1, imageRatio: 1, avtar_imgPath: 1, }, (err, listOfOnlineCelebObj) => {
    if (!err)
      return cb(null, listOfOnlineCelebObj);
    else
      return cb(err, null)
  }).lean();
}