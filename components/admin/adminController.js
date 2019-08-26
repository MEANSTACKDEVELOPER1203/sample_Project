const AdminServices = require("./adminServices")

const getMemberByisCelebAdmin = (req,res)=>{
    AdminServices.getMemberByisCelebAdmin(req.params,(err,data)=>{
        if(err){
            res.json({success:0,token: req.headers['x-access-token'],message:err})
        }else{
            res.json({success:1,token: req.headers['x-access-token'],data:data})
        }
    })
}

const getMemberByisManager = (req,res)=>{
    AdminServices.getMemberByisManager(req.params,(err,data)=>{
        if(err){
            res.json({success:0, token: req.headers['x-access-token'],message:err})
        }else{
            res.json({success:1,token: req.headers['x-access-token'],data:data})
        }
    })
}

const getAll = (req,res)=>{
    AdminServices.getAll(req.params,(err,allCreditObjects)=>{
        if(err){
            res.json({success:0,token:req.headers['x-access-token'],message:err})
        }else{
            res.json({success:0,token:req.headers['x-access-token'],data:allCreditObjects})
        }
    })
}

module.exports = {
    getMemberByisCelebAdmin:getMemberByisCelebAdmin,
    getMemberByisManager:getMemberByisManager,
    getAll:getAll
}