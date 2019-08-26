const ServiceTransactionServices = require("./serviceTransactionServices");

const getAll = (req,res)=>{
    ServiceTransactionServices.getAll(req.params,(err,data)=>{
        if(err){
            res.json({success:0,token: req.headers['x-access-token'],message:err})
        }else{
            res.json({success:1,token: req.headers['x-access-token'],data:data})
        }
    })
}

module.exports= {
    getAll:getAll
}