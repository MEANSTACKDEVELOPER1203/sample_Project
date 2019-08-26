let Preferences = require('./preferencesModel');
let User = require('../users/userModel');

let savePreferences = function (body, callback) {
    let preferencesInfo = new Preferences({
        preferenceName: body.preferenceName,
        parentPreferenceId: body.parentPreferenceId,
        professions: body.professions,
        countries: body.countries,
        logoURL: body.logoURL, // logo url adding menualy and image uploading to file directly
    });
    Preferences.create(preferencesInfo, (err, preferencesObj) => {
        if (!err)
            callback(null, preferencesObj);
        else
            callback(err, null)
    })
}

let findCelebrityByMemberPreference = function (memberPreferencesList, currentUserObj, callback) {
    //console.log("noFanFallowersnoFanFallowersnoFanFallowersnoFanFallowers", noFanFallowers);
    // let currentUser = [];
    // if (currentUserObj.isCeleb == true)
    //     currentUser.push(currentUserObj._id);
    //console.log("currentUsercurrentUser", currentUser);
    User.aggregate([
        {
            $match: { preferenceId: { $in: memberPreferencesList.preferences }, _id: { $nin: memberPreferencesList.memberListArray }, isCeleb: true }
        },
        // {
        //     $match: { preferenceId: { $in: memberPreferencesList.preferences }, isCeleb: true }
        // },
        {
            $project: {
                _id: 1,
                profession: 1,
                isCeleb: 1,
                isManager: 1
            }
        }
    ], function (err, listOfMemberObj) {
        if (!err) {
            //console.log("listOfMemberObjlistOfMemberObj FSAK ", listOfMemberObj)
            let celebListByPreference = [];
            for (let i = 0; i < listOfMemberObj.length; i++) {
                celebListByPreference.push(listOfMemberObj[i]._id)
            }
            // if (noFanFallowers && currentUserObj.isCeleb == true && celebListByPreference.length > 0)
            //     celebListByPreference.push(currentUserObj._id);
            //console.log("listOfMemberObjAAAAAAAAAAAAAAAAAA", listOfMemberObj);
            //console.log("celebListByPreference", celebListByPreference);
            callback(null, celebListByPreference);
        }

        else
            callback(err, null)
    })
}

let findParentPrefrence = function (callback) {
    Preferences.aggregate(
        [
            { $match: { "parentPreferenceId": { $in: [null] } } },



            // {
            //   $lookup: {

            //     from: "preferences",
            //     localField: 'parentPreferenceId',
            //     foreignField: '_id',
            //     as: "profession"
            //   }
            // },
            {
                $project: {
                    _id: 1,
                    preferenceName: 1,
                    professions: 1
                }
            },
            // {
            //   $unwind: "$parentPreferenceId" 
            // },


        ],
        function (err, listOfParentPreference) {
            if (!err) {
                // res.send(err);
                //res.json({ success: 0, message: err })
                callback(null, listOfParentPreference)
            }
            else {
                //res.json({ success: 1, data: data })
                // res.send(data);
                callback(err, null)
            }
        }
    );
}

let findPreference = function (parentPreObj, callback) {
    let preferenceArray = [];
    for (let i = 0; i < parentPreObj.length; i++) {
        preferenceArray.push(parentPreObj[i]._id);
    }
    Preferences.aggregate([
        {
            $match: { "parentPreferenceId": { $in: preferenceArray } }
        },

        {
            $project: {
                _id: 1,
                preferenceName: 1,
                parentPreferenceId: 1
            }
        },
    ], function (err, listOfPreObj) {
        if (!err) {

            let preferenceObjArray = []
            for (let i = 0; i < parentPreObj.length; i++) {
                childPreferenceArray = [];
                let preferenceObj = {}
                preferenceObj = parentPreObj[i];
                //console.log("Parent ========= ", preferenceObj._id)
                let parentId = preferenceObj._id
                parentId = "" + parentId
                for (let j = 0; j < listOfPreObj.length; j++) {
                    let chilePreObj = {}
                    chilePreObj = listOfPreObj[j];
                    let childId = chilePreObj.parentPreferenceId;
                    childId = "" + childId
                    //console.log("Child AAAAAAAAAA===== ", chilePreObj.parentPreferenceId);
                    if (parentId == childId) {
                        //console.log("Child fsak matched===== ");
                        childPreferenceArray.push(chilePreObj);
                    }

                }
                preferenceObj.subCategoryPreference = childPreferenceArray;
                preferenceObjArray.push(preferenceObj);
            }

            //console.log(preferenceObjArray)
            callback(null, preferenceObjArray);
        }

        else
            callback(err, null)
    })
}

let updateMemberPreferances = (action, updateObj) => {

}







let preferencesService = {
    savePreferences: savePreferences,
    findCelebrityByMemberPreference: findCelebrityByMemberPreference,
    findParentPrefrence: findParentPrefrence,
    findPreference: findPreference,
    updateMemberPreferances: updateMemberPreferances
}

module.exports = preferencesService;