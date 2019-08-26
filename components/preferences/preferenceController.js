let preferenceServices = require('./preferenceServices');

let createPreferences = (req, res) => {
    preferenceServices.savePreferences(req.body, (err, user) => {
        if (err) {
            res.json({ token: req.headers['x-access-token'], success: 0, error: err });
        } else {
            res.json({ token: req.headers['x-access-token'], success: 1, message: "Preferences saved sucessfully" });
        }
    });
}
let preferenceController = {
    createPreferences: createPreferences
}
module.exports = preferenceController;