const express = require('express');
const Preference = require('../models/Preference');
const { authenticate } = require('./auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    
    const preferences = await Preference.findOne({ userId });
    
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const allowedUpdates = [
      'ageRange', 'distance', 'genderPreference', 'lookingFor',
      'dealBreakers', 'interestsPriority', 'distancePriority', 
      'agePriority', 'educationPreference', 'showMeTo'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const preferences = await Preference.findOneAndUpdate(
      { userId },
      filteredUpdates,
      { new: true, upsert: true }
    );

    // Clear cache if Redis is available
    if (req.redisClient && req.redisClient.isReady) {
      await req.redisClient.del(`recommendations:${userId}`);
    }

    res.json(preferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
