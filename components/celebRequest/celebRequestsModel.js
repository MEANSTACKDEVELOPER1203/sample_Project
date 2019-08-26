let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let pending;
let approved;
let rejected;

// Schema for Email Communication

let CelebRequestsSchema = new mongoose.Schema({
  memberId: String,
  reqDateTime: { 
    type: Date,
    default: Date.now 
  },
  status: {
    type: String,
    enum: [pending, approved, rejected],
    default: pending
  },
  remarks: String,
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

let CelebRequest = (module.exports = mongoose.model("CelebRequest", CelebRequestsSchema));

module.exports.createCelebRequest = function (newRequest, callback) {
  newRequest.save(callback);
};

// Edit a Post

module.exports.editCelebRequest = function (id, reqbody, callback) {
  CelebRequest.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getCelebRequestById = function (id, callback) {
  CelebRequest.findById(ObjectId(id), callback);
};
