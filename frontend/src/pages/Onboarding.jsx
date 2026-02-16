import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, Film, Music, Utensils, Compass, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore.jsx';

const interestCategories = [
  {
    id: 'sports',
    label: 'Sports & Fitness',
    icon: '💪',
    options: ['Running', 'Yoga', 'Gym', 'Swimming', 'Cycling', 'Hiking', 'Football', 'Cricket', 'Tennis', 'Basketball']
  },
  {
    id: 'arts',
    label: 'Arts & Culture',
    icon: '🎨',
    options: ['Painting', 'Photography', 'Dancing', 'Singing', 'Acting', 'Writing', 'Reading', 'Museums', 'Theater']
  },
  {
    id: 'music',
    label: 'Music',
    icon: '🎵',
    options: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'EDM', 'Bollywood', 'Indie', 'R&B', 'Country']
  },
  {
    id: 'food',
    label: 'Food & Dining',
    icon: '🍽️',
    options: ['Cooking', 'Baking', 'Wine Tasting', 'Street Food', 'Fine Dining', 'Vegetarian', 'Coffee', 'BBQ']
  },
  {
    id: 'travel',
    label: 'Travel & Adventure',
    icon: '✈️',
    options: ['Beaches', 'Mountains', 'Road Trips', 'Camping', 'Backpacking', 'Luxury Travel', 'Trekking', 'Photography']
  },
  {
    id: 'tech',
    label: 'Technology',
    icon: '💻',
    options: ['Gaming', 'Coding', 'AI/ML', 'Gadgets', 'Social Media', 'Startups', 'Crypto', 'Web3']
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: '🎬',
    options: ['Movies', 'TV Shows', 'Netflix', 'Stand-up Comedy', 'Podcasts', 'Anime', 'K-Drama', 'Documentaries']
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    icon: '🌟',
    options: ['Meditation', 'Mindfulness', 'Vegan', 'Sustainability', 'Fashion', 'DIY', 'Gardening', 'Pets']
  }
];

const movieSuggestions = [
  { title: 'The Notebook', genre: 'Romance', emoji: '💕' },
  { title: 'Inception', genre: 'Sci-Fi', emoji: '🧠' },
  { title: 'The Dark Knight', genre: 'Action', emoji: '🦇' },
  { title: 'La La Land', genre: 'Musical', emoji: '🎭' },
  { title: 'Before Sunrise', genre: 'Romance', emoji: '🌅' },
  { title: '3 Idiots', genre: 'Comedy/Drama', emoji: '🎓' },
  { title: 'Dilwale Dulhania Le Jayenge', genre: 'Romance', emoji: '💑' },
  { title: 'Zindagi Na Milegi Dobara', genre: 'Adventure', emoji: '🏖️' },
  { title: 'Yeh Jawaani Hai Deewani', genre: 'Romance/Drama', emoji: '🏔️' },
  { title: 'Interstellar', genre: 'Sci-Fi', emoji: '🚀' }
];

const showSuggestions = [
  { title: 'Friends', platform: 'Netflix', emoji: '☕' },
  { title: 'Breaking Bad', platform: 'Netflix', emoji: '⚗️' },
  { title: 'Stranger Things', platform: 'Netflix', emoji: '👽' },
  { title: 'The Office', platform: 'Prime', emoji: '📄' },
  { title: 'Game of Thrones', platform: 'HBO', emoji: '🐉' },
  { title: 'Dark', platform: 'Netflix', emoji: '⏰' },
  { title: 'Money Heist', platform: 'Netflix', emoji: '💰' },
  { title: 'Sacred Games', platform: 'Netflix', emoji: '🔫' },
  { title: 'Mirzapur', platform: 'Prime', emoji: '👑' },
  { title: 'The Family Man', platform: 'Prime', emoji: '🕵️' }
];

const dateIdeas = [
  { type: 'Coffee Date', description: 'Casual coffee and conversation', icon: '☕' },
  { type: 'Movie Night', description: 'Watch a movie together', icon: '🎬' },
  { type: 'Dinner Date', description: 'Fine dining experience', icon: '🍽️' },
  { type: 'Adventure', description: 'Hiking, trekking, or outdoor activities', icon: '🏔️' },
  { type: 'Beach Day', description: 'Relaxing day at the beach', icon: '🏖️' },
  { type: 'Cultural', description: 'Museums, galleries, or historical sites', icon: '🏛️' },
  { type: 'Night Out', description: 'Bars, clubs, or live music', icon: '🌃' },
  { type: 'Game Night', description: 'Board games or video games', icon: '🎮' },
  { type: 'Cooking Together', description: 'Make a meal together', icon: '👨‍🍳' },
  { type: 'Road Trip', description: 'Short getaway or drive', icon: '🚗' }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    dateOfBirth: '',
    gender: '',
    
    // Location
    address: '',
    zipCode: '',
    city: '',
    coordinates: null,
    
    // Photos
    photos: [],
    
    // Interests
    selectedInterests: [],
    hobbies: {},
    
    // Movies & Shows
    favoriteMovies: [],
    favoriteShows: [],
    musicGenres: [],
    
    // Date Ideas
    idealDateIdeas: [],
    preferredDateTypes: [],
    
    // Favorite Places
    favoritePlaces: [],
    
    // Relationship
    relationshipType: '',
    bio: ''
  });

  const totalSteps = 8;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 6) {
      toast.error('Maximum 6 photos allowed');
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, { url: event.target.result, isMain: prev.photos.length === 0 }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const exists = prev.selectedInterests.find(i => i === interest);
      if (exists) {
        return { ...prev, selectedInterests: prev.selectedInterests.filter(i => i !== interest) };
      }
      if (prev.selectedInterests.length >= 10) {
        toast.error('Maximum 10 interests allowed');
        return prev;
      }
      return { ...prev, selectedInterests: [...prev.selectedInterests, interest] };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      // Geocode the address to get coordinates
      let coordinates = null;
      if (formData.address && formData.city) {
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.zipCode}`;
        try {
          const geoResponse = await axios.post('/profile/geocode', { address: fullAddress });
          coordinates = geoResponse.data.coordinates;
        } catch (geoError) {
          console.error('Geocoding error:', geoError);
        }
      }

      await axios.put('/profile', {
        userId,
        firstName: formData.firstName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        photos: formData.photos,
        interests: formData.selectedInterests,
        favoriteMovies: formData.favoriteMovies,
        favoriteShows: formData.favoriteShows,
        musicTaste: { genres: formData.musicGenres },
        idealDateIdeas: formData.idealDateIdeas,
        preferredDateTypes: formData.preferredDateTypes,
        relationshipType: formData.relationshipType,
        bio: formData.bio,
        location: {
          coordinates: coordinates || [0, 0],
          address: {
            street: formData.address,
            city: formData.city,
            zipCode: formData.zipCode
          }
        },
        favoritePlaces: formData.favoritePlaces
      });

      toast.success('Profile created successfully!');
      navigate('/discover');
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Add your photos</h2>
            <p className="text-gray-300">Profiles with photos get 10x more matches!</p>
            
            <div className="grid grid-cols-3 gap-4">
              {formData.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={photo.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  {photo.isMain && (
                    <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                      Main
                    </span>
                  )}
                </div>
              ))}
              
              {formData.photos.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-500/10 transition-all">
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <p className="text-sm text-gray-400 text-center">
              {formData.photos.length}/6 photos added
            </p>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What are you into?</h2>
            <p className="text-gray-300">Select at least 5 interests (max 10)</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interestCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-1">
                    <span>{category.icon}</span>
                    {category.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.options.slice(0, 5).map((option) => (
                      <button
                        key={option}
                        onClick={() => handleInterestToggle(option)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          formData.selectedInterests.includes(option)
                            ? 'bg-red-600 text-white border-2 border-red-400'
                            : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <span className="text-sm text-red-400 font-medium">
                {formData.selectedInterests.length}/10 selected
              </span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What do you watch?</h2>
            <p className="text-gray-300">Select your favorite movies</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {movieSuggestions.map((movie) => {
                const isSelected = formData.favoriteMovies.find(m => m.title === movie.title);
                return (
                  <button
                    key={movie.title}
                    onClick={() => {
                      if (isSelected) {
                        setFormData(prev => ({
                          ...prev,
                          favoriteMovies: prev.favoriteMovies.filter(m => m.title !== movie.title)
                        }));
                      } else if (formData.favoriteMovies.length < 5) {
                        setFormData(prev => ({
                          ...prev,
                          favoriteMovies: [...prev.favoriteMovies, movie]
                        }));
                      }
                    }}
                    className={`group relative rounded-xl overflow-hidden transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'ring-4 ring-red-500 shadow-red-glow'
                        : 'hover:ring-2 hover:ring-gray-500'
                    }`}
                  >
                    {/* Movie Poster Banner */}
                    <div className="aspect-[2/3] relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        movie.genre === 'Romance' ? 'from-pink-900 via-red-900 to-purple-900' :
                        movie.genre === 'Action' ? 'from-gray-900 via-blue-900 to-black' :
                        movie.genre === 'Sci-Fi' ? 'from-indigo-900 via-purple-900 to-black' :
                        movie.genre === 'Musical' ? 'from-yellow-900 via-orange-900 to-red-900' :
                        movie.genre === 'Comedy/Drama' ? 'from-green-900 via-teal-900 to-blue-900' :
                        movie.genre === 'Adventure' ? 'from-emerald-900 via-green-900 to-teal-900' :
                        'from-red-900 via-rose-900 to-pink-900'
                      }`} />
                      
                      {/* Movie Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <span className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                          {movie.emoji}
                        </span>
                        <h4 className="font-bold text-white text-center text-sm leading-tight">
                          {movie.title}
                        </h4>
                        <span className="mt-2 px-2 py-1 bg-white/20 rounded-full text-xs text-white/80">
                          {movie.genre}
                        </span>
                      </div>
                      
                      {/* Selection Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {formData.favoriteMovies.length}/5 movies selected
              </span>
              {formData.favoriteMovies.length > 0 && (
                <span className="text-red-400">
                  {formData.favoriteMovies.map(m => m.title).join(', ')}
                </span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Binge-watching favorites</h2>
            <p className="text-gray-300">Pick your favorite shows</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {showSuggestions.map((show) => {
                const isSelected = formData.favoriteShows.find(s => s.title === show.title);
                return (
                  <button
                    key={show.title}
                    onClick={() => {
                      if (isSelected) {
                        setFormData(prev => ({
                          ...prev,
                          favoriteShows: prev.favoriteShows.filter(s => s.title !== show.title)
                        }));
                      } else if (formData.favoriteShows.length < 5) {
                        setFormData(prev => ({
                          ...prev,
                          favoriteShows: [...prev.favoriteShows, show]
                        }));
                      }
                    }}
                    className={`group relative rounded-xl overflow-hidden transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'ring-4 ring-red-500 shadow-red-glow'
                        : 'hover:ring-2 hover:ring-gray-500'
                    }`}
                  >
                    {/* Show Poster Banner */}
                    <div className="aspect-[2/3] relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        show.platform === 'Netflix' ? 'from-red-900 via-black to-red-950' :
                        show.platform === 'Prime' ? 'from-blue-900 via-sky-900 to-blue-950' :
                        show.platform === 'HBO' ? 'from-purple-900 via-violet-900 to-purple-950' :
                        'from-gray-800 via-gray-900 to-black'
                      }`} />
                      
                      {/* Platform Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          show.platform === 'Netflix' ? 'bg-red-600 text-white' :
                          show.platform === 'Prime' ? 'bg-blue-500 text-white' :
                          show.platform === 'HBO' ? 'bg-purple-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {show.platform}
                        </span>
                      </div>
                      
                      {/* Show Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <span className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                          {show.emoji}
                        </span>
                        <h4 className="font-bold text-white text-center text-sm leading-tight">
                          {show.title}
                        </h4>
                      </div>
                      
                      {/* Selection Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {formData.favoriteShows.length}/5 shows selected
              </span>
              {formData.favoriteShows.length > 0 && (
                <span className="text-red-400">
                  {formData.favoriteShows.map(s => s.title).join(', ')}
                </span>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Perfect date ideas</h2>
            <p className="text-gray-300">What kind of dates do you enjoy?</p>

            <div className="grid grid-cols-2 gap-3">
              {dateIdeas.map((date) => (
                <button
                  key={date.type}
                  onClick={() => {
                    const exists = formData.preferredDateTypes.find(d => d === date.type);
                    if (exists) {
                      setFormData(prev => ({
                        ...prev,
                        preferredDateTypes: prev.preferredDateTypes.filter(d => d !== date.type),
                        idealDateIdeas: prev.idealDateIdeas.filter(d => d.type !== date.type)
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        preferredDateTypes: [...prev.preferredDateTypes, date.type],
                        idealDateIdeas: [...prev.idealDateIdeas, { type: date.type, description: date.description }]
                      }));
                    }
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.preferredDateTypes.includes(date.type)
                      ? 'border-red-500 bg-red-600/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-red-400'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{date.icon}</span>
                  <h4 className="font-medium text-white">{date.type}</h4>
                  <p className="text-xs text-gray-400">{date.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What are you looking for?</h2>
            <p className="text-gray-300">Help us find your perfect match</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Relationship Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'casual', label: 'Casual Dating', emoji: '😊' },
                    { value: 'serious', label: 'Serious Relationship', emoji: '💕' },
                    { value: 'marriage', label: 'Marriage', emoji: '💍' },
                    { value: 'friendship', label: 'Friendship', emoji: '🤝' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, relationshipType: option.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.relationshipType === option.value
                          ? 'border-red-500 bg-red-600/20'
                          : 'border-gray-600 bg-gray-800/50 hover:border-red-400'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{option.emoji}</span>
                      <span className="font-medium text-white">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">About You</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input-field h-32 resize-none bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  placeholder="Tell potential matches about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500 characters</p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Where are you located?</h2>
            <p className="text-gray-300">We'll use this to find matches near you (within 5km)</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  placeholder="e.g., 123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="input-field bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    placeholder="e.g., 123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-field bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    placeholder="e.g., Mumbai"
                  />
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Local Matching</p>
                    <p className="text-gray-400 text-sm">We'll prioritize matches within 5km of your location</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Favorite Places</h2>
            <p className="text-gray-300">Share your favorite spots in the city. Matches who love the same places will appear first!</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
                  { type: 'cafe', label: 'Cafes', emoji: '☕' },
                  { type: 'park', label: 'Parks', emoji: '🌳' },
                  { type: 'bar', label: 'Bars', emoji: '🍸' },
                  { type: 'club', label: 'Clubs', emoji: '🎵' },
                  { type: 'museum', label: 'Museums', emoji: '🎨' },
                  { type: 'theater', label: 'Theaters', emoji: '🎭' },
                  { type: 'shopping', label: 'Shopping', emoji: '🛍️' }
                ].map((place) => (
                  <button
                    key={place.type}
                    onClick={() => {
                      const exists = formData.favoritePlaces.find(p => p.type === place.type);
                      if (exists) {
                        setFormData(prev => ({
                          ...prev,
                          favoritePlaces: prev.favoritePlaces.filter(p => p.type !== place.type)
                        }));
                      } else {
                        const placeName = prompt(`What's your favorite ${place.label.toLowerCase()}?`);
                        if (placeName) {
                          setFormData(prev => ({
                            ...prev,
                            favoritePlaces: [...prev.favoritePlaces, { 
                              type: place.type, 
                              name: placeName,
                              whyFavorite: '' 
                            }]
                          }));
                        }
                      }
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.favoritePlaces.find(p => p.type === place.type)
                        ? 'border-red-500 bg-red-600/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-red-400'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{place.emoji}</span>
                    <span className="font-medium text-white">{place.label}</span>
                    {formData.favoritePlaces.find(p => p.type === place.type) && (
                      <p className="text-xs text-red-400 mt-1">
                        {formData.favoritePlaces.find(p => p.type === place.type).name}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">
                  <span className="text-red-400 font-medium">Pro Tip:</span> Matches who share favorite places in your area will be prioritized! This helps you find people who enjoy the same hangout spots.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-red-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Step {step + 1} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-600 to-red-800 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="card-dark p-8 min-h-[400px] bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`btn-secondary flex items-center gap-2 ${step === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : step === totalSteps - 1 ? (
              <>
                Complete
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
