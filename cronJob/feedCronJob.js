const FeedModel = require('../models/feeddata');
const Cron = require('node-cron');
const FeedService = require('../routes/feeddata')
var x = [];

//  # ┌────────────── second (optional)
//  # │ ┌──────────── minute
//  # │ │ ┌────────── hour
//  # │ │ │ ┌──────── day of month
//  # │ │ │ │ ┌────── month
//  # │ │ │ │ │ ┌──── day of week
//  # │ │ │ │ │ │
//  # │ │ │ │ │ │
//  # * * * * * *

// field	value
// second	0-59
// minute	0-59
// hour	    0-23
// day of month	1-31
// month	1-12 (or names)
// day of week	0-7 (or names, 0 or 7 are sunday)

Cron.schedule('58 49 15 * * *', () => {
    let now = new Date();
    now.setDate(now.getDate() - 1);
    // console.log(now)
    // console.log('running a task every minute');
    FeedModel.find({isDelete:true,created_at:{$gte:now}},(err,feeds)=>{
        if(err){
            console.log(err)
        }
        else{
            feeds.forEach((feedDetials)=>{
                Feed.aggregate([
                    {
                      $match:{
                        _id:feedDetials._id
                      }
                    },
                    {
                      $lookup:{
                        from: "mediatrackings",
                        localField: "_id",
                        foreignField: "feedId",
                        as: "feedLike"
                      }
                    },
                    {
                      $project:{
                        _id:1,
                        feedLike:1
                      }
                    }
                  ],(err,feedDetails)=>{
                    if(err)
                    {
                      res.json({success:0,token:req.headers['x-access-token'],message:err});
                    }else{
                      if(feedDetails.length)
                      {
                        let likedArray = feedDetails[0].feedLike.map((feedLikeObj)=>{
                          if(feedLikeObj.isLike)
                            return ObjectId(feedLikeObj.memberId);
                        })
                        let randomNumber = Math.floor(Math.random() * 100) + 30
                        User.aggregate([ 
                          {
                            $match:{
                              IsDeleted:false,
                              dua : true,
                              _id:{$nin:likedArray}
                            }
                          },
                          { 
                            $sample: 
                            { 
                              size:  randomNumber
                            } 
                          },
                          {
                            $project:{
                              _id:1,
                              email:1
                            }
                          }],(err,usersList)=>{
                            let insertManyLike = usersList.map((userde)=>{
                              user = {
                                "feedId" : req.body.feedId, 
                                "memberId" : userde._id, 
                                "isLike" : true, 
                                "activities" : "views", 
                                "status" : "Active", 
                                "updatedBy" : "Admin", 
                                "createdBy" : "Admin"
                              }
                              return user;
                            })
                            mediaTracking.insertMany(insertManyLike,(err,likedArray)=>{
                              if(err)
                              {
                                console.log(err)
                              }
                              else{
                                FeedService.updateLoginTime(usersList)
                              } 
                            })
                        });
                        // User.find({
                        //   IsDeleted:false,
                        //   dua : true,
                        //   _id:{$nin:likedArray}
                        // },{_id:1,email:1},(err,usersList)=>{
                        //   if(err)
                        //   {
                        //       console.log(err)
                        //   }
                        //   else{
                        //     let insertManyLike = usersList.map((userde)=>{
                        //       user = {
                        //         "feedId" : req.body.feedId, 
                        //         "memberId" : userde._id, 
                        //         "isLike" : true, 
                        //         "activities" : "views", 
                        //         "status" : "Active", 
                        //         "updatedBy" : "Admin", 
                        //         "createdBy" : "Admin"
                        //       }
                        //       return user;
                        //     })
                        //     mediaTracking.insertMany(insertManyLike,(err,likedArray)=>{
                        //       if(err)
                        //       {
                        //         console.log(err)
                        //       }
                        //       else{
                        //         FeedService.updateLoginTime(usersList)
                        //       } 
                        //     })
                        //   }
                        // }).limit(randomNumber)
                      }
                      else{
                        console.log("feedDetails not found")
                      }
                    }
                  })
            })
        }
    })
});


// Cron.schedule("1 28 * * * *",()=>{
//   var currentTime = new Date();
//   var lastHour= currentTime.setHours(currentTime.getHours()-1);
//   console.log(lastHour)
//   FeedModel.update({$and:[{created_at:{ $lte: currentTime }},
//     {created_at:{ $gte: lastHour }},
//     {isDelete:true},
//     {isDraftMode:true}]},{$set:{
//       isDelete:false,
//       isDraftMode:false
//     }},(err,data)=>{
//       if(err)
//       {
//         console.log(err)
//       }else{
//         console.log(data)
//       }
//   })
// })
