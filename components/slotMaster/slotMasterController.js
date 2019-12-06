const SlotMasterServices = require("./slotMasterServices");
const serviceSchedule = require("../serviceSchedule/serviceScheduleModel");
const Memberpreferences = require("../memberpreferences/memberpreferencesModel");
let ObjectId = require("mongodb").ObjectID;


const editSlot= (req,res)=>{
    SlotMasterServices.editSlot(req.params.id,req.body,(err,updatedslot)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ success: 1,message:"Slot Updated Successfully",token: req.headers['x-access-token'],updatedslot: updatedslot});
        }
    })
}

const updateSlotSchedule = (req, res) =>{
    let schID = req.params.schID;
    SlotMasterServices.updateSlotSchedule(schID,req.body,(err,updatedslot)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ success: 1,message:"Slot Schedule Updated Successfully",token: req.headers['x-access-token'],updatedslot: updatedslot});
        }
    })
}

const updateScheduleStatus = (req, res)=> {
    let schID = req.params.schID;
    SlotMasterServices.updateSlotSchedule(schID,req.body,(err,updatedslot)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ success: 1,message:"Slot Schedule status Updated Successfully",token: req.headers['x-access-token'],updatedslot: updatedslot});
        }
    })
}

const getAllSlots = (req, res)=> {
    SlotMasterServices.getAllSlots((err,allSlots)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ success: 1,token: req.headers['x-access-token'],getAllSlots: allSlots});
        }
    })
}

const deleteslotMasterById = (req, res)=> {
    let schID = req.params.id;
    SlotMasterServices.deleteslotMasterById(schID,(err,deletedObj)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ token: req.headers['x-access-token'], success: 1,data: deletedObj,message: "Schedule Deleted Successfully" })
        }
    })
}

const deleteslotMasterById1 = (req, res)=> {
    //let schID = req.params.id;
     // console.log(req.body);
     SlotMasterServices.deleteslotMasterById1(req.body, (err, deletedObj) => {
        if (err) {
            if (err == "ids not found")
                return res.status(200).json({ success: 0, message: "Please select the records" });
            return res.status(500).json({ success: 0, message: "Error while delete multiple notification.", err });
        } else {
            return res.status(200).json({token: req.headers['x-access-token'], success: 1, message: "Records has been successfully deleted" })
        }
    });
}

const getSlotByMemberId = (req, res)=> {
    SlotMasterServices.getSlotByMemberId(req.params.memberId,(err,slotDetails)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ token: req.headers['x-access-token'], success: 1,data: slotDetails })
        }
    })
}


const getSlotDetailsById =  (req, res)=> {
    //console.log("req1",req.params.scheduleId)
    //console.log("req2",req.params.memberId)
    //console.log("req3",req.params.celebId)
    SlotMasterServices.getSlotDetailsById(req.params.scheduleId,req.params.memberId,req.params.celebId,(err,slotDetails)=>{
        //console.log("slotDetails",slotDetails);
        let totalSlotVal = parseInt(slotDetails.creditValue*slotDetails.scheduleDuration);
        //console.log("totalSlotVal",totalSlotVal);
        Memberpreferences.aggregate([
            {
                $match: { celebrities: { $elemMatch: { CelebrityId: ObjectId(req.params.celebId), isFan: true } },memberId:ObjectId(req.params.memberId) }
            },
        ], (err, fans) => {
            //console.log("FANS",fans);
            if(fans.length>0){
                    //console.log("slotDetails",slotDetails.slotArray)
        ///un comment this code
        serviceSchedule.find(
            { scheduleId:ObjectId(req.params.scheduleId), senderId:ObjectId(req.params.memberId)},
            (err, newresult) => {
                //console.log("newresult",newresult)
                if(newresult.length == 0){
                    let array1 =slotDetails.slotArray
        

                    var count = array1.filter((obj) => obj.slotStatus === "unreserved").length;
                    var count1 = array1.length;
                    //console.log(count);
                    let isBooked;
                    if(err){
                        res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
                    }else{  
                        res.json({ token: req.headers['x-access-token'], success: 1,data: {slotDetails,totalSlotVal,availableSlotsCount:count,totalSlots:count1,isBooked:false,isFan:true,isDeleted:slotDetails.isDeleted} })
                    }
                }else if (newresult.length > 0){
                    let array1 =slotDetails.slotArray
        

                    var count = array1.filter((obj) => obj.slotStatus === "unreserved").length;
                    var count1 = array1.length;
                    res.json({ token: req.headers['x-access-token'], success: 1,data: {slotDetails,totalSlotVal,availableSlotsCount:count,totalSlots:count1,isBooked:true,isFan:true,isDeleted:slotDetails.isDeleted} })
                }

           });
        }else if(fans.length<=0){
                    //console.log("slotDetails",slotDetails.slotArray)
        /////un comment this code
        serviceSchedule.find(
            { scheduleId:ObjectId(req.params.scheduleId), senderId:ObjectId(req.params.memberId)},
            (err, newresult) => {
                //console.log("newresult",newresult)
                if(newresult.length == 0){
                    let array1 =slotDetails.slotArray
        

                    var count = array1.filter((obj) => obj.slotStatus === "unreserved").length;
                    var count1 = array1.length;
                    //console.log(count);
                    let isBooked;
                    if(err){
                        res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
                    }else{  
                        res.json({ token: req.headers['x-access-token'], success: 1,data: {slotDetails,totalSlotVal,availableSlotsCount:count,totalSlots:count1,isBooked:false,isFan:false,isDeleted:slotDetails.isDeleted} })
                    }
                }else if (newresult.length > 0){
                    let array1 =slotDetails.slotArray
        

                    var count = array1.filter((obj) => obj.slotStatus === "unreserved").length;
                    var count1 = array1.length;
                    res.json({ token: req.headers['x-access-token'], success: 1,data: {slotDetails,totalSlotVal,availableSlotsCount:count,totalSlots:count1,isBooked:true,isFan:false,isDeleted:slotDetails.isDeleted} })
               }

           });
            }
        
            
    
        });

      
    })
}

const getSlotsByLimitMemberId =  (req, res)=> {
    SlotMasterServices.getSlotsByLimitMemberId(req.params,(err,slotDetails)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ token: req.headers['x-access-token'], success: 1,data: slotDetails })
        }
    })
}



module.exports ={
    editSlot : editSlot,
    updateSlotSchedule:updateSlotSchedule,
    updateScheduleStatus:updateScheduleStatus,
    getAllSlots : getAllSlots,
    deleteslotMasterById:deleteslotMasterById,
    getSlotByMemberId:getSlotByMemberId,
    getSlotDetailsById:getSlotDetailsById,
    getSlotsByLimitMemberId:getSlotsByLimitMemberId,
    deleteslotMasterById1:deleteslotMasterById1
}