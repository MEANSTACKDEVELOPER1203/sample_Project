let ObjectId = require("mongodb").ObjectID;
const ManagerPermissionsMasterService = require('./managerPermissionsMasterService');

/**
 * Create a managerPermissionsMaster item start
 */
const createManagerPermissionsMaster = (req, res)=> {
  ManagerPermissionsMasterService.createManagerPermissionsMaster(req.body,(err,newManagerPermissionsMaster)=>{
    if (err) {
        res.json({
            success:0,
            message: "managerPermissionsMaster saved successfully"+err
          });
    } else {
      res.json({
        success:1,
        message: "managerPermissionsMaster saved successfully",
        "manageData": newManagerPermissionsMaster
      });
    }
  })
}

/**
 * Edit a managerPermissionsMaster start 
 */
const editManagerPermissionsMaster = (req, res)=>{
  ManagerPermissionsMasterService.editManagerPermissionsMaster(req.params.id,req.body,(err,result)=>{
    if (err) {
      res.json({
        success:0,
        message: "managerPermissionsMaster Not Exists / Send a valid UserID "+err
      });
    } else {
      res.json({ success:1,message: "Updated Successfully" });
    }
  });
}

/**
 * Find by managerPermissionsMasterId start 
 */
const findManagerPermissionsMasterId = (req, res)=>{
  let id = req.params.managerPermissionsMasterId;
  ManagerPermissionsMasterService.findManagerPermissionsMasterId(id,(err, result)=> {
    if (err) {
        res.json({
            success:1,
            message: "managerPermissionsMaster document Not Exists / Send a valid ID "+err
        });
    } else {
        res.json({
            success:1,
            message: result
        });
    }
  })
}

/**
 * getAll start 
 */
const getAll = (req, res) =>{
  ManagerPermissionsMasterService.getAll((err,result)=>{
    if (err) {
      res.json({success:0,token:req.headers['x-access-token'],success:0,message:"No data found! "+err});
    } else {
        res.json({success:1,token:req.headers['x-access-token'],success:1,data:result});
    }
  })
}

/**
 * deletemanagerPermissionsMasterById start 
 * */
const deleteManagerPermissionsMasterById = (req, res, next)=> {
  let id = req.params.id;
  ManagerPermissionsMasterService.deleteManagerPermissionsMasterById(id,(err,result)=>{
    if (err) {
      res.json({
        success:0,
        message: "managerPermissionsMaster document Not Exists / Send a valid ID "+err
      });
    } else {
      res.json({success:1,message: "Deleted managerPermissionsMaster Successfully" });
    }
  })
}

module.exports = {
    createManagerPermissionsMaster:createManagerPermissionsMaster,
    editManagerPermissionsMaster:editManagerPermissionsMaster,
    findManagerPermissionsMasterId:findManagerPermissionsMasterId,
    getAll:getAll,
    deleteManagerPermissionsMasterById:deleteManagerPermissionsMasterById
};
