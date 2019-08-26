let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let textAnswer;
let multipleChoice;
let radioButtons;
let paragraphTexts;
let active;
let inactive;

let celebSurveySchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    questionType: {
        type: String,
        enum: [textAnswer, multipleChoice, radioButtons, paragraphTexts],
        required: true
    },
    questionsData: [{
        question: String,
        options: Array,
        correctAnswer: String
    }],
    status: {
        type: String,
        enum: [active, inactive],
        default: "active"
    },
    createdAt: { 
        type: Date,
        default: Date.now },
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

let celebSurvey = (module.exports = mongoose.model("celebSurvey", celebSurveySchema));

// Create a celebSurvey
module.exports.createCelebSurvey = function (celebSurvey, callback) {
    celebSurvey.save(callback);
};

// Edit a celebSurvey

module.exports.editCelebSurvey = function (id, reqbody, callback) {
    celebSurvey.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getCelebSurveyById = function (id, callback) {
    celebSurvey.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = { memberId: id };
    celebSurvey.find(query, callback);
};

