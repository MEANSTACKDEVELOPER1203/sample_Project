// Case 1
celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
    if (err) {
      res.json({ usersDetail: null, err: err })
    }
    else {
      let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
      let getCeleByTime = req.params.createdAt;
      limit = parseInt(20);
      if (getCeleByTime == null || getCeleByTime == "null" || getCeleByTime == "0") {
        getCeleByTime = new Date();
      }
      User.aggregate(
        [
          // { "$limit": 1 },
          {
            $addFields: {
              name: {
                $concat: [
                  '$firstName',
                  ' ',
                  '$lastName',
                ]
              },
              fsize: { $strLenCP: '$firstName' },
              lsize: { $strLenCP: '$lastName' },
              frank: { $indexOfCP: [{ $toLower: '$firstName' }, searchString] },
              fsrank: { $indexOfCP: [{ $toLower: '$firstName' }, " "] },
              lrank: { $indexOfCP: [{ $toLower: '$lastName' }, searchString] },
              lsrank: { $indexOfCP: [{ $toLower: '$lastName' }, " "] },

            }
          },
          {
            "$facet": {
              "c1": [
                {
                  "$match": {
                    $or: [{
                      $and: [
                        { _id: { $in: objectIdArray } },
                        { firstName: { $regex: new RegExp("^" + searchString, "i") } },
                        // { firstName: { $regex: searchString, '$options': 'im' } },
                        { isCeleb: true },
                        { IsDeleted: false },
                        { created_at: { $lt: new Date(getCeleByTime) } }
                      ]
                    }],
                    // $and: [
                    //   { _id: { $in: objectIdArray } },
                    //   { firstName: { $regex: searchString, '$options': 'im' } },
                    //   { isCeleb: true },
                    //   { IsDeleted: false },

                    //   //{ created_at: {$lt:new Date(getCeleByTime)} }
                    // ],
                    // created_at: { $lt: new Date(getCeleByTime) }
                  }
                }
              ],
              "c2": [
                {
                  "$match": {
                    $or: [{
                      $and: [
                        { _id: { $in: objectIdArray } },
                        //{ lastName: { $regex: searchString, '$options': 'm' } },
                        { lastName: { $regex: searchString, '$options': 'im' } },
                        { isCeleb: true },
                        { IsDeleted: false },
                        { created_at: { $lt: new Date(getCeleByTime) } }
                      ]
                    }],
                    // $and: [
                    //   { _id: { $in: objectIdArray } },
                    //   { lastName: { $regex: searchString, '$options': 'im' } },
                    //   { isCeleb: true },
                    //   { IsDeleted: false },
                    //   //{  }
                    // ],
                    // created_at: { $lt: new Date(getCeleByTime) }
                  }
                }
              ],
              // "c3": [
              //     {
              //       "$match": {
              //         $or: [{
              //           $and: [
              //             { _id: { $in: objectIdArray } },
              //             { firstName: { $regex: searchString, '$options': 'im' } },
              //             { isCeleb: true },
              //             { IsDeleted: false },
              //             { created_at: { $lt: new Date(getCeleByTime) } }
              //           ]
              //         }],
              //         // $and: [
              //         //   { _id: { $in: objectIdArray } },
              //         //   { name: { $regex: searchString, '$options': 'im' } },
              //         //   { isCeleb: true },
              //         //   { IsDeleted: false }
              //         // ],
              //         // created_at: { $lt: new Date(getCeleByTime) }
              //       }
              //     }
              //   ]
            }
          },

          {
            "$project": {
              "data": {
                "$concatArrays": ["$c1"]
              }
            }
          },
          { "$unwind": "$data" },
          { "$replaceRoot": { "newRoot": "$data" } },
          {
            $sort: { created_at: -1 }
          },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              firstName: 1,
              frank1: {
                $cond: {
                  if: { $eq: ["$frank", -1] }, then: 1000,
                  else: "$frank"
                }
              },
              lastName: 1,
              avtar_imgPath: 1,
              profession: 1,
              isCeleb: 1,
              isOnline: 1,
              isPromoted: 1,
              isTrending: 1,
              aboutMe: 1,
              email: 1,
              isEditorChoice: 1,
              username: 1,
              created_at: 1,
              frank: 1,
              fsize: 1,
              lrank: 1,
              lsize: 1,
              nrank: 1,
              nrank: { $indexOfCP: [{ $toLower: '$name' }, searchString] },
              nsize: { $strLenCP: '$name' },
              rdiff: { $subtract: ["$frank", { $add: ["$fsrank", 1] }] },
              ldiff: { $subtract: ["$lrank", { $add: ["$lsrank", 1] }] },
              // sortField:
              // {
              //   "$cond": [{ "$eq": ["$firstName", searchString] }, 1,
              //   {
              //     "$cond": [{ "$eq": ["$firstName", searchString] }, 2,
              //       3]
              //   }]
              // },

            }
          },

          {
            $match: {
              $or: [{ nrank: 0 }, { rdiff: 0 }, { ldiff: 0 }, { frank: 0 }, { lrank: 0 }]
            }
          },
          {
            $sort: {
              frank1: 1, fsize: 1, lrank: 1, lsize: 1
            }
          },
          // {
          //   $sort: { created_at: -1 }
          // },
          // { $limit: limit }
          // {$sort:{"sortField":1}}
          // {
          //   $sort: {
          //     firstName: 1
          //   }
          // }
        ],
        function (err, data) {
          // console.log(data.length)
          if (err) {
            //res.send(err);
            res.json({ err })
          } else if (data.length == limit) {
            data = data.filter(function (obj) {
              return obj.isCeleb !== false;
            });
            console.log("2222 ", data.length)
            data.forEach((user) => {
              for (i = 0; i < data.length; i++) {
                if ((user._id.toString() == data[i]._id.toString()) && i != data.indexOf(user)) {
                  data.splice(i, 1);
                }
              }
            })
            console.log("333 ", data.length)
            for (var i = 0; i < data.length; i++) {
              let currentCelebId = data[i]._id;
              currentCelebId = "" + currentCelebId;
              if (currentCelebId == id) {
                data.splice(i, 1);
                break;
              }
            }
            paginationDate = data[data.length - 1].created_at;
            data.sort(function (a, b) {
              if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
              if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
              return 0;
            })
            return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: data, paginationDate: paginationDate });
            //return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: { searchCelebInfo: data, paginationDate: paginationDate } });
          }
          else {
            let firstNameIds = data.map((celeb) => {
              return (celeb._id)
            })
            limit2 = limit - data.length;
            console.log("LIMIT2", limit2, data.length)
            User.aggregate([
              {
                $addFields: {
                  name: {
                    $concat: [
                      '$firstName',
                      ' ',
                      '$lastName',
                    ]
                  },
                  fsize: { $strLenCP: '$firstName' },
                  lsize: { $strLenCP: '$lastName' },
                  frank: { $indexOfCP: [{ $toLower: '$firstName' }, searchString] },
                  fsrank: { $indexOfCP: [{ $toLower: '$firstName' }, " "] },
                  lrank: { $indexOfCP: [{ $toLower: '$lastName' }, searchString] },
                  lsrank: { $indexOfCP: [{ $toLower: '$lastName' }, " "] },

                }
              },
              {
                "$facet": {
                  "c1": [
                    {
                      "$match": {
                        $or: [{
                          $and: [
                            { _id: { $in: objectIdArray } },
                            //{ firstName: { $regex: new RegExp("^" + searchString, "i") } },
                            { firstName: { $regex: searchString, '$options': 'im' } },
                            { isCeleb: true },
                            { IsDeleted: false },
                            { created_at: { $lt: new Date(getCeleByTime) } }
                          ]
                        }],
                        // $and: [
                        //   { _id: { $in: objectIdArray } },
                        //   { firstName: { $regex: searchString, '$options': 'im' } },
                        //   { isCeleb: true },
                        //   { IsDeleted: false },

                        //   //{ created_at: {$lt:new Date(getCeleByTime)} }
                        // ],
                        // created_at: { $lt: new Date(getCeleByTime) }
                      }
                    }
                  ],
                  "c2": [
                    {
                      "$match": {
                        $or: [{
                          $and: [
                            { _id: { $in: objectIdArray } },
                            { _id: { $nin: firstNameIds } },
                            { lastName: { $regex: new RegExp("^" + searchString, "i") } },
                            // { lastName: { $regex: searchString, '$options': 'im' } },
                            { isCeleb: true },
                            { IsDeleted: false },
                            { created_at: { $lt: new Date(getCeleByTime) } }
                          ]
                        }],
                        // $and: [
                        //   { _id: { $in: objectIdArray } },
                        //   { lastName: { $regex: searchString, '$options': 'im' } },
                        //   { isCeleb: true },
                        //   { IsDeleted: false },
                        //   //{  }
                        // ],
                        // created_at: { $lt: new Date(getCeleByTime) }
                      }
                    }
                  ],
                  // "c3": [
                  //     {
                  //       "$match": {
                  //         $or: [{
                  //           $and: [
                  //             { _id: { $in: objectIdArray } },
                  //             { firstName: { $regex: searchString, '$options': 'im' } },
                  //             { isCeleb: true },
                  //             { IsDeleted: false },
                  //             { created_at: { $lt: new Date(getCeleByTime) } }
                  //           ]
                  //         }],
                  //         // $and: [
                  //         //   { _id: { $in: objectIdArray } },
                  //         //   { name: { $regex: searchString, '$options': 'im' } },
                  //         //   { isCeleb: true },
                  //         //   { IsDeleted: false }
                  //         // ],
                  //         // created_at: { $lt: new Date(getCeleByTime) }
                  //       }
                  //     }
                  //   ]
                }
              },
              {
                "$project": {
                  "data": {
                    "$concatArrays": ["$c2"]
                  }
                }
              },
              { "$unwind": "$data" },
              { "$replaceRoot": { "newRoot": "$data" } },
              {
                $sort: { created_at: -1 }
              },
              { $limit: limit2 },
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  frank1: {
                    $cond: {
                      if: { $eq: ["$frank", -1] }, then: 1000,
                      else: "$frank"
                    }
                  },
                  lastName: 1,
                  avtar_imgPath: 1,
                  profession: 1,
                  isCeleb: 1,
                  isOnline: 1,
                  isPromoted: 1,
                  isTrending: 1,
                  aboutMe: 1,
                  email: 1,
                  isEditorChoice: 1,
                  username: 1,
                  created_at: 1,
                  frank: 1,
                  fsize: 1,
                  lrank: 1,
                  lsize: 1,
                  nrank: 1,
                  nrank: { $indexOfCP: [{ $toLower: '$name' }, searchString] },
                  nsize: { $strLenCP: '$name' },
                  rdiff: { $subtract: ["$frank", { $add: ["$fsrank", 1] }] },
                  ldiff: { $subtract: ["$lrank", { $add: ["$lsrank", 1] }] },
                  // sortField:
                  // {
                  //   "$cond": [{ "$eq": ["$firstName", searchString] }, 1,
                  //   {
                  //     "$cond": [{ "$eq": ["$firstName", searchString] }, 2,
                  //       3]
                  //   }]
                  // },

                }
              },

              {
                $match: {
                  $or: [{ nrank: 0 }, { rdiff: 0 }, { ldiff: 0 }, { frank: 0 }, { lrank: 0 }]
                }
              },
              {
                $sort: {
                  frank1: 1, fsize: 1, lrank: 1, lsize: 1
                }
              },

              // {$sort:{"sortField":1}}
              // {
              //   $sort: {
              //     firstName: 1
              //   }
              // }
            ], function (err, data2) {
              if (err) {
                res.send(err)
              } else {
                console.log("data2", data2.length);
                if (data.length > 0)
                  paginationDate = data[data.length - 1].created_at;
                if (data.length <= 0)
                  paginationDate = data2[data2.length - 1].created_at;
                data.sort(function (a, b) {
                  if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
                  if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
                  return 0;
                })
                data2.sort(function (a, b) {
                  if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) { return -1; }
                  if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) { return 1; }
                  return 0;
                })
                // data2 = data2.filter(function (obj) {
                //   return obj.isCeleb !== false;
                // });
                console.log("Data 111 ===  ", data.length, "Data 2222 ===  ", data2.length)
                Array.prototype.push.apply(data, data2)
                // console.log("2222 ", data2.length)
                data.forEach((user) => {
                  for (i = 0; i < data.length; i++) {
                    if ((user._id.toString() == data[i]._id.toString()) && i != data.indexOf(user)) {
                      data.splice(i, 1);
                    }
                  }
                })
                // data2.forEach((user) => {
                //   for (i = 0; i < data2.length; i++) {
                //     if ((user._id.toString() == data2[i]._id.toString()) && i != data2.indexOf(user)) {
                //       data2.splice(i, 1);
                //     }
                //   }
                // })
                // console.log("333 ", data2.length)

                // for (var i = 0; i < data2.length; i++) {
                //   let currentCelebId = data2[i]._id;
                //   currentCelebId = "" + currentCelebId;
                //   if (currentCelebId == id) {
                //     data2.splice(i, 1);
                //     break;
                //   }
                // }
                for (var i = 0; i < data.length; i++) {
                  let currentCelebId = data[i]._id;
                  currentCelebId = "" + currentCelebId;
                  if (currentCelebId == id) {
                    data.splice(i, 1);
                    break;
                  }
                }
                console.log("DATA final ====== ", data.length)
                //return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: { searchCelebInfo: data, paginationDate: paginationDate } });
                return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: data, paginationDate: paginationDate });
              }
            })
            //return res.send(data);
          }
        });
    }
  });
  // Casee 2
  celebrityContract.distinct("memberId", (err, contractsCelebArray) => {
    if (err) {
      res.json({ usersDetail: null, err: err })
    }
    else {
      let objectIdArray = contractsCelebArray.map(s => mongoose.Types.ObjectId(s));
      let getCeleByTime = req.params.createdAt;
      limit = parseInt(10);
      if (getCeleByTime == null || getCeleByTime == "null" || getCeleByTime == "0") {
        getCeleByTime = new Date();
      }
      User.aggregate(
        [
          // { "$limit": 1 },
          {
            $addFields: {
              name: {
                $concat: [
                  '$firstName',
                  ' ',
                  '$lastName',
                ]
              },
              fsize: { $strLenCP: '$firstName' },
              lsize: { $strLenCP: '$lastName' },
              frank: { $indexOfCP: [{ $toLower: '$firstName' }, searchString] },
              fsrank: { $indexOfCP: [{ $toLower: '$firstName' }, " "] },
              lrank: { $indexOfCP: [{ $toLower: '$lastName' }, searchString] },
              lsrank: { $indexOfCP: [{ $toLower: '$lastName' }, " "] },

            }
          },
          {
            "$facet": {
              "c1": [
                {
                  "$match": {
                    $or: [{
                      $and: [
                        { _id: { $in: objectIdArray } },
                        { firstName: { $regex: searchString, '$options': 'im' } },
                        { isCeleb: true },
                        { IsDeleted: false },
                        { created_at: { $lt: new Date(getCeleByTime) } }
                      ]
                    }]
                  }
                }
              ],
              "c2": [
                {
                  "$match": {
                    $and: [
                      { _id: { $in: objectIdArray } },
                      { lastName: { $regex: searchString, '$options': 'im' } },
                      { isCeleb: true },
                      { IsDeleted: false }
                    ]
                  }
                }
              ],
              "c3": [
                {
                  "$match": {
                    $and: [
                      { _id: { $in: objectIdArray } },
                      { name: { $regex: searchString, '$options': 'im' } },
                      { isCeleb: true },
                      { IsDeleted: false }
                    ]
                  }
                }
              ]
            }
          },
          {
            "$project": {
              "data": {
                "$concatArrays": ["$c1"]
              }
            }
          },
          { "$unwind": "$data" },
          { "$replaceRoot": { "newRoot": "$data" } },
          {
            $sort: { created_at: -1 }
          },
          {
            $limit: limit
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              frank1: {
                $cond: {
                  if: { $eq: ["$frank", -1] }, then: 1000,
                  else: "$frank"
                }
              },
              lastName: 1,
              avtar_imgPath: 1,
              profession: 1,
              isCeleb: 1,
              isOnline: 1,
              isPromoted: 1,
              isTrending: 1,
              aboutMe: 1,
              email: 1,
              isEditorChoice: 1,
              username: 1,
              created_at: 1,
              frank: 1,
              fsize: 1,
              lrank: 1,
              lsize: 1,
              nrank: 1,
              nrank: { $indexOfCP: [{ $toLower: '$name' }, searchString] },
              nsize: { $strLenCP: '$name' },
              rdiff: { $subtract: ["$frank", { $add: ["$fsrank", 1] }] },
              ldiff: { $subtract: ["$lrank", { $add: ["$lsrank", 1] }] },
              // sortField:
              // {
              //   "$cond": [{ "$eq": ["$firstName", searchString] }, 1,
              //   {
              //     "$cond": [{ "$eq": ["$firstName", searchString] }, 2,
              //       3]
              //   }]
              // },

            }
          },
          {
            $match: {
              $or: [{ nrank: 0 }, { rdiff: 0 }, { ldiff: 0 }, { frank: 0 }, { lrank: 0 }]
            }
          },
          {
            $sort: {
              frank1: 1, fsize: 1, lrank: 1, lsize: 1
            }
          },

          // {$sort:{"sortField":1}}
          // {
          //   $sort: {
          //     firstName: 1
          //   }
          // }
        ],
        function (err, data) {
          console.log("DATA Lenght==== ", data.length)
          if (err) {
            //res.send(err);
            res.json({ err })
          } else if (data.length == limit) {
            // data = data.filter(function (obj) {
            //   return obj.isCeleb !== false;
            // });
            // data.forEach((user) => {
            //   for (i = 0; i < data.length; i++) {
            //     if ((user._id.toString() == data[i]._id.toString()) && i != data.indexOf(user)) {
            //       data.splice(i, 1);
            //     }
            //   }
            // })
            for (var i = 0; i < data.length; i++) {
              let currentCelebId = data[i]._id;
              currentCelebId = "" + currentCelebId;
              if (currentCelebId == id) {
                data.splice(i, 1);
                break;
              }
            }
            paginationDate = data[data.length - 1].created_at;
            data.sort(function (a, b) {
              if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
              if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
              return 0;
            })
            console.log("paginationDate ========= ", paginationDate)
            return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: data, paginationDate: paginationDate });

            //return res.send(data);
          } else {
            let firstNameIds = data.map((celeb) => {
              return (celeb._id)
            })
            firstNameIds.push(ObjectId(id))
            limit = limit - data.length;
            User.aggregate([
              {
                $addFields: {
                  name: {
                    $concat: [
                      '$firstName',
                      ' ',
                      '$lastName',
                    ]
                  },
                  fsize: { $strLenCP: '$firstName' },
                  lsize: { $strLenCP: '$lastName' },
                  frank: { $indexOfCP: [{ $toLower: '$firstName' }, searchString] },
                  fsrank: { $indexOfCP: [{ $toLower: '$firstName' }, " "] },
                  lrank: { $indexOfCP: [{ $toLower: '$lastName' }, searchString] },
                  lsrank: { $indexOfCP: [{ $toLower: '$lastName' }, " "] },

                }
              },
              {
                "$facet": {
                  "c1": [
                    {
                      "$match": {
                        $or: [{
                          $and: [
                            { _id: { $in: objectIdArray } },
                            { firstName: { $regex: searchString, '$options': 'im' } },
                            { isCeleb: true },
                            { IsDeleted: false },
                            { created_at: { $lt: new Date(getCeleByTime) } }
                          ]
                        }]
                      }
                    }
                  ],
                  "c2": [
                    {
                      "$match": {
                        $or: [{
                          $and: [
                            { _id: { $in: objectIdArray } },
                            { _id: { $nin: firstNameIds } },
                            { lastName: { $regex: searchString, '$options': 'im' } },
                            { isCeleb: true },
                            { IsDeleted: false },
                          ]
                        }]
                        // $and: [
                        //   { _id: { $in: objectIdArray } },
                        //   { lastName: { $regex: searchString, '$options': 'im' } },
                        //   { isCeleb: true },
                        //   { IsDeleted: false }
                        // ]
                      }
                    }
                  ],
                  "c3": [
                    {
                      "$match": {
                        $and: [
                          { _id: { $in: objectIdArray } },
                          { name: { $regex: searchString, '$options': 'im' } },
                          { isCeleb: true },
                          { IsDeleted: false }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                "$project": {
                  "data": {
                    "$concatArrays": ["$c2"]
                  }
                }
              },
              { "$unwind": "$data" },
              { "$replaceRoot": { "newRoot": "$data" } },
              {
                $sort: { created_at: -1 }
              },
              {
                $limit: limit
              },
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  frank1: {
                    $cond: {
                      if: { $eq: ["$frank", -1] }, then: 1000,
                      else: "$frank"
                    }
                  },
                  lastName: 1,
                  avtar_imgPath: 1,
                  profession: 1,
                  isCeleb: 1,
                  isOnline: 1,
                  isPromoted: 1,
                  isTrending: 1,
                  aboutMe: 1,
                  email: 1,
                  isEditorChoice: 1,
                  username: 1,
                  created_at: 1,
                  frank: 1,
                  fsize: 1,
                  lrank: 1,
                  lsize: 1,
                  nrank: 1,
                  nrank: { $indexOfCP: [{ $toLower: '$name' }, searchString] },
                  nsize: { $strLenCP: '$name' },
                  rdiff: { $subtract: ["$frank", { $add: ["$fsrank", 1] }] },
                  ldiff: { $subtract: ["$lrank", { $add: ["$lsrank", 1] }] },
                }
              },
              {
                $match: {
                  $or: [{ nrank: 0 }, { rdiff: 0 }, { ldiff: 0 }, { frank: 0 }, { lrank: 0 }]
                }
              },
              {
                $sort: {
                  frank1: 1, fsize: 1, lrank: 1, lsize: 1
                }
              },
            ], function (err, data2) {
              if (err) {
                res.json({ err })
              } else {
                if (data.length > 0)
                  paginationDate = data[data.length - 1].created_at;
                data.sort(function (a, b) {
                  if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
                  if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
                  return 0;
                })
                data2.sort(function (a, b) {
                  if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) { return -1; }
                  if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) { return 1; }
                  return 0;
                })
                // Array.push.apply(data, data2)
                data.concat(data2)
                return res.status(200).json({ token: req.headers['x-access-token'], success: 1, data: data, paginationDate: paginationDate });
              }
            })
          }
        });
    }
  });