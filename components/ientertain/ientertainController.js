let ientertainServices = require('./ientertainServices');

let createIentertainData = (req, res) => {
    console.log(req.body);
    console.log(req.files)
    let filesData = req.files;
    let ientertainObj = JSON.parse(req.body.data);

    let mediaUrl, mediaType, mediaSize, mediaCaption, mediaName;
    let src = {}
    if (filesData.length > 0) {
        let fileType = filesData[0].mimetype
        src.mediaUrl = filesData[0].path;
        src.mediaSize = 0.0;
        src.mediaName = filesData[0].filename;
        if (fileType === "image/jpg" || fileType === "image/png" || fileType === "image/jpeg")
            src.mediaType = "image"
        else if (fileType === "video/mp4" || fileType === "audio/mp3" || fileType === "audio/ogg" || fileType === "audio/wav" || fileType === "audio/m4a" || fileType === "audio/aac")
            src.mediaType = "video"
        ientertainObj.src = src
    }
    console.log(ientertainObj);
    ientertainServices.saveIentertain(ientertainObj, (err, ientertainObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while creating ientertain data", err })
        } else {
            return res.status(200).json({ success: 1, message: "created successfuly", data: ientertainObj })
        }
    })
    // res.json({ success: 1 })

}
let getIentertainByCategory = (req, res) => {
    let category = req.params.category;
    console.log(category);
    ientertainServices.findIentertainByCategory(category, (err, listOfIentertainObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching ientertain data", err })
        } else if (!listOfIentertainObj || listOfIentertainObj.length <= 0) {
            return res.status(200).json({ success: 0, message: "records not found" })
        } else {
            return res.status(200).json({ success: 1, data: listOfIentertainObj })
        }
    })
}
let deleteIentertainById = (req, res) => {
    ientertainServices.deleteById(req.params.id, (err) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while deleting ientertain data", err })
        } else {
            return res.status(200).json({ success: 1, message: "Deleted successfuly" })
        }
    })
}

let getIentertainById = (req, res) => {
    let ientertainId = (req.params.ientertain_Id) ? req.params.ientertain_Id : '';
    console.log("@@@@@@@@")
    ientertainServices.findIentertainById(ientertainId, (err, ientertainObj) => {
        console.log("@@@@@@@@", ientertainObj)
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetch ientertain by ID" })
        } else {
            return res.status(200).json({ success: 1, data: ientertainObj })
        }

    })
}
let editIentertain = (req, res) => {
    ientertainServices.updateIentertain(req.params.entertain_Id, req.body, (err, updatedObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while updating ientertain" });
        } else {
            return res.status(200).json({ success: 1, message: "successfuly updated", data: updatedObj })
        }
    })
}

let ientertainController = {
    createIentertainData: createIentertainData,
    getIentertainByCategory: getIentertainByCategory,
    deleteIentertainById: deleteIentertainById,
    editIentertain: editIentertain,
    getIentertainById: getIentertainById
}
module.exports = ientertainController