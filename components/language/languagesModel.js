let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let languagesSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    languagesName:{
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

let languages = (module.exports = mongoose.model("languages", languagesSchema));

// Create a languages
module.exports.createlanguages = function (newlanguages, callback) {
    newlanguages.save(callback);
};

// Edit a languages

module.exports.editlanguages = function (id, reqbody, callback) {
    languages.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getlanguagesById = function (id, callback) {
    languages.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    languages.find(query, callback);
  };

