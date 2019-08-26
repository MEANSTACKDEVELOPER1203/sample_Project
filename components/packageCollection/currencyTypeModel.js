let mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectId;

let currencyTypeSchema = new mongoose.Schema({
    countryName: {
        type: String
    },
    countryCode: { //like IN/US/AU
        type: String
    },
    currencyType: { //like INR/Dollor
        type: String
    },
    currencySymbol: {
        type: String
    },
    currencyValue: {
        type: Number
    },
    description:{
        type:String
    },
    gst:{
        type:Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: "Admin"
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: String,
        default: "Admin"
    },
    status:{
        type:String,
        default:"active"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
        versionKey: false
    }
);

let collName = "currencyType";
let CurrencyType = mongoose.model('CurrencyType', currencyTypeSchema, collName);
module.exports = CurrencyType