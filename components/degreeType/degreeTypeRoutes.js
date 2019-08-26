const express = require("express");
const router = express.Router();
const degreeTypeController = require('./degreeTypeController')

router.post('/createDegreeType',degreeTypeController.createDegreeType)

router.put('/updateDegreeType/:degreeTypeId',degreeTypeController.updateDegreeType)

router.get('/getAllDegreeType',degreeTypeController.getAllDegreeType)

router.get('/getDegreeTypeById/:degreeTypeId',degreeTypeController.getDegreeTypeById)

module.exports = router;