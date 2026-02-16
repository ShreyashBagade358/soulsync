import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore.jsx';
import { X, Heart, Star, MapPin, Film, Music, Calendar, Info, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Discover = () => {
  const { profiles, currentProfileIndex, isLoading, fetchRecommendations, swipe } = useMatchStore();
  const [direction, setDirection] = useState(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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

      if (currentProfileIndex >= profiles.length - 3) {
        fetchRecommendations();
      }
    }, 300);
  };

  const currentProfile = profiles[currentProfileIndex];

  if (isLoading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Finding your perfect matches...</p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-32 h-32 bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">No more profiles</h2>
        <p className="text-gray-400 mb-6 max-w-md">You've seen everyone! Check back later for new matches.</p>
        <button 
          onClick={fetchRecommendations} 
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full flex items-center gap-2 hover:shadow-red-glow transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>
    );
  }

  const { profile, score, breakdown } = currentProfile;
  const mainPhoto = profile.photos?.find(p => p.isMain) || profile.photos?.[0];
  const age = profile.dateOfBirth ? Math.floor((new Date() - new Date(profile.dateOfBirth)) / 31557600000) : null;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {/* Match Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-3xl p-8 text-center max-w-md mx-4 shadow-2xl border border-gray-700"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-4">
              It's a Match!
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              You and {profile.firstName} liked each other
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">You</span>
              </div>
              <Heart className="w-8 h-8 text-red-500 animate-pulse" fill="currentColor" />
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500">
                {mainPhoto ? (
                  <img src={mainPhoto.url} alt={profile.firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl text-white">{profile.firstName?.[0]}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              Compatibility Score: <span className="font-bold text-red-500">{matchData?.compatibilityScore}%</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setShowMatch(false)}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:shadow-red-glow transition-all"
              >
                Send a Message
              </button>
              <button
                onClick={() => setShowMatch(false)}
                className="w-full py-3 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Profile Card */}
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfileIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
              rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : 0
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl shadow-2xl bg-gray-900 border border-gray-800"
          >
            {/* Photo Carousel */}
            <div className="relative h-[500px]">
              {mainPhoto ? (
                <img
                  src={mainPhoto.url}
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="text-6xl">👤</span>
                </div>
              )}
              
              {/* Photo Indicators */}
              {profile.photos?.length > 1 && (
                <div className="absolute top-4 left-4 right-4 flex gap-1">
                  {profile.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 rounded-full shadow-lg">
                <span className="font-bold">{score}% Match</span>
              </div>

              {/* Basic Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-bold mb-1">
                      {profile.firstName}{age ? `, ${age}` : ''}
                    </h2>
                    {profile.location?.city && (
                      <div className="flex items-center text-white/90">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{profile.location.city}</span>
                      </div>
                    )}
                    {profile.relationshipType && (
                      <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                        Looking for: {profile.relationshipType}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Info className="w-6 h-6" />
                  </button>
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
                  className="bg-gray-900/95 border-t border-gray-800 overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    {/* Bio */}
                    {profile.bio && (
                      <div>
                        <h3 className="font-semibold text-white mb-2">About</h3>
                        <p className="text-gray-400">{profile.bio}</p>
                      </div>
                    )}

                    {/* Interests */}
                    {profile.interests?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Movies */}
                    {profile.favoriteMovies?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Film className="w-4 h-4 text-red-500" />
                          Favorite Movies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.favoriteMovies.map((movie, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                            >
                              {movie.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shows */}
                    {profile.favoriteShows?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Film className="w-4 h-4 text-red-500" />
                          Favorite Shows
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.favoriteShows.map((show, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                            >
                              {show.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Music */}
                    {profile.musicTaste?.genres?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Music className="w-4 h-4 text-red-500" />
                          Music Taste
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.musicTaste.genres.map((genre, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date Ideas */}
                    {profile.preferredDateTypes?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-500" />
                          Date Ideas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredDateTypes.map((date, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm"
                            >
                              {date}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match Score Breakdown */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-3">Compatibility Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Distance</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${breakdown.distance * 100}%` }} />
                            </div>
                            <span className="text-sm font-medium w-10 text-white">{Math.round(breakdown.distance * 100)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Interests</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-red-600" style={{ width: `${breakdown.interests * 100}%` }} />
                            </div>
                            <span className="text-sm font-medium w-10 text-white">{Math.round(breakdown.interests * 100)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Profile</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-red-700" style={{ width: `${breakdown.profileQuality * 100}%` }} />
                            </div>
                            <span className="text-sm font-medium w-10 text-white">{Math.round(breakdown.profileQuality * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwipe('dislike')}
            className="w-16 h-16 rounded-full bg-gray-800 shadow-xl flex items-center justify-center hover:shadow-2xl hover:bg-gray-700 transition-all border-2 border-gray-700"
          >
            <X className="w-8 h-8 text-red-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwipe('superlike')}
            className="w-14 h-14 rounded-full bg-gray-800 shadow-lg flex items-center justify-center hover:shadow-xl hover:bg-gray-700 transition-all border-2 border-blue-500/50"
          >
            <Star className="w-6 h-6 text-blue-400" fill="currentColor" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwipe('like')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-800 shadow-xl flex items-center justify-center hover:shadow-red-glow transition-all"
          >
            <Heart className="w-8 h-8 text-white" fill="white" />
          </motion.button>
        </div>

        {/* Profile Counter */}
        <p className="text-center mt-6 text-gray-400">
          Profile {currentProfileIndex + 1} of {profiles.length}
        </p>
      </div>
    </div>
  );
};

export default Discover;
