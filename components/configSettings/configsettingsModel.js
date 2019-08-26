let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let configSettingsSchema = new mongoose.Schema({
    defaultPassword: {
        type: String
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
    },{
        versionKey: false
    });

let configSettings = (module.exports = mongoose.model("configSettings", configSettingsSchema));

// Create a configSettings

module.exports.createConfigSettings = function (newConfigSettings, callback) {
    newConfigSettings.save(callback);
};

// Edit a configSettings

module.exports.editConfigSettings = function (id, reqbody, callback) {

    configSettings.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getConfigSettingsById = function (id, callback) {
    configSettings.findById(ObjectId(id), callback);
};

// Find by email

module.exports.getConfigSettingsByEmail = function (email, callback) {
    let query = { email: email };
    configSettings.find(query, callback);
};
module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    configSettings.find(query, callback);
  };

