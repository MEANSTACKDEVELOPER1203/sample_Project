let Advertisement = require('./advertisementModel');

let saveAdvertiesment = function (advertisementObj, callback) {
    let advertisementInfo = new Advertisement({
        title: advertisementObj.title,
        description: advertisementObj.description,
        advertisementType: advertisementObj.advertisementType,
        location: advertisementObj.location,
        appUrlIos: advertisementObj.appUrlIos,
        appUrlAndroid: advertisementObj.appUrlAndroid,
        webUrl: advertisementObj.webUrl,
        start: new Date(advertisementObj.start),
        expire: new Date(advertisementObj.expire),
        appLogoUrl: advertisementObj.appLogoUrl,
        appLogoRatio: advertisementObj.appLogoRatio,
        src: advertisementObj.src
    });
    Advertisement.create(advertisementInfo, (err, advertisementObj) => {
        if (!err)
            callback(null, advertisementObj);
        else
            callback(err, null)
    })
}

let findAllAds = function (callback) {
    Advertisement.find({},{start:0,expire:0,status:0,location:0,},(err, listOfAdsObj) => {
        if (!err)
            callback(null, listOfAdsObj)
        else
            callback(err, null)
    })
}

let advertisementServices = {
    saveAdvertiesment: saveAdvertiesment,
    findAllAds: findAllAds
}

module.exports = advertisementServices;