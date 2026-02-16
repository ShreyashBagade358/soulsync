const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Preferences
  ageRange: {
    min: { type: Number, default: 18, min: 18, max: 100 },
    max: { type: Number, default: 50, min: 18, max: 100 }
  },
  distance: {
    type: Number,
    default: 50,
    min: 1,
    max: 500
  },
  genderPreference: [{
    type: String,
    enum: ['male', 'female', 'non-binary', 'other', 'all']
  }],
  
  // Relationship Preferences
  lookingFor: {
    type: String,
    enum: ['relationship', 'casual', 'friendship', 'marriage', 'not-sure'],
    default: 'not-sure'
  },
  relationshipPriority: {
    type: String,
    enum: ['physical', 'emotional', 'intellectual', 'adventure', 'stability'],
    default: 'emotional'
  },
  
  // Interest Matching
  sharedInterests: [{
    category: String,
    importance: { type: Number, min: 1, max: 10 }
  }],
  mustHaveInterests: [String],
  niceToHaveInterests: [String],
  
  // Entertainment Preferences
  preferredMovieGenres: [String],
  preferredMusicGenres: [String],
  preferredActivities: [String],
  
  // Lifestyle Compatibility
  lifestyleCompatibility: {
    smoking: { type: String, enum: ['dealbreaker', 'prefer-no', 'dont-care', 'prefer-yes'] },
    drinking: { type: String, enum: ['dealbreaker', 'prefer-no', 'social-ok', 'prefer-yes'] },
    exercise: { type: String, enum: ['daily', 'weekly', 'occasionally', 'never', 'dont-care'] },
    diet: { type: String, enum: ['vegan', 'vegetarian', 'halal', 'kosher', 'anything', 'dont-care'] }
  },
  
  // Date Preferences
  preferredDateTypes: [{
    type: String,
    enum: ['coffee', 'dinner', 'movie', 'outdoor', 'adventure', 'cultural', 'nightlife', 'quiet']
  }],
  
  // Deal Breakers
  dealBreakers: [String],
  
  // Priority Weights
  priorities: {
    interests: { type: Number, default: 7, min: 1, max: 10 },
    distance: { type: Number, default: 8, min: 1, max: 10 },
    age: { type: Number, default: 6, min: 1, max: 10 },
    lifestyle: { type: Number, default: 7, min: 1, max: 10 },
    values: { type: Number, default: 8, min: 1, max: 10 }
  },
  
  // Privacy
  showMeTo: {
    type: String,
    enum: ['everyone', 'liked', 'matches'],
    default: 'everyone'
  },
  hideAge: {
    type: Boolean,
    default: false
  },
  hideDistance: {
    type: Boolean,
    default: false
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

preferenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Preference', preferenceSchema);
