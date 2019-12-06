let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let multer = require("multer");

let SplashScreens = require("./splashScreenModel");


// Get SplashScreens by Country GEO code start
router.get("/splashscreenbycountry/:country_geo_code", function (req, res) {
  let country_code = req.params.country_geo_code;
  SplashScreens.getByCountryCode(country_code, function (err, result) {
    res.send(result);
  });
});
// End Get SplashScreens by Country GEO code




// // Upload a Splash Screen using Multi-Form Data start
// let storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/splashscreens");
//   },
//   filename: function (req, file, cb) {
//     var today = new Date();
//     var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//     cb(null, "ck"+"_pr2"+"_"+date+"_"+Date.now()+"_"+file.originalname);
//   }
// });

// let upload = multer({
//   storage: storage
// });

// router.post("/create", upload.any(), function (req, res) {
//   let scrn_url = req.body.scrn_url;
//   let countries = req.body.countries;
//   let screen = req.files;

//   if (Object.keys(req.body).length == 0) {
//     res.json({
//       error: "Please fill the data"
//     });
//   } else if (screen.length == 1) {
//     let scrn_img_path = req.files[0].path;
//     let scrn_originalname = req.files[0].originalname;

//     let newSplashScreen = new SplashScreens({
//       scrn_url: scrn_url,
//       countries: countries,
//       scrn_img_path: scrn_img_path,
//       scrn_originalname: scrn_originalname,
//       created_at: new Date()
//     });

//     SplashScreens.createSplashScreen(newSplashScreen, function (err, user) {
//       if (err) {
//         res.send(err);
//       } else {
//         res.send({ message: "Splash Screen saved sucessfully" });
//       }
//     });
//   } else {
//     res.json({ error: "Please upload a screen" });
//   }
// });

// // Upload a Splash Screen using Multi-Form Data End



// // Edit a SplashScreen using ID start

// router.put("/edit/:splash_screen_id", upload.any(), function (req, res) {
//   let reqbody = req.body;
//   let id = req.params.splash_screen_id;
//   let screen = req.files;

//   if (Object.keys(reqbody).length == 0) {
//     res.json({
//       error: "Please fill the data"
//     });
//   } else if (screen && screen.length == 1) {
//     reqbody.scrn_img_path = req.files[0].path;
//     reqbody.scrn_originalname = req.files[0].originalname;

//     SplashScreens.findById(id, reqbody, function (err, result) {
//       if (err) return res.send(err);
//       if (result) {
//         SplashScreens.findByIdAndUpdate(id, reqbody, function (err, result) {
//           if (err) return res.send(err);
//           res.json({
//             message: "Splash Screen Updated Successfully"
//           });
//         });
//       } else {
//         res.json({
//           error: "Splash Screen Not Exists / Send a valid Splash Screen ID"
//         });
//       }
//     });
//   } else {
//     res.json({ error: "Please upload a screen" });
//   }
// });
// // End Edit a SplashScreen using ID

// // Find Splash Screen by Id start

// router.get("/findById/:splash_screen_id", function (req, res) {
//   let id = req.params.splash_screen_id;

//   SplashScreens.findById(id, function (err, result) {
//     res.send(result);
//   });
// });
// // End Find Splash Screen by Id

// // Delete Splash Screen by Id start

// router.delete("/deleteById/:splash_screen_id", function (req, res, next) {
//   let id = req.params.splash_screen_id;

//   SplashScreens.findByIdAndRemove(id, function (err, post) {
//     if (err) return next(err);
//     if (post == null) {
//       res.json({ message: "Splash Screen Not Found / Invalid ID" });
//     } else {
//       res.json({ message: "Deleted Splash Screen Successfully" });
//     }

//   });
// });
// // End Delete Splash Screen by Id

// // get list of all credits infomation
// router.get("/getAll", function (req, res) {
//   SplashScreens.find({},null, {sort: {createdAt: -1}}, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   })
// });

module.exports = router;
