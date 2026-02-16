import { create } from 'zustand';
import axios from 'axios';

export const useMessageStore = create((set, get) => ({
  messages: {},
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchMessages: async (matchId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/message/${matchId}?page=${page}`);
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: page === 1 
            ? response.data.messages 
            : [...response.data.messages, ...(state.messages[matchId] || [])]
        },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to load messages', 
        isLoading: false 
      });
    }
  },

  sendMessage: async (matchId, content, messageType = 'text') => {
    try {
      const response = await axios.post(`/message/${matchId}`, {
        content,
        messageType
      });
      
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: [...(state.messages[matchId] || []), response.data]
        }
      }));
      
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      return null;
    }
  },

  addMessage: (matchId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message]
      }
    }));
  },

  markMessageRead: (messageId, readAt) => {
    set((state) => {
      const newMessages = { ...state.messages };
      Object.keys(newMessages).forEach(matchId => {
        newMessages[matchId] = newMessages[matchId].map(msg => 
          msg._id === messageId ? { ...msg, isRead: true, readAt } : msg
        );
      });
      return { messages: newMessages };
    });
  },

  fetchUnreadCount: async () => {
    try {
      const response = await axios.get('/message/unread/count');
      set({ unreadCount: response.data.unreadCount });
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  },

  markAsRead: async (messageId) => {
    try {
      await axios.put(`/message/${messageId}/read`);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
