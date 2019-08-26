let express = require("express");
let router = express.Router();
let SearchHistoryController = require("./searchHistoryController");

router.post("/saveSearchHistory",SearchHistoryController.saveSearchHistory);

router.put("/editSearchHistoryByMemberId/:memberId",SearchHistoryController.editSearchHistoryByMemberId);

router.put("/editSearchHistoryById/:id",SearchHistoryController.editSearchHistoryById);

router.get("/getSearchHistoryByMemberId/:memberId/:createdAt/:limit",SearchHistoryController.getSearchHistoryByMemberId);

router.get("/getAllSearchHistoryByMemberId/:memberId/:createdAt/:limit",SearchHistoryController.getAllSearchHistoryByMemberId);

router.delete("/clearAllSearchHistory/:memberId",SearchHistoryController.clearAllSearchHistory);

router.delete("/deleteSearchHistoryByCelebrityId/:memberId/:celebrityId",SearchHistoryController.deleteSearchHistoryByCelebrityId);

module.exports = router;
