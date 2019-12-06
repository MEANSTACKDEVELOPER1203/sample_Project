const PaymentTransaction = require("./paymentTransactionModel")


const getAll = (params, callback) => {
    let pageNo = parseInt(params.pageNo);
    let startFrom = params.limit * (pageNo - 1);
    let limit = parseInt(params.limit);

            PaymentTransaction.aggregate([
            { $match:  {"paymentStatus" : "Success" }},
            { $sort: { createdAt: -1 } },
            { $skip:parseInt(startFrom)},
            { $limit:parseInt(limit)},
          
             {
                $lookup: {
                    from: "users",
                    localField: "memberId",
                    foreignField: "_id",
                    as: "users" // to get all the views, comments, shares count
                }
            },
              { "$unwind": "$users" },
            {
                $project: {
                    packageRefId:1,
                    _id:1,
                    memberId:1,
                    refCartId:1,
                    paymentType:1,
                    paymentGateway:1,
                    celebId:1,
                    createdAt:1,
                    transactionRefId:1,
                    gstAmount:1,
                    actualAmount:1,
                    equivalentAmount:1,
                    creditValue:1,
                    paymentStatus:1,
                    userFirstName: "$users.firstName",
                    userLastName: "$users.lastName"
                }
            }
            
        ], (err, feedDetails) => {
            //console.log("feedDetails",feedDetails);
            if (err) {
                callback(err, null)
            } else {
                let data = {};
                data.result = feedDetails
                let count = feedDetails.length;
                //console.log("count",feedDetails);
                var totalCredits = 0;
                var totalGstValue = 0;
                var totalEquivalentAmount = 0;
               
                for(i=0;i<feedDetails.length;i++){
                    //console.log(feedDetails[i].creditValue);
                    totalCredits = totalCredits + feedDetails[i].creditValue;
                    totalGstValue = totalGstValue + feedDetails[i].gstAmount;
                    totalEquivalentAmount = totalEquivalentAmount + feedDetails[i].equivalentAmount;
                
                }
                //console.log("total",total)
                let total_pages = parseInt(count/limit);
                
                let div =  count/limit;
                //console.log("div",div)
                let total_pages1;
                if (div == 0){
                    total_pages1 = div+1
                }else if(div > total_pages){
                    total_pages1 = total_pages+1
                }
                    else
                total_pages1 = div
                data.pagination ={
                    "total_count": count,
                    "total_pages": total_pages1,
                    "current_page": pageNo,
                    "limit": limit,
                    "totalCredits":totalCredits,
                    "totalGstValue":totalGstValue,
                    "totalEquivalentAmount":totalEquivalentAmount  
                }
                callback(null,data)
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