const express = require('express');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const Profile = require('../models/Profile');
const EmbeddingService = require('../services/EmbeddingService');
const MatchingAlgorithm = require('../services/MatchingAlgorithm');
const { authenticate } = require('./auth');
const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { swipedId, action, timeSpentOnProfile } = req.body;
    const swiperId = req.userId;

    if (swiperId === swipedId) {
      return res.status(400).json({ error: 'Cannot swipe on yourself' });
    }

    const existingSwipe = await Swipe.findOne({ swiperId, swipedId });
    if (existingSwipe) {
      return res.status(400).json({ error: 'Already swiped on this profile' });
    }

    const swipe = new Swipe({
      swiperId,
      swipedId,
      action,
      timeSpentOnProfile: timeSpentOnProfile || 0
    });

    await swipe.save();

    const embeddingService = new EmbeddingService(req.redisClient);
    await embeddingService.updateUserEmbedding(swiperId);

    let match = null;
    let isMatch = false;

    if (action === 'like' || action === 'superlike') {
      const matcher = new MatchingAlgorithm(req.redisClient);
      match = await matcher.checkForMatch(swiperId, swipedId);
      isMatch = match !== null;

      if (isMatch) {
        const swipedProfile = await Profile.findOne({ userId: swipedId });
        
        req.io.to(`user:${swipedId}`).emit('new_match', {
          matchId: match._id,
          userId: swiperId,
          compatibilityScore: match.compatibilityScore
        });
      }
    }

    // Clear cache if Redis is available
    if (req.redisClient && req.redisClient.isReady) {
      await req.redisClient.del(`recommendations:${swiperId}`);
    }

    res.json({
      success: true,
      swipe: {
        id: swipe._id,
        action: swipe.action,
        timestamp: swipe.timestamp
      },
      isMatch,
      match: match ? {
        id: match._id,
        compatibilityScore: match.compatibilityScore,
        matchedAt: match.matchedAt
      } : null
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to process swipe' });
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { action, limit = 50, page = 1 } = req.query;

    const query = { swiperId: userId };
    if (action) query.action = action;

    const swipes = await Swipe.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('swipedId', 'firstName photos');

    const total = await Swipe.countDocuments(query);

    res.json({
      swipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch swipe history' });
  }
});

router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const stats = await Swipe.aggregate([
      { $match: { swiperId: new require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const matchCount = await Match.countDocuments({
      $or: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      status: 'active'
    });

    const formattedStats = {
      likes: 0,
      dislikes: 0,
      superlikes: 0,
      totalSwipes: 0,
      matches: matchCount,
      matchRate: 0
    };

    stats.forEach(stat => {
      if (stat._id === 'like') formattedStats.likes = stat.count;
      if (stat._id === 'dislike') formattedStats.dislikes = stat.count;
      if (stat._id === 'superlike') formattedStats.superlikes = stat.count;
      formattedStats.totalSwipes += stat.count;
    });

    if (formattedStats.totalSwipes > 0) {
      formattedStats.matchRate = (formattedStats.matches / formattedStats.likes * 100).toFixed(2);
    }

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch swipe stats' });
  }
});

module.exports = router;
