let express = require("express");
let router = express.Router();
let manamanagerPermissionsMasterController = require('./managerPermissionsMasterController');

// Create a managerPermissionsMaster item start
router.post("/createManagerPermissionsMaster",manamanagerPermissionsMasterController.createManagerPermissionsMaster);

// Edit a managerPermissionsMaster start
router.put("/editManagerPermissionsMaster/:id", manamanagerPermissionsMasterController.editManagerPermissionsMaster);

// Find by managerPermissionsMasterId start
router.get("/findManagerPermissionsMasterId/:managerPermissionsMasterId",manamanagerPermissionsMasterController.findManagerPermissionsMasterId);

// getAll start
router.get("/getAll",manamanagerPermissionsMasterController.getAll);

// deletemanagerPermissionsMasterById start
router.delete("/deleteManagerPermissionsMasterById/:id",manamanagerPermissionsMasterController.deleteManagerPermissionsMasterById);

module.exports = router;
