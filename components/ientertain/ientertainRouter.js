let express = require('express');
let router = express.Router();
let multer = require('multer');
let ientertainController = require('./ientertainController');

// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/ientertain");
    },
    filename: function (req, file, cb) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        cb(null, "ck" + "_" + date + "_" + Date.now() + "_" + file.originalname);
    }
});

let upload = multer({
    storage: storage
});

//desc create slider/reaction video and more. this for ientertain static web site.
//method POST
//Access private
router.post('/createIentertain', upload.any(), ientertainController.createIentertainData);
//desc get ientertain by category
//method GET
//access public
router.get('/getIentertainByCategory/:category', ientertainController.getIentertainByCategory);
//desc get ientertain by ID
//method GET
//access public
router.get('/getIentertainById/:ientertain_Id', ientertainController.getIentertainById)
//desc Edit Ientertain
//methos PUT
//access public
router.put('/editIentertain/:entertain_Id', ientertainController.editIentertain);

//desc delete data
//method DELETE
//access private
router.delete('/deleteIentertainById/:id', ientertainController.deleteIentertainById)

module.exports = router;