let mongoose = require('mongoose');

var tilentSchema = new mongoose.Schema({
    tilentTitle:{
        type:String
    },
    subTilent:{
        type:Array,
        default:[]
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

let collName = "tilents";
let tilents = mongoose.model('tilents', tilentSchema, collName);
module.exports = tilents;