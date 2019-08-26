let Ientertain = require('./ientertainModel');
let ObjectId = require('mongodb').ObjectId;

let saveIentertain = function (ientertainObj, callback) {
    let ientertainInfo = new Ientertain({
        title: ientertainObj.title,
        description: ientertainObj.description,
        subtitle: ientertainObj.subtitle,
        category: ientertainObj.category,
        src: ientertainObj.src
    });
    Ientertain.create(ientertainInfo, (err, ientertainObj) => {
        if (!err)
            callback(null, ientertainObj);
        else
            callback(err, null);
    });
}

let findIentertainByCategory = function (category, callback) {
    let query = { category: category, isDeleted: false };
    Ientertain.find(query, (err, ientertainList) => {
        if (!err)
            callback(null, ientertainList);
        else
            callback(err, null)
    })
}
let deleteById = function (id, callback) {
    id = ObjectId(id)
    Ientertain.findByIdAndUpdate(id, { isDeleted: true }, (err, deletedObj) => {
        if (!err)
            callback(null, deletedObj);
        else
            callback(err, null)
    })
}

let updateIentertain = function (ientertainId, body, callback) {
    id = ObjectId(ientertainId);
    Ientertain.findByIdAndUpdate(id, body, { new: true }, (err, updatedObj) => {
        if (!err)
            callback(null, updatedObj)
        else
            callback(err, null)
    });
}
let findIentertainById = function (ientertainId, callback) {
    ientertainId = ObjectId(ientertainId);
    Ientertain.findById(ientertainId, (err, ientertainObj) => {
        if (err)
            callback(err, null)
        else
            callback(null, ientertainObj)
    })
}

let ientertainServices = {
    saveIentertain: saveIentertain,
    findIentertainByCategory: findIentertainByCategory,
    deleteById: deleteById,
    updateIentertain: updateIentertain,
    findIentertainById: findIentertainById
}
module.exports = ientertainServices;