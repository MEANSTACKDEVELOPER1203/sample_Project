let mongoose = require('mongoose');

var ageRangeSchema = new mongoose.Schema({
    ageStart:{
        type:Number
    },
    ageEnd:{
        type:Number
    },
    createdDate:{
        type:Date,
        default:new Date()
    },
    createdBy:{
        type:String,
        default:"admin"
    }
},{
    versionKey:false
});

let collName = "ageRange";
let ageRange = mongoose.model('ageRange', ageRangeSchema, collName);
module.exports = ageRange