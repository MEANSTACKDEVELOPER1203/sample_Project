let service = require("../service/serviceService");


// create services
var createservice = (req, res) => {
    service.saveservice(req.body, (err, createserviceObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while creating the new service."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "services inserted successfully.",
                data:createserviceObj
            });
        }
    });
}

// update contest
var updateservice = (req, res) => {
    service.updateservice(req.params.serviceId, req.body, (err, updateserviceObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while updating the Contest."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "service has updated successfully."
            });
        }
    });
}

// get contest details by contest ID
var getserviceById = (req, res) => {
    service.findserviceById(req.params.serviceId, (err, serviceObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                serviceDetails: serviceObj
            });
        }
    });
}

var getservicesByAuditionId = (req, res) => {
    let auditionId = (req.params.audition_Id) ? req.params.audition_Id : '';
    let applyAuditionserviceIdLists = [];
    service.findservicesByAuditionId(auditionId, (err, listOfservicesObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the services by audtion id" });
        } else if (!listOfservicesObj || listOfservicesObj == null) {
            return res.status(200).json({ success: 0, message: "There are no service!" });
        } else {
            listOfservicesObj.forEach((item) => {
                applyAuditionserviceIdLists.push((item._id))//removed object data
            });
            applyAuditionsService.findTotalCountOfApplyForservice(applyAuditionserviceIdLists, (err, totalCountOfAudition) => {
                if (err) {
                    console.log(err)
                } else {
                    let applyserviceCount = 0;
                    let listOfApplyservicesObjWithCount = [];
                    for (let i = 0; i < listOfservicesObj.length; i++) {
                        applyserviceCount = 0;
                        let serviceObj = {};
                        serviceObj = listOfservicesObj[i];
                        let id = serviceObj._id
                        id = "" + id;
                        // console.log("***********id************")
                        // console.log(id);
                        // console.log(typeof id);
                        for (let j = 0; j < totalCountOfAudition.length; j++) {
                            let serviceId = totalCountOfAudition[j].serviceId;
                            serviceId = "" + serviceId;
                            
                            if (id === serviceId) {
                                applyserviceCount += 1;
                            }
                        }
                        Object.assign(serviceObj, { "applyserviceCount": applyserviceCount });
                        listOfApplyservicesObjWithCount.push(serviceObj);
                    }
                    return res.status(200).json({ success: 1, data: listOfApplyservicesObjWithCount })
                }
            });

        }
    });
}
/// GET contest questions by Contest Name

var getservicesByHairColor = (req, res) => {
    service.findserviceByHairColor((err, listOfservices) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the service by hair color" });
        } else if (!listOfservices || listOfservices == null) {
            return res.status(200).json({ success: 0, message: "Record not found" });
        } else {
            return res.status(200).json({ success: 1, data: listOfservices });
        }
    })
}

var serviceController = {
    createservice: createservice,
    updateservice: updateservice,
    getserviceById: getserviceById,
    getservicesByAuditionId: getservicesByAuditionId,
    getservicesByHairColor: getservicesByHairColor

}

module.exports = serviceController;








































































































































/*var getUserProfile = (req, res) => {
    userService.getAllUserProfile((err, listOfUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while retrieving the user profile" });
        } else {
            res.status(200).json({ success: 1, data: listOfUserProfileObj });
        }
    });
}

var createUserProfile = (req, res) => {
    let userObj = req.body;
    let files = req.files;
    userObj.imageUrl = files[0].path;
    userObj.imageName = files[0].filename;
    req.body = userObj
    userService.saveUserProfile(req.body, (err, createdUserProfileObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while creating user profile" });
        } else {
            res.status(200).json({ success: 1, data: createdUserProfileObj });
        }
    })
}

var updateUserProfile = (req, res) => {
    let userId = (req.params.user_Id) ? req.params.user_Id : '';
    userService.updateUserProfileById(userId, req.body, (err, updateUserObj) => {
        if (err) {
            res.status(404).json({ success: 0, message: "Error while update user profile " + err.message });
        } else {
            res.status(200).json({ success: 1, data: updateUserObj });
        }
    });
}

var getUserProfileByDate = (req, res) =>{
   let createdDate = (req.params.createdDate) ? req.params.createdDate : '';
   userService.findUserByCreatedDate(createdDate, (err, userByDateObj)=>{
       if(err){
           res.status(404).json({success:0, message:"Error while retrieving user by date"});
       }else{
           res.status(200).json({success:1, data:userByDateObj});
       }

   });
}

var userProfile = {
    getUserProfile: getUserProfile,
    createUserProfile: createUserProfile,
    updateUserProfile: updateUserProfile,
    getUserProfileByDate: getUserProfileByDate
}


module.exports = userProfile;

*/