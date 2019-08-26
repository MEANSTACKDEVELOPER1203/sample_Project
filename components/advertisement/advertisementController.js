let sizeOf = require('image-size');
let advertisementServices = require('./advertisementServices');

let createAdvertisement = (req, res) => {
    // console.log("****************************************************")
    // console.log(req.body);
    let advertiesment = req.body.advertiesment;
    let advertiesmentObj = JSON.parse(advertiesment);
    // console.log("****************************************************")
    // console.log(req.files);
    let files = req.files;
    //console.log( files.length)
    let advertiesmentArr = [];
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            // if (req.body.mediaType == "image") {
            if (files[i].fieldname == "appLogo") {
                let dimensions = sizeOf(files[i].path);
                let appLogoUrl = files[i].path;
                let appLogoRatio = dimensions.height/dimensions.width;
                //console.log(dimensions.width, dimensions.height);
                advertiesmentObj.appLogoUrl = appLogoUrl;
                advertiesmentObj.appLogoRatio = appLogoRatio;
            } else {
                let src= {}
                let dimensions = sizeOf(files[i].path);
                let mediaUrl = files[i].path;
                let videoUrl = "";
                //console.log(dimensions.width, dimensions.height);
                let mediaName = files[i].filename;
                let mediaType = "image";
                let mediaRatio = dimensions.height/dimensions.width;
                src.mediaUrl = mediaUrl;
                src.videoUrl = videoUrl;
                src.mediaName = mediaName;
                src.mediaType = mediaType;
                src.mediaRatio = mediaRatio;
                advertiesmentObj.src = src;
            }
            //}
        }
    }
    advertisementServices.saveAdvertiesment(advertiesmentObj, (err, advertiesmentObj) => {
        if (err)
            return res.status(500).json({ success: 1, message: "Error while creating advertiesment. ", err });
        else {
            return res.status(200).json({ success: 1, message: "Created successfully", data: advertiesmentObj })
        }
    });
    //return res.json({ success: 1, message: "Create Advertiesmnet" })
}












let advertisementController = {
    createAdvertisement: createAdvertisement
}
module.exports = advertisementController;