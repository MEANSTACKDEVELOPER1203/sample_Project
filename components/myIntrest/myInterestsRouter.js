let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let myInterests = require("./myInterestsModel");

// Create a myInterests item start

router.post("/createMyInterests", function (req, res) {
  let interestId = req.body.interestId;
  //let myInterestsName = req.body.myInterestsName;
  let memberId = req.body.memberId;
  let isEnabled = req.body.isEnabled;
  let createdBy = req.body.createdBy;

  let newMyInterests = new myInterests({
    interestId: interestId,
    //myInterestsName: myInterestsName,
    memberId: memberId,
    isEnabled: isEnabled,
    createdBy: createdBy
  });
  let newMyInterestsInfo = {
    interestId: interestId,
    //myInterestsName: myInterestsName,
    memberId: memberId,
    isEnabled: isEnabled,
    createdBy: createdBy
  }

  let query = {
    $and: [{ interestId: interestId }, { memberId: memberId }]
  };
  myInterests.find(query, function (err, result) {
    //console.log(result.length);
    if (err) {
      //console.log(err.message);
      res.send(err)
    } else if (result.length > 0) {
      id = result[0]._id;
    
      myInterests.findByIdAndUpdate(id, newMyInterestsInfo, {new:true}, function (err, result2) {
        //console.log(err)
        if (err) {
          //res.send(err);
          res.json({token:req.headers['x-access-token'],success:0,message:err});
         
        } else {
          res.json({token:req.headers['x-access-token'],success:1,message: "My Interests updated successfully",data:result2});
        }
      });
      //res.send(result);

    } else {
      myInterests.createMyInterests(newMyInterests, function (err, myInterests) {
        if (err) {
          res.send(err);
        } else {
          res.json({token:req.headers['x-access-token'],success:1,message: "My Interests saved successfully",data:myInterests});
        }
      });
    }

  });


});
// End Create a myInterests item

// Edit a myInterests start

router.post("/editMyInterests", function (req, res) {

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();
  //console.log(reqbody)
  let newMyInterests = new myInterests(
    reqbody
  );
  myInterests.find(interestId, reqbody, function (err, result) {
    // console.log(result)
    // console.log(err)
    if (err) {
      res.json({
        error: "myInterests Not Exists / Send a valid myInterset"
      });
    }
    if (result) {
      myInterests.findByIdAndUpdate(result._id, newMyInterests, function (err, result) {
        if (result) {
          res.send(result);
        } else {
          res.json({
            error: "myInterests document Not Exists / Send a valid ID"
          });
        }
      });

    } else if (!result || result == "" || result === "undefined") {

      myInterests.createMyInterests(newMyInterests, function (err, myInterests) {

        if (err) {
          res.send(err);
        } else {
          res.json({
            message: "myInterests saved successfully",
            "data": myInterests
          });
        }
      });
    } else {
      res.json({ message: "myInterests Updated Successfully" });
    }



  });
});
// End Edit a myInterests

// Find by myInterestsId start

router.get("/findmyInterestsId/:myInterestsId", function (req, res) {
  let id = req.params.myInterestsId;

  myInterests.getmyInterestsById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "myInterests document Not Exists / Send a valid ID"
      });
    }
  });
});
// End Find by myInterestsId


// getAll start

router.get("/getAll", function (req, res) {

  myInterests.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({ createdAt: -1 });
});
// End getAll

// deletemyInterestsById start
router.delete("/deletemyInterestsById/:id", function (req, res, next) {
  let id = req.params.id;

  myInterests.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({
        error: "myInterests document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted myInterests Successfully" });
    }
  });
});
// End deletemyInterestsById

module.exports = router;
