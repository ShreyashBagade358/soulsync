import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.jsx';
import { 
  Camera, MapPin, Briefcase, GraduationCap, Ruler, Plus, X, User, 
  Heart, Film, Music, Calendar, Sparkles, Settings, ChevronRight,
  Edit3, Save, Crown, Shield, Bell, Lock, LogOut
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, prefsRes] = await Promise.all([
        axios.get('/auth/me'),
        axios.get('/preferences')
      ]);
      
      setProfile(profileRes.data.profile);
      setPreferences(prefsRes.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
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

  const calculateCompleteness = (profile) => {
    if (!profile) return 0;
    let score = 0;
    const fields = [
      'firstName', 'bio', 'photos', 'interests', 'occupation', 
      'education', 'location', 'favoriteMovies', 'favoriteShows', 'relationshipType'
    ];
    fields.forEach(field => {
      if (field === 'photos' && profile[field]?.length > 0) score += 10;
      else if (field === 'interests' && profile[field]?.length > 0) score += 10;
      else if (profile[field]) score += 10;
    });
    return Math.min(score, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-4">
        <User className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Profile not found</h2>
        <p className="text-gray-400">Please complete your onboarding first</p>
      </div>
    );
  }

  const completeness = calculateCompleteness(profile);
  const mainPhoto = profile.photos?.find(p => p.isMain) || profile.photos?.[0];
  const age = calculateAge(profile.dateOfBirth);

  const sections = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'entertainment', label: 'Entertainment', icon: Film },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-b from-red-950/50 to-dark-900 pb-8">
        {/* Cover/Background */}
        <div className="h-48 bg-gradient-to-br from-red-900/30 to-dark-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.2)_0%,transparent_70%)]" />
        </div>

        {/* Profile Info */}
        <div className="max-w-4xl mx-auto px-4 -mt-20 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden ring-4 ring-dark-900 shadow-2xl">
                {mainPhoto ? (
                  <img 
                    src={mainPhoto.url} 
                    alt={profile.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {profile.firstName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Name & Stats */}
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {profile.firstName}
                  {age && <span className="text-2xl text-gray-400 ml-2">{age}</span>}
                </h1>
                {profile.isVerified && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                    Verified
                  </span>
                )}
              </div>
              
              <p className="text-gray-400 mb-4 max-w-lg">
                {profile.bio || 'No bio added yet. Tell people about yourself!'}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location?.city || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{profile.occupation || 'No occupation'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{profile.education || 'No education'}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full font-medium hover:shadow-red-glow transition-all flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Profile Completeness</span>
            <span className="text-sm font-bold text-red-500">{completeness}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-red-800 h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <p className="text-xs text-gray-500 mt-2">
              Complete your profile to get more matches!
            </p>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* About Section */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-500" />
                  About Me
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {profile.bio || 'No bio added yet. Tell people what makes you unique!'}
                </p>
              </div>

              {/* Personal Details */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailCard 
                    icon={MapPin} 
                    label="Location" 
                    value={profile.location?.city || 'Not set'} 
                  />
                  <DetailCard 
                    icon={Briefcase} 
                    label="Occupation" 
                    value={profile.occupation || 'Not set'} 
                  />
                  <DetailCard 
                    icon={GraduationCap} 
                    label="Education" 
                    value={profile.education || 'Not set'} 
                  />
                  <DetailCard 
                    icon={Ruler} 
                    label="Height" 
                    value={profile.height ? `${profile.height} cm` : 'Not set'} 
                  />
                </div>
              </div>

              {/* Relationship Info */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Looking For
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.relationshipType ? (
                    <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full font-medium">
                      {profile.relationshipType === 'casual' && 'Casual Dating'}
                      {profile.relationshipType === 'serious' && 'Serious Relationship'}
                      {profile.relationshipType === 'marriage' && 'Marriage'}
                      {profile.relationshipType === 'friendship' && 'Friendship'}
                    </span>
                  ) : (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </div>
              </div>

              {/* Date Ideas */}
              {profile.preferredDateTypes?.length > 0 && (
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    Perfect Date Ideas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredDateTypes.map((date, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm"
                      >
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-red-500" />
                Photos
                <span className="text-sm text-gray-500 font-normal">
                  ({profile.photos?.length || 0}/6)
                </span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.photos?.map((photo, idx) => (
                  <div 
                    key={idx} 
                    className={`relative aspect-square rounded-2xl overflow-hidden group ${
                      photo.isMain ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    {photo.isMain && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Main
                      </div>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                
                {(!profile.photos || profile.photos.length < 6) && (
                  <button className="aspect-square bg-gray-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-red-500 transition-colors group">
                    <Plus className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors mb-2" />
                    <span className="text-sm text-gray-500 group-hover:text-gray-400">Add Photo</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Interests & Hobbies
              </h3>
              
              {profile.interests?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.interests.map((interest, idx) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-800/20 text-red-400 rounded-full font-medium border border-red-500/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No interests added yet</p>
              )}
            </motion.div>
          )}

          {activeSection === 'entertainment' && (
            <motion.div
              key="entertainment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Favorite Movies */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-red-500" />
                  Favorite Movies
                </h3>
                {profile.favoriteMovies?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {profile.favoriteMovies.map((movie, idx) => (
                      <div 
                        key={idx}
                        className="p-4 bg-gray-800 rounded-xl border border-gray-700"
                      >
                        <div className="text-2xl mb-2">{movie.emoji || '🎬'}</div>
                        <h4 className="font-medium text-white">{movie.title}</h4>
                        <p className="text-sm text-gray-500">{movie.genre}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No favorite movies added</p>
                )}
              </div>

              {/* Favorite Shows */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-red-500" />
                  Favorite TV Shows
                </h3>
                {profile.favoriteShows?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {profile.favoriteShows.map((show, idx) => (
                      <div 
                        key={idx}
                        className="p-4 bg-gray-800 rounded-xl border border-gray-700"
                      >
                        <div className="text-2xl mb-2">{show.emoji || '📺'}</div>
                        <h4 className="font-medium text-white">{show.title}</h4>
                        <p className="text-sm text-gray-500">{show.platform}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No favorite shows added</p>
                )}
              </div>

              {/* Music Taste */}
              {profile.musicTaste?.genres?.length > 0 && (
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5 text-red-500" />
                    Music Taste
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.musicTaste.genres.map((genre, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Matching Preferences */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  Matching Preferences
                </h3>
                
                {preferences ? (
                  <div className="space-y-6">
                    {/* Age Range */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Age Range</span>
                        <span className="text-white font-medium">
                          {preferences.ageRange?.min || 18} - {preferences.ageRange?.max || 50} years
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-800"
                          style={{ 
                            width: `${((preferences.ageRange?.max || 50) - (preferences.ageRange?.min || 18)) / 50 * 100}%`,
                            marginLeft: `${(preferences.ageRange?.min || 18) / 50 * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Distance */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Maximum Distance</span>
                        <span className="text-white font-medium">
                          {preferences.distance || 50} km
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-800"
                          style={{ width: `${(preferences.distance || 50) / 100 * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Gender Preference */}
                    <div>
                      <span className="text-gray-400 text-sm">Interested in</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(preferences.genderPreference || ['all']).map((gender, idx) => (
                          <span 
                            key={idx}
                            className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm capitalize"
                          >
                            {gender}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No preferences set</p>
                )}
              </div>

              {/* Account Settings */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
                <div className="space-y-3">
                  <SettingsRow 
                    icon={Bell} 
                    label="Notifications" 
                    value="Enabled"
                    onClick={() => {}}
                  />
                  <SettingsRow 
                    icon={Lock} 
                    label="Privacy" 
                    value="Public"
                    onClick={() => {}}
                  />
                  <SettingsRow 
                    icon={Crown} 
                    label="Subscription" 
                    value="Free"
                    badge="Upgrade"
                    onClick={() => {}}
                  />
                </div>
              </div>

              {/* Sign Out */}
              <button 
                onClick={logout}
                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors border border-red-500/30"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-800">
    <Icon className="w-5 h-5 text-red-500 mb-2" />
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-white font-medium text-sm">{value}</p>
  </div>
);

const SettingsRow = ({ icon: Icon, label, value, badge, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-400" />
      <span className="text-white font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && (
        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
          {badge}
        </span>
      )}
      <span className="text-gray-400 text-sm">{value}</span>
      <ChevronRight className="w-4 h-4 text-gray-500" />
    </div>
  </button>
);

export default Profile;
