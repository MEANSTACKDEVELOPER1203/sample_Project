const HashTagModel = require("./hashTagModel");
const HashTagMaster =  require("../hashTagMaster/hashTagMasterModel");
const HashTagMasterService =  require("../hashTagMaster/hashTagMasterService");

const createHashTag = (body,callback)=>{
    if(body.hashTagId != null || body.hashTagId != undefined){
        let newTag ={
            hashTagId:body.hashTagId,
            memberId:body.memberId,
            createdBy:body.memberId,
            updatedBy:body.memberId
        }
        HashTagModel.create(newTag,(err,newHashTagModel)=>{
            if(err){
                callback(err,null)
            }else{
                HashTagMaster.update({_id:body.hashTagId},{$inc:{count:1}},(err,data)=>{
                    console.log(data)
                })
                callback(null,newHashTagModel)
            }
        })
    }else{
        HashTagMasterService.createHashTag({memberId:body.memberId,hashTagName:body.hashTagName},(err,newHashTagMasterObj)=>{
            if(err){
                callback(err,null)
            }else{
                let newTag ={
                    hashTagId:newHashTagMasterObj._id,
                    memberId:newHashTagMasterObj.memberId,
                    createdBy:newHashTagMasterObj.memberId,
                    updatedBy:newHashTagMasterObj.memberId
                }
                HashTagModel.create(newTag,(err,newHashTagModel)=>{
                    if(err){
                        callback(err,null)
                    }else{
                        HashTagMaster.update({_id:newHashTagModel._id},{$inc:{count:1}},(err,data)=>{
                            console.log(data)
                        })
                        callback(null,newHashTagModel)
                    }
                })
            }
        })
    }
}

const editHashTag = (id,body,callback)=>{
    HashTagModel.findByIdAndUpdate(id,{$set:body},(err,updateHashTagModel)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,updateHashTagModel)
        }
    })
}

const getHashTagsbyId = (param,callback)=>{
    let id = param.id;
    HashTagModel.findById(id,(err,updateHashTagModel)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,updateHashTagModel)
        }
    })
}

const getHashTagsbyMemberId = (param,callback)=>{
    let memberId = param.memberId;
    HashTagModel.findOne({memberId:memberId},(err,allHashTagsBymember)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,allHashTagsBymember)
        }
    })
}


const getAllHashTag = (callback)=>{
    HashTagModel.find({},(err,allHashTags)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,allHashTags)
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
