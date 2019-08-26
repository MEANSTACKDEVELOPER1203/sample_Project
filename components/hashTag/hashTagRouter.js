let express = require("express");
let router = express.Router();
let HashTagController = require("./hashTagController");

router.post("/createHashTag",HashTagController.createHashTag);

router.put("/editHashTag/:id",HashTagController.editHashTag);

router.get("/getHashTagsbyId/:hashTagId",HashTagController.getHashTagsbyId);

router.get("/getHashTagsbyMemberId/:memberId",HashTagController.getHashTagsbyMemberId);

router.get("/getAllHashTag",HashTagController.getAllHashTag);


module.exports = router;
