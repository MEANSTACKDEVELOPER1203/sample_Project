let express = require("express");
let router = express.Router();
let dummyController = require('./dummyController');
let IndexModel = require('./indexModel');

router.post('/createIndex', (req, res) => {
    let f = "a";
    let l = "b";
    let arr = []
    for (let i = 0; i < 1000; i++) {
        let obj = {};
        obj.firstname = f + i;
        obj.lastname = l + i;
        obj.username = f + l + i;
        obj.fullname = obj.firstname + obj.lastname;
        arr.push(obj);
    };
    IndexModel.insertMany(arr, (err, objC) => {
        if (err)
            console.log(err);
        else
            res.json({ success: 1 })
    })
})
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

//@des pagination Of member media
//@method GET
//@access public
//router.get('/api/getMemberMedia/:member_Id/:media_Type/:pagination_Date', dummyController.getMemberMedia)
//@des pagination of both side in member media
//@method GET
//@access public
//router.get('/api/getMemberMediaBothSide/:member_Id/:media_Type/:pagination_Date', dummyController.getMemberMediaBothSide)

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
