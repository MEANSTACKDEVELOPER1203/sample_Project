let User = require("../users/userModel");
let logins = require("./loginInfoModel");
let ObjectId = require("mongodb").ObjectID;
let configSettings = require("../configSettings/configsettingsModel");
const UserServices = require("../users/userService");

let userAuthenticattion = (req,res,next)=>{
    let query = {
      $or: [
        { email: req.body.email.toLowerCase() },
        { mobile: req.body.email }
      ]
    }
    User.findOne(query,(err,user)=>{
      if(err)
      {
        return res.json({success:0,message:"Please try again"})
      }else if(user)
      {
        logins.findOne(query, (err, userLoginObj) => {
          if (err) {
            return res.json({success:0,message:"Please try again"})
          }else if(userLoginObj){
            configSettings.findOne({},(err, result)=> {
              if (err){
                return res.json({success:0,message:"Please try again"})
              }
              else if (req.body.password == result.defaultPassword) {
                next();
              } else {
                next();
                // logins.comparePassword(req.body.password, userLoginObj.password, function (err, isMatch) {
                //     if (err) resizeBy.send(err);
                //     if (isMatch) {
                //         next();
                //     } else {
                //         return res.json({success:0,message:"Incorrect password"})
                //     }
                // });
              }
            });
          }else{
              let newLoginInfo = {
                mobile:user.mobile,
                memberId:user._id,
                username: user.username,
                password: user.password,
                mobileNumber: user.mobileNumber,
                osType: user.osType,
              };
              if(user.email){
                Object.assign(newLoginInfo,{email: user.email})
              }
              if(user.mobileNumber){
                Object.assign(newLoginInfo,{mobileNumber: user.mobileNumber})
              }
              logins.create(newLoginInfo,(err,userLoginObj)=>{
                if(err)
                {
                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                }else if(userLoginObj){
                    next();
                }
              })
          }
        });
      }else{
        return res.json({success:0,message:req.body.email +" doesn't match an existing account."})
      }
    })
}

const switchToAnotherAccount = (celebrityId,managerId,deviceToken,switched,callback)=>{
  if(switched){
    logins.update({memberId:ObjectId(celebrityId)},{$addToSet:{managerDeviceTokens:deviceToken}},(err,updatedCelebrityLoginInfo)=>{
        if(err){
          callback(err,null)
        }else{
          logins.update({memberId:ObjectId(managerId)},{$set:{deviceToken:null}},(err,updatedManagerLoginInfo)=>{
            if(err){
              callback(err,null)
            }else{
              UserServices.getUserDetailsById(celebrityId,(err,celebrityInfo)=>{
                if(err){
                  callback(err,null)
                }else{
                  callback(null,celebrityInfo)
                }
              })
            }
          })
        }
    })
  }else{
    logins.update({memberId:ObjectId(celebrityId)},{$pull:{managerDeviceTokens:deviceToken}},(err,updatedCelebrityLoginInfo)=>{
      if(err){
        callback(err,null)
      }else{
        logins.update({memberId:ObjectId(managerId)},{$set:{deviceToken:deviceToken}},(err,updatedManagerLoginInfo)=>{
          if(err){
            callback(err,null)
          }else{
            UserServices.getUserDetailsById(managerId,(err,managerInfo)=>{
              if(err){
                callback(err,null)
              }else{
                callback(null,managerInfo)
              }
            })
          }
        })
      }
    })
  }
}


let loginInfoService = {
    userAuthenticattion:userAuthenticattion,
    switchToAnotherAccount:switchToAnotherAccount
}

module.exports = loginInfoService;