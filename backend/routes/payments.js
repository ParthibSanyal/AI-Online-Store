const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/razorpay/create', protect, ctrl.createRazorpayOrder);
router.post('/razorpay/verify', protect, ctrl.verifyRazorpayPayment);
router.post('/stripe/create-intent', protect, ctrl.createStripeIntent);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), ctrl.stripeWebhook);
router.post('/apply-coupon', protect, ctrl.applyCoupon);

module.exports = router;
