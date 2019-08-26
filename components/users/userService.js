const User = require('./userModel');
const mongoose = require("mongoose");
const ObjectId = require('mongodb').ObjectId;
const Login = require('../loginInfo/loginInfoModel');
const Memberpreferences = require('../memberpreferences/memberpreferencesModel');
const NotificationMaster = require('../notificationMaster/notificationMasterModel');
const mySms = require('../../smsConfig');
const mandrill = require('mandrill-api/mandrill');
const mandrill_client = new mandrill.Mandrill('b4gGeksBlAv54P_igkBH-w');
const config = require('../../config/config');
const Credits = require('../credits/creditsModel');
const Feeddata = require('../../models/feeddata');
const MediaTracking = require('../mediaTracking/mediaTrackingModel');
const NotificationSettings = require('../notificationSettings/notificationSettingsModel');
const bcrypt = require('bcryptjs');
const CelebrityContract = require("../celebrityContract/celebrityContractsModel");
const OTPServices = require("../otp/otpRouter")
const memberPreferenceServices = require('../memberpreferences/memberPreferenceServices');
const ReferralCode = require('../referralCode/referralCodeModel');
const ReferralCodeService = require('../referralCode/referralCodeService');
const FeedMappingModel = require('../feed/feedMappingModel');
const comLog = require("../comLog/comLogModel");
const crypto = require("crypto");
const jwt = require('../../jwt/jwt');
const ActivityLog = require("../activityLog/activityLogService");
const MemberMedia = require('../memberMedia1/memberMediaModel');
const MemberPreferences = require("../memberpreferences/memberpreferencesModel");
const slotMaster = require("../slotMaster/slotMasterModel");
const Feed = require("../../models/feeddata");
const celebrityContract = require("../celebrityContract/celebrityContractsModel");

const findAllMemberFanFollowers = (memberId, callback) => {
  Memberpreferences.find({ celebrities: { $elemMatch: { CelebrityId: memberId } } }).exec((err, memberIdFanFollwerObj) => {
    if (!err)
      callback(null, memberIdFanFollwerObj);
    else
      callback(err, null)
  })
}

const checkOnLineUserIsCelebrityOrNot = (memberId, callback) => {
  User.findById(memberId, { email: 1, isCeleb: 1, }, (err, userDetials) => {
    if (!err)
      callback(null, userDetials);
    else
      callback(err, null)
  })
}

const findCelebByCountry = (userDetails, existedCelebsFromFanFolowAndPreferences, noPreferences, callback) => {
  // if(userDetails.isCeleb == true)
  //     existedCelebs.push(userDetails._id);
  //, "_id": { $nin: [userDetails._id] }
  //country: userDetails.country,
  User.find({ isCeleb: true, "_id": { $nin: existedCelebsFromFanFolowAndPreferences } }, { _id: 1, isCeleb: 1 }, (err, listOfCelebObj) => {
    if (err) {
      callback(err, null)
    } else {
      let geoCeleb = listOfCelebObj.map((celebId) => {
        return celebId._id;
      });
      // if (userDetails.isCeleb == true && noPreferences)
      //     geoCeleb.push(userDetails._id)
      callback(null, geoCeleb)
    }
  })
}

const findCelebNonCountry = (userDetails, noGEOLocationLocal, callback) => {
  // let isCurrentUserCeleb = [];
  // if (userDetails.isCeleb == true);
  //isCurrentUserCeleb = [userDetails._id]
  User.find({ country: { $ne: userDetails.country }, isCeleb: true }, { _id: 1, isCeleb: 1 }, (err, listOfCelebObj) => {
    if (err) {
      callback(err, null)
    } else {
      let nonGeoCeleb = listOfCelebObj.map((celebId) => {
        return celebId._id;
      });
      // if (noGEOLocationLocal && userDetails.isCeleb == true)
      //     nonGeoCeleb.push(userDetails._id);
      callback(null, nonGeoCeleb)
    }
  })
}

const resetPasswordById = (userObj, password, callback) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      hashPassword = hash;
      User.findByIdAndUpdate(userObj._id, { password: hashPassword }, (err, updatedPasswordObj) => {
        if (err)
          callback(err, null)
        else {
          //console.log(userObj)
          let query;
          if (userObj.isMobileVerified == true && userObj.isEmailVerified == false) {
            query = { $and: [{ mobileNumber: userObj.mobileNumber }] }
          } else if (userObj.isEmailVerified == true && userObj.isMobileVerified == false) {
            query = { $and: [{ email: userObj.email }] }
          } else if (userObj.isEmailVerified == true && userObj.isMobileVerified == true) {
            query = { $and: [{ mobileNumber: userObj.mobileNumber }] }
          } else {
            query = { $and: [{ username: userObj.username }] }
          }
          Login.findOne(query, (err, loginInfoObj) => {
            if (err)
              callback(err, null)
            else {
              //console.log("TTTTTTTTTTT   ======= ", loginInfoObj)
              Login.findByIdAndUpdate(loginInfoObj._id, { password: hashPassword, pwdChangeDate: new Date() }, (err, updateLoginInfoObj) => {
                if (err)
                  callback(err, null)
                else
                  callback(null, updatedPasswordObj);
              })
            }
          });
        }
      });
    });
  });
}

const memberRegistrationAndProfileUpdate = (memberId, body, files, callback) => {
  // console.log("memberRegistrationAndProfileUpdate === ", body)
  let profilepic = files;
  let medium = body.medium;
  let OTP = body.OTP;
  let lastName = body.lastName;
  let firstName = body.firstName;
  let password = body.password ? body.password : "DefaultPassword@IndozTechSol";
  let email = body.email ? (body.email).toLowerCase() : undefined;
  let username = body.username ? (body.username).toLowerCase() : undefined;
  let mobileNumber = body.mobileNumber ? body.mobileNumber.replace(/[^a-zA-Z0-9]/g, '') : undefined;
  let role = body.role;
  let referralCode = body.referralCode;
  let country = body.country ? body.country : undefined;
  let loginType = body.loginType;
  let osType = body.osType;
  let mobile = undefined
  if (country && mobileNumber)
    mobile = country.concat(mobileNumber).substr(1);
  let reason = "";
  // console.log(loginType)
  if (body.mode != "memberRegister" && loginType == "socialLogin") {
    User.findOne({ email: email }, (err, existingUser) => {
      if (err) {
        return callback("Please try again", null, "Please try again")
      }
      else if (existingUser) {
        let newbody = {};
        let id = existingUser._id;
        var token = jwt.createToken(id)
        newbody.username = existingUser.username;
        newbody.lastLoginDate = new Date();
        newbody.deviceToken = body.deviceToken;
        newbody.callingDeviceToken = body.callingDeviceToken;
        newbody.osType = body.osType;
        newbody.token = token;
        userInfor = {
          userInfo: existingUser
        }
        Memberpreferences.findOne({ memberId: existingUser._id }, (err, memberPreferancesObj) => {
          if (err) {
            return callback("Please try again", null, "Please try again")
          } else if (memberPreferancesObj) {
            if (memberPreferancesObj.preferences.length < 3) {
              userInfor.isPreferencesSelected = false;
            }
            else {
              userInfor.isPreferencesSelected = true;
            }
            Login.findOneAndUpdate({ email: email }, { $set: newbody }, { new: true }, (err, newLoginInfo) => {
              if (err) {
                callback(err, null, "Please Login again")
              }
              else {
                userInfor.loginInfo = newLoginInfo;
                ReferralCodeService.getReferalCode(existingUser._id, (err, selfReferralCode) => {
                  if (err) {
                    res.json({ success: 0, message: err });
                  } else {
                    userInfor.selfReferralCode = selfReferralCode;
                    NotificationSettings.find({ memberId: existingUser._id }, { isEnabled: 1, notificationSettingId: 1, _id: 1 }, (err, notificationSettings) => {
                      if (err) {
                        callback(err, null, "Please Login again")
                      }
                      else {
                        userInfor.notificationSettings = notificationSettings;
                        if (body.referralCode != undefined) {
                          Credits.findOne({ memberId: existingUser._id }, (err, cBal) => {
                            if (err) {
                              callback(err, null, "Please Login again")
                            }
                            if (cBal) {
                              userInfor.creditInfo = cBal;
                              callback(null, {
                                "token": token,
                                "userInfo": userInfor.userInfo,
                                "creditInfo": userInfor.creditInfo,
                                "notificationSettings": userInfor.notificationSettings,
                                "loginInfo": userInfor.loginInfo,
                                "isPreferencesSelected": userInfor.isPreferencesSelected
                              }, "login sucessfully")
                            } else {
                              let rCode = body.referralCode;
                              ReferralCode.findOne({ memberCode: rCode }, (err, refResult) => {
                                if (err) {
                                  callback(err, null, "Please login again")
                                }
                                else if (refResult && rCode != undefined) {
                                  //console.log("refResult.creditValue",refResult.creditValue);
                                  let newCredits = new Credits({
                                    memberId: existingUser._id,
                                    creditType: "promotion",
                                    creditValue: parseInt(0),
                                    cumulativeCreditValue: parseInt(0),
                                    referralCreditValue: refResult.referralCreditValue,
                                    createdBy: existingUser.fName
                                  });

                                  Credits.createCredits(newCredits, function (err, credits) {
                                    if (err) {
                                      callback(err, null, "Please login again")
                                    } else {
                                      userInfor.creditInfo = credits;
                                      callback(null, {
                                        "token": token,
                                        "userInfo": userInfor.userInfo,
                                        "creditInfo": userInfor.creditInfo,
                                        "notificationSettings": userInfor.notificationSettings,
                                        "loginInfo": userInfor.loginInfo,
                                        "isPreferencesSelected": userInfor.isPreferencesSelected
                                      }, "login sucessfully")
                                      ReferralCodeService.payToReferrer(refResult.memberId, refResult.referreCreditValue, () => { })
                                    }
                                  });
                                } else {
                                  callback("Invalid Referral code", null, "Invalid Referral code")
                                }
                              });
                            }
                          }).sort({ createdAt: -1 }).limit(1);
                        }
                        else {
                          Credits.findOne({ memberId: existingUser._id }, (err, cBal) => {
                            if (err) {
                              callback(err, null, "Please Login again")
                            }
                            else if (cBal) {
                              userInfor.creditInfo = cBal;
                              callback(null, {
                                "token": token,
                                "userInfo": userInfor.userInfo,
                                "creditInfo": userInfor.creditInfo,
                                "notificationSettings": userInfor.notificationSettings,
                                "loginInfo": userInfor.loginInfo,
                                "isPreferencesSelected": userInfor.isPreferencesSelected
                              }, "login sucessfully")
                            } else {
                              let newCredits = new Credits({
                                memberId: existingUser._id,
                                creditType: "promotion",
                                creditValue: parseInt(0),
                                cumulativeCreditValue: parseInt(0),
                                referralCreditValue: parseInt(0),
                                createdBy: existingUser.firstName
                              });

                              Credits.createCredits(newCredits, function (err, credits) {
                                if (err) {
                                  callback(err, null, "Please login again")
                                } else {
                                  userInfor.creditInfo = newCredits;
                                  callback(null, {
                                    "token": token,
                                    "userInfo": userInfor.userInfo,
                                    "creditInfo": userInfor.creditInfo,
                                    "notificationSettings": userInfor.notificationSettings,
                                    "loginInfo": userInfor.loginInfo,
                                    "isPreferencesSelected": userInfor.isPreferencesSelected
                                  }, "login sucessfully")
                                }
                              });
                            }
                          }).sort({ createdAt: -1 }).limit(1);
                        }
                      }
                    }).populate('notificationSettingId', 'notificationType notificationName');
                  }
                });
              }
            });
          }
          else {
            memberPreferenceServices.saveMemberPreference({ memberId: existingUser._id }, (err, data) => {
              if (err) {
                callback("Please login again", null, "Please login again")
              }
              else {
                let todayDate = new Date();
                let feedMappingInfo = new FeedMappingModel({
                  memberId: existingUser._id,
                  currentSeenFeedDate: todayDate,
                  lastSeenFeedDate: todayDate
                })
                FeedMappingModel.saveFeedMappingData(feedMappingInfo, function (err, feedMappObj) {
                  if (err)
                    console.log(err)
                  else {
                    Login.findOne({ email: email }, (err, loginInfo) => {
                      if (err) {
                        callback(err, null, "Please Login again")
                      }
                      else {
                        userInfor.loginInfo = loginInfo;
                        NotificationSettings.find({ memberId: existingUser._id }, { isEnabled: 1, notificationSettingId: 1, _id: 1 }, (err, notificationSettings) => {
                          if (err) {
                            callback(err, null, "Please Login again")
                          }
                          else {
                            userInfor.notificationSettings = notificationSettings;
                            if (body.referralCode != undefined) {
                              Credits.findOne({ memberId: existingUser._id }, (err, cBal) => {
                                if (err) {
                                  callback(err, null, "Please Login again")
                                }
                                if (cBal) {
                                  userInfor.creditInfo = cBal;
                                  callback(null, {
                                    "token": token,
                                    "userInfo": userInfor.userInfo,
                                    "creditInfo": userInfor.creditInfo,
                                    "notificationSettings": userInfor.notificationSettings,
                                    "loginInfo": userInfor.loginInfo,
                                    "isPreferencesSelected": userInfor.isPreferencesSelected
                                  }, "login sucessfully")
                                } else {
                                  let rCode = reqbody.referralCode;
                                  ReferralCode.findOne({ memberCode: rCode }, (err, refResult) => {
                                    if (err) {
                                      callback(err, null, "Please login again")
                                    }
                                    else if (refResult && rCode != undefined) {
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
                                          callback(err, null, "Please login again")
                                        } else {
                                          userInfor.creditInfo = credits;
                                          callback(null, {
                                            "token": token,
                                            "userInfo": userInfor.userInfo,
                                            "creditInfo": userInfor.creditInfo,
                                            "notificationSettings": userInfor.notificationSettings,
                                            "loginInfo": userInfor.loginInfo,
                                            "isPreferencesSelected": userInfor.isPreferencesSelected
                                          }, "login sucessfully")
                                          ReferralCodeService.payToReferrer(refResult.memberId, refResult.referreCreditValue, () => { })
                                        }
                                      });
                                    } else {
                                      callback("Invalid Referral code", null, "Invalid Referral code")
                                    }
                                  });
                                }
                              }).sort({ createdAt: -1 }).limit(1);
                            }
                            else {
                              let newCredits = new Credits({
                                memberId: existingUser._id,
                                creditType: "promotion",
                                creditValue: parseInt(0),
                                cumulativeCreditValue: parseInt(0),
                                referralCreditValue: parseInt(0),
                                createdBy: existingUser.firstName
                              });

                              Credits.createCredits(newCredits, function (err, credits) {
                                if (err) {
                                  callback(err, null, "Please login again")
                                } else {
                                  userInfor.creditInfo = newCredits;
                                  callback(null, {
                                    "token": token,
                                    "userInfo": userInfor.userInfo,
                                    "creditInfo": userInfor.creditInfo,
                                    "notificationSettings": userInfor.notificationSettings,
                                    "loginInfo": userInfor.loginInfo,
                                    "isPreferencesSelected": userInfor.isPreferencesSelected
                                  }, "login sucessfully")
                                }
                              });
                            }
                          }
                        }).populate('notificationSettingId', 'notificationType notificationName');
                      }
                    });
                  }
                })
              }
            });
          }
        });
      }
      else {
        return callback(null, { exist: false }, "User not exist")
      }
    })
  } else {
    if (memberId == "null") {
      let orCond = []
      if (email != undefined) {
        orCond.push({ email: email, isEmailVerified: true })
      }
      if (username != undefined) {
        orCond.push({ username: username })
      }
      if (mobile != undefined) {
        orCond.push({ mobileNumber: mobile, isMobileVerified: true })
      }
      let query = { $or: orCond }
      User.findOne(query, { _id: 1, email: 1, username: 1, mobileNumber: 1 }, (err, existingUser) => {
        if (err) {
          callback(err, null, null)
        }
        else if (existingUser) {
          // console.log(existingUser)
          let mobile = ""
          if (country && mobileNumber)
            mobile = country.concat(mobileNumber).substr(1);
          if (existingUser.email != "" && existingUser.email != undefined && existingUser.email == email) {
            callback("Email id already in use.", null, "Email id already in use.")
            // return res.json({ success: 0, message: "Email id already in use." });
          } else if (existingUser.username != "" && existingUser.username == body.username) {
            callback("This username is not available", { available: false }, "This username is not available.")
            // return res.json({ success: 0, message: "Username already in use." });
          }
          else if (existingUser.mobileNumber == mobile) {
            callback("Mobile number already in use.", { available: false }, "Mobile number already in use.")
            // return res.json({ success: 0, message: "Mobile number already in use." });
          } else {
            callback("User Already Exist", { available: false }, "User Already Exist")
          }
        } else {
          if (body.mode == "getOTP") {
            let mobile = ""
            if (mobileNumber && country)
              mobile = country.concat(mobileNumber).substr(1);
            OTPServices.getOTP(medium, mobile, email, reason, (err, data) => {
              if (err) {
                callback(err, null, null)
              } else {
                callback(null, null, data)
              }
            })
          }
          else if (body.mode == "verifyOTP") {
            let mobile = ""
            if (mobileNumber && country)
              mobile = country.concat(mobileNumber).substr(1);
            OTPServices.verifyOTP(medium, mobile, email, OTP, (err, data) => {
              if (err) {
                callback(err, null, null)
              } else {
                // rug.setAdjectives(['celebKonect']);
                // let new_username = rug.generate();
                // console.log(new_username)
                callback(null, null, data)
              }
            })
          }
          else if (body.mode == "userNameStatus") {
            callback(null, { available: true }, "Username available")
          }
          else if (body.mode == "memberRegister") {
            generateUserName(firstName, lastName, (err, username) => {
              // console.log("Generated Username ", username);
              // console.log("Generated Username with lenght", username.length)
              let mobile = ""
              if (country && mobileNumber)
                mobile = country.concat(mobileNumber).substr(1);
              let userObj = {
                lastName: lastName,
                firstName: firstName,
                username: username,
                password: password,
                role: role,
                loginType: loginType,
                country: country,
                referralCode: referralCode,
                osType: osType
              }
              if (body.medium == "mobile") {
                Object.assign(userObj, { mobileNumber: mobile })
                Object.assign(userObj, { mobile: mobileNumber })
                userObj.isMobileVerified = true;
              }
              else if (body.medium == "email") {
                Object.assign(userObj, { email: email })
                userObj.isEmailVerified = true
              }
              let newUser = new User(userObj);
              User.createUser(newUser, (err, userDetails) => {
                if (err) {
                  callback("Please try again", null, null)
                } else {
                  let token = jwt.createToken(userDetails._id)
                  let mobile = ""
                  if (country && mobileNumber)
                    mobile = country.concat(mobileNumber).substr(1);
                  let newLoginInfo = {
                    email: userDetails.email,
                    username: userDetails.username,
                    password: userDetails.password,
                    mobileNumber: userDetails.mobileNumber,
                    mobile: userDetails.mobile,
                    osType: userDetails.osType,
                    memberId: userDetails._id,
                    token: token
                  };
                  Login.create(newLoginInfo, (err, userLoginObj) => {
                    if (err) {
                      callback("Please try again" + err, null, null)
                    } else {
                      ReferralCodeService.generateReferalCode(userDetails._id, (err, referralCodeObj) => {
                        if (err) {
                          callback(null, { userId: userDetails._id, username: userDetails.username }, "Your registration has been submitted successfully.", { userInfo: userDetails, loginInfo: userLoginObj }, null)
                        } else {
                          callback(null, { userId: userDetails._id, username: userDetails.username }, "Your registration has been submitted successfully.", { userInfo: userDetails, loginInfo: userLoginObj, selfReferalDetails: referralCodeObj }, null)
                        }
                      })
                      // console.log(userDetails._id)
                      createDefaultSettingsForNewUser(userDetails._id);
                      memberPreferenceServices.saveMemberPreference({ memberId: userDetails._id }, (err, data) => {
                        // console.log(data)
                        if (err)
                          console.log(err)
                        else {
                          let todayDate = new Date();
                          let feedMappingInfo = new FeedMappingModel({
                            memberId: userDetails._id,
                            currentSeenFeedDate: todayDate,
                            lastSeenFeedDate: todayDate
                          })
                          FeedMappingModel.saveFeedMappingData(feedMappingInfo, function (err, feedMappObj) {
                            if (err)
                              console.log(err)
                          })
                        }
                      });
                      if (userDetails.email && userDetails.email != null) {
                        let newComLog = new comLog({
                          mode_ids: ["email"],
                          event: "register",
                          from_addr: "admin@celebkonect.com",
                          to_addr: userDetails.email,
                          content: body.content,
                          gateway_response: body.gateway_response
                        });
                        comLog.createComLog(newComLog, function (err, user) {
                          if (err) {
                            callback("err in comlog" + err, null, null)
                          } else {
                            crypto.randomBytes(20, function (err, buf) {

                              //// NEW TOKEN GENERATOR
                              var token = Math.floor(100000 + Math.random() * 900000);
                              /// END OF NEW TOKEN GENERATOR
                              let url = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyEmail/" + userDetails.email + "/" + token;
                              let mobileurl = config.baseUrl + ".celebkonect.com:4300/logininfo/verifyMobile/" + userDetails.email;
                              // Get LoginInfo By Email and Update Email Verification Code
                              let id = userDetails._id;
                              let newbody = {};
                              newbody.updated_at = new Date();
                              newbody.emailVerificationCode = token;
                              newbody.mobileVerificationCode = token;
                              let reqBody = {};
                              reqBody.mobileNumber = ''
                              if (userDetails.mobileNumber != undefined)
                                reqBody.mobileNumber = userDetails.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
                              reqBody.regToken = token;

                              mySms.sendSms(reqBody, function (err, result) {
                                if (err) {
                                  console.log(err);
                                } else {
                                  //console.log('OTP Sent');
                                }
                              });

                              User.findByIdAndUpdate(id, newbody, function (err, result) { });

                              // End of Get LoginInfo By Email and Update Email Verification Code

                              var template_name = "reg";
                              var template_content = [
                                {
                                  name: "verifyurl",
                                  content: url
                                },
                                {
                                  name: "verifymobile",
                                  content: mobileurl
                                },
                                {
                                  name: "mobileToken",
                                  content: token
                                }
                              ];
                              var message = {
                                subject: "Registration Successful",
                                from_email: "admin@celebkonect.com",
                                from_name: "CelebKonect",
                                to: [
                                  {
                                    email: userDetails.email,
                                    name: userDetails.email,
                                    type: "to"
                                  }
                                ],
                                headers: {
                                  "Reply-To": "keystroke99@gmail.com"
                                },
                                important: false,
                                track_opens: null,
                                track_clicks: null,
                                auto_text: null,
                                auto_html: null,
                                inline_css: null,
                                url_strip_qs: null,
                                preserve_recipients: null,
                                view_content_link: null,
                                tracking_domain: null,
                                signing_domain: null,
                                return_path_domain: null,
                                merge: true,
                                merge_language: "mailchimp",
                                global_merge_vars: [
                                  {
                                    name: "verifyurl",
                                    content: url
                                  },
                                  {
                                    name: "verifymobile",
                                    content: mobileurl
                                  },
                                  {
                                    name: "mobileToken",
                                    content: token
                                  }
                                ],
                                merge_vars: [
                                  {
                                    "rcpt": userDetails.email,
                                    "vars": [
                                      {
                                        name: "verifyurl",
                                        content: url
                                      },
                                      {
                                        name: "verifymobile",
                                        content: mobileurl
                                      },
                                      {
                                        name: "mobileToken",
                                        content: token
                                      }
                                    ]
                                  }
                                ],

                              };
                              var async = false;
                              var ip_pool = "Main Pool";
                              // var send_at = new Date();
                              mandrill_client.messages.sendTemplate(
                                {
                                  template_name: template_name,
                                  template_content: template_content,
                                  message: message,
                                  async: async,
                                  ip_pool: ip_pool
                                },
                                function (result) {
                                  console.log({ message: "comLog saved sucessfully" });
                                },
                                function (e) {
                                  console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                }
                              );
                            });
                          }
                        });
                      }
                    }
                  });
                }
              });
            });
          }
        }
      });
    } else {
      let reqbody = JSON.parse(body.profile);
      let id = memberId;
      let profilepic = files;
      let profile = reqbody;
      let updateDoc = profile;
      if (profilepic && profilepic.length) {
        reqbody.avtar_imgPath = files[0].path;
        let mimetype = files[0].mimetype;
        let size = files[0].size;
        reqbody.avtar_originalname = files[0].originalname;
        updateDoc = { $set: reqbody, $push: { pastProfileImages: { avtar_imgPath: reqbody.avtar_imgPath, mimetype: mimetype, size: size } } }
      }
      if (updateDoc.email != undefined || updateDoc.mobileNumber != undefined) {
        var orCond = [];
        if (updateDoc.email != undefined) {
          orCond.push({ email: updateDoc.email })
        }
        if (updateDoc.country != undefined && updateDoc.mobileNumber != undefined) {
          const mobileNumber = updateDoc.mobileNumber;
          const country = updateDoc.country;
          const mobile = country.concat(mobileNumber).substr(1);
          orCond.push({ mobileNumber: mobile })
        } else if (updateDoc.mobileNumber != undefined) {
          orCond.push({ mobileNumber: updateDoc.mobileNumber })
        }
        let query = { $or: orCond }
        // console.log(query)
        User.findOne(query, { _id: 1, email: 1, username: 1, mobileNumber: 1 }, (err, existingUser) => {
          if (err) {
            callback(err, null, null)
          }
          else if (existingUser) {
            if (existingUser.email != "" && existingUser.email != undefined && existingUser.email == updateDoc.email) {
              return callback("Email id already in use.", null, "Email id already in use.")
            }
            else if (existingUser.mobileNumber == mobile) {
              return callback("Mobile number already in use.", { available: false }, "Mobile number already in use.")
            }
            else {
              findByIdAndUpdateUserDetails(id, updateDoc, reqbody, callback);
            }
          }
          else {
            findByIdAndUpdateUserDetails(id, updateDoc, reqbody, callback);
          }
        });
      }
      else {
        findByIdAndUpdateUserDetails(id, updateDoc, reqbody, callback);
      }
    }
  }
}

const findByIdAndUpdateUserDetails = (id, updateDoc, reqbody, callback) => {
  if (reqbody.mobileNumber && reqbody.country) {
    const mobile = reqbody.country.concat(reqbody.mobileNumber);
    const mobile1 = reqbody.country.concat(reqbody.mobileNumber).substr(1);
    const mobileWithoutC = mobile.replace(reqbody.country, "")
    Object.assign(reqbody, { mobileNumber: mobile1 })
    Object.assign(updateDoc, { mobileNumber: mobile1 })
    Object.assign(reqbody, { mobile: mobileWithoutC })
    Object.assign(updateDoc, { mobile: mobileWithoutC })
  }
  // console.log("updateDoc", updateDoc)
  User.findByIdAndUpdate(id, updateDoc, { new: true }, (err, uresult) => {
    if (err) {
      callback(err, null, null)
    }
    else if (!uresult || uresult == null) {
      callback("Profile not found." + id, null, "Profile not found." + id)
    }
    else {
      if (reqbody.mode == "goLogin") {
        let newbody = {};
        let userInfor = {};
        userInfor.userInfo = uresult;
        let id = uresult._id;
        var token = jwt.createToken(id)
        newbody.username = reqbody.username;
        newbody.lastLoginLocation = reqbody.lastLoginLocation;
        newbody.lastLoginDate = new Date();
        newbody.deviceToken = reqbody.deviceToken;
        newbody.callingDeviceToken = reqbody.callingDeviceToken;
        newbody.timezone = reqbody.timezone;
        newbody.osType = reqbody.osType;
        // To update last login time and location
        let orCond = []
        if (uresult.email != undefined) {
          orCond.push({ email: uresult.email })
        }
        if (uresult.username != undefined) {
          orCond.push({ username: uresult.username })
        }
        if (uresult.mobileNumber != undefined) {
          orCond.push({ mobileNumber: uresult.mobileNumber })
        }
        let query = { $or: orCond }
        Login.findOneAndUpdate(query, newbody, { new: true }, (err, newLoginInfo) => {
          if (err) {
            callback(err, null, "Please Login again")
          }
          else {
            userInfor.loginInfo = newLoginInfo;
            ReferralCodeService.getReferalCode(uresult._id, (err, selfReferralCode) => {
              if (err) {
                callback(err, null, "Please Login again")
              } else {
                userInfor.selfReferralCode = selfReferralCode;
                NotificationSettings.find({ memberId: uresult._id }, { isEnabled: 1, notificationSettingId: 1, _id: 1 }, (err, notificationSettings) => {
                  if (err) {
                    callback(err, null, "Please Login again")
                  }
                  else {
                    userInfor.notificationSettings = notificationSettings;
                    if (reqbody.referralCode != undefined) {
                      Credits.findOne({ memberId: uresult._id }, (err, cBal) => {
                        if (err) {
                          callback(err, null, "Please Login again")
                        }
                        // && (reqbody.referralCode == undefined || reqbody.referralCode == "")
                        if (cBal) {
                          userInfor.creditInfo = cBal;
                          callback(null, {
                            "token": token,
                            "userInfo": userInfor.userInfo,
                            "creditInfo": userInfor.creditInfo,
                            "notificationSettings": userInfor.notificationSettings,
                            "loginInfo": userInfor.loginInfo,
                            "isPreferencesSelected": false
                          }, "login sucessfully")
                        }
                        else {
                          let rCode = reqbody.referralCode;
                          ReferralCode.findOne({ memberCode: rCode }, (err, refResult) => {
                            if (err) {
                              callback(err, null, "Please login again")
                            }
                            else if (refResult && rCode != undefined) {
                              //console.log("refResult.creditValue",refResult.creditValue);
                              let referralCreditValue = refResult.referralCreditValue
                              if (refResult.isCeleb) {
                                referralCreditValue = parseInt(250)
                              }
                              let newCredits = new Credits({
                                memberId: uresult._id,
                                creditType: "promotion",
                                creditValue: parseInt(0),
                                cumulativeCreditValue: parseInt(0),
                                referralCreditValue: referralCreditValue,
                                createdBy: uresult.fName
                              });

                              Credits.createCredits(newCredits, function (err, credits) {
                                if (err) {
                                  callback(err, null, "Please login again")
                                } else {
                                  userInfor.creditInfo = credits;
                                  callback(null, {
                                    "token": token,
                                    "userInfo": userInfor.userInfo,
                                    "creditInfo": userInfor.creditInfo,
                                    "notificationSettings": userInfor.notificationSettings,
                                    "loginInfo": userInfor.loginInfo,
                                    "isPreferencesSelected": false
                                  }, "login sucessfully")
                                  ReferralCodeService.payToReferrer(refResult.memberId._id, refResult.referreCreditValue, () => { })
                                }
                              });
                            } else {
                              callback("Invalid Referral code", null, "Invalid Referral code")
                            }
                          }).populate('memberId', '_id isCeleb');
                        }
                      }).sort({ createdAt: -1 }).limit(1).populate('memberId', '_id isCeleb');
                    }
                    else {
                      Credits.findOne({ memberId: uresult._id }, (err, cBal) => {
                        if (err) {
                          callback(err, null, "Please Login again")
                        }
                        else if (cBal) {
                          userInfor.creditInfo = cBal;
                          callback(null, {
                            "token": token,
                            "userInfo": userInfor.userInfo,
                            "creditInfo": userInfor.creditInfo,
                            "notificationSettings": userInfor.notificationSettings,
                            "loginInfo": userInfor.loginInfo,
                            "isPreferencesSelected": false
                          }, "login sucessfully")
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
                              callback(err, null, "Please login again")
                            } else {
                              userInfor.creditInfo = credits;
                              callback(null, {
                                "token": token,
                                "userInfo": userInfor.userInfo,
                                "creditInfo": userInfor.creditInfo,
                                "notificationSettings": userInfor.notificationSettings,
                                "loginInfo": userInfor.loginInfo,
                                "isPreferencesSelected": false
                              }, "login sucessfully")
                            }
                          });
                        }
                      }).sort({ createdAt: -1 }).limit(1);
                    }
                  }
                }).populate('notificationSettingId', 'notificationType notificationName');
              }
            })
          }
        });
      }
      else {
        if ((reqbody.email && reqbody.isEmailVerified) || (reqbody.mobileNumber && reqbody.isMobileVerified)) {
          let query = {
            $or: [
              { email: uresult.email },
              { mobileNumber: { $regex: uresult.mobileNumber } }
            ]
          }
          Login.findOneAndUpdate(query, { $set: reqbody }, (err, loginUpdate) => {
            if (err) {

            } else if (loginUpdate) {
              let body = {
                memberId: id
              }
              ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Profile", body, (err, newActivityLog) => {
                if (err) {
                  // res.json({success: 0,message: "Please try again." + err});
                } else {

                }
              })
              callback(null, uresult, "Profile updated successfully")
            }
          })
        } else {
          // let body = {
          //   memberId: id
          // }
          // ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Profile", body, (err, newActivityLog) => {
          //   if (err) {
          //     // res.json({success: 0,message: "Please try again." + err});
          //   } else {

          //   }
          // })
          callback(null, uresult, "Profile updated successfully")
        }
      }
    }
  });
}


const createDefaultSettingsForNewUser = (memberId) => {
  NotificationMaster.find({}, (err, allSettings) => {
    let allSettingsForNewCreatedUser = allSettings.map((settingObj) => {
      let dummyObj = {};
      dummyObj.memberId = memberId;
      dummyObj.notificationSettingId = settingObj._id;
      dummyObj.createdBy = "Admin";
      dummyObj.updatedBy = "Admin";
      dummyObj.isEnabled = true;
      return dummyObj;
    })
    NotificationSettings.insertMany(allSettingsForNewCreatedUser, (err, data) => {

    })
  }).lean()
}

const generateUserName = (firstName, lastName, callback) => {
  let username = firstName.toLowerCase();
  username = username.replace(/\s/g, '');
  if (username.length < 6)
    username = username + (lastName.substring(0, 7 - username.length)).toLowerCase()
  if (username.length < 6)
    username = username + Math.floor(Math.random() * (999 - 100 + 1) + 100)
  if (username.length < 6)
    username = username + Math.floor(Math.random() * (999 - 100 + 1) + 100)
  if (username.length > 16)
    username = username.substring(0, 16);
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      lastName = lastName.substring(0, 3);
      let random = Math.floor(Math.random() * (999 - 100 + 1) + 100);
      return callback(null, (firstName + lastName + random).toLowerCase());
    } else if (user) {
      let username = (firstName.substring(0, 20) + lastName.substring(0, 3)).toLowerCase();
      User.findOne({ username: username }, (err, user) => {
        if (err) {
          lastName = lastName.substring(0, 3);
          let random = Math.floor(Math.random() * (999 - 100 + 1) + 100);
          return callback(null, (firstName.substring(0, 10) + lastName.substring(0, 3) + random).toLowerCase());
        }
        else if (user) {
          lastName = lastName.substring(0, 3);
          let random = Math.floor(Math.random() * (999 - 100 + 1) + 100);
          return callback(null, (firstName.substring(0, 10) + lastName.substring(0, 3) + random).toLowerCase());
        }
        else {
          return callback(null, username);
        }
      })
    }
    else {
      return callback(null, username);
    }
  })
}

let getUserByEmailMobileNumberUsername = (email, callback) => {

  let query = {
    $or: [
      { $and: [{ email: email.toLowerCase() }, { isEmailVerified: true }] },
      //{ $and: [{ mobileNumber: { $regex: email } }, { isMobileVerified: true }] },
      { $and: [{ mobile: email }, { isMobileVerified: true }] },
      { $and: [{ username: email }] }
    ]
  }
  User.findOne(query, (err, userObj) => {
    console.log(err)
    if (err)
      callback(err, null)
    else {
      let userInfo = null;
      if (userObj) {
        userInfo = {}
        userInfo = userObj
        if (userObj.isEmailVerified == true) {
          userInfo.email = userObj.email
        } else {
          delete userInfo['email'];
        }
        if (userObj.isMobileVerified == true) {
          userInfo.mobileNumber = userObj.mobileNumber
        } else {
          delete userInfo['mobileNumber'];
        }
      }
      callback(null, userInfo)

    }
  }).lean();


}

const getSugessionByPreferances = (memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, callback) => {
  let celebContractArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
  // console.log("listOfMyPreferences", listOfMyPreferences);
  // console.log("contractsCelebArray", celebContractArray);
  // console.log("contractsCelebArray", typeof celebContractArray[0]);
  // console.log("youblockedByCelebrity", youblockedByCelebrity);

  Memberpreferences.findOne({ memberId: memberId }, (err, memberPreferancesObj) => {
    if (err) {
      callback(err, null)
    } else if (memberPreferancesObj) {
      if (memberPreferancesObj.preferences.length) {
        let fanFollowersArray = memberPreferancesObj.celebrities;
        let followingCelebs = fanFollowersArray.map((celebId) => {
          return (celebId.CelebrityId);
        })
        User.aggregate([
          {
            $match: {
              _id: { $in: celebContractArray },
              _id: { $nin: followingCelebs }, IsDeleted: false, isCeleb: true,
              preferenceId: { $in: memberPreferancesObj.preferences },
            }
          },
          {
            $project: {
              _id: 1, username: 1, isCeleb: 1, firstName: 1, lastName: 1, aboutMe: 1,
              profession: 1, avtar_imgPath: 1, imageRatio: 1,
              email: 1, cover_imgPath: 1,
            }
          },
          {
            $limit: 30
          }
        ], function (err, data) {
          if (err)
            callback(err, null)
          else {
            data.map((celebDetails) => {
              if (listOfMyPreferences && listOfMyPreferences.celebrities) {
                celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
                  return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
                });
                celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
                  return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
                });
              }
              else {
                celebDetails.isFan = false;
                celebDetails.isFollower = false;
              }
              if (youblockedByCelebrity && youblockedByCelebrity.length) {
                celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
                  return (celebDetails._id + "" == s.celebrityId + "")
                });
              }
              else {
                celebDetails.isBlocked = false;
              }
            })
            callback(null, data)
          }
        })


        // User.find({ _id: { $nin: [ObjectId(memberId)] }, preferenceId: { $in: memberPreferancesObj.preferences }, isCeleb: true, IsDeleted: false }, { _id: 1 }, (err, allCelebrity) => {
        //   if (err) {
        //     callback(err, null)
        //   } else if (allCelebrity) {
        //     allCelebrity = allCelebrity.map((celebObj) => {
        //       return celebObj._id;
        //     })

        //     let today = new Date();
        //     let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        //     Feeddata.aggregate([
        //       {
        //         $match: {
        //           memberId: { $in: allCelebrity },
        //           created_at: { $gte: lastWeek }
        //         }
        //       },
        //       {
        //         $lookup: {
        //           from: "users",
        //           localField: "memberId",
        //           foreignField: "_id",
        //           as: "celebProfile"
        //         }
        //       },
        //       {
        //         $group: {
        //           _id: "$celebProfile",
        //           feed: { $push: "$_id" },
        //           size: { $sum: 1 }
        //         }
        //       },
        //       {
        //         $sort: { size: -1 }
        //       },
        //       {
        //         $unwind: "$_id"
        //       },
        //       {
        //         $limit: 30
        //       },
        //       {
        //         $project: {
        //           _id: {
        //             _id: 1,
        //             email: 1,
        //             username: 1,
        //             //pastProfileImages: 1,
        //             avtar_originalname: 1,
        //             avtar_imgPath: 1,
        //             aboutMe: 1,
        //             isCeleb: 1,
        //             firstName: 1,
        //             lastName: 1,
        //             profession: 1,
        //             cover_imgPath: 1
        //           }
        //         }
        //       }
        //     ], (err, celebProfileArray1) => {
        //       if (err) {
        //         callback(err, null)
        //       } else {
        //         // console.log("AAAAAA === ", celebProfileArray1.length)
        //         celebProfileArray1 = celebProfileArray1.map((celeb) => {
        //           return celeb._id
        //         })
        //         let length = 30 - celebProfileArray1.length;
        //         if (length <= 0) {
        //           celebProfileArray = celebProfileArray1;
        //           celebProfileArray.map((celebDetails) => {
        //             if (listOfMyPreferences && listOfMyPreferences.celebrities) {
        //               celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
        //                 return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
        //               });
        //               celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
        //                 return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
        //               });
        //             }
        //             else {
        //               celebDetails.isFan = false;
        //               celebDetails.isFollower = false;
        //             }
        //             if (youblockedByCelebrity && youblockedByCelebrity.length) {
        //               celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
        //                 return (celebDetails._id + "" == s.celebrityId + "")
        //               });
        //             }
        //             else {
        //               celebDetails.isBlocked = false;
        //             }
        //           })
        //           callback(null, celebProfileArray)
        //         } else {
        //           Memberpreferences.aggregate([
        //             { $unwind: "$celebrities" },
        //             { $group: { _id: "$celebrities.CelebrityId", len: { $sum: 1 } } },
        //             {
        //               $lookup: {
        //                 from: "users",
        //                 localField: "_id",
        //                 foreignField: "_id",
        //                 as: "celebProfile"
        //               }
        //             },
        //             { $sort: { len: -1 } },
        //             { $limit: length },
        //             { $unwind: "$celebProfile" },
        //             {
        //               $project: {
        //                 celebProfile: {
        //                   _id: 1,
        //                   email: 1,
        //                   username: 1,
        //                   // pastProfileImages: 1,
        //                   avtar_originalname: 1,
        //                   avtar_imgPath: 1,
        //                   firstName: 1,
        //                   lastName: 1,
        //                   aboutMe: 1,
        //                   isCeleb: 1,
        //                   profession: 1,
        //                   cover_imgPath: 1
        //                 }
        //               }
        //             }
        //           ], (err, celebProfileArray2) => {
        //             if (err) {
        //               callback(err, null)
        //             } else {
        //               // console.log("BBBBBB === ", celebProfileArray2.length)
        //               celebProfileArray2 = celebProfileArray2.map((celeb) => {
        //                 return celeb.celebProfile
        //               })
        //               celebProfileArray = celebProfileArray1.concat(celebProfileArray2)
        //               celebProfileArray.map((celebDetails) => {
        //                 if (listOfMyPreferences && listOfMyPreferences.celebrities) {
        //                   celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
        //                     return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
        //                   });
        //                   celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
        //                     return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
        //                   });
        //                 }
        //                 else {
        //                   celebDetails.isFan = false;
        //                   celebDetails.isFollower = false;
        //                 }
        //                 if (youblockedByCelebrity && youblockedByCelebrity.length) {
        //                   celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
        //                     return (celebDetails._id + "" == s.celebrityId + "")
        //                   });
        //                 }
        //                 else {
        //                   celebDetails.isBlocked = false;
        //                 }
        //               })
        //               callback(null, celebProfileArray)
        //             }
        //           })
        //         }
        //       }
        //     })
        //   }
        // })
      } else {
        callback("Please select preferences", null)
      }
    } else {
      callback("MemberPreferances not found", null)
    }
  })
}

const getTrendingCelebrities = (memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, callback) => {
  let today = new Date();
  let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
  objectIdArray.push(ObjectId(memberId))
  //becasee when user become follow or fan any celebrity 7 dya before we are instering
  let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);
  Memberpreferences.aggregate([
    { $unwind: "$celebrities" },
    { $match: { "celebrities.createdAt": { $gte: yesterday } } },
    { $group: { _id: "$celebrities.CelebrityId", len: { $sum: 1 } } },
    {
      $match: { _id: { $ne: memberId, $in: objectIdArray } }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "celebProfile"
      }
    },
    { $sort: { len: -1 } },
    { $limit: 30 },
    { $unwind: "$celebProfile" },
    {
      $project: {
        len: 1,
        celebProfile: {
          _id: 1,
          email: 1,
          username: 1,
          //pastProfileImages: 1,
          avtar_originalname: 1,
          avtar_imgPath: 1,
          aboutMe: 1,
          isCeleb: 1,
          firstName: 1,
          lastName: 1,
          profession: 1,
          cover_imgPath: 1
        }
      }
    }
  ], (err, celebProfileArray1) => {
    // console.log("Tranding Celebs ======= ", celebProfileArray1.length)
    if (err) {
      callback(err, null)
    } else {
      celebProfileArray1 = celebProfileArray1.map((celeb) => {
        return celeb.celebProfile
      })

      let length = 30 - celebProfileArray1.length;
      if (length <= 0) {
        celebProfileArray = celebProfileArray1;
        celebProfileArray.map((celebDetails) => {
          if (listOfMyPreferences && listOfMyPreferences.celebrities) {
            celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
              return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
            });
            celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
              return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
            });
          }
          else {
            celebDetails.isFan = false;
            celebDetails.isFollower = false;
          }
          if (youblockedByCelebrity && youblockedByCelebrity.length) {
            celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
              return (celebDetails._id + "" == s.celebrityId + "")
            });
          }
          else {
            celebDetails.isBlocked = false;
          }
        })
        celebProfileArray.forEach((user) => {
          for (i = 0; i < celebProfileArray.length; i++) {
            if ((user._id.toString() == celebProfileArray[i]._id.toString()) && i != celebProfileArray.indexOf(user)) {
              celebProfileArray.splice(i, 1);
            }
          }
        })
        return callback(null, celebProfileArray)
      } else {
        let today = new Date();
        let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
        // console.log("media tracking Date ", yesterday);
        // let fanFollowerCelebIds = celebProfileArray1.map(celeb => {
        //   return (celeb._id)
        // })
        MediaTracking.aggregate([
          {
            $match: {
              created_at: { $gte: yesterday }, isLike: true
            }
          },
          {
            $group: {
              _id: "$feedId",
              len: { $sum: 1 }
            }
          },
          { $sort: { len: -1 } },

          {
            $lookup: {
              from: "feeds",
              localField: "_id",
              foreignField: "_id",
              as: "feedDetails"
            }
          },
          // {
          //   $match: {
          //     memberId: { $nin: fanFollowerCelebIds }
          //   }

          // },
          {
            $lookup: {
              from: "users",
              localField: "feedDetails.memberId",
              foreignField: "_id",
              as: "celebProfile"
            }
          }, {
            $unwind: "$celebProfile"
          },
          { $limit: length },
          {
            $project: {
              len: 1,
              celebProfile: {
                _id: 1,
                email: 1,
                username: 1,
                // pastProfileImages: 1,
                avtar_originalname: 1,
                avtar_imgPath: 1,
                aboutMe: 1,
                isCeleb: 1,
                firstName: 1,
                lastName: 1,
                profession: 1,
                cover_imgPath: 1
              }
            }
          }
        ], (err, celebProfileArray2) => {
          console.log("Tranding Celebs 222 ======= ", celebProfileArray2.length)
          if (err) {
            callback(err, null)
          } else {
            celebProfileArray2 = celebProfileArray2.map((celeb) => {
              return celeb.celebProfile
            })
            celebProfileArray = celebProfileArray1.concat(celebProfileArray2)
            celebProfileArray.forEach((user) => {
              for (i = 0; i < celebProfileArray.length; i++) {
                if ((user._id.toString() == celebProfileArray[i]._id.toString()) && i != celebProfileArray.indexOf(user)) {
                  celebProfileArray.splice(i, 1);
                }
              }
            })
            celebProfileArray.map((celebDetails) => {
              if (listOfMyPreferences && listOfMyPreferences.celebrities) {
                celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
                  return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
                });
                celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
                  return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
                });
              }
              else {
                celebDetails.isFan = false;
                celebDetails.isFollower = false;
              }
              if (youblockedByCelebrity && youblockedByCelebrity.length) {
                celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
                  return (celebDetails._id + "" == s.celebrityId + "")
                });
              }
              else {
                celebDetails.isBlocked = false;
              }
            })
            return callback(null, celebProfileArray)
          }
        })
      }
    }
  })
}

const getUserDetailsById = (id, callback) => {
  User.getUserById(ObjectId(id), (err, userDetails) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, userDetails)
    }
  });
}

const isPasswordverified = (id, callback) => {
  User.findById(id, (err, userObj) => {
    if (err) {
      callback(err, null)
    } else if (userObj) {
      if (userObj.password == undefined || userObj.password == "" || userObj.password == null) {
        return callback(null, false)
      }
      Login.findOne({ memberId: id }, (err, loginObj) => {
        if (err) {
          callback(err, null)
        }
        else {
          Login.comparePassword("DefaultPassword@IndozTechSol", userObj.password, (err, isMatch) => {
            if (err) {
              callback(err, null)
            }
            if (isMatch) {
              return callback(null, false);
            } else {
              return callback(null, true);
            }
          });
        }
      });
    } else {
      return callback("User not found", null);
    }
  })
}

const MembersList1 = (params, callback) => {
  let createdAt = params.createdAt;
  let getNotificatonByTime = new Date();
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  let limit = parseInt(params.limit)
  User.aggregate(
    [
      { $match: { "IsDeleted": false, "dua": false, created_at: { $lt: new Date(getNotificatonByTime) } } },
      { $sort: { created_at: -1 } },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "logins",
          localField: "_id",
          foreignField: "memberId",
          as: "deviceToken" // to get all the views, comments, shares count
        }
      },
      {
        $project: {
          username: 1,
          mobileNumber: 1,
          avtar_imgPath: 1,
          avtar_originalname: 1,
          imageRatio: 1,
          password: 1,
          email: 1,
          name: 1,
          firstName: 1,
          lastName: 1,
          prefix: 1,
          aboutMe: 1,
          location: 1,
          country: 1,
          loginType: 1,
          role: 1,
          gender: 1,
          dateOfBirth: 1,
          address: 1,
          referralCode: 1,
          cumulativeSpent: 1,
          cumulativeEarnings: 1,
          lastActivity: 1,
          profession: 1,
          industry: 1,
          userCategory: 1,
          liveStatus: 1,
          status: 1,
          isCeleb: 1,
          isTrending: 1,
          isOnline: 1,
          isEditorChoice: 1,
          isPromoted: 1,
          isEmailVerified: 1,
          isMobileVerified: 1,
          emailVerificationCode: 1,
          mobileVerificationCode: 1,
          celebRecommendations: 1,
          Dnd: 1,
          celebToManager: 1,
          author_status: 1,
          iosUpdatedAt: 1,
          created_at: 1,
          updated_at: 1,
          created_by: 1,
          updated_by: 1,
          IsDeleted: 1,
          isPromoter: 1,
          isManager: 1,
          managerRefId: 1,
          promoterRefId: 1,
          charityRefId: 1,
          celebCredits: 1,
          deviceToken: "$deviceToken.deviceToken"
        }
      }
    ],
    (err, result) => {
      if (err) {
        callback(err, null)
      }
      else {
        callback(null, result)
      }
    }
  );
}
//by page number we are not using just for test
const MembersList = (params, callback) => {
  let pageNo = parseInt(params.pageNo);
  let startFrom = params.limit * (pageNo - 1);
  let limit = parseInt(params.limit);

  User.count({ "IsDeleted": false, "dua": false, "isCeleb": false, "isManager": false }, (err, count) => {
    if (err) {
      callback(err, null)
    } else {
      User.aggregate([
        { $match: { "IsDeleted": false, "dua": false, "isCeleb": false, "isManager": false } },
        {
          $skip: parseInt(startFrom)
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: "logins",
            localField: "_id",
            foreignField: "memberId",
            as: "deviceToken" // to get all the views, comments, shares count
          }
        },
        {
          $project: {
            username: 1,
            mobileNumber: 1,
            avtar_imgPath: 1,
            avtar_originalname: 1,
            imageRatio: 1,
            password: 1,
            email: 1,
            name: 1,
            firstName: 1,
            lastName: 1,
            prefix: 1,
            aboutMe: 1,
            location: 1,
            country: 1,
            loginType: 1,
            role: 1,
            gender: 1,
            dateOfBirth: 1,
            address: 1,
            referralCode: 1,
            cumulativeSpent: 1,
            cumulativeEarnings: 1,
            lastActivity: 1,
            profession: 1,
            industry: 1,
            userCategory: 1,
            liveStatus: 1,
            status: 1,
            isCeleb: 1,
            isTrending: 1,
            isOnline: 1,
            isEditorChoice: 1,
            isPromoted: 1,
            isEmailVerified: 1,
            isMobileVerified: 1,
            emailVerificationCode: 1,
            mobileVerificationCode: 1,
            celebRecommendations: 1,
            Dnd: 1,
            celebToManager: 1,
            author_status: 1,
            iosUpdatedAt: 1,
            created_at: 1,
            updated_at: 1,
            created_by: 1,
            updated_by: 1,
            IsDeleted: 1,
            isPromoter: 1,
            isManager: 1,
            managerRefId: 1,
            promoterRefId: 1,
            charityRefId: 1,
            celebCredits: 1,
            deviceToken: "$deviceToken.deviceToken"
          }
        }
      ], (err, result) => {
        if (err) {
          callback(err, null)
        } else {
          let data = {};
          data.result = result
          let total_pages = count / limit
          let div = count % limit;
          data.pagination = {
            "total_count": count,
            "total_pages": div == 0 ? total_pages : parseInt(total_pages) + 1,
            "current_page": pageNo,
            "limit": limit
          }
          callback(null, data)
        }
      })
    }
  })
  // User.aggregate(
  //   [
  //     { $match: { "IsDeleted": false, "dua": false } },
  //     { $sort: { created_at: -1 } },
  //     {
  //       $lookup: {
  //         from: "logins",
  //         localField: "_id",
  //         foreignField: "memberId",
  //         as: "deviceToken" // to get all the views, comments, shares count
  //       }
  //     },
  //     {
  //       $group:{
  //         _id:null,
  //         count: { $sum: 1 },
  //         users:{
  //           $push:{ 
  //             username: "$username",
  //             mobileNumber: "$mobileNumber",
  //             avtar_imgPath: "$avtar_imgPath",
  //             avtar_originalname: "$avtar_originalname",
  //             imageRatio: "$imageRatio",
  //             password: "$password",
  //             email: "$email",
  //             name: "$name",
  //             firstName: "$firstName",
  //             lastName: "$lastName",
  //             prefix: "$prefix",
  //             aboutMe: "$aboutMe",
  //             location: "$location",
  //             country: "$country",
  //             loginType: "$loginType",
  //             role: "$role",
  //             gender: "$gender",
  //             dateOfBirth:"$dateOfBirth",
  //             address: "$address",
  //             referralCode: "$referralCode",
  //             cumulativeSpent: "$cumulativeSpent",
  //             cumulativeEarnings:"$cumulativeEarnings",
  //             lastActivity: "$lastActivity",
  //             profession: "$profession",
  //             industry: "$industry",
  //             userCategory: "$userCategory",
  //             liveStatus:"$liveStatus",
  //             status: "$status",
  //             isCeleb:"$isCeleb",
  //             isTrending:"$isTrending",
  //             isOnline: "$isOnline",
  //             isEditorChoice: "$isEditorChoice",
  //             isPromoted: "$isPromoted",
  //             isEmailVerified: "$isEmailVerified",
  //             isMobileVerified:"$isMobileVerified",
  //             emailVerificationCode: "$emailVerificationCode",
  //             mobileVerificationCode: "$mobileVerificationCode",
  //             celebRecommendations: "$celebRecommendations",
  //             Dnd: "$celebToManager",
  //             celebToManager: "$celebToManager",
  //             author_status: "$author_status",
  //             iosUpdatedAt: "$iosUpdatedAt",
  //             created_at: "$updated_at",
  //             updated_at: "$updated_at",
  //             created_by: "$created_by",
  //             updated_by: "$updated_by",
  //             IsDeleted: "$isPromoter",
  //             isPromoter: "$isPromoter",
  //             isManager: "$isManager",
  //             managerRefId: "$managerRefId",
  //             promoterRefId: "$promoterRefId",
  //             charityRefId: "$charityRefId",
  //             celebCredits: "$celebCredits",
  //             deviceToken: "$deviceToken.deviceToken"
  //           }
  //         }
  //       }
  //     },
  //     {
  //       $project: {
  //         _id:0,
  //         count:1,
  //         "users": { "$slice": ["$users",startFrom,limit] }
  //       }
  //     }
  //   ],
  //   (err, result)=>{
  //     if (err) {
  //       callback(err,null)
  //     }
  //     else{
  //       let total_pages = result[0].count/limit
  //       result[0].pagination ={
  //         "total_count": result[0].count,
  //         "total_pages": total_pages == 0 ? total_pages : parseInt(total_pages)+1 ,
  //         "current_page": pageNo,
  //         "limit": limit
  //       }
  //       callback(null,result[0])
  //     }
  //   }
  // );
}


const getOnlineCelebrity = (memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, callback) => {
  let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
  // objectIdArray.push(memberId);
  User.findOnlineCelebrities(objectIdArray, (err, listOfOnlineCelebraties) => {
    if (err) {
      callback(err, null)
    } else {
      listOfOnlineCelebraties.map((celebDetails) => {
        if (listOfMyPreferences && listOfMyPreferences.celebrities) {
          celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
          });
          celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
          });
        }
        else {
          celebDetails.isFan = false;
          celebDetails.isFollower = false;
        }
        if (youblockedByCelebrity && youblockedByCelebrity.length) {
          celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
            return (celebDetails._id + "" == s.celebrityId + "")
          });
        }
        else {
          celebDetails.isBlocked = false;
        }
      })
      callback(null, listOfOnlineCelebraties)
    }
  })
}

const getCelebrityWhoHasContract = (memberId, callback) => {
  CelebrityContract.distinct("memberId", (err, contractsCelebArray) => {
    if (err) {
      callback(err, null)
    } else {
      contractsCelebArray.map(function (id, index) {
        if (id == memberId)
          contractsCelebArray.splice(index, 1);
      })
      callback(null, contractsCelebArray)
    }
  });
}

const getAllCelebrity = (memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, callback) => {
  let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
  let provideData = {
    _id: 1, avtar_imgPath: 1, avtar_originalname: 1, cover_imgPath: 1,
    imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
    isTrending: 1, preferenceId: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
  }
  User.find({
    _id: { $nin: [ObjectId(memberId)], $in: objectIdArray },
    IsDeleted: false,
    isCeleb: true
  }, provideData, (err, celebrities) => {
    if (err) {
      callback(err, null)
    }
    else {
      celebrities.map((celebDetails) => {
        if (listOfMyPreferences && listOfMyPreferences.celebrities) {
          celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
          });
          celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
          });
        }
        else {
          celebDetails.isFan = false;
          celebDetails.isFollower = false;
        }
        if (youblockedByCelebrity && youblockedByCelebrity.length) {
          celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
            return (celebDetails._id + "" == s.celebrityId + "")
          });
        }
        else {
          celebDetails.isBlocked = false;
        }
      })
      callback(null, celebrities)
    }
  }).lean();
}

let getAllEditorChoice = (memberId, contractsCelebArray, listOfMyPreferences, youblockedByCelebrity, callback) => {
  let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
  let provideData = {
    _id: 1, avtar_imgPath: 1, avtar_originalname: 1, cover_imgPath: 1, custom_imgPath: 1,
    imageRatio: 1, name: 1, firstName: 1, lastName: 1, prefix: 1, role: 1, profession: 1, industry: 1, isCeleb: 1,
    isTrending: 1, preferenceId: 1, isOnline: 1, created_at: 1, isEditorChoice: 1, isPromoted: 1, celebRecommendations: 1
  }
  User.find({
    _id: { $nin: [ObjectId(memberId)], $in: objectIdArray },
    IsDeleted: false,
    isCeleb: true,
    isEditorChoice: true
  }, provideData, (err, celebrities) => {
    if (err) {
      callback(err, null)
    }
    else {
      celebrities.map((celebDetails) => {
        if (listOfMyPreferences && listOfMyPreferences.celebrities) {
          celebDetails.isFan = listOfMyPreferences.celebrities.some((s) => {
            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFan == true))
          });
          celebDetails.isFollower = listOfMyPreferences.celebrities.some((s) => {
            return ((celebDetails._id + "" == s.CelebrityId + "") && (s.isFollower == true))
          });
        }
        else {
          celebDetails.isFan = false;
          celebDetails.isFollower = false;
        }
        if (youblockedByCelebrity && youblockedByCelebrity.length) {
          celebDetails.isBlocked = youblockedByCelebrity.some((s) => {
            return (celebDetails._id + "" == s.celebrityId + "")
          });
        }
        else {
          celebDetails.isBlocked = false;
        }
      })
      callback(null, celebrities)
    }
  }).lean().sort({ firstName: 1 });
}

const getBrandsByMemberID = (params, callback) => {
  let memberId = ObjectId(params.memberId);
  let createdAt = params.createdAt;
  let getNotificatonByTime = new Date();
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  let limit = parseInt(params.limit)
  MemberMedia.aggregate([
    {
      $match: {
        memberId: memberId
      }
    },
    {
      $unwind: "$media"
    },
    {
      $match: {
        "media.mediaType": "brand",
        "media.createdAt": { $lt: new Date(getNotificatonByTime) }
      }
    },
    {
      $sort: {
        "media.createdAt": -1
      }
    },
    {
      $limit: limit
    },
    {
      $group: {
        _id: "$memberId",
        media: { $push: "$media" }
      }
    }, {
      $project: {
        _id: 1,
        media: 1
      }
    }
  ], (err, brandObject) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, brandObject[0] ? brandObject[0].media : [])
    }
  })
}


const getVideoByMemberID = (params, callback) => {
  let memberId = ObjectId(params.memberId);
  let createdAt = params.createdAt;
  let getNotificatonByTime = new Date();
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  let limit = parseInt(params.limit)
  MemberMedia.aggregate([
    {
      $match: {
        memberId: memberId
      }
    },
    {
      $unwind: "$media"
    },
    {
      $match: {
        "media.mediaType": "video",
        "media.createdAt": { $lt: new Date(getNotificatonByTime) }
      }
    },
    {
      $sort: {
        "media.createdAt": -1
      }
    },
    {
      $limit: limit
    },
    {
      $group: {
        _id: "$memberId",
        media: { $push: "$media" }
      }
    }, {
      $project: {
        _id: 1,
        media: 1
      }
    }
  ], (err, videoObject) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, videoObject[0] ? videoObject[0].media : [])
    }
  })
}

const getImagesByMemberID = (params, callback) => {
  let memberId = ObjectId(params.memberId);
  let createdAt = params.createdAt;
  let getNotificatonByTime = new Date();
  if (createdAt != "null" && createdAt != "0") {
    getNotificatonByTime = createdAt
  }
  let limit = parseInt(params.limit)
  MemberMedia.aggregate([
    {
      $match: {
        memberId: memberId
      }
    },
    {
      $unwind: "$media"
    },
    {
      $match: {
        $and: [{ $or: [{ "media.mediaType": "image" }, { "media.mediaType": "gif" }] },
        { "media.createdAt": { $lt: new Date(getNotificatonByTime) } }]
      }
    },
    {
      $sort: {
        "media.createdAt": -1
      }
    },
    {
      $limit: limit
    },
    {
      $group: {
        _id: "$memberId",
        media: { $push: "$media" }
      }
    }, {
      $project: {
        _id: 1,
        media: 1
      }
    }
  ], (err, imageObject) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, imageObject[0] ? imageObject[0].media : [])
    }
  })
}

const getAllDetailsOfCelebrityForMemberId = (params, callback) => {
  let celebrityId = ObjectId(params.celebrityId);
  let memberId = ObjectId(params.memberId);
  User.findById(celebrityId, { password: 0 }, (err, userDetails) => {
    if (err) {
      callback(err, null)
    }
    else {
      MemberPreferences.aggregate([
        {
          $match: {
            $or: [
              { memberId: celebrityId },
              { "celebrities.CelebrityId": { $in: [celebrityId] } }
            ]
          }
        },
        {
          $unwind: "$celebrities"
        },
        {
          "$facet": {
            "Followers": [
              { "$match": { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFollower: true } } } },
              { "$count": "Followers" }
            ],
            "fan": [
              { "$match": { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFan: true } } } },
              { "$count": "fan" }
            ],
            "FanOf": [
              { "$match": { memberId: celebrityId, "celebrities.isFan": true } },
              { "$count": "FanOf" }
            ],
            "Following": [
              { "$match": { memberId: celebrityId, "celebrities.isFollower": true } },
              { "$count": "Following" }
            ],
            "isFan": [
              { "$match": { memberId: memberId, "celebrities.CelebrityId": celebrityId, "celebrities.isFan": true } },
              { "$count": "isFan" }
            ],
            "isFollower": [
              { "$match": { memberId: memberId, "celebrities.CelebrityId": celebrityId, "celebrities.isFollower": true } },
              { "$count": "isFollower" }
            ],
          }
        }
      ], (err, fanFollowerCount) => {
        let query = {
          $and: [
            { $or: [{ startTime: { $gte: new Date() } }, { endTime: { $gte: new Date() } }] },
            { memberId: ObjectId(celebrityId) },
            { slotStatus: "inactive" }
          ]
        };
        slotMaster.find(query, (err, slotDetails) => {
          if (err) {
            callback(err, null)
          } else {
            let count = slotDetails.length;
            //console.log("count",slotDetails.length);
            if (err) {
              console.log(err)
              callback(err, null)
            }
            else {
              // console.log(fanFollowerCount[0])
              let fanFollowingFollowerFeedCount = {
                UrFanOf: fanFollowerCount[0].FanOf.length ? fanFollowerCount[0].FanOf[0].FanOf : 0,
                Following: fanFollowerCount[0].Following.length ? fanFollowerCount[0].Following[0].Following : 0,
                fanOfUr: fanFollowerCount[0].fan.length ? fanFollowerCount[0].fan[0].fan : 0,
                Followers: fanFollowerCount[0].Followers.length ? fanFollowerCount[0].Followers[0].Followers : 0,
                isFan: fanFollowerCount[0].isFan.length ? true : false,
                isFollower: fanFollowerCount[0].isFollower.length ? true : false,
                scheduleCount: count
              }
              Feed.count({ memberId: celebrityId, isDelete: false }, (err, feedCount) => {
                if (err) {
                  console.log(err)
                  callback(err, null)
                }
                else {
                  fanFollowingFollowerFeedCount.feedCount = feedCount;
                  celebrityContract.aggregate([
                    {
                      $match: {
                        memberId: params.celebrityId,
                        $or: [
                          { serviceType: "audio" },
                          { serviceType: "video" },
                          { serviceType: "chat" },
                          { serviceType: "fan" }
                        ]
                      }
                    },
                    {
                      $group: {
                        _id: {
                          memberId: "$memberId"
                        },
                        celebrityContract: {
                          $push: {
                            serviceType: "$serviceType",
                            managerSharePercentage: "$managerSharePercentage",
                            charitySharePercentage: "$charitySharePercentage",
                            promoterSharePercentage: "$promoterSharePercentage",
                            sharingPercentage: "$sharingPercentage",
                            serviceCredits: "$serviceCredits",
                          }
                        }
                      }
                    }
                  ], (err, celebContracts) => {
                    if (err) {
                      callback(err, null)
                    }
                    else {
                      celebContracts = celebContracts.length ? celebContracts[0].celebrityContract : null;

                      Credits.find({ memberId: celebrityId }, (err, creditDetails) => {
                        if (err) {
                          callback(err, null)
                        } else {
                          MemberPreferences.aggregate(
                            [
                              {
                                $match: { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFollower: true } } }
                              },
                              {
                                $lookup: {
                                  from: "users",
                                  localField: "memberId",
                                  foreignField: "_id",
                                  as: "memberProfile"
                                }
                              },
                              // {
                              //   $match: { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
                              // },
                              {
                                $count: "followerCount"
                              }
                            ], (err, followerCount) => {
                              if (err) {
                                callback(err, null)
                              } else {
                                if (followerCount[0] && followerCount[0].followerCount) {
                                  fanFollowingFollowerFeedCount.Followers = followerCount[0].followerCount;
                                }
                                MemberPreferences.aggregate(
                                  [
                                    {
                                      $match: { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFan: true } } }
                                    },
                                    {
                                      $lookup: {
                                        from: "users",
                                        localField: "memberId",
                                        foreignField: "_id",
                                        as: "memberProfile"
                                      }
                                    },
                                    // {
                                    //   $match: { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
                                    // },
                                    {
                                      $count: "fancount"
                                    }
                                  ], (err, fancount) => {

                                    let query = {
                                      $and: [{ startTime: { $gte: new Date() } }]
                                    };


                                    if (fancount[0] && fancount[0].fancount) {
                                      console.log("2");
                                      fanFollowingFollowerFeedCount.fanOfUr = fancount[0].fancount;
                                      getImagesByMemberID({ memberId: celebrityId, createdAt: "0", limit: params.limit }, (err, memberMedia) => {
                                        if (err) {
                                          callback(err, null)
                                        } else {
                                          let data = { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, creditDetails: creditDetails[0], scheduleCount: parseInt(count), memberMedia: memberMedia }
                                          callback(null, data)
                                        }
                                      });
                                    }
                                    else {
                                      console.log("3");
                                      getImagesByMemberID({ memberId: celebrityId, createdAt: "0", limit: params.limit }, (err, memberMedia) => {
                                        if (err) {
                                          callback(err, null)
                                        } else {
                                          data = { userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, creditDetails: creditDetails[0], scheduleCount: parseInt(count), memberMedia: memberMedia }
                                          callback(null, data)
                                        }
                                      })
                                    }
                                  }
                                )
                              }
                            })
                        }
                      }).sort({ "createdAt": -1 }).limit(1)
                    }
                  })
                }
              })
            }


          }
        });


      })
    }
  })
}

const getAllDetailsOfCelebrity = (params, callback) => {
  let celebrityId = ObjectId(params.celebrityId);
  Credits.findOne({ memberId: celebrityId }, { cumulativeCreditValue: 1, referralCreditValue: 1, memberId: 1 }, (err, credits) => {
    if (err) {
      callback(err, null)
    }
    else {
      if (!credits) {
        var credits = {
          "memberId": celebrityId,
          "referralCreditValue": 0,
          "cumulativeCreditValue": 0
        }
      }
      User.aggregate([
        {
          $match: {
            _id: celebrityId
          }
        },
        {
          $lookup: {
            from: "countries",
            localField: "country",
            foreignField: "dialCode",
            as: "countryDetails"
          }
        },
        {
          $unwind: {
            path: "$countryDetails",
            preserveNullAndEmptyArrays: true
          }
        }
      ], (err, userDetails) => {
        if (err || userDetails.length < 0) {
          callback(err, null)
        }
        else {
          userDetails = userDetails[0];
          MemberPreferences.aggregate([
            {
              $match: {
                $or: [
                  { memberId: celebrityId },
                  { "celebrities.CelebrityId": { $in: [celebrityId] } }
                ]
              }
            },
            {
              $unwind: "$celebrities"
            },
            {
              "$facet": {
                "Followers": [
                  { "$match": { "celebrities.CelebrityId": celebrityId, "celebrities.isFollower": true } },
                  { "$count": "Followers" }
                ],
                "fan": [
                  { "$match": { "celebrities.CelebrityId": celebrityId, "celebrities.isFan": true } },
                  { "$count": "fan" }
                ],
                "FanOf": [
                  { "$match": { memberId: celebrityId, "celebrities.isFan": true } },
                  { "$count": "FanOf" }
                ],
                "Following": [
                  { "$match": { memberId: celebrityId, "celebrities.isFollower": true } },
                  { "$count": "Following" }
                ]
              }
            }
          ], (err, fanFollowerCount) => {
            if (err) {
              callback(err, null)
            }
            else {
              let fanFollowingFollowerFeedCount = {
                UrFanOf: fanFollowerCount[0].FanOf.length ? fanFollowerCount[0].FanOf[0].FanOf : 0,
                Following: fanFollowerCount[0].Following.length ? fanFollowerCount[0].Following[0].Following : 0,
                fanOfUr: fanFollowerCount[0].fan.length ? fanFollowerCount[0].fan[0].fan : 0,
                Followers: fanFollowerCount[0].Followers.length ? fanFollowerCount[0].Followers[0].Followers : 0
              }
              // media: { $ne: [] }
              Feed.count({ memberId: celebrityId, isDelete: false }, (err, feedCount) => {
                if (err) {
                  callback(err, null)
                }
                else {
                  fanFollowingFollowerFeedCount.feedCount = feedCount;
                  celebrityContract.aggregate([
                    {
                      $match: {
                        memberId: params.celebrityId,
                        $or: [
                          { serviceType: "audio" },
                          { serviceType: "video" },
                          { serviceType: "chat" }
                        ]
                      }
                    },
                    {
                      $group: {
                        _id: {
                          memberId: "$memberId"
                        },
                        celebrityContract: {
                          $push: {
                            serviceType: "$serviceType",
                            managerSharePercentage: "$managerSharePercentage",
                            charitySharePercentage: "$charitySharePercentage",
                            promoterSharePercentage: "$promoterSharePercentage",
                            sharingPercentage: "$sharingPercentage",
                            serviceCredits: "$serviceCredits",
                          }
                        }
                      }
                    }
                  ], (err, celebContracts) => {
                    if (err) {
                      callback(err, null)
                    }
                    else {
                      celebContracts = celebContracts.length ? celebContracts[0].celebrityContract : null;

                      MemberPreferences.aggregate(
                        [
                          {
                            $match: { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFollower: true } } }
                          },
                          {
                            $lookup: {
                              from: "users",
                              localField: "memberId",
                              foreignField: "_id",
                              as: "memberProfile"
                            }
                          },
                          {
                            $match: { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
                          },
                          {
                            $count: "followerCount"
                          }
                        ], (err, followerCount) => {
                          if (err) {
                            callback(err, null)
                          } else {
                            if (followerCount[0] && followerCount[0].followerCount) {
                              fanFollowingFollowerFeedCount.Followers = followerCount[0].followerCount;
                            }
                            MemberPreferences.aggregate(
                              [
                                {
                                  $match: { celebrities: { $elemMatch: { CelebrityId: celebrityId, isFan: true } } }
                                },
                                {
                                  $lookup: {
                                    from: "users",
                                    localField: "memberId",
                                    foreignField: "_id",
                                    as: "memberProfile"
                                  }
                                },
                                {
                                  $match: { "memberProfile.IsDeleted": { $ne: true }, memberProfile: { $ne: [] } }
                                },
                                {
                                  $count: "fancount"
                                }
                              ], (err, fancount) => {
                                if (err) {
                                  callback(err, null)
                                } else {
                                  // console.log(followerCount)
                                  // console.log(fancount)
                                  if (fancount[0] && fancount[0].fancount) {
                                    fanFollowingFollowerFeedCount.fanOfUr = fancount[0].fancount;
                                    getImagesByMemberID({ memberId: celebrityId, createdAt: "0", limit: params.limit }, (err, memberMedia) => {
                                      if (err) {
                                        callback(err, null)
                                      } else {
                                        let data = { credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia }
                                        callback(null, data)
                                      }
                                    });
                                  }
                                  else {
                                    getImagesByMemberID({ memberId: celebrityId, createdAt: "0", limit: params.limit }, (err, memberMedia) => {
                                      if (err) {
                                        callback(err, null)
                                      } else {
                                        let data = { credits: credits, userDetails: userDetails, fanFollowingFollowerFeedCount: fanFollowingFollowerFeedCount, celebContracts: celebContracts, memberMedia: memberMedia }
                                        callback(null, data)
                                      }
                                    });

                                  }
                                }
                              }
                            )
                          }
                        })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  }).sort({ createdAt: -1 }).limit(1)
}


let getCelebDetailsById = function (memberId, callback) {
  User.findOne({ _id: ObjectId(memberId) }, { password: 0, pastProfileImages: 0, languages: 0 }, (err, userObj) => {
    if (!err)
      callback(null, userObj);
    else
      callback(err, null)
  })
}
let userService = {
  findAllMemberFanFollowers: findAllMemberFanFollowers,
  checkOnLineUserIsCelebrityOrNot: checkOnLineUserIsCelebrityOrNot,
  findCelebByCountry: findCelebByCountry,
  findCelebNonCountry: findCelebNonCountry,
  resetPasswordById: resetPasswordById,
  memberRegistrationAndProfileUpdate: memberRegistrationAndProfileUpdate,
  createDefaultSettingsForNewUser: createDefaultSettingsForNewUser,
  getUserByEmailMobileNumberUsername: getUserByEmailMobileNumberUsername,
  getSugessionByPreferances: getSugessionByPreferances,
  getTrendingCelebrities: getTrendingCelebrities,
  getUserDetailsById: getUserDetailsById,
  isPasswordverified: isPasswordverified,
  MembersList: MembersList,
  getOnlineCelebrity: getOnlineCelebrity,
  getCelebrityWhoHasContract: getCelebrityWhoHasContract,
  getAllCelebrity: getAllCelebrity,
  getAllEditorChoice: getAllEditorChoice,
  getVideoByMemberID: getVideoByMemberID,
  getImagesByMemberID: getImagesByMemberID,
  getAllDetailsOfCelebrityForMemberId: getAllDetailsOfCelebrityForMemberId,
  getAllDetailsOfCelebrity: getAllDetailsOfCelebrity,
  getBrandsByMemberID: getBrandsByMemberID,
  getCelebDetailsById: getCelebDetailsById
}

module.exports = userService;