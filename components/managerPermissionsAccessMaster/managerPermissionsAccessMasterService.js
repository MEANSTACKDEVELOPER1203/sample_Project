const ManagerPermissions = require("../managerPermission/managerPermissionsModel");
const ManagerPermissionsMaster = require("../managerPermissionsMaster/managerPermissionsMasterModel");
const ManagerPermissionsAccessMaster = require("../managerPermissionsAccessMaster/managerPermissionsAccessMasterModel");
const ObjectId = require("mongodb").ObjectID;

var getManagerPermission = (celebrityId,managerId,callBack)=>{
    ManagerPermissions.aggregate([
        {
            $match:{managerId: managerId,celebrityId: celebrityId}
        },
        {
          $lookup: {
            from: "managerpermissionsaccessmasters",
            localField: "managerPermissionsMasterId",
            foreignField: "_id",
            as: "managerPermissionsMasterId"
          }
        },
        {
          $lookup: {
            from: "managerpermissionsmasters",
            localField: "managerSettingsMasterId",
            foreignField: "_id",
            as: "managerSettingsMasterId"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "managerId",
            foreignField: "_id",
            as: "managerProfile" // to get all the views, comments, shares count
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "celebrityId",
            foreignField: "_id",
            as: "celebrityProfile" // to get all the views, comments, shares count
          }
        },
        {
          $unwind:"$managerProfile"
        },
        {
          $unwind:"$celebrityProfile"
        },
        {
          $unwind:"$managerPermissionsMasterId"
        },
        {
          $unwind:"$managerSettingsMasterId"
        },
        {
          $group:{
            _id:{
              managerProfile: "$managerProfile",
              celebrityProfile: "$celebrityProfile",
            },
            managerSetting: { $push: "$$ROOT" }
          }
        },
        {
          $project:{
            "_id": {
                "managerProfile": {
                    "_id": 1,
                    "avtar_imgPath": 1,
                    "avtar_originalname": 1,
                    "firstName": 1,
                    "lastName": 1,
                    "prefix": 1,
                    "aboutMe": 1,
                    "location": 1,
                    "country": 1,
                    "profession": 1,
                    "industry": 1,
                    "status": 1,
                    "isCeleb": 1,
                    "isOnline": 1,
                    "IsDeleted": 1,
                    "isManager": 1,
                    "email": "uday.vurukonda@gmail.com",
                    "username": "uday.vurukonda",
                    "experience": 3
                },
                "celebrityProfile": {
                    "_id": 1,
                    "avtar_imgPath": 1,
                    "avtar_originalname": 1,
                    "firstName": 1,
                    "lastName": 1,
                    "prefix": 1,
                    "aboutMe": 1,
                    "location": 1,
                    "country": 1,
                    "profession": 1,
                    "industry": 1,
                    "status": 1,
                    "isCeleb": 1,
                    "isOnline": 1,
                    "IsDeleted": 1,
                    "isManager": 1,
                    "email": "uday.vurukonda@gmail.com",
                    "username": "uday.vurukonda",
                    "experience": 3
                }
              },
            "managerSetting._id": 1,
            "managerSetting.isEnabled": 1,
            "managerSetting.managerPermissionsMasterId": {
              "_id": 1,
              "settingName": 1,
            },
            "managerSetting.managerSettingsMasterId": {
              "_id": 1,
              "permissionName": 1,
            }
          }
        }
      ],(err,managerPermission)=>{
        if(err) 
        {
            callBack(err,null)
        }
        else if(managerPermission.length){
            var managerPermissionObject = {
                managerProfile:managerPermission[0]._id.managerProfile,
                celebrityProfile:managerPermission[0]._id.celebrityProfile,
                managerPermissions:managerPermission[0].managerSetting
            }
            callBack(null,managerPermissionObject)
        }
        else{
            var managerPermissionObject = {
                managerProfile:null,
                celebrityProfile:null,
                managerPermissions:null,
                message:"Noit found"
            }
            callBack(null,null)
        }
      })
}

var createManagerPermission = (celebrityId,managerId,callBack)=>{
  ManagerPermissions.find({celebrityId:celebrityId,managerId:managerId},(err,permission)=>{
    if (err) 
    {
        res.json({token:req.headers['x-access-token'],success:0,message:err});
    }
    else if(permission.length == 13){
      callBack(null,permission)
    }
    else{
      ManagerPermissionsMaster.findOne({ permissionName: "Full" },{_id:1},(err,managerSettingsMaster)=>{
        if (err) 
        {
            res.json({token:req.headers['x-access-token'],success:0,message:err});
        }
        else if(managerSettingsMaster){
            let managerSettingsMasterId = managerSettingsMaster._id;
            /// Get Manager Permissions Access Master List
            ManagerPermissionsAccessMaster.find({},{_id:1},(err, managerPermissions)=>{
                if (err) 
                {
                    res.json({token:req.headers['x-access-token'],success:0,message:err});
                }
                if(managerPermissions) {
                    let permissions = managerPermissions.map((permissionObject)=>{
                        let permissionObj =  {
                            managerId: managerId,
                            celebrityId: celebrityId,
                            managerPermissionsMasterId: permissionObject._id,
                            managerSettingsMasterId: managerSettingsMasterId,
                            createdBy : 'Default'
                        }
                        if(permissionObject._id+"" == "5b97b62a35aa150522f81c53"){
                            permissionObj.managerSettingsMasterId = "5ba21fe8fb9a3a1c3c375548"
                        }
                        return permissionObj;
                    });
                    ManagerPermissions.insertMany(permissions,(err,newManagerPermission)=>{
                        if (err)
                        {
                            callBack(err,null)
                        }
                        else
                        {
                            callBack(null,newManagerPermission)
                        }
                    });
                }
            })
        }
      });
    }
  })
}

var createPermissionForSubManager = (celebrityId,managerId,reportingTo,callBack)=>{
    ManagerPermissions.find({ managerId: reportingTo ,celebrityId: celebrityId },{_id:0},(err,allMainManagerPermission)=>{
        if(err)
        {
            callBack(err,null)
        }
        else if(allMainManagerPermission.length){
          ManagerPermissions.find({ managerId: managerId ,celebrityId: celebrityId },{_id:0},(err,allSubManagerPermission)=>{
            if(err)
            {
                callBack(err,null)
            }
            else if(allSubManagerPermission.length){
              ManagerPermissions.remove({ managerId: managerId ,celebrityId: celebrityId },(err,subManagerPermission)=>{
                  if(err){
                    callBack(err,null)
                  }else{
                    let permissions = allMainManagerPermission.map((mainManagerPermission)=>{
                      mainManagerPermission.managerId = managerId
                      mainManagerPermission.updatedBy = managerId
                      if(mainManagerPermission.managerPermissionsMasterId+"" == "5b97b62a35aa150522f81c53"){
                        mainManagerPermission.managerSettingsMasterId = "5ba21fe8fb9a3a1c3c375548"
                      }
                      return mainManagerPermission;
                    })
                    ManagerPermissions.insertMany(permissions,(err,newManagerPermission)=>{
                        if (err)
                        {
                            callBack(err,null)
                        }
                        else
                        {
                            callBack(null,newManagerPermission)
                        }
                    });
                  }
              })
            }else{
              let permissions = allMainManagerPermission.map((mainManagerPermission)=>{
                mainManagerPermission.managerId = managerId
                mainManagerPermission.updatedBy = managerId
                if(mainManagerPermission.managerPermissionsMasterId+"" == "5b97b62a35aa150522f81c53"){
                  mainManagerPermission.managerSettingsMasterId = "5ba21fe8fb9a3a1c3c375548"
                }
                return mainManagerPermission;
              })
              ManagerPermissions.insertMany(permissions,(err,newManagerPermission)=>{
                  if (err)
                  {
                      callBack(err,null)
                  }
                  else
                  {
                      callBack(null,newManagerPermission)
                  }
              });
            }
          });
        }else{
          callBack("No permssion Provide to parent Manager",null)
        }
    }).lean()
}

const updateManagerPermission = (celebrityId,managerId,callBack)=>{
  ManagerPermissions.find({ managerId: managerId ,celebrityId: celebrityId },{_id:0},(err,allMainManagerPermission)=>{
      if(err)
      {
          callBack(err,null)
      }
      else if(allMainManagerPermission.length){
        ManagerPermissions.updateMany({ celebrityId: celebrityId,managerId:managerId,managerPermissionsMasterId:{$ne:ObjectId("5b97b62a35aa150522f81c53")}},{$set:{
          managerSettingsMasterId:"5b97b71035aa150522f81c58"
          }},(err,updateOldPermission)=>{
              if(err)
              {
                callBack(err,null)
              }
              else if(updateOldPermission){
                ManagerPermissions.updateOne({ celebrityId: celebrityId,managerId:managerId,managerPermissionsMasterId:ObjectId("5b97b62a35aa150522f81c53")},{$set:{
                  managerSettingsMasterId:"5ba21fe8fb9a3a1c3c375548"
                  }},(err,updateOldPermission)=>{
                      if(err)
                      {
                        callBack(err,null)
                      }
                      else if(updateOldPermission){
                        callBack(null,updateOldPermission)
                      }
                  });
              }
          });
      }else{
        createManagerPermission(celebrityId,managerId,(err,mainManagerPermission)=>{
          if(err){
            callBack(err,null)
          }else if(mainManagerPermission){
            callBack(null,mainManagerPermission)
          }
        })
      }
  }).lean()
}

module.exports ={
    getManagerPermission : getManagerPermission,
    createManagerPermission:createManagerPermission,
    createPermissionForSubManager:createPermissionForSubManager,
    updateManagerPermission:updateManagerPermission
}