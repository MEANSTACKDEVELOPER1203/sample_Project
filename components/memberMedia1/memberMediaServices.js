let MemberMedia = require('./memberMediaModel');
let ObjectId = require('mongodb').ObjectId;

let findMemberMedia = function (query, callback) {
    MemberMedia.aggregate([
        {
            $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
        },
        { $unwind: '$media' },
        {
            $match: { "media.createdAt": { $lt: new Date(query.paginationDate) } }
        },
        {
            $match: { "media.mediaType": { $in: [query.mediaType] } }
        },
        { $sort: { "media.createdAt": -1 } },
        { $limit: 20 },
        {
            "$group": {
                "_id": "$_id",
                memberId: { $first: "$memberId" },
                createdAt: { $first: "$createdAt" },
                media: { "$push": "$media" }
            }
        }
    ], function (err, memberMediaObj) {
        if (err)
            callback(err, null)
        else if (memberMediaObj.length <= 0)
            callback(null, memberMediaObj)
        else
            callback(null, memberMediaObj[0])
    });
}

let findMemberMediaPreAndNext = function (query, callback) {
    if (query.previous == true) {
        console.log("*************** PREVIOUS      **********************")
        MemberMedia.aggregate([
            {
                $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
            },
            { $unwind: '$media' },
            {
                $match: { "media.createdAt": { $lt: new Date(query.paginationDate) } }
            },
            {
                $match: { "media.mediaType": { $in: [query.mediaType] } }
            },
            { $sort: { "media.createdAt": -1 } },
            { $limit: 10 },
            {
                "$group": {
                    "_id": "$_id",
                    memberId: { $first: "$memberId" },
                    createdAt: { $first: "$createdAt" },
                    media: { "$push": "$media" }
                }
            },
            { $sort: { "media.createdAt": 1 } },
        ], function (err, preMemberMediaObj) {
            if (err)
                callback(err, null)
            else if (preMemberMediaObj.length <= 0)
                callback(null, preMemberMediaObj);
            else
                callback(null, preMemberMediaObj[0])
        })
    } else {
        console.log("*************** NEXT      **********************", query)
        MemberMedia.aggregate([
            {
                $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
            },
            { $unwind: '$media' },
            {
                $match: { "media.createdAt": { $gt: new Date(query.paginationDate) } }
            },
            {
                $match: { "media.mediaType": { $in: [query.mediaType] } }
            },
            { $limit: 10 },
            { $sort: { "media.createdAt": -1 } },
            {
                "$group": {
                    "_id": "$_id",
                    memberId: { $first: "$memberId" },
                    createdAt: { $first: "$createdAt" },
                    media: { "$push": "$media" }
                }
            },
            
        ], function (err, nextMemberMediaObj) {
            if (err)
                callback(err, null)
            else if (nextMemberMediaObj.length <= 0)
                callback(null, nextMemberMediaObj);
            else
                callback(null, nextMemberMediaObj[0])
        })
    }

    // MemberMedia.aggregate([
    //     {
    //         $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
    //     },
    //     { $unwind: '$media' },
    //     {
    //         $match: { "media.createdAt": { $lte: new Date(query.paginationDate) } }
    //     },
    //     {
    //         $match: { "media.mediaType": { $in: [query.mediaType] } }
    //     },
    //     { $sort: { "media.createdAt": -1 } },
    //     { $limit: 5 },
    //     {
    //         "$group": {
    //             "_id": "$_id",
    //             memberId: { $first: "$memberId" },
    //             createdAt: { $first: "$createdAt" },
    //             media: { "$push": "$media" }
    //         }
    //     }
    // ], function (err, preMemberMediaObj) {
    //     if (err)
    //         callback(err, null)
    //     else {
    //         MemberMedia.aggregate([
    //             {
    //                 $match: { $and: [{ memberId: ObjectId(query.memberId) }] }
    //             },
    //             { $unwind: '$media' },
    //             {
    //                 $match: { "media.createdAt": { $gt: new Date(query.paginationDate) } }
    //             },
    //             {
    //                 $match: { "media.mediaType": { $in: [query.mediaType] } }
    //             },
    //             { $sort: { "media.createdAt": -1 } },
    //             { $limit: 5 },
    //             {
    //                 "$group": {
    //                     "_id": "$_id",
    //                     memberId: { $first: "$memberId" },
    //                     createdAt: { $first: "$createdAt" },
    //                     media: { "$push": "$media" }
    //                 }
    //             }
    //         ], function (err, nextMemberMediaObj) {
    //             if (err)
    //                 callback(err, null)
    //             else {
    //                 preMemberMediaObj.push(...nextMemberMediaObj);
    //                 //listOfFeedObj.push(...listOfFeedByMemberPreferenceObj)
    //                 callback(null, preMemberMediaObj)
    //             }
    //         })

    //     }

    // })
}

let memberMediaServices = {
    findMemberMedia: findMemberMedia,
    findMemberMediaPreAndNext: findMemberMediaPreAndNext
}

module.exports = memberMediaServices