let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let managerPermissions = require("./managerPermissionsModel");
let ManagerPermissionsMaster = require("../managerPermissionsMaster/managerPermissionsMasterModel");
let CelebManager = require('../CelebManager/celebManagersModel');
const ManagerPermissionServices = require('./managerPermissionsService');

/**
 * Create a managerPermissions item start
 */
const createManagerPermissions = (req, res)=>{
  let managerId = req.body.managerId;
  let celebrityId = req.body.celebrityId;
  let managerPermissionsMasterId = req.body.managerPermissionsMasterId;
  let managerSettingsMasterId = req.body.managerSettingsMasterId;
  let isEnabled = req.body.isEnabled;
  let createdBy = req.body.createdBy;

  let newManagerPermissions = new managerPermissions({
    managerId: managerId,
    celebrityId: celebrityId,
    managerPermissionsMasterId: managerPermissionsMasterId,
    managerSettingsMasterId: managerSettingsMasterId,
    isEnabled: isEnabled,
    createdBy: createdBy,
    permissions:permissions
  });

  managerPermissions.createManagerPermissions(newManagerPermissions,(err, managerPermissions)=>{
    if (err) {
        res.json({
                success:0,
                message: err
        });
    } else {
      res.json({
        success:1,
        message: "managerPermissions saved successfully",
        "manageData": managerPermissions
      });
    }
  });
}


/**
 * Edit a managerPermissions start
 */
const editManagerPermissions = (req, res)=> {

  let reqbody = req.body;
  Object.assign(reqbody,{updatedAt:new Date(),requestFromSubManager:false,requestFromManager:false,requestFromCelebrity:false})
  console.log(reqbody)

  managerPermissions.findByIdAndUpdate(req.params.id, reqbody, { new:true },(err, result)=>{
    if (err) {
        res.json({token:req.headers['x-access-token'],success:0,message:"managerPermissions Not Exists / Send a valid UserID"});
    } else {
      console.log(result)
        CelebManager.findOne({celebrityId:ObjectId(result.celebrityId),managerId:ObjectId(result.managerId)},(err,celebManObj)=>{
          reqbody.requestFromSubManager = false
          reqbody.requestFromManager = false
          reqbody.requestFromCelebrity = false
          if(celebManObj.reportingTo && celebManObj.mainManagerId)
          {
            reqbody.requestFromSubManager = true
          }else if(celebManObj.reportingTo){
            reqbody.requestFromManager = true
          }else{
            reqbody.requestFromCelebrity = true
          }
          console.log(reqbody.requestFromSubManager)
          console.log(reqbody.requestFromManager)
          console.log(reqbody.requestFromCelebrity)
          if(reqbody.requestFromSubManager){
            res.json({token:req.headers['x-access-token'],success:1, message: "Changes saved successfully.",data:result});
            /*
            If request from sub manager means sub manager changing permisiion of sub submanager,so just 
            chnage permission of perticular subsubmanager and done.(because every celebrity only one manager 
            who can change permission of only submanager) 
            */
          }else if(reqbody.requestFromManager)
          {
             ManagerPermissionServices.editPermissionByMainManager(result.celebrityId,result.managerId,celebManObj.reportingTo,result.managerSettingsMasterId,result.managerPermissionsMasterId,(err,result)=>{
                if(err)
                {
                  res.json({token:req.headers['x-access-token'],success:0, message:`${err}` ,data:null});
                }else{
                  res.json({token:req.headers['x-access-token'],success:1, message: "Changes saved successfully.",data:result});
                }
             })       
          }else if(reqbody.requestFromCelebrity){
                   /*
                  Same If request from celebrity means celebrity  changing permisiion of manager who is only one but
                  manager can have submanager so we have to change permission of all manager and its submanager
                  (only if its reqiured so we have write some coondition please go over it down)
                  */
                  // let managerPermissionsId =result.managerSettingsMasterId;
                  // ManagerPermissionsMaster.findOne({_id: managerPermissionsId.toString()},(err,managerSettingsMasterObject)=>{
                  //         if(err)
                  //         {
                  //                 res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again later"+err});
                  //         }
                  //         else{
                  //                 //dont chnage the permission of suspended manager
                  //                 CelebManager.find({"celebrityId":ObjectId(result.celebrityId),reportingTo: { $exists: true},isSuspended:true},{managerId:1},(err,managers)=>{
                  //                         if(err)
                  //                         {
                  //                                 res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again later"+err});
                  //                         }
                  //                         else{
                  //                                 let suspendedManger = managers.map(manager=>{
                  //                                         return ObjectId(manager.managerId)
                  //                                 })
                  //                                 //cuurent manager
                  //                                 suspendedManger.push(ObjectId(result.managerId))
                  //                                 console.log("suspendedManger"+suspendedManger)
                  //                                 console.log(result)
                  //                                 managerPermissions.find({$and:[
                  //                                 {"managerId" :{$nin:suspendedManger}},
                  //                                 {"celebrityId" : ObjectId(result.celebrityId)},
                  //                                 {"managerPermissionsMasterId":ObjectId(result.managerPermissionsMasterId)},
                  //                                 {"managerSettingsMasterId" : {$ne:ObjectId(result.managerSettingsMasterId)}}]
                  //                                 },(err,AllSubManger)=>{
                  //                                         console.log(AllSubManger)
                  //                                         if(err)
                  //                                         {
                  //                                                 res.json({token:req.headers['x-access-token'],success:0,message:"Something went wrong.Please try again later"+err});
                  //                                         }
                  //                                         else if(AllSubManger)
                  //                                         {
                  //                                                 AllSubManger.forEach((subManagerObject)=>{
                  //                                                         // console.log(subManagerObject.managerSettingsMasterId +"*****")
                  //                                                         if(subManagerObject.managerSettingsMasterId && subManagerObject.managerSettingsMasterId.permissionName)
                  //                                                         {
                  //                                                                 if(subManagerObject.managerSettingsMasterId.permissionName=="Off")
                  //                                                                 {
                                                                                  
                  //                                                                 }
                  //                                                                 else if(subManagerObject.managerSettingsMasterId.permissionName=="Full")
                  //                                                                 {
                  //                                                                         //(off && view && edit)
                  //                                                                         if(managerSettingsMasterObject.permissionName === "Off" || managerSettingsMasterObject.permissionName === "View" || 
                  //                                                                         managerSettingsMasterObject.permissionName === "Edit")
                  //                                                                         {
                  //                                                                                 managerPermissions.update({ _id: subManagerObject._id }, 
                  //                                                                                         { $set: { managerSettingsMasterId: ObjectId(result.managerSettingsMasterId) }},(err,Modefied)=>{
                  //                                                                                                 //console.log(Modefied);
                  //                                                                                 });
                  //                                                                         }
                  //                                                                 }
                  //                                                                 else if(subManagerObject.managerSettingsMasterId.permissionName=="Edit")
                  //                                                                 {
                  //                                                                 // (off && view)
                  //                                                                         if(managerSettingsMasterObject.permissionName === "Off" || managerSettingsMasterObject.permissionName === "View")
                  //                                                                         {
                  //                                                                                 managerPermissions.update({ _id: subManagerObject._id }, 
                  //                                                                                         { $set: { managerSettingsMasterId: ObjectId(result.managerSettingsMasterId) }},(err,Modefied)=>{
                  //                                                                                                 //console.log(Modefied);
                  //                                                                                 });
                  //                                                                         }
                  //                                                                 }
                  //                                                                 else if(subManagerObject.managerSettingsMasterId.permissionName=="View")
                  //                                                                 {
                  //                                                                         //off
                  //                                                                         if(managerSettingsMasterObject.permissionName === "Off")
                  //                                                                         {
                  //                                                                                 managerPermissions.update({ _id: subManagerObject._id }, 
                  //                                                                                         { $set: { managerSettingsMasterId: ObjectId(result.managerSettingsMasterId) }},(err,Modefied)=>{
                  //                                                                                                 //console.log(Modefied);
                  //                                                                                 }); 
                  //                                                                         }
                                                                                          
                  //                                                                 }
                                                                                  
                  //                                                         }
                  //                                                 })
                  //                                                 res.json({token:req.headers['x-access-token'],success:1, message: "Changes saved successfully.",data:result});
                  //                                         }
                  //                                 }).populate('managerSettingsMasterId')
                  //                         }
                                          
                  //                 })
                  //         }
                  // })
                  // console.log(result)
                  ManagerPermissionServices.editPermissionByCelebrity(result.celebrityId,result.managerId,result.managerSettingsMasterId,result.managerPermissionsMasterId,(err,result)=>{
                    if(err)
                    {
                      res.json({token:req.headers['x-access-token'],success:0, message:`${err}` ,data:null});
                    }else{
                      res.json({token:req.headers['x-access-token'],success:1, message: "Changes saved successfully.",data:result});
                    }
                 })
            }else{
                    res.json({token:req.headers['x-access-token'],success:1, message: "Changes saved successfully.",data:result});
            }
        })
    }
  });
}


/**
 * Find by managerPermissionsId start
 */
const findManagerPermissionsId = (req, res)=>{
  let id = req.params.managerPermissionsId;

  managerPermissions.getManagerPermissionsById(id,(err, result)=> {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "managerPermissions document Not Exists / Send a valid ID"
      });
    }
  });
}

/**
 * Start Find by getManagerPermissionsByCreatedBy
 */
const getManagerPermissionsByCreatedBy = (req, res)=>{
  let id = req.params.CreatedBy;

  managerPermissions.getByCreatedBy(id,(err, result)=>{
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "managerPermissions transaction document Not Exists / Send a valid ID"
      });
    }
  });
}

/**
 * Start getAll
 */
const getAll = (req, res)=> {
  managerPermissions.find({},(err, result)=> {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  }).sort({ createdAt: -1 });
}


/**
 * End of Get Feed Comments by FeedID
 */
const getManagerPermissionsByCreatedBy1 = (req, res)=>{
  let createdBy = ObjectId(req.params.createdBy);
  managerPermissions.aggregate(
    [
      // {
      //   $match: {createdBy:createdBy}
      // },
      {$project:{str:{$toString:"$_id"}}},
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "str",
          as: "memberProfile"
        }
      },
      {
        $project: {
          _id: 1,
          source: 1,
          created_at: 1,
          "memberProfile._id": 1,
          "memberProfile.email": 1,
          "memberProfile.firstName": 1,
          "memberProfile.lastName": 1,
          "memberProfile.aboutMe": 1,
          "memberProfile.isCeleb": 1,
          "memberProfile.profession": 1,
          "memberProfile.avtar_imgPath": 1
        }
      }
    ],(err, result)=>{
      if (err) {
        res.send(err);
      }
      else{
        res.send(result)
      }
    });
}


/**
 * deletemanagerPermissionsById start
 */
const deleteManagerPermissionsById = (req, res, next)=>{
  let id = req.params.id;

  managerPermissions.findByIdAndRemove(id,(err, post)=>{
    if (err) {
      res.json({
        error: "managerPermissions document Not Exists / Send a valid ID"
      });
    } else {
      res.json({ message: "Deleted managerPermissions Successfully" });
    }
  });
}

module.exports = {
    createManagerPermissions:createManagerPermissions,
    editManagerPermissions:editManagerPermissions,
    findManagerPermissionsId:findManagerPermissionsId,
    getAll:getAll,
    getManagerPermissionsByCreatedBy:getManagerPermissionsByCreatedBy,
    getManagerPermissionsByCreatedBy1:getManagerPermissionsByCreatedBy1,
    deleteManagerPermissionsById:deleteManagerPermissionsById
};
