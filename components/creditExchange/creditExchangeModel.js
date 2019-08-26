let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let active;
let inactive;

let creditExchangeSchema = new mongoose.Schema({
    countryName: {
        type: String,
        default: ""
    },
    countryCode: {
        type: String,
        default: ""
    },
    conversionRate: {
        type: Number,
        default: 0
    },
    status: { 
        type: String, 
        enum: [active, inactive], 
        default: "" 
    },
    createdBy: {
        type: String,
        default: ""
    },
    createdDateTime: { 
        type: Date, 
        default: Date.now 
    },
    updatedBy: {
        type: String,
        default: ""
    },
    updatedDateTime: { 
        type: Date, 
        default: Date.now 
    }

},{
    versionKey: false
});

let creditExchange = (module.exports = mongoose.model("creditExchange", creditExchangeSchema));

module.exports.createCreditExchange = function (newcreditExchange, callback) {
    newcreditExchange.save(callback);
};

// Edit creditExchangeLog

module.exports.editCreditExchange = function (id, reqbody, callback) {
    creditExchange.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (creditExchangeStatus)

module.exports.getCreditExchangeById = function (id, callback) {
    creditExchange.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getCreditExchangeByUserId = function (id, callback) {
    let query = { memberId: id }
    creditExchange.find(query, callback);
};

// Find by userName

module.exports.getCreditExchangeByUserName = function (username, callback) {
    let query = { username: username };
    creditExchange.find(query, callback);
};