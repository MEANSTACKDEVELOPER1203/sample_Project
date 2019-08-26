const PaymentTransaction = require("./paymentTransactionModel")


const getAll = (params, callback) => {
    let pageNo = parseInt(params.pageNo);
    let startFrom = params.limit * (pageNo - 1);
    let limit = parseInt(params.limit);
    PaymentTransaction.count({}, (err, count) => {
        if (err) {
            callback(err, null)
        }
        else {
            PaymentTransaction.find({}, (err, result) => {
                if (err) {
                    callback(err, null)
                }
                else {
                    let data = {};
                    data.result = result
                    let total_pages = count / limit
                    let div = count % limit;
                    data.pagination = {
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages) + 1,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null, data)
                }
            }).skip(startFrom).limit(limit).sort({ createdAt: -1 }).limit(limit);
        }
    })
}

let updateCreditStatus = function (paymentTransactionId, transactionOnj, callback) {
    PaymentTransaction.findByIdAndUpdate(paymentTransactionId, { $set: transactionOnj }, { new: true }, (err, updatedObj) => {
        if (!err)
            callback(null, updatedObj)
        else
            callback(err, null)
    })
}

let getPaymentTransactionById = (id, callback) => {
    PaymentTransaction.findById(id, (err, paymentTransactionObj) => {
        if (err)
            callback(err, null);
        else
            callback(null, paymentTransactionObj)
    })
}

module.exports = {
    getAll: getAll,
    updateCreditStatus: updateCreditStatus,
    getPaymentTransactionById: getPaymentTransactionById
}