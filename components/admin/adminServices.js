// const Admin = require("./adminModel");
// const ObjectId = require("mongodb").ObjectID;
// const User = require("../users/userModel");
// const Logins = require("../loginInfo/loginInfoModel");
// const payCredits = require("../payCredits/payCreditsModel");
// const memberpreferences = require("../memberpreferences/memberpreferencesModel");
// const paymenttransactions = require('../paymentTransaction/paymentTransactionModel');

// const getMemberByisCelebAdmin = (params,callback)=>{
//     let pageNo = parseInt(params.pageNo);
//     let startFrom =  params.limit*(pageNo-1);
//     let limit = parseInt(params.limit);

//     User.count({ "dua": false ,"isCeleb": true ,"IsDeleted": false},(err,count)=>{
//         if(err){
//             callback(err,null)
//         }else{
//             User.aggregate(
//                 [
//                     { $match: { "dua": false ,"isCeleb": true ,"IsDeleted": false}},
//                     {
//                         $skip:parseInt(startFrom)
//                     },
//                     {
//                         $limit:limit
//                     },
//                     { $sort: { created_at: -1 } },
//                     {
//                         $limit:limit
//                     },
//                     {
//                         $lookup: {
//                             from: "logins",
//                             localField: "_id",
//                             foreignField: "memberId",
//                             as: "deviceToken" // to get all the views, comments, shares count
//                         }
//                     },
//                     {
//                         $project: {
//                             username: 1,
//                             mobileNumber: 1,
//                             avtar_imgPath: 1,
//                             avtar_originalname: 1,
//                             imageRatio: 1,
//                             password: 1,
//                             email: 1,
//                             name: 1,
//                             firstName: 1,
//                             lastName: 1,
//                             prefix: 1,
//                             aboutMe: 1,
//                             location: 1,
//                             country: 1,
//                             loginType: 1,
//                             role: 1,
//                             gender: 1,
//                             dateOfBirth: 1,
//                             address: 1,
//                             referralCode: 1,
//                             cumulativeSpent: 1,
//                             cumulativeEarnings: 1,
//                             lastActivity: 1,
//                             profession: 1,
//                             industry: 1,
//                             userCategory: 1,
//                             liveStatus: 1,
//                             status: 1,
//                             isCeleb: 1,
//                             isTrending: 1,
//                             isOnline: 1,
//                             isEditorChoice: 1,
//                             isPromoted: 1,
//                             isEmailVerified: 1,
//                             isMobileVerified: 1,
//                             emailVerificationCode: 1,
//                             mobileVerificationCode: 1,
//                             celebRecommendations: 1,
//                             Dnd: 1,
//                             celebToManager: 1,
//                             author_status: 1,
//                             iosUpdatedAt: 1,
//                             created_at: 1,
//                             updated_at: 1,
//                             created_by: 1,
//                             updated_by: 1,
//                             IsDeleted: 1,
//                             isPromoter: 1,
//                             isManager: 1,
//                             managerRefId: 1,
//                             promoterRefId: 1,
//                             charityRefId: 1,
//                             celebCredits: 1,
//                             deviceToken: "$deviceToken.deviceToken"
//                         }
//                     }
//                 ],
//             (err, result)=> {
//                 if (err) {
//                     callback(err,null)
//                 }else{
//                     let data = {};
//                     data.result = result
//                     let total_pages = count/limit;
//                     let div = count%limit;
//                     data.pagination ={
//                         "total_count": count,
//                         "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
//                         "current_page": pageNo,
//                         "limit": limit
//                     }
//                     callback(null,data)
//                 }
//             });
//         }
//     });
// }
// const getMemberByisManager = (params,callback)=>{
//     let pageNo = parseInt(params.pageNo);
//     let startFrom =  params.limit*(pageNo-1);
//     let limit = parseInt(params.limit);
//     User.count({ "dua": false ,isManager: true ,"IsDeleted": false},(err,count)=>{
//         if(err){
//             callback(err,null)
//         }else{
//             User.aggregate(
//                 [
//                     { $match: { "dua": false ,isManager: true ,"IsDeleted": false}},
//                     {
//                         $skip:parseInt(startFrom)
//                     },
//                     {
//                         $limit:limit
//                     },
//                     { $sort: { created_at: -1 } },
//                     {
//                         $lookup: {
//                             from: "logins",
//                             localField: "_id",
//                             foreignField: "memberId",
//                             as: "deviceToken" // to get all the views, comments, shares count
//                         }
//                     },
//                     {
//                         $project: {
//                             username: 1,
//                             mobileNumber: 1,
//                             avtar_imgPath: 1,
//                             avtar_originalname: 1,
//                             imageRatio: 1,
//                             password: 1,
//                             email: 1,
//                             name: 1,
//                             firstName: 1,
//                             lastName: 1,
//                             prefix: 1,
//                             aboutMe: 1,
//                             location: 1,
//                             country: 1,
//                             loginType: 1,
//                             role: 1,
//                             gender: 1,
//                             dateOfBirth: 1,
//                             address: 1,
//                             referralCode: 1,
//                             cumulativeSpent: 1,
//                             cumulativeEarnings: 1,
//                             lastActivity: 1,
//                             profession: 1,
//                             industry: 1,
//                             userCategory: 1,
//                             liveStatus: 1,
//                             status: 1,
//                             isCeleb: 1,
//                             isTrending: 1,
//                             isOnline: 1,
//                             isEditorChoice: 1,
//                             isPromoted: 1,
//                             isEmailVerified: 1,
//                             isMobileVerified: 1,
//                             emailVerificationCode: 1,
//                             mobileVerificationCode: 1,
//                             celebRecommendations: 1,
//                             Dnd: 1,
//                             celebToManager: 1,
//                             author_status: 1,
//                             iosUpdatedAt: 1,
//                             created_at: 1,
//                             updated_at: 1,
//                             created_by: 1,
//                             updated_by: 1,
//                             IsDeleted: 1,
//                             isPromoter: 1,
//                             isManager: 1,
//                             managerRefId: 1,
//                             promoterRefId: 1,
//                             charityRefId: 1,
//                             celebCredits: 1,
//                             deviceToken: "$deviceToken.deviceToken"
//                         }
//                     }
//                 ],
//             (err, result)=> {
//                 if (err) {
//                     callback(err,null)
//                 }else{
//                     let data = {};
//                     data.result = result
//                     let total_pages = count/limit
//                     let div = count%limit;
//                     data.pagination ={
//                         "total_count": count,
//                         "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
//                         "current_page": pageNo,
//                         "limit": limit
//                     }
//                     callback(null,data)
//                 }
//             });
//         }
//     });
//   }

// const getAll = (params,callback)=>{
//     let pageNo = parseInt(params.pageNo);
//     let startFrom =  params.limit*(pageNo-1);
//     let limit = parseInt(params.limit);
//     Admin.count({},(err, count)=> {
//         if(err){
//             callback(err,null)
//         }else{
//             Admin.find({},(err, result)=> {
//                 if(err){
//                     callback(err,null)
//                 }else{
//                     let data = {};
//                     data.result = result
//                     let total_pages = count/limit
//                     let div = count%limit;
//                     data.pagination ={
//                         "total_count": count,
//                         "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
//                         "current_page": pageNo,
//                         "limit": limit
//                     }
//                     callback(null,data)
//                 }
//             }).sort({ createdAt: -1 }).skip(startFrom).limit(limit);
//         }
//     })
// }

// const getFanCount = (params, callback) => {
//     let pageNo = parseInt(params.pageNo);
//     let startFrom = params.limit * (pageNo - 1);
//     let limit = parseInt(params.limit);

//     User.count({ isCeleb:true,IsDeleted:false,dua:false}, (err, count) => {
//         //console.log("count",count);
//         if (err) {
//             callback(err, null)
//         } else {
//             User.aggregate(
//                 [
//                     { $match: { isCeleb:true,IsDeleted:false,dua:false} },
//                     {
//                         $skip: parseInt(startFrom)
//                     },
//                     {
//                         $limit: limit
//                     },
//                     { $sort: { created_at: -1 } },
//                     {
//                         $limit: limit
//                     },
//                     {
//                         $lookup: {
//                             from: "memberpreferences",
//                             localField: "_id",
//                             foreignField: "memberId",
//                             as: "fans" // to get all the views, comments, shares count
//                         }
//                     },
//                   { "$unwind": "$fans" },
//                   {
//                         $project: {
//                             memberId:1,
//                             // username: "$celeb.username",
//                             // mobileNumber: "$celeb.mobileNumber",
//                             // avtar_imgPath:"$celeb.avtar_imgPath",
//                             // email: "$celeb.email",
//                             // firstName: "$celeb.firstName",
//                             // lastName:"$celeb.lastName",
//                             // isCeleb: "$celeb.isCeleb",
//                             //celebrities:1,
//                             fans:1
//                             // username: "$fans.username",
//                             // mobileNumber: "$fans.mobileNumber",
//                             // avtar_imgPath:"$fans.avtar_imgPath",
//                             // email: "$fans.email",
//                             // firstName: "$fans.firstName",
//                             // lastName:"$fans.lastName",
//                             // isCeleb: "$fans.isCeleb",
//                             //fansCount:{$size:"$fans"},
//                         }
//                     }
                   
//                 ],
//                 (err, result) => {
//                     if (err) {
//                         callback(err, null)
//                     } else {
//                         let data = {};
//                         //console.log("celebrities",result[0])
//                         data.result = result;
//                         let total_pages = count / limit;
//                         let div = count % limit;
//                         //console.log("pavan",data.result)
//                         let test = data.result;
//                         for(let i=0;i<=test.length;i++){
                            
//                             //console.log("celebrities",result[i].fans.celebrities.isFan=true)
//                             if(result[i].fans.celebrities.isFan=true){
//                             //console.log(result[i].isFan)
//                             }
//                             //console.log(test[i].fans[j].length)
        
//                         }
//                         //console.log("pavan", result[0].fans[0])
//                         data.pagination = {
//                             "total_count": count,
//                             "total_pages": div == 0 ? total_pages : parseInt(total_pages) + 1,
//                             "current_page": pageNo,
//                             "limit": limit
//                         }
//                         callback(null, data)
//                     }
//                 });
//         }
//     });
// }
// // const getFanCount = (params, callback) => {
// //     let pageNo = parseInt(params.pageNo);
// //     let startFrom = params.limit * (pageNo - 1);
// //     let limit = parseInt(params.limit);

// //     User.count({ isCeleb:true,IsDeleted:false,dua:false}, (err, count) => {
// //         //console.log("count",count);
// //         if (err) {
// //             callback(err, null)
// //         } else {
// //             User.aggregate(
// //                 [
// //                     { $match: { isCeleb:true,IsDeleted:false,dua:false} },
// //                     {
// //                         $skip: parseInt(startFrom)
// //                     },
// //                     {
// //                         $limit: limit
// //                     },
// //                     { $sort: { created_at: -1 } },
// //                     {
// //                         $limit: limit
// //                     },
// //                     {
// //                         $lookup: {
// //                             from: "memberpreferences",
// //                             localField: "_id",
// //                             foreignField: "memberId",
// //                             as: "fans" // to get all the views, comments, shares count
// //                         }
// //                     },
// //                   { "$unwind": "$fans" },
// //                   {
// //                         $project: {
// //                             memberId:1,
// //                             // username: "$celeb.username",
// //                             // mobileNumber: "$celeb.mobileNumber",
// //                             // avtar_imgPath:"$celeb.avtar_imgPath",
// //                             // email: "$celeb.email",
// //                             // firstName: "$celeb.firstName",
// //                             // lastName:"$celeb.lastName",
// //                             // isCeleb: "$celeb.isCeleb",
// //                             //celebrities:1,
// //                             fans:1
// //                             // username: "$fans.username",
// //                             // mobileNumber: "$fans.mobileNumber",
// //                             // avtar_imgPath:"$fans.avtar_imgPath",
// //                             // email: "$fans.email",
// //                             // firstName: "$fans.firstName",
// //                             // lastName:"$fans.lastName",
// //                             // isCeleb: "$fans.isCeleb",
// //                             //fansCount:{$size:"$fans"},
// //                         }
// //                     }
                   
// //                 ],
// //                 (err, result) => {
// //                     if (err) {
// //                         callback(err, null)
// //                     } else {
// //                         let data = {};
// //                         //console.log("celebrities",result[0])
// //                         data.result = result;
// //                         let total_pages = count / limit;
// //                         let div = count % limit;
// //                         //console.log("pavan",data.result)
// //                         let test = data.result;
// //                         for(let i=0;i<=test.length;i++){
                            
// //                             //console.log("celebrities",result[i].fans.celebrities.isFan=true)
// //                             if(result[i].fans.celebrities.isFan=true){
// //                             //console.log(result[i].isFan)
// //                             }
// //                             //console.log(test[i].fans[j].length)
        
// //                         }
// //                         //console.log("pavan", result[0].fans[0])
// //                         data.pagination = {
// //                             "total_count": count,
// //                             "total_pages": div == 0 ? total_pages : parseInt(total_pages) + 1,
// //                             "current_page": pageNo,
// //                             "limit": limit
// //                         }
// //                         callback(null, data)
// //                     }
// //                 });
// //         }
// //     });
// // }
// //@admin reports
// //@methos Get
// //@access Admin
// const getTransaction = (params,body, callback) => {
//     let pageNo = parseInt(params.pageNo);
//     let startFrom = params.limit * (pageNo - 1);
//     let limit = parseInt(params.limit);5
//     let sDate = params.sDate;
//     let eDate = params.eDate;
//     var endDate = new Date();
//     var startDate = new Date();
//     var pastDate  = endDate.getDate()-7;
//     startDate.setDate(pastDate);
//     //console.log(endDate);
//     //console.log(startDate);
//     let d1;
//     let d2;
//     if((sDate == "null")&&(eDate == "null")){
//        //console.log("pavan") 
//        d1 = startDate;
//        d2 = endDate;
//     }else{
//         d1 = new Date(sDate);
//         d2 = new Date(eDate);
//         }
//         payCredits.find({ createdAt: {$gte: d1, $lt: d2} },(err, count1)=> {
//             console.log("count",count1.length);
//             if(err){
//                 callback(err,null)
//             }else{
//                     payCredits.aggregate([
//                         { $match: { createdAt: {$gte: d1, $lt: d2} }},
//                         //{ $match: { memberId: memberId} }
//                     { $sort: { createdAt: -1 } },
//                     { $skip:parseInt(startFrom)},
//                     {$limit:limit},
//                     {
//                         $lookup: {
//                             from: "users",
//                             localField: "memberId",
//                             foreignField: "_id",
//                             as: "celebs" // to get all the views, comments, shares count
//                         }
//                     },
//                     {
//                         $lookup: {
//                             from: "users",
//                             localField: "celebId",
//                             foreignField: "_id",
//                             as: "users" // to get all the views, comments, shares count
//                         }
//                     },
//                     { "$unwind": "$users" },
//                     { "$unwind": "$celebs" },
//                     {
//                         $project: {
//                             payType:1,
//                             creditValue:1,
//                             celebPercentage:1,
//                             managerPercentage:1,
//                             celebKonnectPercentage:1,
//                             memberId:1,
//                             celebId:1,
//                             createdAt:1,
//                             userFirstName: "$users.firstName",
//                             userLastName: "$users.lastName",
//                             celebFirstName: "$celebs.firstName",
//                             celebLastName: "$celebs.lastName"
//                         }
//                     }
                    
//                 ], (err, feedDetails) => {
//                     //console.log("feedDetails",feedDetails);
//                     if (err) {
//                         callback(err, null)
//                     } else {
//                         let data = {};
//                         data.result = feedDetails;
//                         let count = count1.length;
//                         let total_pages = count/limit;
//                         let div = parseInt(total_pages);
//                         var totalCredits = 0;
//                     var celebkonectCredits = 0;
//                     var celebCredits = 0;
//                     var managerCredits = 0;
//                     for(i=0;i<count1.length;i++){
//                         //console.log(feedDetails[i].creditValue);
//                         totalCredits = totalCredits + count1[i].creditValue;
//                         celebkonectCredits = celebkonectCredits + count1[i].celebKonnectPercentage;
//                         celebCredits = celebCredits + count1[i].celebPercentage;
//                         managerCredits = managerCredits + count1[i].managerPercentage;
//                     }
//                         let total_pages1;
//                         if (div == 0){
//                             total_pages1 = div+1
//                         }else if(div > total_pages){
//                             total_pages1 = total_pages+1
//                         }
//                             else
//                         total_pages1 = div
//                         data.pagination ={
//                             "total_count": count,
//                             "total_pages": total_pages1,
//                             "current_page": pageNo,
//                             "limit": limit,
//                             "totalCredits":totalCredits ,
//                             "celebkonectCredits":celebkonectCredits ,
//                             "celebCredits" :celebCredits,
//                             "managerCredits":managerCredits,
//                             "startDate":d1,
//                             "endDate":d2
//                         }
//                         callback(null,data)
//                     }
//                 })
                
//             }
//         })


    
// }
// //@admin reports
// //@methos Get
// //@access Admin
// const getTransactionSearch = (params,body, callback) => {
//     let pageNo = parseInt(body.pageNo);
//     let startFrom = body.limit * (pageNo - 1);
//     //console.log("startFrom",startFrom);
//     let limit = parseInt(body.limit);
//     let startDate1 = new Date(body.startDate);
//     let endDate1 = new Date(body.endDate);
//     let celebId = body.celebId;
//     let payType = body.payType;
//     //console.log("payType",payType);
//     //console.log("celebId",celebId);
//     //{createdAt: {$gte: startDate, $lt: endDate}},
//     //{ $or: [ { celebId},{$and:[{celebId:celebId},{payType:payType}]}] }
//     let query = []
//     if (celebId != null && celebId != "null" && !body.payType && !body.startDate) {
//         //console.log("test");
//         query.push({ memberId: ObjectId(celebId) });
//         //query = {celebId:celebId}
//     } else if(celebId != null && celebId != "null" && payType != null && payType != "null" && !body.startDate) {
//         //console.log("test1");
//         query.push({ memberId: ObjectId(celebId) },{ payType: payType});
//         //query = {payType:payType}
//     }
//     else if(celebId != null && celebId != "null" && payType != null && payType != "null" && body.startDate !=null && body.startDate !="null"&& body.endDate !=null && body.endDate !="null") {
//        // console.log("test2");
//         query.push({ memberId: ObjectId(celebId) },{ payType: payType},{createdAt: {$gte: startDate1, $lt: endDate1} });
//         //query = {payType:payType}
//     }
//     else if(celebId != null && celebId != "null" && body.startDate !=null && body.startDate !="null"&& body.endDate !=null && body.endDate !="null" && !body.payType) {
//        // console.log("test2");
//         query.push({ memberId: ObjectId(celebId) },{createdAt: {$gte: startDate1, $lt: endDate1} });
//         //query = {payType:payType}
//     }
//     else if (payType != null && payType != "null" && !body.celebId && !body.startDate) {
//         console.log("test");
//         query.push({ payType: payType });
//         //query = {celebId:celebId}
//     }
//     else if (body.startDate !=null && body.startDate !="null"&& body.endDate !=null && body.endDate !="null" && !body.payType && !body.celebId) {
//         //console.log("test");
//         query.push({createdAt: {$gte: startDate1, $lte: endDate1} });
//         //query = {celebId:celebId}
//     }
//     else if(payType != null && payType != "null" && body.startDate !=null && body.startDate !="null"&& body.endDate !=null && body.endDate !="null" && !body.celebId) {
//         // console.log("test2");
//          query.push({ payType: payType },{createdAt: {$gte: startDate1, $lt: endDate1} });
//          //query = {payType:payType}
//      }
//     //console.log("query",query);
    
//             payCredits.aggregate([
//                 { $match:  {$and:query}},
//             { $sort: { createdAt: -1 } },
  
//         ], (err, tDetails) => {
//             //console.log("feedDetails",tDetails.length);
//             if (err) {
//                 callback(err, null)
//             } else {
//                 //callback(null,data)
//                 payCredits.aggregate([
//                     //{ $match: { celebId,createdAt: {$gte: startDate, $lt: endDate}}},
//                     //{ $match:  { $or: [ { celebId }, {createdAt: {$gte: startDate, $lt: endDate}},{$and: [ {celebId},{$gte: startDate, $lt: endDate } ]} ] }},
//                     { $match:  {$and:query}},
                    
//                     //{ $match: { memberId: memberId} }
//                 { $sort: { createdAt: -1 } },
//                 { $skip:parseInt(startFrom)},
//                 { $limit:parseInt(limit)},
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "memberId",
//                         foreignField: "_id",
//                         as: "celebs" // to get all the views, comments, shares count
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "celebId",
//                         foreignField: "_id",
//                         as: "users" // to get all the views, comments, shares count
//                     }
//                 },
//                 { "$unwind": "$users" },
//                 { "$unwind": "$celebs" },
//                 {
//                     $project: {
//                         payType:1,
//                         creditValue:1,
//                         celebPercentage:1,
//                         managerPercentage:1,
//                         celebKonnectPercentage:1,
//                         memberId:1,
//                         celebId:1,
//                         createdAt:1,
//                         userFirstName: "$users.firstName",
//                         userLastName: "$users.lastName",
//                         celebFirstName: "$celebs.firstName",
//                         celebLastName: "$celebs.lastName"
//                         //totalValue : { $sum: "$creditValue" }
//                     }
//                 }
                
//             ], (err, feedDetails) => {
//                 console.log("feedDetails",feedDetails);
//                 if (err) {
//                     callback(err, null)
//                 } else {
//                     let data = {};
//                     data.result = feedDetails
//                     let count = tDetails.length;
//                     //console.log("count",feedDetails);
//                     var totalCredits = 0;
//                     var celebkonectCredits = 0;
//                     var celebCredits = 0;
//                     var managerCredits = 0;
//                     for(i=0;i<tDetails.length;i++){
//                         //console.log(feedDetails[i].creditValue);
//                         totalCredits = totalCredits + tDetails[i].creditValue;
//                         celebkonectCredits = celebkonectCredits + tDetails[i].celebKonnectPercentage;
//                         celebCredits = celebCredits + tDetails[i].celebPercentage;
//                         managerCredits = managerCredits + tDetails[i].managerPercentage;
//                     }
//                     //console.log("total",total)
//                     let total_pages = parseInt(count/limit);
                    
//                     let div =  count/limit;
//                     //console.log("div",div)
//                     let total_pages1;
//                     if (div == 0){
//                         total_pages1 = div+1
//                     }else if(div > total_pages){
//                         total_pages1 = total_pages+1
//                     }
//                         else
//                     total_pages1 = div
//                     //let total_pages1;
//                     // if (total_pages == 0){
//                     //     total_pages1 = total_pages+1;
//                     // }else if(total_pages > 0){
//                     //     total_pages1 = total_pages;
//                     // }
//                     data.pagination ={
//                         "total_count": count,
//                         "total_pages": total_pages1,
//                         "current_page": pageNo,
//                         "limit": limit,
//                         "totalCredits":totalCredits ,
//                         "celebkonectCredits":celebkonectCredits ,
//                         "celebCredits" :celebCredits,
//                         "managerCredits":managerCredits
//                     }
//                     callback(null,data)
//                 }
//             })
//             }
//         })   
// }

// //@admin reports
// //@methos Get
// //@access Admin
// const getPayments = (params,body, callback) => {
//     let pageNo = parseInt(body.pageNo);
//     let startFrom = body.limit * (pageNo - 1);
//     //console.log("startFrom",startFrom);
//     let limit = parseInt(body.limit);
//     let startDate1 = new Date(body.startDate);
//     let endDate1 = new Date(body.endDate);
//     let memberId = body.memberId;
//     let paymentGateway = body.paymentGateway;
//     //console.log("payType",payType);
//     //console.log("celebId",celebId);
//     //{createdAt: {$gte: startDate, $lt: endDate}},
//     //{ $or: [ { celebId},{$and:[{celebId:celebId},{payType:payType}]}] }
//     let query = []
//     if(paymentGateway != null && paymentGateway != "null" && !body.startDate) {
//         //console.log("test");
//         query.push({ paymentGateway: paymentGateway });
//         //query = {celebId:celebId}
//     } else if (body.startDate !=null && body.startDate !="null"&& body.endDate !=null && body.endDate !="null" && !body.paymentGateway) {
//         //console.log("test");
//         query.push({createdAt: {$gte: startDate1, $lt: endDate1} });
//         //query = {celebId:celebId}
//     }
//     else if (body.startDate !=null && body.startDate !="null"&& body.endDate !=null && body.endDate !="null" && body.paymentGateway !=null && body.paymentGateway !="null") {
//         //console.log("test");
//         query.push({ paymentGateway: paymentGateway },{createdAt: {$gte: startDate1, $lt: endDate1} });
//         //query.push({createdAt: {$gte: startDate1, $lt: endDate1},{ paymentGateway: paymentGateway} });
//         //query = {celebId:celebId}
//     }
//     //console.log("query",query);
    
//     paymenttransactions.aggregate([
//         { $match:  {"paymentStatus" : "Success" }},
//             { $sort: { createdAt: -1 } },
  
//         ], (err, tDetails) => {
//             //console.log("feedDetails",tDetails.length);
//             if (err) {
//                 callback(err, null)
//             } else {
//                 //callback(null,data)
//                 paymenttransactions.aggregate([
//                     //{ $match: { celebId,createdAt: {$gte: startDate, $lt: endDate}}},
//                     //{ $match:  { $or: [ { celebId }, {createdAt: {$gte: startDate, $lt: endDate}},{$and: [ {celebId},{$gte: startDate, $lt: endDate } ]} ] }},
//                     { $match:  {$and:query,paymentStatus: "Success"}},
                    
//                     //{ $match: { memberId: memberId} }
//                 { $sort: { createdAt: -1 } },
//                 { $skip:parseInt(startFrom)},
//                 { $limit:parseInt(limit)},
//                 // {
//                 //     $lookup: {
//                 //         from: "users",
//                 //         localField: "memberId",
//                 //         foreignField: "_id",
//                 //         as: "celebs" // to get all the views, comments, shares count
//                 //     }
//                 // },
//                  {
//                     $lookup: {
//                         from: "users",
//                         localField: "memberId",
//                         foreignField: "_id",
//                         as: "users" // to get all the views, comments, shares count
//                     }
//                 },
//                   { "$unwind": "$users" },
//                 // { "$unwind": "$celebs" },
//                 {
//                     $project: {
//                         packageRefId:1,
//                         _id:1,
//                         memberId:1,
//                         refCartId:1,
//                         paymentType:1,
//                         paymentGateway:1,
//                         celebId:1,
//                         createdAt:1,
//                         transactionRefId:1,
//                         gstAmount:1,
//                         actualAmount:1,
//                         equivalentAmount:1,
//                         creditValue:1,
//                         paymentStatus:1,
//                         userFirstName: "$users.firstName",
//                         userLastName: "$users.lastName",
                       
//                         //totalValue : { $sum: "$creditValue" }
//                     }
//                 }
                
//             ], (err, feedDetails) => {
//                 //console.log("feedDetails",feedDetails);
//                 if (err) {
//                     callback(err, null)
//                 } else {
//                     let data = {};
//                     data.result = feedDetails
//                     let count = feedDetails.length;
//                     //console.log("count",feedDetails);
//                     var totalCredits = 0;
//                     var totalGstValue = 0;
//                     var totalEquivalentAmount = 0;
//                     for(i=0;i<feedDetails.length;i++){
//                         //console.log(feedDetails[i].creditValue);
//                         totalCredits = totalCredits + feedDetails[i].creditValue;
//                         totalGstValue = totalGstValue + feedDetails[i].gstAmount;
//                         totalEquivalentAmount = totalEquivalentAmount + feedDetails[i].equivalentAmount;
//                     }
//                     //console.log("total",total)
//                     let total_pages = parseInt(count/limit);
                    
//                     let div =  count/limit;
//                     //console.log("div",div)
//                     let total_pages1;
//                     if (div == 0){
//                         total_pages1 = div+1
//                     }else if(div > total_pages){
//                         total_pages1 = total_pages+1
//                     }
//                         else
//                     total_pages1 = div
//                     //let total_pages1;
//                     // if (total_pages == 0){
//                     //     total_pages1 = total_pages+1;
//                     // }else if(total_pages > 0){
//                     //     total_pages1 = total_pages;
//                     // }
//                     data.pagination ={
//                         "total_count": count,
//                         "total_pages": total_pages1,
//                         "current_page": pageNo,
//                         "limit": limit,
//                         "totalCredits":totalCredits ,
//                         "totalCredits":totalCredits,
//                         "totalGstValue":totalGstValue,
//                         "totalEquivalentAmount":totalEquivalentAmount  
//                     }
//                     callback(null,data)
//                 }
//             })
//             }
//         })   
// }


// module.exports = {
//     getMemberByisCelebAdmin:getMemberByisCelebAdmin,
//     getMemberByisManager:getMemberByisManager,
//     getAll: getAll,
//     getFanCount: getFanCount,
//     getTransaction:getTransaction,
//     getTransactionSearch:getTransactionSearch,
//     getPayments:getPayments

// }