let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let liveTimeLog = require("./liveTimeLogModel");
let User = require("../users/userModel");

// Create a liveTimeLog
router.post("/create", function (req, res) {
  // console.log("AAAAAZZZZZZZZSSSSSSSSS+++++++++    ========",req.body);
  let memberId = req.body.memberId;
  let liveStatus = req.body.liveStatus;

  let newliveTimeLog = new liveTimeLog({
    memberId: memberId,
    liveStatus: liveStatus
  });

  liveTimeLog.createliveTimeLog(newliveTimeLog, function (err, user) {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {

      // User.updateOne(
      //   {
      //     _id: memberId
      //   },
      //   { liveStatus: req.body.liveStatus },
      //   (err, result)=> {
      //   }
      // );
      if (liveStatus == "online") {
        let body = { isOnline: true, liveStatus: "online" }
        User.findOneAndUpdate({ _id: memberId }, body, { new: true }, (err, result) => {
          //console.log("Online data", result);
          return res.json({ token: req.headers['x-access-token'], success: 1, data: { online: true }, message: "Live status is ON. Members can Chat / Call Now." });
        }
        );
      }
      else if (liveStatus == "offline") {
        let body = { isOnline: false, liveStatus: "offline", callStatus: "false" }
        User.findOneAndUpdate({ _id: memberId }, body, { new: true },
          (err, result) => {
            //console.log("Offline data", result)
            return res.json({ token: req.headers['x-access-token'], success: 1, data: { online: false }, message: "Live status is OFF. Members cannot Chat / Call Now." });
          }
        );
      }
    }
  });
});
// End of Create a liveTimeLog



// Update a liveTimeLog
router.put("/edit/:logID", function (req, res) {
  let reqbody = req.body;
  reqbody.updated_at = new Date;

  liveTimeLog.findById(id, function (err, result) {
    if (result) {
      liveTimeLog.findByIdAndUpdate(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        res.json({ message: "liveTimeLog Updated Successfully" });
      });
    } else {
      res.json({ error: "liveTimeLog not found / Invalid" });
    }
  });
});
// End of Update a liveTimeLog

// getLiveStatus for a user
router.get("/getLiveStatus/:userID", function (req, res) {
  let id = req.params.userID;

  User.findById(id, function (err, result) {
    let currentTime = new Date();
    let callInitiateTime = new Date();

    callInitiateTime.setHours(currentTime.getHours() + 0);
    callInitiateTime.setMinutes(currentTime.getMinutes() + 2);
    if (err) return res.send(err);
    if (result) {
      let data = {};
      data.liveStatus = result.liveStatus;
      data.isOnline = result.isOnline;
      data.currentTime = currentTime;
      data.callInitiateTime = callInitiateTime;
      res.json({ token: req.headers['x-access-token'], success: 1, data: data })
      //res.json({ liveStatus: result.liveStatus, isOnline: result.isOnline, currentTime, callInitiateTime });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Invalid ID sent / record not exist!" });
    }
  });
});
// End of getLiveStatus for a user

// get by Id (liveTimeLog)
router.get("/getLiveTimeLog/:LogID", function (req, res) {
  let id = req.params.comLogID;
  liveTimeLog.getComLogById(id, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get by Id (liveTimeLog)

// Get livetime log for a userID
router.get("/getByUserID/:userID", function (req, res) {
  let id = req.params.userID;
  let query = { memberId: id };
  liveTimeLog.find(query, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Get livetime log for a userID

// get List of livetime log
router.get("/getAll", function (req, res) {

  liveTimeLog.find({}, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End of get List of livetime log

// Delete by LiveTimeLog
router.delete("/delete/:ComLogID", function (req, res, next) {
  let id = req.params.ComLogID;

  liveTimeLog.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      liveTimeLog.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted LiveLog Successfully" });
      });
    } else {
      res.json({ error: "ID not found / Invalid" });
    }
  });

});
// End of Delete by LiveTimeLog

router.post('/updateLiveLogStatus', (req, res) => {
  // console.log("AAAAAZZZZZZZZSSSSSSSSS+++++++++ Update    ========", req.body);
  if (req.body.liveStatus == "online") {
    User.findOneAndUpdate({ _id: ObjectId(req.body.memberId) }, { $set: { liveStatus: "online" } }, { new: true },
      (err, result) => {
        // console.log("Offline data", result)
        return res.json({ message: "online updated sucessfully" });
      })
  }
  else if (req.body.liveStatus == "offline") {
    let body = { liveStatus: "offline" }
    User.findOneAndUpdate({ _id: ObjectId(req.body.memberId) }, { $set: body }, { new: true },
      (err, result) => {
        // console.log("Offline data", result)
        return res.json({ message: "offline updated sucessfully" });
      }
    );
  } else {
    let body = { isOnline: req.body.isOnline }
    User.findOneAndUpdate({ _id: ObjectId(req.body.memberId) }, { $set: body }, { new: true },
      (err, result) => {
        // console.log("Offline data", result)
        return res.json({ message: "User status updated sucessfully" });
      }
    );
  }
})

module.exports = router;
