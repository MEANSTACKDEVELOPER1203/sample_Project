let mongoose = require("mongoose");
let ObjectId = require('mongodb').ObjectId
let active, inactive;
var Float = require('mongoose-float').loadType(mongoose, 3);
let image, video, audio, document;

var applyAuditionsSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId,ref:'Users' },
    auditionId: { type: mongoose.Schema.Types.ObjectId,ref:'audition' },
    auditionProfileId: { type: mongoose.Schema.Types.ObjectId,ref:'auditionsProfiles' },
    roleId: { type: mongoose.Schema.Types.ObjectId,ref:'role' },
    imageUrl: {
        type: Array,
        default: []
    },
    videoUrl: {
        type: Array,
        default: []
    },
    documentUrl: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: [active, inactive],
        default: "active"
    },
    attachment: [{
        mediaId: mongoose.Schema.Types.ObjectId,
        mediaRatio: {
            type: Float,
            default: 0.000
        },
        mediaCaption: {
            type: String,
            default: "",
        },
        mediaType: {
            type: String,
            default: "",
            enum: [image, video, audio, document]
        },
        mediaSize: {
            type: Float
            //default: 0.000
        },
        mediaCreditValue: {
            type: Number,
            default: 0.0
        },
        src: {
            mediaUrl: {
                type: String,
                default: ""
            },
            mediaName: {
                type: String,
                default: ""
            },
            videoUrl: {
                type: String,
                default: ""
            },
        },
        faceFeatures: [{
            posX: {
                type: Number,
                default: 0
            },
            posY: {
                type: Number,
                default: 0
            },
            width: {
                type: Number,
                default: 0
            },
            height: {
                type: Number,
                default: 0
            }
        }]
    }],
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
        default: ""
    },
    updatedBy: {
        type: String,
        default: ""
    }
}, {
        versionKey: false
    });

let collName = "applyAuditions";
let applyAuditions = mongoose.model('applyAuditions', applyAuditionsSchema, collName);
module.exports = applyAuditions;