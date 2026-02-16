const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const Message = require('../models/Message');

module.exports = (io, redisClient) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('authenticate', async (data) => {
      try {
        const { userId } = data;
        socket.userId = userId;
        socket.join(`user:${userId}`);
        
        await redisClient.hSet(`online_users`, userId, Date.now().toString());
        
        socket.emit('authenticated', { success: true });
        
        socket.to(`user:${userId}`).emit('user_online', { userId });
      } catch (error) {
        socket.emit('authenticated', { success: false, error: error.message });
      }
    });

    socket.on('join_match', (data) => {
      const { matchId } = data;
      if (socket.userId) {
        socket.join(`match:${matchId}`);
        socket.to(`match:${matchId}`).emit('user_joined', { userId: socket.userId });
      }
    });

    socket.on('leave_match', (data) => {
      const { matchId } = data;
      socket.leave(`match:${matchId}`);
    });

    socket.on('typing', (data) => {
      const { matchId } = data;
      socket.to(`match:${matchId}`).emit('typing', { userId: socket.userId });
    });

    socket.on('stop_typing', (data) => {
      const { matchId } = data;
      socket.to(`match:${matchId}`).emit('stop_typing', { userId: socket.userId });
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        await redisClient.hDel(`online_users`, socket.userId);
        socket.to(`user:${socket.userId}`).emit('user_offline', { userId: socket.userId });
      }
      console.log('User disconnected:', socket.id);
    });
  });
};
