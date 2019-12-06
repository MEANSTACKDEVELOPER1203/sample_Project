let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let appCms = require("./appCmsModel");
var fs = require('fs');
let multer = require("multer");



// Image Settings
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "views/");
  },
  filename: function (req, file, cb) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);

  }
});

let upload = multer({
  storage: storage
});



// Image Settings for banners
let storageBanner = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/banners");
  },
  filename: function (req, file, cb) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    cb(null, "ck" + "_pr2" + "_" + date + "_" + Date.now() + "_" + file.originalname);
  }
});

let uploadBanner = multer({
  storage: storageBanner
});

// Create an appCms Record
router.post("/create", function (req, res) {
  let moduleName = req.body.moduleName;
  let areaName = req.body.areaName;
  let title = req.body.title;
  let text = req.body.text;
  let type = req.body.type;
  let createdBy = req.body.createdBy;

  let newAppCms = new appCms({
    moduleName: moduleName,
    areaName: areaName,
    title: title,
    text: text,
    type: type,
    createdBy: createdBy
  });

  appCms.createAppCms(newAppCms, function (
    err,
    result
  ) {
    if (err) {
      res.send(err);
    } else {
      res.send({
        message: "appCms record saved successfully"
      });
    }
  });
});
// End of Create an appCms Record

// Update an appCms record
router.put("/edit/:appCmsId", function (req, res) {
  let id = req.params.appCmsId;
  let reqbody = req.body;
  reqbody.updatedAt = new Date();

  appCms.findById(id, function (err, result) {
    if (err) return res.send(err);
    if (result) {
      appCms.editAppCms(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        res.json({
          message: "appCms document updated successfully"
        });
      });
    } else {
      res.json({
        error: "appCms not found / Invalid"
      });
    }
  });
});
// End of Update an appCms record

// Update editAppBanner  start

router.put("/editAppBanner/:mediaTitle", uploadBanner.any(), function (req, res) {
  let file = req.files;
  let reqbody = req.body;
  let mediaTitle = req.params.mediaTitle;
  let mediaUrl = req.body.mediaUrl;
  appCms.findOneAndUpdate({
    "media.mediaTitle": mediaTitle
  }, {
    $set: {
      "media.$.mediaUrl": file[0].path
    }
  }, {
    upsert: true
  },
    function (err, newresult) {
      if (err) {
        res.json({
          error: "Invalid mediaTitle"
        });
      } else {
        res.json({
          message: "Banner Updated Successfully"
        });
      }
    }
  );
});
// End of editAppBanner

// Find by Id (appCms)
router.get("/getAppCmsInfo/:appCmsId", function (req, res) {
  let id = req.params.appCmsId;

  appCms.findById(id, function (err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});
// End of Find by Id (appCms)

// Find by Module Name and Area Name
router.get("/getContent/:moduleName/:areaName", function (req, res) {
  let moduleName = req.params.moduleName;
  let areaName = req.params.areaName;

  let query = {
    $and: [{
      moduleName: moduleName
    }, {
      areaName: areaName
    }]
  };

  appCms.findOne(query, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    res.json({ token: req.headers['x-access-token'], success: 1, data: result })
    //res.send(result);
  });
});
// End of Find by Module Name and Area Name

// Find by Module Name
router.get("/getContent/:moduleName", function (req, res) {
  let moduleName = req.params.moduleName;

  let query = {
    moduleName: moduleName
  };

  appCms.find(query, function (err, result) {
    if (err) return res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    if (result) {
      res.json({ token: req.headers['x-access-token'], success: 1, data: result })
    } else {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "Module not found / Doesnot exist!" });
    }

  });
});
// End of Find by Module Name

// FAQs template
router.get("/getfaqs", function (req, res) {

  res.render("faqs");
});
// End of FAQs template

// Render Demo
router.get("/demo", function (req, res) {
  res.render("demo");
});
// End of Render Demo


// update FAQs template
router.post("/updatefaqs", upload.single('updatefaq'), function (req, res) {
  if (req.file.mimetype == 'text/html') {
    fs.readFile('views/' + req.file.filename, 'utf-8', function (err, buf) {
      fs.writeFile('views/faqs.ejs', buf.toString(), (err) => {
        // // throws an error, you could also catch it here
        if (err) throw err;
        // success case, the file was saved
        res.json({
          "message": "FAQ template uploaded"
        });
      });
    });
    // end of write to a new file
  } else {
    res.json({
      "error": "File type must be 'html'"
    });
  }
});
// End of update FAQs template

// Contact Us template
router.get("/contactuspage", function (req, res) {

  res.render("contactus");
});
// End of Contact Us template

// About Us template
router.get("/aboutuspage", function (req, res) {

  res.render("aboutus");
});
// End of About Us template

// About Us template
// const appleIdData = require('../../appliId')
// router.get("/appleId", function (req, res) {
//   res.send(appleIdData);
// });
// End of About Us template

// Delete by appCms
router.delete("/delete/:appCmsId", function (req, res, next) {
  let id = req.params.appCmsId;

  appCms.findById(id, function (err, result) {
    if (result) {
      appCms.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({
          message: "Deleted appCms document successfully"
        });
      });
    } else {
      res.json({
        error: "appCms Info not found / Invalid ID"
      });
    }
  });
});
// End of Delete by appCms

module.exports = router;