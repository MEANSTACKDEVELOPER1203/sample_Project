let degreeTypeServices = require('./degreeTypeServices');

var createDegreeType = function(req,res) {
    degreeTypeServices.createDegreeType(req.body,(err,newDegreeTypeObj)=>{
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:"unable to create create Degreetype",err:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],message:"Successfully created Degreetype.",data:newDegreeTypeObj})
        }
    })
}

var updateDegreeType = function(req,res) {
    degreeTypeServices.updateDegreeType(req.params.degreeTypeId,req.body,(err,updatedDegreeType)=>{
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:"unable to update Degreetype",err:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],message:"Degreetype updated succesfully",data:updatedDegreeType})
        }
    })
}

var getAllDegreeType = function(req,res) {
    degreeTypeServices.getAllDegreeType((err, allDegreeTypes) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data:allDegreeTypes})
        };
    });
}

var getDegreeTypeById = function (req, res) {
    degreeTypeServices.getDegreeTypeById(req.params.degreeTypeId,(err, degreeTypeDetails) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data:{degreeTypeDetails:degreeTypeDetails}})
        };
    });
}

var degreeTypeController = {
    createDegreeType:createDegreeType,
    updateDegreeType:updateDegreeType,
    getAllDegreeType:getAllDegreeType,
    getDegreeTypeById:getDegreeTypeById
}

module.exports = degreeTypeController;
