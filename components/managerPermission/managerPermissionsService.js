const ManagerPermissions = require("./managerPermissionsModel");
const CelebManager = require('../CelebManager/celebManagersModel');
let ObjectId = require("mongodb").ObjectID;

/**
 * In celebKonect database "managerpermissionsmasters" static collections having 
 * below data
 */
const ManagerPermissionMaster = {
    view : ObjectId("5b97b6ff35aa150522f81c56"),
    edit : ObjectId("5b97b70835aa150522f81c57"),
    full : ObjectId("5b97b71035aa150522f81c58"),
    off : ObjectId("5ba21fe8fb9a3a1c3c375548")
}

/**
 * conditon
 * 1. if celebrity give full permission to manager,then no need to change anything
 * 2. if celebrity give edit permission to manager,then all manager must have edit if they have full or 
 * else no need to change
 * 3. if celebrity give view permission to manager, then all manager must have view permission if they have 
 * edit or full or else no need to change
 * 4. if celebrity give off permission to manager,then all manager must have off permission if they have 
 * any other permission
 */

/**
 * to change permission of manager
 * @param {*} celebrityId  
 * @param {*} managerId 
 * @param {*} givenPermission 
 * @param {*} callback 
 */
const editPermissionByCelebrity = (celebrityId,managerId,givenPermission,forSetting,callback)=>{
    celebrityId = ObjectId(celebrityId);
    managerId = ObjectId(managerId);
    givenPermission = ObjectId(givenPermission);
    forSetting = ObjectId(forSetting);
    console.log(managerId+"")
    console.log(givenPermission+"")
    CelebManager.find({celebrityId : celebrityId,managerId:{$ne:managerId},$or:[{reportingTo:managerId},{mainManagerId:managerId}],isSuspended:false},{managerId:1},(err,allManager)=>{
        if(err)
        {
            callback(err,null)
        }
        else{
            allManager = allManager.map(manager=>{
                return ObjectId(manager.managerId)
            })
            console.log(allManager)
            if(givenPermission+"" == ManagerPermissionMaster.full+"" )
            {
                callback(null,"full Permission")
            }
            else if(givenPermission+""  == ManagerPermissionMaster.edit+"" )
            {
                ManagerPermissions.updateMany({
                    celebrityId:celebrityId,
                    managerId :{$in:allManager},
                    managerPermissionsMasterId:forSetting,
                    managerSettingsMasterId:ManagerPermissionMaster.full
                },{
                    $set:{
                        managerSettingsMasterId:givenPermission
                    }
                },(err,updated)=>{
                    if(err)
                    {

                    }
                    else{
                        console.log(updated)
                        callback(null,updated)
                    }
                })
            }
            else if(givenPermission+""  == ManagerPermissionMaster.view+"")
            {
                ManagerPermissions.updateMany({
                    celebrityId:celebrityId,
                    managerId :{$in:allManager},
                    managerPermissionsMasterId:forSetting,
                    $or:[{managerSettingsMasterId:ManagerPermissionMaster.full},
                        {managerSettingsMasterId:ManagerPermissionMaster.edit}]
                },{
                    $set:{
                        managerSettingsMasterId:givenPermission
                    }
                },(err,updated)=>{
                    if(err)
                    {

                    }
                    else{
                        console.log(updated)
                        callback(null,updated)
                    }
                })
            }
            else if(givenPermission+""  == ManagerPermissionMaster.off+"" )
            {
                ManagerPermissions.updateMany({
                    celebrityId:celebrityId,
                    managerId :{$in:allManager},
                    managerPermissionsMasterId:forSetting,
                    $or:[{managerSettingsMasterId:ManagerPermissionMaster.full},
                        {managerSettingsMasterId:ManagerPermissionMaster.edit},
                        {managerSettingsMasterId:ManagerPermissionMaster.view}]
                },{
                    $set:{
                        managerSettingsMasterId:givenPermission
                    }
                },(err,updated)=>{
                    if(err)
                    {

                    }
                    else{
                        // console.log(updated)
                        callback(null,updated)
                    }
                })
            }
            else{
                callback(null,null)
            }
        }
    })
}



/**
 * conditon
 * 1. if main manager give full permission to sub manager,then no need to change anything
 * 2. if main manager give edit permission to sub manager,then all sub sub manager must have edit if they have full or 
 * else no need to change
 * 3. if main manager give view permission to sub manager, then all sub sub manager must have view permission if they have 
 * edit or full or else no need to change
 * 4. if main manager give off permission to sub manager,then all sub sub manager must have off permission if they have 
 * any other permission
 */

/**
 * to change permission of sub manager
 * @param {*} celebrityId  
 * @param {*} managerId 
 * @param {*} givenPermission 
 * @param {*} callback 
 */
const editPermissionByMainManager = (celebrityId,managerId,reportingTo,givenPermission,forSetting,callback)=>{
    celebrityId = ObjectId(celebrityId);
    managerId = ObjectId(managerId);
    reportingTo = ObjectId(reportingTo);
    givenPermission = ObjectId(givenPermission);
    forSetting = ObjectId(forSetting);
    CelebManager.find({celebrityId : celebrityId,managerId:{$ne:managerId},$or:[{reportingTo:reportingTo},{mainManagerId:reportingTo}],isSuspended:false},{managerId:1},(err,allManager)=>{
        if(err)
        {
            callback(err,null)
        }
        else{
            allManager = allManager.map(manager=>{
                return ObjectId(manager.managerId)
            })
            if(givenPermission == ManagerPermissionMaster.full)
            {
                callback(null,"full Permission")
            }
            else if(givenPermission+"" == ManagerPermissionMaster.edit+"")
            {
                ManagerPermissions.updateMany({
                    celebrityId:celebrityId,
                    managerId :{$in:allManager},
                    managerSettingsMasterId:ManagerPermissionMaster.full,
                    managerPermissionsMasterId:forSetting
                },{
                    $set:{
                        managerSettingsMasterId:givenPermission
                    }
                },(err,updated)=>{
                    if(err)
                    {

                    }
                    else{
                        callback(null,updated)
                    }
                })
            }
            else if(givenPermission+""== ManagerPermissionMaster.view+"")
            {
                ManagerPermissions.updateMany({
                    celebrityId:celebrityId,
                    managerId :{$in:allManager},
                    managerPermissionsMasterId:forSetting,
                    $or:[{managerSettingsMasterId:ManagerPermissionMaster.full},
                        {managerSettingsMasterId:ManagerPermissionMaster.edit}]
                },{
                    $set:{
                        managerSettingsMasterId:givenPermission
                    }
                },(err,updated)=>{
                    if(err)
                    {

                    }
                    else{
                        callback(null,updated)
                    }
                })
            }
            else if(givenPermission+"" == ManagerPermissionMaster.off+"")
            {
                ManagerPermissions.updateMany({
                    celebrityId:celebrityId,
                    managerPermissionsMasterId:forSetting,
                    managerId :{$in:allManager},
                    $or:[{managerSettingsMasterId:ManagerPermissionMaster.full},
                        {managerSettingsMasterId:ManagerPermissionMaster.edit},
                        {managerSettingsMasterId:ManagerPermissionMaster.view}]
                },{
                    $set:{
                        managerSettingsMasterId:givenPermission
                    }
                },(err,updated)=>{
                    if(err)
                    {

                    }
                    else{
                        callback(null,updated)
                    }
                })
            }
            else{
                callback(null,null)
            }
        }
    })
}


/**
 * conditon
 * if sub manager changing permission of sub sub manger then of course only single manager updated in 
 * hierarchy so no need of checking other manager 
 */

/**
 * to change permission of sub sub manager
 * @param {*} celebrityId  
 * @param {*} managerId 
 * @param {*} givenPermission 
 * @param {*} callback 
 */
const editPermissionBySubManager= (celebrityId,managerId,givenPermission,callback)=>{
   callback(null,"suceess")
}

module.exports = {
    editPermissionByCelebrity : editPermissionByCelebrity,
    editPermissionByMainManager: editPermissionByMainManager,
    editPermissionBySubManager:editPermissionBySubManager
}