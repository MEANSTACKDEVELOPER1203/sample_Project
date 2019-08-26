let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let pending, requested, approved, rejected;

// Schema for celebManagers
let celebManagersSchema = new mongoose.Schema({
    celebrityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
        // type:String
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
        // type:String
    },
    // Manin Manager ID
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
        // type:String,
        // default :"0"
    },
    // Manin Manager ID if object is in sub sub manager level
    mainManagerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
        // type:String,
        // default :"0"
    },
    // If Admin is recommedning Manager to Celebrity, then "isAdminReq" will be set to "true"
    isAdminReq: {
        type: Boolean,
        default: false
    },
    // If Celebrity sends a request from Manager Search "isCelebReq" will be set to "true"
    isCelebReq: {
        type: Boolean,
        default: false
    },
    // if Celebrity / Manager profile is suspended and wants to send request again and if Celebrity Accepeted the request, "isCelebReqNew" is set to "true"
    isCelebReqNew: {
        type: Boolean,
        default: false
    },
    // if Celebrity / Manager profile is suspended and wants to send request again and if Manager Accepeted the request, "isCelebReqNew" is set to "true"
    isManagerReqNew: {
        type: Boolean,
        default: false
    },
    // if Celebrity accepted the request, "isCelebAccepted" is set "true"
    isCelebAccepted: {
        type: Boolean,
        default: false
    },
    // if Manager accepted the request, "isManagerAccepted" is set to "true"
    isManagerAccepted: {
        type: Boolean,
        default: false
    },
    // Status field will be set according the operation
    status: {
        type: String,
        enum: ["pending", "requested", "approved", "rejected", "celebritySuspendManager", "managerSuspendCelebrity", "suspendCelebrity", "rejectManager", "rejectCelebrity", "cancelManagerRequest","Recommended"],
        default: "pending"
    },
    // when celebrity / manager is getting suspended / rejected, feedBack can be collected using "feedBack" key
    feedBack: {
        type: String,
        default: ""
    },
    // If Celebity wants to turn ON / OFF the access and permissions to a Manager, set "isAccess" to "true" / "false"
    // When Manager / Celebrity / Assistant Manager profiles are suspended/rejected from settings, "isAccess" is set to "false"
    isAccess:{
        type: Boolean,
        default: false
    },
    // If both celebrity and manager OR manager and Assistant Manager accepted the requests, "isActive" is set to "true"
    // When Manager / Celebrity / Assistant Manager profiles are suspended/rejected from settings, "isActive" is set to "false"
    isActive:{
        type: Boolean,
        default: false
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
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    isSuspended: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false
});

let celebManager = (module.exports = mongoose.model(
    "celebManagers",
    celebManagersSchema
));

// Create a new celebManager document
module.exports.createCelebManager = function (newCelebManager, callback) {
    newCelebManager.save(callback);
};

// Edit an AppCms Record
module.exports.editAppCms = function (id, reqbody, callback) {
    celebManager.findByIdAndUpdate(id, {
        $set: reqbody
    }, callback);
};