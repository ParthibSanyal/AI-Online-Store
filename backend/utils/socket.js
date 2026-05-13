exports.socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('joinAdmin', () => {
      socket.join('admin_room');
    });

    socket.on('trackOrder', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    socket.on('typing', ({ chatId, isAdmin }) => {
      if (isAdmin) {
        io.to(`chat_${chatId}`).emit('typing', { isAdmin: true });
      } else {
        io.to('admin_room').emit('typing', { chatId, isAdmin: false });
      }
    });

    socket.on('joinChat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};