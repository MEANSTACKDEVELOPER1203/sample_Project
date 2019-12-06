let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let referralCode = require("./referralCodeModel");
let User = require("../users/userModel");

// generate referral code start
router.post("/generateReferralCode", (req, res) => {
  let memberId = req.body.memberId;
  let createdBy = req.body.memberId;

  User.findById(memberId, function (err, result) {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    if (result) {
      /// --> Check if the member is Celebrity and Apply Business logic of 250 credits to Member and 0 credits for User
      if (result.isCeleb == true) {
        //console.log("Step 1 Entered")
        var fName = result.firstName;
        var fRes = fName.substring(0, 3);
        var lName = result.lastName;
        var lRes = lName.substring(0, 2);
        var token = Math.floor(Math.random() * 100000 + 54);
        var memberCode = fRes.toUpperCase() + lRes.toUpperCase() + token;

        let newreferralCode = new referralCode({
          memberId: memberId,
          memberCode: memberCode,
          referralCreditValue: 250,
          referreCreditValue: 0,
          createdBy: createdBy
        });

        referralCode.createReferralCode(newreferralCode, function (err, user) {
          if (err) {
            res.json({ token: req.headers['x-access-token'], success: 0, message: err });
          } else {
            res.json({ token: req.headers['x-access-token'], success: 1, message: "ReferralCode created successfully", data: user });
          }
        });
        /// -->End of Check if the member is Celebrity and Apply Business logic of 250 credits to Member and 0 credits for User
      } else {
        //console.log("Step 2 Entered")
        /// -> For a Normal Member referral candidate will get 150 credits and refree will get 100 credits
        var fName = result.firstName;
        var fRes = fName.substring(0, 3);
        var lName = result.lastName;
        var lRes = lName.substring(0, 2);
        var token = Math.floor(Math.random() * 100000 + 54);
        var memberCode = fRes.toUpperCase() + lRes.toUpperCase() + token;

        let newreferralCode = new referralCode({
          memberId: memberId,
          memberCode: memberCode,
          referralCreditValue: 150,
          referreCreditValue: 100,
          createdBy: createdBy
        });

        referralCode.createReferralCode(newreferralCode, function (err, user) {
          if (err) {
            res.send(err);
          } else {
            res.json({
              token: req.headers['x-access-token'],
              success: 1,
              message: "ReferralCode created successfully",
              "data": user
            });
          }
        });
        /// -> End of For a Normal Member referral candidate will get 150 credits and refree will get 100 credits
      }
    } else {
      res.send({
        error: "Invalid memberId / user not exists!"
      });
    }
  });
});
// End generate referral code

// getBymemberId start
router.get("/getByMemberId/:memberId/:status/:size/:os", (req, res) => {
  let id = req.params.memberId;
  let status = req.params.status;
  let size = req.params.size;
  let os = req.params.os;
  let imageUrl;
  ///// Android Images///////////////
  let u1 = "uploads/invite/user/small.svg";
  let u2 = "uploads/invite/user/normal.svg";
  let u3 = "uploads/invite/user/large.svg";
  let u4 = "uploads/invite/user/xtralarge.svg";
  let c1 = "uploads/invite/celeb/small.svg";
  let c2 = "uploads/invite/celeb/normal.svg";
  let c3 = "uploads/invite/celeb/large.svg";
  let c4 = "uploads/invite/celeb/xtralarge.svg";
  ///// Android Images///////////////
  //////Ios Images//////////////////
  let Iu1 = "uploads/invite/Iuser/1x.png";
  let Iu2 = "uploads/invite/Iuser/2x.png";
  let Iu3 = "uploads/invite/Iuser/3x.png";
  let Ic1 = "uploads/invite/Iceleb/1x.png";
  let Ic2 = "uploads/invite/Iceleb/2x.png";
  let Ic3 = "uploads/invite/Iceleb/3x.png";

  //////Ios Images//////////////////
  if (os == "android") {
    if ((status == "celeb") || (status == "manager")) {
      if (size == "small") {
        imageUrl = c1;
      } else if (size == "normal") {
        imageUrl = c2;
      }
      else if (size == "large") {
        imageUrl = c3;
      }
      else if (size == "xlarge") {
        imageUrl = c4;
      }
    } else if (status == "member") {
      if (size == "small") {
        imageUrl = u1;
      } else if (size == "normal") {
        imageUrl = u2;
      }
      else if (size == "large") {
        imageUrl = u3;
      }
      else if (size == "xlarge") {
        imageUrl = u4;
      }
    }
  } else if (os == "IOS") {
    if ((status == "celeb") || (status == "manager")) {
      if (size == "1x") {
        imageUrl = Ic1;
      } else if (size == "2x") {
        imageUrl = Ic2;
      }
      else if (size == "3x") {
        imageUrl = Ic3;
      }
    } else if (status == "member") {
      if (size == "1x") {
        imageUrl = Iu1;
      } else if (size == "2x") {
        imageUrl = Iu2;
      }
      else if (size == "3x") {
        imageUrl = Iu3;
      }
    }

  }
  referralCode.findOne({ memberId: id }, (err, result) => {
    if (result) {
      let rinfo = {};
      rinfo.memberCode = result.memberCode;
      rinfo.referralCreditValue = result.referralCreditValue;
      rinfo.referreCreditValue = result.referreCreditValue;
      rinfo.createdBy = result.createdBy;
      rinfo.updatedBy = result.updatedBy;
      rinfo._id = result._id;
      rinfo.memberId = result.memberId;
      rinfo.updatedAt = result.updatedAt;
      rinfo.createdAt = result.createdAt;
      rinfo.inviteimage = imageUrl;

      res.json({ token: req.headers['x-access-token'], success: 1, data: rinfo });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "referralCode Not Exists / Send a valid memberId" });
    }
  });
});

// // Create a referralCode start
// router.post("/createReferralCode", function (req, res) {
//   let memberId = req.body.memberId;
//   let memberCode = req.body.memberCode;
//   let referralCreditValue = req.body.referralCreditValue;
//   let referreCreditValue = req.body.referreCreditValue;
//   let createdBy = req.body.createdBy;
//   let updatedBy = req.body.updatedBy;

//   let newreferralCode = new referralCode({
//     memberId: memberId,
//     memberCode: memberCode,
//     referralCreditValue: referralCreditValue,
//     referreCreditValue: referreCreditValue,
//     createdBy: createdBy,
//     updatedBy: updatedBy
//   });
//   referralCode.createReferralCode(newreferralCode, function (err, user) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.send({
//         message: "ReferralCode created sucessfully"
//       });
//     }
//   });
// });
// // End Create a referralCode

// // Edit a referralCode start
// router.put("/edit/:codeID", function (req, res) {
//   let id = req.params.codeID;

//   let reqbody = req.body;

//   reqbody.updatedAt = new Date();
//   reqbody.updatedBy;

//   referralCode.findById(id, function (err, result) {
//     if (result) {
//       referralCode.findByIdAndUpdate(id, reqbody, function (err, result) {
//         if (err) return res.send(err);
//         res.json({
//           message: "referralCode Updated Successfully"
//         });
//       });
//     } else {
//       res.json({
//         error: "referralCode not found / Invalid"
//       });
//     }
//   });
// });
// // End Edit a referralCode

// // get by Id (getreferralCodeByID) start
// router.get("/getReferralCodeById/:codeID", function (req, res) {
//   let id = req.params.codeID;

//   referralCode.findById(id, function (err, result) {
//     res.send(result);
//   });
// });
// // End get by Id (getreferralCodeByID)

// // End getBymemberId
// // get all start
// router.get("/getAll", function (req, res) {
//   referralCode.find({}, function (err, result) {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   }).sort({
//     createdAt: -1
//   });
// })
// // End get all
// // get all start
// router.get("/getCelebCode", function (req, res) {

//    //let id = req.params.userID;
//    referralCode.aggregate(
//     [
//         {
//         $lookup: {
//           from: "users",
//           localField: "memberId",
//           foreignField: "_id",
//           as: "senderProfile"
//         }
//       },
//       { $match: { "senderProfile.isCeleb":true }},
//       { $sort: { startTime: -1 } }
//     ],
//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       return res.send(data);
//     }
//   );
// })
// // End get all

// // Delete by referralCode start
// router.delete("/delete/:codeID", function (req, res, next) {
//   let id = req.params.codeID;

//   referralCode.findById(id, function (err, result) {
//     if (result) {
//       referralCode.findByIdAndRemove(id, function (err, post) {
//         if (err) return res.send(err);
//         res.json({
//           message: "Deleted referralCode successfully"
//         });
//       });
//     } else {
//       res.json({
//         error: "referralCode not found / Invalid"
//       });
//     }
//   });
// });
// // End Delete by referralCode


module.exports = router;