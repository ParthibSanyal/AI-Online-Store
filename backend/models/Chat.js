const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['customer', 'seller', 'admin'] },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [messageSchema],
  isOpen: { type: Boolean, default: true },
  lastMessage: { type: String, default: '' },
  unreadByAdmin: { type: Number, default: 0 },
  unreadByUser: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);