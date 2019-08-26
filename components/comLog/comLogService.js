let Comlog = require('./comLogModel')
let transport = require("../../routes/email").transport;
var async = require("async");
let logins = require("../loginInfo/loginInfoModel");
var crypto = require("crypto");
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('b4gGeksBlAv54P_igkBH-w');
var mySms = require('../../smsConfig');
let User = require("../users/userModel");
const config = require('../../config/config');

var createComLog = (comLogObject,req,callback) => {
    Comlog.createComLog(comLogObject, function (err, comLogObject) {
        if (err) {
            callback(err,null)
        } else {
        let to_addr = comLogObject.to_addr;
        if (comLogObject.mode_ids == "email") {
            // If event type is registration
            if (comLogObject.event == "register") {

            crypto.randomBytes(20, function (err, buf) {

                //// NEW TOKEN GENERATOR
                var token = Math.floor(100000 + Math.random() * 900000);
                /// END OF NEW TOKEN GENERATOR
                let url = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyEmail/" + to_addr + "/" + token;
                let mobileurl = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyMobile/" + to_addr;
                // Get LoginInfo By Email and Update Email Verification Code
                User.findOne({ email: to_addr.toLowerCase() }, function (err, lResult) {
                if (err) res.send(err);
                if (lResult) {
                    let id = lResult._id;
                    let newbody = {};
                    newbody.updated_at = new Date();
                    newbody.emailVerificationCode = token;
                    newbody.mobileVerificationCode = token;
                    let reqBody = {};
                    reqBody.mobileNumber = lResult.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
                    reqBody.regToken = token;

                    mySms.sendSms(reqBody, function (err, result) {
                        if (err) {
                            return callback(err,null)
                        } else {
                            return callback(null,result)
                        }
                    });

                    User.findByIdAndUpdate(id, newbody, function (err, result) { });
                } else {
                    console.log({ error: "Email not found / Invalid!" });
                }

                });
                // End of Get LoginInfo By Email and Update Email Verification Code

                var template_name = "reg";
                var template_content = [
                {
                    name: "verifyurl",
                    content: url
                },
                {
                    name: "verifymobile",
                    content: mobileurl
                },
                {
                    name: "mobileToken",
                    content: token
                }
                ];
                var message = {
                subject: "Registration Successful",
                from_email: "admin@celebkonect.com",
                from_name: "CelebKonect",
                to: [
                    {
                    email: to_addr,
                    name: to_addr,
                    type: "to"
                    }
                ],
                headers: {
                    "Reply-To": "keystroke99@gmail.com"
                },
                important: false,
                track_opens: null,
                track_clicks: null,
                auto_text: null,
                auto_html: null,
                inline_css: null,
                url_strip_qs: null,
                preserve_recipients: null,
                view_content_link: null,
                tracking_domain: null,
                signing_domain: null,
                return_path_domain: null,
                merge: true,
                merge_language: "mailchimp",
                global_merge_vars: [
                    {
                    name: "verifyurl",
                    content: url
                    },
                    {
                    name: "verifymobile",
                    content: mobileurl
                    },
                    {
                    name: "mobileToken",
                    content: token
                    }
                ],
                merge_vars: [
                    {
                    "rcpt": to_addr,
                    "vars": [
                        {
                        name: "verifyurl",
                        content: url
                        },
                        {
                        name: "verifymobile",
                        content: mobileurl
                        },
                        {
                        name: "mobileToken",
                        content: token
                        }
                    ]
                    }
                ],

                };
                var async = false;
                var ip_pool = "Main Pool";
                // var send_at = new Date();
                mandrill_client.messages.sendTemplate(
                {
                    template_name: template_name,
                    template_content: template_content,
                    message: message,
                    async: async,
                    ip_pool: ip_pool
                },
                function (result) {
                    if (err) {
                        return callback(err,null)
                    } else {
                        return callback(null,result)
                    }
                },
                function (e) {
                    return callback(err,null)
                }
                );
            });
            }
            else if (comLogObject.event == "socialRegister") {
                callback(null,event)
            } else if (comLogObject.event == "resendEmail") {
            crypto.randomBytes(20, function (err, buf) {
                var token = Math.floor(Math.random() * 1000000 + 54);
                let url = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyEmail/" + to_addr + "/" + token;
                let mobileurl = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyMobile/" + to_addr;
                // Get LoginInfo By Email and Update Email Verification Code
                User.findOne({ email: to_addr.toLowerCase() }, function (err, lResult) {
                if (err) res.send(err);
                if (lResult) {
                    let id = lResult._id;
                    let newbody = {};
                    newbody.updated_at = new Date();
                    newbody.emailVerificationCode = token;
                    newbody.mobileVerificationCode = token;
                    let reqBody = {};
                    reqBody.mobileNumber = lResult.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
                    reqBody.regToken = token;

                    User.findByIdAndUpdate(id, newbody, function (err, result) { });
                } else {
                    console.log({ error: "Email not found / Invalid!" });
                }

                });
                // End of Get LoginInfo By Email and Update Email Verification Code

                var template_name = "reg";
                var template_content = [
                {
                    name: "verifyurl",
                    content: url
                },
                {
                    name: "verifymobile",
                    content: mobileurl
                },
                {
                    name: "mobileToken",
                    content: token
                }
                ];
                var message = {
                subject: "Registration Successful",
                from_email: "admin@celebkonect.com",
                from_name: "CelebKonect",
                to: [
                    {
                    email: to_addr,
                    name: to_addr,
                    type: "to"
                    }
                ],
                headers: {
                    "Reply-To": "keystroke99@gmail.com"
                },
                important: false,
                track_opens: null,
                track_clicks: null,
                auto_text: null,
                auto_html: null,
                inline_css: null,
                url_strip_qs: null,
                preserve_recipients: null,
                view_content_link: null,
                tracking_domain: null,
                signing_domain: null,
                return_path_domain: null,
                merge: true,
                merge_language: "mailchimp",
                global_merge_vars: [
                    {
                    name: "verifyurl",
                    content: url
                    },
                    {
                    name: "verifymobile",
                    content: mobileurl
                    },
                    {
                    name: "mobileToken",
                    content: token
                    }
                ],
                merge_vars: [
                    {
                    "rcpt": to_addr,
                    "vars": [
                        {
                        name: "verifyurl",
                        content: url
                        },
                        {
                        name: "verifymobile",
                        content: mobileurl
                        },
                        {
                        name: "mobileToken",
                        content: token
                        }
                    ]
                    }
                ],

                };
                var async = false;
                var ip_pool = "Main Pool";
                // var send_at = new Date();
                mandrill_client.messages.sendTemplate(
                {
                    template_name: template_name,
                    template_content: template_content,
                    message: message,
                    async: async,
                    ip_pool: ip_pool
                },
                function (result) {
                    res.send({ message: "Verification email sent successfully!" });
                },
                function (e) {
                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                }
                );
            });
            }
            // If event type is Forogot password
            else if (comLogObject.event == "forgot") {
            async.waterfall(
                [
                function (done) {
                    crypto.randomBytes(20, function (err, buf) {
                    var token = Math.floor(Math.random() * 1000000 + 54);
                    done(err, token);
                    });
                },
                function (token, done, callback) {
                    logins.find({ email: to_addr }, function (err, user) {
                    if (err) {
                        return res.send(err);
                    }
                    if (user.length == 0) {
                        res.json({
                        error: "No account with that email address exists."
                        });
                    } else {
                        lid = user[0]._id;
                        logins.updateOne(
                        { _id: lid },
                        {
                            $set: {
                            resetPasswordToken: token,
                            resetPasswordExpires: Date.now() + 3600000
                            }
                        },
                        { new: true },
                        function (err, dude) {
                            done(err, token, user);
                        }
                        );
                    }
                    });
                },
                function (token, user, done) {
                    done(null, "done");
                    transport.sendMail(
                    {
                        to: to_addr,
                        from: "CelebKonect <admin@celebkonect.com>",
                        subject: "Password Reset",
                        html:
                        "<h3>You have requested to reset your password</h3> <p>Please <a href=" +
                        '"https://' +
                        req.headers.host +
                        "/logininfo" +
                        "/reset/" +
                        token +
                        '"' +
                        ">CLICK HERE</a> to reset your password.</p> <br> Please ignore this email if you did not request for a new password.<br> <p>Thank you,</p> <p>CelebKonect</p>"
                    },
                    function (err, info) {
                        //console.log(info)
                        if (err) {
                            return callback(err,null)
                        } else {
                            return callback(null,info)
                        }
                    }
                    );
                }
                ],
                function (err) {
                    if (err)
                    {
                        return callback(err,null)
                    }
                }
            );
            }
            // If event type if change password
            else if (comLogObject.event == "changePassword") {
            transport.sendMail(
                {
                to: to_addr,
                from: "CelebKonect <admin@celebkonect.com>",
                subject: "Password Reset",
                text: "Your password changed successfully"
                },
                function (err, info) {
                if (err) {
                    callback(err,null)
                } else {
                    // res.json({
                    // message:
                    //     "An e-mail has been sent to " +
                    //     user.to_addr +
                    //     " with further instructions."
                    // });
                    callback(null,info)
                }
                }
            );
            }
        } else {
            callback("other",null)
        }
        }
    });
}

module.exports = {
    createComLog:createComLog
}