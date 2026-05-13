const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['basic', 'premium', 'enterprise'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  features: [String],
  paymentId: String,
  autoRenew: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);