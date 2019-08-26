const ActivityLogTypesService = require("./activityLogTypesService");

const createActivityLogType = (req,res)=>{
  ActivityLogTypesService.createActivityLogType(req,(err,newActivityLogType)=>{
      if(err){
        res.json({token:req.headers['x-access-token'],success:0,message:err});
      }else{
        res.json({token:req.headers['x-access-token'],success:1,data:newActivityLogType});
      }
  })
}

const editActivityLogType = (req,res)=>{
  ActivityLogTypesService.editActivityLogType(req.params.id,req,(err,updateActivityLogType)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:updateActivityLogType});
    } 
  })
}

const getActivityLogTypebyId = (req,res)=>{
  ActivityLogTypesService.getActivityLogTypebyId(req.params,(err,activityLogType)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:activityLogType});
    } 
  })
}


const getAllActivityLogTypes = (req,res)=>{
  ActivityLogTypesService.getAllActivityLogTypes((err,allActivityLogType)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:allActivityLogType});
    } 
  })
}

const getActivityLogTypebyName = (req,res)=>{
  ActivityLogTypesService.getActivityLogTypebyName(req.params,(err,activityLogType)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:activityLogType});
    } 
  })
}


module.exports = {
    createActivityLogType:createActivityLogType,
    editActivityLogType:editActivityLogType,
    getActivityLogTypebyId:getActivityLogTypebyId,
    getAllActivityLogTypes:getAllActivityLogTypes,
    getActivityLogTypebyName:getActivityLogTypebyName
};
