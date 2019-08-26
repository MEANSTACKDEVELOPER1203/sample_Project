const ActivityLogTypesModel =  require("./activityLogTypesModel");

const createActivityLogType = (req,callback)=>{
    let file = req.files[0]
    let iconUrl = "";
    if(file.fieldname == "activityLogIcon"){
        iconUrl = file.path;
    }
    let body = JSON.parse(req.body.activityLogType)
    let newTag ={
        name:body.name,
        firstMessagePart:body.firstMessagePart,
        secondMessagePart:body.secondMessagePart ?body.secondMessagePart:"",
        thirdMessagePart:body.thirdMessagePart ?body.thirdMessagePart:"",
        iconUrl:iconUrl
    }
    ActivityLogTypesModel.create(newTag,(err,newActivityLogType)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,newActivityLogType)
        }
    })
}

const editActivityLogType = (id,req,callback)=>{
    let file = req.files[0]
    let iconUrl = "";
    if(file.fieldname == "activityLogIcon"){
        iconUrl = file.path;
    }
    let body = JSON.parse(req.body.activityLogType)
    body.iconUrl = iconUrl;
    body.updatedAt = new Date();
    ActivityLogTypesModel.findByIdAndUpdate(id,{$set:body},{new:true},(err,updateActivityLogType)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,updateActivityLogType)
        }
    })
}

const getActivityLogTypebyId = (param,callback)=>{
    let id = param.id;
    ActivityLogTypesModel.findById(id,(err,activityLogType)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,activityLogType)
        }
    })
}

const getActivityLogTypebyName = (param,callback)=>{
    let name = param.name;
    ActivityLogTypesModel.findOne({name:name},{_id:1},(err,activityLogType)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,activityLogType)
        }
    })
}



const getAllActivityLogTypes = (callback)=>{
    ActivityLogTypesModel.find({},(err,allActivityLogType)=>{
        if(err){
            callback(err,null)
        }else{
            callback(null,allActivityLogType)
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
