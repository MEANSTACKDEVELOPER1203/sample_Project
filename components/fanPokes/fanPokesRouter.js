let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let User = require("../users/userModel");
let fanPoke = require("./fanPokesModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
var cron = require('node-cron');
let logins = require("../loginInfo/loginInfoModel");

// Create a fanPoke
router.post("/createFanPoke", function (req, res) {
  let memberId = req.body.memberId;
  let celebrityId = req.body.celebrityId;
  let createdBy = req.body.createdBy;

  let newFanPoke = new fanPoke({
    memberId: memberId,
    celebrityId: celebrityId,
    createdBy: createdBy
  });

  fanPoke.createFanPoke(newFanPoke, function (err, user) {
    if (err) {
      res.send(err);
    } else {
      res.send({ message: "Poke sent successfully!" });
      // Get Member and Celebrity Profiles Data
      User.findById(celebrityId, function (err, SMresult) {
        User.findById(memberId, function (err, Uresult) {
          if (Uresult == null) {
          } else {
            let id2 = Uresult.email;
            logins.findOne({ email: id2 }, function (err, Lresult) {
              if (Lresult == null) {
              } else {
                let dToken = Lresult.deviceToken

                var message = {
                  to: dToken,
                  collapse_key: 'Service-alerts',

                  notification: {
                    title: 'Poke Alert!!',
                    body: "Hi, this is " + SMresult.firstName + " " + SMresult.lastName + ". I see that you have been my fan for quite sometime," +
                      "would you like to konect with me, for a Video call or chat...",
                  }

                };
                fcm.send(message, function (err, response) {
                  if (err) {
                    console.log(err)
                  } else {
                    // console.log("Successfully sent with resposne :", response);
                  }
                });

              }
            });
          }
        });
      });
      // End of Get Member and Celebrity Data
    }
  });

});
// Enf of Create a fanPoke

// Update a fanPoke
router.put("/edit/:pokeID", function (req, res) {
  let id = req.params.pokeID;

  let reqbody = req.body;
  reqbody.updatedAt = new Date();

  fanPoke.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      fanPoke.findByIdAndUpdate(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        res.json({ message: "fanPoke Updated Successfully" });
      });
    } else {
      res.json({ error: "fanPoke not found / Invalid" });
    }
  });
});
// End of Update a fanPoke

// get fanPokes for a celebrity
router.get("/getFanPokesByCelebrity/:celebrityID", function (req, res) {
  let id = req.params.celebrityID;

  fanPoke.find({ celebrityId: id }, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get fanPokes for a celebrity

// get fanPokes for a member
router.get("/getFanPokesByMember/:memberID", function (req, res) {
  let id = req.params.memberID;

  fanPoke.find({ memberId: id }, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get fanPokes for a member

// get fanPoke Info by Poke ID
router.get("/getFanPokeById/:fanPokeID", function (req, res) {
  let id = req.params.fanPokeID;

  fanPoke.findById(id, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of get fanPoke Info by Poke ID

// get all fan pokes
router.get("/getAll", function (req, res) {
  fanPoke.find({}, function (err, result) {
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
// End of get all fan pokes

// Delete a FanPoke
router.delete("/delete/:fanPokeID", function (req, res, next) {
  let id = req.params.fanPokeID;

  fanPoke.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      fanPoke.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({ message: "fanPoke deleted successfully" });
      });
    } else {
      res.json({ error: "fanPoke not found / Invalid" });
    }
  });
});
// End of Delete a FanPoke

module.exports = router;
