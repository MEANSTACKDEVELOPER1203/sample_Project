let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const member = require("../../constants").member;
const manager = require("../../constants").manager;
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
  },
  avtar_imgPath: {
    type: String,
    trim: true,
    default: ""
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
    default:"$2a$10$p.q8.XMCtVLIOFd4Bh4GQ.wJjP8RA3jkoNiZ.ycKMqUPpBen9IhkO"
  },
  email: {
    type: String,
    index: true
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
  location: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  loginType: {
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
    default:Web
  },
  pastProfileImages: {
    type: [{
      avtar_imgPath:{
        type:String,
        trim:true,
        default:""
      },
      updated_at:{
        type:Date,
        default:Date.now
      },
      mimetype:{
        type:String,
        default:"image/png"
      },
      size:{
        type:Number,
        default:0
      },
      _id:0
    }], 
    default: []
  },
  dua:{
    type: Boolean,
    default: true
  }
}, {
    versionKey: false
  });

module.exports = mongoose.model("User", UserSchema);