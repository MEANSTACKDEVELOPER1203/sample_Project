const HashTagMaster =  require("./hashTagMasterModel");
const ObjectId = require("mongodb").ObjectID;

const createHashTagMaster = (body,callback)=>{
    let newHashTagMaster ={
      hashTagName: body.hashTagName,
      memberId:body.memberId,
      createdBy:body.memberId,
      updatedBy:body.memberId
    }
    HashTagMaster.create(newHashTagMaster,(err,newHashTagMasterObj)=>{
        if(err){
          callback(err,null)
        }else{
          callback(null,newHashTagMasterObj)
        }
    })
}

const editHashTagMaster = (params,body,callback)=>{
  let id = params.hashTagMasterId;
  HashTagMaster.findByIdAndUpdate(ObjectId(id),{$set:body},{new:true},(err,updatedHashTagMasterObj)=>{
    if(err){
      callback(err,null)
    }else{
      callback(null,updatedHashTagMasterObj)
    }
  })
}

const getHashTagMasterById = (params,callback)=>{
  let id = params.hashTagMasterId;
  HashTagMaster.findById(ObjectId(id),{hashTagName:1,count:1},(err,hashTagMasterObj)=>{
    if(err){
      callback(err,null)
    }else{
      callback(null,hashTagMasterObj)
    }
  })
}

const getAllHashTagMasterByName = (params,callback)=>{
  let name = "#"+params.hashTagName;
  let limit = parseInt(params.limit)
  let query =  {hashTagName:{ $regex: "^"+name, $options: 'im' }};
  if(params.count!="null"){
    let count = parseInt(params.count)
    query = {hashTagName:{ $regex: "^"+name, $options: 'im' },count:{$lt:count}}
  }
  HashTagMaster.find(query,{hashTagName:1,count:1},(err,hashTagMasters)=>{
    if(err){
      callback(err,null)
    }else{
      if(hashTagMasters.length)
      {
        let lastCount =  hashTagMasters[hashTagMasters.length-1].count;
        let ids = hashTagMasters.filter((hasTagObj)=>{
          if(hasTagObj.count+"" == lastCount+""){
            return hasTagObj._id;
          }
        })
        HashTagMaster.find({hashTagName:{ $regex: "^"+name, $options: 'im' },count:lastCount,_id:{$nin:ids}},{hashTagName:1,count:1},(err,hashTagMasters1)=>{
          if(err){
            callback(err,null)
          }else{
            console.log(hashTagMasters1)
            console.log(hashTagMasters)
            hashTagMasters=hashTagMasters.concat(hashTagMasters1)
            callback(null,hashTagMasters)
          }
        })
      }else{
        callback(null,hashTagMasters)
      }
    }
  }).sort({count:-1}).limit(limit)
}

const getAllHashTagMasterByMemberId = (params,callback)=>{
  let memberId = params.memberId;
  let limit = parseInt(params.limit)
  
  let query =  {memberId:ObjectId(memberId)}
  if(params.count!="null"){
    let count = parseInt(params.count)
    query = {memberId:ObjectId(memberId),count:{$lt:count}}
  }
  HashTagMaster.find(query,{hashTagName:1,count:1},(err,hashTagMasters)=>{
    if(err){
      callback(err,null)
    }else{
      if(hashTagMasters.length)
      {
        let lastCount =  hashTagMasters[hashTagMasters.length-1].count;
        let ids = hashTagMasters.filter((hasTagObj)=>{
          if(hasTagObj.count+"" == lastCount+""){
            return hasTagObj._id;
          }
        })
        HashTagMaster.find({memberId:ObjectId(memberId),count:lastCount,_id:{$nin:ids}},{hashTagName:1,count:1},(err,hashTagMasters1)=>{
          if(err){
            callback(err,null)
          }else{
            hashTagMasters=hashTagMasters.concat(hashTagMasters1)
            callback(null,hashTagMasters)
          }
        })
      }else{
        callback(null,hashTagMasters)
      }
    }
  }).sort({count:-1}).limit(limit)
}

module.exports ={
  createHashTagMaster:createHashTagMaster,
  editHashTagMaster:editHashTagMaster,
  getHashTagMasterById:getHashTagMasterById,
  getAllHashTagMasterByName:getAllHashTagMasterByName,
  getAllHashTagMasterByMemberId:getAllHashTagMasterByMemberId
}