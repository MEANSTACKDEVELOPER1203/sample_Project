let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let PreferencesSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  preferenceName: {
    type: String, 
    // default: []
  },
  parentPreferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default:null
  },
  professions:{
    type: Array
  },
  countries:{
    type: Array, 
    default: []
  },
  logoURL:{
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

let Preferences = (module.exports = mongoose.model("Preferences", PreferencesSchema));

// Create a Preferences
// module.exports.createPreferences = function (Preferences, callback) {
//   Preferences.save(callback);
// };

// Edit a Preferences

module.exports.editPreferences = function (id, reqbody, callback) {
  Preferences.findByIdAndUpdate(id, { $set: reqbody },callback);
};

// Find by Id

module.exports.getPreferencesById = function (id, callback) {
  Preferences.findById(ObjectId(id), callback);
};

module.exports.getPreferencesByParentlist = function(parentPreferenceId, callback) {

  let query = { parentPreferenceId: null }
  Preferences.find(query, callback);
};
module.exports.getPreferencesByParentId = function(parentPreferenceId, callback) {

  let query = {parentPreferenceId : parentPreferenceId};
  Preferences.find(query, callback);
};
module.exports.getProfessionByPreferenceName = function(preferenceName, callback) {

  let query = {preferenceName : preferenceName};
  Preferences.find(query, callback);
};


