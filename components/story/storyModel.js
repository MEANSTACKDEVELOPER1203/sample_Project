let mongoose = require('mongoose');
// let mongoose_Timestamp = require('mongoose-timestamp');
let storySchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        index: true
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    mediaType: {
        type: String
    },

    mediaSize: {
        type: String
    },
    faceFeatures: {
        type: Array
    },
    mediaCaption: {
        type: String
    },
    mediaName: {
        type: String
    },
    src: {
        mediaUrl: {
            type: String
        },
        thumbnailUrl: {
            type: String
        },
    },
    // media: [
    //     {
    //         _id: false,

    //     }
    // ],
    isSeen: {
        type: Boolean,
        default: false
    },
    seenTime: {
        type: Date,
    },
    seenTimeTS: {
        type: Number,
        // default: new Date().getTime()
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: Date.now
    },
    startTimeTS: {
        type: Number,
        // default: new Date().getTime()
    },
    endTimeTS: {
        type: Number,
        // default: new Date().getTime()
    },
    location: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAT: {
        type: Date,
        default: Date.now
    },
    createdAtTS: {
        type: Number,
        default: new Date().getTime()
    },
}, {
        versionKey: false,
        autoIndex: true,
        timestamps: true
    });
storySchema.index({ memberId: 1 }, { unique: true });
let collName = "story";
let Story = mongoose.model("Story", storySchema, collName);
module.exports = Story 