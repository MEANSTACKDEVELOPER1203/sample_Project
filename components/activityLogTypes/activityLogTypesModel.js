let mongoose = require("mongoose");

let activityLogTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        default:"",
        unique:true,
        required:true
    },
    iconUrl: {
        type: String,
        default:""
    },
    firstMessagePart: {
        type: String,
        default:"",
        required:true
    },
    secondMessagePart: {
        type: String,
        default:""
    },
    thirdMessagePart: {
        type: String,
        default:""
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },
    updatedAt: { 
        type: Date, 
        default: Date.now
    },
    isDeleted: { 
        type: Boolean, 
        default: false
    }
},{
    versionKey: false
});

let collName = "activityLogTypes";
let activityLogTypes = mongoose.model('activityLogTypes', activityLogTypeSchema, collName);
module.exports = activityLogTypes;
