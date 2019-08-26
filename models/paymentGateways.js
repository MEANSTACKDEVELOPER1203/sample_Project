let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;

let PaymentGatewaySchema = new mongoose.Schema({
  name: { 
    type: String, 
    default: "" 
  },
  apiUrl: { 
    type: String, 
    default: "" 
  },
  token: { 
    type: String, 
    default: "" 
  },
  key: { 
    type: String, 
    default: "" 
  },
  username: { 
    type: String, 
    default: "" 
  },
  password: { 
    type: String, 
    default: "" 
  },
  iPinID: { 
    type: String, 
    default: "" 
  },
  status: {
    type: Boolean,
    default: false
  },
  otherDetails: { 
    type: Array, 
    default: "" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  createdBy:{ 
    type: String, 
    default: "" 
  },
  updatedAt:{ 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: String, 
    default: "" 
  }
},{
  versionKey: false
});

let PaymentGateway = (module.exports = mongoose.model("PaymentGateway", PaymentGatewaySchema));

// Create a Post

module.exports.createPost = function (newPost, callback) {
  newPost.save(callback);
};

// Edit a Post

module.exports.editPost = function (id, reqbody, callback) {
  Post.findByIdAndUpdate({ _id: ObjectId(id) }, { $set: reqbody });
};

// Find by Id

module.exports.getPostById = function (id, callback) {
  Post.findById(ObjectId(id), callback);
};

// Find by userName

module.exports.getPostByUserName = function (username, callback) {
  let query = { username: username };
  Post.find(query, callback);
};


