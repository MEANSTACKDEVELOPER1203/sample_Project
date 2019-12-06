let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
// let orders = require("./ordersModel");
let OrdersController = require("./ordersController");

//pagiganation
router.get("/getOrdersByMemberId/:memberId/:createdAt/:limit", OrdersController.getOrdersByMemberId);
// getAll start




// // Create a orders item start
// //desc Create Complete Oreder Details
// //method POST
// //access public
// router.post('/createOrders', OrdersController.createOrders)

// // router.post("/createOrders", function (req, res) {
 
// // });
// // End Create a orders item

// // Edit a orders start

// router.put("/editOrders/:id", function (req, res) {

//   let reqbody = req.body;
//   reqbody.updatedBy = req.body.updatedBy;
//   reqbody.updatedAt = new Date();

//   orders.findByIdAndUpdate(req.params.id, reqbody, function (err, result) {
//     if (err) {
//       res.json({
//         error: "orders Not Exists / Send a valid UserID"
//       });
//     } else {
//       res.json({ message: "orders Updated Successfully" });
//     }
//   });
// });
// // End Edit a orders

// // Find by orderId start

// router.get("/findOrderId/:orderId", function (req, res) {
//   let id = req.params.orderId;

//   orders.findById(id, function (err, result) {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "order document Not Exists / Send a valid ID"
//       });
//     }
//   });
// });
// // End Find by orderId

// // Find by getByMemberId start

// router.get("/getByMemberId/:memberId", function (req, res) {
//   let id = req.params.memberId;

//   orders.find({ memberId: id }, null, { sort: { createdAt: -1 } }, function (err, result) {
//     if (result) {
//       res.json({ token: req.headers['x-access-token'], success: 1, data: result });
//     } else {
//       res.json({ token: req.headers['x-access-token'], success: 0, message: "order transaction document Not Exists / Send a valid ID" });
//     }
//   });
// });
// // End Find by getByMemberId


// router.get("/getAll", function (req, res) {

//   orders.find({}, function (err, result) {
//     if (result) {
//       res.send(result);
//     } else {
//       res.json({
//         error: "No data found!"
//       });
//     }
//   }).sort({ createdAt: -1 });
// });
// // End getAll

// //pagiganation
// router.get("/getAll/:pageNo/:limit", OrdersController.getAll);

// //deleteOrdersById start
// router.delete("/deleteOrdersById/:id", function (req, res, next) {
//   let id = req.params.id;

//   orders.findByIdAndRemove(id, function (err, post) {
//     if (err) {
//       res.json({
//         error: "order document Not Exists / Send a valid ID"
//       });
//     } else {
//       res.json({ message: "Deleted orders Successfully" });
//     }
//   });
// });
// //End deleteOrdersById


// router.get('/getOrderDetailById/:transaction_Id', OrdersController.getOrderDetailById);



module.exports = router;
