let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let active;
let inactive;
let audio;
let video;
let chat;
let reserved;
let unreserved;
let expired;
let slotMasterSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    previousScheduleEndTime : { 
        type: Date, 
        default: "" 
    },
    breakDuration: {
        type: Number,
        default: 0
    },
    scheduleDuration: {
        type: Number,
        default: 0
    },
    creditValue: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        default: ""
    },
    updatedBy: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: "false"
    },
    isScheduled: {
        type: Boolean,
        default: "false"
    },
    scheduleStatus: {
        type: String,
        enum: [active, inactive,expired],
        default: "inactive"
    },
    scheduleNotificationStatus: {
        type: String,
        enum: ["inactive","create", "delete"],
        default: "inactive"
    },
    serviceType: {
        type: String,
        default: ""
    },
    slotArray: [{
        slotId: {
            type: mongoose.Schema.Types.ObjectId
        },
        serviceType: {
            type: String,
            default: ""
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        slotStartTime: { 
            type: Date, 
            //required: true 
        },
        slotEndTime: { 
            type: Date,
            //required: true 
        },
        slotDuration: { 
            type: Number, 
            default: 0 
        },
        creditValue: { 
            type: Number, 
            default: 0
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        slotStatus: {
            type: String,
            enum: [reserved, unreserved,expired],
            default: unreserved
        },
        scheduledDuration: {
            type : Number,
            default: 0
          },
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt:{ 
        type: Date, 
        default: Date.now 
    }
},{
    versionKey: false
});

let slotMaster = (module.exports = mongoose.model("slotMaster", slotMasterSchema));

// Create a slotMaster
module.exports.slotMaster = function (slotMasterRecord, callback) {
    slotMasterRecord.save(callback);
};

// Edit a slotMaster

module.exports.editSlotMaster = function (id, reqbody, callback) {
   
    slotMaster.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getSlotMasterById = function (id, callback) {
    slotMaster.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = { memberId: id };
    slotMaster.find(query, callback);
};