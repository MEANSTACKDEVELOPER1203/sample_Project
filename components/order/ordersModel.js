let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let pending;
let inProgress;
let completed;
let image;
let video;
let audio;
let ecommerce;
let service;
let chat;
let creditCard;
let debitCard;
let credits;
let Payment;

let ordersSchema = new mongoose.Schema({
    memberId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    orderId: {
        type: String
    },
    orderType: { 
        type: String, 
        enum: [ecommerce, service,Payment], 
        required: true 
    },
    refCreditTransactionId: {
        type:mongoose.Schema.Types.ObjectId
    },
    refPaymentTransactionId:  {
        type:mongoose.Schema.Types.ObjectId
    },
    refCartIds:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    paymentAmount: {
        type: Number,
        default: ""
    },
    credits: {
        type: Number,
        default: ""
    },
    paymentMode: {
        type: String,
        enum: [creditCard, debitCard, credits],
        default: "credits"
    },
    createdBy: {
        type: String,
        default: ""
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedBy: {
        type: String,
        default: ""
    },
    updatedAt:  { 
        type: Date, 
        default: Date.now 
    },
    ordersStatus: {
        type: String,
        enum: [pending, inProgress, completed],
        default: "completed"
    }
}, {
        versionKey: false
    });

let orders =  mongoose.model("orders", ordersSchema);
module.exports = orders
// module.exports.createOrders = function (newOrders, callback) {
//     newOrders.save(callback);
// };

// Edit ordersLog

module.exports.editOrders = function (id, reqbody, callback) {
    orders.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (ordersStatus)

module.exports.getOrdersById = function (id, callback) {
    orders.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getOrdersByUserId = function (id, callback) {
    let query = { memberId: id }
    orders.find(query, callback);
};

// Find by userName

module.exports.getOrdersByUserName = function (username, callback) {
    let query = { username: username };
    orders.find(query, callback);
};