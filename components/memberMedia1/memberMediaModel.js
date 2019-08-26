let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
var Float = require('mongoose-float').loadType(mongoose, 3);


// Schema for member media
let audio;
let video;
let image;

let memberMediaSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: [{
    feedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feed'
    },
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    mediaType: {
      type: String,
    },
    mediaSize: {
      type: Float,
      default: 0.000
    },
    mediaRatio: {
      type: Float,
      default: 0.000
    },
    src: {
      mediaUrl: {
        type: String,
        default: ""
      },
      mediaName: {
        type: String,
        default: ""
      },
      videoUrl: {
        type: String,
        default: ""
      },
      thumbnail: {
        type: String,
        default: ""
      }
    },
    faceFeatures: [{
      posX: {
        type: Number,
      },
      posY: {
        type: Number,
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      }
    }],
    status: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      //default: Date.now
    },
  }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
    autoIndex: true,
    versionKey: false
  });
memberMediaSchema.index({ "media.mediaId": 1 }, { unique: true });
let collName = "membermedias";
let memberMedia = (module.exports = mongoose.model("memberMedia", memberMediaSchema, collName));

module.exports.createMedia = function (newMedia, callback) {
  newMedia.save(callback);
};

// Edit a ComLog

module.exports.editElog = function (id, reqbody, callback) {
  memberMedia.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id (getComLogStatus)

module.exports.getComLogById = function (id, callback) {
  memberMedia.findById(ObjectId(id), callback);
};

// Find by userName

module.exports.getElogByUserName = function (username, callback) {
  //console.log(username);
  let query = { username: username };
  memberMedia.find(query, callback);
};

module.exports.findByMemberId = function (query, callback) {
  memberMedia.findOne(query, callback);
}
