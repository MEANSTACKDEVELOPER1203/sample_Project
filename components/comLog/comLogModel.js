let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

// Schema for Email Communication
let register;
let forgot;
let changePassword;

let comLogSchema = new mongoose.Schema({
  mode_ids: { 
    type: Array, 
    required: true 
  },
  event: {
    type: String,
    enum: [register, forgot, changePassword],
    default: ""
  },
  from_addr: { 
    type: String,
    default: "admin@celebkonect.com" 
  },
  to_addr: { 
    type: String,
    default: "" 
  },
  content: { 
    type: String,
    default: "" 
  },
  gateway_response: { 
    type: String,
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
},{
  versionKey: false
});

let comLog = (module.exports = mongoose.model("comLog", comLogSchema));

module.exports.createComLog = function (newComLog, callback) {
  newComLog.save(callback);
};

// Edit a ComLog

module.exports.editElog = function (id, reqbody, callback) {
  comLog.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id (getComLogStatus)

module.exports.getComLogById = function (id, callback) {
  comLog.findById(ObjectId(id), callback);
};

// Find by userName

module.exports.getElogByUserName = function (username, callback) {
  let query = { username: username };
  comLog.find(query, callback);
};