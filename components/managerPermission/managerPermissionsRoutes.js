let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let managerPermissions = require("./managerPermissionsModel");
let ManagerPermissionsMaster = require("../managerPermissionsMaster/managerPermissionsMasterModel");
let CelebManager = require('../CelebManager/celebManagersModel');
const ManagerPermissionServices = require('./managerPermissionsService');
const ManagerPermissionsController = require('./managerPermissionsController')

/**
 * Create a managerPermissions item start
 */
router.post("/createManagerPermissions",ManagerPermissionsController.createManagerPermissions);


/**
 * Edit a managerPermissions start
 */
router.put("/editManagerPermissions/:id",ManagerPermissionsController.editManagerPermissions);


/**
 * Find by managerPermissionsId start
 */
router.get("/findManagerPermissionsId/:managerPermissionsId",ManagerPermissionsController.findManagerPermissionsId);

/**
 * Start Find by getManagerPermissionsByCreatedBy
 */
router.get("/getManagerPermissionsByCreatedBy/:CreatedBy",ManagerPermissionsController.getManagerPermissionsByCreatedBy);

/**
 * Start getAll
 */
router.get("/getAll",ManagerPermissionsController.getAll);


/**
 * End of Get Feed Comments by FeedID
 */
router.get("/getManagerPermissionsByCreatedBy1/:createdBy",ManagerPermissionsController.getManagerPermissionsByCreatedBy1);


/**
 * deletemanagerPermissionsById start
 */
router.delete("/deleteManagerPermissionsById/:id",ManagerPermissionsController.deleteManagerPermissionsById);

module.exports = router;
