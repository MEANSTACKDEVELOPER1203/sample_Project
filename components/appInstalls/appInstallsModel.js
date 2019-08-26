let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let approved;
let rejected;
let appInstallsSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    promoCode: {
        type: String,
        default: ""
    },
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

let appInstall = (module.exports = mongoose.model("appInstalls", appInstallsSchema));

// Create a appInstall
module.exports.createAppInstall = function (newappInstallRecord, callback) {
    newappInstallRecord.save(callback);
  };
  
  // Edit a appInstall document
  
  module.exports.editAppInstall = function (id, reqbody, callback) {
        appInstall.findByIdAndUpdate(id, { $set: reqbody },callback);
  };
  
  // Find by Id
  
  module.exports.getAppInstallInfoById = function (id, callback) {
    appInstall.findById(ObjectId(id), callback);
  };