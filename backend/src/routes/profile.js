const express = require('express');
const Profile = require('../models/Profile');
const { authenticate } = require('./auth');
const locationService = require('../services/LocationService');
const router = express.Router();

router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await Profile.findOne({ userId })
      .select('-trustScore');
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;
    
    console.log('Profile update request:', { userId, updates: Object.keys(updates) });

    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'photos', 'interests',
      'location', 'occupation', 'education', 'height', 'languages',
      'prompts', 'personalityTraits', 'lookingFor',
      'favoriteMovies', 'favoriteShows', 'musicTaste',
      'idealDateIdeas', 'preferredDateTypes', 'relationshipType',
      'favoritePlaces', 'locationPreferences'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    console.log('Filtered updates:', Object.keys(filteredUpdates));

    // Check if profile exists
    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      console.log('Profile not found for user:', userId);
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Update the profile
    Object.assign(profile, filteredUpdates);
    
    const completeness = calculateProfileCompleteness(profile);
    profile.profileCompleteness = completeness;
    await profile.save();
    
    console.log('Profile updated successfully');

    res.json(profile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

router.post('/location', authenticate, async (req, res) => {
  try {
    const { latitude, longitude, city, country } = req.body;
    const userId = req.userId;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
          city,
          country
        }
      },
      { new: true }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

router.post('/photos', authenticate, async (req, res) => {
  try {
    const { photos } = req.body;
    const userId = req.userId;

    const profile = await Profile.findOne({ userId });
    
    if (!profile.photos) {
      profile.photos = [];
    }

    photos.forEach((photo, index) => {
      profile.photos.push({
        url: photo.url,
        isMain: photo.isMain || (index === 0 && profile.photos.length === 0),
        order: photo.order || profile.photos.length
      });
    });

    await profile.save();

    const completeness = calculateProfileCompleteness(profile);
    profile.profileCompleteness = completeness;
    await profile.save();

    res.json(profile.photos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add photos' });
  }
});

// Geocode address endpoint
router.post('/geocode', authenticate, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const result = await locationService.geocodeAddress(address);
    
    if (!result) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({
      coordinates: [result.lng, result.lat],
      formattedAddress: result.formattedAddress,
      address: result.address,
      neighborhood: result.neighborhood,
      locality: result.locality
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
});

// Get nearby users endpoint
router.get('/nearby/:radius?', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const radiusKm = parseInt(req.params.radius) || 5;

    // Get current user's location
    const userProfile = await Profile.findOne({ userId });
    
    if (!userProfile?.location?.coordinates || 
        userProfile.location.coordinates[0] === 0 && userProfile.location.coordinates[1] === 0) {
      return res.status(400).json({ error: 'Location not set' });
    }

    // Find nearby users using geospatial query
    const nearbyUsers = await Profile.find({
      userId: { $ne: userId },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userProfile.location.coordinates
          },
          $maxDistance: radiusKm * 1000 // Convert km to meters
        }
      }
    }).select('-trustScore');

    // Calculate distances and add match scores
    const usersWithDistance = nearbyUsers.map(profile => {
      const distance = locationService.calculateDistance(
        userProfile.location.coordinates[1],
        userProfile.location.coordinates[0],
        profile.location.coordinates[1],
        profile.location.coordinates[0]
      );

      // Calculate location-based match score
      const locationScore = locationService.calculateLocationMatchScore(
        userProfile.toObject(),
        profile.toObject()
      );

      return {
        ...profile.toObject(),
        distance: locationService.formatDistance(distance),
        distanceKm: distance,
        locationMatchScore: locationScore
      };
    });

    // Sort by location match score
    usersWithDistance.sort((a, b) => b.locationMatchScore - a.locationMatchScore);

    res.json({
      users: usersWithDistance,
      total: usersWithDistance.length,
      radius: radiusKm
    });
  } catch (error) {
    console.error('Nearby users error:', error);
    res.status(500).json({ error: 'Failed to find nearby users' });
  }
});

function calculateProfileCompleteness(profile) {
  let score = 0;
  const maxScore = 100;

  if (profile.firstName) score += 8;
  if (profile.photos && profile.photos.length > 0) score += 15;
  if (profile.photos && profile.photos.length >= 3) score += 8;
  if (profile.bio && profile.bio.length > 50) score += 12;
  if (profile.interests && profile.interests.length > 0) score += 8;
  if (profile.interests && profile.interests.length >= 5) score += 4;
  if (profile.occupation) score += 4;
  if (profile.education) score += 4;
  if (profile.location && profile.location.city) score += 8;
  if (profile.location && profile.location.coordinates && 
      profile.location.coordinates[0] !== 0 && profile.location.coordinates[1] !== 0) score += 8;
  if (profile.favoritePlaces && profile.favoritePlaces.length > 0) score += 8;
  if (profile.favoritePlaces && profile.favoritePlaces.length >= 3) score += 4;
  if (profile.prompts && profile.prompts.length > 0) score += 9;

  return Math.min(score, maxScore);
}

// Get all profiles for browse page
router.get('/all/list', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { search, gender } = req.query;

    // Build query
    const query = {
      userId: { $ne: userId } // Exclude current user
    };

    // Filter by gender
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // Search by name
    if (search && search.trim()) {
      query.firstName = { $regex: search.trim(), $options: 'i' };
    }

    const profiles = await Profile.find(query)
      .select('userId firstName lastName dateOfBirth gender bio photos location occupation education interests hobbies isVerified')
      .limit(100);

    res.json({
      profiles,
      total: profiles.length
    });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

module.exports = router;
