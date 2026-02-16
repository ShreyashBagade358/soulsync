const express = require('express');
const MatchingAlgorithm = require('../services/MatchingAlgorithm');
const { authenticate } = require('./auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;

    const matcher = new MatchingAlgorithm(req.redisClient);
    const recommendations = await matcher.getRecommendations(userId, limit);

    res.json({
      recommendations: recommendations.map(rec => ({
        profile: {
          userId: rec.profile.userId,
          firstName: rec.profile.firstName,
          age: calculateAge(rec.profile.dateOfBirth),
          bio: rec.profile.bio,
          photos: rec.profile.photos,
          location: rec.profile.location,
          interests: rec.profile.interests,
          occupation: rec.profile.occupation,
          education: rec.profile.education,
          prompts: rec.profile.prompts
        },
        score: rec.score,
        breakdown: rec.breakdown
      }))
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

router.get('/discover', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const matcher = new MatchingAlgorithm(req.redisClient);
    const recommendations = await matcher.getRecommendations(userId, parseInt(limit));

    const startIndex = (page - 1) * limit;
    const paginated = recommendations.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      profiles: paginated.map(rec => ({
        ...rec.profile.toObject(),
        age: calculateAge(rec.profile.dateOfBirth),
        matchScore: rec.score
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recommendations.length,
        hasMore: startIndex + parseInt(limit) < recommendations.length
      }
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to load profiles' });
  }
});

router.get('/compatibility/:userId', authenticate, async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    const matcher = new MatchingAlgorithm(req.redisClient);
    const compatibilityScore = await matcher.calculateCompatibility(
      currentUserId,
      targetUserId
    );

    res.json({
      compatibilityScore,
      interpretation: getCompatibilityInterpretation(compatibilityScore)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getCompatibilityInterpretation(score) {
  if (score >= 90) return 'Exceptional match! You have outstanding compatibility.';
  if (score >= 80) return 'Great match! Strong compatibility potential.';
  if (score >= 70) return 'Good match! Worth exploring further.';
  if (score >= 60) return 'Decent match. Some common ground found.';
  if (score >= 50) return 'Average match. Give it a try!';
  return 'Lower compatibility, but sometimes opposites attract!';
}

module.exports = router;
