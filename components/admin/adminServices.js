const Admin = require("./adminModel");
const ObjectId = require("mongodb").ObjectID;
const User = require("../users/userModel");
const Logins = require("../loginInfo/loginInfoModel");

const getMemberByisCelebAdmin = (params,callback)=>{
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);

    User.count({ "dua": false ,"isCeleb": true ,"IsDeleted": false},(err,count)=>{
        if(err){
            callback(err,null)
        }else{
            User.aggregate(
                [
                    { $match: { "dua": false ,"isCeleb": true ,"IsDeleted": false}},
                    {
                        $skip:parseInt(startFrom)
                    },
                    {
                        $limit:limit
                    },
                    { $sort: { created_at: -1 } },
                    {
                        $limit:limit
                    },
                    {
                        $lookup: {
                            from: "logins",
                            localField: "_id",
                            foreignField: "memberId",
                            as: "deviceToken" // to get all the views, comments, shares count
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            mobileNumber: 1,
                            avtar_imgPath: 1,
                            avtar_originalname: 1,
                            imageRatio: 1,
                            password: 1,
                            email: 1,
                            name: 1,
                            firstName: 1,
                            lastName: 1,
                            prefix: 1,
                            aboutMe: 1,
                            location: 1,
                            country: 1,
                            loginType: 1,
                            role: 1,
                            gender: 1,
                            dateOfBirth: 1,
                            address: 1,
                            referralCode: 1,
                            cumulativeSpent: 1,
                            cumulativeEarnings: 1,
                            lastActivity: 1,
                            profession: 1,
                            industry: 1,
                            userCategory: 1,
                            liveStatus: 1,
                            status: 1,
                            isCeleb: 1,
                            isTrending: 1,
                            isOnline: 1,
                            isEditorChoice: 1,
                            isPromoted: 1,
                            isEmailVerified: 1,
                            isMobileVerified: 1,
                            emailVerificationCode: 1,
                            mobileVerificationCode: 1,
                            celebRecommendations: 1,
                            Dnd: 1,
                            celebToManager: 1,
                            author_status: 1,
                            iosUpdatedAt: 1,
                            created_at: 1,
                            updated_at: 1,
                            created_by: 1,
                            updated_by: 1,
                            IsDeleted: 1,
                            isPromoter: 1,
                            isManager: 1,
                            managerRefId: 1,
                            promoterRefId: 1,
                            charityRefId: 1,
                            celebCredits: 1,
                            deviceToken: "$deviceToken.deviceToken"
                        }
                    }
                ],
            (err, result)=> {
                if (err) {
                    callback(err,null)
                }else{
                    let data = {};
                    data.result = result
                    let total_pages = count/limit;
                    let div = count%limit;
                    data.pagination ={
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null,data)
                }
            });
        }
    });
}
const getMemberByisManager = (params,callback)=>{
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);
    User.count({ "dua": false ,isManager: true ,"IsDeleted": false},(err,count)=>{
        if(err){
            callback(err,null)
        }else{
            User.aggregate(
                [
                    { $match: { "dua": false ,isManager: true ,"IsDeleted": false}},
                    {
                        $skip:parseInt(startFrom)
                    },
                    {
                        $limit:limit
                    },
                    { $sort: { created_at: -1 } },
                    {
                        $lookup: {
                            from: "logins",
                            localField: "_id",
                            foreignField: "memberId",
                            as: "deviceToken" // to get all the views, comments, shares count
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            mobileNumber: 1,
                            avtar_imgPath: 1,
                            avtar_originalname: 1,
                            imageRatio: 1,
                            password: 1,
                            email: 1,
                            name: 1,
                            firstName: 1,
                            lastName: 1,
                            prefix: 1,
                            aboutMe: 1,
                            location: 1,
                            country: 1,
                            loginType: 1,
                            role: 1,
                            gender: 1,
                            dateOfBirth: 1,
                            address: 1,
                            referralCode: 1,
                            cumulativeSpent: 1,
                            cumulativeEarnings: 1,
                            lastActivity: 1,
                            profession: 1,
                            industry: 1,
                            userCategory: 1,
                            liveStatus: 1,
                            status: 1,
                            isCeleb: 1,
                            isTrending: 1,
                            isOnline: 1,
                            isEditorChoice: 1,
                            isPromoted: 1,
                            isEmailVerified: 1,
                            isMobileVerified: 1,
                            emailVerificationCode: 1,
                            mobileVerificationCode: 1,
                            celebRecommendations: 1,
                            Dnd: 1,
                            celebToManager: 1,
                            author_status: 1,
                            iosUpdatedAt: 1,
                            created_at: 1,
                            updated_at: 1,
                            created_by: 1,
                            updated_by: 1,
                            IsDeleted: 1,
                            isPromoter: 1,
                            isManager: 1,
                            managerRefId: 1,
                            promoterRefId: 1,
                            charityRefId: 1,
                            celebCredits: 1,
                            deviceToken: "$deviceToken.deviceToken"
                        }
                    }
                ],
            (err, result)=> {
                if (err) {
                    callback(err,null)
                }else{
                    let data = {};
                    data.result = result
                    let total_pages = count/limit
                    let div = count%limit;
                    data.pagination ={
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null,data)
                }
            });
        }
    });
  }

const getAll = (params,callback)=>{
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);
    Admin.count({},(err, count)=> {
        if(err){
            callback(err,null)
        }else{
            Admin.find({},(err, result)=> {
                if(err){
                    callback(err,null)
                }else{
                    let data = {};
                    data.result = result
                    let total_pages = count/limit
                    let div = count%limit;
                    data.pagination ={
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null,data)
                }
            }).sort({ createdAt: -1 }).skip(startFrom).limit(limit);
        }
    })
}
module.exports = {
    getMemberByisCelebAdmin:getMemberByisCelebAdmin,
    getMemberByisManager:getMemberByisManager,
    getAll:getAll
}