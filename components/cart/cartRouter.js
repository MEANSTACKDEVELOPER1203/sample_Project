let express = require("express");
let router = express.Router();
let ObjectId = require("mongodb").ObjectID;
let cart = require("./cartModel");

// Create a cart item
router.post("/createCart", function (req, res) {
  let requestMemberId = req.body.requestMemberId;
  let celebrityId = req.body.celebrityId;
  let scheduleId = req.body.scheduleId;
  let cartType = req.body.cartType;
  let title = req.body.title;
  let category = req.body.category;
  let description = req.body.description;
  let quantity = req.body.quantity;
  let price = req.body.price;
  let credits = req.body.credits;
  let cartCheckoutType = req.body.cartCheckoutType;
  let mediaType = req.body.mediaType;
  let serviceType = req.body.serviceType;
  let startTime = req.body.startTime;
  let endTime = req.body.endTime;
  let cartStatus = req.body.cartStatus;
  let createdBy = req.body.createdBy;

  if (cartType == "service") {
    let currentTime = new Date();
    let query = {
      $and: [
        { requestMemberId: ObjectId(requestMemberId) },
        {
          $or: [
            { startTime: { $gte: startTime, $lte: endTime } },
            { endTime: { $gte: startTime, $lte: endTime } }]
        }
      ]
    };
    cart.find(query, function (err, existCart) {
      if (err) return res.json({ err: err });
      //res.json(cart);
      if (existCart.length > 0) {
        res.json({ error: "cart items exists given timeline" ,currentTime});
      } else if(existCart.length == 0){
        let cartRecord = new cart({
          requestMemberId: requestMemberId,
          celebrityId: celebrityId,
          scheduleId: scheduleId,
          cartType: cartType,
          title: title,
          category: category,
          cartCheckoutType: cartCheckoutType,
          description: description,
          credits: credits,
          serviceType: serviceType,
          startTime: startTime,
          endTime: endTime,
          createdBy: createdBy
        });

        cart.createCart(cartRecord, function (err, cart) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "cart saved successfully" ,currentTime});
          }
        });

      }
    });

  } else if (cartType == "media") {
    let cartRecord = new cart({
      requestMemberId: requestMemberId,
      celebrityId: celebrityId,
      cartType: cartType,
      mediaType: mediaType,
      title: title,
      cartCheckoutType: cartCheckoutType,
      category: category,
      description: description,
      quantity: quantity,
      credits: credits,
      price: price,
      createdBy: createdBy
    });

    cart.createCart(cartRecord, function (err, cart) {
      if (err) {
        res.send(err);
      } else {
        res.json({ message: "cart saved successfully" });
      }
    });
  } else if (cartType == "product") {
    let cartRecord = new cart({
      requestMemberId: requestMemberId,
      celebrityId: celebrityId,
      cartType: cartType,
      title: title,
      category: category,
      cartCheckoutType: cartCheckoutType,
      description: description,
      quantity: quantity,
      credits: credits,
      price: price,
      createdBy: createdBy
    });

    cart.createCart(cartRecord, function (err, cart) {
      if (err) {
        res.send(err);
      } else {
        res.json({ message: "cart saved successfully" });
      }
    });
  } else {
    res.json({ error: "Invalid Cart Type Selected" });
  }
});
// End of  Create a cart item

// Edit a cart document
router.put("/updateCart/:id", function (req, res) {
  let reqbody = req.body;
  let id = req.params.id;

  reqbody.updatedBy = req.body.updatedBy;
  reqbody.updatedAt = new Date();

  cart.editCart(id, reqbody, function (err, result) {
    if (err) {
      res.json({
        error: "User Not Exists / Send a valid UserID"
      });
    } else {
      res.json({ message: "Cart updated successfully" });
    }
  });
});
// End of Edit a cart document

// Find by Cart ID
router.get("/findBycartId/:Id", function (req, res) {
  let id = req.params.Id;

  cart.getCartById(id, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.json({
        error: "Cart Not Exists / Send a valid ID"
      });
    }
  });
});
// End of Find by Cart ID

// Find Cart details by MemberId
router.get("/getByRequestMemberId/:requestMemberId", function (req, res) {
  let id = req.params.requestMemberId;

  cart.aggregate(
    [
      { $match: { requestMemberId: ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "requestMemberId",
          foreignField: "_id",
          as: "requestMemberProfile"
        }
      },
      { $unwind: "$requestMemberProfile" },
      {
        $lookup: {
          from: "users",
          localField: "celebrityId",
          foreignField: "_id",
          as: "celebrityProfile"
        }
      },
      { $unwind: "$celebrityProfile" },
      { $match: { $and: [{ cartStatus: "active" }, { startTime: { $gte: new Date() } }] } }
    ],
    function (err, data) {
      if (err) {
        res.json({token:req.headers['x-access-token'],success:0,message:err})
      }
      return res.json({token:req.headers['x-access-token'],success:1,data:data})
      
    }
  );
});
// End of Find Cart details by MemberId

// Delete by cart ID
router.delete("/deletecartById/:id", function (req, res, next) {
  let id = req.params.id;

  cart.findByIdAndRemove(id, function (err, post) {
    if (err) {
      res.json({token:req.headers['x-access-token'],success:0,message:"Activity transaction document Not Exists / Send a valid ID"})
    } else {
      res.json({token:req.headers['x-access-token'],success:1,message: "Deleted cart Successfully"});
    }
  });
});
// End of Delete by cart ID

// Get All cart items (All Users)
router.get("/allCartItems", function (req, res) {
  cart.find(function (err, cart) {
    if (err) return next(err);
    res.json(cart);
  }).sort({ createdAt: -1 });
});
// End of Get All cart items (All Users)

module.exports = router;
