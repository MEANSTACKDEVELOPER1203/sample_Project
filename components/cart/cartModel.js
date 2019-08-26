let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let completed;
let active;
let inactive;
let converted;
let abandoned;
let image;
let video;
let audio;
let chat;
let product;
let media;
let service;
let failed;
let audition,regular, referral, promo,combined,referralPromo;

let cartSchema = new mongoose.Schema({
    requestMemberId: { 
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
    celebrityId: { 
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId
    },
    cartType: {
        type: String, // video, audio
        enum: [product, media, service, audition]
    },
    title: {
        type: String,
        default: ""
    },
    category: {
        type: String, // 
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    credits: {
        type: Number,
        default: 0
    },
    mediaType: {
        type: String,
        enum: [image, video, audio]
    },
    cartCheckoutType: {
        type: String,
        default: "",
        enum: [regular, referral, promo,combined,referralPromo]
    },
    serviceType: {
        type: String, // video, audio
        enum: [video, audio, chat]
    },
    startTime: { type: Date },
    endTime: { type: Date },
    cartStatus: {
        type: String,
        enum: [active, inactive, converted, abandoned, failed],
        default: "active"
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: {
        type: String,
        default: ""
    },
    updatedAt: { type: Date, default: "" },
    updatedBy: {
        type: String,
        default: ""
    },
},{
    versionKey: false
});

let cart = (module.exports = mongoose.model("cart", cartSchema));

module.exports.createCart = function (cartRecord, callback) {
    cartRecord.save(callback);
};

// Edit cartLog

module.exports.editCart = function (id, reqbody, callback) {
    cart.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (cartLogStatus)

module.exports.getCartById = function (id, callback) {
    cart.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getCartByMemberId = function (id, callback) {
    let query = { requestMemberId: id }
    cart.find(query, callback);
};

// Find by userName

module.exports.getCartByUserName = function (username, callback) {
    //console.log(username);
    let query = { username: username };
    cart.find(query, callback);
};