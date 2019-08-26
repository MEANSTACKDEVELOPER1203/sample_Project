let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let auditionProfile = require("./auditionProfilesModel");
let multer = require("multer");

// Multer Settings code start

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avtars/audition-profiles");
  },
  filename: function (req, file, cb) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    cb(null, "ck"+"_pr2"+"_"+date+"_"+Date.now()+"_"+file.originalname);
  }
});

let upload = multer({
  storage: storage
});

//End Multer settings code

// Create a Audition Profile
router.post("/create", upload.any(), function (req, res) {
  let profilepic = req.files;
  //console.log(req.body);
  //console.log(req.files);
  let memberId = req.body.memberId;
  let title = req.body.title;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let otherNames = req.body.otherNames;
  let screenName = req.body.screenName;
  let aboutMe = req.body.aboutMe;
  let email = req.body.email;
  let mobileNumber = req.body.mobileNumber;
  let city = req.body.city;
  let state = req.body.state;
  let country = req.body.country;
  let dob = req.body.dob;
  let placeOfBirth = req.body.placeOfBirth;
  let gender = req.body.gender;
  let bodyType = req.body.bodyType;
  let skinTone = req.body.skinTone;
  let eyeColor = req.body.eyeColor;
  let ageGroup = req.body.ageGroup;
  let height = req.body.height;
  let weight = req.body.weight;
  let countryCode = req.body.countryCode;
  let currentRoles = req.body.currentRoles;
  let interestedIn = req.body.interestedIn;
  let hobbies = req.body.hobbies;
  let skills = req.body.skills;
  let languages = req.body.languages;
  let highestEducation = req.body.highestEducation;
  let schoolOrUniversity = req.body.schoolOrUniversity;
  let professionalEducation = req.body.professionalEducation;
  let proSchoolOrUniversity = req.body.proSchoolOrUniversity;
  let portFolioPictures = req.body.portFolioVideos;
  let portFolioVideos = req.body.portFolioVideos;
  let showReal = req.body.showReal;
  let publicProfileUrl = req.body.publicProfileUrl;
  let socialLinks = req.body.socialLinks;
  let mediaLinksOrArticles = req.body.mediaLinksOrArticles;
  let status = req.body.status;
  let createdBy = req.body.createdBy;
  let updatedBy = req.body.updatedBy;
  let profileCompletenes = req.body.profileCompletenes;

  if (profilepic) {
    if (profilepic.length > 0) {
      /// Attach Profile Image / portFolioPictures / portFolioVideos
      let profilePicUrl;
      let portFolioPicturesOne = [];
      let portFolioVideosOne = [];

      for (let i = 0; i < profilepic.length; i++) {
        if (req.files[i].fieldname == "profilePicUrl") {
          profilePicUrl = req.files[i].path;
        }
        if (req.files[i].fieldname == "portFolioPictures") {
          portFolioPicturesOne.push(req.files[i].path);
        }
        if (req.files[i].fieldname == "portFolioVideos") {
          portFolioVideosOne.push(req.files[i].path);
        }
      }
      /// End of Attach Profile Image / portFolioPictures / portFolioVideos

      let newAuditionProfile = new auditionProfile({
        memberId: memberId,
        title: title,
        firstName: firstName,
        lastName: lastName,
        otherNames: otherNames,
        screenName: screenName,
        aboutMe: aboutMe,
        email: email,
        mobileNumber: mobileNumber,
        profilePicUrl: profilePicUrl,
        city: city,
        state: state,
        country: country,
        dob: dob,
        placeOfBirth: placeOfBirth,
        gender: gender,
        bodyType: bodyType,
        skinTone: skinTone,
        eyeColor: eyeColor,
        ageGroup: ageGroup,
        height: height,
        weight: weight,
        countryCode:countryCode,
        currentRoles: currentRoles,
        interestedIn: interestedIn,
        hobbies: hobbies,
        skills: skills,
        languages: languages,
        highestEducation: highestEducation,
        schoolOrUniversity: schoolOrUniversity,
        professionalEducation: professionalEducation,
        proSchoolOrUniversity: proSchoolOrUniversity,
        portFolioPictures: portFolioPictures || portFolioPicturesOne,
        portFolioVideos: portFolioVideos || portFolioVideosOne,
        showReal: showReal,
        publicProfileUrl: publicProfileUrl,
        socialLinks: socialLinks,
        mediaLinksOrArticles: mediaLinksOrArticles,
        status: status,
        createdBy: createdBy,
        profileCompletenes: profileCompletenes
      });

      auditionProfile.find({
        memberId: memberId
      }, function (err, user) {
        if (err) {
          res.send(err);
        }
        if(user) {
          if (user.length > 0) {
            res.send({
              error: "Audition profile exits for the user!"
            });
          } else {
            auditionProfile.createAuditionProfile(newAuditionProfile, function (err, user) {
              if (err) {
                res.send(err);
              } else {
                res.send({
                  message: "Audition profile created successfully",
                  "auditionProfileData": user
                });
              }
            });
          }
        } else {
         // res.send({"error" : "Invalid User ID"})
        }
        
      });

    } else {

      let newAuditionProfile = new auditionProfile({
        memberId: memberId,
        title: title,
        firstName: firstName,
        lastName: lastName,
        otherNames: otherNames,
        screenName: screenName,
        aboutMe: aboutMe,
        email: email,
        mobileNumber: mobileNumber,
        city: city,
        state: state,
        country: country,
        dob: dob,
        placeOfBirth: placeOfBirth,
        gender: gender,
        bodyType: bodyType,
        skinTone: skinTone,
        eyeColor: eyeColor,
        ageGroup: ageGroup,
        height: height,
        weight: weight,
        countryCode:countryCode,
        currentRoles: currentRoles,
        interestedIn: interestedIn,
        hobbies: hobbies,
        skills: skills,
        languages: languages,
        highestEducation: highestEducation,
        schoolOrUniversity: schoolOrUniversity,
        professionalEducation: professionalEducation,
        proSchoolOrUniversity: proSchoolOrUniversity,
        portFolioPictures: portFolioPictures,
        portFolioVideos: portFolioVideos,
        showReal: showReal,
        publicProfileUrl: publicProfileUrl,
        socialLinks: socialLinks,
        mediaLinksOrArticles: mediaLinksOrArticles,
        status: status,
        updatedBy: updatedBy,
        profileCompletenes: profileCompletenes
      });

      auditionProfile.find({
        memberId: memberId
      }, function (err, user) {
        if (err) {
          res.send(err);
        }
        if (user.length > 0) {
          res.send({
            error: "Audition profile exits for the user!"
          });
        } else {
          auditionProfile.createAuditionProfile(newAuditionProfile, function (err, user) {
            if (err) {
              res.send(err);
            } else {
              res.send({
                message: "Audition profile created successfully",
                "auditionProfileData": user
              });
            }
          });
        }
      });

    }
  } else {
    let newAuditionProfile = new auditionProfile({
      memberId: memberId,
      title: title,
      firstName: firstName,
      lastName: lastName,
      otherNames: otherNames,
      screenName: screenName,
      aboutMe: aboutMe,
      email: email,
      mobileNumber: mobileNumber,
      city: city,
      state: state,
      country: country,
      dob: dob,
      placeOfBirth: placeOfBirth,
      gender: gender,
      bodyType: bodyType,
      skinTone: skinTone,
      eyeColor: eyeColor,
      ageGroup: ageGroup,
      height: height,
      weight: weight,
      currentRoles: currentRoles,
      interestedIn: interestedIn,
      hobbies: hobbies,
      skills: skills,
      countryCode:countryCode,
      languages: languages,
      highestEducation: highestEducation,
      schoolOrUniversity: schoolOrUniversity,
      professionalEducation: professionalEducation,
      proSchoolOrUniversity: proSchoolOrUniversity,
      portFolioPictures: portFolioPictures,
      portFolioVideos: portFolioVideos,
      showReal: showReal,
      publicProfileUrl: publicProfileUrl,
      socialLinks: socialLinks,
      mediaLinksOrArticles: mediaLinksOrArticles,
      status: status,
      updatedBy: updatedBy,
      profileCompletenes: profileCompletenes
    });

    auditionProfile.find({
      memberId: memberId
    }, function (err, user) {
      if (err) {
        res.send(err);
      }
      if (user.length > 0) {
        res.send({
          error: "Audition profile exits for the user!"
        });
      } else {
        auditionProfile.createAuditionProfile(newAuditionProfile, function (err, user) {
          if (err) {
            res.send(err);
          } else {
            res.send({
              message: "Audition profile created successfully",
              "auditionProfileData": user
            });
          }
        });
      }
    });
  }

});
// End of Create a Audition Profile

// Update an Audition profile
router.post("/edit/:reqID", upload.any(), function (req, res) {
  let id = req.params.reqID;
  let reqbody = req.body;
  reqbody.updatedAt = new Date();
  let profilepic = req.files;
//console.log(req.body)
//console.log(req.files)
  if(profilepic) {
    if (profilepic.length > 0) {

      let portFolioPicturesOne = [];
      let portFolioVideosOne = [];
      /// Attach Profile Image / portFolioPictures / portFolioVideos
      for (let i = 0; i < profilepic.length; i++) {
        if (req.files[i].fieldname == "profilePicUrl") {
          reqbody.profilePicUrl = req.files[i].path;
        }
        if (req.files[i].fieldname == "portFolioPictures") {
          portFolioPicturesOne.push(req.files[i].path);
        }
        if (req.files[i].fieldname == "portFolioVideos") {
          portFolioVideosOne.push(req.files[i].path);
        }
      }
  
      if (portFolioPicturesOne.length > 0) {
        reqbody.portFolioPictures = portFolioPicturesOne;
      }
  
      if (portFolioVideosOne.length > 0) {
        reqbody.portFolioVideos = portFolioVideosOne;
      }
      /// End of  Attach Profile Image / portFolioPictures / portFolioVideos
      auditionProfile.findById(id, function (err, result) {
        if (result) {
          auditionProfile.findByIdAndUpdate(id, reqbody, function (err, result) {
            if (err) return res.send(err);
            res.json({
              message: "Audition profile updated successfully"
            });
          });
        } else {
          res.json({
            error: "Audition profile not found / Invalid"
          });
        }
      });
    } else {
      auditionProfile.findById(id, function (err, result) {
        if (result) {
          auditionProfile.findByIdAndUpdate(id, reqbody, function (err, result) {
            if (err) return res.send(err);
            res.json({
              message: "Audition profile updated successfully"
            });
          });
        } else {
          res.json({
            error: "Audition profile not found / Invalid"
          });
        }
      });
    }
  } else {
    auditionProfile.findById(id, function (err, result) {
      if (result) {
        auditionProfile.findByIdAndUpdate(id, reqbody, function (err, result) {
          if (err) return res.send(err);
          res.json({
            message: "Audition profile updated successfully"
          });
        });
      } else {
        res.json({
          error: "Audition profile not found / Invalid"
        });
      }
    });
  }
});
// End of Update an Audition profile

// Find by Audition profile ID
router.get("/getAuditionProfileById/:auditionProfileID", function (req, res) {
  let id = req.params.auditionProfileID;

  auditionProfile.findById(id, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Find by Audition profile ID

// Find Audition profile by memberId
router.get("/getAuditionProfileByMemberId/:memberId", function (req, res) {
  let id = req.params.memberId;

  auditionProfile.find({
    memberId: id
  }, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Find Audition profile by memberId

// Get all Audition profiles
router.get("/getAll", function (req, res) {
  auditionProfile.find({}, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({createdAt:-1});
});
// End of Get all Audition profiles

// Delete by Audition profile ID
router.delete("/delete/:reqID", function (req, res, next) {
  let id = req.params.ComLogID;
  auditionProfile.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      auditionProfile.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({
          message: "Deleted Audition profile successfully"
        });
      });
    } else {
      res.json({
        error: "Request not found / Invalid"
      });
    }
  });
});
// sample
// Delete by Audition profile ID

module.exports = router;