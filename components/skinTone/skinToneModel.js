let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;
let skinToneSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    skinToneName:{
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

let skinTone = (module.exports = mongoose.model("skinTone", skinToneSchema));

// Create a skinTone
module.exports.createSkinTone = function (newSkinTone, callback) {
    newSkinTone.save(callback);
};

// Edit a skinTone

module.exports.editskinTone = function (id, reqbody, callback) {
    skinTone.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getskinToneById = function (id, callback) {
    skinTone.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    skinTone.find(query, callback);
  };

