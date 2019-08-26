let ObjectId = require('mongodb').ObjectId;
let FeedCommentFeedbackServices = require('./feedCommentFeedbackServices');

var postFeedbackOnComment = (req,res)=> {
    FeedCommentFeedbackServices.postFeedbackOnComment(req.body,(err,postedFeedbackObj)=>{
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:"unable to post feedback on comment "+err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],message:"Thanks for posting your feedback.",data:postedFeedbackObj})
        }
    })
}

var updateFeedbackOnComment = (req,res)=> {
    FeedCommentFeedbackServices.updateFeedbackOnComment(req.params.commentFeedbackId,req.body,(err,updatedCommentFeedbackObj)=>{
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:"unable to update commentFeedback "+err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],message:"CommentFeedback updated succesfully",data:updatedCommentFeedbackObj})
        }
    })
}

var getAllFeedbackOnCommentByFeedId = (req,res)=> {
    FeedCommentFeedbackServices.getAllFeedbackOnCommentByFeedId(req.params.feedId,(err, feedbacksDetails) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data:feedbacksDetails})
        };
    });
}

var getAllFeedbackOnCommentByCommentId = (req, res)=> {
    FeedCommentFeedbackServices.getAllFeedbackOnCommentByCommentId(req.params.commentId,(err, feedbacksDetails) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data:feedbacksDetails})
        };
    });
}

var getAllFeedbackOnComment = (req, res)=> {
    FeedCommentFeedbackServices.getAllFeedbackOnComment(req.params,(err, feedbacksDetails) => {
        if(err)
        {
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data:feedbacksDetails})
        };
    });
}

var commentFeedbackController = {
    postFeedbackOnComment:postFeedbackOnComment,
    updateFeedbackOnComment:updateFeedbackOnComment,
    getAllFeedbackOnCommentByFeedId:getAllFeedbackOnCommentByFeedId,
    getAllFeedbackOnCommentByCommentId:getAllFeedbackOnCommentByCommentId,
    getAllFeedbackOnComment:getAllFeedbackOnComment
}

module.exports = commentFeedbackController;
