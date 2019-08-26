let request = require('request');
let crypto = require("crypto");
let logins = require("./components/loginInfo/loginInfoModel");
let User = require("./components/users/userModel");

////////////////////// SEND OTP METHOD //////////////

/* mySms.sendSms(req.body, function (err, result) {
  if (err) {
    res.send(err);
  } else {
    console.log(result)
    res.json({
      message: "otp sent successfully"
    });
  }
}); */

////////////////////// END OF SEND OTP METHOD ///////

// Send SMS OTP
module.exports.sendSms = function (data, callBack) {
  let ApiToken = "214777AbOoSEwKiYX5af41211";
  let sender = "CKONCT";
  let route = 4;
  console.log(' ============================= mobile number ==============================')
  console.log(data)
  console.log('=============== mobile number ==========================================')
  let mobileNumber = data.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
  let status;
  let token;
  crypto.randomBytes(20, function (err, buf) {
    var token = Math.floor(100000 + Math.random() * 900000);
    if(data.regToken) {
      token = data.regToken;
    }
    logins.findOne({
      mobileNumber: mobileNumber
    }, function (err, lResult) {
      if (err) return res.send(err);
      if (lResult == null) {
        status = "Invalid Mobile Number";
        callBack(null, status);
      } else {
        let id = lResult._id;
        let newbody = {};
        newbody.updatedAt = new Date();
        newbody.mobileVerificationCode = token;

        logins.findByIdAndUpdate(id, newbody, function (err, result) {
          if (err) {
            console.log(err);
          } else {
            request("http://sms.fly.biz/api/otp.php?authkey=" + ApiToken + "&mobile=" + mobileNumber + "&message=Welcome%20to%20CelebKonect.%20Your%20OTP%20is%20" + token + "&sender=" + sender + "&otp=" + token, function (error, response, body) {
              if (error) {
                callBack(null, error)
              }
              console.log(' ============================= msg wow  ==============================')
          console.log(body)
          console.log('=============== msg wow ==========================================')
              if (body == 'Please Enter Valid Sender ID') {
                status = "Invalid Sender ID";
                callBack(null, status);
              } else {
                // Update user object "isMobileVerified" 
                User.findOne({
                  mobileNumber: mobileNumber
                }, function (err, uResult) {
                  if (err) res.send(err);
                  if (uResult) {
                    let id = uResult._id;
                    let newBody = {};
                    newBody.updated_at = new Date();
                    newBody.isMobileVerified = "false";
                    User.findByIdAndUpdate(id, newBody, function (err, result) {});
                  } else {
                    console.log({
                      error: "Mobile number not found / Invalid!"
                    });
                  }
                });
                // End of user object "isMobileVerified" 
                status = "OTP Sent";
                callBack(null, status);
              }
            });
          }
        });
      }
    });

  });
}
// End of Send SMS OTP

///////// Resend OTP ////////////////////////////////////////
module.exports.reSendSms = function (data, callBack) {
  let ApiToken = "214777AbOoSEwKiYX5af41211";
  let sender = "CKONCT";
  let route = 4;
  let mobileNumber = data.mobileNumber.replace(/[^a-zA-Z0-9]/g, '');
  let status;
  request("http://sms.fly.biz/api/retryotp.php?authkey=" + ApiToken + "&mobile=" + mobileNumber + "&retrytype=text", function (error, response, body) {
    if (error) {
      callBack(null, error)
    }
    if (body == 'Please Enter Valid Sender ID') {
      status = "Invalid Sender ID";
      callBack(null, status);
    } else {
      status = "OTP Sent";
      callBack(null, body);
    }
  });
}
///////// End of Resend OTP /////////////////////////////////