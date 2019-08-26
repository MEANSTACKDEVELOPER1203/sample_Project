let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let celebSurvey = require("./celebSurveyModel");
let User = require("../users/userModel");
let referralCode = require("../referralCode/referralCodeModel");

// Create a celebSurvey
router.post("/createCelebSurvey", function(req, res) {
  let memberId = req.body.memberId;
  let questionType = req.body.questionType;
  let questions = req.body.questions;
  let options = req.body.options;
  let correctAnswer = req.body.correctAnswer;
  let createdBy = req.body.createdBy;

  // To create question objects with options and correct answer
  let newArr = [];
  let newObj;

  for (let i = 0; i < questions.length; i++) {
    let newObj = {};
    let question = req.body.questions[i];
    let options = req.body.options[i];
    let correctAnswer = req.body.correctAnswer[i];

    newObj.id = new ObjectId();
    newObj.question = question;
    newObj.options = options;
    newObj.correctAnswer = correctAnswer;

    newArr[i] = newObj;
  }

  let newCelebSurvey = new celebSurvey({
    memberId: memberId,
    questionType: questionType,
    questionsData: newArr,
    createdBy: createdBy
  });

  celebSurvey.findOne({ memberId }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    // If user is not unique, return error
    if (existingUser) {
      return res.json({ message: "User already submitted the survey" });
    }
    celebSurvey.createCelebSurvey(newCelebSurvey, function(err, user) {
      if (err) {
        res.send(err);
      } else {
        res.send({ message: "Celebrity Survey created sucessfully" });
      }
    });
  });
});
// End of Create a celebSurvey

// Update a celebSurvey
router.put("/edit/:surveyID", function(req, res) {
  let id = req.params.surveyID;
  let reqbody = req.body;
  reqbody.updatedAt = new Date();

  celebSurvey.findById(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      celebSurvey.findByIdAndUpdate(id, reqbody, function(err, result) {
        if (err) return res.send(err);
        res.json({ message: "celebSurvey Updated Successfully" });
      });
    } else {
      res.json({ error: "celebSurvey not found / Invalid" });
    }
  });
});
// End of Update a celebSurvey

// get survey for member
router.get("/getSurveyForMember/:memberID", function(req, res) {
  let id = req.params.memberID;

  User.findById(id, function(err, userData) {
    if (err) return res.send(err);
    if(userData.referralCode == null || userData.referralCode == "") {
      celebSurvey.find({_id:"5acb0bb330b2432e745fdc8d"}, function(err, surveyData) {
        if (err) return res.send(err);
        if (surveyData) {
          res.send(surveyData);
        } else {
          res.json({
            error: "celebSurvey Not Exists / Send a valid memberId"
          });
        }
      });
    } else {
      rCode = userData.referralCode;
      referralCode.findOne({memberCode : rCode}, function(err, codeData) {
        if (err) return res.send(err);
        
        if(codeData) {
          mId = codeData.memberId;
          celebSurvey.getByMemberId(mId, function(err, surveyData) {
            if (err) return res.send(err);
            if (surveyData) {
              res.send(surveyData);
            } else {
              res.json({
                error: "celebSurvey Not Exists / Send a valid memberId"
              });
            }
          });
        } else {
          celebSurvey.find({_id:"5acb0bb330b2432e745fdc8d"}, function(err, surveyData) {
            if (err) return res.send(err);
            if (surveyData) {
              res.send(surveyData);
            } else {
              res.json({
                error: "celebSurvey Not Exists / Send a valid memberId"
              });
            }
          });
        }
      });
    }
  });
});
// End of get survey for member

// get survey info by SurveyId
router.get("/getCelebSurveyById/:surveyID", function(req, res) {
  let id = req.params.surveyID;

  celebSurvey.findById(id, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get survey info by SurveyId

// get survey by memberID
router.get("/getByMemberId/:memberId", function(req, res) {
  let id = req.params.memberId;
  celebSurvey.getByMemberId(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "celebSurvey Not Exists / Send a valid memberId"
      });
    }
  });
});
// End of get survey by memberID

// get list of all surveys
router.get("/getAll", function(req, res) {
  celebSurvey.find({}, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({createdAt:-1});
});
// End of get list of all surveys

// Delete by celebSurvey
router.delete("/delete/:contractID", function(req, res, next) {
  let id = req.params.contractID;

  celebSurvey.findById(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      celebSurvey.findByIdAndRemove(id, function(err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted contract successfully" });
      });
    } else {
      res.json({ error: "contractID not found / Invalid" });
    }
  });
});
// End of Delete by celebSurvey

///////////////////// Edit CelebSurvey Questions //////////////////////////

router.put("/update/:schID", function (req, res) {
  let reqbody = req.body;
  let schID = req.params.schID;
  celebSurvey.findOneAndUpdate(
    { "scheduleArray._id": schID },
    {
      $set: {
        "scheduleArray.$.scheduleId": req.body.scheduleId,
        "scheduleArray.$.memberId": req.body.memberId,
        "scheduleArray.$.scheduleStatus": req.body.scheduleStatus
      }
    },
    { upsert: true },
    function (err, newresult) {
      if (err) {
        res.json({ error: "InvalidID" });
      } else {
        res.json({ message: "Slot Schedule Updated Successfully" });
      }
    }
  );
});

///////////////////// End of Edit CelebSurvey Question ///////////////////
module.exports = router;
