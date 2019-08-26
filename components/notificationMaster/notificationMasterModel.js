let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let active, inactive;

let notificationMasterSchema = new mongoose.Schema({
    notificationName:{
        type: String,
        default:"",
    },
    notificationType:{
        type: String,
        default:"",
    },
    notificationStatus : {
        type: String,
        enum: [active, inactive],
        default: inactive
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    createdBy:{
        type: String,
        default:"",
    },
    updatedBy:{
        type: String,
        default:"",
    },
},{
    versionKey: false
});

let notificationMaster = (module.exports = mongoose.model("notificationMaster", notificationMasterSchema));

// Create a notificationMaster
module.exports.createNotificationMaster = function (newNotificationMaster, callback) {
    newNotificationMaster.save(callback);
};

// Edit a notificationMaster

module.exports.editNotificationMaster = function (id, reqbody, callback) {
    notificationMaster.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getNotificationMasterById = function (id, callback) {
    notificationMaster.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    notificationMaster.find(query, callback);
  };

