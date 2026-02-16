const UserEmbedding = require('../models/UserEmbedding');
const Swipe = require('../models/Swipe');
const Profile = require('../models/Profile');

class EmbeddingService {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async updateUserEmbedding(userId) {
    const swipeHistory = await Swipe.find({ swiperId: userId })
      .sort({ timestamp: -1 })
      .limit(200);

    const likedProfiles = swipeHistory
      .filter(s => s.action === 'like' || s.action === 'superlike')
      .map(s => s.swipedId);

    const dislikedProfiles = swipeHistory
      .filter(s => s.action === 'dislike')
      .map(s => s.swipedId);

    const likedProfilesData = await Profile.find({
      userId: { $in: likedProfiles }
    });

    const dislikedProfilesData = await Profile.find({
      userId: { $in: dislikedProfiles }
    });

    const tasteProfile = this.generateTasteProfile(likedProfilesData, dislikedProfilesData);

    const embedding = this.generateEmbedding(tasteProfile, swipeHistory);

    await UserEmbedding.findOneAndUpdate(
      { userId },
      {
        userId,
        embedding,
        dimensions: embedding.length,
        lastUpdated: new Date(),
        swipeHistory: swipeHistory.map(s => ({
          profileId: s.swipedId,
          action: s.action,
          timestamp: s.timestamp
        })),
        tasteProfile
      },
      { upsert: true, new: true }
    );

    await this.redis.del(`embedding:${userId}`);
  }

  generateTasteProfile(likedProfiles, dislikedProfiles) {
    const likedInterests = this.extractInterests(likedProfiles);
    const dislikedInterests = this.extractInterests(dislikedProfiles);

    const preferredInterests = likedInterests
      .filter(i => !dislikedInterests.includes(i))
      .slice(0, 10);

    const likedAges = likedProfiles.map(p => this.getAge(p.dateOfBirth)).filter(a => a > 0);
    const dislikedAges = dislikedProfiles.map(p => this.getAge(p.dateOfBirth)).filter(a => a > 0);

    const avgLikedAge = likedAges.length > 0 ? 
      likedAges.reduce((a, b) => a + b, 0) / likedAges.length : 30;
    
    const ageVariance = likedAges.length > 0 ?
      Math.sqrt(likedAges.reduce((sum, age) => sum + Math.pow(age - avgLikedAge, 2), 0) / likedAges.length) : 5;

    const likedLocations = likedProfiles.map(p => p.location).filter(l => l && l.coordinates);
    const avgDistance = this.calculateAverageDistance(likedLocations);

    return {
      preferredInterests,
      preferredAgeRange: {
        min: Math.max(18, Math.round(avgLikedAge - ageVariance * 2)),
        max: Math.min(100, Math.round(avgLikedAge + ageVariance * 2))
      },
      preferredDistance: Math.round(avgDistance),
      swipePatterns: {
        likeRate: likedProfiles.length / (likedProfiles.length + dislikedProfiles.length) || 0.5,
        superlikeRate: likedProfiles.filter(p => p.isBoosted).length / (likedProfiles.length || 1),
        avgTimeOnProfile: 5
      }
    };
  }

  extractInterests(profiles) {
    const interestCount = {};
    
    profiles.forEach(profile => {
      if (profile.interests) {
        profile.interests.forEach(interest => {
          const lowerInterest = interest.toLowerCase();
          interestCount[lowerInterest] = (interestCount[lowerInterest] || 0) + 1;
        });
      }
    });

    return Object.entries(interestCount)
      .sort((a, b) => b[1] - a[1])
      .map(([interest]) => interest);
  }

  getAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  calculateAverageDistance(locations) {
    if (locations.length < 2) return 50;
    
    let totalDistance = 0;
    let count = 0;
    
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const loc1 = locations[i];
        const loc2 = locations[j];
        
        if (loc1.coordinates && loc2.coordinates) {
          const dist = this.calculateDistance(loc1.coordinates, loc2.coordinates);
          totalDistance += dist;
          count++;
        }
      }
    }
    
    return count > 0 ? totalDistance / count : 50;
  }

  calculateDistance(coord1, coord2) {
    const R = 6371;
    const dLat = this.deg2rad(coord2[1] - coord1[1]);
    const dLon = this.deg2rad(coord2[0] - coord1[0]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1[1])) * Math.cos(this.deg2rad(coord2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  generateEmbedding(tasteProfile, swipeHistory) {
    const embedding = [];
    
    const interestVector = this.encodeInterests(tasteProfile.preferredInterests);
    embedding.push(...interestVector);
    
    embedding.push(tasteProfile.preferredAgeRange.min / 100);
    embedding.push(tasteProfile.preferredAgeRange.max / 100);
    embedding.push(tasteProfile.preferredDistance / 500);
    embedding.push(tasteProfile.swipePatterns.likeRate);
    embedding.push(tasteProfile.swipePatterns.superlikeRate);
    
    const recentActivity = this.encodeRecentActivity(swipeHistory);
    embedding.push(...recentActivity);
    
    while (embedding.length < 128) {
      embedding.push(0);
    }
    
    return embedding.slice(0, 128);
  }

  encodeInterests(interests) {
    const commonInterests = [
      'music', 'travel', 'food', 'sports', 'movies', 'reading',
      'gaming', 'fitness', 'photography', 'art', 'cooking', 'hiking',
      'dancing', 'yoga', 'coffee', 'wine', 'technology', 'fashion',
      'pets', 'nature', 'beach', 'skiing', 'running', 'swimming'
    ];
    
    return commonInterests.map(interest => 
      interests.includes(interest) ? 1 : 0
    );
  }

  encodeRecentActivity(swipeHistory) {
    const recent = swipeHistory.slice(0, 20);
    const actions = recent.map(s => {
      if (s.action === 'like') return 0.7;
      if (s.action === 'superlike') return 1.0;
      return 0.0;
    });
    
    while (actions.length < 20) {
      actions.push(0.5);
    }
    
    return actions;
  }

  async calculateSimilarity(userId1, userId2) {
    const [emb1, emb2] = await Promise.all([
      UserEmbedding.findOne({ userId: userId1 }),
      UserEmbedding.findOne({ userId: userId2 })
    ]);

    if (!emb1 || !emb2) return 0.5;

    return this.cosineSimilarity(emb1.embedding, emb2.embedding);
  }

  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

module.exports = EmbeddingService;
