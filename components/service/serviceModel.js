let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId
let scheduled,membercalling, celebritycalling, memberAccepted,memberRejected,celebAccepted,celebRejected,celebdisconnected,memberNotResponded,celebNotResponded,celebNotResponded2,celebNotResponded3,reschduled,canceled,blocked,completed,deleted;
let active, inactive,audio, video;
var serviceSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId },
    celebId: { type: mongoose.Schema.Types.ObjectId },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: ""
    },
    serviceType: {
        type: String,
        enum: [audio, video],
        default: ""
    },
    serviceStatus: {
        type: String,
        enum: [scheduled,membercalling, celebritycalling,memberAccepted,memberRejected,celebAccepted,celebRejected,celebdisconnected,memberNotResponded,celebNotResponded,celebNotResponded2,celebNotResponded3,reschduled,canceled,blocked,completed,deleted],
        default: "scheduled"
    },
    callRemarks: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: [active, inactive],
        default: "inactive"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    celebName: {
        type: String,
        default: ""
    },
    updatedBy: {
        type: String,
        default: ""
    }
}, {
    versionKey: false
});

let collName = "service";
let service = mongoose.model('service', serviceSchema, collName);
module.exports = service;