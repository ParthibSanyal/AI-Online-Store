const Razorpay = require('razorpay');
const Stripe = require('stripe');
const crypto = require('crypto');
const Order = require('../models/Order');
const { Notification } = require('../models/index');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const razorpay = getRazorpay();
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
    });

    await Order.findByIdAndUpdate(orderId, { 'paymentDetails.razorpayOrderId': rpOrder.id });

    res.json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      'paymentDetails.razorpayPaymentId': razorpay_payment_id,
      'paymentDetails.paidAt': new Date(),
      $push: { statusHistory: { status: 'confirmed', message: 'Payment confirmed via Razorpay' } },
    }, { new: true });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.user}`).emit('paymentSuccess', { orderId: order._id });
      const notif = await Notification.create({
        user: order.user,
        title: 'Payment Successful!',
        message: `Payment of ₹${order.total} received for order #${order.orderNumber}`,
        type: 'payment',
      });
      io.to(`user_${order.user}`).emit('notification', notif);
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStripeIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'inr',
      metadata: { orderId: orderId.toString(), orderNumber: order.orderNumber },
    });

    await Order.findByIdAndUpdate(orderId, { 'paymentDetails.stripePaymentIntentId': paymentIntent.id });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await Order.findOneAndUpdate(
      { 'paymentDetails.stripePaymentIntentId': pi.id },
      { paymentStatus: 'paid', orderStatus: 'confirmed', 'paymentDetails.paidAt': new Date() }
    );
  }

  res.json({ received: true });
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const { Coupon } = require('../models/index');
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, validUntil: { $gt: new Date() } });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ success: false, message: 'Coupon already used' });
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount: ₹${coupon.minOrderAmount}` });
    }

    let discount = coupon.discountType === 'percentage'
      ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount || Infinity)
      : coupon.discountValue;

    res.json({ success: true, discount, coupon: { code: coupon.code, description: coupon.description } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
