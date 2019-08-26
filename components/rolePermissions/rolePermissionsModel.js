let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for Role Permissions

let admin;
let inventoryManager,view, viewAndEdit, FullAccess;

let rolePermissionsSchema = new mongoose.Schema({
  roleName: {
    type: String,
    enum: [admin, inventoryManager],
    default: "admin"
  },
  permissions: [
    {
      //id: mongoose.Schema.Types.ObjectId,
      moduleName: {
        type: String,
        required: true
      },
      parentModuleId: {
        type: String,
      }
    }
  ],
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
  updatedBy: {
    type: String,
    default: ""
  }
},{
  versionKey: false
});

let rolePermissions = (module.exports = mongoose.model("rolePermissions", rolePermissionsSchema));

module.exports.createRole = function (newRole, callback) {
  newRole.save(callback);
};

module.exports.createCelebrityContract = function (newCelebrityContract, callback) {
  newCelebrityContract.save(callback);
};
