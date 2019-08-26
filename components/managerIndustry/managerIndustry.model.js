let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let managerIndustrySchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    industryName: { type: String, default: "" },
    parentIndustryId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    logoURL: { 
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
    },
    createdBy:{
        type: String,
        default:""
    },
    updatedBy:{
        type: String,
        default:""
    },
}, {
        versionKey: false
    });

let managerIndustry = (module.exports = mongoose.model("managerIndustry", managerIndustrySchema));

// Create a Manager Industry
module.exports.createManagerIndustry = function (newManagerIndustry, callback) {
    newManagerIndustry.save(callback);
};

// Edit a ManagerIndustry

module.exports.editManagerIndustry = function (id, reqbody, callback) {
    managerIndustry.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getManagerIndustryById = function (id, callback) {
    Preferences.findById(ObjectId(id), callback);
};

module.exports.getManagerIndustryParentlist = function (parentPreferenceId, callback) {

    let query = { parentPreferenceId: null }
    managerIndustry.find(query, callback);
};

module.exports.getManagerIndustriesByParentId = function (parentIndustryId, callback) {

    let query = { parentIndustryId: parentIndustryId };
    managerIndustry.find(query, callback);
};



