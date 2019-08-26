let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let eyeColourSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    eyeColourName:{
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

let eyeColour = (module.exports = mongoose.model("eyeColour", eyeColourSchema));

// Create a eyeColour
module.exports.createEyeColour = function (newEyeColour, callback) {
    newEyeColour.save(callback);
};

// Edit a eyeColour

module.exports.editeyeColour = function (id, reqbody, callback) {
    eyeColour.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.geteyeColourById = function (id, callback) {
    eyeColour.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    eyeColour.find(query, callback);
  };

