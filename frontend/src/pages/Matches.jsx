import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMatchStore } from '../stores/matchStore.jsx';
import { MessageCircle, Heart, Trash2, Sparkles, MapPin, Briefcase, Star, Verified, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Matches = () => {
  const { matches, isLoading, fetchMatches, unmatch } = useMatchStore();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleUnmatch = async (matchId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to unmatch?')) {
      const success = await unmatch(matchId);
      if (success) {
        toast.success('Unmatched successfully');
        setSelectedMatch(null);
      }
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

  // Get shared interests between current user and match
  const getSharedInterests = (matchInterests) => {
    // This would come from current user's profile - simplified for now
    const commonInterests = ['coffee', 'hiking', 'movies', 'reading'];
    return matchInterests?.filter(interest => 
      commonInterests.some(common => 
        interest.toLowerCase().includes(common.toLowerCase()) || 
        common.toLowerCase().includes(interest.toLowerCase())
      )
    ) || [];
  };

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-white mb-1">Your Matches</h1>
          <p className="text-gray-400 text-sm">
            {matches.length > 0 ? `${matches.length} people liked you back` : 'Start swiping to find matches'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-900/30"
            >
              <Heart className="w-12 h-12 text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">No matches yet</h2>
            <p className="text-gray-400 mb-8 max-w-xs">
              Start swiping to find your perfect match! When you both like each other, they'll appear here.
            </p>
            <button 
              onClick={() => navigate('/discover')}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full font-semibold hover:shadow-red-glow transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Start Discovering
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMatch(match)}
                className="group cursor-pointer"
              >
                <div className="relative bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20">
                  {/* Profile Image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {match.user.photos?.[0]?.url ? (
                      <img
                        src={match.user.photos[0].url}
                        alt={match.user.firstName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                        <span className="text-6xl text-white font-bold">
                          {match.user.firstName?.[0]}
                        </span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Match Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-800 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                      <Heart className="w-4 h-4" fill="white" />
                      {match.compatibilityScore}% Match
                    </div>

                    {/* Verified Badge */}
                    {match.user.isVerified && (
                      <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm text-white p-2 rounded-full shadow-lg">
                        <Verified className="w-5 h-5" />
                      </div>
                    )}

                    {/* Unmatch Button */}
                    <button
                      onClick={(e) => handleUnmatch(match.matchId, e)}
                      className="absolute top-4 right-20 opacity-0 group-hover:opacity-100 transition-all bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {/* Name & Age */}
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-white">
                          {match.user.firstName} {match.user.lastName}
                        </h2>
                        {match.user.age && (
                          <span className="text-xl text-gray-400">{match.user.age}</span>
                        )}
                      </div>

                      {/* Bio */}
                      {match.user.bio && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                          {match.user.bio}
                        </p>
                      )}

                      {/* Occupation & Education */}
                      <div className="space-y-1.5 mb-3">
                        {match.user.occupation && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Briefcase className="w-4 h-4 text-red-400" />
                            <span>{match.user.occupation}</span>
                          </div>
                        )}
                        {match.user.education && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Sparkles className="w-4 h-4 text-red-400" />
                            <span>{match.user.education}</span>
                          </div>
                        )}
                        {match.user.location?.address?.city && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span>{match.user.location.address.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Shared Interests */}
                      {match.user.interests && match.user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {match.user.interests.slice(0, 3).map((interest, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full border border-white/20"
                            >
                              {interest}
                            </span>
                          ))}
                          {match.user.interests.length > 3 && (
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                              +{match.user.interests.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link
                          to={`/messages/${match.matchId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-900/30 transition-all"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Message
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              <div className="relative h-80">
                {selectedMatch.user.photos?.[0]?.url ? (
                  <img
                    src={selectedMatch.user.photos[0].url}
                    alt={selectedMatch.user.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                    <span className="text-6xl text-white font-bold">
                      {selectedMatch.user.firstName?.[0]}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Match Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <Heart className="w-4 h-4" fill="white" />
                  {selectedMatch.compatibilityScore}% Match
                </div>

                {/* Name & Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-white">
                      {selectedMatch.user.firstName} {selectedMatch.user.lastName}
                    </h2>
                    {selectedMatch.user.age && (
                      <span className="text-2xl text-gray-400">{selectedMatch.user.age}</span>
                    )}
                    {selectedMatch.user.isVerified && (
                      <Verified className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  
                  {selectedMatch.user.occupation && (
                    <p className="text-gray-300 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-red-400" />
                      {selectedMatch.user.occupation}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Bio */}
                {selectedMatch.user.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                    <p className="text-gray-400">{selectedMatch.user.bio}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedMatch.user.education && (
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-gray-500 text-sm mb-1">Education</p>
                      <p className="text-white font-medium">{selectedMatch.user.education}</p>
                    </div>
                  )}
                  {selectedMatch.user.location?.address?.city && (
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-gray-500 text-sm mb-1">Location</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400" />
                        {selectedMatch.user.location.address.city}
                      </p>
                    </div>
                  )}
                </div>

                {/* Interests */}
                {selectedMatch.user.interests && selectedMatch.user.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.user.interests.map((interest, idx) => (
                        <span 
                          key={idx}
                          className="px-4 py-2 bg-red-500/10 text-red-400 text-sm rounded-full border border-red-500/20"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorite Places */}
                {selectedMatch.user.favoritePlaces && selectedMatch.user.favoritePlaces.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Favorite Places</h3>
                    <div className="space-y-2">
                      {selectedMatch.user.favoritePlaces.slice(0, 3).map((place, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{place.name}</p>
                            <p className="text-gray-500 text-sm">{place.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompts */}
                {selectedMatch.user.prompts && selectedMatch.user.prompts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Prompts</h3>
                    <div className="space-y-3">
                      {selectedMatch.user.prompts.slice(0, 2).map((prompt, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-red-900/20 to-transparent rounded-xl p-4 border border-red-500/10">
                          <p className="text-red-400 text-sm mb-1">{prompt.question}</p>
                          <p className="text-white font-medium">{prompt.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <Link
                    to={`/messages/${selectedMatch.matchId}`}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-900/30 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send Message
                  </Link>
                  <button
                    onClick={(e) => handleUnmatch(selectedMatch.matchId, e)}
                    className="px-6 py-4 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full font-semibold transition-all border border-gray-700 hover:border-red-500/30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Matches;
