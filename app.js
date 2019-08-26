var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
var async = require('async');
var crypto = require('crypto');
var logger = require('morgan');
var nodemailer = require('nodemailer');
var mandrill = require('mandrill');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('09c356082ec81470c1066b3997768a73-us17');
var https = require('https');
var http = require('http');
var fs = require('fs');
var jwt = require('./jwt/jwt');
// Establish Mongoose Connection, useNewUrlParser: true, useCreateIndex:true
mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
// mongoose.set("useCreateIndex", true);
mongoose.connect('mongodb://localhost/celebKonect', {useMongoClient:true}, (err, sucess) => {
    if (sucess) {
        console.log("db connected successfully")
    } else {
        console.log(err)
    }
});
var db = mongoose.connection;



//////////////////////////////////////// IMPORT ROUTES ///////////////////////////////////////////////////////////////////

var routes = require('./routes/index');
var users = require('./components/users/usersRouter');
var logininfo = require('./components/loginInfo/loginInfoRouter');
var chat = require('./routes/chat');
var email = require('./routes/email');
var preferences = require('./components/preferences/preferencesRouter');
var comLog = require('./components/comLog/comLogRouter');
var comConfig = require('./components/comConfig/comConfigRouter');
var Splashscreen = require('./components/splashScreen/splashScreenRouter');
var MemberPreferences = require('./components/memberpreferences/memberpreferencesRouter');
var feeddata = require('./routes/feeddata');
var feedlog = require('./components/feedLog/feedlogRouter');
var feedMarketing = require('./components/feedMarketing/feedMarketingRouter');
var admin = require('./components/admin/adminRouter');
var activityTransaction = require('./components/activityTransaction/activityTransactionRouter');
var financialTransaction = require('./components/financialTransaction/financialTransactionRouter');
var serviceTransaction = require('./components/serviceTransaction/serviceTransactionRouter');
var auditLog = require('./components/auditLog/auditLogRouter');
var serviceSchedule = require('./components/serviceSchedule/serviceScheduleRouter');
var appInstalls = require('./components/appInstalls/appInstallsRouter');
var appPromoMaster = require('./components/appPromoMaster/appPromoMasterRouter');
var appPromoCodes = require('./components/appPromoCode/appPromoCodesRouter');
var cart = require('./components/cart/cartRouter');
var orders = require('./components/order/ordersRouter');
var celebRequests = require('./components/celebRequest/celebRequestsRouter');
var celebrityContracts = require('./components/celebrityContract/celebrityContractsRouter');
var slotMaster = require('./components/slotMaster/slotMasterRouter');
var liveTimeLog = require('./components/liveTimeLog/liveTimeLogRouter');
var charitySettings = require('./components/charitySettings/charitySettingsRouter');
var notificationSettings = require('./components/notificationSettings/notificationSettingsRouter');
var appSettings = require('./components/appSettings/appSettingsRouter');
var rolePermissions = require('./components/rolePermissions/rolePermissionsRouter');
var memberMedia = require('./components/memberMedia1/memberMediaRouter');
var memberChoice = require('./components/memberChoice/memberChoiceRouter');
var celebSurvey = require('./components/celebSurvey/celebSurveyRouter');
var celebSurveySubmissions = require('./components/celebSurveySubmission/celebSurveySubmissionsRouter');
var referralCode = require('./components/referralCode/referralCodeRouter');
var paymentTransaction = require('./components/paymentTransaction/paymentTransactionRoutes');
var packageCollection = require('./components/packageCollection/packageCollectionRouter');
var credits = require('./components/credits/creditsRouter');
var fanPoke = require('./components/fanPokes/fanPokesRouter');
var creditExchange = require('./components/creditExchange/creditExchangeRouter');
var FCM = require('fcm-push');
var serverkey = 'AAAAPBox0dg:APA91bHS50AmR8HT7nCBKyGUiCoaJneyTU8yfoKrySZJRKbs2tb3TSap2EuMI5Go98FeeuyIR2roxNm9xgmypA_paFp0u902mv9qwqVUCRjSmYyuOVbopw4lCPcIjHhLeb6z7lt9zB3S';
var fcm = new FCM(serverkey);
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
var configSettings = require('./components/configSettings/configSettingsRouter');
var adminMenuMaster = require('./components/adminMenuMaster/adminMenuMasterRouter');
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
//var serviceRouter               = require('./components/service/serviceRouter');

var chatRouter = require('./components/chat/chatRouter');

var genderRouter = require('./components/gender/genderRouter');
var heightRouter = require('./components/height/heightRouter');
var tilentRouter = require('./components/tilent/tilentRoutes');
var feedbackRouter = require('./components/feedback/feedbackRouter');
var awardTpeRouter = require('./components/awardType/awardTypeRoutes');
var degreeTypeRouter = require('./components/degreeType/degreeTypeRoutes');

var commentFeedbackRouter = require('./components/commentFeedBackItems/commentFeedbackRoutes');
var feedCommentFeedback = require('./components/feedCommentFeedback/feedCommentFeedbackRoutes');

const virtualUsersRouter = require('./components/virtualUsers/virtualUsersRouter');
const hashTagMasterRouter = require("./components/hashTagMaster/hashTagMasterRouter");
const hashTagRouter = require("./components/hashTag/hashTagRouter");

const activityLogTypeRouter = require("./components/activityLogTypes/activityLogTypesRouter");
const activityLogRouter = require("./components/activityLog/activityLogRouter");

const searchHistoryRouter = require("./components/searchHistory/searchHistoryRouter");
// const otpRouter = require('./components/otp/otpRouter');
var feedRouter = require('./components/feed/feedRouter'); // new services
const cron = require('./cronJob/feedCronJob.js');
// var dummyService = require("./components/dummyServices/dummyRouter");
//new
let dummyServiceNew = require('./dummyServices/dummyRouter');
let advertisementRouter = require('./components/advertisement/advertisementRouter');
let ientertainRouter = require('./components/ientertain/ientertainRouter');
let storyRouter =require('./components/story/storyRouter');



// End of Import Contest Routes


//////////////////////////////////////// END OF IMPORT ROUTES //////////////////////////////////////////////////////////

// Init App
var app = express();
//var http = require('http').Server(app);

var io = require('socket.io')(http);
var azure = require('azure');
var notificationHubService = azure.createNotificationHubService('CelebKonect', 'Endpoint=sb://ckonect.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=J4xv+xuGjLCr02bNVZA3htVuf56bM3lenYk9hbD3klM=');

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

//     ca: fs.readFileSync ('/root/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')

//    };

//    var https = require('https').createServer(options,app).listen(4300,function(err,data){
//    if(!err){
//        console.log('listening on https://localhost:4300');
//    }
// });


//dev https server

// var options = {

//     key: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/celeb.key'),

//     cert: fs.readFileSync('/home/celebkonectdev/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),

//     ca: fs.readFileSync ('/home/celebkonectdev/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')

// };

// var https = require('https').createServer(options,app).listen(4300,function(err,data){
//    if(!err){
//        console.log('listening on https://localhost:4300');
//    }
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

// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

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

app.use('/', routes);
app.use('/users', users);
app.use('/logininfo', logininfo);
app.use('/preferences', preferences);
app.use('/feeddata', feeddata);
app.use('/feed', feedRouter);//new services
app.use('/feedlog', feedlog);
app.use('/chat', chat);
app.use('/comLog', comLog);
app.use('/admin', admin);
app.use('/comConfig', comConfig);
app.use('/splashscreen', Splashscreen);
app.use('/memberpreferences', MemberPreferences);
app.use('/feedMarketing', feedMarketing);
app.use('/activityTransaction', activityTransaction);
app.use('/financialTransaction', financialTransaction);
app.use('/serviceTransaction', serviceTransaction);
app.use('/auditlog', auditLog);
app.use('/serviceschedule', serviceSchedule);
app.use('/appInstalls', appInstalls);
app.use('/appPromoMaster', appPromoMaster);
app.use('/appPromoCodes', appPromoCodes);
app.use('/cart', cart);
app.use('/orders', orders);
app.use('/celebrequest', celebRequests);
app.use('/celebritycontract', celebrityContracts);
app.use('/slotMaster', slotMaster);
app.use('/livetimelog', liveTimeLog);
app.use('/charitysettings', charitySettings);
app.use('/notificationsettings', notificationSettings);
app.use('/appsettings', appSettings);
app.use('/rolepermissions', rolePermissions);
app.use('/membermedia', memberMedia);
app.use('/memberchoice', memberChoice);
app.use('/celebSurvey', celebSurvey);
app.use('/celebSurveySubmissions', celebSurveySubmissions);
app.use('/referralCode', referralCode);
app.use('/paymentTransaction', paymentTransaction);
app.use('/packageCollection', packageCollection);
app.use('/credits', credits);
app.use('/creditExchange', creditExchange);
app.use('/fanPokes', fanPoke);
app.use('/notification', notifications);
app.use('/payments', payments);
app.use('/auditionCommunication', auditionCommunication);
app.use('/auditionsProfiles', auditionsProfilesRouter);
app.use('/auditionSubscription', auditionSubscription);
app.use('/appCms', appCms);
app.use('/mediaTracking', mediaTracking);
app.use('/countries', countries);
app.use('/appupdate', appupdates);
app.use('/notificationMaster', notificationMaster);
app.use('/banner', bannerRouter);
app.use('/configSettings', configSettings);
app.use('/payCredits', payCredits);
app.use('/celebManagers', celebManagers);
app.use('/adminMenuMaster', adminMenuMaster);
app.use('/productionType', productionType);
// Contest Routes Usage
app.use('/contest', contestRouter);
app.use('/contestQuestions', contestQuestionsRouter);
app.use('/contestSubmissions', contestSubmissionsRouter);
app.use('/contestEntry', contestEntryRouter);
app.use('/votingContest', exerciseRouter);
app.use('/managerPermissionsMaster', managerPermissionsMaster);
app.use('/managerPermissionsAccessMaster', managerPermissionsAccessMaster);
app.use('/managerPermissions', managerPermissions);
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
//app.use('/service',serviceTransaction);
app.use('/tilent', tilentRouter);
app.use('/feedback', feedbackRouter);
app.use('/commentFeedbackRouter', commentFeedbackRouter);
app.use('/feedCommentFeedback', feedCommentFeedback);
app.use('/awardTpeRouter', awardTpeRouter);
app.use('/degreeTypeRouter', degreeTypeRouter);
app.use('/shareRouter', shareRouter);
app.use('/virtualUsers', virtualUsersRouter);
// app.use('/dummy', dummyService);
app.use('/dummy', dummyServiceNew)
app.use('/advertisement', advertisementRouter);
app.use('/hashTagMasterRouter', hashTagMasterRouter);
app.use('/hashTagRouter', hashTagRouter);
app.use('/activityLogType', activityLogTypeRouter);
app.use('/activityLog', activityLogRouter);
app.use('/searchHistory', searchHistoryRouter);
app.use('/ientertain', ientertainRouter);
app.use('/api/story', storyRouter);
// app.use('/otpRouter', otpRouter);

// End of Contest Routes Usage

// Force Update the Application
app.get("/appupdateinfo", function (req, res, next) {
    //console.log('app update called')
    res.json({

    });
});
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


//Set Port
var server = app.listen(4300, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('listening on http://%s:%s', host, port);
});
// git