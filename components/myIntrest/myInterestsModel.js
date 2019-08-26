let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let view, edit, full;

let myInterestsSchema = new mongoose.Schema({
    interestId: {
        type: mongoose.Schema.Types.ObjectId
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isEnabled: {
        type: Boolean,
        default: false
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
    },
}, {
        versionKey: false
    });

let myInterests = (module.exports = mongoose.model("myInterests", myInterestsSchema));

// Create a myInterests
module.exports.createMyInterests = function (newMyInterests, callback) {
    myInterests.create(newMyInterests, (err, intObj) => {
        if (!err)
            callback(null, intObj);
        else
            callback(err, null)
    });
};

// Edit a myInterests

module.exports.editMyInterests = function (id, reqbody, callback) {
    myInterests.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getmyInterestsById = function (id, callback) {
    myInterests.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = { memberId: id };
    myInterests.find(query, callback);
};

