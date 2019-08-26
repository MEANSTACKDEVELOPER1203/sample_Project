let memberMediaServices = require('./memberMediaServices');
let User = require('../users/userModel');
let ObjectId = require('mongodb').ObjectId;

let getMemberMedia = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let mediaType = (req.params.media_Type) ? req.params.media_Type : '';
    let paginationDate = (req.params.pagination_Date) ? req.params.pagination_Date : '';
    let query = {};
    if (paginationDate == "0") {
        paginationDate = new Date();
    }
    query.memberId = memberId;
    query.mediaType = mediaType;
    query.paginationDate = paginationDate;
    User.findOne({ "_id": ObjectId(memberId) }, (err, userObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the memeber details", err })
        } else {
            memberMediaServices.findMemberMedia(query, (err, memberMediaObj) => {
                if (err) {
                    return res.status(404).json({ success: 0, message: "Error while fetching the memeber media", err })
                }
                else if (memberMediaObj.length <= 0 && userObj.isCeleb == true) {
                    return res.status(200).json({ success: 1, data: { userDetails: userObj, memberMedia: {} } });
                } else if (userObj.isCeleb == false) {
                    return res.status(200).json({ success: 1, token: req.headers['x-access-token'], data: { userDetails: userObj, memberMedia: {} } });
                }
                else {
                    return res.status(200).json({ success: 1, token: req.headers['x-access-token'], data: { userDetails: userObj, memberMedia: memberMediaObj } })
                }
            })
        }
    });
}
let getMemberMediaWithPreAndNext = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let mediaType = (req.params.media_Type) ? req.params.media_Type : '';
    let preAndNext = (req.params.pre_next) ? req.params.pre_next : '';
    let paginationDate = (req.params.pagination_Date) ? req.params.pagination_Date : '';
    let query = {};
    let previous = false;
    let next = false;
    if (preAndNext == "-1") {
        previous = true
    } else {
        next = true
    }
    if (paginationDate == "0") {
        paginationDate = new Date();
    }
    query.memberId = memberId;
    query.mediaType = mediaType;
    query.previous = previous;
    query.next = next;
    query.paginationDate = paginationDate;
    //console.log(query)
    memberMediaServices.findMemberMediaPreAndNext(query, (err, memberMediaObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the memeber media", err })
        } else if (memberMediaObj.length <= 0) {
            return res.status(200).json({ success: 1, data: {} });
        } else {
            return res.status(200).json({ success: 1, data: memberMediaObj })
        }
    })
}

let memberMediaController = {
    getMemberMedia: getMemberMedia,
    getMemberMediaWithPreAndNext: getMemberMediaWithPreAndNext
}

module.exports = memberMediaController