let NotificationSetting = require("./notificationSettingsModel")

const notificationSettingCheck = (managerId,notificationSettingId,callback)=>{
    let query = {
        memberId: managerId,
        notificationSettingId: notificationSettingId,
        isEnabled: true
    };
    NotificationSetting.findOne(query,(err, rest)=>{
        if(err)
        {
            callback(false,false)
        }else{
            callback(null,true)
        }
    });
}

module.exports= {
    notificationSettingCheck:notificationSettingCheck
}