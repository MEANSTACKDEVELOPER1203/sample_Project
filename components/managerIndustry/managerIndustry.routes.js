let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let ManagerIndustry = require("./managerIndustry.model");

// Create Manager Industry
router.post("/create", function (req, res) {
    let industryName = req.body.industryName;
    let parentIndustryId = req.body.parentIndustryId;
    let logoURL = req.body.logoURL;
    let createdBy = req.body.createdBy;

    let newManagerIndustry = new ManagerIndustry({
        industryName: industryName,
        parentIndustryId: parentIndustryId,
        logoURL: logoURL,
        createdBy: createdBy
    });

    ManagerIndustry.createManagerIndustry(newManagerIndustry, function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.send({ message: "Manager Industry saved sucessfully" });
        }
    });
});
// End of Create Manager Industry

// Get Parent Manger Industries List
router.get("/getIndustriesByParentlist", function (req, res, next) {
    let parentIndustryId = "null";

    ManagerIndustry.aggregate(
        [
            { $match: { "parentIndustryId": { $in: [null] } } },
        ],
        function (err, data) {
            if (err) {
                res.json({token:req.headers['x-access-token'],success:0,message:err});
            }
            res.json({token:req.headers['x-access-token'],success:1,data:data});
        }
    );
});

// End Of Get Parent Manger Industries List

// Get Manager Industries by Parent ID

router.get("/getIndustriesByParentId/:parentIndustryId", function (req, res, next) {
    let parentIndustryId = req.params.parentIndustryId;
    ManagerIndustry.getManagerIndustriesByParentId(parentIndustryId, function (err, result) {
        if (result == null) {
            res.json({token:req.headers['x-access-token'],success:0,message:"No industries found"});
        } else {
            res.json({token:req.headers['x-access-token'],success:1,data:result});
        }
    });
});
// End Of Get Manager Industries by Parent ID

// Edit Manager Industry
router.put("/edit/:IndustryId", function (req, res) {
    let reqbody = req.body;
    reqbody.updatedAt = new Date();
    let id = req.params.IndustryId;
    ManagerIndustry.editManagerIndustry(id, reqbody, function (err, result) {
        if (err) res.send(err)
        res.send(result);
    });

});
// End Edit Manager Industry

// Find by Id
router.get("/getPreferences/:id", function (req, res) {
    let id = req.params.id;
    ManagerIndustry.getPreferencesById(id, function (err, result) {
        res.send(result);
    });
});
// End Find by Id

// Get Manager Industries By IDs
router.post("/getManagerIndustryById", function (req, res) {
    let newArr = req.body.parentIndustryIds;
    let parentIndustryId = newArr.map(function (id) {
        return ObjectId(id);
    });
    ManagerIndustry.find({ "parentIndustryId": { "$in": parentIndustryId } }, function (err, result) {
        res.send(result);
    });
});
// End of Get Manager Industries By IDs

// Delete by IndustryID start
router.delete("/delete/:industryID", function (req, res, next) {

    let id = req.params.industryID;

    ManagerIndustry.findById(id, function (err, result) {
        if (result) {
            ManagerIndustry.findByIdAndRemove(id, function (err, post) {
                if (err) return next(err);
                res.json({ message: "Deleted Industry Successfully" });
            });
        } else {
            res.json({ error: "IndustryID not found / Invalid" });
        }
    });

});
// End of Delete by IndustryID start

// Get All
router.get("/getAll", function (req, res) {
    ManagerIndustry.aggregate(
        [
            {
                $match: { $and: [{ parentIndustryId: null }] }
            },
            {
                $lookup: {
                    from: "managerindustries",
                    localField: "_id",
                    foreignField: "parentIndustryId",
                    as: "Categories"
                }
            }
        ],
        function (err, industriesList) {
            if (err) {
                res.json({token:req.headers['x-access-token'],success:0,message:err});
            }
            res.json({token:req.headers['x-access-token'],success:1,data:industriesList});
        }
    );
    
});
// End of Get All

module.exports = router;
