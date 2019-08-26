const SearchHistoryService = require("./searchHistoryService");

const saveSearchHistory = (req, res) => {
  SearchHistoryService.saveSearchHistory(req.body, (err, searchHistoryObj) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, data: searchHistoryObj });
    }
  })
}

const editSearchHistoryById = (req, res) => {
  SearchHistoryService.editSearchHistoryById(req.params.id, req.body, (err, updatedSearchHistory) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, data: updatedSearchHistory });
    }
  })
}

const editSearchHistoryByMemberId = (req, res) => {
  SearchHistoryService.editSearchHistoryByMemberId(req.params.id, req.body, (err, updatedSearchHistory) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, data: updatedSearchHistory });
    }
  })
}

const getSearchHistoryByMemberId = (req, res) => {
  SearchHistoryService.getSearchHistoryByMemberId(req.params, (err, allActivityLog) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else if (!allActivityLog || allActivityLog.length <= 0) {
      res.status(200).json({ token: req.headers['x-access-token'], success: 1, data:{"history": []}, message: "records not found" });
    } else {
      res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: allActivityLog });
    }
  })
}

const getAllSearchHistoryByMemberId = (req, res) => {
  SearchHistoryService.getAllSearchHistoryByMemberId(req.params, (err, allActivityLog) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, data: allActivityLog });
    }
  })
}


const clearAllSearchHistory = (req, res) => {
  SearchHistoryService.clearAllSearchHistory(req.params, (err, allActivityLog) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, data: allActivityLog, message: "Records has been successfully deleted" });
    }
  })
}

const deleteSearchHistoryByCelebrityId = (req, res) => {
  SearchHistoryService.deleteSearchHistoryByCelebrityId(req.params, (err, updateHashTag) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    } else {
      res.json({ token: req.headers['x-access-token'], success: 1, data: updateHashTag, message: "Record has been successfully deleted" });
    }
  });
}


module.exports = {
  saveSearchHistory: saveSearchHistory,
  editSearchHistoryByMemberId: editSearchHistoryByMemberId,
  getSearchHistoryByMemberId: getSearchHistoryByMemberId,
  clearAllSearchHistory: clearAllSearchHistory,
  deleteSearchHistoryByCelebrityId: deleteSearchHistoryByCelebrityId,
  getAllSearchHistoryByMemberId: getAllSearchHistoryByMemberId,
  editSearchHistoryById: editSearchHistoryById
};
