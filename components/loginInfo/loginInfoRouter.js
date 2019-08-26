let express = require("express");
let router = express.Router();
let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let multer = require("multer");
var stringify = require("json-stringify");
let ObjectId = require("mongodb").ObjectID;
var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
let bcrypt = require("bcryptjs");
let transport = require("../../routes/email").transport;
let User = require("../users/userModel");
let logins = require("./loginInfoModel");
let comLog = require("../comLog/comLogModel");
let email = require("../../routes/email");
let jwt = require("../../jwt/jwt");
let referralCode = require("../referralCode/referralCodeModel");
let Credits = require("../credits/creditsModel");
var azure = require("azure");
let configSettings = require("../configSettings/configsettingsModel");
let ComLogService = require('../comLog/comLogService');
const Memberpreferences = require('../memberpreferences/memberpreferencesModel');
const memberPreferenceServices = require('../memberpreferences/memberPreferenceServices');
const LoginService = require('./loginServices');
const ReferralCodeService = require('../referralCode/referralCodeService');
const ActivityLog = require("../activityLog/activityLogService");

const NotificationSetting = require('../notificationSettings/notificationSettingsModel');
var notificationHubService = azure.createNotificationHubService(
  "CelebKonect",
  "Endpoint=sb://ckonect.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=J4xv+xuGjLCr02bNVZA3htVuf56bM3lenYk9hbD3klM="
);
let loginController = require('./loginController');
var mySms = require('../../smsConfig');
let request = require('request');

// Multer Settings


router.post("/switchToAnotherAccount",loginController.switchToAnotherAccount)

/*************** change/forgate Password *****************/
//@ reset password
//@ put method
//@ access public
router.put('/resetPassword/:member_Id',loginController.resetPassword);
//@ forget password
//@ post method
//@ access public
//@ please comment API service once done below service this one  is "logininfo/resetPasswordByEmail"
router.post('/forgotPassword', loginController.forgotPassword)
/*************** change/forgate Password *****************/








let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avtars/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

let upload = multer({
  storage: storage
});

// Create LoginInfo Document
router.post("/create", function (req, res) {

  let email = (req.body.email).toLowerCase();
  let username = (req.body.username).toLowerCase();
  let mobileNumber = req.body.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
  let password = req.body.password;
  let lastLoginDate = new Date();
  let lastLogoutDate = req.body.lastLogoutDate;
  let lastLoginLocation = req.body.lastLoginLocation;
  let pwdChangeDate = req.body.pwdChangeDate;
  let deviceToken = req.body.deviceToken;
  let timezone = req.body.timezone;
  let country = req.body.country;
  let created_by = req.body.created_by;
  let updated_by = req.body.updated_by;
  let resetPasswordToken = req.body.resetPasswordToken;
  let resetPasswordExpires = req.body.resetPasswordExpires;
  let callingDeviceToken = req.body.callingDeviceToken;
  //console.log("/////////////// logininfo create ///////")
  // console.log(req.body);
  // console.log("/////////////// End of logininfo create ///////")
  logins.findOne({
    email
  }, (err, existingUser) => {
    if (err) {
      return next(err);
    }

    // If user is not unique, return error
    if (existingUser) {
      return res.json({
        message: "email address is already in use."
      });
    }

    logins.findOne({
      username
    }, (err, existingUser1) => {
      if (err) {
        return next(err);
      }

      // If user is not unique, return error
      if (existingUser1) {
        return res.json({
          message: "username is already in use."
        });
      }
      logins.findOne({
        mobileNumber
      }, (err, existingUser1) => {
        if (err) {
          return next(err);
        }

        // If user is not unique, return error
        if (existingUser1) {
          return res.json({
            message: "mobileNumber is already in use."
          });
        }
        var mobile = country.concat(mobileNumber).substr(1);
        let newLoginInfo = new logins({
          email: email,
          username: username,
          password: password,
          mobileNumber: mobile,
          deviceToken: deviceToken,
          timezone: timezone,
          lastLoginLocation: lastLoginLocation,
          lastLoginDate: lastLoginDate,
          lastLogoutDate: lastLogoutDate,
          pwdChangeDate: pwdChangeDate,
          created_by: created_by,
          updated_by: updated_by,
          resetPasswordToken: resetPasswordToken,
          resetPasswordExpires: resetPasswordExpires,
          callingDeviceToken: callingDeviceToken
        });
        //console.log(newLoginInfo);
        logins.createLoginInfo(newLoginInfo, function (err, user) {
          if (err) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
          } else {
            res.json({
              message: "Inserted Document sucessfully",
              userdata: user
            });
            if (req.body.loginType == "socialRegister") {
              User.getUserByEmail(email, function (err, uresult) {
                let rCode = uresult.referralCode;

                referralCode.findOne({
                  memberCode: rCode
                }, function (
                  err,
                  refResult
                ) {
                    if (err) {
                      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    }
                    if (refResult) {
                      let newCredits = new Credits({
                        memberId: uresult._id,
                        creditType: "promotion",
                        creditValue: parseInt(0),
                        cumulativeCreditValue: parseInt(0),
                        referralCreditValue: refResult.referralCreditValue,
                        createdBy: uresult.fName
                      });

                      Credits.createCredits(newCredits, function (err, credits) {
                        if (err) {
                          res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else {
                          oldValue = parseInt(uresult.cumulativeEarnings);
                          /// Check if Refree is Celebrity Or Not
                          let isRefCeleb;
                          User.findOne({
                            _id: refResult.memberId
                          }, function (err, refCeleb) {
                            //console.log("Refeceleb user object == ")
                            //console.log(refCeleb)
                            if (refCeleb) {
                              if (refCeleb.isCeleb == true) {
                                isRefCeleb = true;
                              }
                            }

                            let fBody = {};
                            fBody.cumulativeEarnings =
                              parseInt(refResult.referralCreditValue) + oldValue;

                            if (isRefCeleb == true) {
                              fBody.celebCredits = refResult.referralCreditValue + "-" + refResult.memberId;
                            } else {
                              fBody.celebCredits = 0 + "-" + refResult.memberId;
                            }
                            User.findByIdAndUpdate(uresult._id, fBody, function (
                              err,
                              upResult
                            ) { });
                            let myBody = {};
                            let nId = userInfo._id;

                            // Change RefCreditValue to the logged in user
                            myBody.refCreditValue = true;
                            logins.findByIdAndUpdate(nId, myBody, function (
                              err,
                              nResult
                            ) { });
                            // End of Change RefCreditValue to the logged in User

                          });
                          /// End of Check if Refree is Celebrity Or Not


                          // Insert Credits to the Referred Celebrity / Member
                          // Start of Fetch Latest Credits Information
                          Credits.find({
                            memberId: refResult.memberId
                          },
                            null, {
                              sort: {
                                createdAt: -1
                              }
                            },
                            function (err, cBal) {
                              if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                              if (cBal) {
                                cBalObj = cBal[0];
                                newReferralCreditValue = cBalObj.referralCreditValue + parseInt(refResult.referreCreditValue);
                                let newCredits = new Credits({
                                  memberId: refResult.memberId,
                                  creditType: "promotion",
                                  cumulativeCreditValue: cBalObj.cumulativeCreditValue,
                                  creditValue: refResult.referralCreditValue,
                                  referralCreditValue: newReferralCreditValue
                                });
                                // Insert Into Credit Table
                                Credits.createCredits(newCredits, function (err, credits) {
                                  if (err) {
                                    res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                  } else {
                                    /* res.send({
                                      message: "Credits updated successfully",
                                      creditsData: credits
                                    }); */

                                    // Update Cumulative earnings in User Object
                                    User.findOne({
                                      _id: refResult.memberId
                                    }, function (err, nuResult) {
                                      nId = nuResult._id;
                                      oldValue = parseInt(nuResult.cumulativeEarnings);
                                      let newbody1 = {};
                                      newbody1.cumulativeEarnings = refResult.referralCreditValue + oldValue;
                                      User.findByIdAndUpdate(nId, newbody1, function (
                                        err,
                                        upResult
                                      ) { });
                                    });
                                    // end of Update Cumulative earnings in User Object
                                  }
                                });
                                // End of Inset into Credit Table
                              } else {
                                //  console.log("credits not exists");
                              }
                            }
                          ); // End of Create Credits
                          // End of Insert Credits to the Referred Celebrity / Member
                        }
                      });
                    } else {
                      let newCredits = new Credits({
                        memberId: uresult._id,
                        creditType: "promotion",
                        creditValue: parseInt(0),
                        cumulativeCreditValue: parseInt(0),
                        referralCreditValue: parseInt(0),
                        createdBy: uresult.fName
                      });

                      Credits.createCredits(newCredits, function (err, credits) {
                        if (err) {
                          res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                        } else {
                          let myBody = {};
                          let nId = userInfo._id;
                          myBody.refCreditValue = true;

                          logins.findByIdAndUpdate(nId, myBody, function (
                            err,
                            nResult
                          ) { });
                        }
                      });
                    }
                  });
              });
              // End of Insert Referred Credits to the User and Celebrity

            }

          }
        });
      });
    });
  });
});
// End of Create LoginInfo Document

// Login
router.get("/login", function (req, res) {
  res.json({
    token: req.headers['x-access-token'],
    success: 0,
    message: "Please enter valid password!"
  });
});

// Local Strategy for passport authentication
passport.use(
  new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  },
    function (email, password, done) {
      let query = {
        $or: [
          { email: email.toLowerCase() },
          { mobile: email }
        ]
      }
      logins.findOne(query, (err, user) => {
        if (err) {
          return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        }
        else{
          configSettings.findOne({}, function (err, result) {
            if (err){
              return next(err);
            }
            else if (password == result.defaultPassword) {
              //console.log(result.defaultPassword);
              return done(null, user);
              //res.send(result);
            } else {
              // res.json({
              //   error: "No data found!"
              // });
            }
            
            logins.comparePassword(password, user.password, function (err, isMatch) {
              if (err) resizeBy.send(err);
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, {
                  error: "Invalid password"
                });
              }
            });
          });
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  logins.getUserById(id, function (err, user) {
    done(err, user);
  });
});



// End of Local Strategy for passport authentication

// Login a user using email and password
// Login a user using email and password
router.post(
  "/login",LoginService.userAuthenticattion,
  passport.authenticate("local", {
    failureRedirect: "/logininfo/login",
    failureFlash: true
  }),
  (req, res) => {
    console.log(req.body)
    userInfo = req.user;
    User.getUserByEmail(req.body.email, (err, uresult) => {
      if (err) {
        res.json({
          success: 0,
          message: "Please try again." + err
        });
      }
      else if (uresult) {
        let body ={
          memberId:uresult._id,
          createdBy:uresult._id
        }
        ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Login",body,(err,newActivityLog)=>{
          if(err){
            res.json({
              success: 0,
              message: "Please try again." + err
            });
          }else{
            // if(!uresult.isMobileVerified && !uresult.isEmailVerified){
          
            // }else if(req.body.email == uresult.email && !uresult.isEmailVerified){
            //     return res.json({success:0,message:"Please Provide varified Details"})
            // }else if(req.body.email == uresult.mobile && !uresult.isMobileVerified){
            //     return res.json({success:0,message:"Please Provide varified Details"})
            // }
            NotificationSetting.find({ memberId: uresult._id }, { isEnabled: 1, notificationSettingId: 1, _id: 1 }, (err, notificationSettings) => {
              if (err) {
                res.json({
                  success: 0,
                  message: "Please try again." + err
                });
              }
              else {
                if ((uresult == null) || (uresult == "")) {
                  res.json({
                    error: "Email not found"
                  });
                } else {
                  let userInfor = {};
                  let logininfo = uresult;
                  userInfor.userInfo = logininfo;
                  userInfor.loginInfo = userInfo;
                  ReferralCodeService.getReferalCode(uresult._id,(err,selfReferralCode)=>{
                      if(err){
                        res.json({success: 0,message:err});
                      }else{
                        userInfor.selfReferralCode = selfReferralCode;
                        Credits.findOne({
                          memberId: uresult._id
                        }, null, (err, cBal) => {
                          if (err)
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                          if (cBal) {
                            let creditInfo = cBal;
                            userInfor.creditInfo = creditInfo;
                            // if (req.user.resetPasswordToken == null ||req.user.resetPasswordToken == "") {
                              let newbody = {};
                              let id = userInfo._id;
                              var token = jwt.createToken(id)
                              newbody.lastLoginLocation = req.body.lastLoginLocation;
                              newbody.lastLoginDate = new Date();
                              newbody.deviceToken = req.body.deviceToken;
                              newbody.callingDeviceToken = req.body.callingDeviceToken;
                              newbody.timezone = req.body.timezone;
                              newbody.osType = req.body.osType;
                              newbody.token = token;
                              User.update({_id:userInfo._id},{$set:{liveStatus:"false"}})
                              // To update last login time and location
                              logins.findByIdAndUpdate(id, newbody, { new: true }, (err, newLoginInfo) => {
                                if (err) {
                                  return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                }
                                else {
                                  userInfor.loginInfo = newLoginInfo;
                                  userInfor.notificationSettings = notificationSettings;
                                  Memberpreferences.findOne({ memberId: uresult._id },(err,memberPreferancesObj)=>{
                                    if(err)
                                    {
                                      userInfor.isPreferencesSelected = false;
                                      res.json({
                                        "success": 1,
                                        "message": "login sucessfully",
                                        //"deviceToken": userInfo.deviceToken,
                                        //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                                        "token": token,
                                        "data": userInfor
                                      });
                                    }else if(memberPreferancesObj){
                                      if(memberPreferancesObj.preferences.length<3)
                                      {
                                        userInfor.isPreferencesSelected = false;
                                        res.json({
                                          "success": 1,
                                          "message": "login sucessfully",
                                          //"deviceToken": userInfo.deviceToken,
                                          //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                                          "token": token,
                                          "data": userInfor
                                        });
                                      }
                                      else{
                                        userInfor.isPreferencesSelected = true;
                                        res.json({
                                          "success": 1,
                                          "message": "login sucessfully",
                                          //"deviceToken": userInfo.deviceToken,
                                          //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                                          "token": token,
                                          "data": userInfor
                                        });
                                      }
                                    }
                                    else{
                                      memberPreferenceServices.saveMemberPreference({ memberId: uresult._id }, (err, data) => {
                                      if(err)
                                      {
                                        res.json({
                                          "success": 0,
                                          "message": "Please try again",
                                          //"deviceToken": userInfo.deviceToken,
                                          //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                                          "token": token,
                                          "data": null
                                        });
                                      }
                                      else{
                                        userInfor.isPreferencesSelected = true;
                                        res.json({
                                          "success": 1,
                                          "message": "login sucessfully",
                                          //"deviceToken": userInfo.deviceToken,
                                          //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                                          "token": token,
                                          "data": userInfor
                                        });
                                      }
                                      });
                                    }
                                  });
                                }
                              });
                            // } else {
                            //   res.json({
                            //     "success": 6,
                            //     "message": "you should complete your reset password process first!"
                            //   });
                            // }
                          } else {
                            let rCode = uresult.referralCode;
          
          
                            referralCode.findOne({
                              memberCode: rCode
                            }, function (
                              err,
                              refResult
                            ) {
                                //console.log("refResult", refResult);
                                if (err) {
                                  res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                }
                                if (refResult) {
                                  //console.log("refResult.creditValue",refResult.creditValue);
                                  let newCredits = new Credits({
                                    memberId: uresult._id,
                                    creditType: "promotion",
                                    creditValue: parseInt(0),
                                    cumulativeCreditValue: parseInt(0),
                                    referralCreditValue: refResult.referralCreditValue,
                                    createdBy: uresult.fName
                                  });
          
                                  Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                    } else {
                                      userInfor.creditInfo = credits;
                                      let id = userInfo._id;
                                      let newbody = {};
                                      var token = jwt.createToken(id)
                                      newbody.lastLoginLocation = req.body.lastLoginLocation;
                                      newbody.lastLoginDate = new Date();
                                      newbody.deviceToken = req.body.deviceToken;
                                      newbody.callingDeviceToken = req.body.callingDeviceToken;
                                      newbody.timezone = req.body.timezone;
                                      newbody.osType = req.body.osType;
                                      newbody.token = token;
          
                                      // To update last login time and location
                                      logins.findByIdAndUpdate(id, newbody, { new: true }, (err, newLoginInfo) => {
                                        if (err) {
                                          return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                        }
                                        else {
                                          userInfor.loginInfo = newLoginInfo;
                                          userInfor.notificationSettings = notificationSettings;
                                          res.json({
                                            "success": 1,
                                            "message": "login sucessfully",
                                            //"deviceToken": userInfo.deviceToken,
                                            //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                                            "token": token,
                                            "data": userInfor
                                          });
                                        }
                                      });
          
                                    }
                                  });
                                } else {
                                  let newCredits = new Credits({
                                    memberId: uresult._id,
                                    creditType: "promotion",
                                    creditValue: parseInt(0),
                                    cumulativeCreditValue: parseInt(0),
                                    referralCreditValue: parseInt(0),
                                    createdBy: uresult.fName
                                  });
          
                                  Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                    } else {
                                      userInfor.creditInfo = credits;
                                      let id = userInfo._id;
                                      let newbody = {};
                                      var token = jwt.createToken(id)
                                      newbody.lastLoginLocation = req.body.lastLoginLocation;
                                      newbody.lastLoginDate = new Date();
                                      newbody.deviceToken = req.body.deviceToken;
                                      newbody.callingDeviceToken = req.body.callingDeviceToken;
                                      newbody.timezone = req.body.timezone;
                                      newbody.osType = req.body.osType;
                                      newbody.token = token;
          
                                      // To update last login time and location
                                      logins.findByIdAndUpdate(id, newbody, { new: true }, (err, newLoginInfo) => {
                                        if (err) {
                                          return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                                        }
                                        else {
                                          userInfor.loginInfo = newLoginInfo;
                                          userInfor.notificationSettings = notificationSettings;
                                          res.json({
                                            "success": 1,
                                            "message": "login sucessfully",
                                            //"deviceToken": userInfo.deviceToken,
                                            //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                                            "token": token,
                                            "data": userInfor
                                          });
                                        }
                                      });
          
                                    }
                                  });
          
                                }
                              });
          
          
                          }
                        }).sort({ createdAt: -1 }).limit(1);
                      }
                  })
                }
              }
            }).populate('notificationSettingId', 'notificationType notificationName')
          }
        })
        
      }
      else {
        res.json({
          success: 0,
          message: "UserInfo not found."
        });
      }
    });
    //}
  }
);
// End of Login a user using email and password

router.post("/logout", function (req, res) {
  let userId = req.body.userId;
  let body ={
    memberId:userId,
    createdBy:userId
  }
  ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Logout",body,(err,newActivityLog)=>{
    if(err){
      res.json({
        success: 0,
        message: "Please try again." + err
      });
    }else{
      // console.log(req.body);
      req.logout();
      res.json({
        "success": 1,
        "token": req.headers['x-access-token'],
        "message": "logout sucessfully"
      });
      logins.findOne({memberId:userId}, (err, result) => {
        if(result){
          let id = result._id;
          if (err) return console.log(err);
          logOutBody = {};
          logOutBody.lastLogoutDate = new Date();
          logOutBody.deviceToken = "";
          logOutBody.callingDeviceToken = "";
          logins.findOneAndUpdate({
            _id: id
          }, logOutBody,(err, updateLogiDetails)=>{ });
          let newBody = {};
          newBody.isOnline = false;
          User.findByIdAndUpdate(userId,newBody,(err, nResult)=>{
          });
        }else{
          console.log("user not found" +userId )
        }
      });
    }
  });
});

// Logout a user by email
// router.post("/logout", function (req, res) {
//   let email = req.body.email.toLowerCase();
//   // console.log(req.body);
//   req.logout();
//   res.json({
//     "success": 1,
//     "token": req.headers['x-access-token'],
//     "message": "logout sucessfully"
//   });

//   let query = {
//     $or: [
//       { email: email },
//       { mobile: email }
//     ]
//   }
//   logins.findOne(query, (err, result) => {
//     let id = result._id;

//     if (err) return console.log(err);
//     logOutBody = {};
//     logOutBody.lastLogoutDate = new Date();
//     logOutBody.deviceToken = "";
//     logOutBody.callingDeviceToken = "";

//     logins.findOneAndUpdate({
//       _id: id
//     }, logOutBody, function (err, dude) { });
//     User.getUserByEmail(email, function (err, uresult) {
//       let newBody = {};
//       let id1 = uresult._id;
//       newBody.isOnline = false;
//       User.findByIdAndUpdate(id1, newBody, function (err, nResult) {
//       });
//     });
//   });
// });
// End of Logout a user by email
// Logout a user by email
router.post("/secureLogout", function (req, res) {
  let query = {
    $or: [
      { email: req.body.email.toLowerCase()},
      { mobile: req.body.email }
    ]
  }

  req.logout();
  logins.findOne(query, (err, result) =>{
    let id = result._id;

    if (err) return console.log(err);

    // To update last LOGOUT time
    logOutBody = {};
    logOutBody.lastLogoutDate = new Date();
    logOutBody.deviceToken = req.body.deviceToken;
    logOutBody.callingDeviceToken = "";

    logins.findOneAndUpdate({
      _id: id
    }, logOutBody, function (err, dude) { });
    User.getUserByEmail(email, function (err, uresult) {
      let newBody = {};
      let id1 = uresult._id;
      // newBody.isOnline = false;
      var token = jwt.createToken(uresult._id)

      Credits.find({
        memberId: uresult._id
      },
        null, {
          sort: {
            createdAt: -1
          }
        },
        function (err, cBal) {
          if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
          if (cBal) {
            console.log("cBal", cBal[0]);
            let creditInfo = cBal[0];

            User.findByIdAndUpdate(id1, newBody, function (err, nResult) {
              let userdata = {};
              userdata.lastLogoutDate = new Date();
              userdata.logininfo = uresult;
              userdata.userInfo = result;
              userdata.creditInfo = creditInfo;
              res.json({
                "success": 1,
                "message": "logout sucessfully",
                //"deviceToken": userInfo.deviceToken,
                //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
                "token": token,
                "data": userdata
              });
            });
          }
        });
    });
  });


});
// End of Logout a user by email


// Edit LoginInfo
router.put("/edit/:emailID", function (req, res) {
  let email = req.params.emailID;

  let reqbody = req.body;

  reqbody.updatedAt = new Date();

  logins.findOne({
    email: email
  }, function (err, result) {
    if (result) {
      let id = result._id;
      logins.findByIdAndUpdate(id, reqbody, function (err, nResult) {
        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        res.json({ token: req.headers['x-access-token'], success: 1, message: "LoginInfo Updated Successfully" });
        User.getUserByEmail(email, function (err, uresult) {
          let newBody = {};
          let id1 = uresult._id;
          newBody.isOnline = true;

          User.findByIdAndUpdate(id1, newBody, function (err, nuResult) { });
          if (
            result.refCreditValue == false ||
            result.refCreditValue == undefined
          ) {
            let rCode = uresult.referralCode;
            referralCode.findOne({
              memberCode: rCode
            }, function (
              err,
              refResult
            ) {
                if (err) {
                  res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                }
                if (refResult) {
                  let newCredits = new Credits({
                    memberId: uresult._id,
                    creditType: "promotion",
                    creditValue: parseInt(0),
                    cumulativeCreditValue: parseInt(0),
                    referralCreditValue: refResult.referralCreditValue,
                    createdBy: uresult.fName
                  });

                  Credits.createCredits(newCredits, function (err, credits) {
                    if (err) {
                      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    } else {
                      oldValue = parseInt(uresult.cumulativeEarnings);
                      let fBody = {};
                      fBody.cumulativeEarnings =
                        parseInt(refResult.referralCreditValue) + oldValue;
                      User.findByIdAndUpdate(uresult._id, fBody, function (
                        err,
                        upResult
                      ) { });
                      let myBody = {};
                      let nId = result._id;
                      myBody.refCreditValue = true;

                      logins.findByIdAndUpdate(nId, myBody, function (
                        err,
                        nlResult
                      ) { });
                    }
                  });
                } else {
                  let newCredits = new Credits({
                    memberId: uresult._id,
                    creditType: "promotion",
                    creditValue: parseInt(0),
                    cumulativeCreditValue: parseInt(0),
                    referralCreditValue: parseInt(0),
                    createdBy: uresult.fName
                  });

                  Credits.createCredits(newCredits, function (err, credits) {
                    if (err) {
                      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                    } else {
                      let myBody = {};
                      let nId = result._id;
                      myBody.refCreditValue = true;

                      logins.findByIdAndUpdate(nId, myBody, function (
                        err,
                        nResult
                      ) { });
                    }
                  });
                }
              });
          }
        });
      });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "LoginInfo not found / Invalid" });
    }
  });
});
// End of Edit LoginInfo

// get Login info by Email id
router.get("/getLoginInfo/:email", function (req, res) {
  let email = req.params.email;

  logins.findOne({
    email: email.toLowerCase()
  }, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    if (result == null) {
      res.json({
        error: "Please enter valid Email"
      });
    } else {
      res.send(result);
    }
  });
});
// End of get Login info by Email id

// get Member details by userID

router.get("/getMember/:user_id", function (req, res, next) {
  let id = req.params.user_id;

  logins.getUserById(id, function (err, result) {
    if (err) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    if (result == null) {
      res.json({
        error: "Please enter valid id"
      });
    } else {
      res.send(result);
    }
  });
});
// End of get Member details by userID

// get user timezone by UserId
router.get("/getUserTimezone/:user_id", function (req, res, next) {
  let id = req.params.user_id;

  logins.getloginInfoById(id, function (err, result) {
    if (err) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    if (result == null) {
      res.json({
        error: "Please enter valid id"
      });
    } else {
      res.send(result.timezone);
    }
  });
});
// End of get user timezone by UserId

// get Member details by username
router.get("/getMemberByusername/:username", function (req, res, next) {
  let username = (req.params.username).toLowerCase();

  User.getUserByUsername(username, function (err, result) {
    if (err) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    if (result == null) {
      res.json({
        error: "Please enter valid username"
      });
    } else {
      res.send(result);
    }
  });
});
// End of get Member details by username

// get Member details by mobileNumber
router.get("/getMemberBymobileNumber/:mobileNumber", function (req, res, next) {
  let mobileNumber = req.params.mobileNumber;

  User.getUserBymobileNumber(mobileNumber, function (err, result) {
    if (err) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    if (result == null) {
      res.json({
        error: "Please enter valid mobileNumber"
      });
    } else {
      res.send(result);
    }
  });
});
// End of get Member details by mobileNumber

// get Member details by email
router.get("/getMemberByEmail/:email", function (req, res, next) {
  newLoginLog.email = (req.params.email).toLowerCase();

  User.getUserByEmail(email, function (err, result) {
    if (err) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    if (result == null) {
      res.json({
        error: "Please enter valid email"
      });
    } else {
      res.send(result);
    }
  });
});
// End of get details Member by email

// get celebrity users list
router.get("/getMemberByisCeleb", function (req, res, next) {
  let isCeleb = true;
  User.getUserByisCeleb(isCeleb, function (err, result) {
    if (err) {
      return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    if (result == null) {
      res.json({
        error: "No Celebrities found"
      });
    } else {
      res.send(result);
    }
  });
});
// End of get celebrity users list

// Download User Profile Pic using Id
router.get("/getprofilepic/:id", function (req, res) {
  let id = ObjectId(req.params.id);
  if (err) {
    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
  }
  User.find({
    _id: id
  }, function (err, profiledata) {
    res.download(profiledata[0].avtar_imgPath);
  });
});
// End of Download User Profile Pic using Id

// Forgot Password by UserID
router.post("/resetPasswordByUserID", upload.any(), function (req, res, next) {
  let id = req.body.user_id;
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = Math.floor(Math.random() * 1000000 + 54);
          done(err, token);
        });
      },
      function (token, done, callback) {
        logins.findById(id, function (err, user) {
          if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
          }
          if (!user) {
            res.json({
              error: "No account with that email address exists."
            });
          } else {
            if (user.verified == false) {
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
              user.save(function (err) {
                done(err, token, user);
              });
            } else {
              res.json({
                message: "your account already verified!"
              });
            }
          }
        });
      },
      function (token, user, done) {
        res.json({
          message: "An e-mail has been sent to " +
            user.email +
            " with further instructions."
        });
        done(null, "done");
      }
    ],
    function (err) {
      if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
  );
});
// End of Forgot Password by UserID

// Forgot Password by Email
router.get("/forgot", function (req, res) {
  res.render("forgot");
});
// End of forgot password by email

// Reset password by email
router.post("/resetPasswordByEmail", upload.any(), function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = Math.floor(Math.random() * 1000000 + 54);
          done(err, token);
        });
      },
      function (token, done, callback) {
        logins.findOne({
          email: (req.body.email).toLowerCase()
        }, function (err, user) {
          if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
          }
          if (!user) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "No account exists with the provided details." });

          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            user.save(function (err) {
              done(err, token, user);
            });
          }
        });
      },
      function (token, user, done) {
        let mode_ids = ["email"];
        let from_addr = "admin@celebkonect.com";
        let to_addr = (req.body.email).toLowerCase();
        let content = "Email Verification or Forgot password";
        let event = 'forgot';

        let newComLog = new comLog({
          mode_ids: mode_ids,
          event: event,
          from_addr: from_addr,
          to_addr: to_addr,
          content: content
        });
        ComLogService.createComLog(newComLog, req, (err, comLog) => {
          if (err) {
            done(err, null);
          }
          else {
            res.json({
              token: req.headers['x-access-token'], success: 1,
              message: "An e-mail is sent to " +
                user.email +
                ". Please follow the instructions mentioned."
            });
          }
          done(null, comLog);
        })
      }
    ],
    function (err) {
      if (err)
        return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
  );
});
// End of Reset password by email

// Forgot Password by Username
router.post("/resetPasswordByUsername", upload.any(), function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = Math.floor(Math.random() * 1000000 + 54);
          done(err, token);
        });
      },
      function (token, done, callback) {
        logins.findOne({
          username: (req.body.username).toLowerCase()
        }, function (err, user) {
          if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
          }
          if (!user) {
            res.json({
              error: "No account exists with the provided details."
            });
          } else {
            if (user.verified == false) {
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
              user.save(function (err) {
                done(err, token, user);
              });
            } else {
              res.json({
                message: "your account already verified!"
              });
            }
          }
        });
      },
      function (token, user, done) {
        res.json({
          message: "An e-mail has been sent to " +
            user.email +
            " with further instructions."
        });
        done(null, "done");
      }
    ],
    function (err) {
      if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
  );
});
// End of Forgot Password by Username

// Forgot Password by MobileNumber
router.post("/resetPasswordByMobileNo", upload.any(), function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = Math.floor(Math.random() * 1000000 + 54);
          done(err, token);
        });
      },
      function (token, done, callback) {
        logins.findOne({
          mobileNumber: req.body.mobileNumber
        }, function (
          err,
          user
        ) {
            if (err) {
              return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
            }
            if (!user) {
              res.json({
                error: "No account exists with the provided details."
              });
            } else {
              if (user.verified == false) {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function (err) {
                  done(err, token, user);
                });
              } else {
                res.json({
                  message: "your email already verified!"
                });
              }
            }
          });
      },
      function (token, user, done) {
        res.json({
          message: "OTP has been sent to " + user.mobileNumber
        });
        done(null, "done");
      }
    ],
    function (err) {
      if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
  );
});
// End of Forgot Password by MobileNumber

// Reset Password Routes
router.get("/reset/:token", function (req, res) {
  logins.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  },
    function (err, user) {
      if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      if (user == null) {
        res.json({
          error: "Request dosen't exist!"
        });
      } else {
        let URL = "http://" + req.hostname + ":4300/logininfo" + req.url;
        res.render("forgot.ejs", {
          URL: URL
        });
      }
    }
  );
});
// End of reset password routes

// Reset Password Token
router.post("/reset/:token", function (req, res) {
  //console.log(req.body)
  logins.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  },
    function (err, user) {
      if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      if (user == null) {
        res.json({
          error: "Request dosen't exist!"
        });
      } else {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            let reqbody = {};
            reqbody.password = hash;
            reqbody.resetPasswordToken = null;
            reqbody.resetPasswordExpires = null;
            let id = user._id;

            logins.editLoginInfo(id, reqbody, function (err, user) {
              if (err) {
                res.json({ token: req.headers['x-access-token'], success: 0, message: err });
              } else {
                res.render('passwordSuccess')
              }
            });
          });
        });
      }
    }
  );
});
// End of Reset Password Token

// Restet Password
router.post("/reset", function (req, res, next) {
  //console.log(req.body)
  async.waterfall(
    [
      function (done) {
        User.findOne({
          resetPasswordToken: req.body.token,
          resetPasswordExpires: {
            $gt: Date.now()
          }
        },
          function (err, user) {
            if (!user) {
              return res.json({
                error: "Invalid code"
              });
            }
            bcrypt.genSalt(10, function (err, salt) {
              bcrypt.hash(req.body.password, salt, function (err, hash) {
                user.password = hash;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function (err) {
                  req.logIn(user, function (err) {
                    done(err, user);
                  });
                });
              });
            });
          }
        );
      },
      function (user, done) {
        transport.sendMail({
          to: user.email,
          from: "admin@celebkonect.com",
          subject: "Your password has been changed",
          text: "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n"
        },
          function (err, info) {
            if (err) {
              console.error(err);
            } else {
              res.json({
                message: "Success! Your password has been changed."
              });
            }
          }
        );
      }
    ],
    function (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
  );
});
// End of Restet Password

// EMAIL Verification
router.get("/verifyEmail/:email/:emailVerificationCode", function (req, res, next) {
  User.find({
    email: (req.params.email).toLowerCase()
  }, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    if (result.length == 0) {
      res.render('noaccountfound');
    } else if (result[0].isEmailVerified == true) {
      res.render('alreadyVerified');
    } else if ((result[0].isEmailVerified == false) && (result[0].emailVerificationCode == req.params.emailVerificationCode)) {
      User.updateOne({
        email: req.params.email
      }, {
          $set: {
            isEmailVerified: true,
            emailVerificationCode: 0
          }
        },
        function (err, newresult) {
          if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
          if (newresult.nModified == 1) {
            res.render('thankyouEmail')
          } else {
            res.json({
              error: "Operation Failed. Please Try Again!"
            });
          }
        }
      );
    } else {
      res.render('invalidrequest');
      res.json({
        error: "Invalid request!"
      });
    }
  });
});
// End of EMAIL Verification

// MOBILE Verification
router.get("/verifyMobile/:mobile", function (req, res, next) {
  let emailId = req.params.mobile;
  User.find({
    email: (req.params.mobile).toLowerCase()
  }, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    if (result.length == 0) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "No mobile number Found! Please check again.." });
    } else if (result[0].isMobileVerified == true) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Your Mobile number is already verified" });
    } else if (result[0].isMobileVerified == false) {
      if (result[0].mobileNumber.length < 10) {
        let URL = "http://" + req.hostname + ":4300/logininfo/updateMobile/" + result[0].mobileNumber;
        res.render('updateMobile', {
          URL: URL,
          mobileNumber: result[0].mobileNumber
        });
      } else {
        let URL = "http://" + req.hostname + ":4300/logininfo/verifyotp";
        res.render('verifyMobile', {
          URL: URL,
          mobileNumber: result[0].mobileNumber
        });
      }
    }
  });
});
// End of MOBILE Verification

// Verify Email and Mobile OTP Code
router.put("/verifyotp", function (req, res) {

  /////////////////////////////////// Email Verification //////////////////////////////////////////////
  if (req.body.type == "email") {

    logins.findOne({
      email: req.body.email.toLowerCase()
    }, function (err, lResult) {
      if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      if (lResult == null) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "Please enter valid email" });
      } else {

        if (req.body.verificationcode == lResult.emailVerificationCode) {
          let id = lResult._id;
          let newbody = {};
          newbody.updatedAt = new Date();
          newbody.emailVerificationCode = "";

          logins.findByIdAndUpdate(id, newbody, function (err, result) {
            res.json({ token: req.headers['x-access-token'], success: 1, message: "Email verified successfully!" });
            // Update user object "isEmailVerified" 
            User.findOne({
              email: req.body.email.toLowerCase()
            }, function (err, uResult) {
              if (err) res.json({ token: req.headers['x-access-token'], success: 0, message: err });
              if (uResult) {
                let id = uResult._id;
                let newBody = {};
                newBody.updated_at = new Date();
                newBody.isEmailVerified = "true";
                User.findByIdAndUpdate(id, newBody, function (err, result) { });
              } else {
                console.log({
                  error: "Email not found / Invalid!"
                });
              }

            });
            // End of user object "isEmailVerified" 
          });

        } else {
          res.json({ token: req.headers['x-access-token'], success: 0, message: "Invalid code entered!" });

        }
      }
    });
  }
  // End of Email Verification

  /////////////////////////////////////////// Mobile Verification /////////////////////////////////////////////////
  if (req.body.type == "mobile") {
    // console.log(' ============================= verify otp  ==============================')
    console.log(req.body)
    // console.log('=============== veriufy otp ends ==========================================')
    let authKey = "214777AbOoSEwKiYX5af41211";
    logins.findOne({
      mobileNumber: req.body.mobileNumber
    }, function (err, lResult) {
      if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      if (lResult == null) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "Please enter valid mobile number" });
      } else {
        ////// Verify OTP //////////
        request("http://my.msgwow.com/api/verifyRequestOTP.php?authkey=" + authKey + "&mobile=" + req.body.mobileNumber + "&otp=" + req.body.verificationcode, function (error, response, body) {
          if (error) {
            console.log(error)
          }
          let Body = req.body

          // console.log('============ OTP VERIFICATION ==============')
          //console.log(Body)
          // console.log('============ OTP VERIFICATION ==============')

          if (Body.message == "otp_not_verified") {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "Invalid OTP, Please try again!" });
          }

          else if (Body.message == "already_verified") {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "Already verified!!" });
            // Update user object "isMobileVerified" 
            User.findOne({
              mobileNumber: req.body.mobileNumber
            }, function (err, uResult) {
              if (err) res.json({ token: req.headers['x-access-token'], success: 0, message: err });
              //     console.log(' ============================= update mobile result  ==============================')
              // console.log(uResult)
              // console.log('=============== update mobile result ==========================================')
              if (uResult) {
                let id = uResult._id;
                let newBody = {};
                newBody.updated_at = new Date();
                newBody.isMobileVerified = "true";
                // console.log(' ============================= update user result  ==============================')
                // console.log(id)
                // console.log(newBody)
                // console.log('=============== update user result ==========================================')
                User.findByIdAndUpdate(id, newBody, function (err, result) {

                });
              } else {
                console.log({
                  error: "Mobile number not found / Invalid!"
                });
              }
            });
            // End of user object "isMobileVerified"
          } else if (Body.message == 'mobile_not_found') {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "Invalid mobile number" });
          }
          else if (Body.message == "otp_expired") {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "OTP Expired!!" });
          } else if (Body.message == "invalid_otp") {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "Invalid OTP" });
          } else if (Body.message == "last_otp_request_on_this_number_is_invalid") {
            res.json({ token: req.headers['x-access-token'], success: 0, message: "Invalid mobile number" });
          } else {
            // Update user object "isMobileVerified" 
            User.findOne({
              mobileNumber: req.body.mobileNumber
            }, function (err, uResult) {
              if (err) res.json({ token: req.headers['x-access-token'], success: 0, message: err });
              //     console.log(' ============================= update mobile result  ==============================')
              // console.log(uResult)
              // console.log('=============== update mobile result ==========================================')
              if (uResult) {
                console.log("uResult", uResult)
                let id = uResult._id;
                let newBody = {};
                newBody.updated_at = new Date();
                newBody.isMobileVerified = "true";
                // console.log(' ============================= update user result  ==============================')
                // console.log(id)
                console.log(newBody)
                // console.log('=============== update user result ==========================================')
                User.findByIdAndUpdate(id, newBody, function (err, result) {
                  console.log(result);

                });
              } else {
                console.log({
                  error: "Mobile number not found / Invalid!"
                });
              }
            });
            // End of user object "isMobileVerified" 
            status = "OTP Sent";
            res.json({ token: req.headers['x-access-token'], success: 1, message: "Mobile number verified." });
          }
        });
        ////// End of Verify OTP ///
      }
    });
  }
  // End of Mobile Verification

  ////// Resend Mobile OYP //////////
  if (req.body.type == "resendMobileOTP") {
    mySms.sendSms(req.body, function (err, result) {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      } else {
        res.json({ token: req.headers['x-access-token'], success: 1, message: "OTP sent successfully" });
      }
    });
  }
  ////// End of Resend Mobile OTP //

});
// End of Verify Email and Mobile OTP Code

//////////// GET DEVICE TOKEN BY EMAIL ID ///////////////////
router.get("/getDeviceToken/:email", function (req, res, next) {
  logins.findOne({
    email: (req.params.email).toLowerCase()
  }, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });

    if (result) {
      res.json({
        token: req.headers['x-access-token'],
        success: 1,
        data: { deviceToken: result.deviceToken },
        message: "We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations."
      });
    } else {
      res.json({
        token: req.headers['x-access-token'],
        success: 0,
        message: "email not exists/ invalid"
      });
    }
  });
});
//////////// END OF GET DEVICE TOKEN BY EMAIL ID ////////////


//////////// GET DEVICE TOKEN BY EMAIL ID admin///////////////////
router.get("/getDeviceTokenAdmin/:email", function (req, res, next) {
  email = req.params.email;

  logins.aggregate(
    [
      { $match: { email: email } },
      {
        $lookup: {
          from: "users",
          localField: "email",
          foreignField: "email",
          as: "memberProfile"
        }
      },

    ],
    function (err, data) {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      }
      if (data.length > 0) {
        //console.log(data[0].deviceToken);
        res.json({
          dToken: data[0].deviceToken,
          userdata: data[0].memberProfile
        });
        //res.send(data);
      } else {
        res.json({
          error: "User not found / Invalid ID"
        });
      }
    }
  );
});
//////////// END OF GET DEVICE TOKEN BY EMAIL ID admin////////////


///////////////// Update Mobile Number //////////////////////
router.post("/updateMobile/:mobile", function (req, res, next) {
  mobileNumber = req.body.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
  User.findOne({
    mobileNumber: mobileNumber
  }, function (err, uResult) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    if (uResult) {
      res.json({
        "error": "mobile number already in use!"
      });
    } else {
      User.findOne({
        mobileNumber: (req.params.mobile)
      }, function (err, user) {
        if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        if (user) {
          let mobileNumber = req.body.mobileNumber;
          let reqbody = {};
          reqbody.mobileNumber = mobileNumber;
          User.findByIdAndUpdate(user._id, reqbody, function (err, result) {
            logins.findOneAndUpdate({
              mobileNumber: user.mobileNumber
            }, reqbody, function (err, result) {
              res.json({
                "message": "mobile number updated successfully!"
              });
            });
          });
        } else {
          res.json({
            "error": "mobile number not found / Invalid request"
          });
        }
      });
    }
  });

});
/////////  End of Update Mobile Number //////////////////////

//////////// Clear Login Token ///////////////////
router.get("/clearLoginToken/:email", function (req, res, next) {
  logins.findOne({
    email: (req.params.email).toLowerCase()
  }, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    if (result) {
      let id = result._id;
      let newbody = {};
      newbody.deviceToken = "";
      newbody.updated_at = new Date();

      // To update last login time and location
      logins.findByIdAndUpdate(id, newbody, function (err, result) {

        res.send({ 'message': "Device Token Cleared Successfully!" })
        User.getUserByEmail((req.params.email).toLowerCase(), function (err, uresult) {
          let newBody = {};
          let id1 = uresult._id;
          newBody.liveStatus = "offline";
          newBody.isOnline = false;

          User.findByIdAndUpdate(id1, newBody, function (err, nResult) { });
        });
      });
    } else {
      res.json({
        "error": "email not exists/ invalid"
      });
    }
  });
});
//////////// END OF Clear Login Token       ////////////
module.exports = router;