const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Coupon } = require('../models/index');

router.get('/', protect, authorize('admin'), async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, coupon });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, coupon });
});
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

module.exports = router;
