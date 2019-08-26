let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let productionTypeSchema = new mongoose.Schema({
    parentProductionId: {
        type: mongoose.Schema.Types.ObjectId
    },
    productionName:{
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

let productionType = (module.exports = mongoose.model("productionType", productionTypeSchema));

// Create a productionType
module.exports.createProductionType = function (newProductionType, callback) {
    newProductionType.save(callback);
};

// Edit a productionType

module.exports.editproductionType = function (id, reqbody, callback) {
    productionType.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getproductionTypeById = function (id, callback) {
    productionType.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    productionType.find(query, callback);
  };

  // Find by memberId

module.exports.getByParentProductionId = function (id, callback) {
    let query = {parentProductionId : id};
    productionType.find(query, callback);
  };

//     // Find by memberId

// module.exports.getParents = function (id, callback) {
//     let query = {parentProductionId : id};
//     productionType.find(query, callback);
//   };


