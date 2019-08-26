let mongoose = require('mongoose');
let Voting;
var exerciseTypesSchema = new mongoose.Schema({
    title:{   
        type: String
    },
    description:{
        type: String
    },
    banner:{
        type: String
    },

    exerciseType:{
        type: String,
        enum:[Voting]
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    status:{
        type: Boolean,
        default: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date, default: Date.now
    },
    createdBy: {
        type: String
    },
    updatedDate: {
        type: Date
    },
    updatedBy: {
        type: String
    }
},
{
    versionKey: false
});
let collName = "exerciseTypes";
var exerciseType = mongoose.model('exerciseType', exerciseTypesSchema, collName);
module.exports = exerciseType;