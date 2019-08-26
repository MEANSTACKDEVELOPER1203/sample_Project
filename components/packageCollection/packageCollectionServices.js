const PackageCollectionModel = require("./packageCollectionModel");
let CurrencyType = require('./currencyTypeModel');
let ObjectId = require('mongodb').ObjectId;

var currency_symbols = {
    'US': '$', // US Dollars
    'AU': '$', // Australian Dollar
    'IN': '₹', // Indian Rupee
    'EUR': '€', // Euro
    'CRC': '₡', // Costa Rican Colón
    'GBP': '£', // British Pound Sterling
    'ILS': '₪', // Israeli New Sheqel

    'JPY': '¥', // Japanese Yen
    'KRW': '₩', // South Korean Won
    'NGN': '₦', // Nigerian Naira
    'PHP': '₱', // Philippine Peso
    'PLN': 'zł', // Polish Zloty
    'PYG': '₲', // Paraguayan Guarani
    'THB': '฿', // Thai Baht
    'UAH': '₴', // Ukrainian Hryvnia
    'VND': '₫', // Vietnamese Dong
};
const getAll = (params, callback) => {
    let pageNo = parseInt(params.pageNo);
    let startFrom = params.limit * (pageNo - 1);
    let limit = parseInt(params.limit);
    PackageCollectionModel.count({}, (err, count) => {
        if (err) {
            callback(err, null)
        }
        else {
            PackageCollectionModel.find({}, (err, result) => {
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
                    callback(null, data);
                }
            }).skip(startFrom).limit(limit).sort({ createdAt: -1 })
        }
    })
}

let getPackageByCountry = function (country, callback) {
    PackageCollectionModel.find({ countryCode: country }, (err, creditPackageObj) => {
        if (!err)
            callback(null, creditPackageObj);
        else
            callback(err, null)
    }).sort({ amount: -1 })
}
let createCurrencyType = function (body, callback) {
    let currencySymbol = '₹';
    if (currency_symbols[body.countryCode] !== undefined) {
        currencySymbol = currency_symbols[body.countryCode]
        // console.log(currency_symbols[body.countryCode])
    }
    let currencyTypeInfo = new CurrencyType({
        countryName: body.countryName,
        countryCode: body.countryCode,
        currencyType: body.currencyType,
        currencySymbol: currencySymbol,
        currencyValue: body.currencyValue,
        description: body.description,
    })
    CurrencyType.create(currencyTypeInfo, (err, currencyTypeObj) => {
        if (!err)
            callback(null, currencyTypeObj);
        else
            callback(err, null)
    })
}
let getCurrencyTypeByCountry = function (country, callback) {
    CurrencyType.findOne({ countryCode: country }, (err, currencyTypeObj) => {
        if (!err)
            callback(null, currencyTypeObj);
        else
            callback(err, null)
    })
}

let findGSTRateByCountry = function (country, callback) {
    CurrencyType.findOne({ countryCode: country }, { gst: 1, countryCode: 1, currencySymbol: 1, currencyValue: 1, currencyType: 1, countryName: 1 }, (err, gstObj) => {
        if (!err)
            callback(null, gstObj);
        else
            callback(err, null)
    })
}

let findCreditPackageById = function (packageId, callback) {
    packageId = ObjectId(packageId);
    PackageCollectionModel.findById(packageId, (err, packageObj) => {
        if (!err)
            callback(null, packageObj)
        else
            callback(err, null)
    })
}
module.exports = {
    getAll: getAll,
    getPackageByCountry: getPackageByCountry,
    createCurrencyType: createCurrencyType,
    getCurrencyTypeByCountry: getCurrencyTypeByCountry,
    findGSTRateByCountry: findGSTRateByCountry,
    findCreditPackageById: findCreditPackageById
}
