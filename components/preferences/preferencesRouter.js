let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let Preferences = require("./preferencesModel");
let MemberPreferences = require("../memberpreferences/memberpreferencesModel");
let preferenceController = require('./preferenceController');
var cron = require('node-cron');
let preferenceServices = require('./preferenceServices');
//let preferenceList = [];
global.preferenceList = [];

router.get("/getAllPreferances/:userId", function (req, res) {
  //console.log(global.preferenceList)
  let preferenceList = global.preferenceList;
  // console.log("preferenceList",global.preferenceList);
  MemberPreferences.findOne({ memberId: ObjectId(req.params.userId) }, (err, MemberPreference) => {
    if (err) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: err });
    }
    else {
      //console.log("preferenceList",preferenceList);

      preferenceList.map((parentPreferenceObj) => {
        //console.log("parentPreferenceObj",parentPreferenceObj);
        let Categories = parentPreferenceObj.Categories.filter((catagoryObj) => {
          //console.log("catagoryObj",catagoryObj);
          if (catagoryObj.celebsByPreferences.length > 0) {
            //catagoryObj.celebsByPreferences = [];
            return parentPreferenceObj;
          }
        })
        parentPreferenceObj.Categories = Categories.map((catagoryObj) => {
          //console.log("parentPreferenceObj",catagoryObj);
          if (MemberPreference) {
            catagoryObj.isSelected = MemberPreference.preferences.some((userPrefernceId) => {
              //console.log("test")
              return userPrefernceId.toString() == catagoryObj._id.toString();
            })
          }
          else {
            catagoryObj.isSelected = false;
          }
          return catagoryObj;
        });
        parentPreferenceObj.isSelectedAll = !(parentPreferenceObj.Categories.some((catagoryObj) => {
          return catagoryObj.isSelected == false
        }))
        return parentPreferenceObj;
      });
      let prefernceListUser = preferenceList.filter((preferenceObj) => {

        if (preferenceObj.Categories.length > 0) {
          //console.log("preferenceObj",preferenceObj);
          return preferenceObj
        }

      })
      res.json({ token: req.headers['x-access-token'], success: 1, data: prefernceListUser });
      //console.log(globalString);
    }
  });

});

var newPreferences = cron.schedule('*/1 * * * *', function (req, res) {

  // console.log("globalString"); // Output: "This can be accessed anywhere!"

  Preferences.aggregate(
    [
      {
        $match: { parentPreferenceId: null }
      },
      {
        $lookup: {
          from: "preferences",
          localField: "_id",
          foreignField: "parentPreferenceId",
          as: "Categories"
        }
      },
      { $unwind: { path: "$Categories", preserveNullAndEmptyArrays: true } },
      { $sort: { "Categories.preferenceName": 1 } },
      {
        $lookup: {
          from: "users",
          localField: "Categories._id",
          foreignField: "preferenceId",
          as: "Categories.celebsByPreferences"
        }
      },
      {
        $group: {
          "_id": "$_id",
          "preferenceName": { $first: "$preferenceName" },
          "updated_at": { $first: "$updated_at" },
          "created_at": { $first: "$created_at" },
          "countries": { $first: "$countries" },
          "professions": { $first: "$professions" },
          "logoURL": { $first: "$logoURL" },
          "parentPreferenceId": { $first: "$parentPreferenceId" },
          "Categories": { $push: "$Categories" },
        }
      },
      {
        $project: {
          _id: 1,
          preferenceName: 1,
          updated_at: 1,
          created_at: 1,
          countries: 1,
          professions: 1,
          logoURL: 1,
          parentPreferenceId: 1,
          Categories: {
            _id: 1,
            preferenceName: 1,
            updated_at: 1,
            created_at: 1,
            countries: 1,
            logoURL: 1,
            parentPreferenceId: 1,
            celebsByPreferences: {
              preferenceId: 1,
              firstName: 1,
              lastName: 1,
              isCeleb: 1
            }
          },
        }
      },
      { $sort: { "preferenceName": 1 } },
    ],
    function (err, preferenceList) {
      if (err) {
        console.log(err);
        //res.json({ token: req.headers['x-access-token'], success: 0, message: err });
      }

      //console.log(" ====================== @@@@@@@ ",preferenceList)
      // let arr = [];
      // for (let i = 0; i < preferenceList.length; i++) {
      //   let catObjArr = [];
      //   for (let j = 0; j < preferenceList[i].Categories.length; j++) {
      //     let catObjObj = null;
      //     if (preferenceList[i].Categories[j].celebsByPreferences.length > 0) {
      //       catObjObj = preferenceList[i].Categories[j];
      //       catObjObj.celebsByPreferences = [];
      //     }
      //     if (catObjObj)
      //       catObjArr.push(catObjObj);
      //   }
      //   preferenceList[i].Categories = [];
      //   preferenceList[i].Categories.push(catObjArr);
      // }
      // console.log(" =======CHILL =============== @@@@@@@ ", preferenceList)
      // arr = preferenceList


      //console.log("prefernceList",prefernceList);
      global.preferenceList = preferenceList;
      //global.preferenceList;
      //res.json({ token: req.headers['x-access-token'], success: 1, data: prefernceList });
    });

}, false);
newPreferences.start();

// createPreferences start(now using in backend please integrate to admin and delete from here) 
router.post('/createPreferences', preferenceController.createPreferences)
// End createPreferences


// getPreferencesList start
// router.get("/getPreferencesList", function (req, res) {
//   Preferences.find(function (err, users) {
//     if (err) return next(err);
//     res.json(users);
//   });
// });
// End getPreferencesList


// get preferences by parentlist start

router.get("/getPreferencesByParentlist", function (req, res, next) {
  let parentPreferenceId = "null";
  // console.log("AAAAAAAAAAAAAAAAAA")
  Preferences.aggregate(
    [
      { $match: { "parentPreferenceId": { $in: [null] } } },
      {
        $lookup: {
          from: "preferences",
          localField: "_id",
          foreignField: "parentPreferenceId",
          as: "categories"
        }
      },
      { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "categories._id",
      //     foreignField: "preferenceId",
      //     as: "categories.celebsByPreferences"
      //   }
      // },
      { $sort: { "categories.preferenceName": 1 } },
      {
        $group: {
          "_id": "$_id",
          "preferenceName": { $first: "$preferenceName" },
          "updated_at": { $first: "$updated_at" },
          "created_at": { $first: "$created_at" },
          "countries": { $first: "$countries" },
          "professions": { $first: "$professions" },
          "logoURL": { $first: "$logoURL" },
          "parentPreferenceId": { $first: "$parentPreferenceId" },
          "categories": { $push: "$categories" },
          //"Categories": { $push: { Categories : "$Categories", quantity: "$Categories.celebsByPreferences" } },
          // "celebsByPreferences":{$push:"$Categories.celebsByPreferences"},

          //itemsSold: { $push:  { item: "$Categories", quantity: "$Categories.celebsByPreferences" } }
        }
      },
      {
        $project: {
          preferenceName: 1,
          professions: 1,
          PreferenceId: 1,
          categories: {
            preferenceName: 1,
            _id: 1
          },
        }
      },
      { $sort: { "preferenceName": 1 } },
    ],
    //old query
    // [
    //   { $match: { "parentPreferenceId": { $in: [null] } } },
    //   {
    //     $project: {
    //       _id: 0,
    //       preferenceName: 1,
    //       professions: 1
    //     }
    //   }

    // ],
    function (err, data) {
      if (err) {
        return res.status(404).json({ success: 0, err: err });
      } else {
        // console.log(data);
        // data.map((preferenceObj) => {
        //   let catArr = [];
        //   preferenceObj.categories.map((catObj) => {
        //     catArr.push(catObj.preferenceName);
        //   })
        //   preferenceObj.categories = catArr
        // })
        return res.status(200).json({ success: 1, data: data });
      }

    }
  );
});

// router.get("/getPreferencesByParentId", function (req, res, next) {
//   let parentPreferenceId = "null";
//   preferenceServices.findParentPrefrence((err, listOfParentPreference) => {
//     if (err)
//       return res.status(404).json({ success: 0, message: "Error while fetching the parent preference ", err });
//     else {
//       preferenceServices.findPreference(listOfParentPreference, (err, listOfPreferenceObj) => {
//         if (err)
//           return res.status(404).json({ success: 0, message: "Error while fetching preference ", err });
//         else {
//           return res.status(200).json({ success: 1, data: listOfPreferenceObj });
//         }
//       })
//     }
//   })




// });

// End get preferences by parentlist
// get preferences by parentId start

// router.get("/getPreferencesByParentId/:parentPreferenceId", function (req, res, next) {
//   let parentPreferenceId = req.params.parentPreferenceId;
//   Preferences.getPreferencesByParentId(parentPreferenceId, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "No preferences found"
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });
// End get preferences by parentId

// get profession by preference name start

// router.get("/getProfessionByPreferenceName/:preferenceName", function (req, res, next) {
//   let preferenceName = req.params.preferenceName;
//   Preferences.getProfessionByPreferenceName(preferenceName, function (err, result) {
//     if (result == null) {
//       res.json({
//         error: "No preferences found"
//       });
//     } else {
//       res.send(result[0].professions);
//     }
//   });
// });

// End get profession by preference name

// Edit a preferences start (add in admin and delete from here)
// router.put("/edit/:Preferences_id", function (req, res) {
//   let preferenceName = req.body.preferenceName;
//   let parentPreferenceId = ObjectId(req.body.parentPreferenceId);
//   let countries = req.body.countries;
//   let created_at = req.body.created_at;
//   let updated_at = req.body.updated_at;

//   let reqbody = req.body;
//   reqbody.updated_at = new Date;
//   reqbody.parentPreferenceId = parentPreferenceId;
//   let id = req.params.Preferences_id;
//   Preferences.editPreferences(id, reqbody, function (err, result) {
//     res.send(result);

//   });

// });
// End Edit a preferences

// Find by Id  start

// router.get("/getPreferences/:id", function (req, res) {
//   let id = req.params.id;
//   Preferences.getPreferencesById(id, function (err, result) {
//     res.send(result);
//   });
// });
// End Find by Id

// getPreferencesByParentID start

// router.post("/getPreferencesParentID", function (req, res) {
//   let newArr = req.body.parentPreferenceIds;
//   let parentPreferenceId = newArr.map(function (id) {
//     return ObjectId(id);
//   });
//   Preferences.find({ "parentPreferenceId": { "$in": parentPreferenceId } }, function (err, result) {
//     res.send(result);
//   });
// });

// End getPreferencesByParentID


// Delete by PreferencesID start (please integrate in admin and delete from here)
// router.delete("/delete/:preferencesID", function (req, res, next) {
//   let id = req.params.preferencesID;

//   Preferences.findById(id, function (err, result) {
//     if (result) {
//       Preferences.findByIdAndRemove(id, function (err, post) {
//         if (err) return next(err);
//         res.json({ message: "Deleted Preferences Successfully" });
//       });
//     } else {
//       res.json({ error: "PreferencesID not found / Invalid" });
//     }
//   });

// });
// End Delete by PreferencesID

module.exports = router;
