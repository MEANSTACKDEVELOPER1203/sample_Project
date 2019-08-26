let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let active;
let inactive;

let auditionSubscriptionSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    auditionProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'auditionsProfiles',
        required: true
    },
    subPackageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isRecurring:{
        type: Boolean,
        default: false
    },
    subValue: {
        type: Number,
        default: ""
    },
    startDate: { 
        type: Date, 
        default: "" 
    },
    endDate: { 
        type: Date,
        default: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) 
    },
    billCycle: {
        type: Number,
        default: ""
    },
    subStatus : {
        type: String,
        enum: [active, inactive],
        default: "active"
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

},
{
    versionKey: false
});

let auditionSubscription = (module.exports = mongoose.model("auditionSubscription", auditionSubscriptionSchema));

module.exports.createAuditionSubscription = function (newAuditionSubscription, callback) {
    newAuditionSubscription.save(callback);
};

// Edit auditionSubscriptionLog

module.exports.editAuditionSubscription = function (id, reqbody, callback) {
    auditionSubscription.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody }, callback);
};

// Find by Id (auditionSubscriptionStatus)

module.exports.getAuditionSubscriptionById = function (id, callback) {
    auditionSubscription.findById(ObjectId(id), callback);
};

// Find by UserID

module.exports.getAuditionSubscriptionByUserId = function (id, callback) {
    let query = { memberId: id }
    auditionSubscription.find(query, callback);
};

