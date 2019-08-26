let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let bodyTypeSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    bodyTypeName:{
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

let bodyType = (module.exports = mongoose.model("bodyType", bodyTypeSchema));

// Create a bodyType
module.exports.createBodyType = function (newBodyType, callback) {
    newBodyType.save(callback);
};

// Edit a bodyType

module.exports.editBodyType = function (id, reqbody, callback) {
    bodyType.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getbodyTypeById = function (id, callback) {
    bodyType.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    bodyType.find(query, callback);
  };

