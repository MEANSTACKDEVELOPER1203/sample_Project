var jwt = require('jsonwebtoken');
var config = require('./config');
const Logins = require("../components/loginInfo/loginInfoModel");
const Admin = require('../components/admin/adminModel');
var _ = require('underscore')
var nonSecurePaths = ['/', 'logininfo/verifyotp',
    '/logininfo/verifyotp', '/admin/login', '/feeddata/allFeed', '/admin/getMemberByisCeleb/',
    '/about', '/contact', '/splashscreen/splashscreenbycountry/', '/users/getCurrentToken',
    '/appCms/getfaqs', '/appCms/contactuspage', '/appCms/aboutuspage',
    '/countries/getAll/', '/notification/getNotificationsCount/', '/comLog/contactUs',
    '/appupdate/appupdateinfo', '/logininfo/resetPasswordByEmail', '/livetimelog/updateLiveLogStatus',
    '/users/memberRegistrations', '/users/socialRegister', '/logininfo/logout/', '/logininfo/login', 'admin/login'];

var jwtAuth = {
    createToken: (userId) => {
        var token = jwt.sign({ id: userId }, config.secret, {
            expiresIn: config.tokenLife
            // expires in 30 days
        });
        var refreshToken = jwt.sign({ id: userId }, config.refreshTokenSecret, {
            expiresIn: config.tokenLife
            // expires in 30 days
        });
        return token;
    },
    verifyToken: (req, res, next) => {
        // console.log("path", req.path)
        // console.log("**********************************************************")
        // console.log(req.headers)
        // console.log("**********************************************************")
        return next();

        // if (req.path.search('splashscreen/splashscreenbycountry') != -1) {
        //     next();
        // }
        // else if (req.path.search('users/memberRegistrationAndProfileUpdate') != -1 && req.body.loginType !="socialLogin") {
        //     next();
        // }
        // else if(req.path.search('users/memberRegistrationAndProfileUpdate') != -1 && req.body.loginType =="socialLogin"){
        //     if(req.body.secureNewLogin == false)
        //     {
        //         Logins.findOne({email:req.body.email}, { deviceToken: 1 }, (err, loginInfo) => {
        //             if (err)
        //                 return res.json({ success: 0, message: `Please try again ${err}`, "token": token })
        //             else if (loginInfo) {
        //                 if (loginInfo.deviceToken && req.body.deviceToken != loginInfo.deviceToken) {
        //                     //console.log("secure logout");
        //                     return res.json({
        //                         "success": 2,
        //                         "message": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
        //                         //"deviceToken": userInfo.deviceToken,
        //                         //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
        //                         "token": token,
        //                         //   "data": userInfor
        //                     });

        //                 }
        //                 else {
        //                     next();
        //                 }
        //             }
        //             else {
        //                 next();
        //             }
        //         })
        //     }else{
        //         next();
        //     }
        // }
        // else if (req.path.search('/avtars/') != -1 || req.path.search('/uploads/') != -1) {
        //     next();
        // }
        // else if (req.headers.notsecure == true || req.headers.notsecure == 'true') {
        //     next();
        // }
        // else if (req.path.search('verifyEmail') != -1 || req.path.search('verifyMobile') != -1 || req.path.search('/logininfo/reset') != -1) {
        //     next();
        // }
        // else if (req.path.search('shareAudition') != -1 || req.path.search('shareAuitionProfile') != -1 || req.path.search('shareFeed') != -1) {
        //     next();
        // }
        // else if (req.path.search('/shareRouter/shareFeed/') != -1) {
        //     next();
        // }
        // else if (req.path.search('/ientertain/createIentertain') != -1) {
        //     next();
        // }
        // else if (req.path.search('/ientertain/getIentertainByCategory/') != -1) {
        //     next();
        // }
        // else if (req.path.search('/ientertain/deleteIentertainById/') != -1) {
        //     next();
        // }
        // else if (req.path.search('/ientertain/getIentertainById/') != -1) {
        //     next();
        // }
        // else if (req.path.search('/ientertain/editIentertain/') != -1) {
        //     next();
        // }
        // //*********Dummy Services********* 
        //  else if (req.path.search('/dummy/api/deleteMembershipAccount/') != -1) {
        //     next();
        // }
        // else if (req.path.search('/dummy/api/removeFanFollow/') != -1) {
        //     next();
        // }
        // else if (req.path.search('/dummy/api/addCredits/') != -1) {
        //     next();
        // }
        // //********* End Dummy Services********* 
        // // else if (req.path.search('/feed/getFeedsNew/5c6aa6dc250d3114ffe670c0/') != -1) {
        // //     next();
        // // }
        // else if (req.path.search('/logininfo/forgotPassword') != -1) {
        //     next();
        // }
        // else if (req.body.secureNewLogin == false && req.path == '/logininfo/login' || req.path == '/users/socialRegister') {
        //     var token = req.headers['x-access-token'];
        //     let query = {
        //         $or: [
        //           { email: req.body.email.toLowerCase() },
        //           { mobileNumber: { $regex: req.body.email } }
        //         ]
        //       }
        //     Logins.findOne(query, { deviceToken: 1 }, (err, loginInfo) => {
        //         if (err)
        //             return res.json({ success: 0, message: `Please try again ${err}`, "token": token })
        //         else if (loginInfo) {
        //             if (loginInfo.deviceToken && req.body.deviceToken != loginInfo.deviceToken) {
        //                 //console.log("secure logout");
        //                 return res.json({
        //                     "success": 2,
        //                     "message": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
        //                     //"deviceToken": userInfo.deviceToken,
        //                     //"msgForWrongDeviceToken": "Greetings from CelebKonect! We have noticed that you are already logged on another device, Please try logging in from only single device to perform operations.",
        //                     "token": token,
        //                     //   "data": userInfor
        //                 });

        //             }
        //             else {
        //                 if (_.contains(nonSecurePaths, req.path)) {
        //                     return next();
        //                 }
        //                 else {
        //                     var token = req.headers['x-access-token'];
        //                     if (!token)
        //                         return res.json({ success: 3, auth: false, message: 'NetworkToken is not authenticated' });
        //                     jwt.verify(token, config.secret, function (err, decoded) {
        //                         if (err) {
        //                             if (err.name && err.name == "TokenExpiredError" || err.name == "JsonWebTokenError") {
        //                                 return res.json({ success: 4, auth: false, message: 'Token has expired' });
        //                             }
        //                             else {
        //                                 return res.json({ success: 5, auth: false, message: 'Failed to authenticate token.', err: err });
        //                             }
        //                         }
        //                         // if everything good, save to request for use in other routes
        //                         req.userId = decoded.id;
        //                         next();
        //                     });
        //                 }
        //             }
        //         }
        //         else {
        //             next();
        //         }
        //     })
        // }
        // else {
        //     //next();
        //     // console.log("$$$$$$")
        //     if (_.contains(nonSecurePaths, req.path)) {
        //         return next();
        //     }
        //     else {
        //         var token = req.headers['x-access-token'];
        //         console.log(token)
        //         if (!token)
        //             return res.json({ success: 3, auth: false, message: 'NetworkToken is not authenticated' });
        //         Logins.findOne({ token: token }, (err, loginInfo) => {
        //             if (err) {
        //                 return res.json({ success: 0, message: "Please try again" })
        //             }
        //             if (loginInfo) {
        //                 jwt.verify(token, config.secret, function (err, decoded) {
        //                     if (err) {
        //                         if (err.name && err.name == "TokenExpiredError" || err.name == "JsonWebTokenError") {
        //                             return res.json({ success: 4, auth: false, message: 'Token Expired' });
        //                         }
        //                         else {
        //                             return res.json({ success: 5, auth: false, message: 'Failed to authenticate token.', err: err });
        //                         }
        //                     }
        //                     // if everything good, save to request for use in other routes
        //                     req.userId = decoded.id;
        //                     next();
        //                 });
        //             }
        //             else {
        //                 Admin.findOne({ token: token }, { _id: 1 }, (err, data) => {
        //                     if (err) {
        //                         return res.json({ success: 0, message: 'plese try again' });
        //                     }
        //                     else if (data) {
        //                         next();
        //                     }
        //                     else {
        //                         return res.json({ success: 5, auth: false, message: 'Token Expired' });
        //                     }
        //                 })
        //             }
        //         })
        //     }
        // }
    }
}


module.exports = jwtAuth;