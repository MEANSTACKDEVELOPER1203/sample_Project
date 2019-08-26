const creditServices = require("./creditServices");

const insertCreditForBeingOnline = (req,res)=>{
    creditServices.insertCreditForBeingOnline(req.body,(err,newCreditObject)=>{
        if(err){
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }else{
            res.json({success:0,token:req.headers['x-access-token'],data:newCreditObject})
        }
    })
}

const getAll = (req,res)=>{
    creditServices.getAll(req.params,(err,allCreditObjects)=>{
        if(err){
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }else{
            res.json({success:0,token:req.headers['x-access-token'],data:allCreditObjects})
        }
    })
}

const getCreditHistoryByMemberID = (req,res)=>{
    creditServices.getCreditHistoryByMemberID(req.params,(err,allCreditObjects)=>{
        if(err){
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }else{
            res.json({success:0,token:req.headers['x-access-token'],data:allCreditObjects})
        }
    })
}



module.exports ={
    insertCreditForBeingOnline:insertCreditForBeingOnline,
    getCreditHistoryByMemberID:getCreditHistoryByMemberID,
    getAll:getAll
}