const ActivityLogService = require("./activityLogService");

const createActivityLog = (req,res)=>{
  ActivityLogService.createActivityLog(req.body,(err,newHashTag)=>{
      if(err){
        res.json({token:req.headers['x-access-token'],success:0,message:err});
      }else{
        res.json({token:req.headers['x-access-token'],success:1,data:newHashTag});
      }
  })
}

const editActivityLog = (req,res)=>{
  ActivityLogService.editActivityLog(req.params.id,req.body,(err,updateHashTag)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:updateHashTag});
    } 
  })
}

const getActivityLogByMemberId = (req,res)=>{
  if(req.params.limit<=0){
    return res.status(200).json({token:req.headers['x-access-token'],success:0,message:"the limit must be positive"});
  }
  ActivityLogService.getActivityLogByMemberId(req.params,(err,allActivityLog)=>{
    if(err){
        if(err.message == "the limit must be positive")
          return res.status(200).json({token:req.headers['x-access-token'],success:0,message:err.message});
      return res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:allActivityLog});
    } 
  })
}


const getAllActivityLogByMemberIdAndType = (req,res)=>{
  ActivityLogService.getAllActivityLogByMemberIdAndType(req.params,(err,allActivityLog)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:allActivityLog});
    } 
  })
}

const deleteActivityLog = (req,res)=>{
  ActivityLogService.deleteActivityLog(req.params,(err,updateHashTag)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:updateHashTag});
    } 
  })
}


module.exports = {
  createActivityLog:createActivityLog,
  editActivityLog:editActivityLog,
  getActivityLogByMemberId:getActivityLogByMemberId,
  getAllActivityLogByMemberIdAndType:getAllActivityLogByMemberIdAndType,
  deleteActivityLog:deleteActivityLog
};
