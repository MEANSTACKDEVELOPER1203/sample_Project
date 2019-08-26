let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let roleType = require("./roleTypeModel");
let AgeRange = require('../ageRange/ageRangeModel');
let HairColor = require('../hairColor/hairColorModel');
let BodyType = require('../bodyType/bodyTypeModel');
let EyeColour = require('../eyeColor/eyeColourModel');
let Ethnicity = require('../ethnicity/ethnicityModel');
let roleTypeServices = require('./roleTypeService');


var getFiltersByRoleType = (req, res) => {
    let roleTypeName = (req.params.roleTypeName) ? req.params.roleTypeName : null;
    //console.log(roleTypeName)
    if(roleTypeName.search('Actor')!=-1 || roleTypeName.search('Models')!=-1)
    {
        roleTypeServices.getFiltersForActorAndModel(roleTypeName, (err, listOfFilterObject) => {
            if (err) {
                res.status(404).json({ success: 0, message: "Error while fetching the member detail " })
            } else if (!listOfFilterObject || listOfFilterObject == null) {
                return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "There are no applied yet!" });
            } else {
                return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfFilterObject });
            }
        });
    }
    else if(roleTypeName.search('Stunt Director')!=-1) 
    {
        //console.log("**********************SS")
        roleTypeServices.getFiltersForStuntDirector(roleTypeName, (err, listOfFilterObject) => {
            if (err) {
                res.status(404).json({ success: 0, message: "Error while fetching the member detail " })
            } else if (!listOfFilterObject || listOfFilterObject == null) {
                return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "There are no applied yet!" });
            } else {
                return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfFilterObject });
            }
        });   
    }
    else if(roleTypeName.search('Choreographer')!=-1) 
    {
        roleTypeServices.getFiltersForChoreographer(roleTypeName, (err, listOfFilterObject) => {
            if (err) {
                res.status(404).json({ success: 0, message: "Error while fetching the member detail " })
            } else if (!listOfFilterObject || listOfFilterObject == null) {
                return res.status(200).json({ success: 0,token:req.headers['x-access-token'], message: "There are no applied yet!" });
            } else {
                return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfFilterObject });
            }
        });   
    }
    else if(roleTypeName.search('Art Director')!=-1 || roleTypeName.search('Director') 
    ||  roleTypeName.search('Dubbing Artist') || roleTypeName.search('DOP') 
    || roleTypeName.search('Editor') || roleTypeName.search('Editor')
    || roleTypeName.search('Lyricist') || roleTypeName.search('Musician')
    || roleTypeName.search('Singer') || roleTypeName.search('Writers')) 
    {
        roleTypeServices.getCommenFiltersForMultipleRole(roleTypeName, (err, listOfFilterObject) => {
            if (err) {
                res.status(404).json({ success: 0, message: "Error while fetching the member detail " })
            } else if (!listOfFilterObject || listOfFilterObject == null) {
                return res.status(200).json({ success: 0, message: "There are no applied yet!" });
            } else {
                return res.status(200).json({ success: 1,token:req.headers['x-access-token'], data: listOfFilterObject });
            }
        });   
    }
    else{
        return res.status(200).json({ success: 0,token:req.headers['x-access-token'], data: null,message:"Please Provide Role Type" });
    }
}


var roleTypeController = {
    getFiltersByRoleType: getFiltersByRoleType
}

module.exports = roleTypeController;