let express = require("express");
let router = express.Router();
let ActivityLogTypesController = require("./activityLogTypesController");
let multer = require("multer");
// Image Settings for banners
let activityLogTypeBanner = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/activityLogIcon");
    },
    filename: function (req, file, cb) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
    }
});

let uploadActivityLogTypeIcon = multer({
    storage: activityLogTypeBanner
});

router.post("/createActivityLogType",uploadActivityLogTypeIcon.any(),ActivityLogTypesController.createActivityLogType);

router.put("/editActivityLogType/:id",uploadActivityLogTypeIcon.any(),ActivityLogTypesController.editActivityLogType);

router.get("/getActivityLogTypebyId/:id",ActivityLogTypesController.getActivityLogTypebyId);

router.get("/getAllActivityLogTypes",ActivityLogTypesController.getAllActivityLogTypes);

router.get("/getActivityLogTypebyName/:name",ActivityLogTypesController.getActivityLogTypebyName)


module.exports = router;
