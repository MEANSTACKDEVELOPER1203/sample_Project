const NotificationServices = require("./notificationServices");


const sendNotificationToAll = (req, res) => {
    NotificationServices.sendNotificationToAll(req.params, (err, result) => {
        if (err) {
            res.status(200).json({
                token: req.headers['x-access-token'],
                success: 0,
                message: `${err}`
            });
        } else {
            res.status(200).json({
                token: req.headers['x-access-token'],
                success: 1,
                message: result
            });
        }
    })
}
let deleteMultipleNotification = (req, res) => {
    // console.log(req.body);
    NotificationServices.deleteMultipleNotification(req.body, (err, deletedObj) => {
        if (err) {
            if (err == "ids not found")
                return res.status(200).json({ success: 0, message: "Please select the records" });
            return res.status(500).json({ success: 0, message: "Error while delete multiple notification.", err });
        } else {
            return res.status(200).json({token: req.headers['x-access-token'], success: 1, message: "Records has been successfully deleted" })
        }
    });
}

module.exports = {
    sendNotificationToAll: sendNotificationToAll,
    deleteMultipleNotification: deleteMultipleNotification
}

