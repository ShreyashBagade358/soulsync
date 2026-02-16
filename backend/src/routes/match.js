const express = require('express');
const Match = require('../models/Match');
const Profile = require('../models/Profile');
const Message = require('../models/Message');
const { authenticate } = require('./auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { status = 'active', page = 1, limit = 20 } = req.query;

    const query = {
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status
    };

    const matches = await Match.find(query)
      .sort({ lastMessageAt: -1, matchedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const populatedMatches = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1Id.toString() === userId.toString() 
          ? match.user2Id 
          : match.user1Id;

        const otherProfile = await Profile.findOne({ userId: otherUserId })
          .select('firstName lastName photos dateOfBirth bio occupation education interests hobbies location favoritePlaces prompts isVerified');

        const unreadCount = await Message.countDocuments({
          matchId: match._id,
          senderId: otherUserId,
          isRead: false
        });

        const lastMessage = await Message.findOne({ matchId: match._id })
          .sort({ createdAt: -1 })
          .select('content createdAt senderId');

        return {
          matchId: match._id,
          user: {
            id: otherUserId,
            firstName: otherProfile?.firstName,
            lastName: otherProfile?.lastName,
            age: otherProfile?.dateOfBirth ? calculateAge(otherProfile.dateOfBirth) : null,
            bio: otherProfile?.bio,
            occupation: otherProfile?.occupation,
            education: otherProfile?.education,
            interests: otherProfile?.interests,
            hobbies: otherProfile?.hobbies,
            location: otherProfile?.location,
            favoritePlaces: otherProfile?.favoritePlaces,
            prompts: otherProfile?.prompts,
            isVerified: otherProfile?.isVerified,
            photos: otherProfile?.photos?.filter(p => p.isMain)
          },
          compatibilityScore: match.compatibilityScore,
          matchedAt: match.matchedAt,
          lastMessage,
          unreadCount,
          status: match.status
        };
      })
    );

    const total = await Match.countDocuments(query);

    res.json({
      matches: populatedMatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

router.get('/:matchId', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: userId }, { user2Id: userId }]
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const otherUserId = match.user1Id.toString() === userId.toString() 
      ? match.user2Id 
      : match.user1Id;

    const otherProfile = await Profile.findOne({ userId: otherUserId })
      .select('firstName photos dateOfBirth bio interests occupation education prompts');

    res.json({
      matchId: match._id,
      user: {
        id: otherUserId,
        firstName: otherProfile?.firstName,
        age: otherProfile?.dateOfBirth ? calculateAge(otherProfile.dateOfBirth) : null,
        bio: otherProfile?.bio,
        photos: otherProfile?.photos,
        interests: otherProfile?.interests,
        occupation: otherProfile?.occupation,
        education: otherProfile?.education,
        prompts: otherProfile?.prompts
      },
      compatibilityScore: match.compatibilityScore,
      matchedAt: match.matchedAt,
      status: match.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
});

router.delete('/:matchId', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const match = await Match.findOneAndUpdate(
      {
        _id: matchId,
        $or: [{ user1Id: userId }, { user2Id: userId }]
      },
      {
        status: 'unmatched',
        unmatchedBy: userId,
        unmatchedAt: new Date()
      },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const otherUserId = match.user1Id.toString() === userId.toString() 
      ? match.user2Id 
      : match.user1Id;

    req.io.to(`user:${otherUserId}`).emit('match_unmatched', {
      matchId: match._id
    });

    res.json({ message: 'Match removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove match' });
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

module.exports = router;
