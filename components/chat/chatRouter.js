let express = require('express');
let chatController = require('./chatController');
let router = express.Router();


router.post('/createChatMessage', chatController.createChatMessage);
router.get('/getCurrentMemberChat/:member_Id', chatController.getCurrentMemberChat);
router.get('/getAllChatMessages/:sender_Id/:receiver_Id/:pagination_Date/:limit', chatController.getAllChatMessages)
router.get('/getLastMessageByReceiverId/:chat_Id/:sender_Id', chatController.getLastMessagesByReceiverId);
router.get('/getMessageById/:message_Id', chatController.getMessageById);
router.get('/getUnreadMessageCount/:member_Id',chatController.getUnreadMessageCount);




module.exports = router;