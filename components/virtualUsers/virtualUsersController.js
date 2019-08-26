let userService = require('./virtualUsersService');
let ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');

let fs = require('fs')


// var createTime = (req, res) => {
//     console.log(new Date())
//     let today = new Date(req.body.data);
//     today.setUTCHours(23,59,59,0);
//     let setTime = new Date();
//     setTime.setHours(23);
//     setTime.setMinutes(00);
//     setTime.setSeconds(00);
//     res.json({ currentTime: today, setTime:setTime})
// }

var createDummyUser = (req, res) => {
    // console.log(req.body);

    // let now = new Date();
    // let yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // console.log("yesterday === ", yesterday);
    // yesterday.setHours(00);
    // yesterday.setMilliseconds(00);
    // yesterday.setMinutes(00)
    // yesterday.setSeconds(00)
    // console.log("yesterday === ", yesterday);


    let dateBefore = req.body.dateBefore;
    dateBefore = parseInt(dateBefore);
    let rawdata = fs.readFileSync('public/dummyUser.json');
    let users = JSON.parse(rawdata);
    let usersArr = [];
    // let pass1 = "Indoz@12";
    // let dummyPass = (pass1) => {
    //     bcrypt.genSalt(10, function (err, salt) {
    //         bcrypt.hash(pass1, salt, function (err, hash) {
    //             if (err)
    //                 console.log(err)
    //             else
    //                 console.log("hash ==== ", hash)
    //             return hash
    //         });
    //     });
    // }
    // console.log(dummyPass)
    users.forEach(element => {
        let today = new Date();
        let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dateBefore);
        // var date = new Date();
        lastWeek.setMilliseconds(Math.floor(Math.random() * 90));
        lastWeek.setMinutes(Math.floor(Math.random() * 90))
        lastWeek.setSeconds(Math.floor(Math.random() * 90))
        element.created_at = lastWeek;
        element.updated_at = lastWeek;
        // element.password = dummyPass;
        usersArr.push(element);
    });
    // res.json({ success: 1, data: usersArr, message: "Created Dummy users" })
    userService.createDummyUser(usersArr, (err, responce) => {
        if (err) {
            console.log(err)
            res.json({ success: 0, message: err })
        }
        else {
            // console.log(res)
            res.json({ success: 1, message: "succssfully added " + responce.length + " users", data: responce })
        }
    })
}

function createDummyUserPassword(pass) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(pass, salt, function (err, hash) {
            if (err)
                console.log(err)
            else
                return hash
        });
    });
    // bcrypt.hash(pass, salt, function (err, hash) {
    //     if (err)
    //         cb(err, null)
    //     else
    //         cb(null, hash)
    // });
}
var insertManyDummyUserLoginDeatils = (req, res) => {
    userService.createDummyLogin((err, responce) => {
        if (err) {
            console.log(err)
            res.json({ success: 0, message: err })
        }
        else {
            // console.log(res)
            res.json({ success: 1, message: "succssfully added " + responce.length + " users", data: responce })
        }
    })
}


var createSingleDummyUser = (req, res) => {
    userService.createDummyUser(req.body, (err, responce) => {
        if (err) {
            console.log(err)
            res.json({ success: 0, message: err })
        }
        else {
            // console.log(res)
            res.json({ success: 1, message: "succssfully added users", data: responce })
        }
    })
}

var getAllDummmyUser = (req, res) => {
    userService.getAllDummmyUser((err, dummyUsers) => {
        if (err) {
            res.json({ success: 0, message: err })
        }
        else {
            // console.log(res)
            res.json({ success: 1, data: dummyUsers })
        }
    })
}

var insertManyDummyUserMemberPrefernaces = (req, res) => {
    userService.insertManyDummyUserMemberPrefernaces((err, dummyUsers) => {
        if (err) {
            res.json({ success: 0, message: err })
        }
        else {
            // console.log(res)
            res.json({ success: 1, data: dummyUsers })
        }
    })
}

var deleteAllVertualUsers = (req, res) => {
    userService.deleteAllVertualUsers((err, dummyUsers) => {
        if (err) {
            res.json({ success: 0, message: err })
        }
        else {
            // console.log(res)
            res.json({ success: 1, data: dummyUsers })
        }
    })
}

let userController = {
    createDummyUser: createDummyUser,
    createSingleDummyUser: createSingleDummyUser,
    getAllDummmyUser: getAllDummmyUser,
    insertManyDummyUserLoginDeatils: insertManyDummyUserLoginDeatils,
    insertManyDummyUserMemberPrefernaces: insertManyDummyUserMemberPrefernaces,
    deleteAllVertualUsers: deleteAllVertualUsers,
    // createTime: createTime
}

module.exports = userController;