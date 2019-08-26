let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let active;
let inactive;

let celebSurveySubmissionsSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    celebSurveyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    answersData: [{
        qId: mongoose.Schema.Types.ObjectId,
        question: String,
        answer: String
    }],
    status: {
        type: String,
        enum: [active, inactive],
        default: active
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
    },
},{
    versionKey: false
});

let celebSurveySubmissions = (module.exports = mongoose.model("celebSurveySubmissions", celebSurveySubmissionsSchema));

// Create a celebSurveySubmissions
module.exports.createCelebSurveySubmissions = function (newcelebSurveySubmissions, callback) {
    newcelebSurveySubmissions.save(callback);
};

// Edit a celebSurveySubmissions

module.exports.editCelebSurveySubmissions = function (id, reqbody, callback) {
    celebSurveySubmissions.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getCelebSurveySubmissionsById = function (id, callback) {
    celebSurveySubmissions.findById(ObjectId(id), callback);
};


