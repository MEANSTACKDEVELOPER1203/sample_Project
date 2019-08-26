let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let comConfig = require("./comConfigModel");

// Create a ComConfig
router.post("/createEconfig", function(req, res) {
  let config = req.body.config;
  let status = req.body.status;

  let newEconfig = new Econfig({
    config: config,
    status: status,
  });

  comConfig.createEconfig(newEconfig, function(err, user) {
    if (err) {
      res.send(err);
    } else {
      res.send({ message: "Econfig saved sucessfully" });
    }
  });
});
// End of Create a ComConfig

// Edit ComConfig
router.put("/editComConfig/:id", function(req, res) {
    let config = req.body.config;
  let status = req.body.status;
    
  let reqbody = req.body;

  comConfig.findByIdAndUpdate(req.params.id, reqbody, function(err, result) {
    if (err) return res.send(err);
    res.json({ message: "Econfig Updated Successfully" });
  });
});
// End of Edit ComConfig

// Find by ComConfig ID
router.get("/findByComConfigId/:Id", function(req, res) {
  let id = req.params.Id;

  comConfig.getEconfigById(id, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Find by ComConfig ID

// Delete a comConfig 
router.delete("/deleteEconfigById/:id", function(req, res, next) {
  let id = req.params.id;

  comConfig.findByIdAndRemove(id, function(err, post) {
    if (err) return next(err);
    res.json({ message: "Deleted comConfig Successfully" });
  });
});
// End of Delete a comConfig

module.exports = router;
