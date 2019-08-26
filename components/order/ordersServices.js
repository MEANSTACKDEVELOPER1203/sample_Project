const Orders = require("./ordersModel");
const ObjectId = require("mongodb").ObjectID;
let creditServices = require('../credits/creditServices');
let paymentTransactionServices = require('../paymentTransaction/paymentTransactionServices');
let packageCollectionServices = require('../packageCollection/packageCollectionServices');

const getOrdersByMemberId = (memberId, createdAt, limit, callback) => {
    memberId = ObjectId(memberId);
    let getOrdersByTime = createdAt;
    limit = parseInt(limit);
    if (createdAt == null || createdAt == "null") {
        getOrdersByTime = new Date();
    }
    Orders.aggregate([
        {
            $match: {
                memberId: memberId,
                createdAt: { $lt: new Date(getOrdersByTime) }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: limit
        }
    ], (err, Orders) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, Orders)
        }
    })
}

const getAll = (params, callback) => {
    let pageNo = parseInt(params.pageNo);
    let startFrom = params.limit * (pageNo - 1);
    let limit = parseInt(params.limit);
    Orders.count({}, (err, count) => {
        if (err) {
            callback(err, null)
        } else {
            Orders.aggregate([
                {
                    $skip: parseInt(startFrom)
                },
                {
                    $limit: limit
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: limit
                }
            ], (err, Orders) => {
                if (err) {
                    callback(err, null)
                } else {
                    let data = {};
                    data.result = Orders
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
            })
        }
    })
}

let saveOrder = function (body, callback) {
    let memberId = body.memberId;
    let orderType = body.orderType;
    let refCreditTransactionId = body.refCreditTransactionId;
    let refPaymentTransactionId = body.refPaymentTransactionId;
    let refCartIds = body.refCartIds;
    let paymentAmount = body.paymentAmount;
    let credits = body.credits;
    let paymentMode = body.paymentMode;
    let createdBy = body.createdBy;
    let countryCode = body.countryCode;

    let d = new Date();
    let newOrderId = "C" + (memberId.substring(1, 4)).toUpperCase() + d.getFullYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds();
    let newOrders = new Orders({
        memberId: memberId,
        orderId: newOrderId,
        orderType: orderType,
        refCreditTransactionId: refCreditTransactionId,
        refPaymentTransactionId: refPaymentTransactionId,
        refCartIds: refCartIds,
        paymentAmount: paymentAmount,
        credits: credits,
        paymentMode: paymentMode,
        createdBy: createdBy
    });
    Orders.create(newOrders, (err, orderObj) => {
        if (err) {
            callback(err, null)
        }
        else {
            data = {};
            // data.orderInfo1 = orderObj;
            // callback(null, orderObj)
            // getCreditDetails(ObjectId(refCreditTransactionIdTEMP), (err, creditObj) => {
            //     console.log("Credit details", creditObj)
            //     if (err) {
            //         callback(err, null)
            //     } else {

            //         getPaymentTransactionById(ObjectId(refCreditTransactionIdTEMP), (err, paymentTransactionObj) => {
            //             if (err)
            //                 callback(err, null);
            //             else {
            //                 console.log("payment details", paymentTransactionObj)
                            // data.paymentTransactionInfo = paymentTransactionObj;
                            getGSTByCountryCode(countryCode, (err, gstObj) => {
                                if (err)
                                    callback(err)
                                else {
                                    // console.log("GST details", gstObj)
                                    // data.gstInfo = gstObj;
                                    data.orderInfo = {
                                        memberId: orderObj.memberId,
                                        // orderId: paymentTransactionObj.transactionRefId,
                                        // transactionId: paymentTransactionObj._id,
                                        createdAt: orderObj.createdAt,
                                        // credits: paymentTransactionObj.creditValue,
                                        // totalAmount: paymentTransactionObj.equivalentAmount,
                                        // actualAmount: paymentTransactionObj.actualAmount,
                                        // gstAmount: paymentTransactionObj.gstAmount,
                                        gst: gstObj.gst,
                                        currencySymbol: gstObj.currencySymbol,
                                        currencyType: gstObj.currencyType,
                                        // cumulativeCreditValue: creditObj.cumulativeCreditValue,
                                        // referralCreditValue: creditObj.referralCreditValue,
                                        // paymentGateway: paymentTransactionObj.paymentGateway,
                                        // gatewayResponse: paymentTransactionObj.gatewayResponse,
                                        // ordersStatus: orderObj.ordersStatus,
                                        // status: paymentTransactionObj.status,
                                        paymentMode: orderObj.paymentMode

                                    };
                                    // data.creditInfo = creditObj;
                                    callback(null, data)
                                }
                            })

            //             }
            //         });
            //     }
            // });
        }//above
    });
}
let getGSTByCountryCode = (countryCode, callback) => {
    packageCollectionServices.findGSTRateByCountry(countryCode, (err, gstObj) => {
        if (err)
            callback(err, null);
        else
            callback(null, gstObj)
    })
}

let getCreditDetails = (id, callback) => {
    creditServices.getCreditBalanceByTransactionId(id, (err, creditObj) => {
        if (err)
            callback(err, null)
        else
            callback(null, creditObj);
    });
}

let getPaymentTransactionById = (id, callback) => {
    paymentTransactionServices.getPaymentTransactionById(id, (err, paymentTransactionObj) => {
        if (err)
            callback(err, null)
        else
            callback(null, paymentTransactionObj)
    })
}

module.exports = {
    getOrdersByMemberId: getOrdersByMemberId,
    getAll: getAll,
    saveOrder: saveOrder,
    getCreditDetails:getCreditDetails,
    getPaymentTransactionById:getPaymentTransactionById
}