let Chat = require('../../models/chat');
let ObjectId = require('mongodb').ObjectId;

let findChatsByCurrentMember = function (memberId, listOfChatRoomId, callback) {
    //console.log("**************************************", memberId);
    //console.log("**************************************", listOfChatRoomId);
    // Chat.find({ chatRoomId: { $in: listOfChatRoomId } }, (err, listOfChatsObj) => {
    //     if (!err)
    //         callback(null, listOfChatsObj);
    //     else
    //         callback(err, null)
    // }).sort({ createdAt: 1 })
    Chat.aggregate([
        {
            $match: { chatRoomId: { $in: listOfChatRoomId } }
        },
        { $sort: { createdAt: -1 } },
        {
            $group:
            {
                _id: "$chatRoomId",
                chatRoomId: { $first: "$chatRoomId" },
                senderId: { $first: "$senderId" },
                receiverId: { $first: "$receiverId" },
                message: { $first: "$message" },
                chatStatus: { $first: "$chatStatus" },
                createdAt: { $first: "$createdAt" },
                isRead: { $first: "$isRead" },
                messageStatus: { $first: "$messageStatus" },
            }
        },
        //   { "$group": {
        //     "_id": "$isRead",
        //     "count": { "$sum": 1 }
        //   }
        // },
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiverInfo"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderInfo"
            }
        },
        { "$unwind": "$receiverInfo" },
        { "$unwind": "$senderInfo" },
        {
            $project: {
                _id: 1,
                senderId: 1,
                receiverId: 1,
                message: 1,
                createdAt: 1,
                chatStatus: 1,
                isRead: 1,
                messageStatus: 1,
                "receiverInfo._id": 1,
                "receiverInfo.avtar_imgPath": 1,
                "receiverInfo.firstName": 1,
                "receiverInfo.lastName": 1,
                "receiverInfo.isCeleb": 1,
                "receiverInfo.aboutMe": 1,
                "receiverInfo.profession": 1,
                "receiverInfo.isOnline": 1,
                "receiverInfo.role": 1,
                "senderInfo._id": 1,
                "senderInfo.avtar_imgPath": 1,
                "senderInfo.firstName": 1,
                "senderInfo.lastName": 1,
                "senderInfo.isCeleb": 1,
                "senderInfo.aboutMe": 1,
                "senderInfo.profession": 1,
                "senderInfo.isOnline": 1,
                "senderInfo.role": 1
            }
        },
        // {
        //     $lookup:{
        //         from:"memberpreferences",
        //         localField:"memberId",
        //         foreignField:"senderInfo._id",
        //         as:"senderInfoFan"

        //     },
        //     $lookup:{
        //         from:"memberpreferences",
        //         localField:"memberId",
        //         foreignField:"receiverInfo._id",
        //         as:"receiverInfoFan"

        //     }
        // },

        //{ $sort: { createdAt: -1 } },

    ], function (err, listOfChatsObj) {
        if (!err) {
            //console.log(listOfChatsObj);
            callback(null, listOfChatsObj);
        }
        else
            callback(err, null)
    });
}

let findAllChatMessages = function (query, callback) {
    //console.log(query);
    if(parseInt(query.limit) < 0)
        query.limit = 1000
    let executeQuery;
    if (query.paginationDate == "0") {
        executeQuery = {
            //senderId: query.senderId, receiverId: query.receiverId, chatStatus: "Active" \
            // $and:[{senderId: query.senderId},{receiverId: query.receiverId}],
            // $or:[{senderId: query.receiverId},{receiverId: query.senderId}]
            // senderId:query.senderId, $or:[{receiverId:query.senderId}], 
            // $and:[{senderId:query.receiverId}, {$or:[{receiverId:query.receiverId}]}] 

            $and: [
                { $or: [{ senderId: query.senderId }, { receiverId: query.senderId }] },
                { $or: [{ senderId: query.receiverId }, { receiverId: query.receiverId }] },
                { chatStatus: "Active" }
            ]
        }
    } else {
        executeQuery = {
            //senderId: query.senderId, receiverId: query.receiverId, chatStatus: "Active", createdAt: { $lt: new Date(query.paginationDate) } 
            // senderId:query.senderId, $or:[{receiverId:query.senderId}], 
            // $and:[{senderId:query.receiverId}, {$or:[{receiverId:query.receiverId}]}]
            $and: [
                { $or: [{ senderId: query.senderId }, { receiverId: query.senderId }] },
                { $or: [{ senderId: query.receiverId }, { receiverId: query.receiverId }] },
                { chatStatus: "Active" },
                { createdAt: { $lt: new Date(query.paginationDate) } }
            ]
        }
    }

    //use lookup
    Chat.find(executeQuery, (err, listOfChatMessagesObj) => {
        if (!err)
            callback(null, listOfChatMessagesObj);
        else
            callback(err, null);
    }).sort({ createdAt: -1 }).limit(parseInt(query.limit));

}


var findAllChatRoomForCurrentMember = function (memberId, callback) {
    //{ senderId: ObjectId(memberId), receiverId: ObjectId(memberId), chatStatus:"Active" }
    // Chat.aggregate([
    //     // {
    //     //     $match: { senderId: ObjectId(memberId), receiverId: ObjectId(memberId), chatStatus: "Active" }
    //     // },
    //     {
    //         $match: {
    //             //receiverId: ObjectId(memberId), senderId: ObjectId(memberId)
    //             $or: [{ receiverId: ObjectId(memberId) }, { senderId: ObjectId(memberId) }, { chatStatus: "Active" }]
    //         }
    //     },
    //     {
    //         $sort: { createdAt: -1 }
    //     },
    //     // {
    //     //     $group: {
    //     //         _id: { chatRoomId: "$chatRoomId" }
    //     //     }
    //     // }
    //     {$group: {
    //         _id: {chatRoomId: "$chatRoomId"},
    //         uniqueIds: {$addToSet: "$chatRoomId"},
    //         count: {$sum: 1}
    //         }
    //     },
    // ], function (err, listOfChatRoomId) {
    //     if (!err)
    //         callback(null, listOfChatRoomId);
    //     else
    //         callback(err, null)
    // })
    Chat.distinct("chatRoomId", { $or: [{ receiverId: ObjectId(memberId) }, { senderId: ObjectId(memberId) }], chatStatus: "Active" }, (err, listOfChatRoomId) => {
        if (!err) {
            listOfChatRoomId = listOfChatRoomId.filter(Boolean);
            callback(null, listOfChatRoomId);
        }
        else
            callback(err, null)
    });
}

var findLatestChatMessagesByReceiverId = function (chatId, callback) {
    Chat.aggregate([
        {
            $match: { _id: ObjectId(chatId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiverInfo"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderInfo"
            }
        },
        { "$unwind": "$receiverInfo" },
        { "$unwind": "$senderInfo" },
        {
            $project: {
                _id: 1,
                senderId: 1,
                receiverId: 1,
                chatRoomId: 1,
                message: 1,
                createdAt: 1,
                chatStatus: 1,
                isRead: 1,
                "receiverInfo._id": 1,
                "receiverInfo.avtar_imgPath": 1,
                "receiverInfo.firstName": 1,
                "receiverInfo.lastName": 1,
                "receiverInfo.isCeleb": 1,
                "senderInfo._id": 1,
                "senderInfo.avtar_imgPath": 1,
                "senderInfo.firstName": 1,
                "senderInfo.lastName": 1,
                "senderInfo.isCeleb": 1,
            }
        },

    ], function (err, latestMsgObj) {
        if (!err)
            callback(null, latestMsgObj[0]);
        else
            callback(err, null)
    })
    // Chat.find({ receiverId: ObjectId(receiverId), chatStatus: "Active" }, (err, latestMsgObj) => {
    //     if (!err)
    //         callback(null, latestMsgObj[0]);
    //     else
    //         callback(err, null)
    // }).sort({ createdAt: -1 }).limit(1);

}


var countNumberOfTodayMessage = function (query, callback) {
    // var now = new Date();
    // console.log("********* Current time *************", now);
    // let startDate = new Date(new Date().setHours(00, 00, 00));
    // let endDate = new Date(new Date().setHours(23, 59, 59));
    // console.log("********* endDate *************", startDate)
    // console.log("********* endDate *************", endDate)
    //createdAt: { $gte: startDate, $lt: endDate }
    //let query = { senderId: ObjectId(senderId),  };
    Chat.count(query, (err, todayChatMessageRecords) => {
        if (!err)
            callback(null, todayChatMessageRecords);
        else
            callback(err, null)
        //   let creditCharge = req.body.numberOfMessages;
        //   creditCharge = parseInt(creditCharge);
        //   if (todayChatMessageRecords == 0 && creditCharge <= 1)
        //     console.log("********** records ******************", todayChatMessageRecords)
        //   res.send("Testing testing Date");
    });
}

var saveMessage = function (messageObj, callback) {
    var chatInfo = new Chat({
        senderId: messageObj.senderId,
        receiverId: messageObj.receiverId,
        //sTransactionId: messageObj.chatRoomId,
        credits: messageObj.credits,
        message: messageObj.message,
        chatRoomId: messageObj.chatRoomId,
        isRead: false,
        chatStatus: "Active",
        messageStatus: messageObj.messageStatus,
        messageDeliveredDate: messageObj.messageDeliveredDate,
        messageSentDate: messageObj.messageSentDate
    });
    Chat.create(chatInfo, (err, createdMessageObj) => {
        if (!err)
            callback(null, createdMessageObj);
        else
            callback(err, null)
    })
}

var findMessageById = function (messageId, callback) {
    Chat.findById(ObjectId(messageId), (err, messageObj) => {
        if (!err)
            callback(null, messageObj)
        else
            callback(err, null)
    })
}


function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}









var getUnreadMessageCount = function(memberId,callback){
    Chat.aggregate([
        {
            $match:{
                receiverId:memberId,
                isRead:false
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiverInfo"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderInfo"
            }
        },
        { "$unwind": "$receiverInfo" },
        { "$unwind": "$senderInfo" },
        {
            $group:{
                    _id:"$senderInfo",
                    messages:{ $push: "$$ROOT" }
            }
        },
        {
            $project:{
                _id:{
                    firstName: 1,
                    lastName: 1,
                    isCeleb:1
                },
                messages:{
                    message:1,
                    createdAt:1
                },
                last: { $arrayElemAt: [ "$messages", 0 ] },
            }
        },{
            $sort:{
                "last.createdAt":-1
            }
        },
        {
            $project:{
                _id:{
                    firstName: 1,
                    lastName: 1,
                    isCeleb:1
                },
                messages:{
                    message:1,
                    createdAt:1
                },
                last: { 
                    message:1,
                    createdAt:1
                 },
                numberOfMessages: { $cond: { if: { $isArray: "$messages" }, then: { $size: "$messages" }, else: "0"} }
            }
        }
    ],(err,data)=>{
        let unSeenMessageCount = 0
        data.forEach(function(chat){
            unSeenMessageCount = unSeenMessageCount + chat.numberOfMessages
        })
        let chatAndMesssages = {chatCount:data.length,unSeenMessageCount:unSeenMessageCount}
        if(err)
        {
            callback(err,null)
        }else{
            callback(null,chatAndMesssages)
        }
    })   
}




let chatServices = {
    getUnreadMessageCount:getUnreadMessageCount,
    findChatsByCurrentMember: findChatsByCurrentMember,
    findAllChatMessages: findAllChatMessages,
    findLatestChatMessagesByReceiverId: findLatestChatMessagesByReceiverId,
    findAllChatRoomForCurrentMember: findAllChatRoomForCurrentMember,
    countNumberOfTodayMessage: countNumberOfTodayMessage,
    saveMessage: saveMessage,
    findMessageById: findMessageById
}




module.exports = chatServices;