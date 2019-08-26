let ObjectId = require('mongodb').ObjectId;
let  FeedCommentFeedback = require('./feedCommentFeedbackModel');

var postFeedbackOnComment =  (postFeedbackObj, callback)=> {
    var newPostedFeedbackObj = new FeedCommentFeedback({
        commentId:postFeedbackObj.commentId,
        feedbackPostedBy:postFeedbackObj.feedbackPostedBy,
        feedbackItemID:postFeedbackObj.feedbackItemID,
        remark:postFeedbackObj.remark ? postFeedbackObj.remark : ""
    });
    FeedCommentFeedback.create(newPostedFeedbackObj,(err, newPostedFeedbackObj) => {
        if (!err)
            callback(null, newPostedFeedbackObj);
        else
            callback(err, null);
    });
}

var updateFeedbackOnComment = (commentFeedbackId, updateFeedbackObj, callback)=> {
    updateFeedbackObj.updatedDate = new Date();
    FeedCommentFeedback.findByIdAndUpdate(commentFeedbackId, { $set: updateFeedbackObj },{new:true},(err, updatedCommentFeedbackObj) => {
        if (!err)
            callback(null, updatedCommentFeedbackObj);
        else
            callback(err, null);
    });
}

var getAllFeedbackOnCommentByFeedId = (feedId,callback)=> {
    FeedCommentFeedback.find({feedId:feedId},(err, feedbacksDetails) => {
        if (!err)
            callback(null, feedbacksDetails);
        else
            callback(err, null);
    });
}

var getAllFeedbackOnCommentByCommentId = (commentId, callback)=> {
    FeedCommentFeedback.find({commentId:commentId},(err, feedbacksDetails) => {
        if (!err)
            callback(null, feedbacksDetails);
        else
            callback(err, null);
    });
}

var getAllFeedbackOnComment = (params, callback)=> {
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);
    FeedCommentFeedback.count({},(err,count)=>{
        if(err){
            callback(err,null)
        }else{
            FeedCommentFeedback.aggregate([
                {
                    $skip:parseInt(startFrom)
                },
                {
                    $limit:limit
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "feedbackPostedBy",
                        foreignField: "_id",
                        as: "feedbackPostedBy"
                    }
                },
                {
                    $lookup: {
                        from: "mediatrackings",
                        localField: "commentId",
                        foreignField: "_id",
                        as: "commentDetails"
                    }
                },
                {
                    $lookup: {
                        from: "commentFeedback",
                        localField: "feedbackItemID",
                        foreignField: "_id",
                        as: "feedbackItemIDDetails"
                    }
                },
                {
                    $unwind:"$feedbackPostedBy"
                },
                {
                    $unwind:"$commentDetails"
                },
                {
                    $unwind:"$feedbackItemIDDetails"
                },
                {
                    $sort:{
                        createdDate:-1
                    }
                },
                {
                    $project:{
                        feedbackPostedBy:{
                            firstName:1,
                            lastName:1,
                            _id: 1,
                            email: 1,
                            username: 1,
                            osType: 1,
                            mobileNumber:1,
                            isCeleb:1,
                            isManager:1,
                            profession:1,
                            avtar_imgPath:1,
                            avtar_originalname:1
                        },
                        commentDetails:{
                            _id : 1, 
                            feedId : 1, 
                            memberId : 1, 
                            activities : 1, 
                            source : 1, 
                            status : 1, 
                            updatedBy : 1, 
                            createdBy : 1, 
                            updated_at : 1, 
                            created_at : 1
                        },
                        _id:1,
                        commentId : 1,
                        feedbackPostedBy : 1, 
                        feedbackItemID : 1, 
                        remark:1,
                        updatedDate : 1, 
                        createdDate :1,
                        feedbackItemIDDetails:1
                    }
                }
            ],(err,unfanUserObj)=>{
                if(err){
                    callback(err,null)
                }else{
                    unfanUserObj = unfanUserObj.map((unfanObj)=>{
                        unfanObj.createdAt =  unfanObj.createdDate;
                        return unfanObj
                    })
                    let data = {};
                    data.result = unfanUserObj
                    let total_pages = count/limit
                    let div = count%limit;
                    data.pagination ={
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null,data)
                }
            });
        }
    })
}

var feedCommentFeedbacServices = {
    postFeedbackOnComment:postFeedbackOnComment,
    updateFeedbackOnComment:updateFeedbackOnComment,
    getAllFeedbackOnCommentByFeedId:getAllFeedbackOnCommentByFeedId,
    getAllFeedbackOnCommentByCommentId:getAllFeedbackOnCommentByCommentId,
    getAllFeedbackOnComment:getAllFeedbackOnComment
}

module.exports = feedCommentFeedbacServices;
