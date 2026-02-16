import { create } from 'zustand';
import axios from 'axios';
import { useSocketStore } from './socketStore.jsx';

export const useMatchStore = create((set, get) => ({
  profiles: [],
  currentProfileIndex: 0,
  matches: [],
  isLoading: false,
  error: null,
  hasMore: true,

  fetchRecommendations: async (limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/recommendation?limit=${limit}`);
      set({ 
        profiles: response.data.recommendations,
        currentProfileIndex: 0,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to load profiles', 
        isLoading: false 
      });
    }
  },

  swipe: async (swipedId, action, timeSpentOnProfile = 0) => {
    try {
      const response = await axios.post('/swipe', {
        swipedId,
        action,
        timeSpentOnProfile
      });

      set((state) => ({
        currentProfileIndex: state.currentProfileIndex + 1,
        profiles: state.profiles.filter(p => p.profile.userId !== swipedId)
      }));

      if (response.data.isMatch) {
        const socket = useSocketStore.getState().socket;
        socket?.emit('new_match', response.data.match);
        return { isMatch: true, match: response.data.match };
      }

      return { isMatch: false };
    } catch (error) {
      console.error('Swipe error:', error);
      return { isMatch: false, error: error.response?.data?.error };
    }
  },

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/match');
      set({ 
        matches: response.data.matches,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to load matches', 
        isLoading: false 
      });
    }
  },

  unmatch: async (matchId) => {
    try {
      await axios.delete(`/match/${matchId}`);
      set((state) => ({
        matches: state.matches.filter(m => m.matchId !== matchId)
      }));
      return true;
    } catch (error) {
      console.error('Unmatch error:', error);
      return false;
    }
  },

  addMatch: (match) => {
    set((state) => ({
      matches: [match, ...state.matches]
    }));
  },

  clearError: () => set({ error: null }),
}));
