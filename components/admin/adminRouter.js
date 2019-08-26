let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let User = require("../users/userModel");
let logins = require("../loginInfo/loginInfoModel");
let bcrypt = require("bcryptjs");
let Admin = require("./adminModel");
let mongoose = require("mongoose");
let multer = require("multer");
// let jwt = require('jsonwebtoken');
var crypto = require("crypto");
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('b4gGeksBlAv54P_igkBH-w');
var generator = require('generate-password');
let celebManager = require('../CelebManager/celebManagersModel');
const CelbrityContract = require('../celebrityContract/celebrityContractsModel');
var async = require("async");
let managerPermissionsAccessMaster = require("../managerPermissionsAccessMaster/managerPermissionsAccessMasterModel");
let managerPermissions = require("../managerPermission/managerPermissionsModel");
let managerPermissionsMaster = require("../managerPermissionsMaster/managerPermissionsMasterModel");
const AdminController = require("./adminController");
let referralCodeService = require('../referralCode/referralCodeService');
const jwt = require('../../jwt/jwt');

// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avtars/");
  },
  filename: function (req, file, cb) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
  }
});

let upload = multer({
  storage: storage
});
// End of Multer Plugin Settings (Images Upload)

// Create an Admin User
router.post("/register", upload.any(), function (req, res) {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  let mobileNumber = req.body.mobileNumber;
  let dateOfBirth = req.body.dateOfBirth;
  let emailVerificationStatus = req.body.emailVerificationStatus;
  let mobileVerificationStatus = req.body.mobileVerificationStatus;
  let accountStatus = req.body.accountStatus;
  let role = req.body.role;
  let createdBy = req.body.createdBy;
  let isDeleted = req.body.isDeleted;

  let permArr = [];
  let perObj;
  for (let i = 0; i < (req.body.modules).length; i++) {
    let perObj = {};
    let moduleName = req.body.modules[i];
    let access = req.body.access[i];
    let parentModuleId = req.body.parentModuleId[i];
    let parentMenuId = req.body.parentMenuId[i];

    perObj.moduleName = moduleName;
    perObj.access = access;
    perObj.parentModuleId = parentModuleId;
    perObj.parentMenuId = parentMenuId;

    permArr[i] = perObj;
  }

  let permissions = permArr;

  // Validation
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("mobileNumber", "mobileNumber is required").notEmpty();

  // Check if Email, Mobile Number are unique or not
  Admin.findOne({ email }, (err, existingUser) => {
    if (err) { return next(err); }
    // If user's email is not unique, return error
    if (existingUser) {
      return res.json({ message: "email address is already in use." });
    }
    Admin.findOne({ mobileNumber }, (err, existingUser1) => {
      if (err) { return next(err); }
      // If user's Mobile Number is not unique, return error
      if (existingUser1) {
        return res.json({ message: "mobileNumber is already in use." });
      }
      let errors = req.validationErrors();
      let profilepic = req.files;

      if (errors) {
        res.send({
          errors: errors
        });
      } else if (profilepic) {              // Check if Profile Image is uploaded along with data
        if (profilepic.length > 0) {
          let avtarImgPath = req.files[0].path;
          let avtarOriginalname = req.files[0].originalname;
          let newUser = new Admin({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            mobileNumber: mobileNumber,
            dateOfBirth: dateOfBirth,
            avtarImgPath: avtarImgPath,
            avtarOriginalname: avtarOriginalname,
            emailVerificationStatus: emailVerificationStatus,
            mobileVerificationStatus: mobileVerificationStatus,
            accountStatus: accountStatus,
            role: role,
            permissions: permissions,
            createdBy: createdBy
          });

          Admin.createAdmin(newUser, function (err, user) {
            if (err) {
              res.send(err);
            } else {
              res.json({
                message: "Registered sucessfully",
                userdata: user
              });
            }
          });
        } else {                            // If no image is uploaded with Data
          let newUser = new Admin({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            mobileNumber: mobileNumber,
            dateOfBirth: dateOfBirth,
            emailVerificationStatus: emailVerificationStatus,
            mobileVerificationStatus: mobileVerificationStatus,
            accountStatus: accountStatus,
            role: role,
            permissions: permissions,
            createdBy: createdBy
          });

          Admin.createAdmin(newUser, function (err, user) {
            if (err) {
              res.send(err);
            } else {
              res.json({
                message: "registered successfully",
                userdata: user
              });
            }
          });
        }
        // End of 1st Else If
      } else {
        let newUser = new Admin({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          mobileNumber: mobileNumber,
          dateOfBirth: dateOfBirth,
          emailVerificationStatus: emailVerificationStatus,
          mobileVerificationStatus: mobileVerificationStatus,
          accountStatus: accountStatus,
          role: role,
          permissions: permissions,
          createdBy: createdBy
        });
        Admin.createAdmin(newUser, function (err, user) {
          if (err) {
            res.send(err);
          } else {
            res.json({
              message: "registered successfully",
              userdata: user
            });
          }
        });
      }                               // End of Else Condition
    });                               // End of Mobile Number Query
  });                                 // End of Email Query
});
// End of Create an Admin User

// Login for Admin
router.post('/login', (req, res) => {

  if (!req.body.email) {
    res.json({
      success: false,
      message: 'No email was provided'
    });
  } else {
    if (!req.body.password) {
      res.json({
        success: false,
        message: 'No passsword was provided'
      });
    } else {
      Admin.findOne({
        email: req.body.email.toLowerCase()
      },
        (err, user) => {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            if (!user) {
              res.json({ success: false, message: 'email not found' });
            } else {
              let candidatePassword = req.body.password;
              let hash = user.password;

              Admin.comparePassword(candidatePassword, hash, function (err, result) {
                if (result) {
                  const token = jwt.createToken(user._id)
                  Admin.update({ _id: user._id }, { token: token }, (err, update) => {
                    if (err)
                      res.json({ success: 0, message: `please try again${err}` })
                    else
                      res.json({ message: 'successfully logged in', token: token });
                  })
                } else {
                  res.json({
                    error: "Invalid Password"
                  });
                }
              });

            }
          }
        });
    }
  }
});
// End of Login for Admin

// Update Admin Info
router.post("/edit", upload.any(), function (req, res) {
  let reqbody = req.body;
  let id = req.body.id;
  let profilepic = req.files;
  reqbody.updatedDate = new Date();
  let permissons = JSON.parse(req.body.permissions);
  reqbody.permissions = permissons;
  //console.log(reqbody)
  if (Object.keys(reqbody).length == 0) {
    res.json({
      error: "Please fill the data"
    });
  } else if (profilepic) {                          // If Profile Pic is uploaded with Data
    if (profilepic.length > 0) {
      reqbody.avtarImgPath = req.files[0].path;
      reqbody.avtarOriginalname = req.files[0].originalname;

      Admin.findById(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        if (result) {
          Admin.findByIdAndUpdate(id, reqbody, function (err, result) {
            if (err) return res.send(err);
            res.json({
              message: "Admin Updated Successfully",
              userdata: req.body
            });
          });
        } else {
          res.json({
            error: "Admin Not Exists / Send a valid ID"
          });
        }
      });
    } else {                                          // If No profile pic is sent with data
      Admin.findById(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        if (result) {
          Admin.findByIdAndUpdate(id, reqbody, function (err, result) {
            if (err) return res.send(err);
            res.json({
              message: "Admin Updated Successfully",
              userdata: req.body
            });
          });
        } else {
          res.json({
            error: "Admin Not Exists / Send a valid ID"
          });
        }
      });
    }
    // End of 1st Else If
  } else {                                      // If no profile pic is sent with the data
    Admin.findById(id, reqbody, function (err, result) {
      if (err) return res.send(err);
      if (result) {
        Admin.findByIdAndUpdate(id, reqbody, function (err, result) {
          if (err) return res.send(err);
          res.json({
            message: "Admin Updated Successfullyr",
            userdata: req.body
          });
        });
      } else {

        res.json({
          error: "Admin Not Exists / Send a valid ID"
        });
      }
    });
  }                                           // End of else condition
});
// End of Update Admin Info

// Update Celebrity Status for a User
router.post("/editCelebStatus", function (req, res) {
  //console.log(req.body)
  let referreCreditValue = 100;
  let referralCreditValue = 150;
  if (req.body.isCeleb == true) {
    referralCreditValue = 250;
    referreCreditValue = 0
  }
  let id = req.body.id;
  let isCeleb = req.body.isCeleb;
  let reqbody = {};
  reqbody.isCeleb = isCeleb;
  reqbody._id = id;

  referralCodeService.updateReferralCreditValue(ObjectId(req.body.id), referralCreditValue, referreCreditValue, (err, referralObj)=>{
    if(err){
      return res.status(404).json({success:0, message:"Error while updating the referral value"});
    }else{
      if (isCeleb == true) {
        var password = generator.generate({
          length: 8,
          numbers: true,
          symbols: true,
          uppercase: true,
          excludeSimilarCharacters: true,
          strict: true
        });
        //////////////////// UPDATE CELEBRITY STATUS //////////////////////////////////////////////
        
        User.findByIdAndUpdate(id, reqbody, function (err, uResult) {
          if (err) res.send(err);
          logins.findOne({ email: req.body.email.toLowerCase() }, function (err, lResult) {
            if (err) res.send(err);
            if (lResult) {
              bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                  let Lid = lResult._id;
                  let newbody = {};
                  newbody.updatedAt = new Date();
                  newbody.password = hash;
                  //console.log('login update')
                  //console.log(newbody);
                  // logins.findByIdAndUpdate(Lid, newbody, function (err, result) {
                  // });
                });
    
                //////////////////// SEND WELCOME EMAIL WITH GENERATED PASSWORD ////////////////////////////
                var template_name = "welcomeCeleb";
                var template_content = [
                  {
                    name: "celebEmail",
                    content: req.body.email
                  },
                  // {
                  //   name: "celebPwd",
                  //   content: password
                  // }
                ];
                var message = {
                  subject: "Registration Successful",
                  from_email: "admin@celebkonect.com",
                  from_name: "Admin",
                  to: [
                    {
                      email: req.body.email,
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
                      name: "celebEmail",
                      content: req.body.email
                    },
                    // {
                    //   name: "celebPwd",
                    //   content: password
                    // }
                  ],
                  merge_vars: [
                    {
                      "rcpt": req.body.email,
                      "vars": [
                        {
                          name: "celebEmail",
                          content: req.body.email
                        },
                        // {
                        //   name: "celebPwd",
                        //   content: password
                        // }
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
                    console.log({ message: "Email sent sucessfully" });
                  },
                  function (e) {
                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                  }
                );
                /////////////////// END OF SEND WELCOME EMAIL WITH GENERATED PASSWORD //////////////////////
              });
            } else {
              console.log({ error: "Email not found / Invalid!" });
            }
    
          });
          res.json({ message: "celebStatus Updated Successfully" });
        });
    
        /////////////////// END OF UPDATE CELEBRITY STATUS ////////////////////////////////////////
    
      } else {
        User.findByIdAndUpdate(id, reqbody, function (err, result) {
          if (err) return res.send(err);
          res.json({ message: "celebStatus Updated Successfully" });
        });
      }
    }
  })
 

});
// End of Update Celebrity Status for a User

// Update status of a user
router.post("/editStatus", function (req, res) {
  let id = req.body.id;
  let status = req.body.status;

  let reqbody = req.body;

  User.findByIdAndUpdate(id, reqbody, function (err, result) {
    if (err) return res.send(err);
    res.json({ message: "status Updated Successfully" });
  });
});
// End of Update status of a user

// Update editIosUpdatedAt
router.post("/editIosUpdatedAt", function (req, res) {
  let id = req.body.id;
  let iosUpdatedAt = req.body.iosUpdatedAt;

  let reqbody = req.body;

  User.findByIdAndUpdate(id, reqbody, function (err, result) {
    if (err) return res.send(err);
    res.json({ message: "iosUpdatedAt Updated Successfully" });
  });
});
// End of Update editIosUpdatedAt


// Change password through email
router.post("/resetPasswordByEmail", function (req, res, next) {

  let reqbody = req.body;
  let email = req.body.email.toLowerCase();

  req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  let errors = req.validationErrors();
  if (errors) {
    res.send({
      errors: errors
    });
  } else {
    logins.getUserByEmail(email, function (err, result) {
      if (err) return res.send(err);
      if (result) {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            let reqbody = {};
            reqbody.password = hash;
            reqbody.resetPasswordToken = null;
            logins.findByIdAndUpdate(result._id, reqbody, function (err, result) {
              if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
              res.json({ token: req.headers['x-access-token'], success: 1, message: "Password updated Successfully", data: req.body });
            });
          });
        });
      } else {
        res.json({ token: req.headers['x-access-token'], success: 0, message: "User Not Exists / Send a valid UserID" });
      }
    });
  }
});
// End of Change password through email

// Get list of all Admin Users
router.get("/getAll", (req, res) => {

  Admin.find({}, (err, result) => {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({ createdAt: -1 });
});
// End of Get list of all Admin Users

// Get list of all Celbrity Users
router.get("/getMemberByisCeleb", function (req, res) {
  CelbrityContract.distinct("memberId", { isActive: true }, (err, contractsCelebArray) => {
    if (err) {
      res.json({ usersDetail: null, err: err })
    }
    else {
      let objectIdArray = contractsCelebArray.map(s =>
        req.params.memberId != s ? mongoose.Types.ObjectId(s) : null
      );
      let query = { $and: [{ '_id': { $in: objectIdArray } }, { isCeleb: true }, { IsDeleted: false }] };
      User.find(query, (err, result) => {
        if (result) {
          res.json({ success: 1, data: result })
        } else {
          res.json({
            error: "No data found!"
          });
        }
      });
    }
  });
});
// End of Get list of all Celbrity Users

// Get list of all Celbrity Users admin
router.get("/getMemberByisCelebAdmin", (req, res) => {
  User.aggregate(
    [
      {
        $lookup: {
          from: "logins",
          localField: "email",
          foreignField: "email",
          as: "deviceToken" // to get all the views, comments, shares count
        }
      },
      { $match: { "dua": false, "isCeleb": true, "IsDeleted": false } },
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
      },


    ],
    function (err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    }
  );
});
// End of Get list of all Celbrity Users admin

// Get list of all isManager
router.get("/getMemberByisManager", function (req, res) {

  User.find({ isManager: true }, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End of Get list of all isManager

//start getManagerSearch
router.get("/getManagerSearch/:string", function (req, res, next) {
  let searchString = req.params.string;
  //let id = req.body.userID;
  let isManager = true;
  if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    User.aggregate(
      [
        {
          $match: {
            isManager: true,
          },

        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            avtar_imgPath: 1,
            profession: 1,
            isCeleb: 1,
            isManager: 1,
            isOnline: 1,
            isPromoted: 1,
            isTrending: 1,
            aboutMe: 1,
            email: 1,
            isEditorChoice: 1
          }
        }

      ],
      function (err, data) {
        if (err) {
          res.send(err);
        }
        return res.send(data);
      }
    );

  } else {
    User.aggregate(
      [
        {
          $match: {
            $and: [{ isManager: true }, { $or: [{ firstName: { $regex: searchString, $options: 'i' } }, { lastName: { $regex: searchString, $options: 'i' } }] }]
          },

        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            avtar_imgPath: 1,
            profession: 1,
            isCeleb: 1,
            isManager: 1,
            isOnline: 1,
            isPromoted: 1,
            isTrending: 1,
            aboutMe: 1,
            email: 1,
            isEditorChoice: 1
          }
        }

      ],
      function (err, data) {
        if (err) {
          res.send(err);
        }

        /*  data = data.filter(function (obj) {
           return obj.isManager !== false;
         });
    */
        return res.send(data);
      }
    );
  }

});

//End getManagerSearch 

//Start getCelebSearch
router.get("/getCelebSearch/:string", function (req, res, next) {
  let searchString = req.params.string;
  //let id = req.body.userID;
  let isCeleb = true;
  if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    User.aggregate(
      [
        {
          $match: {
            isCeleb: true,
          },

        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            avtar_imgPath: 1,
            profession: 1,
            isCeleb: 1,
            isManager: 1,
            isOnline: 1,
            isPromoted: 1,
            isTrending: 1,
            aboutMe: 1,
            email: 1,
            isEditorChoice: 1
          }
        }

      ],
      function (err, data) {
        if (err) {
          res.send(err);
        }
        return res.send(data);
      }
    );

  } else {
    User.aggregate(
      [
        {
          $match: {
            $or: [{ firstName: { $regex: searchString, $options: 'i' } }, { lastName: { $regex: searchString, $options: 'i' } }]
          },

        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            avtar_imgPath: 1,
            profession: 1,
            isCeleb: 1,
            isManager: 1,
            isOnline: 1,
            isPromoted: 1,
            isTrending: 1,
            aboutMe: 1,
            email: 1,
            isEditorChoice: 1
          }
        }

      ],
      function (err, data) {
        if (err) {
          res.send(err);
        }
        data = data.filter(function (obj) {
          return obj.isCeleb !== false;
        });

        return res.send(data);
      }
    );
  }

});

//End  getCelebSearch


// Get list of all Celbrity isPromoter
router.get("/getMemberByisPromoter", function (req, res) {

  User.find({ isPromoter: true }, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End of Get list of all isPromoter 



// Find by Admin ID
router.get("/findByAdminID/:AdminId", function (req, res) {
  let id = req.params.AdminId;
  Admin.findById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Not Found / Send a valid ID"
      });
    }
  });
});
// End of Find by Admin ID

// Find Admin by Email
router.get("/getMemberByEmail/:email", function (req, res, next) {
  let email = req.params.email.toLowerCase();
  Admin.findOne({ email: email }, function (err, result) {
    if (result == null) {
      res.json({
        error: "Please enter valid email"
      });
    } else {
      res.send(result);
    }
  });
});
// End of Find Admin by Email

// Get Members Count
router.get("/getMemberCount", function (req, res, next) {

  User.find({ isCeleb: false }, function (err, result) {
    if (result == null) {
      res.json({
        error: "Please enter valid email"
      });
    } else {
      res.json({
        "membersCount": result.length
      });
    }
  });
});
// End of Get Members Count

// Change password through email for Admin
router.post("/adminResetPasswordByEmail", function (req, res, next) {

  let reqbody = req.body;
  let email = req.body.email.toLowerCase();

  req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  let errors = req.validationErrors();
  if (errors) {
    res.send({
      errors: errors
    });
  } else {
    Admin.findOne({ email: email }, function (err, result) {
      if (err) return res.send(err);
      if (result) {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            let reqbody = {};
            reqbody.password = hash;
            reqbody.resetPasswordToken = null;
            Admin.findByIdAndUpdate(result._id, reqbody, function (err, result) {
              if (err) return res.send(err);
              res.json({
                message: "Password changed successfully.",
                userdata: req.body
              });
            });
          });
        });
      } else {
        res.json({
          error: "User Not Exists / Send a valid UserID"
        });
      }
    });
  }
});
// End of Change password through email

// Get List of managers for celebrity
router.get("/getManagersList/:CelebId", function (req, res) {
  let id = req.params.CelebId;
  let result = [];
  let query = { $and: [{ celebrityId: id }] }
  celebManager.find(query, function (err, CMresult) {
    if (err) res.send(err);
    if (CMresult) {
      let loop = 0;
      async.each(CMresult, function (celebManagerObj, callback) {
        // Perform operation on file here.
        User.findById(celebManagerObj.managerId, function (err, managerObject) {
          if (err) return callback(new Error(`Server Error`), null);
          if (managerObject) {
            fObject = {}
            fObject = celebManagerObj;
            Object.assign(fObject, {
              "managerProfile": managerObject
            })
            result.push(fObject)
            callback()
          }
        }).lean();
      }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err)
          res.status(200).json({
            success: 0,
            message: `${err.message}`
          });
        else
          res.status(200).json({
            "success": 1,
            "data": result
          });
      });
    } else {
      res.json({
        error: "Celeb has no managers / Send a valid ID"
      });
    }
  }).lean();
});
// End of Get List of managers for celebrity

// Get List of Assistant managers for a Manager under a Celebrity Profile
router.get("/getAssistantManagersList/:managerID/:celebrityID", function (req, res) {
  let celebrityId = req.params.celebrityID;
  let managerId = req.params.managerID;
  let result = [];
  let query = { $and: [{ celebrityId: celebrityId }, { reportingTo: managerId }] }
  celebManager.find(query, function (err, CMresult) {
    if (err) res.send(err);
    if (CMresult) {
      let loop = 0;
      async.each(CMresult, function (celebManagerObj, callback) {
        // Perform operation on file here.
        User.findById(celebManagerObj.managerId, function (err, managerObject) {
          if (err) return callback(new Error(`Server Error`), null);
          if (managerObject) {
            fObject = {}
            fObject = celebManagerObj;
            Object.assign(fObject, {
              "assistantManagerProfile": managerObject
            })
            result.push(fObject)
            callback()
          }
        }).lean();
      }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err)
          res.status(200).json({
            success: 0,
            message: `${err.message}`
          });
        else
          res.status(200).json({
            "success": 1,
            "data": result
          });
      });
    } else {
      res.json({
        error: "Celeb has no managers / Send a valid ID"
      });
    }
  }).lean();
});
// End of Get List of Assistant managers for a Manager under a Celebrity Profile

// Get List of Assistant managers for a Manager for all Celebrities
router.get("/getAssistantManagersList/:managerID", function (req, res) {
  let managerId = req.params.managerID;
  let result = [];
  let query = { $and: [{ reportingTo: managerId }] }
  celebManager.find(query, function (err, CMresult) {
    if (err) res.send(err);
    if (CMresult) {
      let loop = 0;
      async.each(CMresult, function (celebManagerObj, callback) {
        // Perform operation on file here.
        User.findById(celebManagerObj.managerId, function (err, managerObject) {
          if (err) return callback(new Error(`Server Error`), null);
          if (managerObject) {
            fObject = {}
            fObject = celebManagerObj;
            Object.assign(fObject, {
              "assistantManagerProfile": managerObject
            })
            result.push(fObject)
            callback()
          }
        }).lean();
      }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err)
          res.status(200).json({
            success: 0,
            message: `${err.message}`
          });
        else
          res.status(200).json({
            "success": 1,
            "data": result
          });
      });
    } else {
      res.json({
        error: "Celeb has no managers / Send a valid ID"
      });
    }
  }).lean();
});
// End of Get List of Assistant managers for a Manager for all Celebrities

// Get List of Celebrites for Manager
router.get("/getCelebritiesList/:managerID", function (req, res) {
  let id = req.params.managerID;
  let result = [];
  let query = { $and: [{ managerId: id }] };
  celebManager.find({ managerId: id }, function (err, CMresult) {
    if (err) res.send(err);
    if (CMresult) {
      async.each(CMresult, function (celebManagerObj, callback) {
        //console.log(celebManagerObj.celebrityId)
        // Perform operation on file here.
        User.findById(celebManagerObj.celebrityId, function (err, celebrityObject) {
          if (err) return callback(new Error(`Server Error`), null);
          if (celebrityObject) {
            fObject = {}
            fObject = celebManagerObj;
            Object.assign(fObject, {
              "celebrityProfile": celebrityObject
            })
            result.push(fObject)
            callback()
          }
        });
      }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err)
          res.status(200).json({
            success: 0,
            message: `${err.message}`
          });
        else
          res.status(200).json({
            "success": 1,
            "data": result
          });
      });
    } else {
      res.json({
        error: "Manager has no Celebrites linked / Send a valid ID"
      });
    }
  }).lean();
});
// End of Get List of Celebrities for a Manager

// Get list of Permissions for a Manager granted by Celebrity
router.get("/getListOfPermissions/:celebrityId/:managerId", function (req, res) {
  let managerId = ObjectId(req.params.managerId);
  let celebrityId = ObjectId(req.params.celebrityId);

  let query = { $and: [{ managerId: managerId }, { celebrityId: celebrityId }] };
  //// Check wether Permission already exists
  managerPermissions.find(query, function (err, permissions) {
    if (err) {
      res.send(err);
    }
    if (permissions.length == 0) {
      // code for creation of default permissions start
      // Step1: Get Master Permissions
      let result = [];
      managerPermissionsMaster.findOne({ permissionName: "Off" }, function (err, CMresult) {
        if (err) res.send(err);
        if (CMresult) {
          let managerSettingsMasterId = CMresult._id;
          /// Get Manager Permissions Access Master List
          managerPermissionsAccessMaster.find({}, function (err, Mresult) {
            if (err) res.send(err);
            if (Mresult) {
              async.each(Mresult, function (MObject, callback) {
                let managerPermissionsMasterId = MObject._id;
                let newManagerPermissions = new managerPermissions({
                  managerId: managerId,
                  celebrityId: celebrityId,
                  managerPermissionsMasterId: managerPermissionsMasterId,
                  managerSettingsMasterId: managerSettingsMasterId,
                  createdBy: 'Default'
                });
                // Insert each record in DB
                managerPermissions.createManagerPermissions(newManagerPermissions, function (err, managerPermissions) {
                  console.log('inserted doc')
                });
                callback()
              }, function (err) {
                if (err)
                  res.status(200).json({
                    success: 0,
                    message: `${err.message}`
                  });
                else
                  // Ftech the main results after inserting the data successfully
                  managerPermissionsAccessMaster.aggregate(
                    [
                      {
                        $lookup: {
                          from: "managerpermissions",
                          let: { id: "$_id" },
                          pipeline: [
                            {
                              $match:
                              {
                                $expr:
                                {
                                  $and:
                                    [
                                      { $eq: ["$managerId", managerId] },
                                      { $eq: ["$celebrityId", celebrityId] },
                                      { $eq: ["$managerPermissionsMasterId", "$$id"] }
                                    ]
                                }
                              }
                            },
                          ],
                          as: "accessPermissions" // to get all the views, comments, shares count
                        }

                      },
                      {
                        $lookup: {
                          from: "managerpermissionsmasters",
                          localField: "accessPermissions.managerSettingsMasterId",
                          foreignField: "_id",
                          as: "accessSettingsPermissions" // to get all the views, comments, shares count
                        }
                      },
                      {
                        $lookup: {
                          from: "users",
                          localField: "accessPermissions.managerId",
                          foreignField: "_id",
                          as: "userData" // to get all the views, comments, shares count
                        },
                      },
                    ],
                    function (err, result) {
                      if (err) {
                        res.send(err);
                      }
                      let outObj = {};
                      for (i = 0; i < result.length; i++) {
                        if (outObj.userData == null && result[i].userData != null && result[i].userData.length > 0) {
                          outObj.userData = result[i].userData != null && result[i].userData.length > 0 ? result[i].userData[0] : {};
                        }
                        delete result[i].userData;

                      }
                      outObj.managerPermissions = result;
                      res.send(outObj);
                    }
                  );
              });
            }
          });
          /// End of Get Manager Permissions Access Master List
        } else {
          res.json({
            error: "Celeb has no managers / Send a valid ID"
          });
        }
      }).lean();
      // end of code for creation of default permissions start
    } else {
      // Fetch manager permissions
      managerPermissionsAccessMaster.aggregate(
        [
          {
            $lookup: {
              from: "managerpermissions",
              let: { id: "$_id" },
              pipeline: [
                {
                  $match:
                  {
                    $expr:
                    {
                      $and:
                        [
                          { $eq: ["$managerId", managerId] },
                          { $eq: ["$celebrityId", celebrityId] },
                          { $eq: ["$managerPermissionsMasterId", "$$id"] }
                        ]
                    }
                  }
                },
              ],
              as: "accessPermissions" // to get all the views, comments, shares count
            }
          },
          {
            $lookup: {
              from: "managerpermissionsmasters",
              localField: "accessPermissions.managerSettingsMasterId",
              foreignField: "_id",
              as: "accessSettingsPermissions" // to get all the views, comments, shares count
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "accessPermissions.managerId",
              foreignField: "_id",
              as: "userData" // to get all the views, comments, shares count
            },
          },
        ],
        function (err, result) {
          if (err) {
            res.send(err);
          }
          let outObj = {};
          for (i = 0; i < result.length; i++) {
            if (outObj.userData == null && result[i].userData != null && result[i].userData.length > 0) {
              outObj.userData = result[i].userData != null && result[i].userData.length > 0 ? result[i].userData[0] : {};
            }
            delete result[i].userData;
          }
          outObj.managerPermissions = result;
          res.send(outObj);
        }
      );
      // End of Fetch manager permissions
    }
  });
});
// End of  Get list of Permissions for a Manager granted by Celebrity


router.get("/getMemberByisCelebAdmin/:pageNo/:limit", AdminController.getMemberByisCelebAdmin);
router.get("/getMemberByisManager/:pageNo/:limit", AdminController.getMemberByisManager);
router.get("/getAll/:pageNo/:limit", AdminController.getAll);

module.exports = router;