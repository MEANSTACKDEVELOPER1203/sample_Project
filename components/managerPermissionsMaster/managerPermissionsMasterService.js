let ObjectId = require("mongodb").ObjectID;
let ManagerPermissionsMaster = require("../managerPermissionsMaster/managerPermissionsMasterModel");


/**Create a managerPermissionsMaster item start*/
/**
 * 
 * @param {*} managerPermissionMasterObj 
 * @param {*} callback 
 */
const createManagerPermissionsMaster = (managerPermissionMasterObj, callback)=> {
  //let permissionId = managerPermissionMasterObj.permissionId;
  let permissionName = managerPermissionMasterObj.permissionName;
  //let access = managerPermissionMasterObj.access;
  let createdBy = managerPermissionMasterObj.createdBy;

  let newManagerPermissionsMaster = new managerPermissionsMaster({
    //permissionId: permissionId,
    permissionName: permissionName,
    //access: access,
    createdBy: createdBy
  });

  ManagerPermissionsMaster.createManagerPermissionsMaster(newManagerPermissionsMaster,(err, newManagerPermissionsMaster)=>{
    if (err) {
      callback(err,null)
    } else {
      callback(null,newManagerPermissionsMaster)
    }
  });
}

/**Edit a managerPermissionsMaster start */
/**
 * 
 * @param {*} managerPermissionMasterObjId 
 * @param {*} managerPermissionMasterObj 
 * @param {*} callback 
 */
const editManagerPermissionsMaster = (managerPermissionMasterObjId,managerPermissionMasterObj,callback)=>{

  let reqbody = managerPermissionMasterObj;
  reqbody.updatedBy = managerPermissionMasterObj.updatedBy;
  reqbody.updatedAt = new Date();

  ManagerPermissionsMaster.findByIdAndUpdate(managerPermissionMasterObjId, reqbody,(err, result)=> {
    if (err) {
      callback(err,null)
    } else {
      callback(null,result)
    }
  });
}

/**Find by managerPermissionsMasterId start */
/**
 * 
 * @param {*} managerPermissionMasterObjId 
 * @param {*} callback 
 */
const findManagerPermissionsMasterId = (managerPermissionMasterObjId,callback)=>{
  let id = managerPermissionMasterObjId;

  ManagerPermissionsMaster.getManagerPermissionsMasterById(id,(err, result)=> {
    if (err) {
      callback(err,null)
    } else {
      callback(null,result)
    }
  });
}


/**getAll start */
/**
 * 
 * @param {*} callback 
 */
const getAll = (callback) =>{
  ManagerPermissionsMaster.find({},(err, result)=> {
    if (err) {
      callback(err,null)
    } else {
      callback(null,result)
    }
  }).sort({createdAt:-1});
}


/**deletemanagerPermissionsMasterById start */
/**
 * 
 * @param {*} managerPermissionMasterObjId 
 * @param {*} callback 
 */
const deleteManagerPermissionsMasterById = (managerPermissionMasterObjId,callback)=> {
  let id = req.params.id;

  ManagerPermissionsMaster.findByIdAndRemove(id, (err, deletedObj) =>{
    if (err) {
      callback(err,null)
    } else {
      callback(null,deletedObj)
    }
  });
}

module.exports = {
    createManagerPermissionsMaster:createManagerPermissionsMaster,
    editManagerPermissionsMaster:editManagerPermissionsMaster,
    findManagerPermissionsMasterId:findManagerPermissionsMasterId,
    getAll:getAll,
    deleteManagerPermissionsMasterById:deleteManagerPermissionsMasterById
};
