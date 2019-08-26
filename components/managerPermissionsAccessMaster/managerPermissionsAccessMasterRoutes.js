let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
var async = require("async");
const CelebManagerService = require('../CelebManager/celebManagerService');
let managerPermissionsAccessMaster = require("../managerPermissionsAccessMaster/managerPermissionsAccessMasterModel");
let managerPermissions = require("../managerPermission/managerPermissionsModel");
const ManagerPermissionsAccessMasterController = require('./managerPermissionsAccessMasterController');
let managerPermissionsMaster = require("../managerPermissionsMaster/managerPermissionsMasterModel");
let celebManager = require('../CelebManager/celebManagersModel');

// Create a managerPermissionsAccessMaster item start
router.post("/createManagerPermissionsAccessMaster",ManagerPermissionsAccessMasterController.createManagerPermissionsAccessMaster);
// End Create a managerPermissionsAccessMaster item

// Edit a managerPermissionsAccessMaster start

router.put("/editManagerPermissionsAccessMaster/:id",ManagerPermissionsAccessMasterController.editManagerPermissionsAccessMaster);
// End Edit a managerPermissionsAccessMaster

// Find by managerPermissionsAccessMasterId start

router.get("/findManagerPermissionsAccessMasterId/:managerPermissionsAccessMasterId",ManagerPermissionsAccessMasterController.findManagerPermissionsAccessMasterId);
// End Find by managerPermissionsAccessMasterId


// getAll start
router.get("/getAll",ManagerPermissionsAccessMasterController.getAll);
// End getAll

// deletemanagerPermissionsAccessMasterById start
router.delete("/deleteManagerPermissionsAccessMasterById/:id",ManagerPermissionsAccessMasterController.deleteManagerPermissionsAccessMasterById);
// End deletemanagerPermissionsAccessMasterById


//New with reporting to manager login
// CELEBRITY LOGIN : Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
router.get("/getListOfPermissions/:celebrityId/:managerId/:reportingTo",ManagerPermissionsAccessMasterController.getListOfPermissions);
// End of  Get list of Permissions for a Manager granted by Celebrity as User Data
//new End


// CELEBRITY LOGIN : Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
router.get("/celebrity/getListOfPermissions/:celebrityId/:managerId",ManagerPermissionsAccessMasterController.getListOfPermissionscelebrityLoginManager);
// End of  Get list of Permissions for a Manager granted by Celebrity as User Data


//New with reporting to celebrity login
// CELEBRITY LOGIN : Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
router.get("/celebrity/getListOfPermissions/:celebrityId/:managerId/:reportingTo",ManagerPermissionsAccessMasterController.getListOfPermissionsManagerLoginSubManager);
// End of  Get list of Permissions for a Manager granted by Celebrity as User Data
//new End

//New with reporting to manager login
// CELEBRITY LOGIN : Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
router.get("/manager/getListOfPermissions/:celebrityId/:managerId/:reportingTo",ManagerPermissionsAccessMasterController.getListOfPermissionsManagerLoginSubManager);
// End of  Get list of Permissions for a Manager granted by Celebrity as User Data
//new End

// MANAGER LOGIN : Get list of Permissions for a Manager granted by Celebrity with Celebrity Profile as User Data
router.get("/manager/getListOfPermissions/:celebrityId/:managerId",ManagerPermissionsAccessMasterController.getListOfPermissionsManagerLoginManager);
// End of  Get list of Permissions for a Manager granted by Celebrity as User Data

router.get("/getIsAccess/:celebrityId/:managerId",ManagerPermissionsAccessMasterController.getIsAccess);


module.exports = router;
