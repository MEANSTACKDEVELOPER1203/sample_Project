const CreditExchangeModel = require("./creditExchangeModel");

const getAll = (params,callback)=>{
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);
    CreditExchangeModel.countDocuments({},(err, count)=> {
        if (err){
            callback(err,null)
        }
        else{
            CreditExchangeModel.find({},(err, result)=> {
                if (err){
                    callback(err,null)
                }
                else{
                    let data = {};
                    data.result = result
                    let total_pages = count/limit
                    let div = count%limit;
                    data.pagination ={
                        "total_count": count,
                        "total_pages": div == 0 ? total_pages : parseInt(total_pages)+1 ,
                        "current_page": pageNo,
                        "limit": limit
                    }
                    callback(null, data);
                }
            }).skip(startFrom).limit(limit).sort({ createdAt: -1 })
        }
    })
}

module.exports ={
    getAll:getAll
}
