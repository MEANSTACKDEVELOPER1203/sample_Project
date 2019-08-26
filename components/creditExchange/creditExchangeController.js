const CreditExchangeServices = require("./creditExchangeServices")


const getAll = (req,res)=>{
    CreditExchangeServices.getAll(req.params,(err,orders)=>{
        if(err){
            res.json({success:0,error: "No data found!"});
        }else{
            res.json({success:1,data: orders});
        }
    })
}

module.exports ={
    getAll:getAll
}