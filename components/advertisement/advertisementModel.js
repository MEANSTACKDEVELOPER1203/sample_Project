let mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 3);
var advertiseSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    advertisementType: {
        type: String
    },
    location: {
        type: String
    },
    src: {
        mediaUrl: {
            type: String
        },
        videoUrl: {
            type: String
        },
        mediaName: {
            type: String
        },
        mediaType: {
            type: String
        },
        mediaRatio: {
            type: Float
        }
    },
    appLogoUrl: {
        type: String
    },
    appLogoRatio: {
        type: Float,
        default: 1.5
    },
    appUrlIos: {
        type: String
    },
    appUrlAndroid: {
        type: String
    },
    webUrl: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    start: {
        type: Date,
        default: new Date()
    },
    expire: {
        type: Date,
        default: new Date()
    },
    status: {
        type: String,
        default: "Active"
    }
}, {
    versionKey: false
});

let collName = "advertisement";
let Advertise = mongoose.model('Advertise', advertiseSchema, collName);
module.exports = Advertise;