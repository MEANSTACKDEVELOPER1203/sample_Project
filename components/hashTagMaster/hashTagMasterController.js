const HashTagMasterService =  require("./hashTagMasterService");

const createHashTagMaster = (req,res)=>{
    HashTagMasterService.createHashTagMaster(req.body,(err,createdHashTagMasterObj)=>{
        if(err){
            res.json({token:req.headers['x-access-token'],success:0,message:err});
        }else{
            res.json({token:req.headers['x-access-token'],success:1,data:createdHashTagMasterObj});
        }
    })
}

const editHashTagMaster = (req,res)=>{
  HashTagMasterService.editHashTagMaster(req.params,req.body,(err,updatedHashTagMasterObj)=>{
    if(err){
        res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
        res.json({token:req.headers['x-access-token'],success:1,data:updatedHashTagMasterObj});
    }
  })
}

const getHashTagMasterById = (req,res)=>{
  HashTagMasterService.getHashTagMasterById(req.params,(err,hashTagMasterObj)=>{
    if(err){
        res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
        res.json({token:req.headers['x-access-token'],success:1,data:hashTagMasterObj});
    }
  })
}

const getAllHashTagMasterByName = (req,res)=>{
  HashTagMasterService.getAllHashTagMasterByName(req.params,(err,hashTagMasters)=>{
    if(err){
        res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
        res.json({token:req.headers['x-access-token'],success:1,data:hashTagMasters});
    }
  })
}

const getAllHashTagMasterByMemberId = (req,res)=>{
  HashTagMasterService.getAllHashTagMasterByMemberId(req.params,(err,hashTagMasters)=>{
    if(err){
        res.json({token:req.headers['x-access-token'],success:0,message:err});
    }else{
        res.json({token:req.headers['x-access-token'],success:1,data:hashTagMasters});
    }
  })
}

module.exports ={
  createHashTagMaster:createHashTagMaster,
  editHashTagMaster:editHashTagMaster,
  getHashTagMasterById:getHashTagMasterById,
  getAllHashTagMasterByName:getAllHashTagMasterByName,
  getAllHashTagMasterByMemberId:getAllHashTagMasterByMemberId
}