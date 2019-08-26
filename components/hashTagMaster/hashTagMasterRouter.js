let express = require("express");
let router = express.Router();
const HashTagMasterController =  require("./hashTagMasterController");

router.post('/createHashTagMaster',HashTagMasterController.createHashTagMaster)
router.put('/editHashTagMaster/:hashTagMasterId',HashTagMasterController.editHashTagMaster)
router.get('/getHashTagMasterById/:hashTagMasterId',HashTagMasterController.getHashTagMasterById)
router.get('/getAllHashTagMasterByName/:hashTagName/:count/:limit',HashTagMasterController.getAllHashTagMasterByName)
router.get('/getAllHashTagMasterByMemberId/:memberId/:count/:limit',HashTagMasterController.getAllHashTagMasterByMemberId)

module.exports = router;
