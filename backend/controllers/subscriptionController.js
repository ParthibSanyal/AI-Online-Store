const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');

const PLANS = {
  basic: {
    price: 99,
    duration: 30,
    features: ['AI Recommendations', 'Priority Support', 'Early Access Deals'],
  },
  premium: {
    price: 299,
    duration: 30,
    features: ['All Basic Features', 'Free Shipping', 'Exclusive Discounts', 'Premium Badge'],
  },
  enterprise: {
    price: 999,
    duration: 30,
    features: ['All Premium Features', 'Dedicated Support', 'Custom Deals', 'API Access'],
  },
};

exports.getPlans = async (req, res) => {
  res.json({ success: true, plans: PLANS });
};

exports.subscribe = async (req, res) => {
  try {
    const { plan, paymentId } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

    // Cancel existing subscription
    await Subscription.findOneAndUpdate(
      { user: req.user._id, status: 'active' },
      { status: 'cancelled' }
    );

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLANS[plan].duration);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      price: PLANS[plan].price,
      features: PLANS[plan].features,
      endDate,
      paymentId,
    });

    res.status(201).json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() },
    });
    res.json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    await Subscription.findOneAndUpdate(
      { user: req.user._id, status: 'active' },
      { status: 'cancelled', autoRenew: false }
    );
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.createPayment = async (req, res) => {
  try {
    const { plan } = req.body;
    console.log('Plan:', plan);
    console.log('Razorpay Key:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING');
    console.log('Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING');

    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay keys not configured' });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: PLANS[plan].price * 100,
      currency: 'INR',
      receipt: `sub_${plan}_${Date.now().toString().slice(-8)}`,
    });

    console.log('Razorpay order created:', order.id);

    res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('CREATE PAYMENT ERROR FULL:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment creation failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

    // Cancel existing subscription
    await Subscription.findOneAndUpdate(
      { user: req.user._id, status: 'active' },
      { status: 'cancelled' }
    );

    // Create new subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLANS[plan].duration);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      price: PLANS[plan].price,
      features: PLANS[plan].features,
      endDate,
      paymentId: razorpay_payment_id,
    });

    res.json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};