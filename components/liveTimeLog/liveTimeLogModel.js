let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for LiveLog Communication
let online, offline, onAudioCall, onVideoCall, onChat, away, invisible, doNotDisturb;

let liveTimeLogSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    liveStatus: {
        type: String,
        enum: [online, offline, onAudioCall, onVideoCall, onChat, away, invisible, doNotDisturb],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
    autoIndex: true,
});
liveTimeLogSchema.index({ memberId: 1 });

let liveTimeLog = (module.exports = mongoose.model("liveTimeLog", liveTimeLogSchema));

module.exports.createliveTimeLog = function (newliveTimeLog, callback) {
    newliveTimeLog.save(callback);
};

// Edit a ComLog

module.exports.editElog = function (id, reqbody, callback) {

    liveTimeLog.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id (getComLogStatus)

module.exports.getComLogById = function (id, callback) {
    liveTimeLog.findById(ObjectId(id), callback);
};

// Find by userName

module.exports.getElogByUserName = function (username, callback) {
    let query = { username: username };
    liveTimeLog.find(query, callback);
};