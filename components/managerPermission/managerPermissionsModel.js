let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let managerPermissionsSchema = new mongoose.Schema({
    managerId: {
        type: mongoose.Schema.Types.ObjectId
    },
    celebrityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    // permissions:[{
    //     managerSettingsMasterId: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref : 'managerPermissionsMaster'
    //     }, /// Manager Permissions Master Id (off, view, edit, full etc)
    //     managerPermissionsMasterId: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref : 'managerPermissionsAccessMaster'
    //     },
    //     _id:0
    // }],
    managerSettingsMasterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'managerPermissionsMaster'
    }, /// Manager Permissions Master Id (off, view, edit, full etc)
    managerPermissionsMasterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'managerPermissionsAccessMaster'
    }, /// Manager Permissions Access MasterId (profile, feed, credit settings etc)
    isEnabled:{
        type: Boolean,
        default:false
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
        default:""
    },
    updatedBy:{
        type: String,
        default:""
    },
},{
    versionKey: false
});

let managerPermissions = (module.exports = mongoose.model("managerPermissions", managerPermissionsSchema));

// Create a managerPermissions
module.exports.createManagerPermissions = function (newManagerPermissions, callback) {
    newManagerPermissions.save(callback);
};

// Edit a managerPermissions

module.exports.editManagerPermissions = function (id, reqbody, callback) {
    managerPermissions.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getManagerPermissionsById = function (id, callback) {
    managerPermissions.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    managerPermissions.find(query, callback);
};

/// by createdBy
module.exports.getByCreatedBy = function (id, callback) {
    let query = {createdBy : id};
    managerPermissions.find(query, callback);
};


