var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
//var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
// var async = require('async');
// var crypto = require('crypto');
var logger = require('morgan');
// var nodemailer = require('nodemailer');
// var mandrill = require('mandrill');
// var mandrill = require('mandrill-api/mandrill');
// var mandrill_client = new mandrill.Mandrill('09c356082ec81470c1066b3997768a73-us17');
var https = require('https');
var http = require('http');
var fs = require('fs');
var jwt = require('./jwt/jwt');
const cluster = require('cluster');
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.setMaxListeners(Math.max(100 - 1, 0));
// emitter.setMaxListeners(0)
const numCPUs = require('os').cpus().length;
const port = 4300
// const port = 4700

// Establish Mongoose Connection, useNewUrlParser: true, useCreateIndex:true
mongoose.Promise = global.Promise;

//replica Set (same db running on multiple port)
mongoose.connect('mongodb://localhost:27017,localhost:27018,localhost:27019/ck?replicaSet=celebKonect', { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true, useCreateIndex: true }, function (err) {
    if (err) {
        console.log("could not connect to DB: " + err);
    }
});
mongoose.connection.on('open', function () {
    console.log("db connected successfully");
})


//normal
//celebKonect
//celebKonectTest
// mongoose.connect('mongodb://localhost/celebKonect', { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true, useCreateIndex: true }, (err, sucess) => {
//     if (sucess) {
//         console.log("db connected successfully")
//     } else {
//         console.log(err)
//     }
// });
// var db = mongoose.connection;

//////////////////////////////////////// IMPORT ROUTES ///////////////////////////////////////////////////////////////////
var routes = require('./routes/index');
var users = require('./components/users/usersRouter');
var logininfo = require('./components/loginInfo/loginInfoRouter');
var preferences = require('./components/preferences/preferencesRouter');
var Splashscreen = require('./components/splashScreen/splashScreenRouter');
var MemberPreferences = require('./components/memberpreferences/memberpreferencesRouter');
var feeddata = require('./routes/feeddata');
var admin = require('./components/admin/adminRouter');
var serviceTransaction = require('./components/serviceTransaction/serviceTransactionRouter');
var serviceSchedule = require('./components/serviceSchedule/serviceScheduleRouter');
var cart = require('./components/cart/cartRouter');
var orders = require('./components/order/ordersRouter');
var celebrityContracts = require('./components/celebrityContract/celebrityContractsRouter');
var slotMaster = require('./components/slotMaster/slotMasterRouter');
var liveTimeLog = require('./components/liveTimeLog/liveTimeLogRouter');
var charitySettings = require('./components/charitySettings/charitySettingsRouter');
var notificationSettings = require('./components/notificationSettings/notificationSettingsRouter');
var appSettings = require('./components/appSettings/appSettingsRouter');
var memberMedia = require('./components/memberMedia1/memberMediaRouter');
var celebSurvey = require('./components/celebSurvey/celebSurveyRouter');
var celebSurveySubmissions = require('./components/celebSurveySubmission/celebSurveySubmissionsRouter');
var referralCode = require('./components/referralCode/referralCodeRouter');
var paymentTransaction = require('./components/paymentTransaction/paymentTransactionRoutes');
var packageCollection = require('./components/packageCollection/packageCollectionRouter');
var credits = require('./components/credits/creditsRouter');
var fanPoke = require('./components/fanPokes/fanPokesRouter');
var notifications = require('./components/notification/notificationRouter');
var payments = require('./components/payment/paymentsRouter');
var auditionCommunication = require('./components/auditionCommunication/auditionCommunicationRouter');
var auditionSubscription = require('./components/auditionSubscription/auditionSubscriptionRouter');
var appCms = require('./components/appCms/appCmsRouter');
var mediaTracking = require('./components/mediaTracking/mediaTrackingRouter');
var countries = require('./components/country/countryRouter');
var appupdates = require('./components/appUpdate/appUpdateRouter');
var notificationMaster = require('./components/notificationMaster/notificationMasterRouter');
var bannerRouter = require('./components/banner/bannerRouter');
var payCredits = require('./components/payCredits/payCreditsRoutes');
var celebManagers = require('./components/CelebManager/celebManagerRoutes');
var managerPermissionsMaster = require('./components/managerPermissionsMaster/managerPermissionsMasterRoutes');
var managerPermissions = require('./components/managerPermission/managerPermissionsRoutes');
var managerPermissionsAccessMaster = require('./components/managerPermissionsAccessMaster/managerPermissionsAccessMasterRoutes');
var productionType = require('./components/productionType/productionTypeRouter');
var RoleType = require('./components/roleType/roleType');
var ethnicity = require('./components/ethnicity/ethnicityRouter');
var mediaRequired = require('./components/mediaRequired/mediaRequiredRouter');
var bodyType = require('./components/bodyType/bodyTypeRouter');
var eyeColour = require('./components/eyeColor/eyeColourRouter');
var interests = require('./components/interests/interestsRouter');
var myInterests = require('./components/myIntrest/myInterestsRouter');
var skinToneRouter = require('./components/skinTone/skinToneRouter');
var languages = require('./components/language/languagesRouter');
var skillsRouter = require('./components/skill/skillsRouter');
var hairColor = require('./components/hairColor/hairColorRouter');
var ageRangeRouter = require('./components/ageRange/ageRangeRouter');
var managerIndustryRoutes = require('./components/managerIndustry/managerIndustry.routes');
var feedsettingsRouter = require('./components/feedSettings/feedSettingsRouter');
// Import Contest Routes
var contestRouter = require('./components/contests/contest/contestRouter');
var contestQuestionsRouter = require('./components/contests/contestQuestions/contestQuestionsRouter');
var contestSubmissionsRouter = require('./components/contests/contestSubmissions/contestSubmissionsRouter');
var contestEntryRouter = require('./components/contests/contestEntries/contestEntriesRouter');
var exerciseRouter = require('./components/contests/onlineExercise/exerciseRouter');
var auditionRouter = require('./components/auditions/auditionRouter');
var roleRouter = require('./components/roles/roleRouter');
var auditionsProfilesRouter = require('./components/auditionsProfiles/auditionsProfilesRouter');
var applyAuditionsRouter = require('./components/applyAuditions/applyAuditionsRouter');
var favoritesRouter = require('./components/favorites/favoritesRouter');
var shareRouter = require('./components/shareApi/shareApiRouter');
var chatRouter = require('./components/chat/chatRouter');
var genderRouter = require('./components/gender/genderRouter');
var heightRouter = require('./components/height/heightRouter');
var tilentRouter = require('./components/tilent/tilentRoutes');
var feedbackRouter = require('./components/feedback/feedbackRouter');
var awardTpeRouter = require('./components/awardType/awardTypeRoutes');
var degreeTypeRouter = require('./components/degreeType/degreeTypeRoutes');
var commentFeedbackRouter = require('./components/commentFeedBackItems/commentFeedbackRoutes');
var feedCommentFeedback = require('./components/feedCommentFeedback/feedCommentFeedbackRoutes');
const activityLogTypeRouter = require("./components/activityLogTypes/activityLogTypesRouter");
const activityLogRouter = require("./components/activityLog/activityLogRouter");
const searchHistoryRouter = require("./components/searchHistory/searchHistoryRouter");
var feedRouter = require('./components/feed/feedRouter'); // new services
let dummyServiceNew = require('./dummyServices/dummyRouter');
let advertisementRouter = require('./components/advertisement/advertisementRouter');
let ientertainRouter = require('./components/ientertain/ientertainRouter');
let storyRouter = require('./components/story/storyRouter');
let storyTrackingRouter = require('./components/storyTracking/storyTrackingRouter')
let report = require('./components/reports/reportRoutes');
let reportFeedbackItems = require('./components/reportFeedback/reportFeedbackRoutes');

//Don't delete
// const cron = require('./cronJob/feedCronJob.js');
// var chat = require('./routes/chat');
// var comLog = require('./components/comLog/comLogRouter');
// var comConfig = require('./components/comConfig/comConfigRouter');
// var feedlog = require('./components/feedLog/feedlogRouter');
// var feedMarketing = require('./components/feedMarketing/feedMarketingRouter');
// var activityTransaction = require('./components/activityTransaction/activityTransactionRouter');
// var financialTransaction = require('./components/financialTransaction/financialTransactionRouter');
// var auditLog = require('./components/auditLog/auditLogRouter');
// var email = require('./routes/email');
// var appInstalls = require('./components/appInstalls/appInstallsRouter');
// var celebRequests = require('./components/celebRequest/celebRequestsRouter');
// var rolePermissions = require('./components/rolePermissions/rolePermissionsRouter');
// var memberChoice = require('./components/memberChoice/memberChoiceRouter');
//var serviceRouter = require('./components/service/serviceRouter');
// const hashTagMasterRouter = require("./components/hashTagMaster/hashTagMasterRouter");
// const hashTagRouter = require("./components/hashTag/hashTagRouter");
// const otpRouter = require('./components/otp/otpRouter');
// var creditExchange = require('./components/creditExchange/creditExchangeRouter');
// var adminMenuMaster = require('./components/adminMenuMaster/adminMenuMasterRouter');
// var configSettings = require('./components/configSettings/configSettingsRouter');
// var appPromoMaster = require('./components/appPromoMaster/appPromoMasterRouter');
// var appPromoCodes = require('./components/appPromoCode/appPromoCodesRouter');
// End of Import Contest Routes
//////////////////////////////////////// END OF IMPORT ROUTES //////////////////////////////////////////////////////////

// Init App
var app = express();
//var http = require('http').Server(app);

// var io = require('socket.io')(http);
// var azure = require('azure');
// var notificationHubService = azure.createNotificationHubService('CelebKonect', 'Endpoint=sb://ckonect.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=J4xv+xuGjLCr02bNVZA3htVuf56bM3lenYk9hbD3klM=');

// Morgan Logger
app.use(logger('dev'));

// View Engine
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');
app.set('view engine', 'ejs');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'views')));
// GET /static/style.css etc.
app.use('/avtars', express.static(__dirname + '/avtars'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(jwt.verifyToken)


// test ANd Live https server configuration
// var options = {
//     key: fs.readFileSync('/root/cb_konect_node/uploads/SSL/celeb.key'),
//     cert: fs.readFileSync('/root/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
//     ca: fs.readFileSync('/root/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
// };
// var https = require('https').createServer(options, app).listen(4300, function (err, data) {
//     if (!err) {
//         console.log('listening on https://localhost:4300');
//     }
// });


//dev https server
// var options = {
//     key: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/celeb.key'),
//     cert: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
//     ca: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
// };
// var https = require('https').createServer(options, app).listen(4700, function (err, data) {
//     if (!err) {
//         console.log('listening on https://localhost:4700');
//     }
// });



// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());


// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Declare Route Paths Here

// app.use('/', routes);
app.use('/users', users);
app.use('/logininfo', logininfo);
app.use('/preferences', preferences);
app.use('/feeddata', feeddata);
app.use('/feed', feedRouter);
app.use('/admin', admin);
app.use('/splashscreen', Splashscreen);
app.use('/memberpreferences', MemberPreferences);
app.use('/serviceTransaction', serviceTransaction);
app.use('/serviceschedule', serviceSchedule);
app.use('/cart', cart); //no
app.use('/orders', orders);
app.use('/celebritycontract', celebrityContracts);
app.use('/slotMaster', slotMaster);
app.use('/livetimelog', liveTimeLog);
app.use('/charitysettings', charitySettings); //no
app.use('/notificationsettings', notificationSettings);
app.use('/appsettings', appSettings);//no
app.use('/membermedia', memberMedia);
app.use('/referralCode', referralCode);
app.use('/paymentTransaction', paymentTransaction);
app.use('/packageCollection', packageCollection);
app.use('/credits', credits);
app.use('/fanPokes', fanPoke);//no
app.use('/notification', notifications);
app.use('/payments', payments);
app.use('/mediaTracking', mediaTracking);
app.use('/countries', countries);
app.use('/notificationMaster', notificationMaster);
app.use('/payCredits', payCredits);
app.use('/feedback', feedbackRouter);
app.use('/commentFeedbackRouter', commentFeedbackRouter);
app.use('/feedCommentFeedback', feedCommentFeedback);
app.use('/shareRouter', shareRouter);
app.use('/report', report);
app.use('/reportFeedbackItems', reportFeedbackItems);
app.use('/activityLogType', activityLogTypeRouter);
app.use('/activityLog', activityLogRouter);
app.use('/searchHistory', searchHistoryRouter);
app.use('/story', storyRouter);
app.use('/storyTracking', storyTrackingRouter);
app.use('/feedsettings', feedsettingsRouter);

// Contest Routes Usage
app.use('/celebSurvey', celebSurvey);//no
app.use('/celebSurveySubmissions', celebSurveySubmissions);//no
app.use('/awardTpeRouter', awardTpeRouter);//no
app.use('/contest', contestRouter);//no
app.use('/contestQuestions', contestQuestionsRouter);//no
app.use('/contestSubmissions', contestSubmissionsRouter);//no
app.use('/contestEntry', contestEntryRouter);//no
app.use('/votingContest', exerciseRouter);//no
//end  Contest Routes Usage

//backend
app.use('/productionType', productionType);
app.use('/banner', bannerRouter);
app.use('/appupdate', appupdates);
app.use('/appCms', appCms);
app.use('/dummy', dummyServiceNew)
app.use('/advertisement', advertisementRouter);
app.use('/ientertain', ientertainRouter);
//end backend

//manager(Reaming from mobile side)
app.use('/celebManagers', celebManagers);
app.use('/managerPermissionsMaster', managerPermissionsMaster);
app.use('/managerPermissionsAccessMaster', managerPermissionsAccessMaster);
app.use('/managerPermissions', managerPermissions);
//end manager

//audition (Reaming from mobile side)
app.use('/auditionCommunication', auditionCommunication);
app.use('/auditionsProfiles', auditionsProfilesRouter);
app.use('/auditionSubscription', auditionSubscription);
app.use('/degreeTypeRouter', degreeTypeRouter);
app.use('/RoleType', RoleType);
app.use('/ethnicity', ethnicity);
app.use('/mediaRequired', mediaRequired);
app.use('/favoritesRouter', favoritesRouter);
app.use('/auditionRouter', auditionRouter);
app.use('/roleRouter', roleRouter);
app.use('/bodyType', bodyType);
app.use('/eyeColour', eyeColour);
app.use('/interests', interests);
app.use('/myInterests', myInterests);
app.use('/skinTone', skinToneRouter);
app.use('/languages', languages);
app.use('/skills', skillsRouter);
app.use('/hairColor', hairColor);
app.use('/ageRange', ageRangeRouter);
app.use('/applyAuditionsRouter', applyAuditionsRouter);
app.use('/managerIndustry', managerIndustryRoutes);
app.use('/chatRouter', chatRouter);
app.use('/gender', genderRouter);
app.use('/heightRange', heightRouter);
app.use('/tilent', tilentRouter);
//end audition

//Don't delete
// app.use('/feedlog', feedlog); only in admin side
// app.use('/chat', chat); //now not using (check admin)
// app.use('/comLog', comLog); //now not using in app (check admin)
// app.use('/comConfig', comConfig); //now not using in app (check admin)
// app.use('/feedMarketing', feedMarketing); //now not using in app (check admin)
// app.use('/activityTransaction', activityTransaction); //now not using in app (check admin)
// app.use('/financialTransaction', financialTransaction); //now not using in app (check admin)
// app.use('/auditlog', auditLog); //now not using in app (check admin)
// app.use('/celebrequest', celebRequests);   //now not using in app (check admin)
// app.use('/rolepermissions', rolePermissions); //now not using in app (check admin)
// app.use('/memberchoice', memberChoice); //now not using in app (check admin)
// app.use('/appInstalls', appInstalls);  //now not using in app (check admin)
// app.use('/hashTagMasterRouter', hashTagMasterRouter);
// app.use('/hashTagRouter', hashTagRouter);
// app.use('/creditExchange', creditExchange);
// app.use('/adminMenuMaster', adminMenuMaster);
// app.use('/configSettings', configSettings);
// app.use('/appPromoMaster', appPromoMaster);
// app.use('/appPromoCodes', appPromoCodes);
// app.use('/otpRouter', otpRouter);
// End of Contest Routes Usage

// Force Update the Application
// app.get("/appupdateinfo", function (req, res, next) {
//     //console.log('app update called')
//     res.json({

//     });
// });
// End of Force Update the Application
// Error Handling
app.use((req, res, next) => {
    const error = new Error('404 Not Found, please enter correct URL!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


/******* 
     Start   CLUSTER
Node.js runs single threaded programming, 
which is very memory efficient, but to take advantage of computers multi-core systems, 
the Cluster module allows you to easily create 
child processes that each runs on their own single thread, to handle the load.

*********** */
// if (cluster.isMaster) {
//     masterProcess();
// } else {
//     childProcess();
// }

function masterProcess() {
    console.log(`Master ${process.pid} is running`);
    //numCPUs
    console.log(`number of CPUs ${numCPUs}...`);
    for (let i = 0; i < numCPUs; i++) {
        console.log(`Forking process number ${i}...`);
        cluster.fork();
    }
    cluster.on('fork', function (worker) {
        console.log('worker:' + worker.id + " is forked");
    });
    cluster.on('online', function (worker) {
        console.log('worker:' + worker.id + " is online");
    });
    cluster.on('listening', function (worker) {
        console.log('worker:' + worker.id + " is listening");
    });
    cluster.on('disconnect', function (worker) {
        console.log('worker:' + worker.id + " is disconnected");
    });
    cluster.on('exit', function (worker) {
        console.log('worker:' + worker.id + " is dead");
    });
}

function childProcess() {
    console.log(`Worker/Child process with pid ${process.pid} starting...`);


    // test ANd Live https server configuration
    var options = {
        key: fs.readFileSync('/root/cb_konect_node/uploads/SSL/celeb.key'),
        cert: fs.readFileSync('/root/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
        ca: fs.readFileSync('/root/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
    };
    var https = require('https').createServer(options, app).listen(port, function (err, data) {
        if (!err) {
            console.log('listening on https://localhost:4300');
        }
    });


    //dev https server
    // var options = {
    //     key: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/celeb.key'),
    //     cert: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
    //     ca: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
    // };
    // var https = require('https').createServer(options, app).listen(port, function (err, data) {
    //     if (!err) {
    //         console.log('listening on https://localhost:4700');
    //     }
    // });

    // var server = https.createServer(options, app);
    // shareTlsSessions(server);
    // server.listen(port);


    // var server = app.listen(port, function () {
    //     var host = server.address().address
    //     var port = server.address().port
    //     console.log('listening on http://%s:%s', host, port);
    // });


    // var server = https.createServer(options, app);
    // // shareTlsSessions(server);
    // console.log('listening on https://localhost:4700');
    // server.listen(port);

    // var server = https.createServer(options, app).listen(port, (err, data) => {
    //     if (!err) {
    //         console.log('listening on https://localhost:4700');
    //         console.log('listening on http://%s:%s', port, server[0], server[1]);
    //     }
    // });
}
/*******         CLUSTER END           *********** */




//Set Port
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('listening on http://%s:%s', host, port);
});
// git