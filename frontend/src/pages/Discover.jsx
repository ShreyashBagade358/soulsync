import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore.jsx';
import { X, Heart, Star, MapPin, Film, Music, Calendar, Info, RefreshCw, Verified, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Discover = () => {
  const { profiles, currentProfileIndex, isLoading, fetchRecommendations, swipe } = useMatchStore();
  const [direction, setDirection] = useState(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleSwipe = async (action) => {
    if (currentProfileIndex >= profiles.length) return;

    const currentProfile = profiles[currentProfileIndex];
    setDirection(action === 'like' ? 'right' : action === 'dislike' ? 'left' : 'up');

    setTimeout(async () => {
      const result = await swipe(
        currentProfile.profile.userId,
        action,
        5
      );

      if (result.isMatch) {
        setMatchData(result.match);
        setShowMatch(true);
        toast.success("It's a Match! 💕");
      }

      setDirection(null);
      setShowDetails(false);
      setDragX(0);

      if (currentProfileIndex >= profiles.length - 3) {
        fetchRecommendations();
      }
    }, 300);
  };

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('like');
    } else if (info.offset.x < -threshold) {
      handleSwipe('dislike');
    } else {
      setDragX(0);
    }
  };

  const currentProfile = profiles[currentProfileIndex];

  if (isLoading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mb-4"
        />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400"
        >
          Finding your perfect matches...
        </motion.p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-32 h-32 bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-full flex items-center justify-center mb-6"
        >
          <Heart className="w-16 h-16 text-red-500" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-3"
        >
          No more profiles
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mb-6 max-w-md"
        >
          You've seen everyone! Check back later for new matches.
        </motion.p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchRecommendations} 
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full flex items-center gap-2 hover:shadow-red-glow transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </motion.button>
      </div>
    );
  }

  const { profile, score, breakdown } = currentProfile;
  const mainPhoto = profile.photos?.find(p => p.isMain) || profile.photos?.[0];
  const age = profile.dateOfBirth ? Math.floor((new Date() - new Date(profile.dateOfBirth)) / 31557600000) : null;

  const getDragStyles = () => {
    if (dragX > 50) return { opacity: Math.min(dragX / 100, 1), scale: 1 };
    if (dragX < -50) return { opacity: Math.min(Math.abs(dragX) / 100, 1), scale: 1 };
    return { opacity: 0, scale: 0.8 };
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-b from-gray-900 to-dark-900 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl border border-red-500/30"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2"
              >
                It's a Match!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 mb-6"
              >
                You and {profile.firstName} liked each other
              </motion.p>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50">
                  <span className="text-xl text-white font-bold">You</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Heart className="w-10 h-10 text-red-500" fill="currentColor" />
                </motion.div>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-500 shadow-lg shadow-red-900/50">
                  {mainPhoto ? (
                    <img src={mainPhoto.url} alt={profile.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <span className="text-3xl text-white">{profile.firstName?.[0]}</span>
                    </div>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <span className="text-gray-400">Compatibility: </span>
                <span className="font-bold text-red-400 text-lg">{matchData?.compatibilityScore || score}%</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <button
                  onClick={() => setShowMatch(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:shadow-red-glow transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Send a Message
                </button>
                <button
                  onClick={() => setShowMatch(false)}
                  className="w-full py-3.5 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                >
                  Keep Swiping
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfileIndex}
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: 0,
              x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
              rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : dragX * 0.05
            }}
            exit={{ scale: 0.9, opacity: 0, y: -50 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDrag={(event, info) => setDragX(info.offset.x)}
            onDragEnd={handleDragEnd}
            className="relative overflow-hidden rounded-3xl shadow-2xl bg-gray-900 border border-gray-800 cursor-grab active:cursor-grabbing"
          >
            {/* Swipe Indicators */}
            <motion.div
              style={{ ...getDragStyles(), left: 20 }}
              className="absolute top-20 z-20 border-4 border-green-500 text-green-500 px-6 py-2 rounded-xl font-bold text-2xl uppercase tracking-wider transform -rotate-12"
            >
              LIKE
            </motion.div>
            <motion.div
              style={{ ...getDragStyles(), right: 20 }}
              className="absolute top-20 z-20 border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl font-bold text-2xl uppercase tracking-wider transform rotate-12"
            >
              NOPE
            </motion.div>

            {/* Photo Carousel */}
            <div className="relative h-[520px]">
              {mainPhoto ? (
                <img
                  src={mainPhoto.url}
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <span className="text-8xl">👤</span>
                </div>
              )}
              
              {/* Photo Indicators */}
              {profile.photos?.length > 1 && (
                <div className="absolute top-4 left-4 right-4 flex gap-1.5">
                  {profile.photos.map((_, idx) => (
                    <motion.div
                      key={idx}
                      initial={false}
                      animate={{ 
                        backgroundColor: idx === 0 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                        flex: idx === 0 ? 2 : 1
                      }}
                      className="h-1.5 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Match Score Badge */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold">{score}% Match</span>
                </div>
              </motion.div>

              {/* Basic Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-4xl font-bold">
                        {profile.firstName}{age ? `, ${age}` : ''}
                      </h2>
                      {profile.isVerified && (
                        <Verified className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    {profile.occupation && (
                      <p className="text-white/80 text-sm mb-1">{profile.occupation}</p>
                    )}
                    {profile.location?.city && (
                      <div className="flex items-center text-white/70">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{profile.location.city}</span>
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Info className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-gray-900/95 border-t border-gray-800 overflow-hidden"
                >
                  <div className="p-6 space-y-6 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                    {/* Bio */}
                    {profile.bio && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                          About
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{profile.bio}</p>
                      </motion.div>
                    )}

                    {/* Interests */}
                    {profile.interests?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                          Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.slice(0, 8).map((interest, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 + idx * 0.05 }}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-900/50 to-red-800/30 text-red-300 rounded-full text-sm font-medium border border-red-500/20"
                            >
                              {interest}
                            </motion.span>
                          ))}
                          {profile.interests.length > 8 && (
                            <span className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-full text-sm">
                              +{profile.interests.length - 8} more
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Movies */}
                    {profile.favoriteMovies?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Film className="w-4 h-4 text-red-500" />
                          Favorite Movies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.favoriteMovies.slice(0, 4).map((movie, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-purple-900/30 text-purple-300 rounded-full text-sm border border-purple-500/20"
                            >
                              {movie.title}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Shows */}
                    {profile.favoriteShows?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Film className="w-4 h-4 text-red-500" />
                          Favorite Shows
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.favoriteShows.slice(0, 4).map((show, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-500/20"
                            >
                              {show.title}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Match Score Breakdown */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-5 border border-gray-700/50"
                    >
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-red-500" />
                        Compatibility Breakdown
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-gray-400">Distance</span>
                            <span className="text-sm font-medium text-white">{Math.round(breakdown.distance * 100)}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${breakdown.distance * 100}%` }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-gray-400">Interests</span>
                            <span className="text-sm font-medium text-white">{Math.round(breakdown.interests * 100)}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${breakdown.interests * 100}%` }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-gray-400">Profile Quality</span>
                            <span className="text-sm font-medium text-white">{Math.round(breakdown.profileQuality * 100)}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${breakdown.profileQuality * 100}%` }}
                              transition={{ duration: 0.5, delay: 0.6 }}
                              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-6">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#374151' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('dislike')}
            className="w-16 h-16 rounded-full bg-gray-800 shadow-xl flex items-center justify-center transition-all border-2 border-gray-700 hover:border-red-500/50"
          >
            <X className="w-8 h-8 text-red-500" strokeWidth={2.5} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#1e3a5f' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('superlike')}
            className="w-14 h-14 rounded-full bg-gray-800 shadow-lg flex items-center justify-center transition-all border-2 border-blue-500/30 hover:border-blue-400"
          >
            <Star className="w-6 h-6 text-blue-400" fill="currentColor" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('like')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-800 shadow-xl flex items-center justify-center hover:shadow-red-glow transition-all"
          >
            <Heart className="w-8 h-8 text-white" fill="white" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Profile Counter */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4 text-gray-500 text-sm"
        >
          Profile {currentProfileIndex + 1} of {profiles.length}
        </motion.p>
      </div>
    </div>
  );
};

export default Discover;
