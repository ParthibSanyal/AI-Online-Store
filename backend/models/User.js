const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '', sparse: true },
  isPhoneVerified: { type: Boolean, default: false },
  addresses: [{
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  }],
  isEmailVerified: { type: Boolean, default: false },
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Login OTP
  loginOtp: { type: String, select: false },
  loginOtpExpires: { type: Date, select: false },
  loginOtpType: { type: String, enum: ['email', 'sms'], select: false },
  // Reset OTP
  resetOtp: { type: String, select: false },
  resetOtpExpires: { type: Date, select: false },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  viewedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  searchHistory: [{ query: String, at: { type: Date, default: Date.now } }],
  preferences: {
    categories: [String],
    priceRange: { min: Number, max: Number },
    darkMode: { type: Boolean, default: false },
  },
  refreshToken: { type: String, select: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
