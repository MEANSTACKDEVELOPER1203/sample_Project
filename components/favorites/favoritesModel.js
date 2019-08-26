let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId
let talent, audition;
var favoritesSchema = new mongoose.Schema({
    //auditionProfileId is auditionProfileId of who favourated
    auditionProfileId:{type:mongoose.Schema.Types.ObjectId,ref:'auditionsProfiles'},
    //memberid is auditionProfileId of whom user is favourating
    memberId:{type:mongoose.Schema.Types.ObjectId,ref:'auditionsProfiles'},
    roleId:{type:mongoose.Schema.Types.ObjectId,ref:'role'},
    auditionId:{type:mongoose.Schema.Types.ObjectId,ref:'audition'},
    isFavoriteType:{
        type:String,
        enum:[talent, audition],
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: ""
    },
    updatedBy: {
        type: String,
    }
}, {
    versionKey: false
});

let collName = "favorites";
let favorites = mongoose.model('favorites', favoritesSchema, collName);
module.exports = favorites;