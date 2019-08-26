let express = require("express");
let router = express.Router();
//mandrill
var nodemailer = require('nodemailer');

var mandrillTransport = require('nodemailer-mandrill-transport');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('b4gGeksBlAv54P_igkBH-w');

var transport = nodemailer.createTransport(mandrillTransport({
  auth: {
    apiKey: 'b4gGeksBlAv54P_igkBH-w'
  }
}));


////// Intitate Email Sending////


/* 

MESSAGE CONSTRUCTOR

var message = {
  "html": "<p>Example HTML content</p>",
  "text": "Example text content",
  "subject": "example subject",
  "from_email": "message.from_email@example.com",
  "from_name": "Example Name",
  "to": [{
          "email": "recipient.email@example.com",
          "name": "Recipient Name",
          "type": "to"
      }],
}; 

*/

var async = false;
var sendEmail = function sendEmail(message, callback) {
  // transport.sendMail({
  //   from: 'admin@celebkonect.com',
  //   to: 'prathmesh@indoztechsol.com',
  //   subject: 'Hello',
  //   html: '<p>How are you?</p>'
  // }, function(err, result) {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log(result)
  //     callback(null, result);
  //   }
  // });
  mandrill_client.messages.send({
    "message": message,
    "async": async
  }, function (result) {
    callback(null, result)
  }, function (e) {
    // Mandrill returns the error as an object with name and message keys
    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
}

////// End of Email Sending

module.exports = {
  transport,
  sendEmail
};