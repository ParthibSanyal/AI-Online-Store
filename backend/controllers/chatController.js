const Chat = require('../models/Chat');
const User = require('../models/User');

// Get or create chat for user
exports.getMyChat = async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id })
      .populate('messages.sender', 'name avatar role');
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, messages: [] });
    }
    // Mark messages as read by user
    await Chat.findByIdAndUpdate(chat._id, { unreadByUser: 0 });
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send message (user or admin)
exports.sendMessage = async (req, res) => {
  try {
    const { message, chatId, userId } = req.body;
    const isAdmin = req.user.role === 'admin';

    let chat;
    if (isAdmin) {
      chat = await Chat.findById(chatId);
    } else {
      chat = await Chat.findOne({ user: req.user._id });
      if (!chat) chat = await Chat.create({ user: req.user._id, messages: [] });
    }

    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const newMessage = {
      sender: req.user._id,
      senderRole: req.user.role,
      message,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message;

    if (isAdmin) {
      chat.unreadByUser += 1;
    } else {
      chat.unreadByAdmin += 1;
    }

    await chat.save();
    await chat.populate('messages.sender', 'name avatar role');

    const latestMessage = chat.messages[chat.messages.length - 1];

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      if (isAdmin) {
        io.to(`user_${chat.user}`).emit('newMessage', { chatId: chat._id, message: latestMessage });
      } else {
        io.to('admin_room').emit('newMessage', { chatId: chat._id, message: latestMessage, userId: chat.user });
      }
    }

    res.json({ success: true, message: latestMessage, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin - get all chats
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ isOpen: true })
      .populate('user', 'name email avatar')
      .sort('-updatedAt');
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin - get single chat
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'name avatar role')
      .populate('user', 'name email avatar');
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    await Chat.findByIdAndUpdate(chat._id, { unreadByAdmin: 0 });
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Close chat
exports.closeChat = async (req, res) => {
  try {
    await Chat.findByIdAndUpdate(req.params.chatId, { isOpen: false });
    res.json({ success: true, message: 'Chat closed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};