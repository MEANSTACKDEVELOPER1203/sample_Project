let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let MemberMedia = require('./memberMediaModel');
let multer = require("multer");
var sizeOf = require('image-size');
var async = require('async');


let User = require("../users/userModel");
let memberMediaController = require('./memberMediaController');

// Image Settings
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/media/");
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
// End of Image Settings

// Create member Media
router.post("/upload", upload.any(), (req, res) => {
  let memberMedia = req.body.memberMedia;
  let memberMediaObj = JSON.parse(memberMedia);
  let files = req.files;
  let media = [];
  let mediaObjForDbObj = {};
  var baseUrl = "uploads/media/"
  if (files.length > 0) {
    for (let i = 0; i < memberMediaObj.media.length; i++) {
      let srcObj = {};
      let mediaObj = {};
      let mediaArray = memberMediaObj.media;
      let mediaObjFromUser = mediaArray[i];
      let fileType = files[i].mimetype;
      let videoUrl;
      let mediaUrl;
      let mediaName;
      if (fileType === "video/mp4") {
        videoUrl = files[i].filename;
        videoUrl = baseUrl.concat(videoUrl);
        mediaUrl = files[i + 1].filename;
        mediaUrl = baseUrl.concat(mediaUrl);
        mediaName = files[i].filename;
        files.splice(i + 1, 1);
      } else {
        videoUrl = "";
        mediaUrl = files[i].filename;
        mediaUrl = baseUrl.concat(mediaUrl);
        mediaName = files[i].filename;

      }
      srcObj.mediaUrl = mediaUrl;
      srcObj.mediaName = mediaName;
      srcObj.videoUrl = videoUrl;
      mediaObj.src = srcObj;
      mediaObj.mediaRatio = mediaObjFromUser.mediaRatio;
      mediaObj.mediaSize = mediaObjFromUser.mediaSize;
      mediaObj.mediaType = mediaObjFromUser.mediaType;
      media.push(mediaObj);
    }
    mediaObjForDbObj.memberId = memberMediaObj.memberId;
    mediaObjForDbObj.media = media;
    let query = { memberId: ObjectId(memberMediaObj.memberId) };
    MemberMedia.findOne(query, (err, memberMediaObjFromDb) => {
      if (err) {
        console.log(err.message);
        res.status(404).json({ success: 0, message: "Error while creating member media" });
      } else {
        if (memberMediaObjFromDb) {
          let mediaArrayForUpdate = mediaObjForDbObj.media;
          MemberMedia.findByIdAndUpdate(memberMediaObjFromDb._id, { $push: { media: { $each: mediaArrayForUpdate } } }, { new: true }, (err, updateMemberObj) => {
            if (err) {
              res.status(404).json({ success: 0, message: "Error while creating member media" } + err.message);
            } else {
              res.status(200).json({ success: 1, message: "Media created successfully", data: updateMemberObj });
            }
          });
        } else {
          var newMemberMedia = new MemberMedia({
            memberId: mediaObjForDbObj.memberId,
            media: mediaObjForDbObj.media,
            createdAt: new Date()
          });
          MemberMedia.create(newMemberMedia, (err, createdMediaObj) => {
            if (err) {
              res.status(404).json({ success: 0, message: "Error while creating member media" });
            } else {
              res.status(200).json({ success: 1, message: "Media created successfully", data: createdMediaObj });
            }
          })
        }
      }
    });
  } else {
    res.json({ success: 0, message: "No files selected" });
  }


  // let memberID = ObjectId(req.body.memberID);
  // let mediaType = req.body.mediaType;
  // let files = req.files;

  // if (files) {
  //   if (files.length > 0) {
  //     User.findById(memberID, function(err, result) {
  //       if (err) return res.send(err);
  //       if (result) {
  //         memberMedia.findOne({ memberId: memberID }, function(
  //           err,
  //           profiledata
  //         ) {
  //           if (profiledata) {
  //             // If User Exists in Media Collection, we will update
  //             // For Images
  //             if (mediaType == "image") {
  //               let imageFiles = [];
  //               let imageObject;
  //               let limit = req.files.length;
  //               for (let i = 0; i < limit; i++) {
  //                 let imageObject = {};
  //                 let mediaPath = req.files[i].path;
  //                 let mediaOriginalName = req.files[i].originalname;
  //                 let mediaType = req.body.mediaType;
  //                 let mediaStatus = req.body.mediaStatus[i];

  //                 imageObject.id = new ObjectId();
  //                 imageObject.mediaPath = mediaPath;
  //                 imageObject.mediaOriginalName = mediaOriginalName;
  //                 imageObject.mediaType = mediaType;
  //                 imageObject.mediaStatus = mediaStatus;

  //                 imageFiles[i] = imageObject;
  //               }

  //               let newMedia = new memberMedia({
  //                 memberId: memberID,
  //                 imageFiles: imageFiles
  //               });

  //               // Push Images Objects to ImageArray

  //               memberMedia.updateOne(
  //                 { _id: profiledata._id },
  //                 { $push: { imageFiles: { $each: imageFiles ,$sort: -1 }} },
  //                 function(err, updateResult) {
  //                   if (err) return res.send(err);
  //                   if (updateResult.nModified == 1) {
  //                     res.json({
  //                       message: "Images uploaded successfully"
  //                     });
  //                   } else {
  //                     res.json({ message: "Operation Failed!" });
  //                   }
  //                 }
  //               );
  //             }

  //             // End of Image Files

  //             // For Videos

  //             if (mediaType == "video") {
  //               let videoFiles = [];
  //               let videoObject;
  //               let limit = req.files.length;

  //               for (let i = 0; i < limit; i++) {
  //                 let videoObject = {};
  //                 let mediaPath = req.files[i].path;
  //                 let mediaOriginalName = req.files[i].originalname;
  //                 let mediaType = req.body.mediaType;
  //                 let mediaStatus = req.body.mediaStatus[i];

  //                 videoObject.id = new ObjectId();
  //                 videoObject.mediaPath = mediaPath;
  //                 videoObject.mediaOriginalName = mediaOriginalName;
  //                 videoObject.mediaType = mediaType;
  //                 videoObject.mediaStatus = mediaStatus;

  //                 videoFiles[i] = videoObject;
  //               }

  //               let newMedia = new memberMedia({
  //                 memberId: memberID,
  //                 videoFiles: videoFiles
  //               });

  //               // Push Video Objects to VideoArray

  //               memberMedia.updateOne(
  //                 { _id: profiledata._id },
  //                 { $push: { videoFiles: { $each: videoFiles ,$sort: -1}  } },
  //                 function(err, updateResult) {
  //                   if (err) return res.send(err);
  //                   if (updateResult.nModified == 1) {
  //                     res.json({
  //                       message: "Videos uploaded successfully"
  //                     });
  //                   } else {
  //                     res.json({ message: "Operation Failed!" });
  //                   }
  //                 }
  //               );
  //             }

  //             // End of Video Files

  //             // For Audio Files

  //             if (mediaType == "audio") {
  //               let audioFiles = [];
  //               let audioObject;
  //               let limit = req.files.length;

  //               for (let i = 0; i < limit; i++) {
  //                 let audioObject = {};
  //                 let mediaPath = req.files[i].path;
  //                 let mediaOriginalName = req.files[i].originalname;
  //                 let mediaType = req.body.mediaType;
  //                 let mediaStatus = req.body.mediaStatus[i];

  //                 audioObject.id = new ObjectId();
  //                 audioObject.mediaPath = mediaPath;
  //                 audioObject.mediaOriginalName = mediaOriginalName;
  //                 audioObject.mediaType = mediaType;
  //                 audioObject.mediaStatus = mediaStatus;

  //                 audioFiles[i] = audioObject;
  //               }

  //               let newMedia = new memberMedia({
  //                 memberId: memberID,
  //                 audioFiles: audioFiles
  //               });

  //               // Push Audio Objects to AudioArray

  //               memberMedia.updateOne(
  //                 { _id: profiledata._id },
  //                 { $push: { audioFiles: { $each: audioFiles, $sort: -1}  } },
  //                 function(err, updateResult) {
  //                   if (err) return res.send(err);
  //                   if (updateResult.nModified == 1) {
  //                     res.json({
  //                       message: "Audio Files uploaded successfully"
  //                     });
  //                   } else {
  //                     res.json({ message: "Operation Failed!" });
  //                   }
  //                 }
  //               );
  //             }

  //             // End of Audio Files
  //           } else {
  //             // If User does not exists in Media Collection, we will create new one
  //             // For Images

  //             if (mediaType == "image") {
  //               let imageFiles = [];
  //               let imageObject;
  //               let limit = req.files.length;
  //               for (let i = 0; i < limit; i++) {
  //                 let imageObject = {};
  //                 let mediaPath = req.files[i].path;
  //                 let mediaOriginalName = req.files[i].originalname;
  //                 let mediaType = req.body.mediaType;
  //                 let mediaStatus = req.body.mediaStatus[i];

  //                 imageObject.id = new ObjectId();
  //                 imageObject.mediaPath = mediaPath;
  //                 imageObject.mediaOriginalName = mediaOriginalName;
  //                 imageObject.mediaType = mediaType;
  //                 imageObject.mediaStatus = mediaStatus;

  //                 imageFiles[i] = imageObject;
  //               }

  //               let newMedia = new memberMedia({
  //                 memberId: memberID,
  //                 imageFiles: imageFiles
  //               });

  //               memberMedia.createMedia(newMedia, null, {sort: {createdAt: -1}}, function(err, post) {
  //                 if (err) {
  //                   res.send(err);
  //                 } else {
  //                   res.json({
  //                     message: "Images uploaded successfully"
  //                   });
  //                 }
  //               });
  //             }

  //             // End of Image Files

  //             // For Videos

  //             if (mediaType == "video") {
  //               let videoFiles = [];
  //               let videoObject;
  //               let limit = req.files.length;

  //               for (let i = 0; i < limit; i++) {
  //                 let videoObject = {};
  //                 let mediaPath = req.files[i].path;
  //                 let mediaOriginalName = req.files[i].originalname;
  //                 let mediaType = req.body.mediaType;
  //                 let mediaStatus = req.body.mediaStatus[i];

  //                 videoObject.id = new ObjectId();
  //                 videoObject.mediaPath = mediaPath;
  //                 videoObject.mediaOriginalName = mediaOriginalName;
  //                 videoObject.mediaType = mediaType;
  //                 videoObject.mediaStatus = mediaStatus;

  //                 videoFiles[i] = videoObject;
  //               }

  //               let newMedia = new memberMedia({
  //                 memberId: memberID,
  //                 videoFiles: videoFiles
  //               });

  //               memberMedia.createMedia(newMedia,null, {sort: {createdAt: -1}}, function(err, post) {
  //                 if (err) {
  //                   res.send(err);
  //                 } else {
  //                   res.json({
  //                     message: "Videos uploaded successfully"
  //                   });
  //                 }
  //               });
  //             }

  //             // End of Video Files

  //             // For Audio Files

  //             if (mediaType == "audio") {
  //               let audioFiles = [];
  //               let audioObject;
  //               let limit = req.files.length;

  //               for (let i = 0; i < limit; i++) {
  //                 let audioObject = {};
  //                 let mediaPath = req.files[i].path;
  //                 let mediaOriginalName = req.files[i].originalname;
  //                 let mediaType = req.body.mediaType;
  //                 let mediaStatus = req.body.mediaStatus[i];

  //                 audioObject.id = new ObjectId();
  //                 audioObject.mediaPath = mediaPath;
  //                 audioObject.mediaOriginalName = mediaOriginalName;
  //                 audioObject.mediaType = mediaType;
  //                 audioObject.mediaStatus = mediaStatus;

  //                 audioFiles[i] = audioObject;
  //               }

  //               let newMedia = new memberMedia({
  //                 memberId: memberID,
  //                 audioFiles: audioFiles
  //               });

  //               memberMedia.createMedia(newMedia,null, {sort: {createdAt: -1}}, function(err, post) {
  //                 if (err) {
  //                   res.send(err);
  //                 } else {
  //                   res.json({
  //                     message: "Videos uploaded successfully"
  //                   });
  //                 }
  //               });
  //             }

  //             // End of Audio Files
  //           }
  //         });
  //       } else {
  //         res.json({
  //           error: "User Not Exists / Send a valid UserID"
  //         });
  //       }
  //     });
  //   } else {
  //     res.json({
  //       error: "wrong info sent / invalid userID"
  //     });
  //   }
  // } else {
  //   res.json({
  //     error: "No files selected"
  //   });
  // }
});
// End of Create member Media

//Get Media By User ID
router.get("/getMediaByUserId/:UserID", function (req, res) {
  let id = req.params.UserID;
  // MemberMedia.findOne({ memberId: id }, function (err, result) {
  //   if (err) {
  //     return res.send(err);
  //   }
  //   if (result) {
  //     res.send(result);


  //   } else {
  //     res.json({
  //       error: "Data Not Exists / Send a valid ID"
  //     });
  //   }
  // }).sort({
  //   'media.createdAt': -1
  // });

  MemberMedia.aggregate(
    [
      {
        $match:{memberId: ObjectId(id) } 
      },
      { "$unwind" : "$media" },
      {$sort: {"media.createdAt": -1}},
      {$group:{_id : "$_id",media:{$push:"$media"}}},
      {
        $project: {
          _id: 1,
          memberId:1,
           createdAt:1,
          // mediaSize: 1,
          // mediaRatio: 1,
          // src: 1,
          // status: 1,
          // createdAt: 1,
          // mediaType: 1,
          media:1
        }
      }
    ],
    function(err, result) {
      if (err) {
        return res.json({success:0,message:`${err}`,token:req.header['x-access-token']})
      }
      res.json({success:1,data:result[0],token:req.header['x-access-token']})
    }
  );


});

//@des get member media with pagination
//@method GET
//@access type public
router.get('/getMemberMedia/:member_Id/:media_Type/:pagination_Date', memberMediaController.getMemberMedia);
//@des get member media with pagination and previous and next
//@method GET
//@access type public (ForwardAndBackward) 
router.get('/getMemberMediaWithPreAndNext/:member_Id/:media_Type/:pre_next/:pagination_Date', memberMediaController.getMemberMediaWithPreAndNext);








// End of Get Media By User ID

// Get Feed Comments by FeedID
// router.get("/getMediaByUserId/:UserID", function(req, res) {
//   let id = ObjectId(req.params.UserID);
//   memberMedia.aggregate(
//       [
//         {
//           $match:{memberId: ObjectId(id) } 
//         },
//         {$sort: {"imageFiles._id": 1}}
//       ],
//       function(err, result) {
//         if (err) {
//           res.send(err);
//         }
//         res.send(result)
//       }
//     );
// });
// End of Get Feed Comments by FeedID

// Update mediaStatus   start

router.put("/deleteMedia/:schID", function (req, res) {
  let reqbody = req.body;
  let schID = req.params.schID;
  let mediaStatus = req.body.mediaStatus;

  MemberMedia.update({ "media._id": schID }, { "$pull": { "media": { "_id": { $in: schID } } } }, function (err, result) {
    if (err) {
      res.json({
        success:0,
        token:req.header['x-access-token'],
        message: `Unable to delete,please try again ${err}`
      });
    }
    else if (result.nModified == 0) {
      res.json({
        success:0,
        token:req.header['x-access-token'],
        message: "Unable to delete,please try again"
      });
    } else {
      //console.log(result);
      res.json({
        success:1,
        token:req.header['x-access-token'],
        message: "Deleted successfully"
      });
    }


  });
});
// End of Update mediaStatus 

module.exports = router;
