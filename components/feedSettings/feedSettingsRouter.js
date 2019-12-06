let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let feedSetting = require("./feedSettingsModel");

// setMemberPreferences for a User
router.post("/setFeedSettings", function (req, res) {
  let memberId = ObjectId(req.body.memberId);
  let celebId = ObjectId(req.body.celebId);
  let feedId = ObjectId(req.body.feedId);
  let isEnabled = req.body.isEnabled;

  let reqbody = req.body;
  reqbody.updatedAt = new Date;

  let newRecord = new feedSetting({
    memberId: memberId,
    celebId: celebId,
    feedId:feedId,
    isEnabled: isEnabled
  });

  //"feedSettingId":"5b5eb5939bde9e21d8faeb72",
  // console.log(req.body);
  let query = { $and: [{ memberId: memberId },{celebId: celebId}] };
  //let query = { memberId: memberId, feedSettingId: feedSettingId};
  
  feedSetting.find(query, function (err, result) {
    if (err) return res.json({token:req.headers['x-access-token'],success:0,message:err});
    else if (result.length > 0) {
      //console.log(result);
      //console.log(result[0].memberId);
      nId = result[0].memberId;
      let query = { $and: [{ memberId: nId },{celebId: celebId}] };
      feedSetting.updateOne(query, reqbody, {new:true}, function (err, ns) {
        if (err) return res.send(err);
        res.json({token:req.headers['x-access-token'],success:1,message: "Changes saved successfully"});
      });
    }
    else if (result.length <= 0) {
      feedSetting.createNewRecord(newRecord, function (err, user) {
        if (err) {
          res.json({token:req.headers['x-access-token'],success:0,message:err});
        } else {
          res.json({token:req.headers['x-access-token'],success:1,message: "Changes saved successfully"});
        }
      })
    }
  });




});
// End of setMemberPreferences for a User



module.exports = router;
