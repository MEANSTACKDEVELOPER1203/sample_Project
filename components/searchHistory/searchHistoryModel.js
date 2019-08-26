let mongoose = require("mongoose");

let searchHistorySchema = new mongoose.Schema({
    memberId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    history :[{
        celebrityId: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    lastClearHistory:{ 
        type: Date, 
        default: Date.now 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
},{
    versionKey: false
});

let collName = "searchhistory";
let searchhistory = mongoose.model('searchhistory', searchHistorySchema, collName);
module.exports = searchhistory;
