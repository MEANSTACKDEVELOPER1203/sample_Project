//npm module
const express = require('express');
const router = express.Router();

//controlles
const CelebManagerController = require('./celebManagerController')


/*send request to manager multiple manager not in use*/ 
router.post('/sendRequestToManager',CelebManagerController.sendRequestToManager);

/**
 * CELEBRITY LOGIN Send Request to Manager from Celebrity Profile (use Manager Search API)
 */
router.post('/create/app',CelebManagerController.celebToManagerRequest1);


/**
 * MANAGER LOGIN :: Send Request to Manager from Manager Profile (use Manager Search API)
 */
router.post('/manager/create/app', CelebManagerController.managerToManagerRequest1);
// End of Send Request to Manager from Celebrity Profile (use Manager Search API)

/**
 * Link Celebrity to Manager from Admin Panl
 */
router.post('/create/admin', CelebManagerController.linkCelebAndManagerFromAdmin1);


/**
 * Link Celebrity to Manager
 */
router.post('/celebManagers',CelebManagerController.celebManagers);

/**
 * Find manager by CelebId start
 */
router.get("/findManagersByCelebId/:CelebId", CelebManagerController.findManagerByCelebrity);


/**
 * Get List of managers for celebrity
 */
router.get("/getManagersList/:CelebId", CelebManagerController.getManagerListForCelebrity);

/**
 * Get List of Celebrites for Manager
 */
router.get("/getCelebritiesList/:managerID",CelebManagerController.getCelebrityListForManager );

/**
 * Update a CelebManager Object
 */
router.put("/update/:reqID",CelebManagerController.update);

/**
 * Update a CelebManager Object
 */
router.put("/updateCelebManagerStatus/:reqID",CelebManagerController.updateCelebManagerStatus);
/**
 * CELEBRITY Login : Manager Search from celebrity login
 */
router.post("/managerSearch/:memberId", CelebManagerController.managerSearchWhenCelebrityLogin);


/**
 * MANAGER Login : Manager Search from Manager login
 */
router.post("/manager/managerSearch/:memberId",CelebManagerController.managerSearchWhenManagerLogin);


/**
 * MANAGER Login : Manager Search from Manager login
 */
router.post("/manager/newManagerSearch/:memberId",CelebManagerController.newManagerSearch);


/**
 * Get List of Assistant managers for a Manager under a Celebrity Profile
 */
router.get("/getAssistantManagersList/:managerID/:celebrityID",CelebManagerController.getAssistantManagersListBycelebAndManager);


/**
 * Get List of Assistant managers for a Manager for all Celebrities
 */
router.get("/getAssistantManagersList/:managerID",CelebManagerController.getAssistantManagersListByManagerId);


/**
 * Get Access Permission Status
 */
router.get("/getAccessStatus/:celebrityId/:managerId",CelebManagerController.getAccessStatus);

/**
 * Get Manager Profile
 */
router.get("/getManagerProfile/:managerId",CelebManagerController.getManagerProfileByManagerId);

module.exports = router;