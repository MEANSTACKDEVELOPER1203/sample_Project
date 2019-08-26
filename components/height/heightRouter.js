var express = require('express');
let mongoose = require('mongoose');
let Height = require('./heightModel');
let router = express.Router();

router.get('/getAll',(req,res)=>{
    Height.find((err,heightRanges)=>{
        if(err)
             res.json({status:0,err:err});
        else
            res.json({status:1,heightRanges:heightRanges});
    })
})

router.post('/create',(req,res)=>{
    let newHeightRangeObj = new Height({
        "heightStart" : req.body.heightStart,
        "heightEnd" :req.body.heightEnd
    });
    newHeightRangeObj.save((err,newHeightRangeObj)=>{
        if(err)
            res.json({status:0,err:err});
        else
            res.json({status:1,newHeightRangeObj:newHeightRangeObj});
    })
})

router.get('/getById/:hightRangeId',(req,res)=>{
    Height.findById(req.params.hightRangeId,(err,heightRangeObj)=>{
        if(err)
             res.json({status:0,err:err});
        else
            res.json({status:1,heightRangeObj:heightRangeObj});
    })
})

router.put('/updateById',(req,res)=>{
    var updatedObj = {
        "heightStart" : req.body.heightStart,
        "heightEnd" :req.body.heightEnd,
        "updatedDate":new Date()
    };
    Height.findByIdAndUpdate(req.params.hightRangeId,{$set:updatedObj},(err,updatedheightRanges)=>{
        if(err)
             res.json({status:0,err:err});
        else
            res.json({status:1,updatedheightRanges:updatedheightRanges});
    })
})

module.exports = router;