const SlotMasterServices = require("./slotMasterServices");

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
    SlotMasterServices.getSlotDetailsById(req.params.slotId,(err,slotDetails)=>{
        if(err){
            res.json({ success: 0,token: req.headers['x-access-token'],message:`${err}`});
        }else{  
            res.json({ token: req.headers['x-access-token'], success: 1,data: slotDetails })
        }
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
    getSlotsByLimitMemberId:getSlotsByLimitMemberId
}