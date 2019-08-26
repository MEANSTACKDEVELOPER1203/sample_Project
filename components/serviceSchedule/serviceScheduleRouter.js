let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let serviceSchedule = require("./serviceScheduleModel");
let cart = require("../cart/cartModel");
let serviceTransaction = require("../serviceTransaction/serviceTransactionModel");
let User = require("../users/userModel");
let slotMaster = require("../slotMaster/slotMasterModel");

// Create a serviceSchedule start

router.post("/createServiceSchedule", function (req, res) {
  let service_type = req.body.service_type;
  let senderId = req.body.senderId;
  let receiverId = req.body.receiverId;
  let startTime = req.body.startTime;
  let endTime = req.body.endTime;
  let credits = req.body.credits;
  let refSlotId = req.body.refSlotId;
  let refCartId = req.body.refCartId;
  let actualChargedCredits = req.body.actualChargedCredits;
  let createdBy = req.body.createdBy;

  serviceSchedule.aggregate(
    [
      {
        $match: {
          $or: [{ receiverId: ObjectId(receiverId) }]
        }
      }
    ],
    function (err, result) {
      if (err) {
        res.json({token:req.headers['x-access-token'],success:0,message:err});
      }
      //console.log("receiver details")
          //console.log(result)
      if ((result.length == 0)) {
        //console.log("Step1");
        let senderScheduleExists = false;
        //console.log("senderId == " + senderId)
      serviceSchedule.aggregate(
        [
          {
            $match: {
              $or: [{ receiverId: ObjectId(senderId) }]
            }
          }
        ],
        function (err, sResult) {
          if (err) {
            console.log(err);
          }
          //console.log("sender details")
         // console.log(sResult)
          if (sResult.length == 1) {
            let oldStartTime = new Date(startTime);
            let newStartTime = new Date(sResult[0].startTime);
            let newEndTime = new Date(sResult[0].endTime);
            // Check if the timeline is in between two start dates picked from the result
            if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
              senderScheduleExists = true;
              //console.log("sender 1 == " + senderScheduleExists)
            }
          }
          if (sResult.length >= 2) {
            for (let i = 0; i < result.length; i++) {
              newStartTime = new Date(sResult[i].startTime);
              newEndTime = new Date(sResult[i].endTime);
              if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
                senderScheduleExists = true;
                //console.log("sender 1 == " + senderScheduleExists)
                break;
              }

            }
          }
          //console.log("before create sendeScheduleExits ==" + senderScheduleExists)
        if(senderScheduleExists == true) {
          res.json({token:req.headers['x-access-token'],success:0,message:"Schedule already exits in given time line. please change the time and create new one"})
        } else {
                  // Start of No Schedules Exits!!
        let newServiceSchedule = new serviceSchedule({
          service_type: service_type,
          senderId: senderId,
          receiverId: receiverId,
          startTime: startTime,
          endTime: endTime,
          credits: credits,
          refCartId: refCartId,
          refSlotId: refSlotId,
          actualChargedCredits: actualChargedCredits,
          createdBy: createdBy
        });

        serviceSchedule.createServiceSchedule(newServiceSchedule, function (
          err,
          result
        ) {
          if (err) {
            res.send(err);
          } else {
            res.json({token:req.headers['x-access-token'],success:1,message: "serviceSchedule created Successfully"})
            //res.json({ message: "serviceSchedule created Successfully" });
            let serviceTransactionRecord = new serviceTransaction({
              serviceCode: 789,
              serviceType: service_type,
              senderId: senderId,
              receiverId: receiverId,
              scheduleId: result._id,
              startTime: startTime,
              endTime: endTime,
              refCartId: refCartId,
              refSlotId: refSlotId,
              serviceStatus: "scheduled"
            });

            // Update Cart

            if (refCartId) {
              let id = refCartId;
              let reqbody = req.body;
              reqbody.cartStatus = "converted";
              reqbody.updatedBy = req.body.updatedBy;
              reqbody.updatedAt = new Date();

              cart.editCart(id, reqbody, function (err, cResult) {
                if (err) {

                } else {
                }
              });
            }

            serviceTransaction.serviceTransaction(serviceTransactionRecord, function (
              err,
              user
            ) {
              if (err) {
                res.send(err);
              } else {

                // created serviceType+TimeStamp format for lastActivity Field in UserObject
                User.findById(senderId, function (err, uResult) {
                  let oldValue = parseInt(uResult.cumulativeSpent);
                  let newbody = {};
                  //  newbody.cumulativeSpent = parseInt(req.body.credits) + oldValue;
                  var date = new Date(),
                    year = date.getFullYear(),
                    month = (date.getMonth() + 1).toString(),
                    formatedMonth = month.length === 1 ? "0" + month : month,
                    day = date.getDate().toString(),
                    formatedDay = day.length === 1 ? "0" + day : day,
                    hour = date.getHours().toString(),
                    formatedHour = hour.length === 1 ? "0" + hour : hour,
                    minute = date.getMinutes().toString(),
                    formatedMinute = minute.length === 1 ? "0" + minute : minute,
                    second = date.getSeconds().toString(),
                    formatedSecond = second.length === 1 ? "0" + second : second;
                  newbody.lastActivity =
                    service_type +
                    "@" +
                    formatedDay +
                    "-" +
                    formatedMonth +
                    "-" +
                    year +
                    " " +
                    formatedHour +
                    ":" +
                    formatedMinute;

                  User.findByIdAndUpdate(senderId, newbody, function (err, result) {

                  });
                });
              }
            });
          }
        });  // End of No Schedules Exits!!
        }
        });
        
      } else if (result.length == 1) {
        //console.log("Step 2")
        // Start of 1 Schedule
        let oldStartTime = new Date(startTime);
        let newStartTime = new Date(result[0].startTime);
        let newEndTime = new Date(result[0].endTime);
        let scheduleExits;
        let senderScheduleExists;
        oldStartTime = new Date(startTime);
        if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
          scheduleExits = true;
        }
        serviceSchedule.aggregate(
          [
            {
              $match: {
                $or: [{ senderId: ObjectId(senderId) }]
              }
            }
          ],
          function (err, sResult) {
            if (err) {
              console.log(err);
            }
            if (sResult == 1) {
              let oldStartTime = new Date(startTime);
              let newStartTime = new Date(sResult[0].startTime);
              let newEndTime = new Date(sResult[0].endTime);
              // Check if the timeline is in between two start dates picked from the result
              if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
                senderScheduleExists = true;
              }
            }
            if (sResult >= 2) {
              for (let i = 0; i < result.length; i++) {
                newStartTime = new Date(sResult[i].startTime);
                newEndTime = new Date(sResult[i].endTime);
                if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
                  senderScheduleExists = true;
                  break;
                }

              }
            }
                    // Check if the timeline is in between two start dates picked from the result
        if (scheduleExits == true || senderScheduleExists == true) {
          res.json({token:req.headers['x-access-token'],success:0,message:"Schedule already exits in given time line. please change the time and create new one"})
        } else {
          // Create a service schedule
          let newServiceSchedule = new serviceSchedule({
            service_type: service_type,
            senderId: senderId,
            receiverId: receiverId,
            startTime: startTime,
            endTime: endTime,
            credits: credits,
            refCartId: refCartId,
            refSlotId: refSlotId,
            actualChargedCredits: actualChargedCredits,
            createdBy: createdBy
          });

          serviceSchedule.createServiceSchedule(newServiceSchedule, function (
            err,
            result
          ) {
            if (err) {
              res.send(err);
            } else {
              res.json({token:req.headers['x-access-token'],success:1,message: "serviceSchedule created Successfully"})
              let serviceTransactionRecord = new serviceTransaction({
                serviceCode: 789,
                serviceType: service_type,
                senderId: senderId,
                receiverId: receiverId,
                scheduleId: result._id,
                startTime: startTime,
                endTime: endTime,
                refCartId: refCartId,
                refSlotId: refSlotId,
                serviceStatus: "scheduled"
              });

              // Update Cart

              if (refCartId) {
                let id = refCartId;
                let reqbody = req.body;
                reqbody.cartStatus = "converted";
                reqbody.updatedBy = req.body.updatedBy;
                reqbody.updatedAt = new Date();

                cart.editCart(id, reqbody, function (err, cResult) {
                  if (err) {

                  } else {
                  }
                });
              }

              serviceTransaction.serviceTransaction(serviceTransactionRecord, function (
                err,
                user
              ) {
                if (err) {
                  res.send(err);
                } else {

                  // created serviceType+TimeStamp format for lastActivity Field in UserObject
                  User.findById(senderId, function (err, uResult) {
                    let oldValue = parseInt(uResult.cumulativeSpent);
                    let newbody = {};
                    //    newbody.cumulativeSpent = parseInt(req.body.credits) + oldValue;
                    var date = new Date(),
                      year = date.getFullYear(),
                      month = (date.getMonth() + 1).toString(),
                      formatedMonth = month.length === 1 ? "0" + month : month,
                      day = date.getDate().toString(),
                      formatedDay = day.length === 1 ? "0" + day : day,
                      hour = date.getHours().toString(),
                      formatedHour = hour.length === 1 ? "0" + hour : hour,
                      minute = date.getMinutes().toString(),
                      formatedMinute = minute.length === 1 ? "0" + minute : minute,
                      second = date.getSeconds().toString(),
                      formatedSecond = second.length === 1 ? "0" + second : second;
                    newbody.lastActivity =
                      service_type +
                      "@" +
                      formatedDay +
                      "-" +
                      formatedMonth +
                      "-" +
                      year +
                      " " +
                      formatedHour +
                      ":" +
                      formatedMinute;
                    User.findByIdAndUpdate(senderId, newbody, function (err, result) {

                    });
                  });
                }
              });
            }
          });
        }
        // End of 1 Schedule
          });

      } else {
        // Start of min 2 schedules exits
        //console.log("Step 3")

        let oldStartTime;
        let newStartTime;
        let newEndTime;
        let scheduleExits;
        let senderScheduleExists;
        oldStartTime = new Date(startTime);
        serviceSchedule.aggregate(
          [
            {
              $match: {
                $or: [{ senderId: ObjectId(senderId) }]
              }
            }
          ],
          function (err, sResult) {
            if (err) {
              res.send(err);
            }
            if (sResult == 1) {
              let oldStartTime = new Date(startTime);
              let newStartTime = new Date(sResult[0].startTime);
              let newEndTime = new Date(sResult[0].endTime);
              // Check if the timeline is in between two start dates picked from the result
              if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
                senderScheduleExists = true;
              }
            }
            if (sResult >= 2) {
              for (let i = 0; i < result.length; i++) {
                newStartTime = new Date(sResult[i].startTime);
                newEndTime = new Date(sResult[i].endTime);
                if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
                  senderScheduleExists = true;
                  break;
                }

              }
            }
          });
        for (let i = 0; i < result.length; i++) {
          newStartTime = new Date(result[i].startTime);
          newEndTime = new Date(result[i].endTime);
          if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
            scheduleExits = true;
            break;
          }

        }
        //console.log("Schedule Exits == " + scheduleExits)
        //console.log("Sender Schedule Exits == " + scheduleExits)
        // Check if the timeline is in between two start dates picked from the result
        if (scheduleExits == true || senderScheduleExists == true) {
          res.json({token:req.headers['x-access-token'],success:0,message:"Schedule already exits in given time line. please change the time and create new one"})
        } else {
          // Create a service schedule
          let newServiceSchedule = new serviceSchedule({
            service_type: service_type,
            senderId: senderId,
            receiverId: receiverId,
            startTime: startTime,
            endTime: endTime,
            credits: credits,
            refCartId: refCartId,
            refSlotId: refSlotId,
            actualChargedCredits: actualChargedCredits,
            createdBy: createdBy
          });

          serviceSchedule.createServiceSchedule(newServiceSchedule, function (
            err,
            result
          ) {
            if (err) {
              res.send(err);
            } else {
              res.json({token:req.headers['x-access-token'],success:1,message: "serviceSchedule created Successfully"})
              let serviceTransactionRecord = new serviceTransaction({
                serviceCode: 789,
                serviceType: service_type,
                senderId: senderId,
                receiverId: receiverId,
                scheduleId: result._id,
                startTime: startTime,
                endTime: endTime,
                refCartId: refCartId,
                refSlotId: refSlotId,
                serviceStatus: "scheduled"
              });

              // Update Cart

              if (refCartId) {
                let id = refCartId;
                let reqbody = req.body;
                reqbody.cartStatus = "converted";
                reqbody.updatedBy = req.body.updatedBy;
                reqbody.updatedAt = new Date();

                cart.editCart(id, reqbody, function (err, cResult) {
                  if (err) {
                  } else {
                  }
                });
              }

              serviceTransaction.serviceTransaction(serviceTransactionRecord, function (
                err,
                user
              ) {
                if (err) {
                  res.send(err);
                } else {

                  // created serviceType+TimeStamp format for lastActivity Field in UserObject
                  User.findById(senderId, function (err, uResult) {
                    let oldValue = parseInt(uResult.cumulativeSpent);
                    let newbody = {};
                    //    newbody.cumulativeSpent = parseInt(req.body.credits) + oldValue;
                    var date = new Date(),
                      year = date.getFullYear(),
                      month = (date.getMonth() + 1).toString(),
                      formatedMonth = month.length === 1 ? "0" + month : month,
                      day = date.getDate().toString(),
                      formatedDay = day.length === 1 ? "0" + day : day,
                      hour = date.getHours().toString(),
                      formatedHour = hour.length === 1 ? "0" + hour : hour,
                      minute = date.getMinutes().toString(),
                      formatedMinute = minute.length === 1 ? "0" + minute : minute,
                      second = date.getSeconds().toString(),
                      formatedSecond = second.length === 1 ? "0" + second : second;
                    newbody.lastActivity =
                      service_type +
                      "@" +
                      formatedDay +
                      "-" +
                      formatedMonth +
                      "-" +
                      year +
                      " " +
                      formatedHour +
                      ":" +
                      formatedMinute;

                    User.findByIdAndUpdate(senderId, newbody, function (err, result) {

                    });
                  });
                }
              });
            }
          });
        }
        // End of min 2 schedules exits
      }
    }
  );
});

// End Create a serviceSchedule

// Edit a serviceSchedule start

router.put("/edit/:serviceScheduleId", function (req, res) {
  let id = req.params.serviceScheduleId;
  let reqbody = req.body;
  reqbody.updatedAt = new Date();

  serviceSchedule.findById(id, function (err, result) {
    if (result) {
      serviceSchedule.editServiceSchedule(id, reqbody, function (err, result) {
        if (err) return res.send(err);
        res.json({ message: "serviceSchedule Updated Successfully" });
      });
    } else {
      res.json({ error: "serviceScheduleID not found / Invalid" });
    }
  });
});
// End Edit a serviceSchedule

// Find by Id (serviceSchedule) start

router.get("/getServiceScheduleInfo/:serviceScheduleID", function (req, res) {
  let id = req.params.serviceScheduleID;

  serviceSchedule.getServiceScheduleById(id, function (err, result) {
    res.send(result);
  });
});
// End Find by Id (serviceSchedule)

// Find by UserID start

router.get("/getByUserID/:UserID", function (req, res) {
  let id = req.params.UserID;
  //console.log(new Date())
  serviceSchedule.aggregate(
    [
      {
        $match: {
          $or: [{ senderId: ObjectId(id) }, { receiverId: ObjectId(id) }]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "senderProfile"
        }
      },
      { $unwind: "$senderProfile" },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiverProfile"
        }
      },
      { $unwind: "$receiverProfile" },
      { $sort: { createdAt: -1 } }
    ],
    function (err, data) {
      if (err) {
        res.send(err);
      }
      return res.send(data);
    }
  );
});
// End Find by UserID

// getAll start

router.get("/getAll", function (req, res) {
  serviceSchedule.find({}, function (err, result) {
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

// Find by userId and serviceType start

router.post("/schduleByServiceType", function (req, res) {
  let id = req.body.senderId;
  let serviceType = req.body.serviceType;
  let startTime = req.body.startTime;
  let query = {
    $and: [
      { senderId: id },
      { service_type: serviceType },
      { startTime: startTime }
    ]
  };
  serviceSchedule.find(query, function (err, result) {
    res.send(result);
  });
});

//End Find by userId and serviceType

// Find by userId and transactionStatus start

router.post("/schduleByTransactionStatus", function (req, res) {

  let id = req.body.senderId;
  let transactionStatus = req.body.transactionStatus;
  let query = {
    $and: [{ senderId: id }, { transactionStatus: transactionStatus }]
  };
  serviceSchedule.find(query, function (err, result) {
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
});
// End Find by userId and transactionStatus

// Delete by serviceScheduleID start

router.delete("/delete/:serviceScheduleID", function (req, res, next) {
  let id = req.params.serviceScheduleID;

  serviceSchedule.findById(id, function (err, result) {
    if (result) {
      serviceSchedule.findByIdAndRemove(id, function (err, post) {
        if (err) return res.send(err);
        res.json({ message: "Deleted serviceSchedule Successfully" });
      });
    } else {
      res.json({ error: "serviceScheduleID not found / Invalid" });
    }
  });
});

// End Delete by serviceScheduleID

// Check Schedule Availability
router.post("/checkScheduleAvailability", function (req, res, next) {
  let receiverId = req.body.receiverId;
  let startTime = req.body.startTime;
  let endTime = req.body.endTime;
  let currentTime = new Date();
  let query = {
    $and: [{ startTime: startTime }, { memberId: receiverId }, { endTime: endTime }]
  };
  slotMaster.find(query, function (err, result) {
    //console.log(result)
    if (result.length  > 0) {
      res.json({ currentTime,"data": result});
      //res.send(result);
    } else{
      //console.log("P1",receiverId);
      serviceSchedule.find({ receiverId: receiverId }, function (err, result) {
        if (result.length == 0) {
          res.json({ message: "No schedules in the given time" });
        } else if (result.length == 1) {
          let oldStartTime = new Date(startTime);
          let newStartTime = new Date(result[0].startTime);
          let newEndTime = new Date(result[0].endTime);
          // Check if the timeline is in between two start dates picked from the result
          if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
            res.json({
              "error": "Schedule already exits in given time line. please change the time and create new one",currentTime
            });
          } else {
            res.json({ message: "No schedules in the given time",currentTime });
          }
        } else {
          let oldStartTime;
          let newStartTime;
          let newEndTime;
          let scheduleExits;
          oldStartTime = new Date(startTime);
          for (let i = 0; i < result.length; i++) {
            newStartTime = new Date(result[i].startTime);
            newEndTime = new Date(result[i].endTime);
            if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
              scheduleExits = true;
              break;
            }
          }
          if (scheduleExits == true) {
            res.json({
              "error": "Schedule already exits in given time line. please change the time and create new one",currentTime
            });
          } else {
            res.json({ message: "No schedules in the given time",currentTime });
          }
        }
      });
    }
  });

});
// End of Check Schedule Availability

module.exports = router;
