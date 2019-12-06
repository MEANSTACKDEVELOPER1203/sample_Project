const express = require("express");
const router = express.Router();
const request = require('request');
const emailServices = require("../../routes/email");
const OTP = require("./otpModel");
const async = require("async");
const axios = require("axios");
const FCM = require('fcm-push');
const serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
const fcm = new FCM(serverkey);

// old site address for msg wow :- my.msgwow.com

// Get OTP Verification
let getOTP = (medium, mobileNumber, email, reason, callback) => {
  // callback(null, 'OTP sent successfully')
  //     return;
  if (medium == "mobile") {
    async.waterfall([
      /// call to MSGWOW sms gateway to get the OTP
      (callback) => {
        let ApiToken = "214777AbOoSEwKiYX5af41211";
        let sender = "CKONCT";
        // console.log("http://sms.fly.biz/api/otp.php?authkey=" + ApiToken + "&mobile=" + mobileNumber + "&message=%23%23OTP%23%23%20is%20your%20verification%20code%20for%20CelebKonect.%20Expires%20in%2015%20mins.&sender=" + sender + "&otp_length=6")
        axios.get("http://sms.fly.biz/api/otp.php?authkey=" + ApiToken + "&mobile=" + mobileNumber + "&message=%23%23OTP%23%23%20is%20your%20verification%20code%20for%20CelebKonect.%20Expires%20in%205%20mins.&sender=" + sender + "&otp_length=6" + "&otp_expiry=5")
          .then((response) => {
            if (response.data.type == "success") {
              status = 'OTP sent successfully'
              console.log('OTP sent successfully')
              callback(null, status);
            }
            else {
              status = "Please Try Again";
              console.log('Please Try Again')

              callback(null, status);
            }
          })
          .catch((error) => {
            console.log(error)
            callback(new Error(`Error While sending OTP : ${error}`), null);
          });
      }
    ], (err, status) => {
      // result now equals 'done'
      if (err) {
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 0,
        //     message: `${err.message}`
        // });
        callback(err, null);
      }
      else if (status) {
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 1,
        //     message: status
        // });
        callback(null, status);
      }
    });
  } else if (medium == "email") {
    /// Fetch member details
    async.waterfall([
      (callback) => {
        let OTPcode = Math.floor(100000 + Math.random() * 900000);
        // save the OTP in Database
        let newOTP = new OTP({
          medium: "email",
          reason: reason,
          OTP: OTPcode,
          toAddress: email,
          expiryTimeInMins: 5
        });
        OTP.createOTP(newOTP, (err, otpObj) => {
          if (err) {
            return callback(new Error(`Error While sending OTP : ${err}`), null);
          } else {
            callback(null, otpObj, OTPcode)
          }
        });
      },
      /// send EMAIL using Mandrill Gateway
      (otpObj, OTPcode, callback) => {
        var message = {
          "html": "<h2>Welcome to CelebKonect.</h2> <h4>Your OTP for Verification</h4><p color=#0000FF> " + OTPcode + "</p>. <p>Note: OTP is valid for next 5 Minutes.</p>",
          "subject": "OTP Verification for CelebKonect",
          "from_email": "admin@celebkonect.com",
          "from_name": "CelebKonect",
          "to": [{
            "email": email,
            "name": email + " " + email,
            "type": "to"
          }],
        };
        // console.log(message)
        emailServices.sendEmail(message, (err, result) => {
          // console.log(result)
          if (result[0].status == "sent" || result[0].status == "queued") {
            callback(null, 'OTP sent successfully')
          } else {
            return callback(`OTP sending failed, please try again after sometime`, null);
          }
        });
      }
    ], (err, status) => {
      // result now equals 'done'
      if (err) {
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 0,
        //     message: `${err.message}`
        // });
        callback(err, null)
      }
      else {
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 1,
        //     message: status
        //   });
        callback(null, status)
      }
    });
  } else {
    //   res.status(200).json({
    //     token:req.headers['x-access-token'],
    //     success: 0,
    //     message: 'Invalid medium'
    //   });
    callback(message, null)
  }
};
// End of Get OTP Verification

// verify OTP
let verifyOTP = (medium, mobileNumber, email, OTPcode, callback) => {
  // callback(null, 'OTP verified successfully');
  // return;
  if (medium == "mobile") {
    async.waterfall([
      (callback) => {
        let ApiToken = "214777AbOoSEwKiYX5af41211";
        let sender = "CKONCT";
        ////// Verify OTP //////////
        // console.log("http://sms.fly.biz/api/verifyRequestOTP.php?authkey=" + ApiToken + "&mobile=" + mobileNumber + "&otp=" + OTPcode)
        axios.get("http://sms.fly.biz/api/verifyRequestOTP.php?authkey=" + ApiToken + "&mobile=" + mobileNumber + "&otp=" + OTPcode)
          .then((response) => {
            if (response) {
              // console.log("@@@@@@@@@@@@@@@@@@@@@@")
              // console.log(response)
              // console.log("@@@@@@@@@@@@@@@@@@@@@@")
              let Body = response.data
              if (Body.message == "otp_not_verified") {
                callback(`Invalid OTP.`, null);
              } else if (Body.message == "already_verified") {
                callback(`Already verified!!`, null);
              } else if (Body.message == 'mobile_not_found') {
                callback(`Invalid mobile number`, null);
              } else if (Body.message == "otp_expired") {
                callback(`OTP Expired!!`, null);
              } else if (Body.message == "invalid_otp") {
                callback(`OTP incorrect. Please provide correct OTP or resend.`, null);
              } else if (Body.message == "last_otp_request_on_this_number_is_invalid") {
                callback(`Invalid mobile number`, null);
              } else if (Body.message == "invalid_mobile") {
                callback(`Invalid mobile number`, null);
              } else if (Body.message == "max_limit_reached_for_this_otp_verification") {
                callback(`Maximum limit reached please resend otp`, null);
              }
              else {
                callback(null, 'OTP verified successfully');
              }
            }
          })
          .catch((error) => {
            callback(`Error While verifying OTP : ${error}`, null);
          });
        ////// End of Verify OTP ///
      }
    ], (err, status) => {
      // result now equals 'done'
      if (err) {
        callback(err, null)
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 0,
        //     message: `${err.message}`
        // });
      }
      else {
        callback(null, status)
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 1,
        //     message: status
        // });
      }
    });
  } else if (medium == "email") {
    /// Fetch member details
    async.waterfall([
      /// fetch latest OTP and verify
      (callback) => {
        OTP.findOne({ toAddress: email }, (err, Oresult) => {
          if (err)
            return callback(new Error(`Error While fetching OTP info : ${err}`), null);
          if (Oresult) {
            //console.log(Oresult)
            if (Oresult.isVerified == "false" || Oresult.isVerified == false) {
              let CurrentTime = new Date();
              var parsedDate = Oresult.createdAt;
              //console.log('parsed created time')
              //console.log(parsedDate)
              let expiryTime = (Oresult.expiryTimeInMins * 60000);
              //console.log('new exiry time')
              // add the exipry minutes to created Time and verify
              let Expiration = new Date(parsedDate.getTime() + expiryTime);
              //console.log(Expiration)
              //console.log(CurrentTime)
              //// check for the OTP Expiration time
              if (CurrentTime <= Expiration) {
                if (Oresult.OTP == OTPcode) {
                  //console.log('correct OTP')
                  callback(null, Oresult);
                } else {
                  return callback(`Invalid OTP.`, null);
                }
              } else {
                return callback(`OTP Expired!!`, null);
              }
            } else {
              return callback(`Already verified!!`, null);
            }
          }
        }).sort({
          createdAt: -1
        });
      },
      /// send EMAIL using Mandrill Gateway
      (Oresult, callback) => {
        let reqbody = {
          isVerified: true
        }
        OTP.findByIdAndUpdate(Oresult._id, reqbody, (err, result) => {
          if (err) return callback(new Error(`Server Error`), null);
          else {
            callback(null, 'OTP verified successfully');
          }
        });
      }
    ], (err, status) => {
      // result now equals 'done's
      if (err) {
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 0,
        //     message: `${err.message}`
        //   });
        callback(err, null)
      }
      else {
        // res.status(200).json({
        //     token:req.headers['x-access-token'],
        //     success: 1,
        //     message: status
        // });
        callback(null, status)
      }
    });
  } else {
    //   res.status(200).json({
    //     token:req.headers['x-access-token'],
    //     success: 0,
    //     message: 'Invalid medium'
    //   });
    callback('Invalid medium', null)
  }
};
// End of verify OTP

//Push notification for adndriod
let sendAndriodPushNotification = (token, collapse_key, data, callback) => {

  // let message = {
  //   "registration_ids": token, //["eOUi7xeV_sM:APA91bHIJ-4h9WnRSqZJVWC_X5PrsNGwEekd8_6pRuVz9SfET3Sp7I9A_uBIr-nY5sZOIylHzSKI5kHTY9BolvL8isiC6UYJLjncl7iq3cOp5MJ0OgD_Cf_-tr0twfXvG0xsIJQbje9R"],
  //   "data":   //data payload will work based on app open/close
  //   {
  //     "type": "data payload will work based on app ope",
  //     "title": "data payload will work based on app ope",
  //     "message": "data payload will work based on app ope",
  //     "body": "data payload will work based on app ope",
  //     "url": "data payload will work based on app ope",
  //   }
  // };

  // //console.log('================ message ==================');
  // //console.log(message);
  // fcm.send(message, function (err, response) {
  //   if (err) {
  //     console.log("Something has gone wrong!", err);
  //     return callback(err, 'fail');
  //   } else {
  //     console.log("Successfully sent with response: ", response);
  //     return callback(null, response);
  //   }
  // });
  let message = {
    to: token,
    collapse_key: collapse_key,
    data: data
  }
  fcm.send(message, (err, response) => {
    console.log("Errror ", err)
    if (err)
      callback(err, null)
    else
      callback(null, response)
  });
}
// End Push notification adndriod

//Push notification for adndriod
let sendIOSPushNotification = (token, notification, callback) => {
  let message = {
    to: token,
    notification: notification
  }
  fcm.send(message, (err, response) => {
    console.log("Errror ", err)
    if (err)
      callback(err, null)
    else
      callback(null, response)
  });
}
// End Push notification adndriod


let subscribeToTopics = (token, topic, callback) => {
  console.log("token ", token);
  console.log("topic ", topic);
  fcm.subscribeToTopic(topic, (err, res) => {
    assert.ifError(err);
    assert.ok(res);
    done();
    console.log("Errror ", err)
    // if (err)
    //   callback(err, null)
    // else
    //   callback(null, res)
  });
}
module.exports = {
  getOTP: getOTP,
  verifyOTP: verifyOTP,
  sendAndriodPushNotification: sendAndriodPushNotification,
  sendIOSPushNotification: sendIOSPushNotification,
  subscribeToTopics: subscribeToTopics
};