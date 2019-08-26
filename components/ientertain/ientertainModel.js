let mongoose = require('mongoose');
let Float = require('mongoose-float').loadType(mongoose, 3);
let slider, reactionvidoes;
let ientertainSchema = new mongoose.Schema({
    title: {
        type: String
    },
    subtitle: {
        type: String
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: [slider, reactionvidoes]
    },
    src: {
        mediaUrl: {
            type: String,
        },
        mediaType: {
            type: String
        },
        mediaSize: {
            type: Float
        },
        mediaCaption: {
            type: String
        },
        thumbnail: {
            type: String,
            default: ""
        },
        mediaName: {
            type: String
        }
    },
    link: {
        type: String
    },
    link2: {
        type: String
    },
    link3: {
        type: String
    },
    link4: {
        type: String
    },
    status: {
        type: String,
        default: "active"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdBy: {
        type: String,
        default: "Admin"
    }
}, { versionKey: false })
let collName = "ientertain";
let ientertain = mongoose.model('ientertain', ientertainSchema, collName);
module.exports = ientertain