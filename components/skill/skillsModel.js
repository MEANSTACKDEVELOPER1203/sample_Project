let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let skillsSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    skillsName:{
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
    }
},{
    versionKey: false
});

let skills = (module.exports = mongoose.model("skills", skillsSchema));

// Create a skills
module.exports.createSkills = function (newSkills, callback) {
    newSkills.save(callback);
};

// Edit a skills

module.exports.editskills = function (id, reqbody, callback) {
    skills.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getskillsById = function (id, callback) {
    skills.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    skills.find(query, callback);
  };

