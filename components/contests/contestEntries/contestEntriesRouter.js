const express = require('express');
let multer = require('multer');
var FileReader = require('filereader')
let router = express.Router();
let contestEntry = require("../contestEntries/contestEntriesModel");


// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/contests");
    },
    filename: function (req, file, cb) {
        var today = new Date();
        var todayParse = Date.parse(today);
        todayParse = "" + todayParse;
        var todayParse = todayParse.substr(7);
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        cb(null, "cb" + "_" + date + "_" + todayParse + "_" + file.originalname);
    }
});

let upload = multer({
    storage: storage
});
// End of Multer Plugin Settings (Images Upload)

// upload a contest
router.post('/create', (req, res, next) => {
    // generate a unique code
    var today = new Date();
    var todayParse = Date.parse(today);
    todayParse = "" + todayParse;
    var todayParse = todayParse.substr(4);
    var code = Math.floor((Math.random() * 999999999) + 111111111);
    code = "" + todayParse + code;
    memberContestCode = code;
    let newContestEntry = new contestEntry({
        memberId: req.body.memberId,
        bannerId: req.body.bannerId,
        memberContestCode: memberContestCode,
        createdBy: req.body.createdBy
    });

    contestEntry.find({ memberId: req.body.memberId }, { bannerId: req.body.bannerId }, function (
        err,
        result
    ) {
        if (err) {
            res.send(err);
        }
        if (result.length > 0) {
            res.status(200).json({
                "success": 0,
                "message": "You have already submitted the campaign!"
            });
        } else {
            contestEntry.createContestEntry(newContestEntry, function (
                err,
                contestResult
            ) {
                if (err) {
                    res.send(err);
                } else {
                    res.status(200).send({
                        "success": 1,
                        message: "Congratulations for participating in the contest. Winners for the pre-release event will be announced 24hrs before the event. Winners will be contacted through SMS."
                    });
                }
            });
        }
    });



});
// End of upload contest

// Edit a contest
router.post('/update/:contestId', (req, res, next) => {
    let id = req.params.contestId;
    let reqbody = req.body;
    reqbody.updatedAt = new Date();
    contestEntry.findById(id, function (err, result) {
        if (result) {
            contestEntry.findByIdAndUpdate(id, reqbody, function (err, result) {
                if (err) return res.send(err);
                res.json({
                    message: "contest entry updated successfully"
                });
            });
        } else {
            res.json({
                error: "contest not found / Invalid Id"
            });
        }
    });
});
// End of upload contest

// Get contest by ID
router.get('/getcontestById/:contestId', (req, res, next) => {
    contest.findById(req.params.contestId, (err, listOfcontestObj) => {
        if (err)
            return res.json({
                success: 0,
                message: "Error while retrieving the contests " + err.message
            });
        else if (!listOfcontestObj || listOfcontestObj == "") {
            res.json({
                success: 0,
                message: "contests doesnt exist!"
            });
        } else {
            res.send(listOfcontestObj);
        }
    });
});
// End of Get contest by ID


// Get All contest entries
router.get('/getAllContestEntries', (req, res, next) => {
    contest.find((err, listOfcontestObj) => {

        if (err)
            return res.json({
                success: 0,
                message: "Error while retrieving the contest entries " + err.message
            });
        else if (!listOfcontestObj || listOfcontestObj == "") {
            res.json({
                success: 0,
                message: "contests entries does not exist"
            });
        } else {
            res.send(listOfcontestObj);
        }
    });
});

// Delete contest by Id
router.delete("/delete/:contestID", function (req, res, next) {
    let id = req.params.contestID;

    contestEntry.findById(id, function (err, result) {
        if (err) return res.send(err);
        if (result) {
            contestEntry.findByIdAndRemove(id, function (err, post) {
                if (err) return res.send(err);
                res.json({ message: "contest entry deleted successfully" });
            });
        } else {
            res.json({ error: "contest entry not found / Invalid" });
        }
    });
});
// End of Delete by contest ID

module.exports = router;





































































































































/*
//get all list of user
router.get('/getUserProfile', userController.getUserProfile);
//save user details
router.post('/createUserProfile', upload.any(), userController.createUserProfile);
//update user profile based on user id
router.put('/updateUserProfileById/:user_Id', userController.updateUserProfile);
//get user by register date
router.get('/getUserProfileByDate/:createdDate', userController.getUserProfileByDate);


module.exports = router;
*/