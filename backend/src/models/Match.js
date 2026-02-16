const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'unmatched', 'blocked'],
    default: 'active'
  },
  unmatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unmatchedAt: Date,
  lastMessageAt: Date,
  messageCount: {
    type: Number,
    default: 0
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100
  }
});

matchSchema.index({ user1Id: 1, status: 1 });
matchSchema.index({ user2Id: 1, status: 1 });
matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
