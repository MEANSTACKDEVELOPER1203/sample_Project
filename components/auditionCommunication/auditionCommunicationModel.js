let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let active;
let inactive;

let auditionCommunicationSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    auditionProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'auditionsProfiles',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    message: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: [active, inactive],
        default: "active"
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

},{
    versionKey: false
});

let auditionCommunication = (module.exports = mongoose.model("auditionCommunication", auditionCommunicationSchema));

module.exports.createAuditionCommunication = function (newAuditionCommunication, callback) {
    newAuditionCommunication.save(callback);
};

// Edit auditionCommunicationLog

module.exports.editAuditionCommunication = function (id, reqbody, callback) {
    auditionCommunication.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (auditionCommunicationStatus)

module.exports.getAuditionCommunicationById = function (id, callback) {
    auditionCommunication.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getAuditionCommunicationByUserId = function (id, callback) {
    let query = { memberId: id }
    auditionCommunication.find(query, callback);
};

