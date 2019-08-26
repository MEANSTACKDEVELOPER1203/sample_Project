let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let adminMenuMaster = require("./adminMenuMasterModel");

// createadminMenuMaster start

router.post("/createAdminMenuMaster", function (req, res) {
  let menuName = req.body.menuName;
  let parentMenuId = req.body.parentMenuId;
  let createdAt = req.body.createdAt;
  let updatedAt = req.body.updatedAt;

  let newadminMenuMaster = new adminMenuMaster({
    menuName: menuName,
    parentMenuId: parentMenuId,
    createdAt: createdAt,
    updatedAt: updatedAt,
  });

  adminMenuMaster.createAdminMenuMaster(newadminMenuMaster, function (err, user) {
    if (err) {
      res.send(err);
    } else {
      res.send({ message: "adminMenuMaster saved sucessfully" });
    }
  });
});
// End createadminMenuMaster

// getadminMenuMasterList start

router.get("/getAdminMenuMasterList", function (req, res) {
  adminMenuMaster.find(function (err, users) {
    if (err) return next(err);
    res.json(users);
  });
});
// End getadminMenuMasterList


// get adminMenuMaster by parentlist start

router.get("/getAdminMenuMasterByParentlist", function (req, res, next) {
  let parentMenuId = "null";

  adminMenuMaster.aggregate(
    [
      { $match: { "parentMenuId": { $in: [null] } } },
      {
        $project: {
          _id: 0,
          preferenceName: 1,
          professions: 1
        }
      }

    ],
    function (err, data) {
      if (err) {
        res.send(err);
      }
      res.send(data);
    }
  );
});

// End get adminMenuMaster by parentlist
// get adminMenuMaster by parentId start

router.get("/getAdminMenuMasterByParentId/:parentMenuId", function (req, res, next) {
  let parentMenuId = req.params.parentMenuId;
  adminMenuMaster.getadminMenuMasterByParentId(parentMenuId, function (err, result) {
    if (result == null) {
      res.json({
        error: "No adminMenuMaster found"
      });
    } else {
      res.send(result);
    }
  });
});
// End get adminMenuMaster by parentId

// get profession by preference name start

router.get("/getProfessionByPreferenceName/:preferenceName", function (req, res, next) {
  let preferenceName = req.params.preferenceName;
  adminMenuMaster.getProfessionByPreferenceName(preferenceName, function (err, result) {
    if (result == null) {
      res.json({
        error: "No adminMenuMaster found"
      });
    } else {
      res.send(result[0].professions);
    }
  });
});

// End get profession by preference name

// Edit a adminMenuMaster start

router.put("/edit/:adminMenuMaster_id", function (req, res) {
  let preferenceName = req.body.preferenceName;
  let parentPreferenceId = ObjectId(req.body.parentPreferenceId);
  let countries = req.body.countries;
  let created_at = req.body.created_at;
  let updated_at = req.body.updated_at;

  let reqbody = req.body;
  reqbody.updated_at = new Date;
  reqbody.parentPreferenceId = parentPreferenceId;
  let id = req.params.adminMenuMaster_id;
  adminMenuMaster.editadminMenuMaster(id, reqbody, function (err, result) {
    res.send(result);

  });

});
// End Edit a adminMenuMaster

// Find by Id  start

router.get("/getAdminMenuMaster/:id", function (req, res) {
  let id = req.params.id;
  adminMenuMaster.getadminMenuMasterById(id, function (err, result) {
    res.send(result);
  });
});
// End Find by Id

// getadminMenuMasterByParentID start

router.post("/getAdminMenuMasterParentID", function (req, res) {
  let newArr = req.body.parentMenuId;
  let parentPreferenceId = newArr.map(function (id) {
    return ObjectId(id);
  });
  adminMenuMaster.find({ "parentMenuId": { "$in": parentMenuId } }, function (err, result) {
    res.send(result);
  });
});

// End getadminMenuMasterByParentID
// Delete by adminMenuMasterID start

router.delete("/delete/:adminMenuMasterID", function (req, res, next) {

  let id = req.params.adminMenuMasterID;

  adminMenuMaster.findById(id, function (err, result) {
    if (result) {
      adminMenuMaster.findByIdAndRemove(id, function (err, post) {
        if (err) return next(err);
        res.json({ message: "Deleted adminMenuMaster Successfully" });
      });
    } else {
      res.json({ error: "adminMenuMasterID not found / Invalid" });
    }
  });

});

// End Delete by adminMenuMasterID

module.exports = router;
