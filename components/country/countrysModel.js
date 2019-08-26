let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let active;
let inactive;

let countrySchema = new mongoose.Schema({
    countryName: {
        type: String,
        default: ""
    },
    countryCode: {
        type: String,
        default: ""
    },
    dialCode: {
        type: String,
        default: ""
    },
    status: { 
        type: String, 
        enum: [active, inactive], default: "" 
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

let country = (module.exports = mongoose.model("country", countrySchema));

module.exports.createCountry = function (newCountry, callback) {
    newCountry.save(callback);
};

// Edit countryLog

module.exports.editCountry = function (id, reqbody, callback) {
    country.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (countryStatus)

module.exports.getCountryById = function (id, callback) {
    country.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getCountryByUserId = function (id, callback) {
    let query = { memberId: id }
    country.find(query, callback);
};

// Find by userName

module.exports.getCountryByUserName = function (username, callback) {
    let query = { username: username };
    country.find(query, callback);
};