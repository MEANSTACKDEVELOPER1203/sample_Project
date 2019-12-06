const ServiceTransactionServices = require("./serviceTransactionServices");
let memberPreferenceServices = require('../memberpreferences/memberPreferenceServices')

const getAll = (req, res) => {
    ServiceTransactionServices.getAll(req.params, (err, data) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: err })
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: data })
        }
    })
}

let getMissedCallCount = (req, res) => {
    let memberId = req.params.member_Id;
    ServiceTransactionServices.findMissedCallCount(memberId, (err, missedCallCount) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the missed call count ", err });
        } else {
            return res.status(200).json({ count: missedCallCount });
        }
    })
}


module.exports = {
    getAll: getAll,
    getMissedCallCount: getMissedCallCount,
}