let mongoose = require("mongoose");

let hashTagMasterSchema = new mongoose.Schema({
    hashTagName: {
        type: String,
        required:1
    },
    count: {
        type: Number,
        default:1
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
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
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    updatedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{
    versionKey: false
});

let collName = "hashtagmaster";
let hashTagMaster = mongoose.model('hashtagmaster', hashTagMasterSchema, collName);
module.exports = hashTagMaster;
