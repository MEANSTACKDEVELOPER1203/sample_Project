// let express = require("express");
// let router = express.Router();
// let ObjectId = require("mongodb").ObjectID;
// let comLog = require("./comLogModel");
// var nodemailer = require("nodemailer");
// let transport = require("../../routes/email").transport;
// var async = require("async");
// let logins = require("../loginInfo/loginInfoModel");
// var crypto = require("crypto");
// var fs = require("fs");
// let ejs = require("ejs");
// var mandrill = require('mandrill-api/mandrill');
// var mandrill_client = new mandrill.Mandrill('b4gGeksBlAv54P_igkBH-w');
// var mySms = require('../../smsConfig');
// let User = require("../users/userModel");
// var generator = require('generate-password');
// const config = require('../../config/config');

// // Create a comLog
// router.post("/createComLog", function (req, res) {
//   let mode_ids = req.body.mode_ids;
//   let event = req.body.event;
//   let from_addr = req.body.from_addr;
//   let to_addr = req.body.to_addr;
//   let content = req.body.content;
//   let gateway_response = req.body.gateway_response;

//   let newComLog = new comLog({
//     mode_ids: mode_ids,
//     event: event,
//     from_addr: from_addr,
//     to_addr: to_addr,
//     content: content,
//     gateway_response: gateway_response
//   });

//   comLog.createComLog(newComLog, function (err, user) {
//     if (err) {
//       res.send(err);
//     } else {
//       if (mode_ids == "email") {
//         // If event type is registration
//         if (event == "register") {

//           crypto.randomBytes(20, function (err, buf) {

//             //// NEW TOKEN GENERATOR
//             var token = Math.floor(100000 + Math.random() * 900000);
//             /// END OF NEW TOKEN GENERATOR
//             let url = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyEmail/" + to_addr + "/" + token;
//             let mobileurl = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyMobile/" + to_addr;
//             // Get LoginInfo By Email and Update Email Verification Code
//             User.findOne({ email: to_addr.toLowerCase() }, function (err, lResult) {
//               if (err) res.send(err);
//               if (lResult) {
//                 let id = lResult._id;
//                 let newbody = {};
//                 newbody.updated_at = new Date();
//                 newbody.emailVerificationCode = token;
//                 newbody.mobileVerificationCode = token;
//                 let reqBody = {};
//                 reqBody.mobileNumber = lResult.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
//                 reqBody.regToken = token;

//                 mySms.sendSms(reqBody, function (err, result) {
//                   if (err) {
//                     console.log(err);
//                   } else {
//                     //console.log('OTP Sent');

//                   }
//                 });

//                 User.findByIdAndUpdate(id, newbody, function (err, result) { });
//               } else {
//                 console.log({ error: "Email not found / Invalid!" });
//               }

//             });
//             // End of Get LoginInfo By Email and Update Email Verification Code

//             var template_name = "reg";
//             var template_content = [
//               {
//                 name: "verifyurl",
//                 content: url
//               },
//               {
//                 name: "verifymobile",
//                 content: mobileurl
//               },
//               {
//                 name: "username",
//                 content: username
//             },
//               {
//                 name: "mobileToken",
//                 content: token
//               }
//             ];
//             var message = {
//               subject: "Registration Successful",
//               from_email: "admin@celebkonect.com",
//               from_name: "CelebKonect",
//               to: [
//                 {
//                   email: to_addr,
//                   name: to_addr,
//                   type: "to"
//                 }
//               ],
//               headers: {
//                 "Reply-To": "admin@celebkonect.com"
//               },
//               important: false,
//               track_opens: null,
//               track_clicks: null,
//               auto_text: null,
//               auto_html: null,
//               inline_css: null,
//               url_strip_qs: null,
//               preserve_recipients: null,
//               view_content_link: null,
//               tracking_domain: null,
//               signing_domain: null,
//               return_path_domain: null,
//               merge: true,
//               merge_language: "mailchimp",
//               global_merge_vars: [
//                 {
//                   name: "verifyurl",
//                   content: url
//                 },
//                 {
//                   name: "verifymobile",
//                   content: mobileurl
//                 },
//                 {
//                   name: "username",
//                   content: username
//               },
//                 {
//                   name: "mobileToken",
//                   content: token
//                 }
//               ],
//               merge_vars: [
//                 {
//                   "rcpt": to_addr,
//                   "vars": [
//                     {
//                       name: "verifyurl",
//                       content: url
//                     },
//                     {
//                       name: "username",
//                       content: username
//                   },
//                     {
//                       name: "verifymobile",
//                       content: mobileurl
//                     },
//                     {
//                       name: "mobileToken",
//                       content: token
//                     }
//                   ]
//                 }
//               ],

//             };
//             var async = false;
//             var ip_pool = "Main Pool";
//             // var send_at = new Date();
//             mandrill_client.messages.sendTemplate(
//               {
//                 template_name: template_name,
//                 template_content: template_content,
//                 message: message,
//                 async: async,
//                 ip_pool: ip_pool
//               },
//               function (result) {
//                 res.send({ message: "comLog saved sucessfully" });
//               },
//               function (e) {
//                 console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//               }
//             );
//           });
//         }
//         else if (event == "socialRegister") {
//           res.send({ message: "comLog saved sucessfully" });

//         } else if (event == "resendEmail") {
//           crypto.randomBytes(20, function (err, buf) {
//             var token = Math.floor(Math.random() * 1000000 + 54);
//             let url = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyEmail/" + to_addr + "/" + token;
//             let mobileurl = config.baseUrl+ ".celebkonect.com:4300/logininfo/verifyMobile/" + to_addr;
//             // Get LoginInfo By Email and Update Email Verification Code
//             User.findOne({ email: to_addr.toLowerCase() }, function (err, lResult) {
//               if (err) res.send(err);
//               if (lResult) {
//                 let id = lResult._id;
//                 let newbody = {};
//                 newbody.updated_at = new Date();
//                 newbody.emailVerificationCode = token;
//                 newbody.mobileVerificationCode = token;
//                 let reqBody = {};
//                 reqBody.mobileNumber = lResult.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
//                 reqBody.regToken = token;

//                 User.findByIdAndUpdate(id, newbody, function (err, result) { });
//               } else {
//                 console.log({ error: "Email not found / Invalid!" });
//               }

//             });
//             // End of Get LoginInfo By Email and Update Email Verification Code

//             var template_name = "reg";
//             var template_content = [
//               {
//                 name: "verifyurl",
//                 content: url
//               },
//               {
//                 name: "verifymobile",
//                 content: mobileurl
//               },
//             //   {
//             //     name: "username",
//             //     content: username
//             // },
//               {
//                 name: "mobileToken",
//                 content: token
//               }
//             ];
//             var message = {
//               subject: "Registration Successful",
//               from_email: "admin@celebkonect.com",
//               from_name: "CelebKonect",
//               to: [
//                 {
//                   email: to_addr,
//                   name: to_addr,
//                   type: "to"
//                 }
//               ],
//               headers: {
//                 "Reply-To": "admin@celebkonect.com"
//               },
//               important: false,
//               track_opens: null,
//               track_clicks: null,
//               auto_text: null,
//               auto_html: null,
//               inline_css: null,
//               url_strip_qs: null,
//               preserve_recipients: null,
//               view_content_link: null,
//               tracking_domain: null,
//               signing_domain: null,
//               return_path_domain: null,
//               merge: true,
//               merge_language: "mailchimp",
//               global_merge_vars: [
//                 {
//                   name: "verifyurl",
//                   content: url
//                 },
//                 {
//                   name: "verifymobile",
//                   content: mobileurl
//                 },
//               //   {
//               //     name: "username",
//               //     content: username
//               // },
//                 {
//                   name: "mobileToken",
//                   content: token
//                 }
//               ],
//               merge_vars: [
//                 {
//                   "rcpt": to_addr,
//                   "vars": [
//                     {
//                       name: "verifyurl",
//                       content: url
//                     },
//                   //   {
//                   //     name: "username",
//                   //     content: username
//                   // },
//                     {
//                       name: "verifymobile",
//                       content: mobileurl
//                     },
//                     {
//                       name: "mobileToken",
//                       content: token
//                     }
//                   ]
//                 }
//               ],

//             };
//             var async = false;
//             var ip_pool = "Main Pool";
//             // var send_at = new Date();
//             mandrill_client.messages.sendTemplate(
//               {
//                 template_name: template_name,
//                 template_content: template_content,
//                 message: message,
//                 async: async,
//                 ip_pool: ip_pool
//               },
//               function (result) {
//                 res.send({ message: "Verification email sent successfully!" });
//               },
//               function (e) {
//                 console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//               }
//             );
//           });
//         }
//         // If event type is Forogot password
//         else if (event == "forgot") {
//           async.waterfall(
//             [
//               function (done) {
//                 crypto.randomBytes(20, function (err, buf) {
//                   var token = Math.floor(Math.random() * 1000000 + 54);
//                   done(err, token);
//                 });
//               },
//               function (token, done, callback) {
//                 logins.find({ email: to_addr }, function (err, user) {
//                   if (err) {
//                     return res.send(err);
//                   }
//                   if (user.length == 0) {
//                     res.json({
//                       error: "No account with that email address exists."
//                     });
//                   } else {
//                     lid = user[0]._id;
//                     logins.updateOne(
//                       { _id: lid },
//                       {
//                         $set: {
//                           resetPasswordToken: token,
//                           resetPasswordExpires: Date.now() + 3600000
//                         }
//                       },
//                       { new: true },
//                       function (err, dude) {
//                         done(err, token, user);
//                       }
//                     );
//                   }
//                 });
//               },
//               function (token, user, done) {
//                 done(null, "done");
//                 transport.sendMail(
//                   {
//                     to: to_addr,
//                     from: "CelebKonect <admin@celebkonect.com>",
//                     subject: "Password Reset",
//                     html:
//                       "<h3>You have requested to reset your password</h3> <p>Please <a href=" +
//                       '"https://' +
//                       req.headers.host +
//                       "/logininfo" +
//                       "/reset/" +
//                       token +
//                       '"' +
//                       ">CLICK HERE</a> to reset your password.</p> <br> Please ignore this email if you did not request for a new password.<br> <p>Thank you,</p> <p>CelebKonect</p>"
//                   },
//                   function (err, info) {
//                     //console.log(info)
//                     if (err) {
//                       console.error(err);
//                     } else {
//                       res.json({
//                         message:
//                           "An e-mail has been sent to " +
//                           user.email +
//                           " with further instructions."
//                       });
//                     }
//                   }
//                 );
//               }
//             ],
//             function (err) {
//               if (err) return res.send(err);
//             }
//           );
//         }
//         // If event type if change password
//         else if (event == "changePassword") {
//           transport.sendMail(
//             {
//               to: to_addr,
//               from: "CelebKonect <admin@celebkonect.com>",
//               subject: "Password Reset",
//               text: "Your password changed successfully"
//             },
//             function (err, info) {
//               if (err) {
//                 console.error(err);
//               } else {
//                 res.json({
//                   message:
//                     "An e-mail has been sent to " +
//                     user.to_addr +
//                     " with further instructions."
//                 });
//               }
//             }
//           );
//         }
//       } else {
//         console.log("other");
//       }
//     }
//   });
// });

// // Web Portal Contact US Email
// router.post("/contactUs", function (req, res) {
//   let name = req.body.name;
//   let email = req.body.email;
//   let mobile = req.body.mobile;
//   let subject = req.body.subject;
//   let message = req.body.message;
//   let howDoYouHearAboutUs = req.body.howDoYouHearAboutUs;

//   transport.sendMail(
//     {
//       to: ["admin@celebkonect.com"],
//       from: "CelebKonect <admin@celebkonect.com>",
//       subject: "Contact Us Page Submission",
//       html:
//         "<h3>Hello Admin,</h3> <p>you have received a new submission from contactUs page.</p>" +
//         "<p><b> Please find the details below: </b><p>" +
//         "<p><b>Name: </b>:" +
//         name +
//         "</p>" +
//         "<p><b>Email: </b>:" +
//         email +
//         "</p>" +
//         "<p><b>Mobile: </b>:" +
//         mobile +
//         "</p>" +
//         "<p><b>Subject: </b>:" +
//         subject +
//         "</p>" +
//         "<p><b>Message: </b>:" +
//         message +
//         "</p>" +
//         "<p><b>How did you hear about us: </b>:" +
//         howDoYouHearAboutUs +
//         "</p>"
//     },
//     function (err, info) {
//       if (err) {
//         console.error(err);
//       } else {
//         res.json({
//           message: "Email submitted successfully!!"
//         });
//       }
//     }
//   );
// });
// // End of Web Portal Contact US Email

// // Edit a comLog
// router.put("/edit/:comLog_id", function (req, res) {
//   let id = req.params.comLog_id;
//   let from_addr = req.body.from_addr;
//   let to_addr = req.body.to_addr;
//   let content = req.body.content;
//   let gateway_response = req.body.gateway_response;
//   let reqbody = req.body;
//   reqbody.updated_at = new Date();

//   comLog.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       comLog.findByIdAndUpdate(id, reqbody, function (err, result) {
//         if (err) return res.send(err);
//         res.json({ message: "ComLog Updated Successfully" });
//       });
//     } else {
//       res.json({ error: "ComLogID not found / Invalid" });
//     }
//   });
// });
// // End of Edit a comLog

// // Find by Id (getComLogStatus)
// router.get("/getComLogStatus/:comLogID", function (req, res) {
//   let id = req.params.comLogID;

//   comLog.getComLogById(id, function (err, result) {
//     if (err) return res.send(err);
//     res.send(result);
//   });
// });
// // End of Find by Id (getComLogStatus)

// // Find ComLog by email or mobile
// router.get("/findByEmailOrMobile/:emailOrMobile", function (req, res) {
//   let term = req.params.emailOrMobile;
//   let query = { to_addr: term };
//   comLog.find(query, function (err, result) {
//     if (err) return res.send(err);
//     res.send(result);
//   });
// });
// // End of Find ComLog by email or mobile

// // Delete by ComLogID
// router.delete("/delete/:ComLogID", function (req, res, next) {
//   let id = req.params.ComLogID;

//   comLog.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       comLog.findByIdAndRemove(id, function (err, post) {
//         if (err) return res.send(err);
//         res.json({ message: "Deleted ComLog Successfully" });
//       });
//     } else {
//       res.json({ error: "ComLogID not found / Invalid" });
//     }
//   });
// });
// // End of Delete by ComLogID

// module.exports = router;
