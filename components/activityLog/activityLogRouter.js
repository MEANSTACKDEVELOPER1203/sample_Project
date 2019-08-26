let express = require("express");
let router = express.Router();
let ActivityLogController = require("./activityLogController");

router.post("/createActivityLog",ActivityLogController.createActivityLog);

router.put("/editActivityLog/:id",ActivityLogController.editActivityLog);

router.put("/deleteActivityLog/:id",ActivityLogController.deleteActivityLog);

router.get("/getActivityLogByMemberId/:memberId/:createdAt/:limit",ActivityLogController.getActivityLogByMemberId);

router.get("/getAllActivityLogByMemberIdAndType/:memberId/:activityLogTypeId/:createdAt/:limit",ActivityLogController.getAllActivityLogByMemberIdAndType);


module.exports = router;
