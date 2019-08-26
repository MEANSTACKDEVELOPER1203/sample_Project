//Call Duration: 00 Min 00 sec. Call Cost : 123 Credits
const sendResponseMessage = function sendResponseMessage(celebDetailsObj,callRemark,reason,calllifted){
    if(celebDetailsObj)
    {
        if(callRemark == undefined && calllifted == undefined)
        {
            //if celebrity not attended the call till 30 sec
            return {
                title:"Call not answered by "+celebDetailsObj.firstName,
                body :"Oops!!! Looks like "+celebDetailsObj.firstName+" is busy.  Please try again later. Happy Konecting!!!"
            }
        }
        else if(calllifted == undefined)
        {
        //before call lifted (calllifted key is not there)
            if(callRemark == "Call Completed")
            {
                return {
                    title:"Call completed by "+celebDetailsObj.firstName,
                    body :"Hope you had great time talking to "+celebDetailsObj.firstName+".  Happy Konecting!!!"
                }
            }
            else if(callRemark =='Block/Report')
            {
                return {
                    title:"Call ended by "+celebDetailsObj.firstName,
                    body :celebDetailsObj.firstName+" has Reported and Blocked you. You cannot call or chat with "+celebDetailsObj.firstName+" further. Happy Konecting!!!"
                }
            }
            else if(callRemark == "Bad Network")
            {
                return {
                    title:"Call disconnected by "+celebDetailsObj.firstName,
                    body :"Call with "+celebDetailsObj.firstName+" got disconnected due to bad network. Please try again later. Happy Konecting!!!"
                }
            }
            else if(callRemark == "Report")
            {
                return {
                    title:"Call ended by"+celebDetailsObj.firstName,
                    body :celebDetailsObj.firstName+" has Reported. Happy Konecting!!!"
                }
            }
            else if(callRemark == 'I\'m Busy')
            {
                return {
                    title:"Call ended by "+celebDetailsObj.firstName,
                    body :"Oops!!! Looks like "+celebDetailsObj.firstName+" is busy.  Please try again later. Happy Konecting!!!"
                }
            }
            else if(callRemark == "Other")
            {
                return {
                    title:"Call ended by "+celebDetailsObj.firstName,
                    body :celebDetailsObj.firstName+" has ended the call. Happy Konecting!!!"
                }
            }
            else
            {
                return {
                    title:"Call report by "+celebDetailsObj.firstName,
                    body :"Oops!!! Looks Call report by "+celebDetailsObj.firstName+".  Please try again later. Happy Konecting!!!"
                }
            }
        }
        else{
            //after call lifted (calllifted key is 'calllifted')
            if(callRemark == "Call Completed")
            {
                return {
                    title:"Call completed by "+celebDetailsObj.firstName,
                    body :"Hope you had great time talking to "+celebDetailsObj.firstName+".  Happy Konecting!!!"
                }
            }
            else if(callRemark =='Block/Report')
            {
                return {
                    title:"Call ended by "+celebDetailsObj.firstName,
                    body :celebDetailsObj.firstName+" has Reported and Blocked you. You cannot call or chat with "+celebDetailsObj.firstName+" further. Happy Konecting!!!"
                }
            }
            else if(callRemark == "Bad Network")
            {
                return {
                    title:"Call disconnected by "+celebDetailsObj.firstName,
                    body :"Call with "+celebDetailsObj.firstName+" got disconnected due to bad network. Please try again later. Happy Konecting!!!"
                }
            }
            else if(callRemark == "Report")
            {
                return {
                    title:"Call ended by"+celebDetailsObj.firstName,
                    body :celebDetailsObj.firstName+" has Reported. Happy Konecting!!!"
                }
            }
            else if(callRemark == 'I\'m Busy')
            {
                return {
                    title:"Call not answered by "+celebDetailsObj.firstName,
                    body :"Oops!!! Looks like "+celebDetailsObj.firstName+" is busy.  Please try again later. Happy Konecting!!!"
                }
            }
            else if(callRemark == "Other")
            {
                return {
                    title:"Call ended by "+celebDetailsObj.firstName,
                    body :celebDetailsObj.firstName+" has ended the call. Happy Konecting!!!"
                }
            }
            else
            {
                return {
                    title:"Call report by "+celebDetailsObj.firstName,
                    body :"Oops!!! Looks Call report by "+celebDetailsObj.firstName+".  Please try again later. Happy Konecting!!!"
                }
            }
        }
    }
}
// {

//     //Sender Side
//     callRejectedBySender:{
//         title:"",
//         body :""
//     },
//     callNotRespondedBySender:{
//         title:"",
//         body :""
//     },
    
//     //Receiver Side Before Call Lift
//     callRejectedByReceiver:{
//         title:"Call rejected",
//         body :"Oops!!! Looks like "+celebDetailsObj.firstName+" is busy.  Please try again later. Happy Konecting!!!"
//     },
//     callNotRespondedByReceiver:{
//         title:"Call not answered",
//         body :"Oops!!! Looks like "+celebDetailsObj.firstName+" is busy.  Please try again later. Happy Konecting!!!"
//     },
//     callRejectByRemarkBusy:{
//         title:"Call rejected",
//         body :celebDetailsObj.firstName+" is busy right now. Please try again later. Happy Konecting!!!"
//     },
//     callRejectByRemarkBlockOrReport:{
//         title:"Call ended",
//         body :"Celebname has Reported and Blocked you. You cannot call or chat with "+celebDetailsObj.firstName+" further. Call Duration: 00 Min 00 sec. Call Cost : 123 Credits. Happy Konecting!!!"
//     },
//     callRejectByRemarkBadNetwork:{
//         title:"Call disconnected",
//         body :"Call with "+celebDetailsObj.firstName+" got disconnected due to bad network. Call Duration: 00 Min 00 sec. Call Cost : 123 Credits. Please try again later. Happy Konecting!!!"
//     },
//     callRejectByRemarkOther:{
//         title:"Call ended",
//         body :celebDetailsObj.firstName+" has ended the call.  Call Duration: 00 Min 00 sec. Call Cost : 123 Credits. Happy Konecting!!!"
//     },
    

//     //Receiver Side After Call Lift 
//     callDisconnectByRemarkCallCompleted :{
//         title:"Call completed",
//         body :"Hope you had great time talking to "+celebDetailsObj.firstName+". Call Duration : 00 Min 00 Sec. Call Cost: 123 Credits.  Happy Konecting!!!"
//     },
//     callDisconnectByRemarkImBusy:{
//         title:"Call ended",
//         body :celebDetailsObj.firstName+" is busy right now. Please try again later. Happy Konecting!!!"
//     },
//     callDisconnectByRemarkBlockOrReport:{
//         title:"Call ended",
//         body :"Celebname has Reported and Blocked you. You cannot call or chat with "+celebDetailsObj.firstName+" further. Call Duration: 00 Min 00 sec. Call Cost : 123 Credits. Happy Konecting!!!"
//     },
//     callDisconnectByRemarkBadNetwork:{
//         title:"Call disconnected",
//         body :"Call with "+celebDetailsObj.firstName+" got disconnected due to bad network. Call Duration: 00 Min 00 sec. Call Cost : 123 Credits. Please try again later. Happy Konecting!!!"
//     },
//     callDisconnectByRemarkOther:{
//         title:"Call ended",
//         body :celebDetailsObj.firstName+" has ended the call.  Call Duration: 00 Min 00 sec. Call Cost : 123 Credits. Happy Konecting!!!"
//     }
// }

module.exports={
    sendResponseMessage : sendResponseMessage
}