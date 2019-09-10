const express = require("express");
const router = express.Router();
const reportController = require('./reportController')

router.post('/createReport',reportController.createReport)

//router.put('/updateAwardType/:awardTypeId',awardTypeController.updateAwardType)

router.get('/getAllReport',reportController.getAllReport)

//router.get('/getAwardTypeById/:awardTypeId',awardTypeController.getAwardTypeById)

module.exports = router;