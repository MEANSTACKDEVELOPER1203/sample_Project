let ServiceTransactionModel = require("./serviceTransactionModel");

const getAll = (params,callback)=>{
    let pageNo = parseInt(params.pageNo);
    let startFrom =  params.limit*(pageNo-1);
    let limit = parseInt(params.limit);
    ServiceTransactionModel.count({},(err, count)=> {
        if(err){
            callback(err,null)
        }else{
            ServiceTransactionModel.find({},(err, result)=> {
                if(err){
                    callback(err,null)
                }else{
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
                    callback(null,data)
                }
            }).sort({ createdAt: -1 }).skip(startFrom).limit(limit);
        }
    })
}

module.exports= {
    getAll:getAll
}