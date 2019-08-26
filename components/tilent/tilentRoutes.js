var express = require('express');
let mongoose = require('mongoose');
let Tilent = require('./tilentModel');
let router = express.Router();

// var x =get array from '../public/staticData/taleent.json'
// Tilent.insertMany(x,(err,tilents)=>{
//     if(err)
//          res.json({status:0,err:err});
//     else
//         console.log(tilents)
// })


router.get('/getAll',(req,res)=>{
    Tilent.find({},{tilentTitle:1,_id:1},(err,tilents)=>{
        if(err)
             res.json({success:0,token:req.headers['x-access-token'],message:err});
        else
            res.json({success:1,token:req.headers['x-access-token'],data:tilents});
    })
})



router.post('/create',(req,res)=>{
    let newTilentObj = new Tilent({
        "tilentTitle" : req.body.tilentTitle,
        "subTilent" :req.body.subTilent
    });
    newTilentObj.save((err,newTilentObj)=>{
        if(err)
            res.json({success:0,token:req.headers['x-access-token'],message:err});
        else
            res.json({success:1,token:req.headers['x-access-token'],data:newTilentObj});
    })
})

router.get('/getById/:tilentId',(req,res)=>{
    Tilent.findById(req.params.tilentId,{tilentTitle:1,subTilent:1},(err,tilentObj)=>{
        if(err)
             res.json({success:0,token:req.headers['x-access-token'],message:err});
        else
            res.json({success:1,token:req.headers['x-access-token'],data:tilentObj});
    })
})

router.put('/updateById',(req,res)=>{
    var updatedObj = {
        "tilentTitle" : req.body.tilentTitle,
        "subTilent" :req.body.subTilent
    };
    Tilent.findByIdAndUpdate(req.params.tilentId,{$set:updatedObj},(err,updatedTilent)=>{
        if(err)
             res.json({success:0,token:req.headers['x-access-token'],message:err});
        else
            res.json({success:1,token:req.headers['x-access-token'],data:updatedTilent});
    })
})

module.exports = router;