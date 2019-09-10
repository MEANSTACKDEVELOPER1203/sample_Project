let mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 3);
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
    mediaRatio: {
        type: Float,
        default: 0.000
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
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
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