const ManagerPermissionsAccessMasterService = require('./managerPermissionsAccessMasterService');

let ObjectId = require("mongodb").ObjectID;
var async = require("async");
const CelebManagerService = require('../CelebManager/celebManagerService');
let managerPermissionsAccessMaster = require("../managerPermissionsAccessMaster/managerPermissionsAccessMasterModel");
let managerPermissions = require("../managerPermission/managerPermissionsModel");
let managerPermissionsMaster = require("../managerPermissionsMaster/managerPermissionsMasterModel");
let celebManager = require('../CelebManager/celebManagersModel');

// Create a managerPermissionsAccessMaster item start
const createManagerPermissionsAccessMaster = (req, res)=>{
  //let permissionId = req.body.permissionId;
  let settingName = req.body.settingName;
  //let access = req.body.access;
  let createdBy = req.body.createdBy;

  let newManagerPermissionsAccessMaster = new managerPermissionsAccessMaster({
    //permissionId: permissionId,
    settingName: settingName,
    //access: access,
    createdBy: createdBy
  });

  managerPermissionsAccessMaster.createManagerPermissionsAccessMaster(newManagerPermissionsAccessMaster,(err, managerPermissionsAccessMaster)=>{
    if (err) {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    } else {
      res.json({
        success : 1,
        token:req.headers['x-access-token'],
        message: "managerPermissionsAccessMaster saved successfully",
        "data": managerPermissionsAccessMaster
      });
    }
  });
}

// Edit a managerPermissionsAccessMaster start
const editManagerPermissionsAccessMaster = (req, res)=>{

  let reqbody = req.body;
  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  managerPermissionsAccessMaster.findByIdAndUpdate(req.params.id, reqbody,(err, result)=>{
    if (err) {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    } else {
      res.json({
        success :1,
        token:req.headers['x-access-token'],
        message: "Updated Successfully"
      });
    }
  });
}

// Find by managerPermissionsAccessMasterId start
 const findManagerPermissionsAccessMasterId = (req, res)=>{
  let id = req.params.managerPermissionsAccessMasterId;

  managerPermissionsAccessMaster.getManagerPermissionsAccessMasterById(id,(err, result)=>{
    if (err) {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }
    else if (result) {
      res.json({
        success :1,
        token:req.headers['x-access-token'],
        result : result
      });
    } else {
      res.json({
        success:0,
        token:req.headers['x-access-token'],
        message: "managerPermissionsAccessMaster document Not Exists / Send a valid ID"
      });
    }
  });
}

// getAll start
const getAll = (req, res)=>{
  managerPermissionsAccessMaster.find({}, (err, result)=>{
    if (err) {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }
    else if (result) {
      // res.send(result);
      res.json({
        success :1,
        token:req.headers['x-access-token'],
        result : result
      });
    } else {
      res.json({
        success :0,
        token:req.headers['x-access-token'],
        message : "No data found!"
      });
    }
  }).sort({ createdAt: -1 });
}

// deletemanagerPermissionsAccessMasterById start
const deleteManagerPermissionsAccessMasterById = (req, res, next)=>{
  let id = req.params.id;

  managerPermissionsAccessMaster.findByIdAndRemove(id,(err, post)=>{
    if (err) {
      res.json({
        success :0 ,
        token:req.headers['x-access-token'],
        message : "managerPermissionsAccessMaster document Not Exists / Send a valid ID"+err
      });
    } else {
      res.json({ success :1 ,token:req.headers['x-access-token'], message: "Deleted managerPermissionsAccessMaster Successfully" });
    }
  });
}

// Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
const getListOfPermissions = (req, res)=>{
  let managerId = ObjectId(req.params.managerId);
  let celebrityId = ObjectId(req.params.celebrityId);
  let reportingTo = null;
  if(req.params.reportingTo != "0")
  {
    let query1 = { $and: [{ managerId: managerId }, 
      { celebrityId: celebrityId },
      {managerSettingsMasterId:  ObjectId("5b97b71035aa150522f81c58")}]};
      managerPermissions.countDocuments(query1,(err,data)=>{
        //console.log(data)
        if(data == 13 || data == "13")
        {
          managerPermissions.remove(query1,(err,data)=>{

          })
        }
    });
    reportingTo = ObjectId(req.params.reportingTo);
  }

  celebManager.findOne({managerId:managerId,celebrityId:celebrityId},(err,celebManagerObj)=>{
      if(err)
      {
        res.json({success:0,message:err})
      }else if(celebManagerObj){
        if(celebManagerObj.reportingTo)
        {
          reportingTo = celebManagerObj.reportingTo
        }else{
          reportingTo = null
        }
        CelebManagerService.getAccessStatus(celebrityId,managerId,reportingTo,(err,celebManager)=>{
          if(err) 
          {
            res.json({token:req.headers['x-access-token'],success:0,message:err});
          }
          else if(celebManager){
            ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
              if(err) 
              {
                res.json({token:req.headers['x-access-token'],success:0,message:err});
              }
              else if(managerPermission){
                if(celebManager && celebManager.isAccess)
                {
                  Object.assign(managerPermission, {
                    "isAccess" : true
                  });
                }
                else{
                  Object.assign(managerPermission, {
                    "isAccess" : false
                  });
                }
                res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
              }
              else{
                if(reportingTo)
                {
                  ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId,managerId,reportingTo,(err,newManagerPermission)=>{
                    if(err)
                    {
                      res.json({token:req.headers['x-access-token'],success:0,message:err});
                    }
                    else if(newManagerPermission){
                      ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
                        if(err) 
                        {
                          res.json({token:req.headers['x-access-token'],success:0,message:err});
                        }
                        else if(managerPermission){
                          if(celebManager && celebManager.isAccess)
                          {
                            Object.assign(managerPermission, {
                              "isAccess" : true
                            });
                          }
                          else{
                            Object.assign(managerPermission, {
                              "isAccess" : false
                            });
                          }
                          res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
                        }
                      });
                    }
                  })
                }else{
                  ManagerPermissionsAccessMasterService.createManagerPermission(celebrityId,managerId,(err,newManagerPermission)=>{
                    if(err)
                    {
                      res.json({token:req.headers['x-access-token'],success:0,message:err});
                    }
                    else if(newManagerPermission){
                      ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
                        if(err) 
                        {
                          res.json({token:req.headers['x-access-token'],success:0,message:err});
                        }
                        else if(managerPermission){
                          if(celebManager && celebManager.isAccess)
                          {
                            Object.assign(managerPermission, {
                              "isAccess" : true
                            });
                          }
                          else{
                            Object.assign(managerPermission, {
                              "isAccess" : false
                            });
                          }
                          res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
                        }
                      });
                    }
                    else{
                      res.json({token:req.headers['x-access-token'],success:0,message:"Oops..! Something went wrong.please try again."});
                    }
                  })
                }
              }
            }) 
          }
          else{
            res.json({token:req.headers['x-access-token'],success:0,message:"Not getting access status"});
          }
        })
      }else{
          res.json({success:0,message:"Celeb Managar Link not found"});
      }
  })
}
// End of  Get list of Permissions for a Manager granted by Celebrity as User Data

// CELEBRITY LOGIN : Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
const getListOfPermissionscelebrityLoginManager = (req, res)=>{
  let managerId = ObjectId(req.params.managerId);
  let celebrityId = ObjectId(req.params.celebrityId);

  CelebManagerService.getAccessStatus(celebrityId,managerId,null,(err,celebManager)=>{
    if(err) 
    {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }
    else{
      ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
        if(err) 
        {
          res.json({token:req.headers['x-access-token'],success:0,message:err});
        }
        else if(managerPermission){
          if(celebManager && celebManager.isAccess)
          {
            Object.assign(managerPermission, {
              "isAccess" : true
            });
          }
          else{
            Object.assign(managerPermission, {
              "isAccess" : false
            });
          }
          res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
        }
        else{
          ManagerPermissionsAccessMasterService.createManagerPermission(celebrityId,managerId,(err,newManagerPermission)=>{
            if(err)
            {
              res.json({token:req.headers['x-access-token'],success:0,message:err});
            }
            else if(newManagerPermission){
              ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
                if(err) 
                {
                  res.json({token:req.headers['x-access-token'],success:0,message:err});
                }
                else if(managerPermission){
                  if(celebManager && celebManager.isAccess)
                  {
                    Object.assign(managerPermission, {
                      "isAccess" : true
                    });
                  }
                  else{
                    Object.assign(managerPermission, {
                      "isAccess" : false
                    });
                  }
                  res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
                }
              });
            }
            else{
              res.json({token:req.headers['x-access-token'],success:0,message:"Oops..! Something went wrong.please try again."});
            }
          })
        }
      })   
    }
  })
}


//New with reporting to celebrity login
// CELEBRITY LOGIN : Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
const getListOfPermissionscelebrityLoginSubManager = (req, res)=> {
  let managerId = ObjectId(req.params.managerId);
  let celebrityId = ObjectId(req.params.celebrityId);
  let reportingTo = null;

  if(req.params.reportingTo != "0")
  {
    reportingTo = ObjectId(req.params.reportingTo);
  }
  CelebManagerService.getAccessStatus(celebrityId,managerId,reportingTo,(err,celebManager)=>{
    if(err) 
    {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }
    else{
      ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
        if(err) 
        {
          res.json({token:req.headers['x-access-token'],success:0,message:err});
        }
        else if(managerPermission){
          if(celebManager && celebManager.isAccess)
          {
            Object.assign(managerPermission, {
              "isAccess" : true
            });
          }
          else{
            Object.assign(managerPermission, {
              "isAccess" : false
            });
          }
          res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
        }
        else{
          if(reportingTo)
          {
            ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId,managerId,reportingTo,(err,newManagerPermission)=>{
              if(err)
              {
                res.json({token:req.headers['x-access-token'],success:0,message:err});
              }
              else if(newManagerPermission){
                if(celebManager && celebManager.isAccess)
                {
                  Object.assign(managerPermission, {
                    "isAccess" : true
                  });
                }
                else{
                  Object.assign(managerPermission, {
                    "isAccess" : false
                  });
                }
                res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
              }
            })
          }else{
            ManagerPermissionsAccessMasterService.createManagerPermission(celebrityId,managerId,(err,newManagerPermission)=>{
              if(err)
              {
                res.json({token:req.headers['x-access-token'],success:0,message:err});
              }
              else if(newManagerPermission){
                ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
                  if(err) 
                  {
                    res.json({token:req.headers['x-access-token'],success:0,message:err});
                  }
                  else if(managerPermission){
                    if(celebManager && celebManager.isAccess)
                    {
                      Object.assign(managerPermission, {
                        "isAccess" : true
                      });
                    }
                    else{
                      Object.assign(managerPermission, {
                        "isAccess" : false
                      });
                    }
                    res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
                  }
                });
              }
              else{
                res.json({token:req.headers['x-access-token'],success:0,message:"Oops..! Something went wrong.please try again."});
              }
            })
          }
        }
      }) 
    }
  })
}



// CELEBRITY LOGIN : Get list of Permissions for a Manager granted by Celebrity with Manager Profile as User Data
const getListOfPermissionsManagerLoginSubManager  = (req, res)=>{
  let managerId = ObjectId(req.params.managerId);
  let celebrityId = ObjectId(req.params.celebrityId);
  let reportingTo = null;
  if(req.params.reportingTo != "0")
  {
    let query1 = { $and: [{ managerId: managerId }, 
      { celebrityId: celebrityId },
      {managerSettingsMasterId:  ObjectId("5b97b71035aa150522f81c58")}]};
      managerPermissions.countDocuments(query1,(err,data)=>{
        //console.log(data)
        if(data == 13 || data == "13")
        {
          managerPermissions.remove(query1,(err,data)=>{

          })
        }
    });
    reportingTo = ObjectId(req.params.reportingTo);
  }

  CelebManagerService.getAccessStatus(celebrityId,managerId,reportingTo,(err,celebManager)=>{
    if(err) 
    {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }
    else{
      ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
        if(err) 
        {
          res.json({token:req.headers['x-access-token'],success:0,message:err});
        }
        else if(managerPermission){
          if(celebManager && celebManager.isAccess)
          {
            Object.assign(managerPermission, {
              "isAccess" : true
            });
          }
          else{
            Object.assign(managerPermission, {
              "isAccess" : false
            });
          }
          res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
        }
        else{
          if(reportingTo)
          {
            ManagerPermissionsAccessMasterService.createPermissionForSubManager(celebrityId,managerId,reportingTo,(err,newManagerPermission)=>{
              if(err)
              {
                res.json({token:req.headers['x-access-token'],success:0,message:err});
              }
              else if(newManagerPermission){
                ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
                  if(err) 
                  {
                    res.json({token:req.headers['x-access-token'],success:0,message:err});
                  }
                  else if(managerPermission){
                    if(celebManager && celebManager.isAccess)
                    {
                      Object.assign(managerPermission, {
                        "isAccess" : true
                      });
                    }
                    else{
                      Object.assign(managerPermission, {
                        "isAccess" : false
                      });
                    }
                    res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
                  }
                });
              }
            })
          }else{
            ManagerPermissionsAccessMasterService.createManagerPermission(celebrityId,managerId,(err,newManagerPermission)=>{
              if(err)
              {
                res.json({token:req.headers['x-access-token'],success:0,message:err});
              }
              else if(newManagerPermission){
                ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
                  if(err) 
                  {
                    res.json({token:req.headers['x-access-token'],success:0,message:err});
                  }
                  else if(managerPermission){
                    if(celebManager && celebManager.isAccess)
                    {
                      Object.assign(managerPermission, {
                        "isAccess" : true
                      });
                    }
                    else{
                      Object.assign(managerPermission, {
                        "isAccess" : false
                      });
                    }
                    res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
                  }
                });
              }
              else{
                res.json({token:req.headers['x-access-token'],success:0,message:"Oops..! Something went wrong.please try again."});
              }
            })
          }
        }
      }) 
    }
  })
}


// MANAGER LOGIN : Get list of Permissions for a Manager granted by Celebrity with Celebrity Profile as User Data
const getListOfPermissionsManagerLoginManager = (req, res)=> {
  let managerId = ObjectId(req.params.managerId);
  let celebrityId = ObjectId(req.params.celebrityId);

  CelebManagerService.getAccessStatus(celebrityId,managerId,null,(err,celebManager)=>{
    if(err) 
    {
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }
    else{
      ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
        if(err) 
        {
          res.json({token:req.headers['x-access-token'],success:0,message:err});
        }
        else if(managerPermission){
          if(celebManager && celebManager.isAccess)
          {
            Object.assign(managerPermission, {
              "isAccess" : true
            });
          }
          else{
            Object.assign(managerPermission, {
              "isAccess" : false
            });
          }
          res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
        }
        else{
          ManagerPermissionsAccessMasterService.createManagerPermission(celebrityId,managerId,(err,newManagerPermission)=>{
            if(err)
            {
              res.json({token:req.headers['x-access-token'],success:0,message:err});
            }
            else if(newManagerPermission){
              ManagerPermissionsAccessMasterService.getManagerPermission(celebrityId,managerId,(err,managerPermission)=>{
                if(err) 
                {
                  res.json({token:req.headers['x-access-token'],success:0,message:err});
                }
                else if(managerPermission){
                  if(celebManager && celebManager.isAccess)
                  {
                    Object.assign(managerPermission, {
                      "isAccess" : true
                    });
                  }
                  else{
                    Object.assign(managerPermission, {
                      "isAccess" : false
                    });
                  }
                  res.json({token:req.headers['x-access-token'],success:1,data:managerPermission});
                }
              });
            }
            else{
              res.json({token:req.headers['x-access-token'],success:0,message:"Oops..! Something went wrong.please try again."});
            }
          })
        }
      })   
    }
  })
}

const getIsAccess = (req, res)=>{
  let managerId = ObjectId(req.params.managerId);
  let celebrityId = ObjectId(req.params.celebrityId);
  let isAccess;
  let query = { $and: [{ managerId: managerId }, { celebrityId: celebrityId }] };
  celebManager.findOne(query, function (err, nResult) {
    if(err) res.json({token:req.headers['x-access-token'],success:0,message:err});
    if(nResult == null) {
      res.json({
        "success" : 0,
        "token" :req.headers['x-access-token'],
        "message" : "No relationship found!"
      })
    } else {
      res.json({
        "success" : 1,
        "token" :req.headers['x-access-token'],
        "data" : nResult.isAccess
      })
    }
  }).sort({ createdAt: -1 });

}

module.exports ={
  createManagerPermissionsAccessMaster:createManagerPermissionsAccessMaster,
  editManagerPermissionsAccessMaster:editManagerPermissionsAccessMaster,
  findManagerPermissionsAccessMasterId:findManagerPermissionsAccessMasterId,
  getAll:getAll,
  deleteManagerPermissionsAccessMasterById:deleteManagerPermissionsAccessMasterById,
  getListOfPermissions:getListOfPermissions,
  getListOfPermissionscelebrityLoginManager:getListOfPermissionscelebrityLoginManager,
  getListOfPermissionscelebrityLoginSubManager:getListOfPermissionscelebrityLoginSubManager,
  getListOfPermissionsManagerLoginManager:getListOfPermissionsManagerLoginManager,
  getListOfPermissionsManagerLoginSubManager:getListOfPermissionsManagerLoginSubManager,
  getIsAccess:getIsAccess
}