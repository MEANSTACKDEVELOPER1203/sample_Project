let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let active, inactive, plain, html;

// Schema for App CMS
let appCmsSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true
  },
  areaName: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  text: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: [plain, html],
    default: "plain"
  },
  media: [{
    mediaTitle: {
      type: String,
      default: ""
    },
    mediaUrl: {
      type: String,
      default: ""
    }
  }],
  status: {
    type: String,
    enum: [active, inactive],
    default: "active"
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
  }
},
{
  versionKey: false
}
);

let appCms = (module.exports = mongoose.model(
  "appCms",
  appCmsSchema
));

// Create an AppCms Record
module.exports.createAppCms = function (newAppCms, callback) {
  newAppCms.save(callback);
};

// Edit an AppCms Record
module.exports.editAppCms = function (id, reqbody, callback) {
  appCms.findByIdAndUpdate(id, {
    $set: reqbody
  }, callback);
};