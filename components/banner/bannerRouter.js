let express = require('express');
let Banner = require('./bannerModel');
var router = express.Router();
let multer = require("multer");
let ObjectId = require('mongodb').ObjectId;
let contestEntry = require("../contests/contestEntries/contestEntriesModel");

// Image Settings for banners
let storageBanner = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/banners");
    },
    filename: function (req, file, cb) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
    }
});

let uploadBanner = multer({
    storage: storageBanner
});

// upload a banner
router.post('/create', uploadBanner.any(), (req, res, next) => {
    console.log(req.body)
    console.log(req.files)
    let profilepic = req.files;
    if (profilepic) {
        if (profilepic.length > 0) {
            /// Upload Banner Image
            let bannerImage;
            for (let i = 0; i < profilepic.length; i++) {
                if (req.files[i].fieldname == "bannerImage") {
                    bannerImage = req.files[i].path;
                }
            }
            let newBanner = new Banner({
                bannerType: req.body.bannerType,
                bannerTitle: req.body.bannerTitle,
                contestId: req.body.contestId,
                srcType: req.body.srcType,
                srcUrl: req.body.srcUrl,
                bannerImage: bannerImage,
                bannerValidStartDate: req.body.bannerValidStartDate,
                bannerValidEndDate: req.body.bannerValidEndDate,
                isActive: req.body.isActive,
                createdBy: req.body.createdBy
            });
            Banner.createBanner(newBanner, function (err, user) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        message: "Banner created successfully"
                    });
                }
            });
        } else {
            let newBanner = new bannerImage({
                bannerType: req.body.bannerType,
                bannerTitle: req.body.bannerTitle,
                contestId: req.body.contestId,
                srcType: req.body.srcType,
                srcUrl: req.body.srcUrl,
                bannerImage: req.body.bannerImage,
                bannerValidStartDate: req.body.bannerValidStartDate,
                bannerValidEndDate: req.body.bannerValidEndDate,
                isActive: req.body.isActive,
                createdBy: req.body.createdBy
            });
            Banner.createBanner(newBanner, function (err, user) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        message: "Banner created successfully"
                    });
                }
            });
        }
    } else {
        let newBanner = new bannerImage({
            bannerType: req.body.bannerType,
            bannerTitle: req.body.bannerTitle,
            contestId: req.body.contestId,
            srcType: req.body.srcType,
            srcUrl: req.body.srcUrl,
            bannerImage: req.body.bannerImage,
            bannerValidStartDate: req.body.bannerValidStartDate,
            bannerValidEndDate: req.body.bannerValidEndDate,
            isActive: req.body.isActive,
            createdBy: req.body.createdBy
        });
        Banner.createBanner(newBanner, function (err, user) {
            if (err) {
                res.send(err);
            } else {
                res.send({
                    message: "Banner created successfully"
                });
            }
        });
    }
});
// End of upload banner

// Edit a banner
router.put('/update/:bannerId', uploadBanner.any(), (req, res, next) => {
    let id = req.params.bannerId;
    let reqbody = req.body;
    reqbody.updatedAt = new Date();
    let profilepic = req.files;
    if (profilepic) {
        if (profilepic.length > 0) {
            /// Upload Banner Image
            let bannerImage;
            for (let i = 0; i < profilepic.length; i++) {
                if (req.files[i].fieldname == "bannerImage") {
                    bannerImage = req.files[i].path;
                }
            }
            reqbody.bannerImage = bannerImage;
            Banner.findById(id, function (err, result) {
                if (result) {
                    Banner.findByIdAndUpdate(id, reqbody, function (err, result) {
                        if (err) return res.send(err);
                        res.json({
                            message: "Banner updated successfully"
                        });
                    });
                } else {
                    res.json({
                        error: "Banner not found / Invalid Id"
                    });
                }
            });
        }
    } else {
        Banner.findById(id, function (err, result) {
            if (result) {
                Banner.findByIdAndUpdate(id, reqbody, function (err, result) {
                    if (err) return res.send(err);
                    res.json({
                        message: "Banner updated successfully"
                    });
                });
            } else {
                res.json({
                    error: "Banner not found / Invalid Id"
                });
            }
        });
    }
});
// End of upload banner

// Get banner by ID start

router.get('/getBannerById/:bannerId', (req, res, next) => {
    Banner.findById(req.params.bannerId, (err, listOfBannerObj) => {
        if (err)
            return res.json({
                success: 0,
                message: "Error while retrieving the banners " + err.message
            });
        else if (!listOfBannerObj || listOfBannerObj == "") {
            res.json({
                success: 0,
                message: "Banners doesnt exist!"
            });
        } else {
            res.send(listOfBannerObj);
        }
    });
});

// Get banner by ID end

//Get banner by ID with contest start

router.get('/getBannerByIdContest/:banner_Id', (req, res, next) => {
    let bannerId = req.params.banner_Id;
    //pagination based on created date
    Banner.findById(ObjectId(bannerId), (err, bannerObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while retrieve the banner by ID" });
        } else {
            contestEntry.aggregate([
                {
                    $match: {
                        $and: [
                            { bannerId: ObjectId(bannerId), isDeleted: false },
                            { "createdAt": { $gte: bannerObj.bannerValidStartDate, $lte: bannerObj.bannerValidEndDate } },
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "memberId",
                        foreignField: "_id",
                        as: "memberProfile"
                    }
                },
                { "$unwind": "$memberProfile" },
                {
                    $project: {
                        _id: 1,
                        memberId: 1,
                        bannerId: 1,
                        createdAt: 1,
                        "memberProfile._id": 1,
                        "memberProfile.username": 1,
                        "memberProfile.avtar_imgPath": 1,
                        "memberProfile.email": 1,
                        "memberProfile.mobileNumber": 1,
                        "memberProfile.name": 1,
                        "memberProfile.firstName": 1,
                        "memberProfile.isCeleb": 1,
                        "memberProfile.profession": 1,
                        "memberProfile.aboutMe": 1,
                        "memberProfile.created_at": 1

                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }

            ]).exec(function (err, listOfContestObj) {
                if (err) {
                    res.status(404).json({ success: 0, message: "Error while retrieving the member contest list." })
                }
                else if (listOfContestObj.length <= 0) {
                    res.status(200).json({ success: 0, message: "No more entries for this banners!." });
                }
                else {
                    let listOfContestArray = [];
                    let newUserCount = 0;

                    for (let i = 0; i < listOfContestObj.length; i++) {
                        let contestObj = {};
                        contestObj = listOfContestObj[i];
                        let userRegisteredDate = contestObj.memberProfile.created_at;
                        let isNewUser = false;
                        // console.log("*****************************************");
                        // console.log("Date1 start date==== " +new Date(bannerObj.bannerValidStartDate));
                        // console.log("Date2 end date==== " +new Date(bannerObj.bannerValidEndDate));
                        // console.log("Check user Date === " +new Date(userRegisteredDate));
                        // console.log("*****************************************");
                        if (new Date(userRegisteredDate) >= new Date(bannerObj.bannerValidStartDate) && new Date(userRegisteredDate) <= new Date(bannerObj.bannerValidEndDate)) {
                            isNewUser = true;
                            newUserCount = newUserCount + 1;
                        }
                        contestObj.isNewUser = isNewUser;
                        listOfContestArray.push(contestObj);
                    }
                    contestEntry.countDocuments({ bannerId: ObjectId(bannerId) }).exec((err, totalParticipatedUserCount) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(200).json({ success: 1, data: listOfContestArray, newUserCount, totalEntriesCount: totalParticipatedUserCount });
                        }
                    });
                }
            });
        }
    });
});
// End of Get banner by ID

// Get CurrentContest
router.get('/getCurrentContest/:memberId', (req, res, next) => {

    currentDate = new Date();
    //console.log(currentDate)
    let query = {
        $and: [{
            bannerValidEndDate: {
                $gte: currentDate
            }
        },
        {
            bannerValidStartDate: {
                $lte: currentDate
            }
        }
        ]
    }

    Banner.find(query, (err, listOfBannerObj) => {

        if (err)
            return res.json({
                success: 0,
                message: "Error while retrieving the banners " + err.message
            });
        else if (!listOfBannerObj || listOfBannerObj == "" || (listOfBannerObj.length == 0)) {
            res.json({
                success: 0,
                message: "Banners doesnt exist!",
                "isActive": false,
                "isSubmitted": false
            });
        } else {

            ////////////// check if member already submitted the banner
            contestEntry.find({
                memberId: req.params.memberId
            }, {
                    bannerId: listOfBannerObj[0]._id
                }, function (
                    err,
                    result
                ) {
                    if (err) {
                        res.send(err);
                    }
                    if (result.length > 0) {
                        let isSubmitted = true;
                        let newObj = {};
                        newObj = listOfBannerObj[0];
                        Object.assign(newObj, {
                            "isSubmitted": isSubmitted
                        })
                        res.send(newObj);
                    } else {
                        listOfBannerObj[0]['isSubmitted'] = false;
                        res.send(listOfBannerObj[0]);
                    }
                });

        }
    }).lean();

/* Banner.aggregate(
    [{
        $match: {
            $and: [{
                    bannerValidEndDate: {
                        $lte: currentDate
                    }
                },
                {
                    bannerValidStartDate: {
                        $gte: currentDate
                    }
                }
            ],
        }
    }],
    function (err, listOfBannerObj) {
        console.log(listOfBannerObj)
        if (err)
            return res.json({
                success: 0,
                message: "Error while retrieving the banners " + err.message
            });
        else if (!listOfBannerObj || listOfBannerObj == "" || (listOfBannerObj.length == 0)) {
            res.json({
                success: 0,
                message: "Banners doesnt exist!",
                "isActive" : false,
                "isSubmitted" : false
            });
        } else {

            ////////////// check if member already submitted the banner
            contestEntry.find({
                memberId: req.params.memberId
            }, {
                bannerId: listOfBannerObj[0]._id
            }, function (
                err,
                result
            ) {
                if (err) {
                    res.send(err);
                }
                if (result.length > 0) {
                    let isSubmitted = true;
                    let newObj = {};
                    newObj = listOfBannerObj[0];
                    Object.assign(newObj, {
                        "isSubmitted": isSubmitted
                    })
                    res.send(newObj);
                } else {
                    listOfBannerObj[0]['isSubmitted'] = false;
                    res.send(listOfBannerObj[0]);
                }
            });

        }
    }
); */

});
// End of Get banner by ID

// Get All Banners
router.get('/getAllBanners', (req, res, next) => {
    Banner.find({}).sort({ createdAt: -1 }).exec((err, listOfBannerObj) => {
        if (err)
            return res.json({
                success: 0,
                message: "Error while retrieving the banners " + err.message
            });
        else if (!listOfBannerObj || listOfBannerObj == "") {
            res.json({
                success: 0,
                message: "Banners has no exist"
            });
        } else {
            res.send(listOfBannerObj);
    } 
    });
});

//Delete banner by Id
router.delete("/delete/:bannerID", function (req, res, next) {
    let id = req.params.bannerID;

    Banner.findById(id, function (err, result) {
        if (err) return res.send(err);
        if (result) {
            Banner.findByIdAndRemove(id, function (err, post) {
                if (err) return res.send(err);
                res.json({
                    message: "Banner deleted successfully"
                });
            });
        } else {
            res.json({
                error: "Banner not found / Invalid"
            });
        }
    });
});
// End of Delete by banner ID

//get  banners by bannerType
router.get("/getBannersByBannerType/:bannerType", function (req, res, next) {
    let bannerType = '^'+req.params.bannerType;
    let today = new Date();
    Banner.find({bannerValidEndDate:{$gte:today},bannerType:{$regex:bannerType, $options: 'i'}}, function (err, banners) {
        if (err) 
            return res.send(err);
        else{
            res.json({
                banners:banners
            });
        }
    });
});

// end of get  banners by bannerType
module.exports = router;