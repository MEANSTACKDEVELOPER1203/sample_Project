let auditionsProfiles = require('./auditionsProfilesService');

//let role = require("../roles/roleModel");
let multer = require("multer");
let ObjectId = require('mongodb').ObjectId;
let async = require('async');
let User = require("../users/userModel");
let favoritesService = require('../favorites/favoritesService');

// create auditionsProfiless
var createAuditionsProfiles = (req, res) => {
    //roleObj = req.body.roleObj;
    //console.log("p1", req.body.audition)

    let audition = req.body.audition;
    //console.log("p1", audition)
    let auditionObj = JSON.parse(audition);

    // let educationObj = JSON.parse(educationObj);
    // let experianceObj = JSON.parse(experianceObj);

    let files = req.files;
    console.log(files);
    let fileType;
    let fileExtension;
    var mediaArray = [];
    if (files.length > 0) {
        let i = 0;
        for (i = 0; i < files.length; i++) {
            if (files[i].fieldname == "profilePicUrl") {
                auditionObj.profilePicUrl = files[i].path;
                auditionObj.profilePicName = files[i].filename == null ? files[i].name : files[i].filename;
            } else {


                var srcObj = {} //0 1 
                var mediaObj = {};
                mediaObj = auditionObj.media[i];
                // FILE NAME AND EXTENSION.
                fileType = files[i].mimetype;
                let videoUrl;
                let mediaUrl;
                let mediaName;
                if (fileType === "video/mp4" || fileType === "audio/mp3" || fileType === "audio/ogg" || fileType === "audio/wav" || fileType === "audio/m4a" || fileType === "audio/aac") {
                    videoUrl = files[i].path;
                    //videoUrl = baseUrl.concat(videoUrl);
                    mediaUrl = files[i + 1].path;
                    //mediaUrl = baseUrl.concat(mediaUrl);
                    mediaName = files[i].filename;
                    files.splice(i + 1, 1);
                    //++i;
                } 
                // else if (fileType === "image/jpg" || fileType === "image/png" || fileType === "image/jpeg" || fileType === "doc/pdf" || fileType === "doc/docx" || fileType === "application/pdf") {
                else{
                    videoUrl = "";
                    mediaUrl = files[i].path;
                    //mediaUrl = baseUrl.concat(mediaUrl);
                    mediaName = files[i].filename;
                }
                // else if (fileType === "doc/pdf"|| fileType === "doc/docx"){
                //     videoUrl = "";
                //     mediaUrl = files[i].path;
                //     //mediaUrl = baseUrl.concat(mediaUrl);
                //     mediaName = files[i].filename;
                // }
                srcObj.mediaUrl = mediaUrl;
                srcObj.mediaName = mediaName;
                srcObj.videoUrl = videoUrl;
                mediaObj.src = srcObj;
                mediaObj.mediaId = new ObjectId();
                mediaArray.push(mediaObj);
            }
        }
    }
    auditionObj.mediaArray = mediaArray;
    //console.log(auditionObj);
    // experianceObj.mediaArray = mediaArray;
    // educationObj.mediaArray = mediaArray;
    async.waterfall([(callback)=> {
        User.getUserById(ObjectId(auditionObj.memberId), (err, userDetailObj) => {
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
    }, (userDetailObj, callback) =>{
        auditionsProfiles.findAuditionByMemberId(ObjectId(userDetailObj._id), (err, auditionObjFromDb) => {
            if (err) {
                return callback(new Error(`Error While fetching Audition details by member id! : ${err}`), null)
            } else if (auditionObjFromDb == null) {
                return callback(null, userDetailObj)
            }
            else if (auditionObjFromDb.length > 0) {
                return callback(new Error(`Already exist`), auditionObjFromDb)
            } else {
                return callback(null, userDetailObj)
            }
        })
    }, (userDetailObj, callback)=>{
        //console.log("user",userDetailObj.email);
        //auditionObj.profilePicPath = userDetailObj.avtar_imgPath;
        auditionObj.createdBy = userDetailObj.username;
        auditionObj.email = userDetailObj.email;
        auditionObj.mobileNumber = userDetailObj.mobileNumber;
        auditionObj.aboutMe = userDetailObj.aboutMe;
        // console.log("******************** 1 *********************************");
        // console.log(auditionObj);
        // console.log("********************* 1 ********************************");
        auditionsProfiles.saveAuditionsProfiles(auditionObj, (err, createAuditionsProfilesObj) => {
            if (err) {
                return callback(new Error(`Error While creating audition : ${err}`), null)
            } else {
                // res.status(200).json({
                //     success: 1,
                //     message: "auditionsProfiles has created successfully.",
                //     data: createAuditionsProfilesObj
                // });
                return callback(null, createAuditionsProfilesObj)
            }
        });

    }
    ], (err, createdAuditionObj)=> {
        //console.log(err);
        //console.log(err.message);
        if (err) {
            if (err.message == "Already exist") {
                return res.status(200).json({ token:req.headers['x-access-token'],success: 0, message: "Audition prfile alredy exist!", data: createdAuditionObj })
            }
            return res.status(404).json({ token:req.headers['x-access-token'],success: 0, message: `${err}` });
        }
        else {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 1, message: "Profile updated successfully", data: createdAuditionObj });
        }
    });


}

// update contest
var updateAuditionsProfiles = (req, res) => {
    let auditionsProfilesId = (req.params.auditionsProfiles_Id) ? req.params.auditionsProfiles_Id : '';
    // var fileName, fileExtension, fileSize, fileType, dateModified;
    let files = req.files;
    // console.log(files);
    let auditions = req.body.audition;
    let auditionsObj = JSON.parse(auditions);
    auditionsObj.updated_at = new Date();
    var updateMediaArray = [];
    //console.log(auditionsObj);
    // var deleteMediaArray = [];
    var mediaObj = {};

    let newMediaArray = [];
    var mediaArray = auditionsObj.media;
    //var mediaArray = [];

    auditionsProfiles.findAuditionsProfilesById(ObjectId(auditionsProfilesId), (err, auditionsProfileObj) => {
        if (err) {
            return res.status(404).json({ token:req.headers['x-access-token'],success: 0, message: "Error while fetching the feed by id" });
        } else {
            //console.log(auditionsProfileObj)
            let mediaId = "";
            let existedMediaArray = auditionsProfileObj.media;
            if (auditionsObj.media !== undefined && auditionsObj.media.length > 0) {
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
                        }
                    }
                }
            } else {
                updateMediaArray = existedMediaArray;
                if (auditionsObj.media !== undefined && auditionsObj.media.length == 0)
                    updateMediaArray = [];
            }
            if (files.length > 0) {
                let i = 0;
                for (i = 0; i < newMediaArray.length; i++) {
                    // if (files[i].fieldname === "profilePicUrl") {
                    //     auditionsObj.profilePicUrl = files[i].path;
                    //     auditionsObj.profilePicName = files[i].filename;
                    // } else {
                    var srcObj = {} //0 1 
                    var mediaObj = {};
                    //mediaObj = auditionsObj.media[i];
                    var newMediaObj = newMediaArray[i];
                    fileType = files[i].mimetype;
                    let videoUrl;
                    let mediaUrl;
                    let mediaName;
                    if (fileType === "video/mp4") {
                        videoUrl = files[i].path;
                        //videoUrl = baseUrl.concat(videoUrl);
                        mediaUrl = files[i + 1].path;
                        //mediaUrl = baseUrl.concat(mediaUrl);
                        mediaName = files[i].filename;
                        files.splice(i + 1, 1);
                        //++i;
                    } else{
                        videoUrl = "";
                        mediaUrl = files[i].path;
                        //mediaUrl = baseUrl.concat(mediaUrl);
                        mediaName = files[i].filename;
                    }
                    // else if (fileType === "doc/pdf"|| fileType === "doc/docx"){
                    //     videoUrl = "";
                    //     mediaUrl = files[i].path;
                    //     //mediaUrl = baseUrl.concat(mediaUrl);
                    //     mediaName = files[i].filename;
                    // }
                    srcObj.mediaUrl = mediaUrl;
                    srcObj.mediaName = mediaName;
                    srcObj.videoUrl = videoUrl;
                    mediaObj.src = srcObj;
                    mediaObj.mediaId = new ObjectId();
                    mediaObj.faceFeatures = newMediaObj.faceFeatures;
                    mediaObj.mediaRatio = newMediaObj.mediaRatio;
                    mediaObj.mediaSize = newMediaObj.mediaSize;
                    mediaObj.mediaType = newMediaObj.mediaType;
                    mediaObj.mediaCaption = newMediaObj.mediaCaption;
                    updateMediaArray.push(mediaObj);



                }
            }
            // this is for audition profile pic
            if (files.length > 0) {
                for (let j = 0; j < files.length; j++) {
                    if (files[j].fieldname == "profilePicUrl") {
                        auditionsObj.profilePicUrl = files[j].path;
                        auditionsObj.profilePicName = files[j].filename;
                    }

                }
            }
            //console.log(updateMediaArray.length);
            auditionsObj.media = updateMediaArray;

            // res.json({ data: auditionsObj })
            //console.log(auditionsObj);
            auditionsProfiles.updateAuditionsProfiles(ObjectId(auditionsProfilesId), auditionsObj, (err, updateAuditionsProfilesObj) => {
                if (err) {
                    return res.status(404).json({
                        token:req.headers['x-access-token'],
                        success: 0,
                        message: "Error while updating the Contest."
                    });
                } else {
                    res.status(200).json({
                        token:req.headers['x-access-token'],
                        success: 1,
                        message: "Profile updated successfully.",
                        data: updateAuditionsProfilesObj
                    });
                }
            });
        }

    })


}

// get contest details by contest ID
var getAuditionsProfilesById = (req, res) => {
    auditionsProfiles.findAuditionsProfilesById(req.params.auditionsProfilesId, (err, auditionsProfilesObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                auditionsProfilesDetails: auditionsProfilesObj
            });
        }
    });
}


// get contest details by contest ID
var getAuditionsProfilesByMemberId = (req, res) => {
    auditionsProfiles.findAuditionByMemberId(req.params.memberId, (err, auditionsProfilesObj,notSeenRecommendationCount) => {
        // console.log(err)
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."+ err
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "",
                token:req.headers['x-access-token'],
                data:{
                    notSeenRecommendationCount:notSeenRecommendationCount,
                    auditionsProfilesObj:auditionsProfilesObj
                }
            });
        }
    });
}

// get Search by role
var getRoleByString = (req, res) => {
    auditionsProfiles.getRoleByString(req.params.text, (err, auditionsProfilesSearchDetailsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: auditionsProfilesSearchDetailsObj
            });
        }
    });
}

// get Search by HairColour
var getHairColourByString = (req, res) => {
    // hairColour = req.body.hairColour;
    // bodyType = req.body.bodyType;
    // eyeColour = req.body.eyeColour;
    // gender = req.body.gender;
    // ethnicity = req.body.ethnicity;
    // ageStart = req.body.ageStart;
    // ageEnd = req.body. ageEnd;
    //console.log(req.params);
    let auditioProfileId = (req.params.auditioProfile_Id) ? req.params.auditioProfile_Id : '';
    if (auditioProfileId == "0")
        auditioProfileId = "5bcd68d43dfb4f55c246394a"
    //console.log(auditioProfileId)
    auditionsProfiles.getHairColourByString(req.params.skills, req.params.hairColour, req.params.bodyType, req.params.eyeColour, req.params.gender, req.params.ethnicity, req.params.ageStart, req.params.ageEnd,req.params.startHeight,req.params.endHeight,req.params.passport,req.params.license, (err, DetailsObj) => {
        //console.log(DetailsObj);
        //console.log(err)
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else if (!DetailsObj || DetailsObj.length <= 0) {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                message: "Record Not found",
                data: []
            });
        }
        else {
            favoritesService.findAllCurrentMemberFavoriteTalent(auditioProfileId, (err, listOfFavoriteTalentObj) => {
                if (err)
                    console.log(err)
                else {
                    //console.log(listOfFavoriteTalentObj);
                    //console.log("DetailsObj");
                    searchTalentArray = DetailsObj.map((obj)=>{
                        obj.hasBeenFavorited = listOfFavoriteTalentObj.some((fobject)=>{
                            return fobject.memberId.toString() == obj._id.toString()
                        })
                        return obj;
                    })
                    
                    // let searchTalentArray = [], searchTalentObj = {}, memberId, favoriteTalentObj = {}, hasBeenFavorited;
                    // for (let i = 0; i < DetailsObj.length; i++) {
                    //     searchTalentObj = {};
                    //     searchTalentObj = DetailsObj[i];
                    //     memberId = searchTalentObj.memberId;
                    //     memberId = "" + memberId;
                    //     hasBeenFavorited = false;
                    //     for (let j = 0; j < listOfFavoriteTalentObj.length; j++) {
                    //         favoriteTalentObj = {};
                    //         favoriteTalentObj = listOfFavoriteTalentObj[j];
                    //         favoriteMemberId = favoriteTalentObj.memberId;
                    //         favoriteMemberId = "" + favoriteMemberId;
                    //         if(memberId === favoriteMemberId){
                    //             //console.log("************************************");
                    //             //console.log(favoriteMemberId);
                    //             hasBeenFavorited = true
                    //         }
                    //     }
                    //     searchTalentObj.hasBeenFavorited = hasBeenFavorited;
                    //     searchTalentArray.push(searchTalentObj);
                    // }
                    res.status(200).json({
                        success: 1,
                        data: searchTalentArray
                    });
                }
            })

        }
    });
}

// get Search by HairColour
var getAuditionProfileByAllFilters = (req, res) => {
    // hairColour = req.body.hairColour;
    // bodyType = req.body.bodyType;
    // eyeColour = req.body.eyeColour;
    // gender = req.body.gender;
    // ethnicity = req.body.ethnicity;
    // ageStart = req.body.ageStart;
    // ageEnd = req.body. ageEnd;
    //console.log(req.params);
    let auditioProfileId = (req.params.auditioProfile_Id) ? req.params.auditioProfile_Id : null;
    // if (auditioProfileId == "0")
    //     auditioProfileId = "5bcd68d43dfb4f55c246394a"
    //console.log(auditioProfileId)
    auditionsProfiles.getAuditionProfileByAllFilters(req.params.skills, req.params.hairColour, req.params.bodyType, req.params.eyeColour, req.params.gender, req.params.ethnicity, req.params.ageStart, req.params.ageEnd,req.params.startHeight,req.params.endHeight,req.params.passport,req.params.license,req.params.auditioProfile_Id, (err, DetailsObj) => {
        //console.log(DetailsObj);
        //console.log(err)
        if (err) {
            return res.status(404).json({
                token:req.headers['x-access-token'],
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else if (!DetailsObj || DetailsObj.length <= 0) {
            res.status(200).json({
                token:req.headers['x-access-token'],
                success: 1,
                message: "Record Not found",
                data: []
            });
        }
        else {
            if(auditioProfileId != '0' &&  auditioProfileId != null)
            {
                favoritesService.findAllCurrentMemberFavoriteTalent(auditioProfileId, (err, listOfFavoriteTalentObj) => {
                    if (err)
                        console.log(err)
                    else {
                        // console.log(listOfFavoriteTalentObj);
                        // console.log("DetailsObj");
                        searchTalentArray = DetailsObj.map((obj)=>{
                            obj.hasBeenFavorited = listOfFavoriteTalentObj.some((fobject)=>{
                                if(fobject.memberId && obj._id)
                                    return fobject.memberId.toString() == obj._id.toString()
                                else
                                    return false
                            })
                            return obj;
                        })
                        // let searchTalentArray = [], searchTalentObj = {}, memberId, favoriteTalentObj = {}, hasBeenFavorited;
                        // for (let i = 0; i < DetailsObj.length; i++) {
                        //     searchTalentObj = {};
                        //     searchTalentObj = DetailsObj[i];
                        //     memberId = searchTalentObj.memberId;
                        //     memberId = "" + memberId;
                        //     hasBeenFavorited = false;
                        //     for (let j = 0; j < listOfFavoriteTalentObj.length; j++) {
                        //         favoriteTalentObj = {};
                        //         favoriteTalentObj = listOfFavoriteTalentObj[j];
                        //         favoriteMemberId = favoriteTalentObj.memberId;
                        //         favoriteMemberId = "" + favoriteMemberId;
                        //         if(memberId === favoriteMemberId){
                        //             //console.log("************************************");
                        //             //console.log(favoriteMemberId);
                        //             hasBeenFavorited = true
                        //         }
                        //     }
                        //     searchTalentObj.hasBeenFavorited = hasBeenFavorited;
                        //     searchTalentArray.push(searchTalentObj);
                        // }
                        res.status(200).json({
                            token:req.headers['x-access-token'],
                            success: 1,
                            data: searchTalentArray
                        });
                    }
                })
            }
            else{
                DetailsObj.map((obj)=>{
                    obj.hasBeenFavorited = false;
                    return obj;
                })
                res.status(200).json({
                    token:req.headers['x-access-token'],
                    success: 1,
                    data: DetailsObj
                });
            }

        }
    });
}


// get Search by BodyType
var getBodyTypeByString = (req, res) => {
    auditionsProfiles.getBodyTypeByString(req.params.text, (err, auditionsProfilesSearchByBodyTypeDetailsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: auditionsProfilesSearchByBodyTypeDetailsObj
            });
        }
    });
}

// get Search by eyeColour
var getEyeColourByString = (req, res) => {
    auditionsProfiles.getEyeColourByString(req.params.text, (err, auditionsProfilesSearchByEyeColourDetailsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: auditionsProfilesSearchByEyeColourDetailsObj
            });
        }
    });
}

// get Search by keywords
var getKeywordsByString = (req, res) => {
    auditionsProfiles.getKeywordsByString(req.params.text, (err, auditionsProfilesSearchByKeywordsDetailsObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: auditionsProfilesSearchByKeywordsDetailsObj
            });
        }
    });
}


var updateTilentsWithRating = (req, res) => {
    auditionsProfiles.updateTilentsWithRating(req.body.auditionProfileId,req.body,(err, updatedAuditionProfile) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while updating audition profile tilent."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: updatedAuditionProfile
            });
        }
    });
}

var updateAchievements = (req, res) => {
    auditionsProfiles.updateAchievements(req.body.auditionProfileId,req.body,(err, updatedAuditionProfile) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                token:req.headers['x-access-token'],
                message: "Error while updating audition profile tilent."
            });
        } else {
            res.status(200).json({
                success: 1,
                token:req.headers['x-access-token'],
                data: updatedAuditionProfile
            });
        }
    });
}




/// GET contest questions by Contest Name



var auditionsProfilesController = {
    createAuditionsProfiles: createAuditionsProfiles,
    updateAuditionsProfiles: updateAuditionsProfiles,
    getAuditionsProfilesById: getAuditionsProfilesById,
    getAuditionsProfilesByMemberId: getAuditionsProfilesByMemberId,
    getRoleByString: getRoleByString,
    getHairColourByString: getHairColourByString,
    getBodyTypeByString: getBodyTypeByString,
    getEyeColourByString: getEyeColourByString,
    getKeywordsByString: getKeywordsByString,
    updateTilentsWithRating:updateTilentsWithRating,
    updateAchievements:updateAchievements,
    getAuditionProfileByAllFilters:getAuditionProfileByAllFilters
}

module.exports = auditionsProfilesController;








































































































































/*var getUserProfile = (req, res) => {
    userService.getAllUserProfile((err, listOfUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while retrieving the user profile" });
        } else {
            res.status(200).json({ success: 1, data: listOfUserProfileObj });
        }
    });
}

var createUserProfile = (req, res) => {
    let userObj = req.body;
    let files = req.files;
    userObj.imageUrl = files[0].path;
    userObj.imageName = files[0].filename;
    req.body = userObj
    userService.saveUserProfile(req.body, (err, createdUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while creating user profile" });
        } else {
            res.status(200).json({ success: 1, data: createdUserProfileObj });
        }
    })
}

var updateUserProfile = (req, res) => {
    let userId = (req.params.user_Id) ? req.params.user_Id : '';
    userService.updateUserProfileById(userId, req.body, (err, updateUserObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while update user profile " + err.message });
        } else {
            res.status(200).json({ success: 1, data: updateUserObj });
        }
    });
}

var getUserProfileByDate = (req, res) =>{
   let createdDate = (req.params.createdDate) ? req.params.createdDate : '';
   userService.findUserByCreatedDate(createdDate, (err, userByDateObj)=>{
       if(err){
           res.status(404).json({success:0, message:"Error while retrieving user by date"});
       }else{
           res.status(200).json({success:1, data:userByDateObj});
       }

   });
}

var userProfile = {
    getUserProfile: getUserProfile,
    createUserProfile: createUserProfile,
    updateUserProfile: updateUserProfile,
    getUserProfileByDate: getUserProfileByDate
}


module.exports = userProfile;

*/