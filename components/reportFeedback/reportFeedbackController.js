let ObjectId = require('mongodb').ObjectId;
let reportFeedbackServices = require('./reportFeedbackServices');

var postFeedbackOnReport = (req,res)=> {
    reportFeedbackServices.postFeedbackOnReport(req.body,(err,postedFeedbackObj)=>{
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:"unable to post feedback on comment "+err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],message:"Thanks for posting your feedback.",data:postedFeedbackObj})
        }
    })
}

var getAllFeedbackItems = function(req,res) {
    reportFeedbackServices.getAllFeedbackItems((err, allreportFeedBack) => {
        if(err)
        {
            res.json({success:0,err:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data123:allreportFeedBack})
        }
    })
}

var commentFeedbackController = {
    postFeedbackOnReport:postFeedbackOnReport,
    getAllFeedbackItems:getAllFeedbackItems
}

module.exports = commentFeedbackController;
