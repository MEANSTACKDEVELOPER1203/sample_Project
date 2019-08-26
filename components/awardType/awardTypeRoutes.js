const express = require("express");
const router = express.Router();
const awardTypeController = require('./awardTypeController')

router.post('/createAwardType',awardTypeController.createAwardType)

router.put('/updateAwardType/:awardTypeId',awardTypeController.updateAwardType)

router.get('/getAllAwardType',awardTypeController.getAllAwardType)

router.get('/getAwardTypeById/:awardTypeId',awardTypeController.getAwardTypeById)

module.exports = router;