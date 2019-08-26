let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let ethnicitySchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    ethnicityName:{
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

let ethnicity = (module.exports = mongoose.model("ethnicity", ethnicitySchema));

// Create a ethnicity
module.exports.createEthnicity = function (newEthnicity, callback) {
    newEthnicity.save(callback);
};

// Edit a ethnicity

module.exports.editethnicity = function (id, reqbody, callback) {
    ethnicity.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getethnicityById = function (id, callback) {
    ethnicity.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    ethnicity.find(query, callback);
  };

