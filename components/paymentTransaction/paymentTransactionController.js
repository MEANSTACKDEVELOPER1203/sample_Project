const PaymentTransactionServices = require("./paymentTransactionServices");
let creditServices = require('../credits/creditServices');
let ordersServices = require('../order/ordersServices');
let ObjectId = require('mongodb').ObjectId;
let gateway = require('../../lib/gateway');
let braintree = require('braintree');



const getAll = (req, res) => {
    PaymentTransactionServices.getAll(req.params, (err, allCreditObjects) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], message: err })
        } else {
            res.json({ success: 0, token: req.headers['x-access-token'], data: allCreditObjects })
        }
    })
}
/************************* start PAYPAL Intergrationj**********************************/
var TRANSACTION_SUCCESS_STATUSES = [
    braintree.Transaction.Status.Authorizing,
    braintree.Transaction.Status.Authorized,
    braintree.Transaction.Status.Settled,
    braintree.Transaction.Status.Settling,
    braintree.Transaction.Status.SettlementConfirmed,
    braintree.Transaction.Status.SettlementPending,
    braintree.Transaction.Status.SubmittedForSettlement
];

let generateClientToken = (req, res) => {
    // console.log(req.body)
    gateway.clientToken.generate({}, function (err, response) {
        //res.render('checkouts/new', {clientToken: response.clientToken, messages: req.flash('error')});
        if (err) {
            return res.status.json({ success: 0, message: "Errror while client create token" });
        } else {
            return res.status(200).json({ success: 1, data: response });
        }
    });
}

let createBraintreeMultiCurrency = (req, res) => {
    let arr = [1, 2, 3, 4, 5, 2, 6, 7, 3, 9, 7, 8];
    //let index = listOfFeedObj.findIndex(item => new Date(item.created_at).getTime() <= new Date(feedMappingObj.lastSeenFeedDate).getTime());
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
        let index = arr2.findIndex(item => (item == arr[i]))
        if (index == -1) {
            arr2.push(arr[i])
        }
        else {
            arr2.splice(arr[i])
        }
        console.log(index)
        // for (let j = 0; j < arr2.length; j++) {
        //     if (arr[i] != arr2[j]) {
        //         arr2.push(arr[i]);
        //     }
        // }
    }
    console.log(arr2)
    res.json({ success: 1 })
    // gateway.customer.create({
    //     firstName: "John",
    //     lastName: "Smith",
    //     company: "Indoz Techsol",
    //     email: "johan@indoztechsol.com.com",
    //     phone: "040-2360087",
    //     fax: "614.555.5678",
    //     website: "www.celebconnect.com"
    // }, function (err, result) {
    //     console.log(result)
    //     result.success;
    //     // true

    //     result.customer.id;
    //     // e.g. 494019
    // });
    // gateway.customer.find("632400731", function (err, customer) {
    //     if (err) {
    //         console.log(err.type); // "notFoundError"
    //         console.log(err.name); // "notFoundError"
    //         console.log(err.message); // "Not Found"
    //     } else {
    //         console.log(customer)
    //         console.log(customer.id);
    //     }
    // });
    // gateway.customer.delete("632400731", function (err, result) {
    //     console.log(err);
    //     console.log(result)
    //     // null
    // });
    // merchantAccessToken = req.body.accesstoken;
    // var gateway = braintree.connect({
    //     accessToken: merchantAccessToken
    // });
    // gateway.merchantAccount.createForCurrency({
    //     "currency": "AUD"
    // }, function (err, result) {
    //     console.log(result)
    //     console.log(err)
    //     if (result.success) {
    //         console.log(result.merchantAccount.currencyIsoCode);
    //     }
    // });
}

let checkout = (req, res) => {
    // console.log(req.body);
    PaymentTransactionServices.getPaymentTransactionById(ObjectId(req.body.orderId), (err, transactionObj) => {
        if (err) {
            return res.status(200).json({ success: 0, message: "Order Id not recieved", err })
        } else {
            let amount = req.body.amount;
            let nonce = req.body.payment_method_nonce;
            let orderId = req.body.orderId;
            let customerId = req.body.customerId;
            let merchantAccountId = ""; // When we add new currency in paypal. we need to add currency in  braintree, create current and marchent id shuold be also same (country code)
            if (req.body.countryCode == "INR")
                merchantAccountId = "INR"
            if (req.body.countryCode == "AUD")
                merchantAccountId = "proxim"
            if (req.body.countryCode == "USD")
                merchantAccountId = "USD"
            gateway.transaction.sale({
                amount: amount,
                paymentMethodNonce: nonce,
                orderId: orderId,
                merchantAccountId: merchantAccountId,
                options: {
                    submitForSettlement: true
                }
            }, (err, result) => {
                // console.log("RESULTS === ", result)
                if (result.success == true && result != undefined) {
                    creditServices.updateCreditValue({
                        memberId: customerId,
                        creditValue: transactionObj.creditValue,
                        paymentTranRefId: orderId,
                        creditType: "credit",
                    }, (err, updatedCreditObj) => {
                        if (err)
                            console.log(err)
                        else {
                            let paymentType = result.transaction.paypalAccount;
                            transactionRefId = paymentType.paymentId;
                            gatewayResponse = result.transaction.processorResponseText;
                            countryCode = result.transaction.currencyIsoCode;
                            paymentMode = "WALLET";
                            PaymentTransactionServices.updateCreditStatus(ObjectId(orderId), { transactionRefId: transactionRefId, gatewayResponse: gatewayResponse, status: true, creditUpdateStatus: true }, (err, updatePayTransactionObj) => {
                                if (err)
                                    console.log(err)
                                else {
                                    let orderBody = {
                                        memberId: customerId,
                                        orderType: "payment",
                                        refPaymentTransactionId: orderId,
                                        refCreditTransactionId: updatedCreditObj._id,
                                        refCartIds: [],
                                        paymentAmount: transactionObj.equivalentAmount,
                                        credits: transactionObj.creditValue,
                                        countryCode: countryCode,
                                        paymentMode: paymentMode,
                                    }
                                    ordersServices.saveOrder(orderBody, (err, orderObj) => {
                                        if (err)
                                            console.log(err)
                                        else {
                                            orderObj.orderInfo.cumulativeCreditValue = updatedCreditObj.cumulativeCreditValue;
                                            orderObj.orderInfo.referralCreditValue = updatedCreditObj.referralCreditValue;
                                            orderObj.orderInfo.paymentGateway = updatePayTransactionObj.paymentGateway;
                                            orderObj.orderInfo.gatewayResponse = updatePayTransactionObj.gatewayResponse;
                                            orderObj.orderInfo.ordersStatus = "completed";//orderObj.ordersStatus;
                                            orderObj.orderInfo.status = updatePayTransactionObj.status;
                                            orderObj.orderInfo.credits = updatePayTransactionObj.creditValue;
                                            orderObj.orderInfo.totalAmount = updatePayTransactionObj.equivalentAmount;
                                            orderObj.orderInfo.actualAmount = updatePayTransactionObj.actualAmount;
                                            orderObj.orderInfo.gstAmount = updatePayTransactionObj.gstAmount;
                                            orderObj.orderInfo.orderId = updatePayTransactionObj.transactionRefId;
                                            orderObj.orderInfo.transactionId = updatePayTransactionObj._id;
                                            orderObj.creditInfo = updatedCreditObj;
                                            return res.status(200).json({ token: req.headers['x-access-token'], success: 1, message: "orders saved successfully", data: orderObj });
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else if (result.success == false && result != undefined) {
                    // console.log("additionalProcessorResponse ===== ", result.transaction.additionalProcessorResponse)
                    if (result.transaction.additionalProcessorResponse == "2046 : PAYMENT_NOT_APPROVED_FOR_EXECUTION") {
                        return res.status(200).json({ success: 0, message: "PAYMENT_NOT_APPROVED_FOR_EXECUTION" });
                    }
                    if (result.transaction.additionalProcessorResponse == "2091 : CURRENCY_MISMATCH") {
                        return res.status(200).json({ success: 0, message: "CURRENCY_MISMATCH" });
                    }

                }
                else {
                    return res.status(404).json({ success: 0, message: "payment failed", err });
                }
            });
        }
    })
}

/************************* End PAYPAL Intergrationj**********************************/

module.exports = {
    getAll: getAll,
    generateClientToken: generateClientToken,
    createBraintreeMultiCurrency: createBraintreeMultiCurrency,
    checkout: checkout
}