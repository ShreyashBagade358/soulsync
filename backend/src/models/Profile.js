const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'other'],
    required: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  photos: [{
    url: String,
    isMain: Boolean,
    order: Number
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    // Detailed Address Fields
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      formattedAddress: String
    },
    // Location metadata
    placeId: String, // Google Places ID or similar
    neighborhood: String,
    locality: String // Area within city
  },
  
  // Favorite Places in the City
  favoritePlaces: [{
    name: String,
    type: {
      type: String,
      enum: ['restaurant', 'cafe', 'park', 'bar', 'club', 'museum', 'theater', 'shopping', 'gym', 'other']
    },
    address: String,
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    whyFavorite: String, // Why they love this place
    goodForDates: {
      type: Boolean,
      default: false
    }
  }],
  
  // Location Preferences for Matching
  locationPreferences: {
    maxDistance: {
      type: Number,
      default: 5, // 5km default
      min: 1,
      max: 100
    },
    preferSameNeighborhood: {
      type: Boolean,
      default: true
    },
    willingToTravel: {
      type: Boolean,
      default: true
    }
  },
  
  // Enhanced Interests & Hobbies
  interests: [{
    type: String,
    maxlength: 50
  }],
  hobbies: [{
    category: String,
    items: [String]
  }],
  
  // Relationship & Dating Preferences
  relationshipType: {
    type: String,
    enum: ['casual', 'serious', 'marriage', 'friendship', 'not-sure'],
    default: 'not-sure'
  },
  datingStyle: {
    type: String,
    enum: ['go-with-flow', 'planner', 'spontaneous', 'traditional'],
    default: 'go-with-flow'
  },
  
  // Entertainment Preferences
  favoriteMovies: [{
    title: String,
    genre: String,
    year: Number
  }],
  favoriteShows: [{
    title: String,
    genre: String,
    platform: String
  }],
  musicTaste: {
    genres: [String],
    artists: [String]
  },
  
  // Date Ideas
  idealDateIdeas: [{
    type: String,
    description: String
  }],
  preferredDateTypes: [{
    type: String,
    enum: ['coffee', 'dinner', 'movie', 'outdoor', 'adventure', 'cultural', 'nightlife', 'quiet']
  }],
  
  // Lifestyle
  occupation: String,
  education: String,
  height: Number,
  languages: [String],
  religion: String,
  zodiacSign: {
    type: String,
    enum: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
  },
  
  // Personality & Values
  prompts: [{
    question: String,
    answer: String
  }],
  personalityTraits: {
    extroversion: { type: Number, min: 0, max: 100 },
    openness: { type: Number, min: 0, max: 100 },
    conscientiousness: { type: Number, min: 0, max: 100 },
    agreeableness: { type: Number, min: 0, max: 100 },
    neuroticism: { type: Number, min: 0, max: 100 }
  },
  values: [String],
  
  // Deal Breakers
  dealBreakers: [String],
  
  // Verification & Trust
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['email', 'phone', 'photo', 'social']
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  
  // Premium Features
  isBoosted: {
    type: Boolean,
    default: false
  },
  boostExpiry: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.index({ location: '2dsphere' });
profileSchema.index({ interests: 1 });
profileSchema.index({ hobbies: 1 });
profileSchema.index({ relationshipType: 1 });
profileSchema.index({ userId: 1 });

profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
