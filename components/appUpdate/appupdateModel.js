let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let android, ios, windows, web;
// Schema for App Update Info
let appUpdateInfoSchema = new mongoose.Schema({
    platform: {
        type: String,
        enum: [android, ios, windows, web],
        required: true
    },
    info: {
        previousVersion: {
            type: String
        },
        currentVersion: {
            type: String
        },
        previousBuild: {
            type: String
        },
        currentBuild: {
            type: String
        },
        update: {
            type: Boolean,
            default: "false"
        },
        isForce: {
            type: Boolean,
            default: "false"
        }
    },
    status: {
        type: Boolean,
        default: "true"
    },
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
    updateBy: {
        type: String,
        default: ""
    }
}, {
    versionKey: false
});

let appUpdate = (module.exports = mongoose.model("appupdates", appUpdateInfoSchema));

// Create an App Update Record
module.exports.createAppUpdate = function (newAppUpdate, callback) {
    newAppUpdate.save(callback);
  };

// Update an App Update Record
module.exports.editAppUpdate = function (id, reqbody, callback) {
    appUpdate.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
  };