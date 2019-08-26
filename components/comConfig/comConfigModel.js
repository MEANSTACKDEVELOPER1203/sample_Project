let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for Email Communication

let ComConfigSchema = new mongoose.Schema({
    mode: {
        type: String
    },
    config: {
        type: Array
    },
    status: {
        type: String
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
},{
    versionKey: false
});

let ComConfig = (module.exports = mongoose.model("ComConfig", ComConfigSchema));

module.exports.createEconfig = function (newConfig, callback) {
    newConfig.save(callback);
};

// Edit a Post

module.exports.editEconfig = function (id, reqbody, callback) {
    ComConfig.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getEconfigById = function (id, callback) {
    ComConfig.findById(ObjectId(id), callback);
};

// Find by userName

module.exports.getEconfigByUserName = function (username, callback) {
    let query = { username: username };
    ComConfig.find(query, callback);
};