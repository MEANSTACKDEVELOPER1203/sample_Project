let favorites = require("../favorites/favoritesService");
let auditionService = require('../auditions/auditionService');
let auditionsProfilesService = require('../auditionsProfiles/auditionsProfilesService');
let AuditionsProfiles = require('../auditionsProfiles/auditionsProfilesModel');
let Auditions = require('../auditions/auditionModel');
let ObjectId = require('mongodb').ObjectId;
// create favorites
var createfavorites = (req, res) => {
   // roleObj = req.body.roleObj;
    var newNotificationArray = [];
    favorites.findFavoriteByAuditionId(req.body, (err, favoritesObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching faverite!" })
        } else {
            if (favoritesObj && favoritesObj !== null) {
                let msg = "";
                if (favoritesObj.isFavorite == true) {
                    msg = "Audition removed from favourite list.";
                    req.body.isFavorite = false;
                    req.body.updatedAt = new Date();
                    Auditions.update({'_id':req.body.auditionId},{$pull:{favoritedBy:{memberId:req.body.memberId}}},(err,data)=>{
                        // console.log(data)  
                    });
                }
                else {
                    msg = "Audition added to favourite list successfully.";
                    req.body.isFavorite = true;
                    hasBeenFavorited = true
                    req.body.updatedAt = new Date();
                    Auditions.update({'_id':req.body.auditionId},{$push:{favoritedBy:{memberId:req.body.memberId}}},(err,data)=>{
                        // console.log(data)  
                    });
                }

                favorites.updatefavorites(favoritesObj._id, req.body, (err, updatedfavoritesObj) => {
                    if (err) {
                        return res.status(404).json({
                            token:req.headers['x-access-token'],
                            success: 0,
                            message: "Error while creating the new favorites."
                        });
                    } else {
                        res.status(200).json({
                            token:req.headers['x-access-token'],
                            success: 1,
                            message: msg,
                            data: updatedfavoritesObj
                        });
                    }
                });
            } else {
                favorites.savefavorites(req.body, (err, createfavoritesObj) => {
                    if (err) {
                        return res.status(404).json({
                            token:req.headers['x-access-token'],
                            success: 0,
                            message: "Error while creating the new favorites."
                        });
                    } else {
                        res.status(200).json({
                            token:req.headers['x-access-token'],
                            success: 1,
                            message: "Audition added to favourite list successfully",
                            data: createfavoritesObj
                        });
                        Auditions.update({'_id':req.body.auditionId},{$push:{favoritedBy:{memberId:req.body.memberId}}},(err,data)=>{
                            // console.log(data)  
                        });
                    }
                });
            }
        }
    })

}
var checkFavorite = (req, res) => {
    //roleObj = req.body.roleObj;
    //var newNotificationArray = [];
    auditionId = req.body.auditionId;
    auditionProfileId = req.body.auditionProfileId;
    let isFavorite = false;
    favorites.findFavoriteByAuditionId(req.body, (err, myFavoriteObj) => {
        //console.log(myFavoriteObj)
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the my favorite!" })
        } else {
            auditionService.findAuditionById(ObjectId(req.body.auditionId), (err, auditionObj) => {
                if (err) {
                    // console.log(err);
                    return res.status(200).json({ success: 0, data: null ,message: "Error while fetching Audition." });
                } else {
                    // console.log(auditionObj)
                    favorites.checkFavorite(req.body, (err, favoriteAuditionObj) => {
                        // console.log("test",favoriteAuditionObj)
                        if (err) {
                            return res.status(404).json({
                                success: 0, message: "Error while fetching the new favorites."
                            });
                        }
                        else {
                            isFavorite = false;
                            if (myFavoriteObj.isFavorite == true && myFavoriteObj !== null) {
                                //console.log("******************* isFavorite *********************")
                                isFavorite = true
                            }
                            auditionObj.isFavorite = isFavorite;
                            auditionObj.roleDetails = favoriteAuditionObj;
                            auditionObj.role = [];
                            return res.status(200).json({ success: 1, data: auditionObj });
                        }
                    })
                }
            })



        }
    });

}
var getAllMembersForAuditionById = (req, res) => {
    let memberId = (req.params.memberId) ? req.params.memberId : '';
    favorites.findAllMemberDetailsById(ObjectId(memberId), (err, listOfApplyAuditionObj) => {
        // console.log(listOfApplyAuditionObj)
        if (err) {
            res.status(404).json({ success: 0, message: "Error while fetching the member detail " })
        } else if (!listOfApplyAuditionObj || listOfApplyAuditionObj == null) {
            return res.status(200).json({ success: 0, message: "There are no applied yet!" });
        } else {
            return res.status(200).json({ success: 1, data: listOfApplyAuditionObj });
        }
    });
}

var getAllAuditionsForFavoritesId = (req, res) => {
    let auditionId = (req.params.auditionId) ? req.params.auditionId : '';
    favorites.getAllAuditionsForFavoritesId(ObjectId(auditionId), (err, listOfApplyAuditionObj) => {
        // console.log(listOfApplyAuditionObj)
        if (err) {
            res.status(404).json({ success: 0, message: "Error while fetching the member detail " })
        } else if (!listOfApplyAuditionObj || listOfApplyAuditionObj == null) {
            return res.status(200).json({ success: 0, message: "There are no applied yet!" });
        } else {
            return res.status(200).json({ success: 1, data: listOfApplyAuditionObj });
        }
    });
}





// update contest
var updatefavorites = (req, res) => {
    favorites.updatefavorites(req.params.favoritesId, req.body, (err, updatefavoritesObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while updating the Contest."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Favorites has updated successfully.",
                data: updatefavoritesObj
            });
        }
    });
}

// get contest details by contest ID
var getfavoritesById = (req, res) => {
    favorites.findfavoritesById(req.params.favoritesId, (err, favoritesObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                favoritesDetails: favoritesObj
            });
        }
    });
}




var getAllfavorites = (req, res) => {
    favorites.findAllfavorites((err, listOffavoritesObj) => {
        if (err) {
            return res.json({ success: 0, message: "Error while fetching the all favorites" });
        } else if (!listOffavoritesObj || listOffavoritesObj == null) {
            return res.status(200).json({ success: 1, message: "Record not found!" });
        } else {
            return res.status(200).json({ success: 1, data: listOffavoritesObj });
        }
    })
}



/// GET contest questions by Contest Name



/********************************* talent favorite controller  *********************************/

var createTalentFavorite = (req, res) => {
    //console.log(req.body);
    let hasBeenFavorited = false;
    auditionsProfilesService.findAuditionsProfilesById(ObjectId(req.body.auditionProfileId), (err, myProfileObj) => {
        if (err) {
            return res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while fetching current member audition profile." });
        } else {
            favorites.findTalent(req.body, (err, favoriteTalentObj) => {
                if (err) {
                    return res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while fetching the my favourite talent.." });
                } else {
                    if (favoriteTalentObj || favoriteTalentObj !== null) {
                        //console.log("***************   ",favoriteTalentObj)
                        let msg = "";
                        if (favoriteTalentObj.isFavorite == true) {
                            msg = "Profile removed from favourite list";
                            req.body.isFavorite = false;
                        }
                        else {
                            msg = "Profile added to favourite list";
                            req.body.isFavorite = true;
                            hasBeenFavorited = true
                           
                        }
                        req.body.updatedAt = new Date();
                        favorites.updateFavoriteTalent(favoriteTalentObj._id, req.body, (err, updatedFavoriteTalentObj) => {
                            if (err) {
                                return res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while update favourite talent" });
                            } else {
                                return res.status(200).json({ success: 1,token:req.headers['x-access-token'], message: msg, data: {TalentObj:updatedFavoriteTalentObj,hasBeenFavorited:hasBeenFavorited} });
                                // if(req.body.isFavorite)
                                // {
                                //     AuditionsProfiles.update({'memberId':req.body.memberId},{$push:{favoritedBy:{memberId:req.body.memberId}}},(err,data)=>{
                                //         console.log(data)  
                                //     });
                                // }
                                // else{
                                //     AuditionsProfiles.update({'memberId':req.body.memberId},{$pull:{favoritedBy:{memberId:req.body.memberId}}},(err,data)=>{
                                //         console.log(data)  
                                //     });
                                // }
                            }
                        });
                    } else {
                        let fName = "", lName = "", userName = "";
                        fName = myProfileObj.firstName;
                        lName = myProfileObj.lastName;
                        userName = fName + " " + lName;
                        req.body.createdBy = userName;
                        hasBeenFavorited = true
                        favorites.saveFavoriteTalent(req.body, (err, createTalentObj) => {
                            if (err) {
                                return res.status(404).json({ success: 0,token:req.headers['x-access-token'], message: "Error while creating the favourite talent.." });
                            } else {
                                return res.status(200).json({ success: 1,token:req.headers['x-access-token'], message: "Profile added to favourite list.", data: {TalentObj:createTalentObj,hasBeenFavorited: hasBeenFavorited }});
                                // AuditionsProfiles.update({'memberId':req.body.memberId},{$push:{favoritedBy:{memberId:req.body.memberId}}},(err,data)=>{
                                //     console.log(data)  
                                // });
                            }
                        })
                        
                    }
                }
            })
        }
    })

}


var getAllfavouritedAuditions = (req, res) => {
    let auditionProfileId = (req.params.auditionProfile_Id) ? req.params.auditionProfile_Id : null;
    if (auditionProfileId)
    {
        favorites.findAllFavouritedAuditions(ObjectId(auditionProfileId), (err, listOfFavouriteTalentObj) => {
            if (err) {
                return res.status(404).json({ token:req.headers['x-access-token'],success: 0, message: "Error while fetching favourite talent.." })
            } else if (!listOfFavouriteTalentObj || listOfFavouriteTalentObj == null || listOfFavouriteTalentObj.length <= 0) {
                return res.status(200).json({ token:req.headers['x-access-token'],success: 1, message: "record not found" });
            } else {
                return res.status(200).json({ token:req.headers['x-access-token'],success: 1, data: listOfFavouriteTalentObj });
            }
        });
    }
    else{
        return res.status(200).json({ token:req.headers['x-access-token'],success: 0, message: "AuditionProfile Id undefined" });
    }
}
var getAllfavouritesTalent = (req, res) => {
    let auditionProfileId = (req.params.auditionProfile_Id) ? req.params.auditionProfile_Id : '';
    if (auditionProfileId == "0")
        auditionProfileId = "5bcd68d43dfb4f55c246394a"
    favorites.findAllFavouriteTalent(ObjectId(auditionProfileId), (err, listOfFavouriteTalentObj) => {
        if (err) {
            return res.status(404).json({ token:req.headers['x-access-token'],success: 0, message: "Error while fetching favourite talent.." })
        } else if (!listOfFavouriteTalentObj || listOfFavouriteTalentObj == null || listOfFavouriteTalentObj.length <= 0) {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 1, message: "record not found" });
        } else {
            return res.status(200).json({ token:req.headers['x-access-token'],success: 1, data: listOfFavouriteTalentObj });
        }
    });
}

var favoritesController = {
    createfavorites: createfavorites,
    updatefavorites: updatefavorites,
    getfavoritesById: getfavoritesById,
    getAllfavorites: getAllfavorites,
    checkFavorite: checkFavorite,
    getAllMembersForAuditionById: getAllMembersForAuditionById,
    getAllAuditionsForFavoritesId: getAllAuditionsForFavoritesId,
    createTalentFavorite: createTalentFavorite,
    getAllfavouritesTalent: getAllfavouritesTalent,
    getAllfavouritedAuditions:getAllfavouritedAuditions
}

module.exports = favoritesController;