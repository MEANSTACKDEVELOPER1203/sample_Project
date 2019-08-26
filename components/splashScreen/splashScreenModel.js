let mongoose = require("mongoose");

let SplashScreensSchema = new mongoose.Schema({
  scrn_img_path: { 
    type: String, 
    default: "" 
  },
  scrn_originalname: { 
    type: String, 
    default: "" 
  },
  scrn_url: { 
    type: String, 
    default: "" 
  },
  countries: { 
    type: Array, 
    default: [] 
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

let SplashScreens = (module.exports = mongoose.model("SplashScreens", SplashScreensSchema));

// Create a SplashScreen

module.exports.createSplashScreen = function (newSplashScreen, callback) {
  newSplashScreen.save(callback);
};

// Get SplashScreens based on Country GEO Code

module.exports.getByCountryCode = function (country_code, callback) {
  SplashScreens.find({ "countries": country_code }, callback);
};

// Edit a SplashScreeen

module.exports.editSplashScreen = function (id, reqbody, callback) {
  SplashScreens.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};



