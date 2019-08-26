let mongoose = require('mongoose');

var heightSchema = new mongoose.Schema({
    heightStart:{
        type:Number
    },
    heightEnd:{
        type:Number
    },
    createdDate:{
        type:Date,
        default: Date.now
    },
    updatedDate:{
        type:Date,
        default: Date.now
    },
    createdBy:{
        type:String,
        default:"admin"
    }
},{
    versionKey:false
});

let collName = "heightRanges";
let heightRange = mongoose.model('heightRanges', heightSchema, collName);
module.exports = heightRange;