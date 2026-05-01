const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Review, Coupon, Notification, AILog } = require('../models/index');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders,
      pendingOrders, revenue, recentOrders, topProducts, userGrowth,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'placed' }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name email').populate('items.product', 'name'),
      Product.find().sort('-soldCount').limit(5).select('name soldCount price images'),
      User.aggregate([
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    const categoryRevenue = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.category', revenue: { $sum: { $multiply: ['$items.discountPrice', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: revenue[0]?.total || 0,
      },
      recentOrders,
      topProducts,
      userGrowth,
      monthlyRevenue,
      categoryRevenue,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = new RegExp(search, 'i');

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole } = req.body;
    const query = { isActive: true };
    if (targetRole) query.role = targetRole;

    const users = await User.find(query).select('_id');
    const notifications = users.map(u => ({ user: u._id, title, message, type: type || 'system' }));
    await Notification.insertMany(notifications);

    const io = req.app.get('io');
    if (io) {
      users.forEach(u => io.to(`user_${u._id}`).emit('notification', { title, message, type }));
    }

    res.json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).populate('seller', 'name').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, products, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
