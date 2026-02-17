const geolib = require('geolib');
const Profile = require('../models/Profile');
const Preference = require('../models/Preference');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const UserEmbedding = require('../models/UserEmbedding');
const locationService = require('./LocationService');

class MatchingAlgorithm {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Calculate location-based match score
   * @param {Object} userProfile - Current user profile
   * @param {Object} candidateProfile - Candidate profile
   * @returns {Object} Score and breakdown
   */
  calculateLocationScore(userProfile, candidateProfile) {
    let score = 0;
    const breakdown = {
      distance: 0,
      sameNeighborhood: 0,
      sharedPlaces: 0
    };

    // Check if both have coordinates
    if (userProfile.location?.coordinates && candidateProfile.location?.coordinates) {
      const [userLng, userLat] = userProfile.location.coordinates;
      const [candLng, candLat] = candidateProfile.location.coordinates;

      // Skip if coordinates are default (0,0)
      if (userLat !== 0 && userLng !== 0 && candLat !== 0 && candLng !== 0) {
        const distance = locationService.calculateDistance(userLat, userLng, candLat, candLng);

        // Distance scoring (0-40 points)
        if (distance <= 1) {
          score += 40;
          breakdown.distance = 40;
        } else if (distance <= 2) {
          score += 35;
          breakdown.distance = 35;
        } else if (distance <= 3) {
          score += 30;
          breakdown.distance = 30;
        } else if (distance <= 5) {
          score += 25;
          breakdown.distance = 25;
        } else if (distance <= 10) {
          score += 15;
          breakdown.distance = 15;
        } else if (distance <= 20) {
          score += 8;
          breakdown.distance = 8;
        }

        // Same neighborhood bonus (0-20 points)
        if (userProfile.location.address?.neighborhood &&
            candidateProfile.location.address?.neighborhood) {
          if (userProfile.location.address.neighborhood.toLowerCase() ===
              candidateProfile.location.address.neighborhood.toLowerCase()) {
            score += 20;
            breakdown.sameNeighborhood = 20;
          }
        }

        // Same ZIP code bonus (0-10 points)
        if (userProfile.location.address?.zipCode &&
            candidateProfile.location.address?.zipCode) {
          if (userProfile.location.address.zipCode ===
              candidateProfile.location.address.zipCode) {
            score += 10;
            breakdown.sameZipCode = 10;
          }
        }
      }
    }

    // Shared favorite places (0-30 points)
    if (userProfile.favoritePlaces?.length > 0 && candidateProfile.favoritePlaces?.length > 0) {
      const userPlaces = userProfile.favoritePlaces.map(p => p.name.toLowerCase());
      const candidatePlaces = candidateProfile.favoritePlaces.map(p => p.name.toLowerCase());

      const sharedPlaces = userPlaces.filter(place => candidatePlaces.includes(place));

      if (sharedPlaces.length > 0) {
        // 10 points per shared place, max 30
        const placeScore = Math.min(sharedPlaces.length * 10, 30);
        score += placeScore;
        breakdown.sharedPlaces = placeScore;
        breakdown.sharedPlaceNames = sharedPlaces;
      }
    }

    return {
      score: Math.min(score, 100),
      breakdown,
      distance: this.getDistance(userProfile, candidateProfile)
    };
  }

  getDistance(profile1, profile2) {
    if (profile1.location?.coordinates && profile2.location?.coordinates) {
      const [lng1, lat1] = profile1.location.coordinates;
      const [lng2, lat2] = profile2.location.coordinates;

      if (lat1 !== 0 && lng1 !== 0 && lat2 !== 0 && lng2 !== 0) {
        const distanceKm = locationService.calculateDistance(lat1, lng1, lat2, lng2);
        return locationService.formatDistance(distanceKm);
      }
    }
    return null;
  }

  async getRecommendations(userId, limit = 20) {
    const cacheKey = `recommendations:${userId}`;
    
    // Try to get from cache only if Redis is available
    if (this.redis && this.redis.isReady) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        // Cache miss or error, continue without cache
      }
    }

    const userProfile = await Profile.findOne({ userId });
    const userPrefs = await Preference.findOne({ userId });
    const userEmbedding = await UserEmbedding.findOne({ userId });

    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    // If no preferences exist, create default preferences
    if (!userPrefs) {
      console.log('No preferences found for user:', userId, '- using defaults');
      return []; // Return empty recommendations until preferences are set
    }

    const existingMatches = await Match.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: 'active'
    }).select('user1Id user2Id');
    
    const matchedUserIds = existingMatches.map(m => 
      m.user1Id.toString() === userId.toString() ? m.user2Id : m.user1Id
    );

    const swipedProfiles = await Swipe.find({ swiperId: userId })
      .select('swipedId');
    const swipedIds = swipedProfiles.map(s => s.swipedId.toString());

    const excludedIds = [...matchedUserIds, ...swipedIds, userId.toString()];

    const candidates = await this.getFilteredCandidates(
      userProfile,
      userPrefs,
      excludedIds
    );

    const scoredProfiles = await this.scoreProfiles(
      userProfile,
      userPrefs,
      candidates,
      userEmbedding
    );

    const recommendations = scoredProfiles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache results only if Redis is available
    if (this.redis && this.redis.isReady) {
      try {
        await this.redis.setEx(cacheKey, 300, JSON.stringify(recommendations));
      } catch (err) {
        // Cache error, ignore
      }
    }

    return recommendations;
  }

  async getFilteredCandidates(userProfile, userPrefs, excludedIds) {
    const mongoose = require('mongoose');
    const query = {
      userId: { $nin: excludedIds.map(id => new mongoose.Types.ObjectId(id)) },
      isActive: true
    };

    if (userPrefs.genderPreference && !userPrefs.genderPreference.includes('all')) {
      query.gender = { $in: userPrefs.genderPreference };
    }

    if (userPrefs.ageRange) {
      const maxBirthDate = new Date();
      maxBirthDate.setFullYear(maxBirthDate.getFullYear() - userPrefs.ageRange.min);
      
      const minBirthDate = new Date();
      minBirthDate.setFullYear(minBirthDate.getFullYear() - userPrefs.ageRange.max);
      
      query.dateOfBirth = {
        $gte: minBirthDate,
        $lte: maxBirthDate
      };
    }

    if (userProfile.location && userProfile.location.coordinates && userPrefs.distance) {
      const maxDistanceMeters = userPrefs.distance * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userProfile.location.coordinates
          },
          $maxDistance: maxDistanceMeters
        }
      };
    }

    return await Profile.find(query).limit(100);
  }

  async scoreProfiles(userProfile, userPrefs, candidates, userEmbedding) {
    const scored = [];

    for (const candidate of candidates) {
      let score = 0;
      const breakdown = {};

      // New location-based scoring including distance, neighborhood, and favorite places
      const locationResult = this.calculateLocationScore(userProfile, candidate);
      const locationWeight = userPrefs.distancePriority ? (userPrefs.distancePriority / 10) : 0.8;
      score += (locationResult.score / 100) * locationWeight * 40; // 40% weight for location
      breakdown.location = locationResult.score;
      breakdown.locationBreakdown = locationResult.breakdown;
      breakdown.distance = locationResult.distance;

      const interestScore = this.calculateInterestScore(
        userProfile.interests,
        candidate.interests
      );
      score += interestScore * (userPrefs.interestsPriority / 10 || 0.8) * 25;
      breakdown.interests = interestScore;

      const ageScore = this.calculateAgeScore(
        userProfile.dateOfBirth,
        candidate.dateOfBirth,
        userPrefs.ageRange
      );
      score += ageScore * (userPrefs.agePriority / 10 || 0.6) * 20;
      breakdown.age = ageScore;

      const profileQualityScore = candidate.profileCompleteness / 100;
      score += profileQualityScore * 10;
      breakdown.profileQuality = profileQualityScore;

      const trustScore = candidate.trustScore / 100;
      score += trustScore * 5;
      breakdown.trust = trustScore;

      if (userEmbedding) {
        const behaviorScore = await this.calculateBehavioralScore(
          userEmbedding,
          candidate.userId
        );
        score += behaviorScore * 5;
        breakdown.behavioral = behaviorScore;
      }

      const boostBonus = candidate.isBoosted && candidate.boostExpiry > new Date() ? 10 : 0;
      score += boostBonus;
      breakdown.boost = boostBonus;

      scored.push({
        profile: candidate,
        score: Math.round(score),
        breakdown,
        distance: locationResult.distance,
        sharedPlaces: locationResult.breakdown.sharedPlaceNames || []
      });
    }

    return scored;
  }

  calculateDistanceScore(loc1, loc2, maxDistance) {
    if (!loc1 || !loc2 || !loc1.coordinates || !loc2.coordinates) {
      return 0.5;
    }

    const distance = geolib.getDistance(
      { latitude: loc1.coordinates[1], longitude: loc1.coordinates[0] },
      { latitude: loc2.coordinates[1], longitude: loc2.coordinates[0] }
    );

    const distanceKm = distance / 1000;
    if (distanceKm > maxDistance) return 0;
    
    return Math.max(0, 1 - (distanceKm / maxDistance));
  }

  calculateInterestScore(interests1, interests2) {
    if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
      return 0.3;
    }

    const set1 = new Set(interests1.map(i => i.toLowerCase()));
    const set2 = new Set(interests2.map(i => i.toLowerCase()));
    
    const intersection = [...set1].filter(x => set2.has(x));
    const union = new Set([...set1, ...set2]);
    
    return intersection.length / union.size;
  }

  calculateAgeScore(userDob, candidateDob, ageRange) {
    const userAge = this.getAge(userDob);
    const candidateAge = this.getAge(candidateDob);
    
    if (candidateAge < ageRange.min || candidateAge > ageRange.max) {
      return 0;
    }

    const preferredMid = (ageRange.min + ageRange.max) / 2;
    const ageDiff = Math.abs(userAge - candidateAge);
    const maxDiff = Math.max(preferredMid - ageRange.min, ageRange.max - preferredMid);
    
    return Math.max(0, 1 - (ageDiff / maxDiff));
  }

  getAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async calculateBehavioralScore(userEmbedding, candidateId) {
    const similarProfiles = userEmbedding.swipeHistory
      .filter(h => h.action === 'like')
      .map(h => h.profileId.toString());

    if (similarProfiles.length === 0) return 0.5;

    return similarProfiles.includes(candidateId.toString()) ? 0.8 : 0.3;
  }

  async checkForMatch(swiperId, swipedId) {
    const reciprocalSwipe = await Swipe.findOne({
      swiperId: swipedId,
      swipedId: swiperId,
      action: { $in: ['like', 'superlike'] }
    });

    if (!reciprocalSwipe) return null;

    const existingMatch = await Match.findOne({
      $or: [
        { user1Id: swiperId, user2Id: swipedId },
        { user1Id: swipedId, user2Id: swiperId }
      ]
    });

    if (existingMatch) return existingMatch;

    const compatibilityScore = await this.calculateCompatibility(swiperId, swipedId);

    const match = new Match({
      user1Id: swiperId,
      user2Id: swipedId,
      status: 'active',
      compatibilityScore
    });

    await match.save();

    // Clear cache if Redis is available
    if (this.redis && this.redis.isReady) {
      await this.redis.del(`recommendations:${swiperId}`);
      await this.redis.del(`recommendations:${swipedId}`);
    }

    return match;
  }

  async calculateCompatibility(user1Id, user2Id) {
    const [profile1, profile2] = await Promise.all([
      Profile.findOne({ userId: user1Id }),
      Profile.findOne({ userId: user2Id })
    ]);

    if (!profile1 || !profile2) return 50;

    let score = 50;

    const interestScore = this.calculateInterestScore(
      profile1.interests,
      profile2.interests
    );
    score += interestScore * 20;

    if (profile1.personalityTraits && profile2.personalityTraits) {
      const traitKeys = ['extroversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'];
      let traitDiff = 0;
      
      traitKeys.forEach(trait => {
        const diff = Math.abs(
          (profile1.personalityTraits[trait] || 50) - 
          (profile2.personalityTraits[trait] || 50)
        );
        traitDiff += diff;
      });
      
      const traitCompatibility = 1 - (traitDiff / (traitKeys.length * 100));
      score += traitCompatibility * 15;
    }

    const distanceScore = this.calculateDistanceScore(
      profile1.location,
      profile2.location,
      100
    );
    score += distanceScore * 10;

    if (profile1.lookingFor && profile2.lookingFor) {
      score += profile1.lookingFor === profile2.lookingFor ? 5 : 0;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

module.exports = MatchingAlgorithm;
