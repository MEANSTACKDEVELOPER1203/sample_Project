let mongoose = require('mongoose');

var bannerSchema = new mongoose.Schema({
    bannerType: {
        type: String,
        enum: ["ExternalLink", "Link", "contest","HomeAd","PromotionAd","SideAd","EventAd"],
        default: "ExternalLink"
    },
    bannerTitle: {
        type: String,
        default: ""
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId
    },
    srcType: {
        type: String,
        default: ""
    },
    srcUrl: {
        type: String,
        default : "http://www.celebkonect.com/"
    },
    bannerImage: {
        type: String,
        string: "",
    },
    bannerValidStartDate: {
        type: Date,
        default: ""
    },
    bannerValidEndDate: {
        type: Date,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
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
});


let Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;

// Create a banner
module.exports.createBanner = function (newBanner, callback) {
    newBanner.save(callback);
};

// Update a banner
module.exports.updateBanner = function (id, reqbody, callback) {
    Banner.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

module.exports.getAllBanners = function (callback) {
    Banner.find((err, listOfBannersObj) => {
        if (!err) {
            callback(null, listOfBannersObj);
        } else {
            callback(err, null);
        }
    });
}