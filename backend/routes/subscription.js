const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/plans', ctrl.getPlans);
router.post('/subscribe', protect, ctrl.subscribe);
router.get('/my', protect, ctrl.getMySubscription);
router.put('/cancel', protect, ctrl.cancelSubscription);
router.get('/all', protect, authorize('admin'), ctrl.getAllSubscriptions);
router.post('/create-payment', protect, ctrl.createPayment);
router.post('/verify-payment', protect, ctrl.verifyPayment);

module.exports = router;