let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let interests = require("./interestsModel");

// Create a interests item start

router.post("/createInterests", function (req, res) {
  //let parentProductionId = req.body.parentProductionId;
  let interestsName = req.body.interestsName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newInterests = new interests({
    //parentProductionId: parentProductionId,
    interestsName: interestsName,
    //access: access,
    createdBy: createdBy
  });

  interests.createInterests(newInterests, function (err, interests) {

    if (err) {
      res.send(err);
    } else {
      res.json({
        message: "interests saved successfully",
        "data": interests
      });
    }
  });
});
// End Create a interests item


router.get("/getInterests/:memberId", function (req, res) {
    
    let memberId = ObjectId(req.params.memberId);
    interests.aggregate(
    [
      {
        $lookup: {
          from: "myinterests",
          let: { id: "$_id" },
          pipeline: [
            {
              $match:
              {
                $expr:
                {
                  $and:
                    [
                      { $eq: ["$memberId", memberId] },
                      { $eq: ["$interestId", "$$id"] }
                    ]
                }
              }
            },
          ],
          as: "interests" // to get all the views, comments, shares count
        }

      },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "interests.memberId",
    //       foreignField: "_id",
    //       as: "userData" // to get all the views, comments, shares count
    //     },
    //   },
    ],
    function (err, result) {
      if (err) {
        res.json({token:req.headers['x-access-token'],success:0,message:err});
      }
    //   let outObj = {};
    //   for (i = 0; i < result.length; i++) {
    //     if (outObj.userData == null && result[i].userData != null && result[i].userData.length > 0) {
    //       outObj.userData = result[i].userData != null && result[i].userData.length > 0 ? result[i].userData[0] : {};
    //     }
    //     delete result[i].userData;

    //   }
    //   outObj.interests = result;
    res.json({token:req.headers['x-access-token'],success:1,data:result});
    }
  );

});


// Edit a interests start

router.put("/editinterests/:id", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  interests.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "interests Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "interests Updated Successfully" });
    }
  });
});
// End Edit a interests

// Find by interestsId start

router.get("/findinterestsId/:interestsId", function (req, res) {
  let id = req.params.interestsId;

  interests.getinterestsById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "interests document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by interestsId


// getAll start

router.get("/getAll", function (req, res) {

  interests.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({interestsName:1});
});
// End getAll

// deleteinterestsById start
router.delete("/deleteinterestsById/:id", function (req, res, next) {
  let id = req.params.id;

  interests.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "interests document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted interests Successfully" });
    }
  });
});
// End deleteinterestsById

module.exports = router;
