const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectID;
const User = require('../users/userModel'); //require("../components/users/userModel");
const celebrityContract = require('../celebrityContract/celebrityContractsModel');
const Memberpreferences = require('../memberpreferences/memberpreferencesModel');
let advertisementController = require('./advertisementController');
const mongoose = require('mongoose');
let multer = require('multer');


// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/banners");
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

//@des create advertisement
//@Method Post
//@access private(admin only)
router.post('/createAdvertisement', upload.any(), advertisementController.createAdvertisement);
const adverties = {
    suggestion: (array, currentMemberId, callback) => {
        celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
            if (err) {
                res.json({ usersDetail: null, err: err })
            }
            else {
                let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
                //console.log("currentMemberId====== ", currentMemberId);
                // { celebrities: { $elemMatch: { isFollower: true, isFan: true } } }
                //{ $and: [{ memberId: currentMemberId }, { celebrities: { $elemMatch: { isFan: true } } }] }
                //{ memberId: currentMemberId, $and: [{ celebrities: { $elemMatch: { isFan: true } } }], $and: [{ celebrities: { $elemMatch: { isFollower: true } } }] }
                let query = { memberId: currentMemberId, celebrities: { $elemMatch: { isFan: true } }, celebrities: { $elemMatch: { isFollower: true } } }
                Memberpreferences.findOne(query, (err, listOfMyPreference) => {
                    if (err)
                        callback(err, null)
                    else {
                        //console.log("listOfMyPreference", listOfMyPreference)
                        let myPreferenceArray = [];
                        if (listOfMyPreference != null && listOfMyPreference.celebrities.length > 0) {
                            for (let i = 0; i < listOfMyPreference.celebrities.length; i++) {
                                let myPreferenceObj = {};
                                myPreferenceObj = listOfMyPreference.celebrities[i];
                                if (myPreferenceObj.isFollower == true || myPreferenceObj.isFan == true) {
                                    let celebId = myPreferenceObj.CelebrityId;
                                    myPreferenceArray.push("" + celebId);
                                }
                            }
                        }

                        myPreferenceArray.push("" + currentMemberId);
                        var filteredObjectArray = objectIdArray.filter(function (element) {
                            return myPreferenceArray.indexOf("" + element) === -1;
                        });
                        User.find({ '_id': { $in: filteredObjectArray } }, { firstName: 1, lastName: 1, avtar_imgPath: 1, profession: 1 }, (err, celebrityList) => {
                            if (err) {
                                callback(err, null)
                            }
                            else {
                                array.splice(3, 0, { celebrityList: celebrityList, isAdd: false });
                                callback(null, celebrityList)
                            }
                        }).limit(5);
                    }
                });

            }
        });
    },
    adverties: () => {

    }
}

module.exports = adverties;
module.exports = router;
