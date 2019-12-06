let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let active;
let inactive;
let paymentGateway;
let wallet;
let credits;
let audio;
let chat;
let video;
let scheduled, membercalling, celebLifted, celebritycalling, memberAccepted, memberRejected, celebAccepted, celebRejected, celebdisconnected, memberDisconnected, memberNotResponded, celebNotResponded, celebNotResponded2, celebNotResponded3, reschduled, canceled, blocked, completed, deleted;
let serviceTransactionSchema = new mongoose.Schema({
    serviceCode: {
        type: String,
        default: ""
    },
    serviceType: {
        type: String,
        enum: [audio, video, chat],
        default: ""
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        //required: true
    },
    schId: { 
        type: mongoose.Schema.Types.ObjectId,
        //required: true
      },
    refSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        //required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: Date.now
    },
    actualStartTime: {
        type: Date
    },
    scheduledDuration: {
        type : Number,
        default: 0
      },
    actualEndTime: {
        type: Date
    },
    serviceStatus: {
        type: String,
        enum: [scheduled, membercalling, celebLifted, celebritycalling, memberAccepted, memberRejected, celebAccepted, celebRejected, celebdisconnected, memberDisconnected, memberNotResponded, celebNotResponded, celebNotResponded2, celebNotResponded3, reschduled, canceled, blocked, completed, deleted],
        default: "scheduled"
    },
    isMissedCall: {
        type: Boolean,
        default: false
    },
    r1status: {
        type: String,
        enum: [active, inactive],
        default: "inactive"
    },
    r2status: {
        type: String,
        enum: [active, inactive],
        default: "inactive"
    },
    r3status: {
        type: String,
        enum: [active, inactive],
        default: "inactive"
    },

    r15mstatus: {
        type: String,
        enum: [active, inactive],
        default: "active"
    },
    r4hstatus: {
        type: String,
        enum: [active, inactive],
        default: "active"
    },
    r1dstatus: {
        type: String,
        enum: [active, inactive],
        default: "active"
    },
    callRemarks: {
        type: String,
        default: ""
    },
    reason: {
        type: String,
        default: ""
    },
    refundStatus: {
        type: String,
        default: "inactive"
    },
    chatStatus: {
        type: String,
        default: "inactive"
    },
    fcmnotification:
    {
        type: String,
        default: ""
    },
    lastTimeUnBlocked: {
        type: Date
    },
    fcmmembernotification:
    {
        type: String,
        default: ""
    },
    fcmcelebnotification:
    {
        type: String,
        default: ""
    },
    liveStatusDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

let serviceTransaction = mongoose.model("serviceTransaction", serviceTransactionSchema);
module.exports = serviceTransaction;
// Create a serviceTransaction
module.exports.serviceTransaction = function (serviceTransactionRecord, callback) {
    serviceTransactionRecord.save(callback);
};

// Edit a serviceTransaction

module.exports.editServiceTransaction = function (query, callback) {
    serviceTransaction.findByIdAndUpdate(query, callback);
};

// Find by Id

module.exports.getServiceTransactionById = function (id, callback) {
    serviceTransaction.findById(ObjectId(id), callback);
};

// get Transaction jobs by status

module.exports.getServiceTransactionByServiceStatus = function (serviceStatus, serviceStatus1, callback) {
    //let query = { serviceStatus: serviceStatus };
    let query = { "serviceStatus": { "$in": ["serviceStatus", "serviceStatus1"] } }
    serviceTransaction.findOne(query, callback);
};
// Find by UserID

module.exports.getByUserID = function (id, callback) {
    let query = { senderId: id };
    serviceTransaction.find(query, callback).sort({ "startTime": -1 });
};