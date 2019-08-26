let loginServices = require('./loginServices');
let async = require('async');
let User = require('../users/userModel');
let userService = require('../users/userService');
let ObjectId = require('mongodb').ObjectId;
let OTPServices = require('../otp/otpRouter');
let LoginInfo = require('./loginInfoModel');

let resetPassword = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let message = "An Error occurred, please try again"
    async.waterfall([
        function (callback) {
            User.getUserById(ObjectId(memberId), (err, userObj) => {
                if (err) {
                    return res.status(404).json(new Error(`Error while fetching the user details : ${err}`), null);
                } else {
                    return callback(null, userObj)
                }
            });
        }, function (userObj, callback) {
            if (req.body.byOtp == false && req.body.mode == "") {
                User.comparePassword(req.body.oldPassword, userObj.password, (err, isMatch) => {
                    if (err) {
                        return callback(new Error(`Error while matching the password :${err}`), null, null)
                    } else if (!isMatch) {
                        message = "The password provided is invalid";
                        return callback(`wrong password`, null, null)
                    }
                    else {
                        message = "The password confirmation does match.";
                        return callback(null, userObj, message)
                        // userService.resetPasswordById(userObj, req.body.newPassword, (err, passwordUpdatedObj) => {
                        //     if (err)
                        //         return callback(new Error(`Error while updating the password:${err}`), null, null);
                        //     else {
                        //         message = "Success! Your Password has been changed!";
                        //         return callback(null, userObj, message)
                        //     }
                        // })
                    }
                })
            }  else
                return callback(null, userObj, message)
        }, function (userObj, message, callback) {
            if (req.body.byOtp == true) {
                if (req.body.mode == "getOTP") {
                    OTPServices.getOTP(req.body.medium, userObj.mobileNumber, userObj.email, "", (err, otpResponse) => {
                        if (err)
                            return callback(new Error(`Error while sending otp: ${err}`), null, null);
                        else {
                            // if (req.body.medium == "mobile")
                            //     message = "otp sent successfully on registered mobile number!";
                            // else if (req.body.medium == "email")
                            //     message = "otp sent successfully on registered email id!";
                            callback(null, userObj, otpResponse)
                        }
                    })
                } else if (req.body.mode = "verifyOTP") {
                    OTPServices.verifyOTP(req.body.medium, userObj.mobileNumber, userObj.email, req.body.OTP, (err, varifiedOTP) => {
                        if (err)
                            return callback(err, null, null);
                        //return callback(new Error(`Error while verify otp: ${err}`), null, null);
                        else {
                            if (varifiedOTP == "OTP verified successfully") {
                                // message = "OTP verified successfully";
                                return callback(null, userObj, varifiedOTP)
                                // userService.resetPasswordById(userObj, req.body.newPassword, (err, updatedPasswordObj) => {
                                //     if (err)
                                //         return callback(new Error(`Error while updating the password:${err}`), null, null);
                                //     else {
                                //         message = "OTP verified successfully";
                                //         return callback(null, userObj, message)
                                //     }
                                // })
                            } else {
                                message = varifiedOTP;
                                callback(null, userObj, message)
                            }
                        }
                    });
                }
            } else {
                return callback(null, userObj, message)
            }
        },
        function(userObj, message, callback){
             if (req.body.mode == "setPassword") {
                userService.resetPasswordById(userObj, req.body.newPassword, (err, updatedPasswordObj) => {
                    if (err)
                        return res.status(404).json({ success: 0, message: "Error while reset the password..." })
                    else {
                        message = "Success! Your Password has been changed!";
                        return res.status(200).json({ success: 1, data: userObj, message: message })
                    }
                });
            }else
            return callback(null, userObj, message)
        }
    ], function (err, userObj, resetPasswordObj) {
        //console.log(err)
        if (err) {
            if (err == "wrong password") {
                return res.status(200).json({ success: 0, message: "The password provided is invalid" })
            } else if (err == "Invalid OTP." ||  err == "Invalid OTP. Please try again." || err == "Maximum limit reached please resend otp" || err == "Already verified!!" || err == "OTP Expired!!" || err == "OTP incorrect. Please provide correct OTP or resend.") {
                return res.status(200).json({ success: 0, message: err })
            } else {
                return res.json({ success: 0, message: `${err}` })
            }
        }
        else {
            res.status(200).json({ success: 1, message: resetPasswordObj });
        }
    })
}

let forgotPassword = (req, res) => {
    // console.log("**************************************")
    // console.log(req.body)
    // console.log("**************************************")
    let query = {}
    let message;
    message = req.body.emailOrMobileNumber +" doesn't match an existing account.";
    userService.getUserByEmailMobileNumberUsername(req.body.emailOrMobileNumber, (err, userObj) => {
        // console.log(err)
        if (err)
            return res.status(404).json({ success: 0, message: "Error while fetching user details..." });
        else if (!userObj || userObj == null) {
            return res.status(200).json({ success: 0, message: message });
        } else {
            if (req.body.mode == "getUserDetails") {
                //message = "";
                return res.status(200).json({ success: 1, data: userObj })
            }
            else if (req.body.mode == "getOTP") {
                OTPServices.getOTP(req.body.medium, userObj.mobileNumber, userObj.email, "", (err, otpResponse) => {
                    if (err)
                        return res.status(404).json({ success: 0, message: "Error while sending otp..." });
                    else {
                        if (req.body.medium == "mobile")
                            message = "OTP sent Successfully.";
                        else if (req.body.medium == "email")
                            message = "OTP sent Successfully.";
                        return res.status(200).json({ success: 1, data: userObj, message: message })
                    }
                })
            } else if (req.body.mode == "verifyOTP") {
                OTPServices.verifyOTP(req.body.medium, userObj.mobileNumber, userObj.email, req.body.OTP, (err, varifiedOTP) => {
                    // console.log(err)
                    if (err) {
                        if (err == "Invalid OTP." ||  err == "Invalid OTP. Please try again." || err == "Maximum limit reached please resend otp" || err == "Already verified!!" || err == "OTP Expired!!" || err == "OTP incorrect. Please provide correct OTP or resend.") {
                            return res.status(200).json({ success: 0, message: err })
                        } else
                            return res.status(404).json({ success: 0, message: "Error while verify OTP..." })
                    }
                    else {
                        if (varifiedOTP == "OTP verified successfully") {
                            return res.status(200).json({ success: 1, data: userObj, message: varifiedOTP })
                        } else {
                            return res.status(200).json({ success: 0, data: userObj, message: varifiedOTP })
                        }
                    }
                });
            } else if (req.body.mode == "setPassword") {
                userService.resetPasswordById(userObj, req.body.newPassword, (err, updatedPasswordObj) => {
                    if (err)
                        return res.status(404).json({ success: 0, message: "Error while reset the password..." })
                    //return callback(new Error(`Error while updating the password:${err}`), null, null);
                    else {
                        message = "Success! Your Password has been changed!";
                        return res.status(200).json({ success: 1, data: userObj, message: message });
                    }
                });
            }

        }
    })
}

const switchToAnotherAccount = (req,res)=>{
    let celebId  = req.body.celebId;
    let managerId  = req.body.managerId;   
    let deviceToken =  req.body.deviceToken;
    let switched = req.body.switched;
    loginServices.switchToAnotherAccount(celebId,managerId,deviceToken,switched,(err,userInfo)=>{
        if(err){
            res.json({success:0,err:err,data:err})
        }else{
            res.json({success:1,data:userInfo})
        }
    })
}

let loginController = {
    resetPassword: resetPassword,
    forgotPassword: forgotPassword,
    switchToAnotherAccount:switchToAnotherAccount
}

module.exports = loginController;