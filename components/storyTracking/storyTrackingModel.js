let mongoose = require('mongoose');
let storyTrackingSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        index: true
    },
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "story",
        index: true
    },
    isSeen: {
        type: Boolean,
        default: false
    },
    seenBy: {
        type: String,
    },
    seenTime: {
        type: Date,
    },
    // seenTimeTS: {
    //     type: Number,
    //     // default: new Date().getTime()
    // },
    createdAt: {
        type: Date,
        default: Date.now
    },
},
    {
        versionKey: false,
        autoIndex: true,
        timestamps: true
    }
);

storyTrackingSchema.index({ memberId: 1, storyId: 1 }, { unique: true });
let collName = "storyTracking";
let StoryTracking = mongoose.model('StoryTracking', storyTrackingSchema, collName);
module.exports = StoryTracking;

