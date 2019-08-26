let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let celebSurveySubmissions = require("./celebSurveySubmissionsModel");

// Create a celebSurveySubmission
router.post("/create", function(req, res) {
  let memberId = req.body.memberId;
  let celebSurveyId = req.body.celebSurveyId;
  let qids = req.body.quids;
  let questions = req.body.questions;
  let answers = req.body.answers;
  let createdBy = req.body.createdBy;

  let newArr = [];
  let newObj;

  for (let i = 0; i < questions.length; i++) {
    let newObj = {};

    let question = req.body.questions[i];
    let answer = req.body.answers[i];
    let qId = req.body.qids[i];

    newObj.id = new ObjectId();
    newObj.qId = qId;
    newObj.question = question;
    newObj.answer = answer;

    newArr[i] = newObj;
  }

  let newcelebSurveySubmissions = new celebSurveySubmissions({
    memberId: memberId,
    celebSurveyId: celebSurveyId,
    answersData: newArr,
    createdBy: createdBy
  });
  celebSurveySubmissions.createCelebSurveySubmissions(
    newcelebSurveySubmissions,
    function(err, user) {
      if (err) {
        res.send(err);
      } else {
        res.send({ message: "Survey submitted successfully" });
      }
    }
  );
});
// End of Create a celebSurveySubmission

// Update a CelebSurveySubmission
router.put("/edit/:submissionID", function(req, res) {
  let id = req.params.submissionID;

  let reqbody = req.body;
  reqbody.updatedAt = new Date();

  celebSurveySubmissions.findById(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      celebSurveySubmissions.findByIdAndUpdate(id, reqbody, function(
        err,
        result
      ) {
        if (err) return res.send(err);
        res.json({ message: "Survey answers updated successfully" });
      });
    } else {
      res.json({ error: "survey not found / Invalid" });
    }
  });
});
// End of Update a celebSurvey Submission

// Get Survey Details by SurveyID
router.get("/getSurveyDetails/:surveyID", function(req, res) {
  let id = req.params.surveyID;

  celebSurveySubmissions.find({ celebSurveyId: id }, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Get Survey Details by SurveyID

// Get Survey Submission Status by userId and SurveyId
router.get("/getSurveySubmissionStatus/:userID/:surveyID", function(req, res) {
  let memberId = req.params.userID;
  let surveyID = req.params.surveyID;
  let query = {
    $and: [{ memberId: memberId }, { celebSurveyId: surveyID }]
  };
  celebSurveySubmissions.findOne(query, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      res.json({
        message: "User Already Submitted this Survey",
        surveyDetails: result
      });
    } else {
      res.json({ error: "User not submitted this survey yet!" });
    }
  });
});
// End of Get Survey Submission Status by userId and SurveyId

// get survey submission by UserId
router.get("/getSurveySubmissionsByMemberId/:MemberId", function(req, res) {
  let id = req.params.MemberId;

  celebSurveySubmissions.find({ memberId: id }, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get survey submission by UserId

// get survey submission by surveyID
router.get("/getSurveySubmissionsBySurveyId/:SurveyId", function(req, res) {
  let id = req.params.SurveyId;

  celebSurveySubmissions.find({ celebSurveyId: id }, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get survey submission by surveyID

// Get all survey submissions
router.get("/getAll", function(req, res) {
  celebSurveySubmissions.find({}, function(err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({createdAt:-1});
});
// End of Get all survey submissions

// Delete a celebSurveySubmission
router.delete("/delete/:contractID", function(req, res, next) {
  let id = req.params.contractID;

  celebSurveySubmissions.findById(id, function(err, result) {
    if (err) return res.send(err);
    if (result) {
      celebSurveySubmissions.findByIdAndRemove(id, function(err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted contract successfully" });
      });
    } else {
      res.json({ error: "contractID not found / Invalid" });
    }
  });
});
// End of Delete a celebSurveySubmission

module.exports = router;
