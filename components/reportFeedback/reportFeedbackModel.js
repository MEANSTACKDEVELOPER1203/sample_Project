let mongoose = require('mongoose');

var commentFeedbackSchema = new mongoose.Schema({
    feedbackItem:{
        type:String,
        default:""
    },
    createdDate:{
        type:Date,
        default: Date.now
    },
    updatedDate:{
        type:Date,
        default: Date.now
    },
    createdBy:{
        type:String,
        default:"admin"
    }
},{
    versionKey:false
});

let collName = "reportFeedbacks";
let reportFeedbacks = mongoose.model('reportFeedbacks', commentFeedbackSchema, collName);
module.exports = reportFeedbacks;