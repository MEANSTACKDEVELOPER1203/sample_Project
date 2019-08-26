let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let managerPermissionsAccessMasterSchema = new mongoose.Schema({
    // permissionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    settingName:{
        type: String,
        default:"",
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

let managerPermissionsAccessMaster = (module.exports = mongoose.model("managerPermissionsAccessMaster", managerPermissionsAccessMasterSchema));

// Create a managerPermissionsAccessMaster
module.exports.createManagerPermissionsAccessMaster = function (newManagerPermissionsAccessMaster, callback) {
    newManagerPermissionsAccessMaster.save(callback);
};

// Edit a managerPermissionsAccessMaster

module.exports.editManagerPermissionsAccessMaster = function (id, reqbody, callback) {
    managerPermissionsAccessMaster.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getManagerPermissionsAccessMasterById = function (id, callback) {
    managerPermissionsAccessMaster.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    managerPermissionsAccessMaster.find(query, callback);
  };

