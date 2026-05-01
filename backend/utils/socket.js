exports.socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User joins their own room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Real-time order tracking
    socket.on('trackOrder', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Admin joins admin room
    socket.on('joinAdmin', () => {
      socket.join('admin');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
