import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useMatchStore } from './matchStore.jsx';
import { useMessageStore } from './messageStore.jsx';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Set(),

  connect: (userId) => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
      socket.emit('authenticate', { userId });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('Socket authenticated');
      }
    });

    socket.on('new_match', (data) => {
      useMatchStore.getState().addMatch(data);
    });

    socket.on('new_message', (data) => {
      const { addMessage } = useMessageStore.getState();
      addMessage(data.matchId, data.message);
    });

    socket.on('message_read', (data) => {
      const { markMessageRead } = useMessageStore.getState();
      markMessageRead(data.messageId, data.readAt);
    });

    socket.on('typing', (data) => {
      set((state) => ({
        typingUsers: new Set([...state.typingUsers, data.userId])
      }));
    });

    socket.on('stop_typing', (data) => {
      set((state) => {
        const newTypingUsers = new Set(state.typingUsers);
        newTypingUsers.delete(data.userId);
        return { typingUsers: newTypingUsers };
      });
    });

    socket.on('user_online', (data) => {
      set((state) => ({
        onlineUsers: new Set([...state.onlineUsers, data.userId])
      }));
    });

    socket.on('user_offline', (data) => {
      set((state) => {
        const newOnlineUsers = new Set(state.onlineUsers);
        newOnlineUsers.delete(data.userId);
        return { onlineUsers: newOnlineUsers };
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinMatch: (matchId) => {
    const { socket } = get();
    socket?.emit('join_match', { matchId });
  },

  leaveMatch: (matchId) => {
    const { socket } = get();
    socket?.emit('leave_match', { matchId });
  },

  sendTyping: (matchId) => {
    const { socket } = get();
    socket?.emit('typing', { matchId });
  },

  stopTyping: (matchId) => {
    const { socket } = get();
    socket?.emit('stop_typing', { matchId });
  },
}));
