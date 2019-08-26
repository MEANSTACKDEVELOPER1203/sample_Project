let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let mediaRequiredSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    mediaRequiredName:{
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

let mediaRequired = (module.exports = mongoose.model("mediaRequired", mediaRequiredSchema));

// Create a mediaRequired
module.exports.createMediaRequired = function (newMediaRequired, callback) {
    newMediaRequired.save(callback);
};

// Edit a mediaRequired

module.exports.editmediaRequired = function (id, reqbody, callback) {
    mediaRequired.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getmediaRequiredById = function (id, callback) {
    mediaRequired.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    mediaRequired.find(query, callback);
  };

