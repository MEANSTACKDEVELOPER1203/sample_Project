let mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectID;


let view, edit, full;

let roleTypeSchema = new mongoose.Schema({
    // parentProductionId: {
    //     type: mongoose.Schema.Types.ObjectId
    // },
    roleTypeName: {
        type: String,
        default: "",
    },
    filter: [
        {
            _id: false,
            title: {
                type: String
            },
            needed: {
                type: Boolean,
                default: false
            }
        }
    ],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    createdBy: {
        type: String,
        default: "",
    },
    updatedBy: {
        type: String,
        default: "",
    },
}, {
        versionKey: false
    });

let roleType = (module.exports = mongoose.model("roleType", roleTypeSchema));

// Create a roleType
module.exports.createRoleType = function (newRoleType, callback) {
    newRoleType.save(callback);
};

// Edit a roleType

module.exports.editroleType = function (id, reqbody, callback) {
    roleType.findByIdAndUpdate(id, { $set: reqbody }, callback);
};

// Find by Id

module.exports.getroleTypeById = function (id, callback) {
    roleType.findById(ObjectId(id), callback);
};

// Find by memberId

module.exports.getByMemberId = function (id, callback) {
    let query = { memberId: id };
    roleType.find(query, callback);
};

