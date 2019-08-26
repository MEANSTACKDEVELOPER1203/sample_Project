let express = require("express");
let router = express.Router();
let userController = require('./virtualUsersController');
// chat code start

router.post('/insertManyDummyUser',userController.createDummyUser);
router.post('/insertManyDummyUserLoginDeatils',userController.insertManyDummyUserLoginDeatils);
router.post('/insertManyDummyUserMemberPrefernaces',userController.insertManyDummyUserMemberPrefernaces);
router.post('/insertSingleDummyUser',userController.createSingleDummyUser);
router.get('/getAllDummmyUser',userController.getAllDummmyUser);
router.post('/deleteAllVertualUsers',userController.deleteAllVertualUsers);
// router.post('/setTimeEndOfDate',userController.createTime);

module.exports = router;