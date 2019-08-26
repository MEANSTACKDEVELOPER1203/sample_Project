let mongoose = require("mongoose");

let hashTagSchema = new mongoose.Schema({
    hashTagId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'hashtagmaster'
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

let collName = "hashTag";
let hashTags = mongoose.model('hashTag', hashTagSchema, collName);
module.exports = hashTags;
