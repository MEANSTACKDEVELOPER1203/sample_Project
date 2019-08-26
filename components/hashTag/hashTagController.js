const HashTagService = require("./hashTagService");

const createHashTag = (req,res)=>{
  HashTagService.createHashTag(req.body,(err,newHashTag)=>{
      if(err){
        res.json({token:req.headers['x-access-token'],success:0,message:err});
      }else{
        res.json({token:req.headers['x-access-token'],success:1,data:newHashTag});
      }
  })
}

const editHashTag = (req,res)=>{
  HashTagService.createHashTag(req.params.id,req.body,(err,updateHashTag)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:updateHashTag});
    } 
  })
}

const getHashTagsbyId = (req,res)=>{
  HashTagService.getHashTagsbyId(req.params,(err,hashTagObj)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:hashTagObj});
    } 
  })
}

const getHashTagsbyMemberId = (req,res)=>{
  HashTagService.getHashTagsbyMemberId(req.params,(err,allHashTagsForMmeber)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:allHashTagsForMmeber});
    } 
  })
}


const getAllHashTag = (req,res)=>{
  HashTagService.getAllHashTag((err,allHashTagsForMmeber)=>{
    if(err){
      res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
      res.json({token:req.headers['x-access-token'],success:1,data:allHashTagsForMmeber});
    } 
  })
}


module.exports = {
    createHashTag:createHashTag,
    editHashTag:editHashTag,
    getHashTagsbyId:getHashTagsbyId,
    getHashTagsbyMemberId:getHashTagsbyMemberId,
    getAllHashTag:getAllHashTag
};
