import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Heart, Verified, Filter, Sparkles, X, ChevronRight, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMatchStore } from '../stores/matchStore.jsx';

const Browse = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { swipe } = useMatchStore();

  const commonInterests = [
    'Sports', 'Music', 'Movies', 'Travel', 'Food', 'Gaming', 
    'Reading', 'Photography', 'Art', 'Fitness', 'Cooking', 'Technology',
    'Dancing', 'Hiking', 'Yoga', 'Coffee', 'Fashion', 'Pets'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    searchUsers();
  }, [selectedGender]);

  // Debounced search by name
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/profile/all/list');
      const profiles = response.data?.profiles || [];
      setUsers(profiles);
      setFilteredUsers(profiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (selectedGender !== 'all') {
        params.append('gender', selectedGender);
      }
      
      const response = await axios.get(`/profile/all/list?${params.toString()}`);
      const profiles = response.data?.profiles || [];
      setFilteredUsers(profiles);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Client-side filtering for interests only
  const filterUsers = () => {
    if (selectedInterests.length === 0) return;
    
    const filtered = filteredUsers.filter(user => 
      selectedInterests.some(interest => 
        user.interests?.includes(interest)
      )
    );
    setFilteredUsers(filtered);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleLike = async (userId, e) => {
    e.stopPropagation();
    try {
      await swipe(userId, 'like', 5);
      toast.success('Liked! 💕');
    } catch (error) {
      toast.error('Failed to like user');
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const UserCard = ({ user, index }) => {
    const mainPhoto = user.photos?.find(p => p.isMain) || user.photos?.[0];
    const age = calculateAge(user.dateOfBirth);
    const isVerified = user.isVerified || false;

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-900/20"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {mainPhoto ? (
            <img
              src={mainPhoto.url}
              alt={user.firstName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <User className="w-20 h-20 text-gray-700" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {user.matchScore && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-800 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                <Sparkles className="w-3 h-3" />
                {user.matchScore}% Match
              </div>
            )}
            {isVerified && (
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Verified className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Like Button - Appears on Hover */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => handleLike(user.userId || user._id, e)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-red-500/50"
          >
            <Heart className="w-7 h-7 text-white" fill="white" />
          </motion.button>

          {/* User Info - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{user.firstName}</h3>
              {age && <span className="text-lg text-gray-400">{age}</span>}
            </div>
            
            {user.location?.city && (
              <div className="flex items-center text-gray-400 text-sm mb-2">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {user.location.city}
              </div>
            )}

            {/* Interests Tags */}
            {user.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {user.interests.slice(0, 2).map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-xs"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 2 && (
                  <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-xs">
                    +{user.interests.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const maleUsers = filteredUsers.filter(u => u.gender === 'male');
  const femaleUsers = filteredUsers.filter(u => u.gender === 'female');
  const otherUsers = filteredUsers.filter(u => !['male', 'female'].includes(u.gender));

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800 pb-24">
      {/* Hero Search Section */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-dark-900 via-dark-900 to-dark-900/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Browse Users</h1>
            <p className="text-gray-400">Find your perfect match from {filteredUsers.length} users</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-gray-800/80 border border-gray-700 text-white pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-14 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                showFilters || selectedInterests.length > 0
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <Filter className="w-5 h-5" />
              {selectedInterests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 text-xs rounded-full flex items-center justify-center font-bold">
                  {selectedInterests.length}
                </span>
              )}
            </button>
          </div>

          {/* Gender Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'all', label: 'All', count: filteredUsers.length, icon: '👥' },
              { id: 'male', label: 'Men', count: maleUsers.length, icon: '👨' },
              { id: 'female', label: 'Women', count: femaleUsers.length, icon: '👩' }
            ].map((gender) => (
              <button
                key={gender.id}
                onClick={() => setSelectedGender(gender.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGender === gender.id
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <span>{gender.icon}</span>
                <span>{gender.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedGender === gender.id ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {gender.count}
                </span>
              </button>
            ))}
          </div>

          {/* Interest Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-gray-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-sm font-medium">Filter by interests</p>
                  {selectedInterests.length > 0 && (
                    <button
                      onClick={() => setSelectedInterests([])}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedInterests.includes(interest)
                          ? 'bg-red-500 text-white shadow-lg shadow-red-900/30'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Finding amazing people...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
            <p className="text-gray-400 max-w-md mb-6">
              Try adjusting your search or filters to find more people
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGender('all');
                setSelectedInterests([]);
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full font-medium hover:shadow-lg hover:shadow-red-900/30 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Men Section */}
            {(selectedGender === 'all' || selectedGender === 'male') && maleUsers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                      <span className="text-2xl">👨</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Men</h2>
                      <p className="text-gray-500 text-sm">{maleUsers.length} profiles</p>
                    </div>
                  </div>
                  {selectedGender === 'all' && (
                    <button className="flex items-center gap-1 text-red-400 text-sm hover:text-red-300 transition-colors">
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {maleUsers.slice(0, 10).map((user, index) => (
                    <UserCard key={user.userId || user._id} user={user} index={index} />
                  ))}
                </div>
              </section>
            )}

            {/* Women Section */}
            {(selectedGender === 'all' || selectedGender === 'female') && femaleUsers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl flex items-center justify-center shadow-lg shadow-pink-900/30">
                      <span className="text-2xl">👩</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Women</h2>
                      <p className="text-gray-500 text-sm">{femaleUsers.length} profiles</p>
                    </div>
                  </div>
                  {selectedGender === 'all' && (
                    <button className="flex items-center gap-1 text-red-400 text-sm hover:text-red-300 transition-colors">
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {femaleUsers.slice(0, 10).map((user, index) => (
                    <UserCard key={user.userId || user._id} user={user} index={index} />
                  ))}
                </div>
              </section>
            )}

            {/* Other Section */}
            {(selectedGender === 'all' || selectedGender === 'other') && otherUsers.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30">
                    <span className="text-2xl">🏳️‍🌈</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Non-binary</h2>
                    <p className="text-gray-500 text-sm">{otherUsers.length} profiles</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {otherUsers.map((user, index) => (
                    <UserCard key={user.userId || user._id} user={user} index={index} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
