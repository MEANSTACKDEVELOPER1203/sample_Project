let mongoose = require('mongoose');

var degreeTypeSchema = new mongoose.Schema({
    degreeTypeName:{
        type:String,
        default: ""
    },
    createdDate:{
        type:Date,
        default: Date.now
    },
    updatedDate:{
        type:Date,
        default: Date.now
    },
    isDeleted:{
        type:Boolean,
        default: false
    }
},{
    versionKey:false
});

let collName = "degreetypes";
let degreeTypes = mongoose.model('degreetypes', degreeTypeSchema, collName);
module.exports = degreeTypes;