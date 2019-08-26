let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let memberChoiceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  celebrityName: {
    type: String,
    default:""
  },
  industry: {
    type: String,
    default:""
  },
  memberChoice_imgPath: {
    type: String,
    trim: true,
    default: ""
  },
  memberChoice_originalname: {
    type: String,
    trim: true,
    default: ""
  },
  createdAt: { 
    type: Date,
    default: Date.now 
  },
  createdBy: { 
    type: String, 
    default: ""
  },
  updatedAt: { 
    type: Date,
    default: Date.now 
  },
  updatedBy: { 
    type: String, 
    default: ""
  }
},{
  versionKey: false
});

let memberChoice = (module.exports = mongoose.model("memberChoice", memberChoiceSchema));

// Create a memberChoice

module.exports.createMemberChoice = function (newMemberChoice, callback) {
  newMemberChoice.save(callback);
};

// Edit a memberChoice

module.exports.editMemberChoice = function (id, reqbody, callback) {
  memberChoice.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getMemberChoiceById = function (id, callback) {
  memberChoice.findById(ObjectId(id), callback);
};

// Find by email

module.exports.getMemberChoiceByEmail = function (email, callback) {
  let query = { email: email };
  memberChoice.find(query, callback);
};
