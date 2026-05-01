const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/recommendations', protect, ctrl.getRecommendations);
router.get('/similar/:productId', optionalAuth, ctrl.getSimilarProducts);
router.get('/trending', ctrl.getTrending);
router.post('/chatbot', optionalAuth, ctrl.chatbot);
router.post('/smart-search', optionalAuth, ctrl.smartSearch);

module.exports = router;
