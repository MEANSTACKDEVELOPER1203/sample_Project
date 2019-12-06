let express = require("express");
let router = express.Router();
let dummyController = require('./dummyController');
let IndexModel = require('./indexModel');

router.get('/fanSubscription/:id', dummyController.fanSubscription);

// let User = require('../users/userModel');
// let logins = require('../loginInfo/loginInfoModel');
let Memberpreferences = require('../components/memberpreferences/memberpreferencesModel');
let ObjectId = require('mongodb').ObjectId;
//remove User with all details
router.get('/api/deleteMembershipAccount/:member_Details/:password', dummyController.deleteMemberAllDetails);
//@des get activated celebs
//@method GET
//@crom job
router.get('/api/getTrandingUsers', dummyController.getTrandingUsers)

//@des add 100 credits only
//@method GET
//@access for developer only..
router.get('/api/addCredits/:member_Details/:credit_Value', dummyController.addCredits)

//@des send push notification to 10K users
//@method GET
//@access for developer only..
router.get('/api/createTopics', dummyController.createTopics);
router.get('/api/sendPushNotification', dummyController.sendPushNotification);

router.get('/api/getCelebSearchDummy/:userID/:string/:createdAt', dummyController.getCelebSearchDummy);
//@desc remove seen status
//@method Get
//@access Developers
router.get('/api/removeSeenStatus/:member_Id', dummyController.removeSeenStatus)
//@des pagination Of member media
//@method GET
//@access public
//router.get('/api/getMemberMedia/:member_Id/:media_Type/:pagination_Date', dummyController.getMemberMedia)
//@des pagination of both side in member media
//@method GET
//@access public
//router.get('/api/getMemberMediaBothSide/:member_Id/:media_Type/:pagination_Date', dummyController.getMemberMediaBothSide)
//@des get story with async 
//@method GET
//@access public
router.get('/api/getIndividualStory/:celeb_Id/:currentUser_Id/:created_At', dummyController.getIndividualStory)


// router.get('/api/deleteUser/:mobileNo', (req, res) => {
//     User.deleteOne({ mobileNumber: req.params.mobileNo }, (err, deletedObj) => {
//         if (err)
//             res.status(404).json({ message: err });
//         else {
//             logins.deleteOne({ mobileNumber: req.params.mobileNo }, (err, loginObj) => {
//                 if (err)
//                     res.status(404).json({ message: err });
//                 else {
//                     res.status(200).json({ message: "Detelete Success fully" })
//                 }
//             })
//         }
//     })
// })
let slotMaster = require('../components/slotMaster/slotMasterModel')
router.get('/getSlot', (req, res) => {
    slotMaster.find({ memberId: ObjectId("5d40142e65be14038635d167"), scheduleStatus: "inactive" }, (err, slotLiostObj) => {
        if (err) {
            console.log("Error while fetch the slot list", err)
        } else {
            console.log("Now", new Date());
            let sObj = {};
            let now = new Date().getTime();
            console.log("Now", now);
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$44")
            slotLiostObj.map((slotObj) => {
                sObj = {};
                let st = slotObj.startTime.getTime();
                console.log("startTime", st);
                let et = slotObj.endTime.getTime();
                console.log("endTime", st);
                console.log("**********************************************")
                if (now >= st && now <= et) {
                    sObj = slotObj
                    console.log("Slot Available")
                }
            })
            // let index = slotLiostObj.findIndex(item => new Date(item.startTime).getTi
            //me() >= new Date().getTime() && new Date(item.endTime).getTime() <= new Date().getTime());
            // console.log("index", index);


            res.json({ success: 1, data: [sObj] })
        }
    })





    // let now = new Date();
    // // let endTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
    // let endTime = now.setSeconds(now.getSeconds() + 5);
    // console.log("Now", now);
    // console.log("endTime", endTime)
    // console.log("PPPPPP", new Date(now.getTime() - 6000))
    // // var idMin = ObjectId(Math.floor((new Date()) / 1000).toString(16) + "0000000000000000")
    // // var idMax = ObjectId(Math.floor((new Date()) / 1000).toString(16) + "0000000000000000")
    // // console.log("idMin", idMin)
    // // console.log("idMax", idMax)
    // let query = {
    //     memberId: ObjectId("5d40142e65be14038635d167"),
    //     endTime: {
    //         $lte: new Date(now.getTime() - 1000)
    //     },
    //     // endTime: {
    //     //     $lte: new Date(now)
    //     // },
    //     // $and: [
    //     //     //{ memberId: ObjectId("5d40142e65be14038635d167") },
    //     //     { startTime: { $gt: new Date(now), $lte: new Date(endTime) } },
    //     // ]
    // };
    // //let query = { $and : [{memberId: ObjectId(receiverId)}, { $or : [ {startDate:{ $gte: new Date() }}, { endDate:{ $lt: new Date() } } ] }] };
    // console.log("query", query);
    // slotMaster.find(query, (err, sObj) => {
    //     if (err) {
    //         res.json({ success: 0, message: err })
    //     } else {
    //         res.json({ success: 1, data: sObj })
    //     }
    // });
})

router.get('/api/removeFanFollow/:memberId', (req, res) => {
    Memberpreferences.updateOne({ memberId: ObjectId(req.params.memberId) }, { celebrities: [] }, (err, success) => {
        if (err)
            console.log(err);
        else {
            res.status(200).json({ message: "Successfuly done!!!!!!!!!" })
        }
    })
})

module.exports = router;
