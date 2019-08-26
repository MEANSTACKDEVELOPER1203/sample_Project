let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let rolePermissions = require("./rolePermissionsModel");

// Create a Role Permission start

router.post("/create", function (req, res) {
  let roleName = req.body.roleName;


  let permArr = [];
  //console.log(req.body);
  moduleName = req.body.modules.filter(Boolean);
  let perObj;
  for (let i = 0; i < moduleName.length; i++) {
    perObj = {};
    //console.log(perObj);
    let moduleName = req.body.modules[i];
    let parentModuleId = req.body.parentModuleId[i];

    perObj.moduleName = moduleName;
    perObj.parentModuleId = parentModuleId;
    //console.log(perObj);

    //permArr[i].permArr = perObj;
    permArr.push(perObj);

  }
  //console.log(permArr.length);

  let permissions = permArr;
  //console.log(permissions);
  let newRole = new rolePermissions({
    roleName: roleName,
    permissions: permArr
  });
  rolePermissions.createRole(newRole, function (err, user) {
    if (err) {
      res.send(err.message);
    } else {
      res.send({ message: "Role created successfully" });
    }
  });
});
// End Create a Role Permission
//update role permissions start
router.put("/updateRole/:roleID", function (req, res) {
  let reqbody = req.body;
  let roleID = req.params.roleID;
  //console.log(reqbody);
  rolePermissions.findOneAndUpdate(
    { "permissions._id": roleID },
    {
      $set: {
        "permissions.$.moduleName": req.body.moduleName,
        "permissions.$.parentModuleId": req.body.parentModuleId
      }
    },
    { upsert: true },
    function (err, newresult) {
      if (err) {
        res.json({ error: "InvalidID" });
      } else {
        res.json({ message: "Role Updated Successfully" });
      }
    }
  );
});
//update role permissions end

/// Start of addModule

router.put("/addModule/:id", function (req, res) {
  let reqbody = req.body;
  let permissionsObject = {};
  let permissions;
  permissionsObject.moduleName = req.body.moduleName;
  permissionsObject.parentModuleId = req.body.parentModuleId;
//console.log(req.body);
rolePermissions.updateOne(
    { _id: req.params.id },
    { $push: { permissions: permissionsObject } },
    function (err, updateResult) {
      if (err) return res.send(err);
      if (updateResult.nModified == 1) {
        res.json({
          message: "Module added Successfully."
        });
      } else {
        res.json({ message: "Operation Failed!" });
      }
    }
  );
});

// End  of addModule

// Create a celebrityContract
router.post("/update", function(req, res) {

  rolePermissions.find({roleName : req.body.roleName[0]}, function(err, oldContracts) {
    if (err) return res.send(err);
    console.log(oldContracts)
    if(oldContracts.length > 0) {
      for(let j=0; j < oldContracts.length; j++) {
        rolePermissions.findByIdAndRemove(oldContracts[j]._id, function(err, post) {
         if(err) console.log(err);
         if(post) console.log("deleted contract " + j)
        });
      }
      for(let i=0; i < (req.body.roleName).length; i++){
        let roleName = req.body.roleName[i];
        let moduleName = req.body.moduleName[i];
        let parentModuleId = req.body.parentModuleId[i];
        let createdBy = req.body.createdBy[i];
    
        let newCelebrityContract = new celebrityContract({
          memberId: memberId,
          serviceType: serviceType,
          startDate: startDate,
          endDate: endDate,
          minDuration: minDuration,
          maxDuration: maxDuration,
          managerSharePercentage: managerSharePercentage,
          charitySharePercentage:charitySharePercentage,
          promoterSharePercentage: promoterSharePercentage,
          sharingPercentage: sharingPercentage,
          serviceCredits: serviceCredits,
          contractUpdateRemarks: contractUpdateRemarks,
          specialNotes:specialNotes,
          isActive: isActive,
          createdBy: createdBy
        });
      
        rolePermissions.createCelebrityContract(newCelebrityContract, function(
          err,
          user
        ) {
           if (err) {
            //console.log(err);
          } 
        });
      }
      res.send({ message: "Celebrity Contract created sucessfully" });
    } else {
      for(let i=0; i < (req.body.memberId).length; i++){
        let memberId = req.body.memberId[i];
        let serviceType = req.body.serviceType[i];
        let startDate = new Date();
        let endDate = req.body.endDate[i];
        let minDuration = req.body.minDuration[i];
        let maxDuration = req.body.maxDuration[i];
        let managerSharePercentage = req.body.managerSharePercentage[i];
        let charitySharePercentage = req.body.charitySharePercentage[i];
        let promoterSharePercentage = req.body.promoterSharePercentage[i];
        let sharingPercentage = req.body.sharingPercentage[i];
        let serviceCredits = req.body.serviceCredits[i];
        let contractUpdateRemarks = req.body.contractUpdateRemarks[i];
        let specialNotes = req.body.specialNotes[i];
        let isActive = req.body.isActive[i];
        let createdBy = req.body.createdBy[i];
    
        let newCelebrityContract = new celebrityContract({
          memberId: memberId,
          serviceType: serviceType,
          startDate: startDate,
          endDate: endDate,
          minDuration: minDuration,
          maxDuration: maxDuration,
          managerSharePercentage: managerSharePercentage,
          charitySharePercentage:charitySharePercentage,
          promoterSharePercentage: promoterSharePercentage,
          sharingPercentage: sharingPercentage,
          serviceCredits: serviceCredits,
          contractUpdateRemarks: contractUpdateRemarks,
          specialNotes:specialNotes,
          isActive: isActive,
          createdBy: createdBy
        });
      
        rolePermissions.createCelebrityContract(newCelebrityContract, function(
          err,
          user
        ) {
           if (err) {
            //console.log(err);
          } 
        });
      }
      res.send({ message: "Celebrity Contract created sucessfully" });
    }
  });
  
 
  

});
// End of Create a celebrityContract
// Edit a role start

router.put("/edit/:id", function (req, res) {
  let id = req.params.id;

  let reqbody = req.body;
  reqbody.updated_at = new Date();

  rolePermissions.findByIdAndUpdate(req.params.id, reqbody, function (
    err,
    result
  ) {
    if (err) return res.send(err);
    res.json({ message: "role updated successfully" });
  });
});

// End Edit a role
// Find by Id start

router.get("/findById/:Id", function (req, res) {
  let id = req.params.Id;

  rolePermissions.findById(id, function (err, result) {
    res.send(result);
  });
});

// End Find by Id
// getAll start

router.get("/getAll", function (req, res) {
  rolePermissions.find({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "No data found!"
      });
    }
  });
});
// End getAll

router.get("/getAll/:pageNo/:limit", (req, res)=> {
    let params = req.params;
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);
    rolePermissions.count({},(err, count)=> {
        if (err){
          return res.json({ success: 0, message: err });
        }
        else{
          rolePermissions.find({},(err, result)=> {
                if (err){
                  return res.json({ success: 0, message: err });
                }
                else{
                    let data = {};
                    data.result = result
                    let total_pages = count/limit
                    let div = count%limit;
                    data.pagination ={
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    return res.json({ success: 1, data: data });
                }
            }).skip(startFrom).limit(limit).sort({createdAt: -1}).limit(limit);
        }
    })
});

//deleteEconfigById start

router.delete("/deleteRoleById/:id", function (req, res, next) {
  let id = req.params.id;

  rolePermissions.findByIdAndRemove(id, function (err, post) {
    if (err) return next(err);
    res.json({ message: "Deleted Role Successfully" });
  });
});
//End deleteEconfigById

module.exports = router;
