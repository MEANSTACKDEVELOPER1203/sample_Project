let ObjectId = require('mongodb').ObjectId;
const PackageCollectionServices = require("./packageCollectionServices");
let creditServices = require('../credits/creditServices');
let referralCodeService = require('../referralCode/referralCodeService');

const getAll = (req, res) => {
    PackageCollectionServices.getAll(req.params, (err, orders) => {
        if (err) {
            res.json({ success: 0, token: req.headers['x-access-token'], error: "No data found!" });
        } else {
            res.json({ success: 1, token: req.headers['x-access-token'], data: orders });
        }
    })
}
let getDefaultCreditPackage = (req, res) => {
    let memberId = (req.params.member_Id) ? req.params.member_Id : '';
    let country = (req.params.country) ? req.params.country : '';
    creditServices.getCreditBalance(ObjectId(memberId), (err, creditObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching member credit details." })
        } else {
            creditObj.referralCreditValue = creditObj.referralCreditValue + creditObj.memberReferCreditValue;
            referralCodeService.getReferalCode(ObjectId(memberId), (err, referalCodeObj) => {
                if (err) {
                    return res.status(404).json({ success: 0, message: "Error while fetching member referal code details." })
                } else {
                    PackageCollectionServices.getPackageByCountry(country, (err, creditPackageObj) => {
                        if (err) {
                            return res.status(404).json({ success: 0, message: "Error while fetching credit package." })
                        } else {
                            PackageCollectionServices.getCurrencyTypeByCountry(country, (err, currencyTypeObj) => {
                                if (err) {
                                    return res.status(404).json({ success: 0, message: "Error while fetching credit package." })
                                } else {
                                    return res.status(200).json({ success: 1, token: req.headers['x-access-token'], data: { creditInfo: creditObj, referalCodeInfo: referalCodeObj, creditPackageInfo: creditPackageObj, currencyType: currencyTypeObj } })
                                }
                            })

                        }
                    })
                }
            })
        }

    })
}

let createCurrencyType = (req, res) => {
    PackageCollectionServices.createCurrencyType(req.body, (err, currencyTypeObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while save currecncy type" })
        } else {
            return res.status(200).json({ success: 1, token: req.headers['x-access-token'], data: currencyTypeObj })
        }
    })
}
let calculatePrice = (req, res) => {
    // console.log(req.body)
    let priceObj = {};
    PackageCollectionServices.getCurrencyTypeByCountry(req.body.country, (err, currencyTypeObj) => {
        if (err)
            console.log(err)
        else {
            let creditValue = parseInt(req.body.creditValue);
            let currencyValue = currencyTypeObj.currencyValue;
            let finalPrice = creditValue / currencyValue;
            // console.log(finalPrice)
            finalPrice = parseFloat(finalPrice).toFixed(2)
            priceObj.totalPrice = finalPrice
            priceObj.currencySymbol = currencyTypeObj.currencySymbol;
            res.json({ success: 1, data: { creditPrice: priceObj } })
        }
    })
}
// Number.prototype.countDecimals = function () {
//     if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
//     let count = this.toString().split(".")[1].length || 0;
//     console.log(count, "count")
//     return this.toString().split(".")[1].length || 0; 
// }

let calculateFinalCreditPriceWithGST = (req, res) => {

    if (req.body.isPackageSelected == true) {
        PackageCollectionServices.findCreditPackageById(req.body.packageRefId, (err, packageObj) => {
            if (err) {
                return res.status(404).json({ success: 0, message: "Error while fetching the credit package value" })
            } else {
                PackageCollectionServices.findGSTRateByCountry(req.body.country, (err, gstObj) => {
                    if (err) {
                        return res.status(404).json({ success: 0, message: "Error while fetching the GST value" })
                    } else {
                        // console.log(packageObj)
                        let obj = {};
                        let creditAmount = parseFloat(packageObj.amount);
                        let creditValue = packageObj.credits;
                        let GST = gstObj.gst;
                        let gstAmount = creditAmount * GST / 100;
                        gstAmount = parseFloat(gstAmount.toFixed(2));
                        let totalAmount = (creditAmount + gstAmount);
                        totalAmount = parseFloat(totalAmount.toFixed(2));
                        obj.packageRefId = packageObj._id;
                        obj.totalAmount = totalAmount;
                        obj.gstAmount = gstAmount;
                        obj.creditAmount = creditAmount;
                        obj.creditValue = creditValue;
                        obj.gst = GST;
                        obj.currencySymbol = gstObj.currencySymbol;
                        obj.countryCode = gstObj.countryCode;
                        obj.currencyType = gstObj.currencyType;
                        return res.status(200).json({ success: 1, data: { payableAmount: obj } })
                    }
                });
            }
        })
    } else {
        PackageCollectionServices.findGSTRateByCountry(req.body.country, (err, gstObj) => {
            if (err) {
                return res.status(404).json({ success: 0, message: "Error while fetching the GST value" })
            } else {
                let obj = {};
                let creditAmount = parseFloat(req.body.creditAmount);
                let creditValue = req.body.creditValue;
                let GST = gstObj.gst;
                let gstAmount = creditAmount * GST / 100;
                gstAmount = parseFloat(gstAmount.toFixed(2));
                // console.log("gstAmount", gstAmount);
                //console.log(req.body);
                let totalAmount = (creditAmount + gstAmount);
                totalAmount = parseFloat(totalAmount.toFixed(2));
                obj.packageRefId = ""
                obj.totalAmount = totalAmount;
                obj.gstAmount = gstAmount;
                obj.creditAmount = creditAmount;
                obj.creditValue = creditValue;
                obj.gst = GST;
                obj.currencySymbol = gstObj.currencySymbol;
                obj.countryCode = gstObj.countryCode;
                obj.currencyType = gstObj.currencyType
                return res.status(200).json({ success: 1, data: { payableAmount: obj } });
            }
        })
    }
}
module.exports = {
    getAll: getAll,
    getDefaultCreditPackage: getDefaultCreditPackage,
    createCurrencyType: createCurrencyType,
    calculatePrice: calculatePrice,
    calculateFinalCreditPriceWithGST: calculateFinalCreditPriceWithGST
}
