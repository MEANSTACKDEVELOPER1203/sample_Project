let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let hairColorSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    hairColorName:{
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

let hairColor = (module.exports = mongoose.model("hairColor", hairColorSchema));

// Create a hairColor
module.exports.createHairColor = function (newHairColor, callback) {
    newHairColor.save(callback);
};

// Edit a hairColor

module.exports.edithairColor = function (id, reqbody, callback) {
    hairColor.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.gethairColorById = function (id, callback) {
    hairColor.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    hairColor.find(query, callback);
  };

