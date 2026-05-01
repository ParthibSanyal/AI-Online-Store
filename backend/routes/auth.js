const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Registration
router.post('/register', auth.register);
router.post('/verify-registration-otp', auth.verifyRegistrationOTP);

// Login
router.post('/login', auth.login);
router.post('/verify-login-otp', auth.verifyLoginOTP);
router.post('/resend-otp', auth.resendOTP);

// Token
router.post('/refresh-token', auth.refreshToken);

// Email verification
router.get('/verify-email/:token', auth.verifyEmail);

// Password reset
router.post('/forgot-password', auth.forgotPassword);
router.post('/verify-reset-otp', auth.verifyResetOTP);
router.post('/reset-password/:token', auth.resetPassword);

// Protected
router.get('/me', protect, auth.getMe);
router.post('/logout', protect, auth.logout);
router.get('/setup-2fa', protect, auth.setup2FA);
router.post('/enable-2fa', protect, auth.enable2FA);

module.exports = router;
