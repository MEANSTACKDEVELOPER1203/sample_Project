let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;
let success;
let fail;
let activityTransactionSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    oldValues: {

    },
    newValues: {

    },
    activityName: {
        type: String,
        required: true
    },
    activityStatus: {
        type: String,
        enum: [success, fail],
        default: ""
    },
    created_at: { 
        type: Date,
         default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
},
{
    versionKey: false
});

let activityTransaction = (module.exports = mongoose.model("activityTransaction", activityTransactionSchema));

// Create a activityTransaction
module.exports.createActivityTransaction = function (activityTransactionRecord, callback) {
    activityTransactionRecord.save(callback);
};
// End of Create a activityTransaction

// Find by Activity Transaction Id
module.exports.getActivityTransactionById = function (id, callback) {
    //console.log(id);
    activityTransaction.findById(ObjectId(id), callback);
};
// End of Find By Activity Transaction Id

// Find By UserId
module.exports.getActivityTransactionByUserId = function (id, callback) {
    let query = { memberId: id }
    activityTransaction.find(query, callback);
};
// End of Find By UserId