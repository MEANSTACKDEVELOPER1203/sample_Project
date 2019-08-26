let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let Feed = require("../models/feeddata");
let User = require("../components/users/userModel");
let multer = require("multer");
let fs = require('fs');
const CelebManagerService = require("../components/CelebManager/celebManagerService");
let MemberPreferences = require("../components/memberpreferences/memberpreferencesModel");
let MemberPreferenceServices = require('../components/memberpreferences/memberPreferenceServices');
let memberMedia = require("../components/memberMedia1/memberMediaModel");
let mediaTracking = require("../components/mediaTracking/mediaTrackingModel");
let CelebrityContracts = require('../components/celebrityContract/celebrityContractsModel');
let Country = require('../components/country/countrysModel');
const LoginInfo = require('../components/loginInfo/loginInfoModel');
const cloudconvert = new (require('cloudconvert'))('mbTkzBrmgkgaqI98MuyBqs6QfdtABldIw6xnvwANW9VzdPcfCDNMTR3tHQ8c0XIW');
const ActivityLog = require("../components/activityLog/activityLogService");

let logins = require("../components/loginInfo/loginInfoModel");
let notificationSetting = require("../components/notificationSettings/notificationSettingsModel");
let Notification = require("../components/notification/notificationModel");
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
let async = require('async');
var Jimp = require('jimp');
let otpService = require('../components/otp/otpRouter');



// Multer Plugin Settings (Images Upload)
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/feeds");
  },
  filename: function (req, file, cb) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
  }
});

let upload = multer({
  storage: storage
});
// End of Multer Plugin Settings (Images Upload)

router.post('/createFeed_PK', upload.any(), (req, res) => {
  //var baseUrl = "uploads/feeds/"
  //console.log(req.body);
  let feed = req.body.feed;
  let feedObj = JSON.parse(feed);
  let files = req.files;
  //console.log(feedObj);
  let fileType;
  let fileExtension;
  //console.log(files);
  var mediaArray = [];


  if (files.length > 0) {
    let i = 0;
    for (i = 0; i < files.length; i++) {
      //let createdAt = new Date()
      var srcObj = {} //0 1 
      var mediaObj = {};
      mediaObj = feedObj.media[i];
      // FILE NAME AND EXTENSION.
      fileType = files[i].mimetype;
      let videoUrl;
      let mediaUrl;
      let mediaName;
      let thumbnail = "";
      if (fileType === "video/mp4" || fileType === "image/gif") {
        videoUrl = files[i].path;
        //videoUrl = baseUrl.concat(videoUrl);
        mediaUrl = files[i + 1].path;
        //mediaUrl = baseUrl.concat(mediaUrl);
        mediaName = files[i].filename;
        mediaName1 = files[i + 1].filename;
        thumbnail = 'uploads/FeedThumbnails/' + mediaName1;
        var thumbNailPath = "uploads/feeds/" + mediaName1;
        var destThumbnailPath = 'uploads/FeedThumbnails/' + mediaName1;
        files.splice(i + 1, 1);
        // thumbnail = mediaUrl.replace("feeds","FeedThumbnails");
        // var thumbNailPath = mediaUrl;
        // var destThumbnailPath = thumbnail;


        function convert(thumbNailPath, destThumbnailPath, height, width) {

          //console.log(thumbNailPath,destThumbnailPath,height,width)
          return new Promise(function (resolve, reject) {
            Jimp.read(thumbNailPath, (err, lenna) => {
              if (err) {
                Feed.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': destThumbnailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                  //console.log(updated)
                });
                memberMedia.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': destThumbnailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                  //console.log(updated)
                });
              }
              else {
                lenna
                  .resize(width, height) // resize
                  .quality(60) // set JPEG quality
                  // .greyscale() // set greyscale
                  .write(destThumbnailPath, (err, data) => {
                    if (!err)
                      resolve(destThumbnailPath);
                  });
                // save
              }
            });
          })
        }
        async function main() {

          width = 500;
          height = feedObj.media[i].mediaRatio * width;


          await convert(thumbNailPath, destThumbnailPath, height, width);
        }
        main();
        //++i;
      } else {

        videoUrl = "";
        mediaUrl = files[i].path;
        //mediaUrl = baseUrl.concat(mediaUrl);
        mediaName = files[i].filename;
        thumbnail = 'uploads/FeedThumbnails/' + mediaName;
        var thumbNailPath = "uploads/feeds/" + mediaName;
        var destThumbnailPath = 'uploads/FeedThumbnails/' + mediaName;



        function convert(thumbNailPath, destThumbnailPath, height, width) {

          //console.log(thumbNailPath,destThumbnailPath,height,width)
          return new Promise(function (resolve, reject) {

            Jimp.read(thumbNailPath, (err, lenna) => {
              if (err) {
                // let src = thumbNailPath
                // fs.createReadStream(src)
                // .pipe(cloudconvert.convert({
                //     "inputformat": "heic",
                //     "outputformat": "jpg",
                //     "input": "upload"
                // }))
                // .pipe(fs.createWriteStream(destThumbnailPath));


                // fs.rename(src,src+"_chnaged", function (err) {
                //   if (err) throw err;
                //   console.log('renamed complete');
                // });

                // fs.createReadStream(destThumbnailPath)
                // .pipe(cloudconvert.convert({
                //     "inputformat": "heic",
                //     "outputformat": "jpg",
                //     "input": "upload"
                // }))
                // .pipe(fs.createWriteStream(src));

                // fs.renameSync(thumbNailPath)

                // let src = thumbNailPath
                // fs.createReadStream(destThumbnailPath)
                // .pipe(cloudconvert.convert({
                //     "inputformat": "heic",
                //     "outputformat": "jpg",
                //     "input": "upload"
                // }))
                // .pipe(fs.createWriteStream(src));
                Feed.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': destThumbnailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                  //console.log(updated)
                })
                memberMedia.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': destThumbnailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                  //console.log(updated)
                })
              }
              else {
                lenna
                  .resize(width, height) // resize
                  .quality(60) // set JPEG quality
                  // .greyscale() // set greyscale
                  .write(destThumbnailPath, (err, data) => {
                    if (!err) {
                      console.log("saved")
                      resolve(destThumbnailPath);
                    }
                    else {
                      console.log("err")
                    }

                  }); // save
              }
            });

          })

        }
        async function main() {

          width = 500;
          height = feedObj.media[i].mediaRatio * width;


          await convert(thumbNailPath, destThumbnailPath, height, width);
        }
        main();
      }
      //console.log("saved2")
      srcObj.mediaUrl = mediaUrl;
      srcObj.mediaName = mediaName;
      srcObj.videoUrl = videoUrl;
      srcObj.thumbnail = thumbnail;
      mediaObj.src = srcObj;
      mediaObj.mediaId = new ObjectId();
      //mediaObj.createdAt = createdAt; //this for member media file
      mediaArray.push(mediaObj);
    }
  }
  feedObj.mediaArray = mediaArray;

  async.waterfall([function (callback) {
    User.getUserById(ObjectId(feedObj.memberId), (err, userDetailObj) => {
      if (err) {
        return callback(new Error(`Error While fetching Member details : ${err}`), null)
      }
      else if (!userDetailObj || userDetailObj == "") {
        return callback(new Error(`Member Id has no exist ${req.body.memberId}`), null)
      }
      else {
        return callback(null, userDetailObj)
      }
    })
  }
    , function (userDetailObj, callback) {
      feedObj.createdBy = feedObj.createdBy;
      feedObj.memberName = userDetailObj.fileName;
      let hasNumber = /\d/;
      if (feedObj.state == "0" && hasNumber.test(feedObj.countryCode)) {
        Country.findOne({ dialCode: feedObj.countryCode }, (err, countryObj) => {
          if (err)
            console.log("****** Error while fetching the country code ******");
          else {
            //console.log(countryObj)
            feedObj.countryCode = countryObj.countryCode;
            feedObj.state = "";
            Feed.saveFeed_PK(feedObj, (err, createdFeedObj) => {
              if (err) {
                return callback(new Error(`Error while creating the feed! : ${err} `), null, null);
              } else {
                return callback(null, createdFeedObj, userDetailObj);
              }
            });
          }
        })
      } else {
        Feed.saveFeed_PK(feedObj, (err, createdFeedObj) => {
          if (err) {
            return callback(new Error(`Error while creating the feed! : ${err} `), null, null);
          } else {
            return callback(null, createdFeedObj, userDetailObj);
          }
        });
      }

    }, function (createdFeedObj, userDetailObj, callback) {
      let obj = {}
      Object.assign(createdFeedObj, {
        "feedByMemberDetails": {
          _id: userDetailObj._id,
          isCeleb: userDetailObj.isCeleb,
          isManager: userDetailObj.isManager,
          isOnline: userDetailObj.isOnline,
          avtar_imgPath: userDetailObj.avtar_imgPath,
          firstName: userDetailObj.firstName,
          lastName: userDetailObj.lastName,
          profession: userDetailObj.profession,
          gender: userDetailObj.gender,
          username: userDetailObj.username
        }
      })
      let memberId = createdFeedObj.memberId;
      let feedId = createdFeedObj._id
      let mMedia = [];
      for (let k = 0; k < mediaArray.length; k++) {
        let obj = mediaArray[k]
        let createdAt = new Date();
        let milliseconds = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate(), createdAt.getHours(), createdAt.getMinutes(), createdAt.getSeconds(), createdAt.getMilliseconds() + k + 1)
        obj.createdAt = milliseconds;
        index = createdFeedObj.media.findIndex(x => x.src.mediaName == obj.src.mediaName);
        obj.mediaId = createdFeedObj.media[index].mediaId;
        obj.feedId = feedId;
        mMedia.push(obj);
      }
      let findQuery = { memberId: memberId };
      memberMedia.findByMemberId(findQuery, (err, memberMediaObj) => {
        if (err) {
          return callback(new Error(`Error while creating member media! : ${err} `), null, null);
        } else {
          if (memberMediaObj) {
            memberMedia.findByIdAndUpdate(memberMediaObj._id, { $push: { media: { $each: mMedia } } }, (err, updateMemberObj) => {
              if (err) {
                return callback(new Error(`Error while creating member media! : ${err} `), null, null);
              } else {
                return callback(null, createdFeedObj, userDetailObj);
              }
            });
          } else {
            let memberMediaInfo = new memberMedia({
              memberId: createdFeedObj.memberId,
              media: mMedia
            });
            memberMedia.createMedia(memberMediaInfo, (err, createdMemberMediaObj) => {
              if (err) {
                return callback(new Error(`Error while creating member media! : ${err} `), null, null);
              } else {
                return callback(null, createdFeedObj, userDetailObj);
              }
            });
          }
        }
      });

    }
  ], function (err, createdFeedObj, userDetailObj) {
    if (err) {

      return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: `${err}` });
    } else {
      var desiredResponce = {
        "feedByMemberDetails": createdFeedObj.feedByMemberDetails,
        "memberId": createdFeedObj.memberId,
        "_id": createdFeedObj._id,
        "isDelete": createdFeedObj.isDelete,
        "location": createdFeedObj.location,
        "created_at": createdFeedObj.created_at,
        "status": createdFeedObj.status,
        "media": createdFeedObj.media,
        "industry": createdFeedObj.industry,
        "imageRatio": createdFeedObj.imageRatio,
        "content": createdFeedObj.content,
        "mediaSrc": createdFeedObj.mediaSrc,
        "title": createdFeedObj.title,
        "countryCode": createdFeedObj.countryCode,
        "state": createdFeedObj.state,
      }

      ////////////feed Notification/////////////////
      MemberPreferences.aggregate([
        {
          $match: { celebrities: { $elemMatch: { CelebrityId: createdFeedObj.memberId } } }
        },
        {
          $lookup: {
            from: "logins",
            localField: "memberId",
            foreignField: "memberId",
            as: "memberLoginInfo"
          }
        },
        {
          $unwind: "$memberLoginInfo"
        },
        {
          $match: { $and: [{ "memberLoginInfo.deviceToken": { $ne: null } }, { "memberLoginInfo.deviceToken": { $ne: "" } }] }
        },
        {
          $project: {
            memberLoginInfo: {
              memberId: 1,
              deviceToken: 1,
              osType: 1
            }
          }
        }
      ], (err, users) => {
        // console.log(users)
        // console.log("FFFFFFFFFFFFFF", users.length)
        if (err) {
          console.log(err)
        } else if (users.length > 0) {
          User.findById(createdFeedObj.memberId, function (err, SMresult) {
            ///users.forEach(user =>
            for (let index = 0; index < users.length; index++) {
              let user = {};
              user = users[index];
              //console.log(user.memberLoginInfo.memberId);
              let dToken = user.memberLoginInfo.deviceToken;
              let osType = user.memberLoginInfo.osType;
              //console.log(user.memberLoginInfo.osType);
              let time1 = createdFeedObj.created_at;
              let newNotification = new Notification({
                memberId: user.memberLoginInfo.memberId,
                activity: "FEED",
                notificationFrom: SMresult._id,
                title: "Feed Alert!!",
                body: SMresult.firstName + " " + SMresult.lastName + " posted a feed.",
                feedId: createdFeedObj._id,
                startTime: createdFeedObj.created_at,
                notificationType: "Feed",
              });
              //Insert Notification
              Notification.createNotification(newNotification, function (err, credits) {
                if (err) {
                  // res.json({ token: req.headers['x-access-token'], success: 0, message: err });
                } else {
                  //res.json({ token: req.headers['x-access-token'], success: 1, message: "Notification sent successfully" });
                  let query = {
                    $and: [{
                      memberId: user.memberLoginInfo.memberId
                    }, {
                      notificationSettingId: ObjectId("5cac6893839a52126c21f2f7")
                    }]
                  };
                  notificationSetting.find(query, function (err, rest) {
                    if (err) return res.send(err);
                    //console.log("t1", rest);
                    if (rest.length <= 0 || rest[0].isEnabled == true) {
                      if (osType == "Android") {
                        //console.log("************* AAAAAAAAAAAAa ********************")
                        let data = {
                          serviceType: "Feed",
                          title: 'Feed Alert!!',
                          body: SMresult.firstName + " " + SMresult.lastName + " posted an update.",
                          feedId: createdFeedObj._id,
                          firstName: SMresult.firstName,
                          avtar_imgPath: SMresult.avtar_imgPath
                        }
                        otpService.sendAndriodPushNotification(dToken, "Feed Alert!!", data, (err, successNotificationObj) => {
                          if (err)
                            console.log(err)
                          else {
                            console.log(successNotificationObj)
                          }
                        });
                      } else if (osType == "IOS") {
                        //console.log("************* BBBBBBBBBBBBB ********************")
                        let notification = {
                          serviceType: "FEED",
                          body: SMresult.firstName + " " + SMresult.lastName + " posted an update.",
                          feedId: createdFeedObj._id,
                          firstName: SMresult.firstName,
                          avtar_imgPath: SMresult.avtar_imgPath
                        }
                        otpService.sendIOSPushNotification(dToken, notification, (err, successNotificationObj) => {
                          if (err)
                            console.log(err)
                          else {
                            console.log(successNotificationObj)
                          }
                        });
                      }
                    }
                  });
                }
              });
            };
            let message = {
              collapse_key: 'Feed Alert!!',
              serviceType: "FEED",
              feedId: createdFeedObj._id,
              data: {
                title: 'Feed Alert!!',
                serviceType: "FEED",
                notificationType: "Feed",
                memberId: SMresult._id,
                body: SMresult.firstName + " " + SMresult.lastName + " posted an update.",
              },
              notification: {
                memberId: createdFeedObj.memberId,
                feedId: createdFeedObj._id,
                activity: "FEED",
                title: "Feed Alert!!",
                notificationFrom: createdFeedObj.memberId,
                body: SMresult.firstName + " " + SMresult.lastName + " posted an update.",
                notificationType: "Feed",
                notificationSettingsId: ObjectId("5cac6893839a52126c21f2f7"),
              }
            };
            CelebManagerService.sendNotificationToAllSwitchedManager(createdFeedObj.memberId, message, (err, data) => {
              if (err) {
                console.log(err)
              } else {
                console.log(data)
              }
            })
          });
        }
      })

      ///////feed Notification End /////////////////////////////
      // let body = {
      //   memberId: desiredResponce.memberId,
      //   feedId: desiredResponce._id
      // }
      // ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("Feed", body, (err, newActivityLog) => {
      //   if (err) {
      //     // res.json({success: 0,message: "Please try again." + err});
      //   } else {

      //   }
      // })
      return res.status(200).json({ token: req.headers['x-access-token'], data: desiredResponce, success: 1, message: "Post uploaded successfully." });
    }
  });
})


router.get('/getFeeds_PK/:member_Id/:creation_Date/:country_Code/:state', (req, res, next) => {
  ///:skip/:limit
  let query = {};
  let memberId = (req.params.member_Id) ? req.params.member_Id : '';
  let creationDate = (req.params.creation_Date) ? req.params.creation_Date : '';
  let countryCode = (req.params.country_Code) ? req.params.country_Code : '';
  countryCode = countryCode.toUpperCase();
  let state = (req.params.state) ? req.params.state : '';
  state = state.toUpperCase();
  // let skip = (req.params.skip) ? req.params.skip : '';
  // let limit = (req.params.limit) ? req.params.limit : '';
  query.memberId = memberId;
  query.created_at = creationDate;
  query.countryCode = countryCode;
  query.state = state;
  // query.skip = skip;
  // query.limit = limit;
  var feedArray = [];
  //let celebrities = [];
  var feedObj = {};
  let hasNumber = /\d/;
  Country.findOne({ $or: [{ dialCode: countryCode }, { countryCode: countryCode }] }, (err, countryCodeObj) => {
    if (err)
      console.log("******************Error while fetching the country details***********************", err);
    else {
      // console.log("********* Remove Console after testing IN Feed Creating*************")
      // console.log(countryCode);
      // console.log(countryCodeObj);
      // console.log("********* Remove Console after testing IN Feed Creating*************")
      if (hasNumber.test(countryCode) && countryCodeObj) {
        countryCode = countryCodeObj.countryCode;
        query.countryCode = countryCode
      }
      Feed.findAllFeed(query, (err, listOfFeedsObj) => {
        if (err) {
          console.log(err.message);
          return res.json({ token: req.headers['x-access-token'], success: 0, message: "Errror while retrieving the feeds." });
        } else if (listOfFeedsObj.length <= 0) {
          return res.json({ token: req.headers['x-access-token'], success: 1, message: "record not found", data: [] });
        }
        else {
          //console.log(listOfFeedsObj.length)
          //console.log(listOfFeedsObj)
          function foo(cb) {
            var results = [];
            listOfFeedsObj.map(feedDataObj => {
              let feedJsonObj = {};
              feedJsonObj = feedDataObj
              //console.log(feedJsonObj._id)
              let memberIdForContract = feedJsonObj.memberId;
              memberIdForContract = "" + memberIdForContract;
              //console.log(memberIdForContract);
              //feedJsonObj.feedStats = [];
              //feedJsonObj.mediaStats = [];
              let queryForContract = {
                memberId: memberIdForContract, $or: [{ serviceType: 'fan' }, { serviceType: 'video' }, { serviceType: 'audio' }]

              }
              CelebrityContracts.find(queryForContract, function callback(err, celebContractObj) {
                if (err)
                  console.log("********Error while feching celeb contract ********** ", err)
                else {
                  if (celebContractObj.length > 2) {
                    Object.assign(feedDataObj, { "celeAudioCharge": celebContractObj.length ? celebContractObj[0].serviceCredits : 0 });
                    Object.assign(feedDataObj, { "celeFanCharge": celebContractObj.length ? celebContractObj[1].serviceCredits : 0 });
                    Object.assign(feedDataObj, { "celeVideoCharge": celebContractObj.length ? celebContractObj[2].serviceCredits : 0 });
                  }
                  else {
                    Object.assign(feedDataObj, { "celeAudioCharge": 0 });
                    Object.assign(feedDataObj, { "celeFanCharge": 0 });
                    Object.assign(feedDataObj, { "celeVideoCharge": 0 });
                  }
                  // results.push(feedDataObj);
                  results[results.length] = feedDataObj;
                  if (results.length === listOfFeedsObj.length) {
                    cb(null, listOfFeedsObj);
                  }
                }
              }).sort({ serviceType: 1 })
            });
          }
          foo(function (err, resultArr) {
            if (err)
              return res.json({ token: req.headers['x-access-token'], success: 0, message: `Fail to fetch Feeds ${err}` });
            // resultArr.sort(function (x, y) {
            //   var dateA = new Date(x.created_at), dateB = new Date(y.created_at);
            //   return dateB - dateA;
            // });
            return res.json({ token: req.headers['x-access-token'], success: 1, data: resultArr });
          });
          //return res.status(200).json({ success: 1, data: listOfFeedsObj  });
        }
      });
    }
  })

  // async.waterfall([
  //   function (callback) {
  //     Feed.findAllFeed(query, (err, listOfFeedsObj) => {
  //       if (err) {
  //         return callback(new Error(`Errror while retrieving the feed. : ${err}`), null)
  //       } else {
  //         return callback(null, listOfFeedsObj);
  //       }
  //     });
  //   }
  /*, function (listOfFeedsObj, callback) {
    if (creationDate !== "0") {
      let listOfOnlineCelebraty = [];
      return callback(null, listOfFeedsObj, listOfOnlineCelebraty);
    }
    User.findOnlineCelebrities((err, listOfOnlineCelebraties) => {
      if (err) {
        return callback(new Error(`Error while fetching online celebraties! : ${err} `), null, null);
      } else {
        MemberPreferences.findOne({ memberId: ObjectId(memberId) }, {}, (err, listOfMyPreferences) => {
          if (err) {
            return callback(new Error(`Error while fetching member preference! : ${err} `), null, null);
          } else {
            if (listOfMyPreferences) {
              celebrities = listOfMyPreferences.celebrities;
            }
            let _id, username, isOnline, isCeleb, lastName, firstName, imageRatio, avtar_imgPath, aboutMe, profession;
            let onlineCelebritiesObj = {};
            let onlineCelebritiesArray = [];
            let isFan = false
            let isFollower = false;
            if (celebrities.length > 0) {
              for (let k = 0; k < listOfOnlineCelebraties.length; k++) {
                let userId = listOfOnlineCelebraties[k]._id;
                userId = "" + userId;
                let preferencesCelebId = listOfMyPreferences.memberId;
                preferencesCelebId = "" + preferencesCelebId;
                if (userId === preferencesCelebId) {
                  listOfOnlineCelebraties.splice(k, 1);
                }

              }
            }
            for (let i = 0; i < listOfOnlineCelebraties.length; i++) {
              onlineCelebritiesObj = {};
              let onlineCelebrityObj = listOfOnlineCelebraties[i];
              let userId = listOfOnlineCelebraties[i]._id;
              userId = "" + userId;
              for (var j = 0; j < celebrities.length; j++) {
                let preferencesCelebId = celebrities[j].CelebrityId;
                preferencesCelebId = "" + preferencesCelebId
                if (userId === preferencesCelebId && celebrities[j].isFan) {
                  isFan = true;
                }
                if (userId === preferencesCelebId && celebrities[j].isFollower) {
                  isFollower = true;
                }
              }
              onlineCelebritiesObj.isFan = isFan;
              onlineCelebritiesObj.isFollower = isFollower;
              onlineCelebritiesObj._id = onlineCelebrityObj._id;
              onlineCelebritiesObj.username = onlineCelebrityObj.username;
              onlineCelebritiesObj.isCeleb = onlineCelebrityObj.isCeleb;
              onlineCelebritiesObj.isOnline = onlineCelebrityObj.isOnline;
              onlineCelebritiesObj.lastName = onlineCelebrityObj.lastName;
              onlineCelebritiesObj.firstName = onlineCelebrityObj.firstName;
              onlineCelebritiesObj.imageRatio = onlineCelebrityObj.imageRatio;
              onlineCelebritiesObj.aboutMe = onlineCelebrityObj.aboutMe;
              onlineCelebritiesObj.profession = onlineCelebrityObj.profession;
              onlineCelebritiesObj.avtar_imgPath = onlineCelebrityObj.avtar_imgPath;
              listOfOnlineCelebraties[i] = onlineCelebritiesObj;
              isFollower = false;
              isFan = false;
            }
            return callback(null, listOfFeedsObj, listOfOnlineCelebraties);
          }
        });
      }
    });
  }*/
  // ], function (err, listOfFeedsObj) {
  //   if (err) {
  //     console.log(err.message);
  //     return res.status(404).json({ success: 0, message: `${err}` });
  //   } else {
  //     return res.status(200).json({ success: 1, data: listOfFeedsObj});
  //   }
  // });

});

//update feeds
router.put('/editFeedById_PK/:feed_Id', upload.any(), (req, res, next) => {
  //var baseUrl = "uploads/feeds/";
  var fileName, fileExtension, fileSize, fileType, dateModified;
  let feedId = (req.params.feed_Id) ? req.params.feed_Id : '';
  let files = req.files;
  let feed = req.body.feed;
  let feedObj = JSON.parse(feed);
  feedObj.updated_at = new Date();
  feedObj.updatedBy = feedObj.updatedBy;
  var updateMediaArray = [];
  var deleteMediaArray = [];
  var updateMemberMediaProfile = [];
  var mediaObj = {};
  let mediaUrl = "";
  let mediaName = "";
  let videoUrl = "";
  let mediaRatio;
  let mediaCaption = "";
  let mediaType = "";
  let mediaSize;
  let faceFeatures = [];
  let newMediaArray = [];

  var mediaArray = feedObj.media;
  let query = { feedId: req.params.feed_Id, memberId: feedObj.memberId }
  async.waterfall([function (callback) {
    Feed.getFeedById_PK(query, (err, feedDetailObj) => {
      // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
      // console.log(feedDetailObj);
      // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
      if (err) {
        return callback(new Error(`Error While fetching Feed by Id : ${err}`), null)
      }
      else {
        return callback(null, feedDetailObj);
      }
    })
  }
    , function (feedDetailObj, callback) {
      let mediaId = ""
      let existedMediaArray = feedDetailObj.media;
      deleteMediaArray = existedMediaArray;
      if (feedObj.media.length > 0) {
        mediaArray = feedObj.media;
        for (let i = 0; i < mediaArray.length; i++) {
          mediaObj = mediaArray[i];
          mediaId = mediaObj.mediaId;
          if (mediaId === undefined) {
            newMediaArray.push(mediaObj);
          }
          for (let j = 0; j < existedMediaArray.length; j++) {
            let existedMediaObj = existedMediaArray[j];

            let existedMediaId = existedMediaObj.mediaId;

            if (mediaId == existedMediaId) {
              existedMediaObj.mediaCaption = mediaArray[i].mediaCaption;
              updateMediaArray.push(existedMediaObj);
              deleteMediaArray.splice(j, 1);
            }
          }
        }
      }
      // console.log(newMediaArray)
      if (files.length > 0) {
        for (let i = 0; i < newMediaArray.length; i++) {
          var srcObj = {}
          mediaObj = {};
          var newMediaObj = newMediaArray[i];
          var newMediaObjForVideo = newMediaArray[i + 1];
          fileType = files[i].mimetype;

          // if (fileType === "video/mp4" || fileType === "image/gif") {
          //   videoUrl = files[i].path;
          //   //videoUrl = baseUrl.concat(videoUrl);
          //   mediaUrl = files[i + 1].path;
          //   //mediaUrl = baseUrl.concat(mediaUrl);
          //   mediaName = files[i].filename;
          //   files.splice(i + 1, 1);
          // } else {
          //   videoUrl = "";
          //   mediaUrl = files[i].path;
          //   //mediaUrl = baseUrl.concat(mediaUrl);
          //   mediaName = files[i].filename;

          // }
          // thumbnail = 'uploads/FeedThumbnails/'+mediaName;
          // var thumbNailPath = "uploads/feeds/"+mediaName;
          // var destThumbnailPath = 'uploads/FeedThumbnails/'+mediaName;

          // function convert(thumbNailPath,destThumbnailPath,height,width){

          //   //console.log(thumbNailPath,destThumbnailPath,height,width)
          //   return new Promise(function(resolve,reject){
          //     Jimp.read(thumbNailPath, (err, lenna) => {
          //     if (err) throw err;
          //     lenna
          //       .resize(width, height) // resize
          //       .quality(60) // set JPEG quality
          //       // .greyscale() // set greyscale
          //       .write(destThumbnailPath,(err,data)=>{
          //         if(!err)
          //           resolve(destThumbnailPath);
          //       }); // save
          //   });
          // })

          // }
          // async function main(){

          //   width =  500;
          //   height = feedObj.media[i].mediaRatio * width;


          //   await convert(thumbNailPath,destThumbnailPath,height,width);
          // }
          // main();
          // srcObj.mediaUrl = mediaUrl;
          // srcObj.mediaName = mediaName;
          // srcObj.videoUrl = videoUrl;
          // srcObj.thumbnail = thumbnail;
          // mediaObj.src = srcObj;
          // mediaObj.mediaId = new ObjectId();
          // mediaObj.faceFeatures = newMediaObj.faceFeatures;
          // mediaObj.mediaRatio = newMediaObj.mediaRatio;
          // mediaObj.mediaSize = newMediaObj.mediaSize;
          // mediaObj.mediaType = newMediaObj.mediaType;
          // mediaObj.mediaCaption = newMediaObj.mediaCaption;
          if (fileType === "video/mp4" || fileType === "image/gif") {
            videoUrl = files[i].path;
            //videoUrl = baseUrl.concat(videoUrl);
            mediaUrl = files[i + 1].path;
            //mediaUrl = baseUrl.concat(mediaUrl);
            mediaName = files[i].filename;
            mediaName1 = files[i + 1].filename;
            thumbnail = 'uploads/FeedThumbnails/' + mediaName1;
            var thumbNailPath = "uploads/feeds/" + mediaName1;
            var destThumbnailPath = 'uploads/FeedThumbnails/' + mediaName1;
            files.splice(i + 1, 1);
            // thumbnail = mediaUrl.replace("feeds","FeedThumbnails");
            // var thumbNailPath = mediaUrl;
            // var destThumbnailPath = thumbnail;


            function convert(thumbNailPath, destThumbnailPath, height, width) {

              //console.log(thumbNailPath,destThumbnailPath,height,width)
              return new Promise(function (resolve, reject) {
                Jimp.read(thumbNailPath, (err, lenna) => {
                  if (err) {
                    Feed.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': destThumbnailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                      console.log(updated)
                    })
                    memberMedia.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': destThumbnailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                      console.log(updated)
                    });
                  }
                  else {
                    lenna
                      .resize(width, height) // resize
                      .quality(60) // set JPEG quality
                      // .greyscale() // set greyscale
                      .write(destThumbnailPath, (err, data) => {
                        if (!err)
                          resolve(destThumbnailPath);
                      }); // save
                  }
                });
              })

            }
            async function main() {

              width = 500;
              height = newMediaObjForVideo.mediaRatio * width;

              // console.log(newMediaObj)
              // console.log(thumbNailPath)
              // console.log(destThumbnailPath)
              // console.log(height)
              // console.log(width)
              await convert(thumbNailPath, destThumbnailPath, height, width);
            }
            main();
            //++i;
          } else {
            videoUrl = "";
            mediaUrl = files[i].path;
            //mediaUrl = baseUrl.concat(mediaUrl);
            mediaName = files[i].filename;
            thumbnail = 'uploads/FeedThumbnails/' + mediaName;
            var thumbNailPath = "uploads/feeds/" + mediaName;
            var destThumbnailPath = 'uploads/FeedThumbnails/' + mediaName;

            function convert(thumbNailPath, destThumbnailPath, height, width) {

              //console.log(thumbNailPath,destThumbnailPath,height,width)
              return new Promise(function (resolve, reject) {
                Jimp.read(thumbNailPath, (err, lenna) => {
                  if (err) {
                    Feed.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': thumbNailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                      console.log(updated)
                    })
                    memberMedia.update({ "memberId": ObjectId(feedObj.memberId), 'media.src.thumbnail': thumbNailPath }, { 'media.$.src.thumbnail': thumbNailPath }, (err, updated) => {
                      console.log(updated)
                    });
                  }
                  else {
                    lenna
                      .resize(width, height) // resize
                      .quality(60) // set JPEG quality
                      // .greyscale() // set greyscale
                      .write(destThumbnailPath, (err, data) => {
                        if (!err)
                          resolve(destThumbnailPath);
                      }); // save
                  }
                });
              })

            }
            async function main() {

              width = 500;
              height = newMediaObj.mediaRatio * width;

              // console.log(newMediaObj)
              // console.log(thumbNailPath)
              // console.log(destThumbnailPath)
              // console.log(height)
              // console.log(width)
              await convert(thumbNailPath, destThumbnailPath, height, width);
            }
            main();
          }
          srcObj.mediaUrl = mediaUrl;
          srcObj.mediaName = mediaName;
          srcObj.videoUrl = videoUrl;
          srcObj.thumbnail = thumbnail;
          mediaObj.src = srcObj;
          mediaObj.mediaId = new ObjectId();
          mediaObj.faceFeatures = newMediaObj.faceFeatures;
          mediaObj.mediaRatio = newMediaObj.mediaRatio;
          mediaObj.mediaSize = newMediaObj.mediaSize;
          mediaObj.mediaType = newMediaObj.mediaType;
          mediaObj.mediaCaption = newMediaObj.mediaCaption;
          // mediaArray.push(mediaObj);
          updateMediaArray.push(mediaObj);
          updateMemberMediaProfile.push(mediaObj)
        }
      }
      feedDetailObj.media = deleteMediaArray;
      feedObj.media = updateMediaArray;
      Feed.updateFeedById(ObjectId(feedId), feedObj, (err, updateFeedObj) => {
        if (err) {
          return callback(new Error(`Error While updating Feed by Id : ${err}`), null)
        }
        else {
          return callback(null, updateFeedObj, feedDetailObj);
        }
      });
    }, function (updateFeedObj, feedDetailObj, callback) {
      let memberId = feedObj.memberId;
      let mMedia = updateMemberMediaProfile;
      let findQuery = { memberId: memberId };
      memberMedia.findByMemberId(findQuery, (err, memberMediaObj) => {
        if (err) {
          return callback(new Error(`Error while creating member media! : ${err} `), null, null);
        } else {
          let currentMemberMediaProfile = [];
          currentMemberMediaProfile = memberMediaObj.media;
          for (let i = 0; i < deleteMediaArray.length; i++) {
            for (let j = 0; j < currentMemberMediaProfile.length; j++) {
              if (deleteMediaArray[i].src.mediaName === memberMediaObj.media[j].src.mediaName) {
                currentMemberMediaProfile.splice(j, 1);
              }
            }
          }
          memberMediaObj.media = currentMemberMediaProfile;
          memberMedia.findByIdAndUpdate(memberMediaObj._id, memberMediaObj, (err, updateMemberMediaObj) => {
            if (err) {
              return callback(new Error(`Error while deleting member media profile! : ${err} `), null, null);
            } else {
              memberMedia.findByIdAndUpdate(memberMediaObj._id, { $push: { media: { $each: mMedia } } }, (err, updateMemberObj) => {
                if (err) {
                  return callback(new Error(`Error while creating member media! : ${err} `), null, null);
                } else {
                  return callback(null, updateFeedObj, feedDetailObj);
                }
              });
            }
          })
        }
      });
    }
  ], function (err, updatedFeedObj, feedDetailObj) {
    if (err) {
      //console.log(err.message);
      return res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: `${err}` });
    } else {
      updatedFeedObj.isFeedLikedByCurrentUser = feedDetailObj.isFeedLikedByCurrentUser;
      updatedFeedObj.feedLikesCount = feedDetailObj.feedLikesCount;
      updatedFeedObj.feedCommentsCount = feedDetailObj.feedCommentsCount;
      updatedFeedObj.feedByMemberDetails = feedDetailObj.feedByMemberDetails;
      // if (!updatedFeedObj.media.length) {
      //   mediaArray = [{
      //     "mediaId": ObjectId(updatedFeedObj._id)
      //   }]
      //   Feed.updateOne({ _id: updatedFeedObj._id }, { $set: { media: mediaArray } }, (err, data) => {
      //     console.log(data)
      //   })
      // }
      return res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "Post updated successfully", data: updatedFeedObj });
    }
  });
});

//get feed like by id with pagination
router.get('/getFeedLikesById_PK/:feed_Id/:createdAt', (req, res) => {
  let feedId = (req.params.feed_Id) ? req.params.feed_Id : '';
  let createdAt = (req.params.createdAt) ? req.params.createdAt : '';
  Feed.findFeedLikesById(feedId, createdAt, (err, feedLikesByMemberObj) => {
    if (err) {
      res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while retrieving the Feed like details by Id " + feedId + "" + err.message });
    } else {
      let fName = "", lName, username = "";
      for (let i = 0; i < feedLikesByMemberObj.length; i++) {
        let feedLikeObj = {};
        feedLikeObj = feedLikesByMemberObj[i];
        fName = feedLikeObj.memberProfile.firstName;
        lName = feedLikeObj.memberProfile.lastName;
        username = fName + " " + lName;
        feedLikeObj.memberProfile.username = username;
        feedLikesByMemberObj[i] = feedLikeObj;

      }
      feedLikesByMemberObj.sort(function (x, y) {
        var dateA = new Date(x.created_at), dateB = new Date(y.created_at);
        return dateB - dateA;
      });
      res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: feedLikesByMemberObj });
    }
  });
});

//get media like by id with pagination
router.get('/getMediaLikesById_PK/:media_Id/:createdAt', (req, res) => {
  let mediaId = (req.params.media_Id) ? req.params.media_Id : '';
  let createdAt = (req.params.createdAt) ? req.params.createdAt : '';
  Feed.findMediaLikesById(mediaId, createdAt, (err, mediaLikesByMemberObj) => {
    if (err) {
      res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while retrieving the Media like details by Id " + feedId + "" + err.message });
    } else {
      let fName = "", lName, username = "";
      for (let i = 0; i < mediaLikesByMemberObj.length; i++) {
        let mediaLikeObj = {};
        mediaLikeObj = mediaLikesByMemberObj[i];
        fName = mediaLikeObj.memberProfile.firstName;
        lName = mediaLikeObj.memberProfile.lastName;
        username = fName + " " + lName;
        mediaLikeObj.memberProfile.username = username;
        mediaLikesByMemberObj[i] = mediaLikeObj;

      }
      res.status(200).json({ success: 1, data: mediaLikesByMemberObj, token: req.headers['x-access-token'] });
    }
  });
});


//get feed comments by id pagination
router.get('/getFeedCommentsById_PK/:feed_Id/:createdAt', (req, res) => {
  Feed.findFeedCommentsByFeedId(req.params, (err, feedCommentsByMemberObj) => {
    if (err) {
      res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while retrieving the Feed Comments details by Id " + feedId + "" + err.message });
    } else {
      let fName = "", lName, username = "";
      for (let i = 0; i < feedCommentsByMemberObj.length; i++) {
        let feedCommentObj = {};
        feedCommentObj = feedCommentsByMemberObj[i];
        fName = feedCommentObj.memberProfile.firstName;
        lName = feedCommentObj.memberProfile.lastName;
        username = fName + " " + lName;
        feedCommentObj.memberProfile.username = username;
        feedCommentsByMemberObj[i] = feedCommentObj;
      }
      res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: feedCommentsByMemberObj });
    }
  });
});


//get media comments by id with pagination
router.get('/getMediaCommentsById_PK/:mediaId/:createdAt/', (req, res) => {
  Feed.findMediaCommentsByMediaId(req.params, (err, mediaCommentsByMemberObj) => {
    if (err) {
      res.status(404).json({ token: req.headers['x-access-token'], success: 0, message: "Error while retrieving the Media Comments details by Id " + feedId + "" + err.message });
    } else {
      let fName = "", lName, username = "";
      for (let i = 0; i < mediaCommentsByMemberObj.length; i++) {
        let mediaCommentObj = {};
        mediaCommentObj = mediaCommentsByMemberObj[i];
        fName = mediaCommentObj.memberProfile.firstName;
        lName = mediaCommentObj.memberProfile.lastName;
        username = fName + " " + lName;
        mediaCommentObj.memberProfile.username = username;
        mediaCommentsByMemberObj[i] = mediaCommentObj;

      }
      res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: mediaCommentsByMemberObj });
    }
  });
});

router.delete('/deleteFeed/:feed_Id', (req, res, next) => {
  let feedId = (req.params.feed_Id) ? req.params.feed_Id : '';
  Feed.updateOne({ "_id": ObjectId(feedId) }, { isDelete: true }, (err, deleteObj) => {
    if (err) {
      res.json({ success: 0, message: "Error while delete the feed by ID " + err.message });
    } else {
      Feed.findById(ObjectId(feedId), (err, deletedFeedObj) => {                    //get feed to delete media from my Profile media
        if (err) {
          console.log(err)
        } else {
          memberMedia.findOne({ memberId: deletedFeedObj.memberId }, (err, currentUserMediaProfileObj) => {
            if (err) {
              console.log(err)
            } else {
              let currentMemberMediaProfile = [];
              currentMemberMediaProfile = currentUserMediaProfileObj.media;
              for (let i = 0; i < deletedFeedObj.media.length; i++) {
                for (let j = 0; j < currentMemberMediaProfile.length; j++) {
                  if (deletedFeedObj.media[i].src.mediaName === currentUserMediaProfileObj.media[j].src.mediaName) {
                    currentMemberMediaProfile.splice(j, 1)
                  }
                }
              }
              currentUserMediaProfileObj.media = currentMemberMediaProfile;
              memberMedia.findByIdAndUpdate(currentUserMediaProfileObj._id, currentUserMediaProfileObj, { new: true }, (err, updateProfileMediaObj) => {
                if (err) {
                  console.log(err)
                } else {
                  //console.log(updateProfileMediaObj.media.length)
                  res.json({ token: req.headers['x-access-token'], success: 1, message: "Post deleted successfully" })
                }
              });

            }
          });
        }
      });
    }
  });
});













/********************************************************* Political Konnect Feeds Integration End************************************************************************************************************************** */

router.get("/getFeedByMemberId/:memberId/:currentUserId", function (req, res) {
  let memberId = ObjectId(req.params.memberId);
  let currentUserId = ObjectId(req.params.currentUserId);
  Feed.aggregate(
    [{
      $match: { $and: [{ memberId: ObjectId(memberId), isDelete: false }] }
    },
    {
      $sort: { created_at: -1 }
    },
    {
      $lookup: {
        from: "mediatrackings",
        localField: "_id",
        foreignField: "feedId",
        as: "feedStats"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: 'memberId',
        foreignField: '_id',
        as: "feedByMemberDetails"
      }
    },
    {
      "$unwind": "$feedByMemberDetails"
    },
    {
      $project: {
        "_id": 1,
        "title": 1,
        "content": 1,
        "imageRatio": 1,
        "industry": 1,
        "status": 1,
        "location": 1,
        "isDelete": 1,
        "memberId": 1,
        "media": 1,
        "created_at": 1,
        "state": 1,
        "countryCode": 1,
        feedByMemberDetails: {
          _id: 1,
          isCeleb: 1,
          isManager: 1,
          isOnline: 1,
          avtar_imgPath: 1,
          firstName: 1,
          lastName: 1,
          profession: 1,
          gender: 1,
          username: 1,
          cover_imgPath: 1
        },
        feedLikesCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { $and: [{ "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }] }
            }
          }
        },
        feedCommentsCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { "$eq": ["$$this.activities", "comment"] }
            }
          }
        },
        isFeedLikedByCurrentUser: {
          $size: {
            $filter: {
              input: "$feedStats",
              //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
              cond: {
                $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(currentUserId)] }] },
                { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
              }
            }
          }
        }
      }
    }
    ], function (err, listOfFeedObj) {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      }
      else if (listOfFeedObj) {
        return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfFeedObj });
      }
      else {
        res.json({ token: req.headers['x-access-token'], success: 1, data: [] });
      }
    });
});
// Get feeds for a user
router.get("/getFeedByMemberId/:memberId", function (req, res) {
  let memberId = req.params.memberId;
  Feed.aggregate(
    [{
      //$match: {memberId: ObjectId(memberId), isDelete: false}
      $match: { $and: [{ memberId: ObjectId(memberId) }, { isDelete: false }] }
    },
    {
      $sort: {
        created_at: -1
      }
    },
    {
      $lookup: {
        from: "mediatrackings",
        localField: "_id",
        foreignField: "feedId",
        as: "feedStats"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: 'memberId',
        foreignField: '_id',
        as: "feedByMemberDetails"
      }
    },
    {
      "$unwind": "$feedByMemberDetails"
    },
    {
      $project: {
        "_id": 1,
        "title": 1,
        "content": 1,
        "imageRatio": 1,
        "industry": 1,
        "status": 1,
        "location": 1,
        "isDelete": 1,
        "memberId": 1,
        "media": 1,
        "created_at": 1,
        "state": 1,
        "countryCode": 1,
        //"mediaStats": 1,
        //"feedStats": 1,
        feedByMemberDetails: {
          _id: 1,
          isCeleb: 1,
          isManager: 1,
          isOnline: 1,
          avtar_imgPath: 1,
          firstName: 1,
          lastName: 1,
          profession: 1,
          gender: 1,
          username: 1
        }, feedLikesCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { $and: [{ "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }] }
            }
          }
        },
        feedCommentsCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { "$eq": ["$$this.activities", "comment"] }
            }
          }
        },
        isFeedLikedByCurrentUser: {
          $size: {
            $filter: {
              input: "$feedStats",
              //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
              cond: {
                $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(memberId)] }] },
                { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
              }
            }
          }
        }
      }
    }
    ],
    function (err, listOfFeedObj) {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        //res.send(err);
      }
      else if (listOfFeedObj) {
        return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfFeedObj });
      }
      else {
        return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: [] });
      }
    }
  );
});

// Get feeds for a user
router.get("/getFeedByMemberId/:memberId/:createdAt/:limit", function (req, res) {
  let memberId = req.params.memberId;
  let createdAt = req.params.createdAt
  let getFeedByTime = new Date();
  let limit = parseInt(req.params.limit)
  if (createdAt != "null" && createdAt != "0") {
    getFeedByTime = new Date(createdAt)
  }
  Feed.aggregate(
    [{
      //$match: {memberId: ObjectId(memberId), isDelete: false}
      $match: { memberId: ObjectId(memberId), isDelete: false, created_at: { $lt: getFeedByTime } }
    },
    {
      $sort: {
        created_at: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: "mediatrackings",
        localField: "_id",
        foreignField: "feedId",
        as: "feedStats"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: 'memberId',
        foreignField: '_id',
        as: "feedByMemberDetails"
      }
    },
    {
      "$unwind": "$feedByMemberDetails"
    },
    {
      $project: {
        "_id": 1,
        "title": 1,
        "content": 1,
        "imageRatio": 1,
        "industry": 1,
        "status": 1,
        "location": 1,
        "isDelete": 1,
        "memberId": 1,
        "media": 1,
        "created_at": 1,
        "state": 1,
        "countryCode": 1,
        //"mediaStats": 1,
        //"feedStats": 1,
        feedByMemberDetails: {
          _id: 1,
          isCeleb: 1,
          isManager: 1,
          isOnline: 1,
          avtar_imgPath: 1,
          firstName: 1,
          lastName: 1,
          profession: 1,
          gender: 1,
          username: 1,
          cover_imgPath: 1
        }, feedLikesCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { $and: [{ "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }] }
            }
          }
        },
        feedCommentsCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { "$eq": ["$$this.activities", "comment"] }
            }
          }
        },
        isFeedLikedByCurrentUser: {
          $size: {
            $filter: {
              input: "$feedStats",
              //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
              cond: {
                $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(memberId)] }] },
                { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
              }
            }
          }
        }
      }
    }
    ],
    function (err, listOfFeedObj) {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
        //res.send(err);
      }
      else if (listOfFeedObj) {
        return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfFeedObj });
      }
      else {
        return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: [] });
      }
    }
  );
});

//pagiganation
router.get("/getFeedByMemberId/:memberId/:currentUserId/:createdAt/:limit", (req, res) => {
  let memberId = req.params.memberId;
  let createdAt = req.params.createdAt
  let getFeedByTime = new Date();
  let limit = parseInt(req.params.limit)
  if (createdAt != "null" && createdAt != "0") {
    getFeedByTime = createdAt
  }
  let currentUserId = ObjectId(req.params.currentUserId);
  //, { media: { $ne: [] } }
  Feed.aggregate(
    [{
      $match: {
        memberId: ObjectId(memberId),
        isDelete: false,
        created_at: { $lt: new Date(getFeedByTime) }
      }
    },
    {
      $sort: { created_at: -1 }
    },
    {
      $lookup: {
        from: "mediatrackings",
        localField: "_id",
        foreignField: "feedId",
        as: "feedStats"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: 'memberId',
        foreignField: '_id',
        as: "feedByMemberDetails"
      }
    },
    {
      "$unwind": "$feedByMemberDetails"
    },
    {
      $limit: limit
    },
    {
      $project: {
        "_id": 1,
        "title": 1,
        "content": 1,
        "imageRatio": 1,
        "industry": 1,
        "status": 1,
        "location": 1,
        "isDelete": 1,
        "memberId": 1,
        "media": 1,
        "created_at": 1,
        "state": 1,
        "countryCode": 1,
        //"mediaStats": 1,
        //"feedStats": 1,
        feedByMemberDetails: {
          _id: 1,
          isCeleb: 1,
          isManager: 1,
          isOnline: 1,
          avtar_imgPath: 1,
          firstName: 1,
          lastName: 1,
          profession: 1,
          gender: 1,
          username: 1
        },
        feedLikesCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { $and: [{ "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }] }
            }
          }
        },
        feedCommentsCount: {
          $size: {
            $filter: {
              input: "$feedStats",
              cond: { "$eq": ["$$this.activities", "comment"] }
            }
          }
        },
        isFeedLikedByCurrentUser: {
          $size: {
            $filter: {
              input: "$feedStats",
              //cond: { "$eq": ["$$this.memberId", ObjectId(memberId)] }
              cond: {
                $and: [{ $or: [{ "$eq": ["$$this.memberId", ObjectId(currentUserId)] }] },
                { "$eq": ["$$this.activities", "views"] }, { "$eq": ["$$this.isLike", true] }]
              }
            }
          }
        }
      }
    }
    ], function (err, listOfFeedObj) {
      if (err) {
        res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      }
      else if (listOfFeedObj) {
        return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: listOfFeedObj });
      }
      else {
        res.json({ token: req.headers['x-access-token'], success: 1, data: [] });
      }
    });
});

// Get Feed likes count by mediaId ONLY admin side
router.get("/getMediaStatsCountByMediaId/:feedId/:memberId", function (req, res) {
  let id = req.params.memberId;
  let feedId = ObjectId(req.params.feedId);
  Feed.aggregate(
    [
      {
        $match: { $and: [{ _id: ObjectId(feedId) }] }
      },
      { "$unwind": "$mediaArray" },
      {
        $lookup: {
          from: "mediatrackings",
          localField: "mediaArray.media_id",
          foreignField: "mediaId",
          as: "mediaStats" // to get all the views, comments, shares count
        }
      },
      {
        $project: {
          title: 1,
          content: 1,
          mediaSrc: 1,
          memberId: 1,
          mediaFile: "$mediaArray",
          mediaStats: 1
        }
      }
    ],
    function (err, data) {
      if (err || data.length == 0) {
        res.send({ "error": "Not found / invalid feedId" });
      } else {
        // Filter FeedStats to get views, shares, follow and comment count
        for (let i = 0; i < data.length; i++) {
          let likesCount = 0;
          let sharesCount = 0;
          let commentsCount = 0;
          let followCount = 0;
          let likeStatus = false;
          let viewStatus = false;
          let bookmarkStatus = false;

          for (let j = 0; j < data[i].mediaStats.length; j++) {
            if (data[i].mediaStats[j].activities == "views") {
              if ((data[i].mediaStats[j].memberId == id) && (data[i].mediaStats[j].activities == "views")) {
                likeStatus = true;
              }
              likesCount = likesCount + 1;
            }
            if (data[i].mediaStats[j].activities == "bookmark") {
              if ((data[i].mediaStats[j].memberId == id) && (data[i].mediaStats[j].activities == "bookmark")) {
                bookmarkStatus = true;
              }
            }
            if (data[i].mediaStats[j].activities == "share") {
              sharesCount = sharesCount + 1;
            }
            if (data[i].mediaStats[j].activities == "follow") {
              if ((data[i].mediaStats[j].memberId == id) && (data[i].mediaStats[j].activities == "follow")) {
                viewStatus = true;
              }
              followCount = followCount + 1;
            }
            if (data[i].mediaStats[j].activities == "comment") {
              commentsCount = data[i].mediaStats[j].source.length + commentsCount;
            }
          }
          // Append the counts to main object
          data[i].likesCount = likesCount;
          data[i].sharesCount = sharesCount;
          data[i].commentsCount = commentsCount;
          data[i].followCount = followCount;
          data[i].likeStatus = likeStatus;
          data[i].viewStatus = viewStatus;
          data[i].bookmarkStatus = bookmarkStatus;
        }
        // End of Filter mediaStats to get views, shares, follow and comment count
        return res.json({
          "title": data[0].title,
          "content": data[0].content,
          "mediaArray": data
        });
      }

    }
  );
});
//only admin side
router.post('/postFeedLikeByNumber', (req, res) => {
  req.body.numberOfLikes = parseInt(req.body.numberOfLikes)
  if (req.body.feedId == undefined || !req.body.feedId.length) {
    res.json({ success: 0, message: "Please Provide Feed Deatails" })
  }
  else if (parseInt(req.body.numberOfLikes) < 0 || req.body.numberOfLikes == "0") {
    res.json({ success: 0, message: "Please provide positive integer value more than 0" })
  }
  else if (req.body.numberOfLikes == undefined || !req.body.numberOfLikes) {
    res.json({ success: 0, message: "Please Provide likes count" })
  }
  else {
    let now = new Date();
    let todayMinut = now.getMinutes()
    Feed.aggregate([
      {
        $match: {
          _id: ObjectId(req.body.feedId)
        }
      },
      {
        $lookup: {
          from: "mediatrackings",
          localField: "_id",
          foreignField: "feedId",
          as: "feedLike"
        }
      },
      {
        $unwind: {
          "path": "$feedLike",
          "preserveNullAndEmptyArrays": true
        },
      },
      {
        $sort: { 'feedLike.created_at': -1 }
      },
      {
        $group: {
          '_id': "$_id",
          created_at: {
            $push: {
              "created_at": "$created_at",
            }
          },
          feedLike: {
            $push: {
              "_id": "$feedLike._id",
              "feedId": "$feedLike.feedId",
              "memberId": "$feedLike.memberId",
              "isLike": "$feedLike.isLike",
              "activities": "$feedLike.ctivities",
              "status": "$feedLike.status",
              "updatedBy": "$feedLike.updatedBy",
              "createdBy": "$feedLike.createdBy",
              "updated_at": "$feedLike.updated_at",
              "created_at": "$feedLike.created_at"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          feedLike: 1,
          created_at: 1
        }
      }
    ], (err, feedDetails) => {
      if (err) {
        res.json({ success: 0, token: req.headers['x-access-token'], message: err });
      } else {
        let startTime = feedDetails[0].created_at[0].created_at;
        if (feedDetails[0] && feedDetails[0].feedLike.length && feedDetails[0].feedLike[0].created_at) {
          startTime = feedDetails[0].feedLike[0].created_at;
        }
        if (feedDetails.length) {
          let likedArray = feedDetails[0].feedLike.map((feedLikeObj) => {
            if (feedLikeObj.isLike)
              return ObjectId(feedLikeObj.memberId);
          })
          let startMinut = todayMinut;
          let randomNumber = parseInt(req.body.numberOfLikes)
          User.aggregate([
            {
              $match: {
                IsDeleted: false,
                dua: true,
                _id: { $nin: likedArray }
              }
            },
            {
              $sample:
              {
                size: randomNumber
              }
            },
            {
              $project: {
                _id: 1,
                email: 1
              }
            }], (err, usersList) => {
              if (err) {
                res.json({ success: 0, token: req.headers['x-access-token'], message: err });
              }
              else {
                let insertManyLike = usersList.map((userde) => {
                  randomDate = generateRandom(Date.now(), startTime.setMinutes(startMinut))
                  user = {
                    "feedId": req.body.feedId,
                    "memberId": userde._id,
                    "isLike": true,
                    "activities": "views",
                    "status": "Active",
                    "updatedBy": "Admin",
                    "createdBy": "Admin",
                    "updated_at": randomDate,
                    "created_at": randomDate
                  }
                  return user;
                })
                mediaTracking.insertMany(insertManyLike, (err, likedArray) => {
                  if (err) {
                    res.json({ success: 0, token: req.headers['x-access-token'], message: err });
                  }
                  else {
                    res.json({ success: 1, insertManyLike: insertManyLike, users: usersList, feedDetails: feedDetails, likedArray: likedArray, numberOfLikes: randomNumber })
                    updateLoginTime(usersList)
                  }
                })
              }
            })
        }
        else {
          res.json({ success: 0, token: req.headers['x-access-token'], message: "Feed details not found id " + req.body.feedId });
        }
      }
    })
  }
})
//only admin side
router.post('/feedLikeByRandomUser', (req, res) => {
  if (req.body.feedId == undefined || !req.body.feedId.length) {
    res.json({ success: 0, message: "Please Provide Feed Deatails" })
  }
  else {
    let now = new Date();
    let todayMinut = now.getMinutes()
    Feed.aggregate([
      {
        $match: {
          _id: ObjectId(req.body.feedId)
        }
      },
      {
        $lookup: {
          from: "mediatrackings",
          localField: "_id",
          foreignField: "feedId",
          as: "feedLike"
        }
      },
      {
        $unwind: {
          "path": "$feedLike",
          "preserveNullAndEmptyArrays": true
        },
      },
      {
        $sort: { 'feedLike.created_at': -1 }
      },
      {
        $group: {
          '_id': "$_id",
          created_at: {
            $push: {
              "created_at": "$created_at",
            }
          },
          feedLike: {
            $push: {
              "_id": "$feedLike._id",
              "feedId": "$feedLike.feedId",
              "memberId": "$feedLike.memberId",
              "isLike": "$feedLike.isLike",
              "activities": "$feedLike.ctivities",
              "status": "$feedLike.status",
              "updatedBy": "$feedLike.updatedBy",
              "createdBy": "$feedLike.createdBy",
              "updated_at": "$feedLike.updated_at",
              "created_at": "$feedLike.created_at"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          feedLike: 1,
          created_at: 1
        }
      }
    ], (err, feedDetails) => {
      if (err) {
        res.json({ success: 0, token: req.headers['x-access-token'], message: err });
      } else {
        let startMinut = todayMinut;
        let startTime = feedDetails[0].created_at[0].created_at;
        if (feedDetails[0] && feedDetails[0].feedLike.length && feedDetails[0].feedLike[0].created_at) {
          startTime = feedDetails[0].feedLike[0].created_at
        }
        if (feedDetails.length) {
          let likedArray = feedDetails[0].feedLike.map((feedLikeObj) => {
            if (feedLikeObj.isLike)
              return ObjectId(feedLikeObj.memberId);
          })
          let randomNumber = Math.floor(Math.random() * 20) + 1
          User.aggregate([
            {
              $match: {
                IsDeleted: false,
                dua: true,
                _id: { $nin: likedArray }
              }
            },
            {
              $sample:
              {
                size: randomNumber
              }
            },
            {
              $project: {
                _id: 1,
                email: 1
              }
            }], (err, usersList) => {
              if (err) {
                res.json({ success: 0, token: req.headers['x-access-token'], message: err });
              }
              else {
                let insertManyLike = usersList.map((userde) => {
                  // let randomDate = randomTime(startTime)
                  randomDate = generateRandom(Date.now(), startTime.setMinutes(startMinut))
                  user = {
                    "feedId": req.body.feedId,
                    "memberId": userde._id,
                    "isLike": true,
                    "activities": "views",
                    "status": "Active",
                    "updatedBy": "Admin",
                    "createdBy": "Admin",
                    "updated_at": randomDate,
                    "created_at": randomDate
                  }
                  return user;
                })
                mediaTracking.insertMany(insertManyLike, (err, likedArray) => {
                  if (err) {
                    res.json({ success: 0, token: req.headers['x-access-token'], message: err });
                  }
                  else {
                    res.json({ success: 1, insertManyLike: insertManyLike, users: usersList, feedDetails: feedDetails, likedArray: likedArray, numberOfLikes: randomNumber })
                    updateLoginTime(usersList)
                  }
                })
              }
            })
        }
        else {
          res.json({ success: 0, token: req.headers['x-access-token'], message: "Feed details not found id " + req.body.feedId });
        }
      }
    })
  }
})

// Get Feed By Celebrities in Order
// router.get("/getFeedByCelebritiesInOrder/:userId", function (req, res) {
//   id = req.params.userId;
//   // Fetch Feed By Recent Order
//   Feed.aggregate(
//     [{
//       $lookup: {
//         from: "feedlogs",
//         localField: "_id",
//         foreignField: "feedId",
//         as: "feedStats" // to get all the views, comments, shares count
//       }
//     },

//     {
//       $lookup: {
//         from: "users",
//         localField: "memberId",
//         foreignField: "_id",
//         as: "memberProfile" // to get all the views, comments, shares count
//       }
//     },
//     {
//       $lookup: {
//         from: "mediaTracking",
//         localField: "activityMemberID",
//         foreignField: "mediaId",
//         as: "mediaStats" // to get all the views, comments, shares count
//       }
//     },
//     {
//       $sort: {
//         created_at: -1
//       }
//     },
//     {
//       $limit: 50
//     },
//     ],

//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       //console.log(data);

//       // Filter FeedStats to get views, shares, follow and comment count
//       for (let i = 0; i < data.length; i++) {

//         let likesCount = 0;
//         let sharesCount = 0;
//         let commentsCount = 0;
//         let followCount = 0;
//         let mlikesCount = 0;
//         let msharesCount = 0;
//         let mcommentsCount = 0;
//         let likeStatus = false;
//         let viewStatus = false;
//         let bookmarkStatus = false;
//         let mlikeStatus = false;
//         let mviewStatus = false;

//         for (let j = 0; j < data[i].feedStats.length; j++) {
//           if (data[i].feedStats[j].activities == "views") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "views")) {
//               likeStatus = true;
//             }
//             likesCount = likesCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "bookmark") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "bookmark")) {
//               bookmarkStatus = true;
//             }
//           }
//           if (data[i].feedStats[j].activities == "share") {
//             sharesCount = sharesCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "follow") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "follow")) {
//               viewStatus = true;
//             }
//             followCount = followCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "comment") {
//             commentsCount = data[i].feedStats[j].source.length + commentsCount;
//           }
//         }

//         for (let j = 0; j < data[i].mediaStats.length; j++) {
//           if (data[i].mediaStats[j].activities == "views") {
//             if ((data[i].mediaStats[j].memberId == id) && (data[i].mediaStats[j].activities == "views")) {
//               mlikeStatus = true;
//             }
//             mlikesCount = likesCount + 1;
//           }
//           if (data[i].mediaStats[j].activities == "share") {
//             msharesCount = sharesCount + 1;
//           }
//           if (data[i].mediaStats[j].activities == "comment") {
//             mcommentsCount = data[i].mediaStats[j].source.length + commentsCount;
//           }
//         }
//         // Append the counts to main object
//         data[i].likesCount = likesCount;
//         data[i].sharesCount = sharesCount;
//         data[i].commentsCount = commentsCount;
//         data[i].followCount = followCount;
//         data[i].likeStatus = likeStatus;
//         data[i].viewStatus = viewStatus;
//         data[i].bookmarkStatus = bookmarkStatus;
//         data[i].mlikesCount = mlikesCount;
//         data[i].msharesCount = msharesCount;
//         data[i].mcommentsCount = mcommentsCount;
//         data[i].mlikeStatus = mlikeStatus;
//         data[i].mviewStatus = mviewStatus;
//       }
//       return res.send(data);
//     }
//   );
//   // End of Fetch By Recent Order
// });
// End of Get Feed By Celebrities in Order

// Get Feed By Celebrities By Created Date
// router.get("/getFeedByCelebritiesByCreatedDate/:userId", function (req, res) {
//   id = req.params.userId;

//   User.findById(id, function (err, result) {
//     if (err) return res.send(err);
//     if (result) {
//       MemberPreferences.findOne({
//         memberId: result._id
//       }, function (
//         err,
//         newresult
//       ) {
//           if (err) return res.send(err);
//           if (newresult.preferences.length == 0) {
//             Feed.aggregate(
//               [{
//                 $lookup: {
//                   from: "feedlogs",
//                   localField: "_id",
//                   foreignField: "feedId",
//                   as: "feedStats"
//                 }
//               },
//               {
//                 $sort: {
//                   created_at: -1
//                 }
//               }
//               ],
//               function (err, data) {
//                 if (err) {
//                   res.send(err);
//                 }
//                 return res.send(data);
//               }
//             );
//           } else {
//             // Aggregate Memberpreferences MemberIds with User collection's UserIds
//             Feed.aggregate(
//               [{
//                 $lookup: {
//                   from: "feedlogs",
//                   localField: "_id",
//                   foreignField: "feedId",
//                   as: "feedStats"
//                 }
//               },
//               {
//                 $lookup: {
//                   from: "memberpreferences",
//                   localField: "memberId",
//                   foreignField: "memberId",
//                   as: "feedData"
//                 }
//               },
//               {
//                 $match: {
//                   $and: [{
//                     "feedData.preferences": {
//                       $in: newresult.preferences
//                     }
//                   }]
//                 }
//               },
//               {
//                 $sort: {
//                   created_at: -1
//                 }
//               }
//               ],
//               function (err, data) {
//                 if (err) {
//                   res.send(err);
//                 }
//                 return res.send(data);
//               }
//             );
//           }
//         });
//     } else {
//       res.json({
//         error: "User Not Exists / Send a valid UserID"
//       });
//     }
//   });
// });
// End of Get Feed By Celebrities By Created Date

// Get Celebrity by Feed ID
// router.get("/getCelebrityIdByFeedID/:feedID", function (req, res) {
//   let feedID = ObjectId(req.params.feedID);
//   Feed.findById(feedID, function (err, result) {
//     if (err) return res.send(err);

//     if (result) {
//       res.json({
//         CelebrityID: result.memberId
//       });
//     } else {
//       res.json({
//         error: "FeedID not found / Invalid"
//       });
//     }
//   });
// });
// End of Get Celebrity by Feed ID



// Get All feed (All Users)
// router.get("/allFeed", function (req, res) {
//   Feed.find({}, null, { sort: { createdAt: -1 } }, function (err, feed) {
//     if (err) return next(err);
//     res.json(feed);
//   }).sort({ created_at: -1 });
// });
// End of Get All feed (All Users)

// Get All feed (All Users)
// router.get("/allFeed/:pageNo/:limit", (req, res) => {
//   let params = req.params;
//   let pageNo = parseInt(params.pageNo);
//   let startFrom = params.limit * (pageNo - 1);
//   let limit = parseInt(params.limit);
//   Feed.count({}, (err, count) => {
//     if (err) {
//       res.json({ token: req.headers['x-access-token'], success: 0, message: err })
//     } else {
//       Feed.find({}, (err, feed) => {
//         if (err) {
//           res.json({ token: req.headers['x-access-token'], success: 0, message: err })
//         } else {
//           let data = {};
//           data.feed = feed
//           let total_pages = count / limit
//           data.pagination = {
//             "total_count": count,
//             "total_pages": total_pages == 0 ? total_pages : parseInt(total_pages) + 1,
//             "current_page": pageNo,
//             "limit": limit
//           }
//           res.json({ token: req.headers['x-access-token'], success: 1, data: data })
//         }
//       }).sort({ created_at: -1 }).skip(startFrom).limit(limit).lean();
//     }
//   })
// });
// End of Get All feed (All Users)

// Get Feed by FeedID
// router.get("/getFeedByFeedID/:feedID/:userId", function (req, res) {
//   let feedID = ObjectId(req.params.feedID);
//   let memberId = req.params.userId;
//   Feed.aggregate(
//     [{
//       $match: {
//         _id: ObjectId(feedID)
//       }
//     },
//     {
//       $lookup: {
//         from: "mediatrackings",
//         localField: "_id",
//         foreignField: "feedId",
//         as: "feedStats"
//       }
//     },
//     {
//       $lookup: {
//         from: "mediatrackings",
//         localField: "media.mediaId",
//         foreignField: "mediaId",
//         as: "mediaStats"
//       }
//     }
//     ],
//     function (err, listOfFeedObj) {
//       if (err) {
//         res.send(err);
//       }
//       for (let i = 0; i < listOfFeedObj.length; i++) {
//         let feedObj = {};
//         let mediaStats = [];
//         feedObj = listOfFeedObj[i];
//         if (feedObj.media.length <= 0) {
//           feedObj.mediaStats = [];
//         }
//         let feedStatsCount = {};
//         let feedlikesCount = 0;
//         let feedCommentsCount = 0;
//         let isFeedLikedByCurrentUser = false;
//         let feedCommentsStatus = false;

//         //Media count
//         let mediaCountObj = {};
//         let mediaCountArray = [];
//         let medialikesCount = 0;
//         let mediaCommentsCount = 0;
//         let isMediaLikedByCurrentUser = false;
//         let mediaCommentsStatus = false;


//         //this for loop for feed count
//         for (let j = 0; j < listOfFeedObj[i].feedStats.length; j++) {
//           if (listOfFeedObj[i].feedStats[j].activities == "views" && listOfFeedObj[i].feedStats[j].isLike === true) {
//             if (listOfFeedObj[i].feedStats[j].memberId == memberId) {
//               isFeedLikedByCurrentUser = true;
//             }
//             feedlikesCount = feedlikesCount + 1;
//           } else if (listOfFeedObj[i].feedStats[j].activities == "comment") {
//             feedCommentsCount = feedCommentsCount + 1;
//           }

//         }
//         //this for loop for media count
//         for (let j = 0; j < listOfFeedObj[i].media.length; j++) {
//           mediaCountObj = {};
//           medialikesCount = 0;
//           mediaCommentsCount = 0;
//           isMediaLikedByCurrentUser = false;

//           let mediaArray = listOfFeedObj[i].media;
//           let mediaIdFromDb = mediaArray[j].mediaId;
//           mediaIdFromDb = "" + mediaIdFromDb;
//           for (var k = 0; k < listOfFeedObj[i].mediaStats.length; k++) {
//             let mediaId = listOfFeedObj[i].mediaStats[k].mediaId;
//             mediaId = "" + mediaId;
//             if (mediaIdFromDb == mediaId) {
//               let actionTypeFromDb = listOfFeedObj[i].mediaStats[k].activities;
//               if (actionTypeFromDb == "views" && listOfFeedObj[i].mediaStats[k].isLike === true) {
//                 if (listOfFeedObj[i].mediaStats[k].memberId == memberId) {
//                   isMediaLikedByCurrentUser = true;
//                 }
//                 medialikesCount = medialikesCount + 1;
//               } else if (actionTypeFromDb == "comment") {
//                 mediaCommentsCount = mediaCommentsCount + 1;
//               }
//             }
//           }
//           listOfFeedObj[i].media[j].mediaLikesCount = medialikesCount;
//           listOfFeedObj[i].media[j].mediaCommentsCount = mediaCommentsCount;
//           listOfFeedObj[i].media[j].isMediaLikedByCurrentUser = isMediaLikedByCurrentUser;
//         }
//         listOfFeedObj[i].feedLikesCount = feedlikesCount;
//         listOfFeedObj[i].feedCommentsCount = feedCommentsCount;
//         listOfFeedObj[i].isFeedLikedByCurrentUser = isFeedLikedByCurrentUser;
//       }
//       return res.send(listOfFeedObj);
//     }
//   );
// });
// End of // Get Feed by FeedID

// Edit a Feed
// router.put("/edit/:feedID", function (req, res) {
//   let id = req.params.feedID;
//   let reqbody = req.body;
//   reqbody.updated_at = new Date();

//   Feed.findById(id, function (err, newresult) {
//     if (err) res.send(err);
//     let fid = newresult._id;
//     if (newresult) {
//       Feed.findOneAndUpdate({ _id: ObjectId(fid) }, reqbody, function (
//         err,
//         result
//       ) {
//         if (err) {
//           res.send(err);
//         } else {
//           res.json({ message: "Post updated successfully" });
//         }
//       });
//     } else {
//       res.json({
//         error: "Feed Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
// End of Edit a Feed

// Delete feed
// router.delete("/deleteFeed/:id", function (req, res, next) {
//   let id = req.params.id;
//   Feed.findById(id, function (err, result) {
//     if (result) {
//       Feed.findByIdAndRemove(id, function (err, post) {
//         if (err) return next(err);
//         res.json({ token: req.headers['x-access-token'], success: 1, message: "Deleted Feed Successfully" })
//       });
//     } else {
//       res.json({ token: req.headers['x-access-token'], success: 0, message: "FeedID not found / Invalid" })
//     }
//   });
// });
// End of Delete feed


//////// FEED SEARCH //////////////////
// router.get("/feedSearch/:userId/:string", function (req, res, next) {
//   id = req.params.userId;
//   let searchString = req.params.string;
//   Feed.aggregate(
//     [{
//       $match: {
//         $or: [{
//           title: {
//             $regex: searchString,
//             $options: 'i'
//           }
//         }, {
//           content: {
//             $regex: searchString,
//             $options: 'i'
//           }
//         }, {
//           memberName: {
//             $regex: searchString,
//             $options: 'i'
//           }
//         }]
//       },
//     },
//     {
//       $lookup: {
//         from: "feedlogs",
//         localField: "_id",
//         foreignField: "feedId",
//         as: "feedStats" // to get all the views, comments, shares count
//       }
//     },
//     ],
//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       // Filter FeedStats to get views, shares, follow and comment count
//       for (let i = 0; i < data.length; i++) {
//         let likesCount = 0;
//         let sharesCount = 0;
//         let commentsCount = 0;
//         let followCount = 0;
//         let likeStatus = false;
//         let viewStatus = false;
//         let bookmarkStatus = false;

//         for (let j = 0; j < data[i].feedStats.length; j++) {
//           if (data[i].feedStats[j].activities == "views") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "views")) {
//               likeStatus = true;
//             }
//             likesCount = likesCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "bookmark") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "bookmark")) {
//               bookmarkStatus = true;
//             }
//           }
//           if (data[i].feedStats[j].activities == "share") {
//             sharesCount = sharesCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "follow") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "follow")) {
//               viewStatus = true;
//             }
//             followCount = followCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "comment") {
//             commentsCount = data[i].feedStats[j].source.length + commentsCount;
//           }
//         }
//         // Append the counts to main object
//         data[i].likesCount = likesCount;
//         data[i].sharesCount = sharesCount;
//         data[i].commentsCount = commentsCount;
//         data[i].followCount = followCount;
//         data[i].likeStatus = likeStatus;
//         data[i].viewStatus = viewStatus;
//         data[i].bookmarkStatus = bookmarkStatus;
//       }
//       // End of Filter FeedStats to get views, shares, follow and comment count
//       return res.send(data);
//     }
//   );

// });
//////// END OF FEED SEARCH //////////////////

///////////////// PAGINATION ///////////////////////////////
// Get Feed By Celebrities in Order
// router.get("/feedPagination/:userId/:limit/:skip", function (req, res) {
//   id = req.params.userId;
//   limit = parseInt(req.params.limit);
//   skip = parseInt(req.params.skip);
//   // Fetch Feed By Recent Order
//   // Aggregate Memberpreferences MemberIds with User collection's UserIds
//   Feed.aggregate(
//     [{
//       $lookup: {
//         from: "feedlogs",
//         localField: "_id",
//         foreignField: "feedId",
//         as: "feedStats" // to get all the views, comments, shares count
//       }
//     },

//     {
//       $lookup: {
//         from: "users",
//         localField: "memberId",
//         foreignField: "_id",
//         as: "memberProfile" // to get all the views, comments, shares count
//       }
//     },
//     {
//       $lookup: {
//         from: "mediaTracking",
//         localField: "activityMemberID",
//         foreignField: "mediaId",
//         as: "mediaStats" // to get all the views, comments, shares count
//       }
//     },
//     {
//       $sort: {
//         created_at: -1
//       }
//     },
//     //pagination start
//     { $skip: skip },
//     { $limit: limit },
//     ],
//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       // Filter FeedStats to get views, shares, follow and comment count
//       for (let i = 0; i < data.length; i++) {
//         let likesCount = 0;
//         let sharesCount = 0;
//         let commentsCount = 0;
//         let followCount = 0;
//         let mlikesCount = 0;
//         let msharesCount = 0;
//         let mcommentsCount = 0;
//         let likeStatus = false;
//         let viewStatus = false;
//         let bookmarkStatus = false;
//         let mlikeStatus = false;
//         let mviewStatus = false;
//         //console.log(data[i].feedStats[j]);

//         for (let j = 0; j < data[i].feedStats.length; j++) {
//           //console.log(data[i].feedStats[j]);
//           if (data[i].feedStats[j].activities == "views") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "views")) {
//               likeStatus = true;

//             }
//             likesCount = likesCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "bookmark") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "bookmark")) {
//               bookmarkStatus = true;
//             }
//           }
//           if (data[i].feedStats[j].activities == "share") {
//             sharesCount = sharesCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "follow") {
//             if ((data[i].feedStats[j].memberId == id) && (data[i].feedStats[j].activities == "follow")) {
//               viewStatus = true;
//             }
//             followCount = followCount + 1;
//           }
//           if (data[i].feedStats[j].activities == "comment") {
//             commentsCount = data[i].feedStats[j].source.length + commentsCount;
//           }
//         }

//         for (let j = 0; j < data[i].mediaStats.length; j++) {
//           if (data[i].mediaStats[j].activities == "views") {
//             if ((data[i].mediaStats[j].memberId == id) && (data[i].mediaStats[j].activities == "views")) {
//               mlikeStatus = true;
//             }
//             mlikesCount = likesCount + 1;
//           }
//           if (data[i].mediaStats[j].activities == "share") {
//             msharesCount = sharesCount + 1;
//           }
//           if (data[i].mediaStats[j].activities == "comment") {
//             mcommentsCount = data[i].mediaStats[j].source.length + commentsCount;
//           }
//         }
//         // Append the counts to main object
//         //console.log(data[i].feedStats[i]);
//         data[i].likesCount = likesCount;
//         data[i].sharesCount = sharesCount;
//         data[i].commentsCount = commentsCount;
//         data[i].followCount = followCount;
//         data[i].likeStatus = likeStatus;
//         data[i].viewStatus = viewStatus;
//         data[i].bookmarkStatus = bookmarkStatus;
//         data[i].mlikesCount = mlikesCount;
//         data[i].msharesCount = msharesCount;
//         data[i].mcommentsCount = mcommentsCount;
//         data[i].mlikeStatus = mlikeStatus;
//         data[i].mviewStatus = mviewStatus;
//       }
//       // End of Filter FeedStats to get views, shares, follow and comment count
//       return res.send(data);
//     }
//   );

// });
// End of Get Feed By Celebrities in Order
///////////////// END OF PAGINATION ////////////////////////

//////////////////////////////////////// Edit Feed (MediaPost) ////////////////////////////////////
// router.post("/edit/:feedID", upload.any(), function (req, res) {
//   let id = req.params.feedID;
//   let media_id = req.body.media_id;
//   let reqbody = req.body;
//   reqbody.updated_at = new Date();
//   //console.log(req.body)
//   //console.log(req.files)

//   Feed.findById(id, function (err, newresult) {
//     if (err) res.send(err);
//     let fid = newresult._id;
//     if (newresult) {
//       Feed.findOneAndUpdate({ _id: ObjectId(fid) }, reqbody, function (
//         err,
//         result
//       ) {
//         if (err) {
//           res.send(err);
//         } else {
//           res.json({ message: "Feed updated successfully" });
//         }
//       });
//     } else {
//       res.json({
//         error: "Feed Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
//////////////////////////////////////// End of Edit Feed (MediaPost) /////////////////////////////

//////////////////////////////////edit feed by rohit start /////////////////////////////////////
// router.put('/editFeedById/:feed_Id', upload.any(), (req, res, next) => {
//   let feedId = req.params.feed_Id;
//   //console.log(feedId)
//   var imageFilesArray = [];
//   var videoFilesArray = [];
//   var audioFilesArray = [];
//   var memberMediaObj = {};
//   var existedMediaArray = [];
//   var updatedMediaArray = []
//   var updatedMediaObject;
//   var untouchArray = [];
//   let feedObj = req.body;
//   feedObj.updated_at = new Date();
//   if (!feedObj.isSave) {
//     untouchArray = feedObj.mediaArray;
//     for (var i = 0; i < untouchArray.length; i++) {
//       if (untouchArray[i].media_id) {
//         updatedMediaArray.push(untouchArray[i])
//       } else {
//         let mediaName = untouchArray[i].mediaName;
//         fs.unlinkSync("uploads/feeds/" + mediaName);
//       }
//     }
//     return res.json({ success: 0, message: "Uploaded new Media have deleted successfully" });
//   }


//   Feed.getFeedById(feedId, (err, existedFeedObj) => {
//     if (err) {
//       console.log(err);
//     } else {
//       let memberId = ObjectId(existedFeedObj.memberId);
//       existedMediaArray = existedFeedObj.mediaArray;
//       untouchArray = feedObj.mediaArray;
//       for (var i = 0; i < untouchArray.length; i++) {
//         if (untouchArray[i].media_id) {
//           updatedMediaArray.push(untouchArray[i])
//         } else {
//           updatedMediaObject = {};
//           let mediaUrl = untouchArray[i].mediaUrl;
//           let mediaName = untouchArray[i].mediaName;
//           let mediaType = untouchArray[i].mediaType;
//           let mediaSortOrder = untouchArray[i].mediaSortOrder;
//           let mediaCreditValue = untouchArray[i].mediaCreditValue;
//           let mediaStatus = untouchArray[i].mediaStatus;
//           let mediaDesc = untouchArray[i].mediaDesc;
//           let mediaRatio = untouchArray[i].mediaRatio;
//           updatedMediaObject.media_id = new ObjectId();
//           updatedMediaObject.mediaUrl = mediaUrl;
//           updatedMediaObject.mediaName = mediaName;
//           updatedMediaObject.mediaType = mediaType;
//           updatedMediaObject.mediaSortOrder = mediaSortOrder;
//           updatedMediaObject.mediaCreditValue = mediaCreditValue;
//           updatedMediaObject.mediaStatus = mediaStatus;
//           updatedMediaObject.mediaDesc = mediaDesc;
//           updatedMediaObject.mediaRatio = mediaRatio;
//           updatedMediaArray[i] = updatedMediaObject;
//         }
//       }
//       feedObj.mediaArray = updatedMediaArray;

//       for (let i = 0; i < untouchArray.length; i++) {

//         if (untouchArray[i].media_id) {
//         } else {
//           if (untouchArray[i].mediaType.includes("image")) {
//             memberMediaObj = {};
//             let updatedAt = new Date();
//             let mediaType = untouchArray[i].mediaType;
//             let mediaPath = untouchArray[i].mediaUrl;
//             let mediaOriginalName = untouchArray[i].mediaName;
//             memberMediaObj.updatedAt = updatedAt;
//             memberMediaObj.mediaType = mediaType;
//             memberMediaObj.mediaPath = mediaPath;
//             memberMediaObj.mediaOriginalName = mediaOriginalName;
//             imageFilesArray.push(memberMediaObj);
//           } else if (untouchArray[i].mediaType.includes("audio")) {
//             memberMediaObj = {};
//             let updatedAt = new Date();
//             let mediaType = untouchArray[i].mediaType;
//             let mediaPath = untouchArray[i].mediaUrl;
//             let mediaOriginalName = untouchArray[i].mediaName;
//             memberMediaObj.updatedAt = updatedAt;
//             memberMediaObj.mediaType = mediaType;
//             memberMediaObj.mediaPath = mediaPath;
//             memberMediaObj.mediaOriginalName = mediaOriginalName;
//             audioFilesArray.push(memberMediaObj);
//           } else if (untouchArray[i].mediaType.includes("video")) {
//             memberMediaObj = {};
//             let updatedAt = new Date();
//             let mediaType = untouchArray[i].mediaType;
//             let mediaPath = untouchArray[i].mediaUrl;
//             let mediaOriginalName = untouchArray[i].mediaName;
//             memberMediaObj.updatedAt = updatedAt;
//             memberMediaObj.mediaType = mediaType;
//             memberMediaObj.mediaPath = mediaPath;
//             memberMediaObj.mediaOriginalName = mediaOriginalName;
//             videoFilesArray.push(memberMediaObj);
//           }
//         }
//       }
//       Feed.editFeed(feedId, feedObj, (err, feedUpdatedObj) => {
//         if (err) {
//           console.log(err)
//         } else {

//           let imageFiles = [];
//           let audioFiles = [];
//           let videoFiles = [];
//           var query = { memberId: memberId }
//           memberMedia.findOneAndUpdate(query,
//             {
//               $push: {
//                 imageFiles: {
//                   $each: imageFilesArray
//                 },
//                 audioFiles: {
//                   $each: audioFilesArray
//                 },
//                 videoFiles: {
//                   $each: videoFilesArray
//                 }
//               }
//             }
//             , (err, updatedMemberMediaObj) => {
//               if (err) {
//                 console.log(err);
//               } else {
//                 res.json({ token: req.headers['x-access-token'], success: 1, message: "Feed updated successfully", data: feedUpdatedObj })
//               }
//             });
//         }
//       });
//     }
//   });
// });

//////////////////////////////////edit feed by rohit end /////////////////////////////////////

/////////////////////////////// start edit and delete media url before update  //////////////////////////////////////
// router.put('/editFeedWithNewImageUrl', upload.any(), (req, res, next) => {
//   let file = req.files;
//   var imageDetailsArray = [];
//   var imageDetailObj = {};
//   //console.log(req.body);
//   for (let index = 0; index < file.length; index++) {
//     imageDetailObj = {};
//     imageDetailObj.imageUrl = file[index].path;
//     imageDetailObj.imageName = file[index].filename;
//     fileName = file[index].filename;
//     fileExtension = fileName.replace(/^.*\./, '');
//     if (fileExtension == 'png' || fileExtension == 'jpg' || fileExtension == 'jpeg') {
//       imageDetailObj.mediaType = "image";
//     }
//     else if (fileExtension == '3gp' || fileExtension == 'mp4' || fileExtension == 'AVI' || fileExtension == 'WMV') {
//       imageDetailObj.mediaType = "video";
//     }
//     else if (fileExtension == 'mpeg' || fileExtension == 'mp3') {
//       imageDetailObj.mediaType = "audio";
//     }
//     imageDetailsArray.push(imageDetailObj);
//   }
//   res.json({ success: 1, uploadedImages: imageDetailsArray });
// });

// router.post('/deleteFeedWithImageUrl', (req, res, next) => {
//   let url = req.body.imageUrl;
//   //console.log("=======url==========" + "uploads/feeds/" + url)
//   fs.unlink("uploads/feeds/" + url, (err, data) => {
//     if (err) {
//       console.log(err);
//     } else {
//       //console.log(url)
//       //console.log(req.body);
//       res.json({ success: 1, message: "Delete  from upload" });
//     }
//   });

// });


/////////////////////////////// start edit and delete media url before update  /////////////////////////////////////


// Get Feed likes count by mediaId
// router.get("/getFeedLikesCountByMediaId/:feedId", function (req, res) {
//   let feedId = ObjectId(req.params.feedId);
//   Feed.aggregate(
//     [
//       {
//         $match: { $and: [{ _id: ObjectId(feedId) }] }
//       },
//       {
//         $lookup: {
//           from: "mediatrackings",
//           localField: "_id",
//           foreignField: "feedId",
//           as: "mediaStats" // to get all the views, comments, shares count
//         }
//       }
//     ],
//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       // Filter FeedStats to get views, shares, follow and comment count
//       for (let i = 0; i < data.length; i++) {
//         for (let j = 0; j < data[i].mediaStats.length; j++) {
//           let likesCount = 0;
//           let sharesCount = 0;
//           let commentsCount = 0;
//           let likeStatus = false;
//           let viewStatus = false;

//           if (data[i].mediaStats[j].activities == "views") {
//             //console.log("1");
//             if ((data[i].mediaStats[j].memberId) && (data[i].mediaStats[j].activities == "views")) {
//               likeStatus = true;
//               likesCount = likesCount + 1;
//             }
//           }
//           if (data[i].mediaStats[j].activities == "share") {
//             sharesCount = sharesCount + 1;
//           }
//           if (data[i].mediaStats[j].activities == "comment") {
//             commentsCount = data[i].mediaStats[j].source.length + commentsCount;
//           }
//           data[i].mediaStats[j].likesCount = likesCount;
//           data[i].mediaStats[j].sharesCount = sharesCount;
//           data[i].mediaStats[j].commentsCount = commentsCount;
//           data[i].mediaStats[j].likeStatus = likeStatus;
//           data[i].mediaStats[j].viewStatus = viewStatus;
//         }
//       }
//       // End of Filter FeedStats to get views, shares, follow and comment count
//       res.send(data);
//     }
//   );
// });
// End of Get Feed likes by mediaId

// router.post('/postFeedLikeOnlyByFanFollowByNumber', (req, res) => {
//   req.body.numberOfLikes = parseInt(req.body.numberOfLikes)
//   if (req.body.feedId == undefined || !req.body.feedId.length) {
//     res.json({ success: 0, message: "Please Provide Feed Deatails" })
//   }
//   else if (parseInt(req.body.numberOfLikes) < 0 || req.body.numberOfLikes == "0") {
//     res.json({ success: 0, message: "Please provide positive integer value more than 0" })
//   }
//   else if (req.body.numberOfLikes == undefined || !req.body.numberOfLikes) {
//     res.json({ success: 0, message: "Please Provide likes count" })
//   }
//   else {
//     let now = new Date();
//     let todayMinut = now.getMinutes()
//     Feed.aggregate([
//       {
//         $match: {
//           _id: ObjectId(req.body.feedId)
//         }
//       },
//       {
//         $lookup: {
//           from: "mediatrackings",
//           localField: "_id",
//           foreignField: "feedId",
//           as: "feedLike"
//         }
//       },
//       {
//         $unwind: {
//           "path": "$feedLike",
//           "preserveNullAndEmptyArrays": true
//         },
//       },
//       {
//         $sort: { 'feedLike.created_at': -1 }
//       },
//       {
//         $group: {
//           '_id': {
//             _id: "$_id",
//             memberId: "$memberId"
//           },
//           created_at: {
//             $push: {
//               "created_at": "$created_at",
//             }
//           },
//           feedLike: {
//             $push: {
//               "_id": "$feedLike._id",
//               "feedId": "$feedLike.feedId",
//               "memberId": "$feedLike.memberId",
//               "isLike": "$feedLike.isLike",
//               "activities": "$feedLike.ctivities",
//               "status": "$feedLike.status",
//               "updatedBy": "$feedLike.updatedBy",
//               "createdBy": "$feedLike.createdBy",
//               "updated_at": "$feedLike.updated_at",
//               "created_at": "$feedLike.created_at"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           feedLike: 1,
//           created_at: 1
//         }
//       }
//     ], (err, feedDetails) => {
//       if (err) {
//         res.json({ success: 0, token: req.headers['x-access-token'], message: err });
//       } else {
//         let startTime = feedDetails[0].created_at[0].created_at;
//         if (feedDetails[0] && feedDetails[0].feedLike.length && feedDetails[0].feedLike[0].created_at) {
//           startTime = feedDetails[0].feedLike[0].created_at;
//         }
//         if (feedDetails.length) {
//           // console.log(feedDetails[0])
//           let likedArray = feedDetails[0].feedLike.map((feedLikeObj) => {
//             return ObjectId(feedLikeObj.memberId);
//           })
//           let celebrityId = feedDetails[0]._id.memberId;
//           let startMinut = todayMinut;
//           let randomNumber = parseInt(req.body.numberOfLikes)
//           MemberPreferences.aggregate([
//             {
//               $match: {
//                 celebrities: { $elemMatch: { CelebrityId: celebrityId, isFollower: true } }
//               }
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "memberId",
//                 foreignField: "_id",
//                 as: "memberProfile"
//               }
//             },
//             {
//               $match: { "memberProfile.IsDeleted": { $eq: false }, "memberProfile.dua": { $eq: true }, memberProfile: { $ne: [] } }
//             },
//             {
//               $unwind: "$memberProfile"
//             }
//           ], (err, vertualFollowers) => {
//             if (err) {
//               res.json({ success: 0, token: req.headers['x-access-token'], message: err });
//             } else if (vertualFollowers) {
//               let followersArray = vertualFollowers.map((follower) => {
//                 return follower._id
//               })
//               User.aggregate([
//                 {
//                   $match: {
//                     IsDeleted: false,
//                     dua: true,
//                     $or: [{ _id: { $nin: likedArray } }, { _id: { $in: followersArray } }]
//                   }
//                 },
//                 {
//                   $sample:
//                   {
//                     size: randomNumber
//                   }
//                 },
//                 {
//                   $project: {
//                     _id: 1,
//                     email: 1
//                   }
//                 }], (err, usersList) => {
//                   if (err) {
//                     res.json({ success: 0, token: req.headers['x-access-token'], message: err });
//                   }
//                   else {
//                     console.log(usersList)
//                     let insertManyLike = usersList.map((userde) => {
//                       // let randomDate = randomTime(startTime)
//                       randomDate = generateRandom(Date.now(), startTime.setMinutes(startMinut))
//                       user = {
//                         "feedId": req.body.feedId,
//                         "memberId": userde._id,
//                         "isLike": true,
//                         "activities": "views",
//                         "status": "Active",
//                         "updatedBy": "Admin",
//                         "createdBy": "Admin",
//                         "updated_at": randomDate,
//                         "created_at": randomDate
//                       }
//                       return user;
//                     })
//                     mediaTracking.insertMany(insertManyLike, (err, likedArray) => {
//                       if (err) {
//                         res.json({ success: 0, token: req.headers['x-access-token'], message: err });
//                       }
//                       else {
//                         res.json({ success: 1, insertManyLike: insertManyLike, users: usersList, feedDetails: feedDetails, likedArray: likedArray, numberOfLikes: randomNumber })
//                         updateLoginTime(usersList)
//                       }
//                     })
//                   }
//                 })
//             }
//           })
//         }
//         else {
//           res.json({ success: 0, token: req.headers['x-access-token'], message: "Feed details not found id " + req.body.feedId });
//         }
//       }
//     })
//   }
// })

updateLoginTime = (userArray) => {
  let currentDate = new Date();
  let randomNumber = Math.floor(Math.random() * 20) + 35;
  let loginTime = currentDate.setMinutes(currentDate.getMinutes() - randomNumber)
  let logouttime = currentDate.setMinutes(currentDate.getMinutes() + randomNumber)
  let userEmailArray = userArray.map((user) => {
    return user.email;
  })
  LoginInfo.update({ email: { $in: userEmailArray } }, {
    $set: {
      lastLoginDate: loginTime,
      lastLogoutDate: logouttime
    }
  }, { multi: true }, (err, loginInfo) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log(loginInfo)
    }
  })
}
// router.get('/getAllFeed/:created_at', (req, res) => {
//   let created_at = req.params.created_at;
//   Feed.find({ isDelete: false, created_at: { $lt: new Date(created_at) } }, (err, feed) => {
//     if (err) {
//       res.json({ token: req.headers['x-access-token'], success: 0, data: [] });
//     } else {
//       res.json({ token: req.headers['x-access-token'], success: 1, data: feed });
//     }
//   }).limit(10).sort({ created_at: -1 });
// });

// router.get('/getFeedByMemberPreferancesCreateTime/:memberId/:created_at', (req, res) => {
//   let created_at = req.params.created_at;
//   MemberPreferences.findOne({ memberId: ObjectId(req.params.memberId) }, (err, memberpreferences) => {
//     if (err) {
//       res.json({ success: 0, message: "err" + err })
//     } else {
//       var query = memberpreferences.celebrities.map((celeb) => {
//         let x = { $and: [{ memberId: celeb.CelebrityId }, { created_at: { $gt: celeb.createdAt } }, { isDelete: false }] }
//         return x;
//       })
//       query.push({ created_at: { $lt: new Date(created_at) } })
//       Feed.find({ $or: query }, (err, feed) => {
//         if (err) {
//           res.json({ token: req.headers['x-access-token'], success: 0, data: [] });
//         } else {
//           res.json({ token: req.headers['x-access-token'], success: 1, data: feed, query: { $or: query } });
//         }
//       }).limit(10).sort({ created_at: -1 });
//     }
//   })
// });

// (year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number)
let randomTime = (date) => {
  let now = new Date();
  let todayDate = now.getDate()
  let todayMonth = now.getMonth()
  let todayYear = now.getFullYear()
  let todayHour = now.getHours()
  let todayMinut = now.getMinutes()
  let todaySecond = now.getSeconds()
  let createDate = date.getDate();
  let createdMonth = date.getMonth();
  let cratedYear = date.getFullYear();
  let createHour = date.getHours();
  let createMinut = date.getMinutes();
  let createSecond = date.getSeconds();
  let randomDate = createDate + Math.floor(Math.random() * Math.floor(todayDate - createDate))
  let randomMonth = createdMonth + Math.floor(Math.random() * Math.floor(todayMonth - createdMonth))
  let randomYear = cratedYear + Math.floor(Math.random() * Math.floor(todayYear - cratedYear));
  let randomHour = Math.floor(Math.random() * Math.floor(todayHour));
  let randomMinit = Math.floor(Math.random() * Math.floor(todayMinut));
  let randomSecond = Math.floor(Math.random() * Math.floor(todaySecond));
  if (createDate == randomDate && createdMonth == randomMonth && cratedYear == randomYear) {
    if (randomHour > createHour) {
      randomHour = Math.floor(Math.random() * Math.floor(createHour))
    }
    if (randomMinit > createMinut) {
      randomMinit = Math.floor(Math.random() * Math.floor(createMinut))
    }
    if (randomSecond > createSecond) {
      randomSecond = Math.floor(Math.random() * Math.floor(createSecond))
    }
  }
  return new Date(randomYear, randomMonth, randomDate, randomHour, randomMinit, randomSecond)
}
let generateRandom = (start, end) => {
  return start + Math.floor(Math.random() * Math.floor(end - start));
}
module.exports = router;