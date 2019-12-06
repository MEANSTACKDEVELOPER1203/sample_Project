let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let serviceSchedule = require("./serviceScheduleModel");
let cart = require("../cart/cartModel");
let serviceTransaction = require("../serviceTransaction/serviceTransactionModel");
let User = require("../users/userModel");
let slotMaster = require("../slotMaster/slotMasterModel");
let payCredits = require("../payCredits/payCreditsModel");
//let slotMaster = require("../slotMaster/slotMasterModel");
//let MemberPreferences = require("../memberpreferences/memberpreferencesModel");
let feedbackModel = require("../feedback/feedbackModel");
let Credits = require("../credits/creditsModel");
let celebrityContract = require("../celebrityContract/celebrityContractsModel");
let referralCode = require("../referralCode/referralCodeModel");
let Orders = require("../order/ordersModel")
let paymentTransactionServices = require('../paymentTransaction/paymentTransactionServices');
let celebrityContractsService = require('../celebrityContract/celebrityContractsService');
let creditServices = require('../credits/creditServices');

//@methos Post
//@access All
// Book Schdule
router.post("/bookSchedule", function (req, res) {
  let service_type = req.body.service_type;
  let senderId = req.body.senderId;
  let receiverId = req.body.receiverId;
  let startTime = req.body.startTime;
  let endTime = req.body.endTime;
  let credits = req.body.credits;
  let refSlotId = req.body.refSlotId;
  let refCartId = req.body.refCartId;
  let scheduleId = req.body.scheduleId;
  let actualChargedCredits = req.body.actualChargedCredits;
  let createdBy = req.body.createdBy;
  //console.log("body",req.body)
  let query = {
    $and: [{ reason: "Block/Report" }, { celebrityId: ObjectId(req.body.receiverId) }, { memberId: ObjectId(req.body.senderId) }]
  };

  //console.log("T1",query);
  feedbackModel.find(query, function (err, Fresult) {
    //console.log("Fresult", Fresult);
    if (Fresult.length > 0) {
      res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });

    } else {
      let query = {
        $and: [{ callRemarks: "Block/Report" }, { receiverId: ObjectId(req.body.receiverId) }, { senderId: req.body.senderId }]
      };
      serviceTransaction.find(query, function (err, result) {
        if (result.length > 0) {
          res.json({ token: req.headers['x-access-token'], success: 0, message: "This celebrity has blocked you." });
        } else {
          celebrityContractsService.getCelebContractsByServiceType(receiverId, service_type, (err, celebContractObj) => {
            if (err)
              return res.status(404).jsson({ success: 0, message: "Error while fetching the celeb contract", err });
            else {
              //let callDUR;
              slotMaster.find(
                { _id: scheduleId, scheduleStatus: "inactive","isDeleted" : false, "slotArray.slotStatus": "unreserved" },
                (err, slotResult) => {
                  //console.log("slotResult",slotResult);
                  if(slotResult.length==0){
                    res.json({ token: req.headers['x-access-token'], success: 0, message: "No slots available" })
                  } else{
                    let creditChargesValue = slotResult[0].scheduleDuration * slotResult[0].creditValue
             
                    //console.log("creditChargesValue",creditChargesValue);
                    creditServices.getCreditBalance(ObjectId(senderId), (err, senderCreditObj) => {
                      if (err)
                        return res.status(404).jsson({ success: 0, message: "Error while fetching the sender credit value", err });
                      else {
                        senderCreditValue = senderCreditObj.cumulativeCreditValue + senderCreditObj.memberReferCreditValue;
                        //&& senderCreditObj.referralCreditValue < creditChargesValue
                        if (senderCreditValue < creditChargesValue) {
                          return res.status(200).send({
                            success: 0, message: "Insufficient credits. Please add credits.", data: senderCreditObj
                          });
                        } else {
                          creditServices.getCreditBalance(ObjectId(receiverId), (err, recieverCreditObj) => {
                            if (err)
                              return res.status(404).jsson({ success: 0, message: "Error while fetching the reciever credit value", err });
                            else {
                              User.findOne({ _id: ObjectId(senderId) }, (err, senderObj) => {
                                if (err)
                                  return res.status(404).jsson({ success: 0, message: "Error while fetching the sender credit value", err });
                                else {
                                  // console.log("Sender Details:   ", senderObj);
                                  let referralQuery = { memberCode: "" } //find celeb referral code based on sender referral code
                                  if (service_type === "video") {
                                    referralQuery = {
                                      memberCode: senderObj.referralCode
                                    }
                                  }
                                  // console.log("referralQuery", referralQuery);
                                  referralCode.findOne(referralQuery, (err, celebReferralObj) => {
                                    if (err)
                                      return res.status(404).jsson({ success: 0, message: "Error while fetching the reciever referral code details", err });
                                    else {
                                      if (celebReferralObj && senderCreditObj.referralCreditValue >= creditChargesValue) {
                                        // console.log("@@@@@@@@@@ By referral Only @@@@@@@@@@@@@@@@@@@@")
                                        oldCumulativeCreditValue = parseInt(senderCreditObj.cumulativeCreditValue);
                                        oldMemberReferCreditValue = parseInt(senderCreditObj.memberReferCreditValue);
                                        oldReferralCreditValue = parseInt(senderCreditObj.referralCreditValue);
                                        let callCostBalance = oldReferralCreditValue - creditChargesValue;
      
                                        let newCredits = new Credits({
                                          memberId: senderId,
                                          creditType: "debit",
                                          status: "active",
                                          referralCreditValue: callCostBalance,
                                          creditValue: creditChargesValue,
                                          cumulativeCreditValue: oldCumulativeCreditValue,
                                          memberReferCreditValue: oldMemberReferCreditValue,
                                          remarks: "remark"
                                        });
                                        // Insert Into Credit Table
                                        Credits.createCredits(newCredits, (err, creditsObj) => {
                                          if (err)
                                            return res.status(404).jsson({ success: 0, message: "Error while updating sender credit value ", err });
                                          else {
                                            res.status(200).json({
                                              success: 1,
                                              message: "Credits updated successfully",
                                              creditsData: creditsObj
                                            });
                                            // update celeb sharing percentage
                                            newReferralCreditValue = recieverCreditObj.referralCreditValue;
                                            oldCumulativeCreditValue = parseFloat(recieverCreditObj.cumulativeCreditValue);
                                            oldMemberReferCreditValue = parseInt(recieverCreditObj.memberReferCreditValue);
                                            credits = parseInt(creditChargesValue);
                                            // console.log(celebContractObj.sharingPercentage);
                                            sharingPercentage = celebContractObj.sharingPercentage;
                                            totalSharingPercentage = credits * sharingPercentage / 100;
                                            // console.log(typeof totalSharingPercentage);
                                            // console.log(totalSharingPercentage);
                                            ckChargeCredits = credits - totalSharingPercentage;
                                            newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(totalSharingPercentage);
                                            let celebNewCredits = new Credits({
                                              memberId: receiverId,
                                              creditType: "credit",
                                              cumulativeCreditValue: newCumulativeCreditValue,
                                              referralCreditValue: newReferralCreditValue,
                                              memberReferCreditValue: oldMemberReferCreditValue,
                                              creditValue: totalSharingPercentage,
                                              remarks: "Service Earnings",
                                              createdBy: "Admin"
                                            });
                                            Credits.createCredits(celebNewCredits, function (err, credits) {
                                              if (err) {
                                                console.log("Error while updating celeb sharing percentage", err);
                                                //res.send(err);
                                              } else {
                                                let newPayCredits = new payCredits({
                                                  memberId: receiverId,
                                                  celebId: senderId,
                                                  creditValue: actualChargedCredits,
                                                  celebPercentage: totalSharingPercentage,
                                                  celebKonnectPercentage: ckChargeCredits,
                                                  payType: service_type
                                                });
                                                payCredits.createPayCredits(newPayCredits, (err, payCredits) => {
                                                  if (err) {
                                                    console.log("Error while updating pay credits ", err)
                                                    //res.send(err);
                                                  } else {
                                                    oldValue = parseInt(senderObj.cumulativeSpent);
                                                    let newbody = {};
                                                    newbody.cumulativeSpent = parseInt(creditChargesValue) + parseInt(oldValue);
                                                    User.findByIdAndUpdate(senderObj._id, newbody, (err, upResult) => {
                                                      if (err)
                                                        console.log("Error while updating sender spend credit value")
                                                    });
                                                  }
                                                }); //update celeb-konect sharing percentage
                                              }
                                            });//update celeb credit based on contarct
      
                                          }
                                        })//latest updates credit 
                                      } else {
                                        // console.log("@@@@@@@@@@ By referral with main credits @@@@@@@@@@@@@@@@@@@@");
                                        oldCumulativeCreditValue = parseInt(senderCreditObj.cumulativeCreditValue);
                                        oldMemberReferCreditValue = parseInt(senderCreditObj.memberReferCreditValue);
                                        oldReferralCreditValue = parseInt(senderCreditObj.referralCreditValue);
                                        let remainingCredits = 0;
                                        if (oldMemberReferCreditValue >= creditChargesValue) {
                                          newMemberReferCreditValue = parseInt(oldMemberReferCreditValue) - parseInt(creditChargesValue);
                                          newCumulativeCreditValue = oldCumulativeCreditValue
                                        } else if (oldMemberReferCreditValue > 0 && oldMemberReferCreditValue < creditChargesValue) {
                                          remainingCredits = parseInt(creditChargesValue) - parseInt(oldMemberReferCreditValue);
                                          newMemberReferCreditValue = 0;
                                          newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(remainingCredits);
                                        } else {
                                          newMemberReferCreditValue = oldMemberReferCreditValue;
                                          newCumulativeCreditValue = parseInt(oldCumulativeCreditValue) - parseInt(creditChargesValue);
                                        }
                                        let newCredits = new Credits({
                                          memberId: senderId,
                                          creditType: "debit",
                                          status: "active",
                                          referralCreditValue: oldReferralCreditValue,
                                          cumulativeCreditValue: newCumulativeCreditValue,
                                          memberReferCreditValue: newMemberReferCreditValue,
                                          creditValue: creditChargesValue
                                        });
                                        // Insert Into Credit Table
                                        Credits.createCredits(newCredits, (err, creditsObj) => {
                                          if (err)
                                          console.log("err",err);
                                            //return res.status(404).jsson({ success: 0, message: "Error while updating sender credit value ", err });
                                          else {
                                            // res.status(200).json({
                                            //   success: 1,
                                            //   message: "Credits updated successfully",
                                            //   creditsData: creditsObj
                                            // });
                                            // update celeb sharing percentage
                                            newReferralCreditValue = recieverCreditObj.referralCreditValue;
                                            oldCumulativeCreditValue = parseFloat(recieverCreditObj.cumulativeCreditValue);
                                            oldMemberReferCreditValue = parseInt(recieverCreditObj.memberReferCreditValue);
                                            credits = parseInt(creditChargesValue);
                                            sharingPercentage = celebContractObj.sharingPercentage;
                                            totalSharingPercentage = credits * sharingPercentage / 100;
                                            ckChargeCredits = credits - totalSharingPercentage;
                                            //console.log(test);
                                            newCumulativeCreditValue = parseFloat(oldCumulativeCreditValue) + parseFloat(totalSharingPercentage);
                                            let celebNewCredits = new Credits({
                                              memberId: receiverId,
                                              creditType: "credit",
                                              cumulativeCreditValue: newCumulativeCreditValue,
                                              referralCreditValue: newReferralCreditValue,
                                              memberReferCreditValue: oldMemberReferCreditValue,
                                              creditValue: totalSharingPercentage,
                                              remarks: "Service Earnings",
                                              createdBy: "Admin"
                                            });
                                            Credits.createCredits(celebNewCredits, function (err, credits) {
                                              if (err) {
                                                console.log("Error while updating celeb sharing percentage");
                                                //res.send(err);
                                              } else {
                                                let newPayCredits = new payCredits({
                                                  memberId: receiverId,
                                                  celebId: senderId,
                                                  creditValue: actualChargedCredits,
                                                  celebPercentage: totalSharingPercentage,
                                                  celebKonnectPercentage: ckChargeCredits,
                                                  payType: service_type
                                                });
                                                payCredits.createPayCredits(newPayCredits, (err, payCredits) => {
                                                  if (err) {
                                                    console.log("Error while updating pay credits ", err)
                                                    //res.send(err);
                                                  } else {
                                                    //console.log("testSch")
                                                    serviceSchedule.find({ senderId: senderId, receiverId: receiverId, scheduleId: scheduleId }, (err, upResult) => {
                                                      if (err)
                                                        console.log("Error while updating sender spend credit value")
                                                      /////// un comment while ur pushing the code in test
                                                      if (upResult.length > 0) {
                                                        res.json({ token: req.headers['x-access-token'], success: 1, message: "You already booked a slot" })
                                                      }
                                                      if (upResult.length == 0) {
                                                        let newServiceSchedule = new serviceSchedule({
                                                          scheduleId: req.body.scheduleId,
                                                          service_type: service_type,
                                                          senderId: senderId,
                                                          receiverId: receiverId,
                                                          startTime: startTime,
                                                          endTime: endTime,
                                                          credits: actualChargedCredits,
                                                          refCartId: refCartId,
                                                          //schuduledDuration:schuduledDuration,
                                                          //refSlotId: refSlotId,
                                                          actualChargedCredits: actualChargedCredits,
                                                          createdBy: createdBy
                                                        });
                                                        //console.log("newServiceSchedule",newServiceSchedule)
                                                        serviceSchedule.createServiceSchedule(newServiceSchedule, function (
                                                          err,
                                                          sRes
                                                        ) {
                                                          if (err) {
                                                            res.send(err);
                                                          } else {
                                                            // console.log("sRes",sRes)
                                                            // slotMaster.find(
                                                            //   { _id: scheduleId, scheduleStatus: "inactive","isDeleted" : false, "slotArray.slotStatus": "unreserved" },
                                                            //   (err, newresult) => {
                                                            //     console.log("newresult", newresult);
                                                            //     if (err) {
      
                                                            //     } else if (newresult.length == 0) {
                                                            //       console.log("newresult111111111111111111111",newresult)
                                                            //       res.json({ token: req.headers['x-access-token'], success: 0, message: "No slots available" })
                                                            //     }
                                                            //     else if (newresult.length > 0) {
                                                                  //console.log("12232434")
                                                                  //console.log("newresult",newresult[0].slotArray);
                                                                  for (let i = 0; i < slotResult.length; i++) {
                                                                    // console.log("newresult1111", newresult[i].slotArray[0]._id);
                                                                    //for (let j=0;j<newresult[i].slotArray.length;j++){
                                                                    function isCherries(fruit) {
                                                                      return fruit.slotStatus === 'unreserved';
                                                                    }
                                                                    let sId = slotResult[i].slotArray.find(isCherries);
                                                                    //console.log(sId._id);
                                                                    let id = sId._id;
                                                                    let sTime = sId.slotStartTime;
                                                                    let eTime = sId.slotEndTime;
                                                                    //let schuduledDuration = sId.schuduledDuration;
                                                                    //let sid = newresult[i].slotArray[0]._id;
      
                                                                    slotMaster.findOneAndUpdate(
                                                                      { "slotArray._id": id },
                                                                      // { "slotArray.slotStatus": "unreserved" },
                                                                      {
                                                                        $set: {
                                                                          "slotArray.$.slotStatus": "reserved"
                                                                        }
                                                                      },
                                                                      { upsert: true }, (err, newresult) => {
                                                                        // console.log("newresult",newresult);
                                                                        if (err) {
      
                                                                        } else {
      
                                                                        }
                                                                      });
                                                                    //}
      
                                                                    let id1 = sRes._id;
                                                                    let reqbody = req.body;
      
                                                                    reqbody.updatedAt = new Date();
                                                                    reqbody.refSlotId = id;
                                                                    reqbody.startTime = sTime;
                                                                    reqbody.endTime = eTime;
                                                                    reqbody.scheduledDuration = sId.slotDuration;
                                                                    reqbody.scheduleId = scheduleId;
                                                                    //console.log("reqbody",reqbody)
                                                                    serviceSchedule.findById(id1, function (err, result) {
                                                                      //console.log("result",result)
                                                                      if (result) {
                                                                        serviceSchedule.editServiceSchedule(result._id, reqbody, function (err, sSR) {
                                                                          if (err) return res.send(err);
                                                                          //console.log("sSR",sSR);
                                                                          let serviceTransactionRecord = new serviceTransaction({
                                                                            serviceCode: 789,
                                                                            serviceType: service_type,
                                                                            scheduledDuration: sId.slotDuration,
                                                                            senderId: senderId,
                                                                            receiverId: receiverId,
                                                                            scheduleId: result._id,
                                                                            schId:req.body.scheduleId,
                                                                            startTime: sTime,
                                                                            endTime: eTime,
                                                                            refSlotId: id,
                                                                            serviceStatus: "scheduled"
                                                                          });
                                                                          // console.log("serviceTransactionRecord", serviceTransactionRecord)
      
                                                                          serviceTransaction.serviceTransaction(serviceTransactionRecord, function (
                                                                            err,
                                                                            serviceTransaction
                                                                          ) {
                                                                            if (err) {
                                                                              res.send(err);
                                                                            } else {
                                                                              User.findOne({ _id: ObjectId(receiverId) }, function (err, celebDetails) {
                                                                                //  console.log("celebDetails",celebDetails)
                                                                                let celebFirstName = celebDetails.firstName;
                                                                                let celebLastName = celebDetails.lastName;
                                                                                let celebProfilepic = celebDetails.avtar_imgPath;
      
      
                                                                                let orderRecord = new Orders({
                                                                                  memberId: senderId,
                                                                                  celebId: receiverId,
                                                                                   celebFirstName: celebFirstName,
                                                                                   celebLastName: celebLastName,
                                                                                  celebProfilepic: celebProfilepic,
                                                                                  credits: creditChargesValue,
                                                                                  orderType: "service",
                                                                                  ordersStatus: "Success",
                                                                                  slotId: id,
                                                                                  serviceType: service_type,
                                                                                  startTime: sTime,
                                                                                  endTime: eTime
      
                                                                                });
                                                                                //console.log("serviceTransactionRecord", serviceTransactionRecord)
      
                                                                                Orders.create(orderRecord, function (
                                                                                  err,
                                                                                  serviceTransaction
                                                                                ) {
                                                                                  if (err) {
                                                                                    res.send(err);
                                                                                  } else {
      
                                                                                    //console.log("serviceTransaction",serviceTransaction)
                                                                                  }
                                                                                });
      
                                                                              });
                                                                            }
                                                                          });
                                                                          //res.json({ message: "serviceSchedule Updated Successfully" });
                                                                        });
                                                                      } else {
                                                                        //res.json({ error: "serviceScheduleID not found / Invalid" });
                                                                      }
                                                                    });
                                                                  }
                                                                  res.json({ token: req.headers['x-access-token'], success: 1, message: "Slot booked Successfully" })
                                                              //   }
                                                              // });
                                                          }
                                                        });
      
      
                                                        ///// un comment this when ur pushing code in test
                                                      }
                                                    });
                                                    oldValue = parseInt(senderObj.cumulativeSpent);
                                                    let newbody = {};
                                                    newbody.cumulativeSpent = parseInt(creditChargesValue) + parseInt(oldValue);
                                                    User.findByIdAndUpdate(senderObj._id, newbody, (err, upResult) => {
                                                      if (err)
                                                        console.log("Error while updating sender spend credit value")
                                                    });
                                                  }
                                                }); //update celeb-konect sharing percentage
                                              }
                                            });//update celeb credit based on contarct
                                          }
                                        })//latest updates credit 
                                      }
                                    }
                                  })// get celeb referral code based on used referral code while register itself
                                }
                              })//get sender details
                            }
                          })// get reciever credit value
                        }
                      }
                    }) // get sender credit value

                  }
               
        
                });
            
            }
          }) //get celeb contract

        }
      });
    }
  });
});

// // Create a serviceSchedule start
// router.post("/createServiceSchedule", function (req, res) {
//   let service_type = req.body.service_type;
//   let senderId = req.body.senderId;
//   let receiverId = req.body.receiverId;
//   let startTime = req.body.startTime;
//   let endTime = req.body.endTime;
//   let credits = req.body.credits;
//   let refSlotId = req.body.refSlotId;
//   let refCartId = req.body.refCartId;
//   let actualChargedCredits = req.body.actualChargedCredits;
//   let createdBy = req.body.createdBy;

//   serviceSchedule.aggregate(
//     [
//       {
//         $match: {
//           $or: [{ receiverId: ObjectId(receiverId) }]
//         }
//       }
//     ],
//     function (err, result) {
//       if (err) {
//         res.json({ token: req.headers['x-access-token'], success: 0, message: err });
//       }
//       //console.log("receiver details")
//       //console.log(result)
//       if ((result.length == 0)) {
//         //console.log("Step1");
//         let senderScheduleExists = false;
//         //console.log("senderId == " + senderId)
//         serviceSchedule.aggregate(
//           [
//             {
//               $match: {
//                 $or: [{ receiverId: ObjectId(senderId) }]
//               }
//             }
//           ],
//           function (err, sResult) {
//             if (err) {
//               console.log(err);
//             }
//             //console.log("sender details")
//             // console.log(sResult)
//             if (sResult.length == 1) {
//               let oldStartTime = new Date(startTime);
//               let newStartTime = new Date(sResult[0].startTime);
//               let newEndTime = new Date(sResult[0].endTime);
//               // Check if the timeline is in between two start dates picked from the result
//               if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//                 senderScheduleExists = true;
//                 //console.log("sender 1 == " + senderScheduleExists)
//               }
//             }
//             if (sResult.length >= 2) {
//               for (let i = 0; i < result.length; i++) {
//                 newStartTime = new Date(sResult[i].startTime);
//                 newEndTime = new Date(sResult[i].endTime);
//                 if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//                   senderScheduleExists = true;
//                   //console.log("sender 1 == " + senderScheduleExists)
//                   break;
//                 }

//               }
//             }
//             //console.log("before create sendeScheduleExits ==" + senderScheduleExists)
//             if (senderScheduleExists == true) {
//               res.json({ token: req.headers['x-access-token'], success: 0, message: "Schedule already exits in given time line. please change the time and create new one" })
//             } else {
//               // Start of No Schedules Exits!!
//               let newServiceSchedule = new serviceSchedule({
//                 service_type: service_type,
//                 senderId: senderId,
//                 receiverId: receiverId,
//                 startTime: startTime,
//                 endTime: endTime,
//                 credits: credits,
//                 refCartId: refCartId,
//                 refSlotId: refSlotId,
//                 actualChargedCredits: actualChargedCredits,
//                 createdBy: createdBy
//               });

//               serviceSchedule.createServiceSchedule(newServiceSchedule, function (
//                 err,
//                 result
//               ) {
//                 if (err) {
//                   res.send(err);
//                 } else {
//                   res.json({ token: req.headers['x-access-token'], success: 1, message: "serviceSchedule created Successfully" })
//                   //res.json({ message: "serviceSchedule created Successfully" });
//                   let serviceTransactionRecord = new serviceTransaction({
//                     serviceCode: 789,
//                     serviceType: service_type,
//                     senderId: senderId,
//                     receiverId: receiverId,
//                     scheduleId: result._id,
//                     startTime: startTime,
//                     endTime: endTime,
//                     refCartId: refCartId,
//                     refSlotId: refSlotId,
//                     serviceStatus: "scheduled"
//                   });

//                   serviceTransaction.serviceTransaction(serviceTransactionRecord, function (
//                     err,
//                     user
//                   ) {
//                     if (err) {
//                       res.send(err);
//                     } else {

//                       // created serviceType+TimeStamp format for lastActivity Field in UserObject
//                       User.findById(senderId, function (err, uResult) {
//                         let oldValue = parseInt(uResult.cumulativeSpent);
//                         let newbody = {};
//                         //  newbody.cumulativeSpent = parseInt(req.body.credits) + oldValue;
//                         var date = new Date(),
//                           year = date.getFullYear(),
//                           month = (date.getMonth() + 1).toString(),
//                           formatedMonth = month.length === 1 ? "0" + month : month,
//                           day = date.getDate().toString(),
//                           formatedDay = day.length === 1 ? "0" + day : day,
//                           hour = date.getHours().toString(),
//                           formatedHour = hour.length === 1 ? "0" + hour : hour,
//                           minute = date.getMinutes().toString(),
//                           formatedMinute = minute.length === 1 ? "0" + minute : minute,
//                           second = date.getSeconds().toString(),
//                           formatedSecond = second.length === 1 ? "0" + second : second;
//                         newbody.lastActivity =
//                           service_type +
//                           "@" +
//                           formatedDay +
//                           "-" +
//                           formatedMonth +
//                           "-" +
//                           year +
//                           " " +
//                           formatedHour +
//                           ":" +
//                           formatedMinute;

//                         User.findByIdAndUpdate(senderId, newbody, function (err, result) {

//                         });
//                       });
//                     }
//                   });
//                 }
//               });  // End of No Schedules Exits!!
//             }
//           });

//       } else if (result.length == 1) {
//         //console.log("Step 2")
//         // Start of 1 Schedule
//         let oldStartTime = new Date(startTime);
//         let newStartTime = new Date(result[0].startTime);
//         let newEndTime = new Date(result[0].endTime);
//         let scheduleExits;
//         let senderScheduleExists;
//         oldStartTime = new Date(startTime);
//         if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//           scheduleExits = true;
//         }
//         serviceSchedule.aggregate(
//           [
//             {
//               $match: {
//                 $or: [{ senderId: ObjectId(senderId) }]
//               }
//             }
//           ],
//           function (err, sResult) {
//             if (err) {
//               console.log(err);
//             }
//             if (sResult == 1) {
//               let oldStartTime = new Date(startTime);
//               let newStartTime = new Date(sResult[0].startTime);
//               let newEndTime = new Date(sResult[0].endTime);
//               // Check if the timeline is in between two start dates picked from the result
//               if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//                 senderScheduleExists = true;
//               }
//             }
//             if (sResult >= 2) {
//               for (let i = 0; i < result.length; i++) {
//                 newStartTime = new Date(sResult[i].startTime);
//                 newEndTime = new Date(sResult[i].endTime);
//                 if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//                   senderScheduleExists = true;
//                   break;
//                 }

//               }
//             }
//             // Check if the timeline is in between two start dates picked from the result
//             if (scheduleExits == true || senderScheduleExists == true) {
//               res.json({ token: req.headers['x-access-token'], success: 0, message: "Schedule already exits in given time line. please change the time and create new one" })
//             } else {
//               // Create a service schedule
//               let newServiceSchedule = new serviceSchedule({
//                 service_type: service_type,
//                 senderId: senderId,
//                 receiverId: receiverId,
//                 startTime: startTime,
//                 endTime: endTime,
//                 credits: credits,
//                 refCartId: refCartId,
//                 refSlotId: refSlotId,
//                 actualChargedCredits: actualChargedCredits,
//                 createdBy: createdBy
//               });

//               serviceSchedule.createServiceSchedule(newServiceSchedule, function (
//                 err,
//                 result
//               ) {
//                 if (err) {
//                   res.send(err);
//                 } else {
//                   res.json({ token: req.headers['x-access-token'], success: 1, message: "serviceSchedule created Successfully" })
//                   let serviceTransactionRecord = new serviceTransaction({
//                     serviceCode: 789,
//                     serviceType: service_type,
//                     senderId: senderId,
//                     receiverId: receiverId,
//                     scheduleId: result._id,
//                     startTime: startTime,
//                     endTime: endTime,
//                     refCartId: refCartId,
//                     refSlotId: refSlotId,
//                     serviceStatus: "scheduled"
//                   });

//                   // Update Cart

//                   if (refCartId) {
//                     let id = refCartId;
//                     let reqbody = req.body;
//                     reqbody.cartStatus = "converted";
//                     reqbody.updatedBy = req.body.updatedBy;
//                     reqbody.updatedAt = new Date();

//                     cart.editCart(id, reqbody, function (err, cResult) {
//                       if (err) {

//                       } else {
//                       }
//                     });
//                   }

//                   serviceTransaction.serviceTransaction(serviceTransactionRecord, function (
//                     err,
//                     user
//                   ) {
//                     if (err) {
//                       res.send(err);
//                     } else {

//                       // created serviceType+TimeStamp format for lastActivity Field in UserObject
//                       User.findById(senderId, function (err, uResult) {
//                         let oldValue = parseInt(uResult.cumulativeSpent);
//                         let newbody = {};
//                         //    newbody.cumulativeSpent = parseInt(req.body.credits) + oldValue;
//                         var date = new Date(),
//                           year = date.getFullYear(),
//                           month = (date.getMonth() + 1).toString(),
//                           formatedMonth = month.length === 1 ? "0" + month : month,
//                           day = date.getDate().toString(),
//                           formatedDay = day.length === 1 ? "0" + day : day,
//                           hour = date.getHours().toString(),
//                           formatedHour = hour.length === 1 ? "0" + hour : hour,
//                           minute = date.getMinutes().toString(),
//                           formatedMinute = minute.length === 1 ? "0" + minute : minute,
//                           second = date.getSeconds().toString(),
//                           formatedSecond = second.length === 1 ? "0" + second : second;
//                         newbody.lastActivity =
//                           service_type +
//                           "@" +
//                           formatedDay +
//                           "-" +
//                           formatedMonth +
//                           "-" +
//                           year +
//                           " " +
//                           formatedHour +
//                           ":" +
//                           formatedMinute;
//                         User.findByIdAndUpdate(senderId, newbody, function (err, result) {

//                         });
//                       });
//                     }
//                   });
//                 }
//               });
//             }
//             // End of 1 Schedule
//           });

//       } else {
//         // Start of min 2 schedules exits
//         //console.log("Step 3")

//         let oldStartTime;
//         let newStartTime;
//         let newEndTime;
//         let scheduleExits;
//         let senderScheduleExists;
//         oldStartTime = new Date(startTime);
//         serviceSchedule.aggregate(
//           [
//             {
//               $match: {
//                 $or: [{ senderId: ObjectId(senderId) }]
//               }
//             }
//           ],
//           function (err, sResult) {
//             if (err) {
//               res.send(err);
//             }
//             if (sResult == 1) {
//               let oldStartTime = new Date(startTime);
//               let newStartTime = new Date(sResult[0].startTime);
//               let newEndTime = new Date(sResult[0].endTime);
//               // Check if the timeline is in between two start dates picked from the result
//               if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//                 senderScheduleExists = true;
//               }
//             }
//             if (sResult >= 2) {
//               for (let i = 0; i < result.length; i++) {
//                 newStartTime = new Date(sResult[i].startTime);
//                 newEndTime = new Date(sResult[i].endTime);
//                 if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//                   senderScheduleExists = true;
//                   break;
//                 }

//               }
//             }
//           });
//         for (let i = 0; i < result.length; i++) {
//           newStartTime = new Date(result[i].startTime);
//           newEndTime = new Date(result[i].endTime);
//           if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//             scheduleExits = true;
//             break;
//           }

//         }
//         //console.log("Schedule Exits == " + scheduleExits)
//         //console.log("Sender Schedule Exits == " + scheduleExits)
//         // Check if the timeline is in between two start dates picked from the result
//         if (scheduleExits == true || senderScheduleExists == true) {
//           res.json({ token: req.headers['x-access-token'], success: 0, message: "Schedule already exits in given time line. please change the time and create new one" })
//         } else {
//           // Create a service schedule
//           let newServiceSchedule = new serviceSchedule({
//             service_type: service_type,
//             senderId: senderId,
//             receiverId: receiverId,
//             startTime: startTime,
//             endTime: endTime,
//             credits: credits,
//             refCartId: refCartId,
//             refSlotId: refSlotId,
//             actualChargedCredits: actualChargedCredits,
//             createdBy: createdBy
//           });

//           serviceSchedule.createServiceSchedule(newServiceSchedule, function (
//             err,
//             result
//           ) {
//             if (err) {
//               res.send(err);
//             } else {
//               res.json({ token: req.headers['x-access-token'], success: 1, message: "serviceSchedule created Successfully" })
//               let serviceTransactionRecord = new serviceTransaction({
//                 serviceCode: 789,
//                 serviceType: service_type,
//                 senderId: senderId,
//                 receiverId: receiverId,
//                 scheduleId: result._id,
//                 startTime: startTime,
//                 endTime: endTime,
//                 refCartId: refCartId,
//                 refSlotId: refSlotId,
//                 serviceStatus: "scheduled"
//               });

//               // Update Cart

//               if (refCartId) {
//                 let id = refCartId;
//                 let reqbody = req.body;
//                 reqbody.cartStatus = "converted";
//                 reqbody.updatedBy = req.body.updatedBy;
//                 reqbody.updatedAt = new Date();

//                 cart.editCart(id, reqbody, function (err, cResult) {
//                   if (err) {
//                   } else {
//                   }
//                 });
//               }

//               serviceTransaction.serviceTransaction(serviceTransactionRecord, function (
//                 err,
//                 user
//               ) {
//                 if (err) {
//                   res.send(err);
//                 } else {

//                   // created serviceType+TimeStamp format for lastActivity Field in UserObject
//                   User.findById(senderId, function (err, uResult) {
//                     let oldValue = parseInt(uResult.cumulativeSpent);
//                     let newbody = {};
//                     //    newbody.cumulativeSpent = parseInt(req.body.credits) + oldValue;
//                     var date = new Date(),
//                       year = date.getFullYear(),
//                       month = (date.getMonth() + 1).toString(),
//                       formatedMonth = month.length === 1 ? "0" + month : month,
//                       day = date.getDate().toString(),
//                       formatedDay = day.length === 1 ? "0" + day : day,
//                       hour = date.getHours().toString(),
//                       formatedHour = hour.length === 1 ? "0" + hour : hour,
//                       minute = date.getMinutes().toString(),
//                       formatedMinute = minute.length === 1 ? "0" + minute : minute,
//                       second = date.getSeconds().toString(),
//                       formatedSecond = second.length === 1 ? "0" + second : second;
//                     newbody.lastActivity =
//                       service_type +
//                       "@" +
//                       formatedDay +
//                       "-" +
//                       formatedMonth +
//                       "-" +
//                       year +
//                       " " +
//                       formatedHour +
//                       ":" +
//                       formatedMinute;

//                     User.findByIdAndUpdate(senderId, newbody, function (err, result) {

//                     });
//                   });
//                 }
//               });
//             }
//           });
//         }
//         // End of min 2 schedules exits
//       }
//     }
//   );
// });
// // End Create a serviceSchedule

// // Edit a serviceSchedule start
// router.put("/edit/:serviceScheduleId", function (req, res) {
//   let id = req.params.serviceScheduleId;
//   let reqbody = req.body;
//   reqbody.updatedAt = new Date();

//   serviceSchedule.findById(id, function (err, result) {
//     if (result) {
//       serviceSchedule.editServiceSchedule(id, reqbody, function (err, result) {
//         if (err) return res.send(err);
//         res.json({ message: "serviceSchedule Updated Successfully" });
//       });
//     } else {
//       res.json({ error: "serviceScheduleID not found / Invalid" });
//     }
//   });
// });
// // End Edit a serviceSchedule

// // Find by Id (serviceSchedule) start
// router.get("/getServiceScheduleInfo/:serviceScheduleID", function (req, res) {
//   let id = req.params.serviceScheduleID;

//   serviceSchedule.getServiceScheduleById(id, function (err, result) {
//     res.send(result);
//   });
// });
// // End Find by Id (serviceSchedule)

// // Find by UserID start
// router.get("/getByUserID/:UserID", function (req, res) {
//   let id = req.params.UserID;
//   //console.log(new Date())
//   serviceSchedule.aggregate(
//     [
//       {
//         $match: {
//           $or: [{ senderId: ObjectId(id) }, { receiverId: ObjectId(id) }]
//         }
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "senderId",
//           foreignField: "_id",
//           as: "senderProfile"
//         }
//       },
//       { $unwind: "$senderProfile" },
//       {
//         $lookup: {
//           from: "users",
//           localField: "receiverId",
//           foreignField: "_id",
//           as: "receiverProfile"
//         }
//       },
//       { $unwind: "$receiverProfile" },
//       { $sort: { createdAt: -1 } }
//     ],
//     function (err, data) {
//       if (err) {
//         res.send(err);
//       }
//       return res.send(data);
//     }
//   );
// });
// // End Find by UserID

// // getAll start
// router.get("/getAll", function (req, res) {
//   serviceSchedule.find({}, function (err, result) {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   });
// });
// // End getAll

// // Find by userId and serviceType start
// router.post("/schduleByServiceType", function (req, res) {
//   let id = req.body.senderId;
//   let serviceType = req.body.serviceType;
//   let startTime = req.body.startTime;
//   let query = {
//     $and: [
//       { senderId: id },
//       { service_type: serviceType },
//       { startTime: startTime }
//     ]
//   };
//   serviceSchedule.find(query, function (err, result) {
//     res.send(result);
//   });
// });
// //End Find by userId and serviceType

// // Find by userId and transactionStatus start
// router.post("/schduleByTransactionStatus", function (req, res) {

//   let id = req.body.senderId;
//   let transactionStatus = req.body.transactionStatus;
//   let query = {
//     $and: [{ senderId: id }, { transactionStatus: transactionStatus }]
//   };
//   serviceSchedule.find(query, function (err, result) {
//     if (err) {
//       res.send(err);
//     }
//     res.send(result);
//   });
// });
// // End Find by userId and transactionStatus

// // Delete by serviceScheduleID start
// router.delete("/delete/:serviceScheduleID", function (req, res, next) {
//   let id = req.params.serviceScheduleID;

//   serviceSchedule.findById(id, function (err, result) {
//     if (result) {
//       serviceSchedule.findByIdAndRemove(id, function (err, post) {
//         if (err) return res.send(err);
//         res.json({ message: "Deleted serviceSchedule Successfully" });
//       });
//     } else {
//       res.json({ error: "serviceScheduleID not found / Invalid" });
//     }
//   });
// });
// // End Delete by serviceScheduleID

// // Check Schedule Availability
// router.post("/checkScheduleAvailability", function (req, res, next) {
//   let receiverId = req.body.receiverId;
//   let startTime = req.body.startTime;
//   let endTime = req.body.endTime;
//   let currentTime = new Date();
//   let query = {
//     $and: [{ startTime: startTime }, { memberId: receiverId }, { endTime: endTime }]
//   };
//   slotMaster.find(query, function (err, result) {
//     //console.log(result)
//     if (result.length > 0) {
//       res.json({ currentTime, "data": result });
//       //res.send(result);
//     } else {
//       //console.log("P1",receiverId);
//       serviceSchedule.find({ receiverId: receiverId }, function (err, result) {
//         if (result.length == 0) {
//           res.json({ message: "No schedules in the given time" });
//         } else if (result.length == 1) {
//           let oldStartTime = new Date(startTime);
//           let newStartTime = new Date(result[0].startTime);
//           let newEndTime = new Date(result[0].endTime);
//           // Check if the timeline is in between two start dates picked from the result
//           if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//             res.json({
//               "error": "Schedule already exits in given time line. please change the time and create new one", currentTime
//             });
//           } else {
//             res.json({ message: "No schedules in the given time", currentTime });
//           }
//         } else {
//           let oldStartTime;
//           let newStartTime;
//           let newEndTime;
//           let scheduleExits;
//           oldStartTime = new Date(startTime);
//           for (let i = 0; i < result.length; i++) {
//             newStartTime = new Date(result[i].startTime);
//             newEndTime = new Date(result[i].endTime);
//             if ((Date.parse(oldStartTime) >= Date.parse(newStartTime)) && (Date.parse(oldStartTime) <= Date.parse(newEndTime))) {
//               scheduleExits = true;
//               break;
//             }
//           }
//           if (scheduleExits == true) {
//             res.json({
//               "error": "Schedule already exits in given time line. please change the time and create new one", currentTime
//             });
//           } else {
//             res.json({ message: "No schedules in the given time", currentTime });
//           }
//         }
//       });
//     }
//   });

// });
// // End of Check Schedule Availability

module.exports = router;
