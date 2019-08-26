let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let genderSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    genderName:{
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

let genderCollection = (module.exports = mongoose.model("genderCollection", genderSchema));

// Create a Gender
module.exports.createGender = function (newGender, callback) {
    newGender.save(callback);
};

// Edit a Gender

module.exports.editGender = function (id, reqbody, callback) {
    genderCollection.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getGender = function (id, callback) {
    genderCollection.findById(ObjectId(id), callback);
};


