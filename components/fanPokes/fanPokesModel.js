let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let created, sent, failed, onHold;

let fanPokesSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    celebrityId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    notificationStatus : {
        type: String,
        enum: [created, sent, failed, onHold],
        // default: active
    },
    responseStatus:{
        type: String,
        default:"",
    },
    message:{
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

let fanPoke = (module.exports = mongoose.model("fanPokes", fanPokesSchema));

// Create a fanPoke
module.exports.createFanPoke = function (newFanPoke, callback) {
    newFanPoke.save(callback);
};

// Edit a fanPoke

module.exports.editFanPoke = function (id, reqbody, callback) {
    fanPoke.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getFanPokeById = function (id, callback) {
    fanPoke.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = {memberId : id};
    fanPoke.find(query, callback);
  };

