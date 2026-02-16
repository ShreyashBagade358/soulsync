const mongoose = require('mongoose');

const userEmbeddingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  dimensions: {
    type: Number,
    default: 128
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  swipeHistory: [{
    profileId: mongoose.Schema.Types.ObjectId,
    action: String,
    timestamp: Date
  }],
  tasteProfile: {
    preferredInterests: [String],
    preferredAgeRange: {
      min: Number,
      max: Number
    },
    preferredDistance: Number,
    swipePatterns: {
      likeRate: Number,
      superlikeRate: Number,
      avgTimeOnProfile: Number
    }
  }
});

userEmbeddingSchema.index({ userId: 1 });

module.exports = mongoose.model('UserEmbedding', userEmbeddingSchema);
