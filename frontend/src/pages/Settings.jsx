import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.jsx';
import { Settings, Bell, Shield, Sliders, LogOut, ChevronRight, Sparkles, Crown } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { logout } = useAuthStore();
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    profileLikes: true,
    appUpdates: false
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/preferences');
      setPreferences(response.data);
    } catch (error) {
      toast.error('Failed to load preferences');
    }
  };

  const handleSave = async (updates) => {
    setIsLoading(true);
    try {
      await axios.put('/preferences', updates);
      setPreferences({ ...preferences, ...updates });
      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!preferences) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-dark-900 to-dark-900/95 backdrop-blur-xl border-b border-gray-800/50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Customize your experience</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Matching Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-red-500" />
            Matching Preferences
          </h2>

          <div className="space-y-6">
            {/* Age Range */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-300">
                  Age Range
                </label>
                <span className="text-white font-bold bg-red-500/20 px-3 py-1 rounded-full text-sm">
                  {preferences.ageRange.min} - {preferences.ageRange.max} years
                </span>
              </div>
              <div className="relative h-2 bg-gray-800 rounded-full">
                <div 
                  className="absolute h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full"
                  style={{ 
                    left: `${(preferences.ageRange.min / 100) * 100}%`,
                    right: `${100 - (preferences.ageRange.max / 100) * 100}%`
                  }}
                />
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={preferences.ageRange.min}
                  onChange={(e) => handleSave({
                    ageRange: { ...preferences.ageRange, min: parseInt(e.target.value) }
                  })}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={preferences.ageRange.max}
                  onChange={(e) => handleSave({
                    ageRange: { ...preferences.ageRange, max: parseInt(e.target.value) }
                  })}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>18</span>
                <span>100</span>
              </div>
            </div>

            {/* Distance */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-300">
                  Maximum Distance
                </label>
                <span className="text-white font-bold bg-red-500/20 px-3 py-1 rounded-full text-sm">
                  {preferences.distance} km
                </span>
              </div>
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full transition-all"
                  style={{ width: `${(preferences.distance / 500) * 100}%` }}
                />
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={preferences.distance}
                  onChange={(e) => handleSave({ distance: parseInt(e.target.value) })}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 km</span>
                <span>500 km</span>
              </div>
            </div>

            {/* Looking For */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Looking For
              </label>
              <div className="relative">
                <select
                  value={preferences.lookingFor}
                  onChange={(e) => handleSave({ lookingFor: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl appearance-none focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="not-sure">Not sure yet</option>
                  <option value="relationship">Relationship</option>
                  <option value="casual">Something casual</option>
                  <option value="friendship">Friendship</option>
                  <option value="marriage">Marriage</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 rotate-90" />
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Gender Preference
              </label>
              <div className="flex gap-2 flex-wrap">
                {['all', 'male', 'female', 'non-binary'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => handleSave({
                      genderPreference: preferences.genderPreference.includes(gender)
                        ? preferences.genderPreference.filter(g => g !== gender)
                        : [...preferences.genderPreference, gender]
                    })}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      preferences.genderPreference.includes(gender)
                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'newMatches', label: 'New matches', icon: Sparkles },
              { key: 'messages', label: 'Messages', icon: Bell },
              { key: 'profileLikes', label: 'Profile likes', icon: Bell },
              { key: 'appUpdates', label: 'App updates', icon: Bell }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <span className="text-gray-300">{item.label}</span>
                <button 
                  onClick={() => toggleNotification(item.key)}
                  className={`w-14 h-7 rounded-full relative transition-colors ${
                    notifications[item.key] ? 'bg-red-500' : 'bg-gray-700'
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                      notifications[item.key] ? 'right-1' : 'left-1'
                    }`} 
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Privacy & Security
          </h2>
          
          <div className="space-y-2">
            {[
              'Change Password',
              'Privacy Settings',
              'Blocked Users'
            ].map((item) => (
              <button 
                key={item}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-between group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">{item}</span>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-2xl p-6 border border-red-800/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">SoulSync Pro</h2>
                <p className="text-red-400 text-sm">Upgrade for premium features</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-bold rounded-lg">
              FREE
            </span>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:shadow-red-glow transition-all">
            Upgrade Now
          </button>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-500" />
            Account
          </h2>
          
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
              Pause Account
            </button>
            
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
            
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
