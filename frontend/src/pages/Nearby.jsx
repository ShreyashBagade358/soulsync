import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Heart, Users, Star, Navigation, Sparkles, ChevronRight, Map } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMatchStore } from '../stores/matchStore.jsx';

const Nearby = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const { swipe } = useMatchStore();

  useEffect(() => {
    fetchNearbyUsers();
  }, [selectedRadius]);

  const fetchNearbyUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/profile/nearby/${selectedRadius}`);
      setNearbyUsers(response.data.users);
      setUserLocation(response.data.userLocation);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      toast.error('Failed to load nearby users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      await swipe(userId, 'like', 5);
      toast.success('Liked! 💕');
      // Remove from list or mark as liked
      setNearbyUsers(prev => prev.filter(u => u.userId !== userId));
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

  const radiusOptions = [1, 3, 5, 10, 20];

  // Group users by shared interests or places
  const groupUsers = () => {
    const groups = {
      sameNeighborhood: [],
      sharedPlaces: [],
      nearby: []
    };

    nearbyUsers.forEach(user => {
      if (user.locationMatchScore >= 80) {
        groups.sameNeighborhood.push(user);
      } else if (user.breakdown?.locationBreakdown?.sharedPlaces > 0) {
        groups.sharedPlaces.push(user);
      } else {
        groups.nearby.push(user);
      }
    });

    return groups;
  };

  const userGroups = groupUsers();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Finding people near you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-dark-900 to-dark-900/95 backdrop-blur-xl border-b border-gray-800/50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Navigation className="w-6 h-6 text-red-500" />
                Nearby
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {nearbyUsers.length} people within {selectedRadius}km
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Radius Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                onClick={() => setSelectedRadius(radius)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedRadius === radius
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {radius} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {nearbyUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No one nearby</h2>
            <p className="text-gray-400 max-w-xs mb-6">
              Try increasing the search radius or check back later when more people join in your area
            </p>
            <div className="flex gap-3">
              {selectedRadius < 20 && (
                <button
                  onClick={() => setSelectedRadius(selectedRadius + 5)}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full font-medium hover:shadow-red-glow transition-all"
                >
                  Expand Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Same Neighborhood */}
            {userGroups.sameNeighborhood.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Same Neighborhood</h2>
                    <p className="text-gray-500 text-sm">{userGroups.sameNeighborhood.length} people nearby</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userGroups.sameNeighborhood.map((user, index) => (
                    <NearbyUserCard 
                      key={user.userId} 
                      user={user} 
                      index={index}
                      onLike={handleLike}
                      highlight={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Shared Favorite Places */}
            {userGroups.sharedPlaces.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Shared Places</h2>
                    <p className="text-gray-500 text-sm">You both love these spots</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userGroups.sharedPlaces.map((user, index) => (
                    <NearbyUserCard 
                      key={user.userId} 
                      user={user} 
                      index={index}
                      onLike={handleLike}
                      showSharedPlaces={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Nearby */}
            {userGroups.nearby.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Nearby</h2>
                    <p className="text-gray-500 text-sm">Within {selectedRadius}km</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userGroups.nearby.map((user, index) => (
                    <NearbyUserCard 
                      key={user.userId} 
                      user={user} 
                      index={index}
                      onLike={handleLike}
                    />
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

const NearbyUserCard = ({ user, index, onLike, highlight = false, showSharedPlaces = false }) => {
  const mainPhoto = user.photos?.find(p => p.isMain) || user.photos?.[0];
  const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
        highlight 
          ? 'border-green-500/50 shadow-lg shadow-green-900/20' 
          : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto.url}
            alt={user.firstName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Distance Badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          {user.distance}
        </div>

        {/* Shared Places Badge */}
        {showSharedPlaces && user.sharedPlaces?.length > 0 && (
          <div className="absolute top-3 left-3 bg-purple-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3" />
            {user.sharedPlaces.length} shared
          </div>
        )}

        {/* Like Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => onLike(user.userId)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Heart className="w-7 h-7 text-white" fill="white" />
        </motion.button>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{user.firstName}</h3>
            {age && <span className="text-lg text-gray-400">{age}</span>}
          </div>
          
          {user.location?.address?.neighborhood && (
            <div className="flex items-center text-gray-400 text-sm mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              {user.location.address.neighborhood}
            </div>
          )}

          {/* Shared Places */}
          {showSharedPlaces && user.sharedPlaces?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.sharedPlaces.slice(0, 2).map((place, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full text-xs">
                  {place}
                </span>
              ))}
            </div>
          )}

          {/* Match Score */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center text-red-400 text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {user.locationMatchScore}% match
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Nearby;
