let Role = require("../roles/roleService");
let applyAuditionsService = require('../applyAuditions/applyAuditionsService');

// create Roles
var createRole = (req, res) => {
    Role.saveRole(req.body, (err, createRoleObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while creating the new Role."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Roles inserted successfully."
            });
        }
    });
}

// update contest
var updateRole = (req, res) => {
    Role.updateRole(req.params.roleId, req.body, (err, updateRoleObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while updating the Contest."
            });
        } else {
            res.status(200).json({
                success: 1,
                message: "Role has updated successfully."
            });
        }
    });
}

// get contest details by contest ID
var getRoleById = (req, res) => {
    Role.findRoleById(req.params.roleId, (err, RoleObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                RoleDetails: RoleObj
            });
        }
    });
}

// get contest details by contest ID
var shareRole = (req, res) => {
    Role.shareRoleById(req.params.roleId, (err, RoleObj) => {
        if (err) {
            return res.status(404).json({
                success: 0,
                message: "Error while fetching the Contest details."
            });
        } else {
            res.status(200).json({
                success: 1,
                RoleDetails: RoleObj
            });
        }
    });
}

var getRolesByAuditionId = (req, res) => {
    let auditionId = (req.params.audition_Id) ? req.params.audition_Id : '';
    let applyAuditionRoleIdLists = [];
    Role.findRolesByAuditionId(auditionId, (err, listOfRolesObj) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the roles by audtion id" });
        } else if (!listOfRolesObj || listOfRolesObj == null) {
            return res.status(200).json({ success: 0, message: "There are no role!" });
        } else {
            listOfRolesObj.forEach((item) => {
                applyAuditionRoleIdLists.push((item._id))//removed object data
            });
            applyAuditionsService.findTotalCountOfApplyForRole(applyAuditionRoleIdLists, (err, totalCountOfAudition) => {
                if (err) {
                    console.log(err)
                } else {
                    let applyRoleCount = 0;
                    let listOfApplyRolesObjWithCount = [];
                    for (let i = 0; i < listOfRolesObj.length; i++) {
                        applyRoleCount = 0;
                        let roleObj = {};
                        roleObj = listOfRolesObj[i];
                        let id = roleObj._id
                        id = "" + id;
                        // console.log("***********id************")
                        // console.log(id);
                        // console.log(typeof id);
                        for (let j = 0; j < totalCountOfAudition.length; j++) {
                            let roleId = totalCountOfAudition[j].roleId;
                            roleId = "" + roleId;
                            
                            if (id === roleId) {
                                applyRoleCount += 1;
                            }
                        }
                        Object.assign(roleObj, { "applyRoleCount": applyRoleCount });
                        listOfApplyRolesObjWithCount.push(roleObj);
                    }
                    return res.status(200).json({ success: 1, data: listOfApplyRolesObjWithCount })
                }
            });

        }
    });
}
/// GET contest questions by Contest Name

var getRolesByHairColor = (req, res) => {
    Role.findRoleByHairColor((err, listOfRoles) => {
        if (err) {
            return res.status(404).json({ success: 0, message: "Error while fetching the role by hair color" });
        } else if (!listOfRoles || listOfRoles == null) {
            return res.status(200).json({ success: 0, message: "Record not found" });
        } else {
            return res.status(200).json({ success: 1, data: listOfRoles });
        }
    })
}

var RoleController = {
    createRole: createRole,
    updateRole: updateRole,
    getRoleById: getRoleById,
    getRolesByAuditionId: getRolesByAuditionId,
    getRolesByHairColor: getRolesByHairColor,
    shareRole:shareRole
}

module.exports = RoleController;








































































































































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