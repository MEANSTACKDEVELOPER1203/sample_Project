let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let managerPermissionsMasterSchema = new mongoose.Schema({
    // permissionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    permissionName:{
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

let managerPermissionsMaster = (module.exports = mongoose.model("managerPermissionsMaster", managerPermissionsMasterSchema));

// Create a managerPermissionsMaster
module.exports.createManagerPermissionsMaster = function (newmanagerPermissionsMaster, callback) {
    newmanagerPermissionsMaster.save(callback);
};

// Edit a managerPermissionsMaster
module.exports.editManagerPermissionsMaster = function (id, reqbody, callback) {
    managerPermissionsMaster.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id
module.exports.getManagerPermissionsMasterById = function (id, callback) {
    managerPermissionsMaster.findById(ObjectId(id), callback);
};

// Find by memberId
module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    managerPermissionsMaster.find(query, callback);
};

