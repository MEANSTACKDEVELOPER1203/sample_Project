let express = require('express');
let AgeRange = require('./ageRangeModel');

let router = express.Router();

router.post('/createAgeRange', (req, res)=>{
 let ageRangeInfo = new AgeRange({
    ageStart:req.body.ageStart,
    ageEnd:req.body.ageEnd,
    createdBy:req.body.createdBy
 });
 AgeRange.create(ageRangeInfo, (err, createdAgeRangeObj)=>{
     if(err){
         return res.status(404).json({success:0, message:"Error while creating age range"});
     }else{
         return res.status(200).json({success:1, message:"created successfully"});
     }
 })
});

router.get('/getAgeRangeForAuditionProfile', (req, res)=>{
    AgeRange.find({"type" : "AuditionProfile"},{ageStart:1,ageEnd:1,_id:0},(err, ageRanges)=>{
        if(err){
            return res.status(404).json({success:0,token:req.headers['x-access-token'], message:"Error while creating age range"+err});
        }else{
            return res.status(200).json({success:1,token:req.headers['x-access-token'], data:ageRanges});
        }
    })
});




module.exports = router;