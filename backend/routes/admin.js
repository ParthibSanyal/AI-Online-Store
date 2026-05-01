const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.put('/users/:userId/toggle', ctrl.toggleUserStatus);
router.get('/orders', ctrl.getAllOrders);
router.get('/products', ctrl.getAllProducts);
router.post('/coupons', ctrl.createCoupon);
router.get('/coupons', ctrl.getCoupons);
router.delete('/coupons/:id', ctrl.deleteCoupon);
router.post('/broadcast', ctrl.broadcastNotification);

module.exports = router;
