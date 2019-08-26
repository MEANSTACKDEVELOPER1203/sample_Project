let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let active, isViewed, isArchieved, isDeleted, Fan, Follow, unFan, unFollow, missedcall, Service, General, Manager, audition;

let notificationSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    notificationFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    celebrityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    notificationSettingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notificationMaster'
    },
    auditionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'audition',
        index: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role',
        index: true
    },
    feedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeds',
        index: true
    },
    activity: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        default: ""
    },
    body: {
        type: String,
        default: ""
    },
    notificationIcon: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: [active, isViewed, isArchieved, isDeleted],
        default: "active",
        index: true
    },
    notificationType: {
        type: String,
        enum: [Fan, Follow, unFan, unFollow, missedcall, Service, Manager, audition],
        default: "General",
        index: true
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
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
        default: "",
    },
    updatedBy: {
        type: String,
        default: "",
    }

}, {
        versionKey: false,
        autoIndex: true
    });
// roleId: 1, auditionId: 1, feedId: 1, notificationType: 1, status: 1, celebrityId: 1
notificationSchema.index({ memberId: 1 }, { unique: true });
let notification = (module.exports = mongoose.model("notification", notificationSchema));

module.exports.createNotification = (newNotification, callback) => {
    newNotification.save(callback);
};

// Edit notificationLog

module.exports.editnotification = (id, reqbody, callback) => {
    notification.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (notificationStatus)

module.exports.getnotificationById = (id, callback) => {
    notification.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getnotificationByUserId = (id, callback) => {
    let query = { memberId: id }
    notification.find(query, callback);
};

// Find by userName

module.exports.getnotificationByUserName = (username, callback) => {
    let query = { username: username };
    notification.find(query, callback);
};


module.exports.getnotificationIconByRoleType = (roleType) => {
    if (roleType == "Actor") {
        return "uploads/notificationIcon/actor.png"
    }
    else if (roleType == "Art Director") {
        return "uploads/notificationIcon/art_director.png"
    }
    else if (roleType == "Choreographer") {
        return "uploads/notificationIcon/choreographer.png"
    }
    else if (roleType == "Director") {
        return "uploads/notificationIcon/director.png"
    }
    else if (roleType == "Dubbing Artist") {
        return "uploads/notificationIcon/dubbing_artist.png"
    }
    else if (roleType == "DOP") {
        return "uploads/notificationIcon/dop.png"
    }
    else if (roleType == "Editor") {
        return "uploads/notificationIcon/editor.png"
    }
    else if (roleType == "Lyricist") {
        return "uploads/notificationIcon/lyricist.png"
    }
    else if (roleType == "Models") {
        return "uploads/notificationIcon/models.png"
    }
    else if (roleType == "Musician") {
        return "uploads/notificationIcon/musician.png"
    }
    else if (roleType == "Stunt Director") {
        return "uploads/notificationIcon/stunt_master.png"
    }
    else if (roleType == "Singer") {
        return "uploads/notificationIcon/singer.png"
    }
    else if (roleType.search("Writers") != -1) {
        return "uploads/notificationIcon/writers.png"
    }
    else {
        return "uploads/notificationIcon/preferences_others.png"
    }
};