let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let interestsSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    interestsName:{
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

let interests = (module.exports = mongoose.model("interests", interestsSchema));

// Create a interests
module.exports.createInterests = function (newInterests, callback) {
    newInterests.save(callback);
};

// Edit a interests

module.exports.editinterests = function (id, reqbody, callback) {
    interests.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getinterestsById = function (id, callback) {
    interests.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    interests.find(query, callback);
  };

