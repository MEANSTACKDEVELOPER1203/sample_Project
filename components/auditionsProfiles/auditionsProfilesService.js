//var mongoose = require('../configuration/connection');
let ObjectId = require('mongodb').ObjectId;
let auditionsProfiles = require('./auditionsProfilesModel');
let applyAuditionsModel = require("../applyAuditions/applyAuditionsModel");
const ActivityLog = require("../activityLog/activityLogService");

//notification model
let Notification = require('../notification/notificationModel');


let multer = require("multer");

// Multer Settings code start

let storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, "uploads/auditions"); 
    },
    filename: (req, file, cb)=> {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
    }
});

let upload = multer({
    storage: storage
});


//let role = require("../roles/roleModel");

var saveAuditionsProfiles = (auditionsProfilesObj, callback)=> {
    // console.log("*********************auditionsProfilesObj ** 2 ******************************");
    //console.log(auditionsProfilesObj)
    var auditionsProfilesObjInfo = new auditionsProfiles({
        memberId: auditionsProfilesObj.memberId,
        title: auditionsProfilesObj.title,
        firstName: auditionsProfilesObj.firstName,
        lastName: auditionsProfilesObj.lastName,
        otherNames: auditionsProfilesObj.otherNames,
        screenName: auditionsProfilesObj.screenName,
        aboutMe: auditionsProfilesObj.aboutMe,
        email: auditionsProfilesObj.email,
        location: auditionsProfilesObj.location,
        mobileNumber: auditionsProfilesObj.mobileNumber,
        profilePicUrl: auditionsProfilesObj.profilePicUrl,
        profilePicName: auditionsProfilesObj.profilePicName,
        city: auditionsProfilesObj.city,
        state: auditionsProfilesObj.state,
        country: auditionsProfilesObj.country,
        dob: auditionsProfilesObj.dob,
        placeOfBirth: auditionsProfilesObj.placeOfBirth,
        gender: auditionsProfilesObj.gender,
        showAge:auditionsProfilesObj.showAge,
        bodyType: auditionsProfilesObj.bodyType,
        skinTone: auditionsProfilesObj.skinTone,
        eyeColor: auditionsProfilesObj.eyeColor,
        hairColor:auditionsProfilesObj.hairColor,
        ageGroup: auditionsProfilesObj.ageGroup,
        ageStart :auditionsProfilesObj.ageStart,
        ageEnd :auditionsProfilesObj.ageEnd,
        height: auditionsProfilesObj.height,
        weight: auditionsProfilesObj.weight,
        ethnicity: auditionsProfilesObj.ethnicity,
        currentRoles: auditionsProfilesObj.currentRoles,
        interestedIn: auditionsProfilesObj.interestedIn,
        hobbies: auditionsProfilesObj.hobbies,
        skills: auditionsProfilesObj.skills,
        countryCode: auditionsProfilesObj.countryCode,
        languages: auditionsProfilesObj.languages,
        highestEducation: auditionsProfilesObj.highestEducation,
        schoolOrUniversity: auditionsProfilesObj.schoolOrUniversity,
        professionalEducation: auditionsProfilesObj.professionalEducation,
        proSchoolOrUniversity: auditionsProfilesObj.proSchoolOrUniversity,
        portFolioPictures: auditionsProfilesObj.portFolioPictures,
        portFolioVideos: auditionsProfilesObj.portFolioVideos,
        showReal: auditionsProfilesObj.showReal,
        roleType:auditionsProfilesObj.roleType,
        publicProfileUrl: auditionsProfilesObj.publicProfileUrl,
        socialLinks: auditionsProfilesObj.socialLinks,
        mediaLinksOrArticles: auditionsProfilesObj.mediaLinksOrArticles,
        status: auditionsProfilesObj.status,
        updatedBy: auditionsProfilesObj.updatedBy,
        profileCompletenes: auditionsProfilesObj.profileCompletenes,
        media: auditionsProfilesObj.mediaArray,
        experience: auditionsProfilesObj.experience,
        education: auditionsProfilesObj.education,
        alternateEmail: auditionsProfilesObj.alternateEmail,
        isPassport: auditionsProfilesObj.isPassport,
        isLicense:auditionsProfilesObj.isLicense,
        alternateMobileNumber:auditionsProfilesObj.alternateMobileNumber,
        // startHeight : auditionsProfilesObj.startHeight,
        // endHeight : auditionsProfilesObj.endHeight,
        // startWeight  : auditionsProfilesObj.startWeight,
        // endWeight :auditionsProfilesObj.endWeight
    });

    //if (!err)
    // console.log(findObj)
    auditionsProfiles.create(auditionsProfilesObjInfo, (err, createAuditionsProfilesObj) => {
        if (!err)
        {
            let body ={
                memberId:createAuditionsProfilesObj.memberId
            }
            ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("AuditionProfile",body,(err,newActivityLog)=>{
                if(err){
                    // res.json({success: 0,message: "Please try again." + err});
                }else{
                
                }
            })
            callback(null, createAuditionsProfilesObj);
        }
            
        else
            callback(err, null);
    });

}


var findAuditionByMemberId =  (memberId, callback)=> {
    
    auditionsProfiles.findOne({ memberId: memberId }, (err, findObj) => {
        if (!err && findObj)
        {
            Notification.find({status:"active",notificationType : "audition",memberId:memberId},(err,notSeenRecommendationCount)=>{
                if(err)
                {
                    callback(null, findObj,null)
                }
                else{
                    //console.log(notSeenRecommendationCount)
                    callback(null, findObj,notSeenRecommendationCount.length)
                }
            })
        }
        else
            callback(err, null,null)
    })
}


// var findAuditionByMemberId = (memberId, callback)=> {
//     auditionsProfiles.findById(Object(memberId), (err, findObj) => {
//         if (!err)
//             callback(null, findObj)
//         else
//             callback(err, null)
//     })
// }



var updateAuditionsProfiles = (auditionsProfilesId, auditionsProfilesObj, callback)=> {
    auditionsProfiles.findByIdAndUpdate(auditionsProfilesId, auditionsProfilesObj, { new: true }, (err, updateauditionsProfilesObj) => {
        if (!err){
            let body ={
                memberId:updateauditionsProfilesObj.memberId
            }
            ActivityLog.createActivityLogByProvidingActivityTypeNameAndContent("AuditionProfile",body,(err,newActivityLog)=>{
                if(err){
                    // res.json({success: 0,message: "Please try again." + err});
                }else{
                
                }
            })
            callback(null, updateauditionsProfilesObj);
        }
        else
            callback(err, null);
    });
}


var updateTilentsWithRating = (auditionProfileId, updatedValues, callback) =>{
    if(updatedValues.process)
    {
        if(updatedValues.process.toLowerCase()=="add"){
            auditionsProfiles.findByIdAndUpdate(auditionProfileId,{$push:{tilents:updatedValues}}, { new: true }, (err, updateauditionsProfilesObj) => {
                if (!err)
                    callback(null, updateauditionsProfilesObj);
                else
                    callback(err, null);
            });
        }
        else if(updatedValues.profileTilentId && updatedValues.process.toLowerCase()=="remove"){
            auditionsProfiles.findByIdAndUpdate(auditionProfileId,{$pull:{tilents:{_id:updatedValues.profileTilentId}}}, { new: true }, (err, updateauditionsProfilesObj) => {
                if (!err)
                    callback(null, updateauditionsProfilesObj);
                else
                    callback(err, null);
            });
        }
    }
    else
    {
        err={"message":"Please Provide process(add/remove) and profileTilentId"}
        callback(null, err);
    }
}

var updateAchievements = (auditionProfileId, updatedValues, callback) =>{
    if(updatedValues.process)
    {
        if(updatedValues.process.toLowerCase()=="add"){
            auditionsProfiles.findByIdAndUpdate(auditionProfileId,{$push:{achievements:updatedValues}}, { new: true }, (err, updateauditionsProfilesObj) => {
                if (!err)
                    callback(null, updateauditionsProfilesObj);
                else
                    callback(err, null);
            });
        }
        else if(updatedValues.achievementId && updatedValues.process.toLowerCase()=="remove"){
            auditionsProfiles.findByIdAndUpdate(auditionProfileId,{$pull:{achievements:{_id:updatedValues.achievementId}}}, { new: true }, (err, updateauditionsProfilesObj) => {
                if (!err)
                    callback(null, updateauditionsProfilesObj);
                else
                    callback(err, null);
            });
        }
    }
    else
    {
        err={"message":"Please Provide process(add/remove) and achievementId"}
        callback(null, err);
    }
}

//get content details by auditionsProfiles id
var findAuditionsProfilesById = (auditionsProfilesId, cb)=> {
    auditionsProfiles.findById({
        _id: auditionsProfilesId
    }, (err, auditionsProfilesDetailsObj) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, auditionsProfilesDetailsObj);
        }
    });
}

// get role by string
var getRoleByString = (text, cb) =>{
    let searchString = text
    //let id = req.body.userID;
    //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    auditionsProfiles.aggregate(
        [

            // {
            //     $lookup: {
            //         from: "applyAuditions",
            //         localField: "_id",
            //         foreignField: "auditionsProfilesId",
            //         as: "roles"
            //     }
            // },
            {
                $match: {
                    roleType: { $regex: searchString, $options: 'i' }
                },

            },

            {
                $project: {
                    _id: 1,
                    gender: 1,
                    dob:1,
                    ethnicity: 1,
                    mediaRequired: 1,
                    showAge:1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionsProfilesId": 1,
                }
            }



        ],
         (err, auditionsProfilesSearchDetailsObj) =>{
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionsProfilesSearchDetailsObj);
            }



        }
    );

    //}
}

// get role by string
var getHairColourByString = (skills,hairColour, bodyType, eyeColour,gender, ethnicity, ageStart, ageEnd,startHeight,endHeight,passport,license, cb) =>{
    //let eyeColour = eyeColour;
    //let hairColour = hairColour;
    // let bodyType = bodyType;
    // let eyeColour = req.body.eyeColour;
    // let gender = gender;
    // let bodyType;
    //let id = req.body.userID;
    var query = [];
    if (skills != null && skills != "null") {
        query.push({ skills: { $regex: skills, $options: 'i' } });
    }
    if (gender != null && gender != "null") {
        query.push({ gender: { $regex: gender, $options: 'i' } });
    }
    if (bodyType != null && bodyType != "null") {
        query.push({ bodyType: { $regex: bodyType, $options: 'i' } });
    }
    if (hairColour != null && hairColour != "null") {
        query.push({ hairColor: { $regex: hairColour, $options: 'i' } });
    }
    if (eyeColour != null && eyeColour != "null") {
        query.push({ eyeColor: { $regex: eyeColour, $options: 'i' } });
    }
    if (ethnicity != null && ethnicity != "null") {
        query.push({ ethnicity: { $regex: ethnicity, $options: 'i' } });
    }
    if (ageStart != null && ageStart != "null") {
        query.push( { ageStart: { $gte: ageStart } } );
    }
    if (ageEnd != null && ageEnd != "null") {
        query.push( { ageEnd: { $lte: ageEnd } } );
    }
    if ((startHeight != null && startHeight != "null") || (endHeight != null && endHeight != "null")) {
        query.push({$and:[{ height: { $gte: parseInt(startHeight) } },{ height: { $lte: parseInt(endHeight) } }]});
    }
    // if (startHeight != null && startHeight != "null") {
    //     query.push( { height: { $gte: startHeight } } );
    // }
    // if (endHeight != null && endHeight != "null") {
    //     query.push( { height: { $lte: endHeight } } );
    // }
    if (passport != null && passport != "null") {
        query.push( { isPassport: true } );
    }
    if (license != null && license != "null") {
        query.push( { isLicense: true } );
    }
    if(query.length)
    {
            //console.log(query)
        auditionsProfiles.aggregate(
            [
                {
                    $match: {  $and: query },

                },
                { $sort : { createdAt : -1} },
                {
                    $project: {
                        _id: 1,
                        gender: 1,
                        memberId:1,
                        ethnicity: 1,
                        mediaRequired: 1,
                        roleDescription: 1,
                        hairColour: 1,
                        bodyType: 1,
                        eyeColour: 1,
                        profilePicUrl:1,
                        firstName:1,
                        lastName:1,
                        screenName:1,
                        showAge:1,
                        dob:1,
                        height:1,
                        weight:1,
                        mobileNumber:1,
                        roleType:1,
                        skills:1,
                        //"year": { $year: "dob" },
                        country:1,
                        createdAt:1,
                        isPassport:1,
                        isLicense:1,
                        achievements:1,
                        tilents:1,
                        ageStart:1,
                        ageEnd:1,
                        startHeight:1,
                        startWeight:1
                    }
                }


            ],
             (err, DetailsObj)=> {
                //console.log("P", DetailsObj);
                if (err) {
                    return cb(err, null);
                    console.log(err);
                }
                else {
                    //console.log(data);
                    return cb(null, DetailsObj);
                }



            }
        );
    }
    else{
        return cb(null, []) 
    }


    //}
}

// get role by string
var getAuditionProfileByAllFilters = (skills,hairColour, bodyType, eyeColour,gender, ethnicity, ageStart, ageEnd,startHeight,endHeight,passport,license,auditioProfileId, cb) =>{
    //let eyeColour = eyeColour;
    //let hairColour = hairColour;
    // let bodyType = bodyType;
    // let eyeColour = req.body.eyeColour;
    // let gender = gender;
    // let bodyType;
    //let id = req.body.userID;
    if(auditioProfileId != '0' &&  auditioProfileId != null)
    {
        var query = [{_id:{$ne:ObjectId(auditioProfileId)}}];
    }
    else{
        var query = [];
    }
    if (skills != null && skills != "null") {
        query.push({ skills: { $regex: skills, $options: 'i' } });
    }
    if (gender != null && gender != "null") {
        query.push({ gender: { $regex: "^"+gender, $options: 'i' } });
    }
    if (bodyType != null && bodyType != "null") {
        query.push({ bodyType: { $regex: bodyType, $options: 'i' } });
    }
    if (hairColour != null && hairColour != "null") {
        query.push({ hairColor: { $regex: hairColour, $options: 'i' } });
    }
    if (eyeColour != null && eyeColour != "null") {
        query.push({ eyeColor: { $regex: eyeColour, $options: 'i' } });
    }
    if (ethnicity != null && ethnicity != "null") {
        query.push({ ethnicity: { $regex: ethnicity, $options: 'i' } });
    }
    // if (ageStart != null && ageStart != "null") {
    //     currentDate = new Date();
    //     let newAge = currentDate.getFullYear() - ageStart;
    //     query.push( { dob: { $lte: new Date(newAge+"-01-01") } } );
    // }
    // if (ageEnd != null && ageEnd != "null") {
    //     currentDate = new Date();
    //     let newAge = currentDate.getFullYear() - ageEnd;
    //     query.push( { dob: { $gte: new Date(newAge+"-01-01") } } );
    // }
    // if (ageStart != null && ageStart != "null") {
    //     query.push( { ageStart: { $gte: parseInt(ageStart) } } );
    // }
    // if (ageEnd != null && ageEnd != "null") {
    //     query.push( { ageEnd: { $lte: parseInt(ageEnd) } } );
    // }
    // if ((startHeight != null && startHeight != "null") || (endHeight != null && endHeight != "null")) {
    //     query.push({$and:[{ height: { $gte: parseInt(startHeight) } },{ height: { $lte: parseInt(endHeight) } }]});
    // }
    // 
    if ((ageStart != null && ageStart != "null") || (ageEnd != null && ageEnd != "null")) {
        query.push({
            $or:[
                {
                   $and:[
                        { "ageStart": { $gte: parseInt(ageStart) } },
                        { "ageStart": { $lte: parseInt(ageEnd) } }
                    ]
                },
                {   
                    $and:[
                        { "ageEnd": { $gte: parseInt(ageStart) } },
                        { "ageEnd": { $lte: parseInt(ageEnd) } }
                    ],
                   
                },
                {
                    $and:[
                        { "ageStart": { $lte: parseInt(ageStart) }},
                        { "ageEnd" : { $gte: parseInt(ageEnd) } }
                    ]  
                }
            ]});
        // $or:[
        //     // {$or:[{ ageEnd: { $exists: false } },{ ageStart: { $exists: false } }]},
        //     {$and:[{ "ageStart": { $gte: parseInt(ageStart) } },{ "ageStart": { $lte: parseInt(ageEnd) }}]},
        //     {$and:[{ "ageEnd": { $gte: parseInt(ageStart) } },{ "ageEnd": { $lte: parseInt(ageEnd) }}]}
        // ]});
    }
    if ((startHeight != null && startHeight != "null") || (endHeight != null && endHeight != "null")) {
        query.push({
               $and:[
                    { "height": { $gte: parseInt(startHeight) } },
                    { "height": { $lte: parseInt(endHeight) } }
                ]
            });
        // query.push( { height: { $gte: startHeight } } );
    }
    // if (startHeight != null && startHeight != "null") {
    //     query.push( { height: { $gte: startHeight } } );
    // }
    // if (endHeight != null && endHeight != "null") {
    //     query.push( { height: { $lte: endHeight } } );
    // }
    if (passport != null && passport != "null") {
        query.push( { isPassport: true } );
    }
    if (license != null && license != "null") {
        query.push( { isLicense: true } );
    }
    if(query.length)
    {
            //console.log(query)
        auditionsProfiles.aggregate(
            [
                {
                    $match: {  $and: query },

                },
                { $sort : { createdAt : -1} },
                {
                    $project: {
                        _id: 1,
                        gender: 1,
                        memberId:1,
                        ethnicity: 1,
                        mediaRequired: 1,
                        roleDescription: 1,
                        hairColour: 1,
                        bodyType: 1,
                        eyeColour: 1,
                        profilePicUrl:1,
                        firstName:1,
                        lastName:1,
                        screenName:1,
                        dob:1,
                        height:1,
                        weight:1,
                        mobileNumber:1,
                        roleType:1,
                        skills:1,
                        showAge:1,
                        //"year": { $year: "dob" },
                        country:1,
                        createdAt:1,
                        isPassport:1,
                        isLicense:1,
                        achievements:1,
                        tilents:1,
                        ageStart:1,
                        ageEnd:1,
                        startHeight:1,
                        startWeight:1
                    }
                }


            ], (err, DetailsObj) =>{
                //console.log("P", DetailsObj);
                if (err) {
                    return cb(err, null);
                    console.log(err);
                }
                else {
                    //console.log(data);
                    return cb(null, DetailsObj);
                }



            }
        );
    }
    else{
        return cb(null, []) 
    }


    //}
}

// get BodyType by string
var getBodyTypeByString = (text, cb)=> {
    let searchString = text
    //let id = req.body.userID;
    //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    auditionsProfiles.aggregate(
        [

            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionsProfilesId",
                    as: "roles"
                }
            },
            {
                $match: {
                    "roles.bodyType": { $regex: searchString, $options: 'i' }
                },

            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionsProfilesExipires: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    created_at: 1,
                    showAge:1,
                    "roles._id": 1,
                    "roles.gender": 1,
                    "roles.ageStart": 1,
                    "roles.ageEnd": 1,
                    "roles.ethnicity": 1,
                    "roles.mediaRequired": 1,
                    "roles.roleDescription": 1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionsProfilesId": 1,
                }
            }


        ], (err, auditionsProfilesSearchByBodyTypeDetailsObj)=> {
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionsProfilesSearchByBodyTypeDetailsObj);
            }



        }
    );

    //}
}

// get keywords by string
var getKeywordsByString = (text, cb)=> {
    let searchString = text
    //let id = req.body.userID;
    //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    auditionsProfiles.aggregate(
        [

            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionsProfilesId",
                    as: "roles"
                }
            },
            {
                $match: {
                    keywords: { $regex: searchString, $options: 'i' }
                },

            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionsProfilesExipires: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    created_at: 1,
                    showAge:1,
                    "roles._id": 1,
                    "roles.gender": 1,
                    "roles.ageStart": 1,
                    "roles.ageEnd": 1,
                    "roles.ethnicity": 1,
                    "roles.mediaRequired": 1,
                    "roles.roleDescription": 1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionsProfilesId": 1,
                }
            }


        ], (err, auditionsProfilesSearchByKeywordsDetailsObj)=> {
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionsProfilesSearchByKeywordsDetailsObj);
            }



        }
    );

    //}
}

// get eyeColour by string
var getEyeColourByString = (text, cb)=> {
    let searchString = text
    //let id = req.body.userID;
    //if ((searchString == "") || (searchString == null) || (searchString == "undefined")) {
    auditionsProfiles.aggregate(
        [
            {
                $lookup: {
                    from: "role",
                    localField: "_id",
                    foreignField: "auditionsProfilesId",
                    as: "roles"
                }
            },
            {
                $match: {
                    "roles.eyeColour": { $regex: searchString, $options: 'i' }
                },

            },
            {
                $project: {
                    _id: 1,
                    productionTitle: 1,
                    productionCompany: 1,
                    startDate: 1,
                    auditionsProfilesExipires: 1,
                    keywords: 1,
                    productionType: 1,
                    productionPersonName: 1,
                    productionDescription: 1,
                    draftMode: 1,
                    showAge:1,
                    created_at: 1,
                    "roles._id": 1,
                    "roles.gender": 1,
                    "roles.ageStart": 1,
                    "roles.ageEnd": 1,
                    "roles.ethnicity": 1,
                    "roles.mediaRequired": 1,
                    "roles.roleDescription": 1,
                    "roles.hairColour": 1,
                    "roles.bodyType": 1,
                    "roles.eyeColour": 1,
                    "roles.roleName": 1,
                    "roles.roleType": 1,
                    "roles.auditionsProfilesId": 1,
                }
            }


        ], (err, auditionsProfilesSearchByEyeColourDetailsObj) =>{
            if (err) {
                return cb(err, null);
                console.log(err);
            }
            else {
                //console.log(data);
                return cb(null, auditionsProfilesSearchByEyeColourDetailsObj);
            }



        }
    );

    //}
}

var auditionsProfilesServices = {
    saveAuditionsProfiles: saveAuditionsProfiles,
    updateAuditionsProfiles: updateAuditionsProfiles,
    findAuditionsProfilesById: findAuditionsProfilesById,
    getRoleByString: getRoleByString,
    getHairColourByString: getHairColourByString,
    getBodyTypeByString: getBodyTypeByString,
    getKeywordsByString: getKeywordsByString,
    getEyeColourByString: getEyeColourByString,
    findAuditionByMemberId: findAuditionByMemberId,
    updateTilentsWithRating:updateTilentsWithRating,
    updateAchievements:updateAchievements,
    getAuditionProfileByAllFilters:getAuditionProfileByAllFilters
    //findAuditionProfileByProfileId: findAuditionProfileByProfileId

}

module.exports = auditionsProfilesServices;






































































































































































/*
var getAllUserProfile = (callback)=> {
    User.find((err, listOfUsersObj) => {
        if (!err) {
            callback(null, listOfUsersObj);
        } else {
            callback(err, null);
        }
    });
}

var saveUserProfile = (userProfileObj, callback) =>{
    var userProfile = new User({
        firstName: userProfileObj.firstName,
        lastName: userProfileObj.lastName,
        userName: userProfileObj.userName,
        emailId: userProfileObj.emailId,
        mobileNo: userProfileObj.mobileNo,
        createDate: userProfileObj.createDate,
        imageUrl:userProfileObj.imageUrl,
        imageName:userProfileObj.imageName
        

    });
    User.create(userProfile, (err, createdUserObj) => {
        if (!err) {
            callback(null, createdUserObj);
        } else {
            callback(err, null);
        }
    })
}

var updateUserProfileById = (userId, userObj, callback)=> {
    //console.log(userObj);
    User.findByIdAndUpdate(ObjectId(userId), userObj, { new: true }, (err, updatedUserObj) => {
        if (!err) {
            callback(null, updatedUserObj);
        } else {
            callback(err, null);
        }
    });
}

var findUserByCreatedDate = (createDate, callback)=> {
    //{ "$gte": new Date(createDate), "$lt": new Date(createDate) }
    let query = {
        createDate: new Date(createDate)
    }
    User.find(query, (err, userObj) => {
        if (!err) {
            callback(null, userObj);
        } else {
            callback(err, null);
        }
    });
}
var userProfile = {
    getAllUserProfile: getAllUserProfile,
    saveUserProfile: saveUserProfile,
    updateUserProfileById: updateUserProfileById,
    findUserByCreatedDate: findUserByCreatedDate
}

module.exports = userProfile;

*/