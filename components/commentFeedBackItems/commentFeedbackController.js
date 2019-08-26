let CommentFeedBackService = require('./commentFeedbackServices');

var createCommentFeedback = function(req,res) {
    CommentFeedBackService.createCommentFeedback(req.body,(err,createdCommentFeedbackObj)=>{
        if(err)
        {
            res.json({success:0,message:"unable to create commentFeedback",err:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],message:"CommentFeedback created succesfully",data:createdCommentFeedbackObj})
        }
    })
}

var updateCommentFeedback = function(req,res) {
    CommentFeedBackService.updateCommentFeedback(req.params.commentFeedbackId,req.body,(err,updatedCommentFeedbackObj)=>{
        if(err)
        {
            res.json({success:0,message:"unable to update commentFeedback",err:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],message:"CommentFeedback updated succesfully",data:updatedCommentFeedbackObj})
        }
    })
}

var getAllFeedbackItems = function(req,res) {
    CommentFeedBackService.getAllFeedbackItems((err, allcommentFeedBack) => {
        if(err)
        {
            res.json({success:0,err:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data:allcommentFeedBack})
        }
    })
}

var getCommentFeedbackById = function (req, res) {
    CommentFeedBackService.getCommentFeedbackById(req.params.commentFeedbackId,(err, commentFeedbackObj) => {
        if(err)
        {
            res.json({success:0,err:err})
        }
        else{
            res.json({success:1,token:req.headers['x-access-token'],data:commentFeedbackObj})
        };
    });
}

var commentFeedbackController = {
    createCommentFeedback:createCommentFeedback,
    updateCommentFeedback:updateCommentFeedback,
    getAllFeedbackItems:getAllFeedbackItems,
    getCommentFeedbackById:getCommentFeedbackById
}

module.exports = commentFeedbackController;
