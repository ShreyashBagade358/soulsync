const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
  swiperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  swipedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['like', 'dislike', 'superlike'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeSpentOnProfile: {
    type: Number,
    default: 0
  }
});

swipeSchema.index({ swiperId: 1, timestamp: -1 });
swipeSchema.index({ swipedId: 1, action: 1 });
swipeSchema.index({ swiperId: 1, swipedId: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);
