let mongoose = require('mongoose');

var indexSchema = new mongoose.Schema({
    firstname:{
        type:String,
        index:true
    },
    lastname:{
        type:String,
        index:true
    },
    username:{
        type:String,
        index:true
    },
    fullname:{
        type:String,
        index:true
    },
},{
    versionKey:false
})
let collName = "index";
let Index = mongoose.model("Index", indexSchema, collName);
module.exports = Index;