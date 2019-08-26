let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let adminMenuMasterSchema = new mongoose.Schema({
  id: {
    type:mongoose.Schema.Types.ObjectId
  },
  menuName: {
    type: String,
     default: ""
  },
  parentMenuId: {
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
},{
  versionKey: false
});

let adminMenuMaster = (module.exports = mongoose.model("adminMenuMaster", adminMenuMasterSchema));

// Create a adminMenuMaster
module.exports.createAdminMenuMaster = function (adminMenuMaster, callback) {
  adminMenuMaster.save(callback);
};

// Edit a adminMenuMaster

module.exports.editAdminMenuMaster = function (id, reqbody, callback) {
  adminMenuMaster.findByIdAndUpdate(id, { $set: reqbody },callback);
};

// Find by Id

module.exports.getAdminMenuMasterById = function (id, callback) {
  adminMenuMaster.findById(ObjectId(id), callback);
};

module.exports.getAdminMenuMasterByParentlist = function(parentadminMenuMasterId, callback) {

  let query = { parentadminMenuMasterId: null }
  adminMenuMaster.find(query, callback);
};
module.exports.getAdminMenuMasterByParentId = function(parentadminMenuMasterId, callback) {

  let query = {parentadminMenuMasterId : parentadminMenuMasterId};
  adminMenuMaster.find(query, callback);
};
module.exports.getProfessionByadminMenuMasterName = function(adminMenuMasterName, callback) {

  let query = {adminMenuMasterName : adminMenuMasterName};
  adminMenuMaster.find(query, callback);
};


