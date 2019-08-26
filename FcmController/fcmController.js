var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);


const sendFcmNotification = (deviceToken,collapse_key,title,serviceType,body)=>{
    var message = {
        to: deviceToken,
        collapse_key: collapse_key,
        serviceType: serviceType,
        data: {
            title: title,
            serviceType: serviceType,
            body: body,
        },
        notification: {
            title: title,
            serviceType: serviceType,
            body: body,
        }
    };
    
    fcm.send(message,(err, response)=>{
        if (err) {
            console.log(err)
        } else {

        }
    });
}

module.exports ={
    sendFcmNotification : sendFcmNotification
}



