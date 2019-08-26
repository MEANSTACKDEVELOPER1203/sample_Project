const User = require('../users/userModel');
const LoginInfo = require('../loginInfo/loginInfoModel');
const MemberPreferances = require("../memberpreferences/memberpreferencesModel")
const MediaTracking = require("../mediaTracking/mediaTrackingModel")

const createDummyUser = (users, callback)=>{
    User.insertMany(users,(err,data)=>{
        if(err)
        {
            callback(err,null)
        }else{
            callback(err,data)
        }
    })
}   
 

const createSingleDummyUser = (userDetails, callback)=>{
    User.create(userDetails,(err,data)=>{
        if(err)
        {
            callback(err,null)
        }else{
            callback(err,data)
        }
    })
}   

const getAllDummmyUser = (callback)=>{
    User.find({"dua": true,IsDeleted:false,},{password:0},(err,data)=>{
        if(err)
        {
            callback(err,null)
        }else{
            callback(err,data)
        }
    })
}  

const getAllDummmyUserForCreatingMemberPreferances = (callback)=>{
    User.find({"dua": true,IsDeleted:false,country:"#91"},{password:0},(err,data)=>{
        if(err)
        {
            callback(err,null)
        }else{
            callback(err,data)
        }
    })
}  

const createDummyLogin = (callback)=>{
    getAllDummmyUserForCreatingMemberPreferances((err,dummyUsers)=>{
        if(err){
            callback(err,null)
        }else{
            dummyLoginDetails = dummyUsers.map((dUser)=>{
                let x = {
                    "email" : dUser.email,
                    "username" : dUser.username, 
                    "mobileNumber" : dUser.mobileNumber, 
                    "timezone" : "+0530",
                    "osType" : "Android", 
                    "memberId":dUser._id,
                    "createdAt":dUser.created_at,
                    "updatedAt":dUser.created_at
                }
                return x;
            })
            LoginInfo.insertMany(dummyLoginDetails,(err,memberpreferences)=>{
                if(err){
                    callback(err,null)
                }else{
                    callback(null,memberpreferences)
                }
            }) 
        }
    })
}  

const insertManyDummyUserMemberPrefernaces = (callback)=>{
    getAllDummmyUserForCreatingMemberPreferances((err,dummyUsers)=>{
        if(err){
            callback(err,null)
        }else{
            dummyMemberPrefernace = dummyUsers.map((dUser)=>{
                return {
                    memberId:dUser._id,
                    createdBy:"Admin",
                    created_at:dUser.created_at,
                    updated_at:dUser.created_at
                }
            })
            MemberPreferances.insertMany(dummyMemberPrefernace,(err,memberpreferences)=>{
                    if(err){
                        callback(err,null)
                    }else{
                        callback(null,memberpreferences)
                    }
            })
        }
    })
}

const deleteAllVertualUsers = (callback)=>{
    getAllDummmyUser((err,dummyUsers)=>{
        if(err){
            callback(err,null)
        }else{
            dummyUsers = dummyUsers.map((dUser)=>{
                return dUser._id
            })
            LoginInfo.deleteMany({memberId:{$in:dummyUsers}},(err,data)=>{
                if(err){
                    callback(err,null)
                }else{
                    MemberPreferances.deleteMany({memberId:{$in:dummyUsers}},(err,memberpreferences)=>{
                        if(err){
                            callback(err,null)
                        }else{
                            MediaTracking.deleteMany({memberId:{$in:dummyUsers}},(err,memberpreferences)=>{
                                if(err){
                                    callback(err,null)
                                }else{
                                    User.deleteMany({dua:true},(err,deletedUser)=>{
                                        if(err){
                                            callback(err,null)
                                        }else{
                                            callback(null,deletedUser)
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

let userService = {
    createDummyUser: createDummyUser,
    createSingleDummyUser:createSingleDummyUser,
    getAllDummmyUser:getAllDummmyUser,
    createDummyLogin:createDummyLogin,
    insertManyDummyUserMemberPrefernaces:insertManyDummyUserMemberPrefernaces,
    deleteAllVertualUsers : deleteAllVertualUsers
}

module.exports = userService;