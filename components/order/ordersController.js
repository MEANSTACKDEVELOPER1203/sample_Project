const OrdersServices = require("./ordersServices")

const getOrdersByMemberId = (req, res) => {
    OrdersServices.getOrdersByMemberId(req.params.memberId, req.params.createdAt, req.params.limit, (err, orders) => {
        if (err) {
            res.json({ success: 0, error: "No data found!" });
        } else {
            res.json({ success: 1, data: orders });
        }
    })
}

const getAll = (req, res) => {
    OrdersServices.getAll(req.params, (err, orders) => {
        if (err) {
            res.json({ success: 0, error: "No data found!" });
        } else {
            res.json({ success: 1, data: orders });
        }
    })
}

let createOrders = (req, res) => {
    // console.log("############## createOrders###############################")
    // console.log(req.body)
    // console.log("############### createOrders ##############################")
    OrdersServices.saveOrder(req.body, (err, orderObj) => {
        if (err) {
            return res.json({ token: req.headers['x-access-token'], success: 0, message: err })
        } else {
            OrdersServices.getCreditDetails(req.body.refPaymentTransactionId, (err, creditObj) => {
                if (err) {
                    return res.json({ token: req.headers['x-access-token'], success: 0, message: err })
                } else {
                    OrdersServices.getPaymentTransactionById(req.body.refPaymentTransactionId, (err, paymentTransactionObj) => {
                        if (err) {
                            return res.json({ token: req.headers['x-access-token'], success: 0, message: err })
                        } else {
                            orderObj.orderInfo.cumulativeCreditValue = creditObj.cumulativeCreditValue;
                            orderObj.orderInfo.referralCreditValue = creditObj.referralCreditValue;
                            orderObj.orderInfo.paymentGateway = paymentTransactionObj.paymentGateway;
                            orderObj.orderInfo.gatewayResponse = paymentTransactionObj.gatewayResponse;
                            orderObj.orderInfo.ordersStatus = orderObj.ordersStatus;
                            orderObj.orderInfo.status = paymentTransactionObj.status;
                            orderObj.orderInfo.credits = paymentTransactionObj.creditValue;
                            orderObj.orderInfo.totalAmount = paymentTransactionObj.equivalentAmount;
                            orderObj.orderInfo.actualAmount = paymentTransactionObj.actualAmount;
                            orderObj.orderInfo.gstAmount = paymentTransactionObj.gstAmount;
                            orderObj.orderInfo.orderId = paymentTransactionObj.transactionRefId;
                            orderObj.orderInfo.transactionId = paymentTransactionObj._id;
                            orderObj.creditInfo = creditObj;
                            // console.log("Order response: ============ : ", orderObj)
                            res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "orders saved successfully", data: orderObj })
                        }
                    })
                }
            })
        }
    });
}

module.exports = {
    getOrdersByMemberId: getOrdersByMemberId,
    getAll: getAll,
    createOrders: createOrders
}