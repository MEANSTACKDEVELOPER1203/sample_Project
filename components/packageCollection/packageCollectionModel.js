let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let creditPackage;
let servicePackage;
let promoPackage;
let referralPackage;
let couponPackage;

let packageCollectionSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    packageType: {
        type: String,
        enum: [creditPackage, servicePackage, promoPackage, referralPackage, couponPackage],
        default: ""
    },
    packageName: {
        type: String,
        default: ""
    },
    credits: {
        type: Number,
        default: 0
    },
    countryCode: {
        type: String,
        default: ""
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: false
    },
    checkoutCurrencyINR: {
        type: Number,
        default: 0
    },
    startColor: {
        type: String
    },
    endColor: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: "",
    },
    updatedBy: {
        type: String,
        default: "",
    }

}, {
        versionKey: false
    });

let packageCollection = (module.exports = mongoose.model("packageCollection", packageCollectionSchema));

module.exports.createPackageCollection = function (newpackageCollection, callback) {
    newpackageCollection.save(callback);
};

// Edit packageCollectionLog

module.exports.editPackageCollection = function (id, reqbody, callback) {
    packageCollection.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (packageCollectionStatus)

module.exports.getPackageCollectionById = function (id, callback) {
    packageCollection.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getPackageCollectionByUserId = function (id, callback) {
    let query = { memberId: id }
    packageCollection.find(query, callback);
};

// Find by userName

module.exports.getPackageCollectionByUserName = function (username, callback) {
    let query = { username: username };
    packageCollection.find(query, callback);
};