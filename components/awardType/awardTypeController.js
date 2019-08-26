let ObjectId = require('mongodb').ObjectId;
let AwardTypeServices = require('./awardTypeServices');

var createAwardType = function(req,res) {
    AwardTypeServices.createAwardType(req.body,(err,newCreatedAwardTypeObj)=>{
        if(err)
        {
            res.json({success:0,message:"unable to create awardType",token:req.headers['x-access-token']})
        }
        else{
            res.json({success:1,message:"Sucessfully created Award type.",token:req.headers['x-access-token'],data:{newCreatedAwardTypeObj:newCreatedAwardTypeObj}})
        }
    })
}

var updateAwardType = function(req,res) {
    AwardTypeServices.updateAwardType(req.params.awardTypeId,req.body,(err,updatedAwardTypeObj)=>{
        if(err)
        {
            res.json({success:0,message:"unable to update Award type",token:req.headers['x-access-token']})
        }
        else{
            res.json({success:1,message:"Award type updated succesfully",token:req.headers['x-access-token'],data:{updatedAwardTypeObj:updatedAwardTypeObj}})
        }
    })
}

var getAllAwardType = function(req,res) {
    AwardTypeServices.getAllAwardType((err, allAwardType) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,data:allAwardType,token:req.headers['x-access-token']})
        };
    });
}

var getAwardTypeById = function (req, res) {
    AwardTypeServices.getAwardTypeById(req.params.awardTypeId,(err, awardDetails) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,data:{awardDetails:awardDetails},token:req.headers['x-access-token']})
        };
    });
}

var awardTypeController = {
    createAwardType:createAwardType,
    updateAwardType:updateAwardType,
    getAllAwardType:getAllAwardType,
    getAwardTypeById:getAwardTypeById
}

module.exports = awardTypeController;
