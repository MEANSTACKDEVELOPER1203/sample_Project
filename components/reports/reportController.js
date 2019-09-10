let ObjectId = require('mongodb').ObjectId;
let reportServices = require('./reportServices');
let reportModel = require('./reportModel');

var createReport = function(req,res) {
    reportModel.find({feedId:req.body.feedId,memberId:req.body.memberId}, function (err, result) {
        //console.log("result",result);
        
        if (err) {
          res.json({token:req.headers['x-access-token'],success:0,message:err});
        }
        if (result.length >0) {
            let reportId = result[0]._id;
            reportModel.findByIdAndUpdate(reportId, { $set: req.body },{new:true},(err, updatedreportObj) => {
                res.json({success:1,message:"Thanks for reporting this post.",token:req.headers['x-access-token'],data:updatedreportObj})
            });
            //res.json({token:req.headers['x-access-token'],success:0,message:"You are allready reported for this feed"});
        }
        else if(result.length == 0){
            reportServices.createReport(req.body,(err,newCreatedreportObj)=>{
                if(err)
                {
                    res.json({success:0,message:"unable to create report",token:req.headers['x-access-token']})
                }
                else{
                    res.json({success:1,message:"Thanks for reporting this post.",token:req.headers['x-access-token'],data:newCreatedreportObj})
                }
            })
        }
    });
   
}

var updateReport = function(req,res) {
    reportServices.updateReport(req.params.reportId,req.body,(err,updatedreportObj)=>{
        if(err)
        {
            res.json({success:0,message:"unable to update Award type",token:req.headers['x-access-token']})
        }
        else{
            res.json({success:1,message:"Report updated succesfully",token:req.headers['x-access-token'],data:{updatedreportObj:updatedreportObj}})
        }
    })
}

var getAllReport = function(req,res) {
    reportServices.getAllReport((err, allreport) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,data:allreport,token:req.headers['x-access-token']})
        };
    });
}

var getreportById = function (req, res) {
    reportServices.getreportById(req.params.reportId,(err, awardDetails) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,data:{awardDetails:awardDetails},token:req.headers['x-access-token']})
        };
    });
}

var reportController = {
    createReport:createReport,
    updateReport:updateReport,
    getAllReport:getAllReport,
    getreportById:getreportById
}

module.exports = reportController;
