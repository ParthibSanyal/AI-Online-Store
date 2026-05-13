const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, ctrl.getMyChat);
router.post('/send', protect, ctrl.sendMessage);
router.get('/all', protect, authorize('admin'), ctrl.getAllChats);
router.get('/:chatId', protect, authorize('admin'), ctrl.getChatById);
router.put('/:chatId/close', protect, authorize('admin'), ctrl.closeChat);

module.exports = router;