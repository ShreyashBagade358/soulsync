const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Preference = require('../models/Preference');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password, firstName, dateOfBirth, gender } = req.body;

    // Validation
    if (!email || !password || !firstName || !dateOfBirth || !gender) {
      console.log('Missing fields:', { email: !!email, password: !!password, firstName: !!firstName, dateOfBirth: !!dateOfBirth, gender: !!gender });
      return res.status(400).json({ 
        error: 'All fields are required',
        missing: {
          email: !email,
          password: !password,
          firstName: !firstName,
          dateOfBirth: !dateOfBirth,
          gender: !gender
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false
    });

    await user.save();
    console.log('User created:', user._id);

    // Create profile
    const profile = new Profile({
      userId: user._id,
      firstName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      photos: [],
      interests: []
    });

    await profile.save();
    console.log('Profile created');

    // Create preferences
    const preferences = new Preference({
      userId: user._id
    });

    await preferences.save();
    console.log('Preferences created');

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Registration successful');
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: {
          firstName: profile.firstName,
          gender: profile.gender
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const profile = await Profile.findOne({ userId: user._id });
    const preferences = await Preference.findOne({ userId: user._id });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        profile: profile ? {
          firstName: profile.firstName,
          photos: profile.photos,
          profileCompleteness: profile.profileCompleteness
        } : null,
        preferences: preferences ? {
          ageRange: preferences.ageRange,
          distance: preferences.distance
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const profile = await Profile.findOne({ userId: req.userId });
    const preferences = await Preference.findOne({ userId: req.userId });

    res.json({
      user,
      profile,
      preferences
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;
module.exports.authenticate = authenticate;
