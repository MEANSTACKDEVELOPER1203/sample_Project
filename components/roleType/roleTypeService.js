let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let roleType = require("./roleTypeModel");
let AgeRange = require('../ageRange/ageRangeModel');
let HairColor = require('../hairColor/hairColorModel');
let BodyType = require('../bodyType/bodyTypeModel');
let EyeColour = require('../eyeColor/eyeColourModel');
let Ethnicity = require('../ethnicity/ethnicityModel');
let Height = require('../height/heightModel');
let roleTypeControllers = require('./roleTypeController');
let Gender = require("../gender/genderModel");

//Filter For Actor and Model
//Gender / Age range / Hair color / Body type / eye color / ethnicity
var getFiltersForActorAndModel = function (roleTypeName, cb) {
    Height.find((err,listOfHeightRange)=>{
        if(err)
            return res.status(404).json({ success: 0, message: "Error while fetching height data..." });
        Gender.find((err, listOfGender) => {
            if (err)
                return res.status(404).json({ success: 0, message: "Error while fetching Gender data..." });
            else{
                AgeRange.find({"type" : "AuditionProfile"},(err, listOfAgeRage) => {
                    if (err)
                    return res.status(404).json({ success: 0, message: "Error while fetching filters data..." });
                    else {
                    HairColor.find((err, listOfHairColor) => {
                        if (err)
                        console.log("HairColor",err)
                        else {
                        BodyType.find((err, listOfBodyType) => {
                            if (err)
                            console.log("BodyType======= ",err)
                            else {
                            EyeColour.find((err, listOfEyeColor) => {
                                if (err)
                                console.log("EyeColour",  err)
                                else {
                                Ethnicity.find((err, listOfEthnicity) => {
                                    if (err)
                                    console.log("Ethnicity  ", err)
                                    else {
                                        var data = {
                                            ageRange:listOfAgeRage,
                                            hairColor:listOfHairColor,
                                            bodyType:listOfBodyType,
                                            eyeColour:listOfEyeColor,
                                            ethnicity:listOfEthnicity,
                                            Gender:listOfGender,
                                            height:listOfHeightRange
                                        }
                                        // var data = [{
                                        //                 needed : 1,
                                        //                 title : 'Gender',
                                        //                 listOfGender:listOfGender
                                        //             },
                                        //             {   
                                        //                 needed : 1,
                                        //                 title : 'Age Range',
                                        //                 listOfAgeRage:listOfAgeRage
                                        //             },
                                        //             {
                                        //                 needed : 1,
                                        //                 title : 'Hair Color',
                                        //                 listOfHairColor:listOfHairColor
                                        //             },
                                        //             {
                                        //                 needed : 1,
                                        //                 title : 'Body Type',
                                        //                 listOfBodyType:listOfBodyType
                                        //             },
                                        //             {
                                        //                 needed : 1,
                                        //                 title : 'Eye Color',
                                        //                 listOfEyeColor:listOfEyeColor
                                        //             },
                                        //             {
                                        //                 needed : 1,
                                        //                 title : 'Ethnicity',
                                        //                 listOfEthnicity:listOfEthnicity
                                        //             }
                                        //     ]
                                        return cb(null, data); 
                                    }
                                }).sort({ethnicityName:1});
                                }
                            }).sort({eyeColourName:1});
                            }
                        }).sort({bodyTypeName:1});
                        }
                    }).sort({hairColorName:1});
                    }
                });
            }
        })
    })
}

//Filter For Art Director / Director / Dubbing Artist / DOP / Editor / Lyricist  / Musician / Singer / Writers  
//Gender / Age range
var getCommenFiltersForMultipleRole = function (roleTypeName, cb) {
    Gender.find((err, listOfGender) => {
        if (err)
            return res.status(404).json({ success: 0, message: "Error while fetching Gender data..." });
        else{
            AgeRange.find({"type" : "AuditionProfile"},(err, listOfAgeRage) => {
                if (err)
                  return res.status(404).json({ success: 0, message: "Error while fetching filters data..." });
                else {         
                    var data = {
                        ageRange:listOfAgeRage,
                        Gender:listOfGender
                    }
                    // var data = [{
                    //     needed : 1,
                    //     title : 'Gender',
                    //     listOfGender:listOfGender
                    // },
                    // {   
                    //     needed : 1,
                    //     title : 'Age Range',
                    //     listOfAgeRage:listOfAgeRage
                    // }]
                    return cb(null, data);
                }
              });
        }
    });
}



//Stunt Director - Gender / Age range / Body type
var getFiltersForStuntDirector = function (roleTypeName, cb) {
    // Height.find((err,listOfHeightRange)=>{
    //     if(err)
    //         return res.status(404).json({ success: 0, message: "Error while fetching height data..." });
        Gender.find((err, listOfGender) => {
            if (err)
                return res.status(404).json({ success: 0, message: "Error while fetching Gender data..." });
            else{
                AgeRange.find({"type" : "AuditionProfile"},(err, listOfAgeRage) => {
                    if (err)
                        return res.status(404).json({ success: 0, message: "Error while fetching filters data..." });
                    else {
                        BodyType.find((err, listOfBodyType) => {
                            if (err)
                                console.log("BodyType======= ",err)
                            else {
                                var data = {
                                    ageRange:listOfAgeRage,
                                    bodyType:listOfBodyType,
                                    Gender:listOfGender,
                                  //  height:listOfHeightRange
                                }
    
                                // var data = [{
                                //     needed : 1,
                                //     title : 'Gender',
                                //     listOfGender:listOfGender
                                // },
                                // {   
                                //     needed : 1,
                                //     title : 'Age Range',
                                //     listOfAgeRage:listOfAgeRage
                                // },
                                // {
                                //     needed : 1,
                                //     title : 'Body Type',
                                //     listOfBodyType:listOfBodyType
                                // }]
                                return cb(null, data); 
                            }
                        }).sort({bodyTypeName:1});
                    }
                });
            }
        });
    //});
    
}

//Choreographer - Gender / Age range / Body type
var getFiltersForChoreographer = function (roleTypeName, cb) {
    // Height.find((err,listOfHeightRange)=>{
    //     if(err)
    //         return res.status(404).json({ success: 0, message: "Error while fetching height data..." });
        Gender.find((err, listOfGender) => {
            if (err)
                return res.status(404).json({ success: 0, message: "Error while fetching Gender data..." });
            else{
                AgeRange.find({"type" : "AuditionProfile"},(err, listOfAgeRage) => {
                    if (err)
                        return res.status(404).json({ success: 0, message: "Error while fetching filters data..." });
                    else {
                        BodyType.find((err, listOfBodyType) => {
                            if (err)
                                console.log("BodyType======= ",err)
                            else {
                                    var data = {
                                        ageRange:listOfAgeRage,
                                        bodyType:listOfBodyType,
                                        Gender:listOfGender,
                                      //  height:listOfHeightRange
                                    }
                                    // var data = [{
                                    //     needed : 1,
                                    //     title : 'Gender',
                                    //     listOfGender:listOfGender
                                    // },
                                    // {   
                                    //     needed : 1,
                                    //     title : 'Age Range',
                                    //     listOfAgeRage:listOfAgeRage
                                    // },
                                    // {
                                    //     needed : 1,
                                    //     title : 'Body Type',
                                    //     listOfBodyType:listOfBodyType
                                    // }]
                                    return cb(null, data); 
                            }
                        }).sort({bodyTypeName:-1});
                    }
                });
            }
        });    
  // });
    
}

var roleTypeServices = {
    getFiltersForActorAndModel:getFiltersForActorAndModel,
    getCommenFiltersForMultipleRole:getCommenFiltersForMultipleRole,
    getFiltersForStuntDirector:getFiltersForStuntDirector,
    getFiltersForChoreographer:getFiltersForChoreographer
}

module.exports = roleTypeServices;

