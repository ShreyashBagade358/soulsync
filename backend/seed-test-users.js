const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Profile = require('./src/models/Profile');
const Preference = require('./src/models/Preference');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soulsync';

async function seedTestUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing test users if they exist
    const testEmails = ['shreyash@test.com', 'shreya@test.com'];
    for (const email of testEmails) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        await Profile.deleteOne({ userId: existingUser._id });
        await Preference.deleteOne({ userId: existingUser._id });
        await User.deleteOne({ _id: existingUser._id });
        console.log(`Deleted existing user: ${email}`);
      }
    }

    const password = 'Test123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // User 1: Shreyash (Male)
    const user1 = new User({
      email: 'shreyash@test.com',
      password: hashedPassword,
      isVerified: true,
      isActive: true,
      lastLogin: new Date()
    });
    await user1.save();
    console.log('Created User 1 (Shreyash):', user1._id.toString());

    const profile1 = new Profile({
      userId: user1._id,
      firstName: 'Shreyash',
      lastName: 'Kumar',
      dateOfBirth: new Date('1995-06-15'),
      gender: 'male',
      bio: 'Software developer who loves coffee, hiking, and good conversations. Looking for someone to explore the city with!',
      photos: [
        { 
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
          isMain: true, 
          order: 0 
        },
        { 
          url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
          isMain: false, 
          order: 1 
        }
      ],
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: {
          street: '123 MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          formattedAddress: '123 MG Road, Bangalore, Karnataka 560001'
        },
        neighborhood: 'MG Road',
        locality: 'Central Bangalore'
      },
      favoritePlaces: [
        {
          name: 'Third Wave Coffee',
          type: 'cafe',
          address: 'MG Road, Bangalore',
          coordinates: [77.5946, 12.9716],
          whyFavorite: 'Best cold brew in the city',
          goodForDates: true
        },
        {
          name: 'Cubbon Park',
          type: 'park',
          address: 'Kasturba Road, Bangalore',
          coordinates: [77.5969, 12.9763],
          whyFavorite: 'Perfect for morning walks',
          goodForDates: true
        },
        {
          name: 'Truffles',
          type: 'restaurant',
          address: 'Koramangala, Bangalore',
          coordinates: [77.6244, 12.9279],
          whyFavorite: 'Amazing burgers and shakes',
          goodForDates: true
        }
      ],
      locationPreferences: {
        maxDistance: 5,
        preferSameNeighborhood: true,
        willingToTravel: true
      },
      interests: ['technology', 'coffee', 'hiking', 'movies', 'reading', 'gaming'],
      hobbies: [
        { category: 'sports', items: ['cricket', 'badminton'] },
        { category: 'creative', items: ['photography', 'writing'] }
      ],
      relationshipType: 'serious',
      datingStyle: 'planner',
      favoriteMovies: [
        { title: 'Inception', genre: 'sci-fi', year: 2010 },
        { title: 'The Dark Knight', genre: 'action', year: 2008 }
      ],
      favoriteShows: [
        { title: 'Breaking Bad', genre: 'drama', platform: 'Netflix' },
        { title: 'The Office', genre: 'comedy', platform: 'Netflix' }
      ],
      musicTaste: {
        genres: ['rock', 'indie', 'electronic'],
        artists: ['Coldplay', 'Radiohead', 'AR Rahman']
      },
      idealDateIdeas: [
        'Coffee and conversation at a cozy cafe',
        'Walk in the park followed by street food',
        'Movie night with popcorn and cuddles'
      ],
      preferredDateTypes: ['coffee', 'dinner', 'outdoor'],
      occupation: 'Software Engineer',
      education: 'B.Tech in Computer Science',
      height: 175,
      languages: ['English', 'Hindi', 'Kannada'],
      religion: 'Hindu',
      zodiacSign: 'gemini',
      prompts: [
        { question: 'My ideal Sunday', answer: 'Sleeping in, then brunch and a movie' },
        { question: 'Two truths and a lie', answer: 'I have been to 10 countries, I can cook, I hate dogs (lie!)' }
      ],
      personalityTraits: {
        extroversion: 70,
        openness: 85,
        conscientiousness: 75,
        agreeableness: 80,
        neuroticism: 30
      },
      values: ['honesty', 'ambition', 'family', 'kindness'],
      profileCompleteness: 95,
      trustScore: 90,
      isVerified: true
    });
    await profile1.save();
    console.log('Created Profile for Shreyash');

    // User 2: Shreya (Female)
    const user2 = new User({
      email: 'shreya@test.com',
      password: hashedPassword,
      isVerified: true,
      isActive: true,
      lastLogin: new Date()
    });
    await user2.save();
    console.log('Created User 2 (Shreya):', user2._id.toString());

    const profile2 = new Profile({
      userId: user2._id,
      firstName: 'Shreya',
      lastName: 'Patel',
      dateOfBirth: new Date('1997-03-22'),
      gender: 'female',
      bio: 'Coffee enthusiast, book lover, and weekend hiker. Love exploring new cafes and having deep conversations.',
      photos: [
        { 
          url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
          isMain: true, 
          order: 0 
        },
        { 
          url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
          isMain: false, 
          order: 1 
        }
      ],
      location: {
        type: 'Point',
        coordinates: [77.6000, 12.9750],
        address: {
          street: '456 Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          formattedAddress: '456 Brigade Road, Bangalore, Karnataka 560001'
        },
        neighborhood: 'MG Road',
        locality: 'Central Bangalore'
      },
      favoritePlaces: [
        {
          name: 'Third Wave Coffee',
          type: 'cafe',
          address: 'MG Road, Bangalore',
          coordinates: [77.5946, 12.9716],
          whyFavorite: 'Love their ambiance and pastries',
          goodForDates: true
        },
        {
          name: 'Cubbon Park',
          type: 'park',
          address: 'Kasturba Road, Bangalore',
          coordinates: [77.5969, 12.9763],
          whyFavorite: 'Great for jogging and relaxing',
          goodForDates: true
        },
        {
          name: 'Corner House',
          type: 'restaurant',
          address: 'Residency Road, Bangalore',
          coordinates: [77.5989, 12.9698],
          whyFavorite: 'Best ice cream in town!',
          goodForDates: true
        }
      ],
      locationPreferences: {
        maxDistance: 5,
        preferSameNeighborhood: true,
        willingToTravel: true
      },
      interests: ['reading', 'coffee', 'hiking', 'movies', 'yoga', 'traveling'],
      hobbies: [
        { category: 'sports', items: ['yoga', 'swimming'] },
        { category: 'creative', items: ['dancing', 'painting'] }
      ],
      relationshipType: 'serious',
      datingStyle: 'go-with-flow',
      favoriteMovies: [
        { title: 'La La Land', genre: 'romance', year: 2016 },
        { title: 'Inception', genre: 'sci-fi', year: 2010 }
      ],
      favoriteShows: [
        { title: 'Friends', genre: 'comedy', platform: 'Netflix' },
        { title: 'Stranger Things', genre: 'sci-fi', platform: 'Netflix' }
      ],
      musicTaste: {
        genres: ['pop', 'indie', 'classical'],
        artists: ['Taylor Swift', 'Adele', 'AR Rahman']
      },
      idealDateIdeas: [
        'Trying out a new cafe together',
        'Visiting an art gallery or museum',
        'Sunset walk at the park'
      ],
      preferredDateTypes: ['coffee', 'dinner', 'cultural'],
      occupation: 'Marketing Manager',
      education: 'MBA in Marketing',
      height: 162,
      languages: ['English', 'Hindi', 'Gujarati'],
      religion: 'Hindu',
      zodiacSign: 'aries',
      prompts: [
        { question: 'My ideal Sunday', answer: 'Yoga class, then coffee and a good book' },
        { question: 'I am looking for', answer: 'Someone kind, ambitious, and who makes me laugh' }
      ],
      personalityTraits: {
        extroversion: 65,
        openness: 80,
        conscientiousness: 85,
        agreeableness: 85,
        neuroticism: 25
      },
      values: ['kindness', 'family', 'growth', 'adventure'],
      profileCompleteness: 95,
      trustScore: 90,
      isVerified: true
    });
    await profile2.save();
    console.log('Created Profile for Shreya');

    // Create preferences for both users
    const preference1 = new Preference({
      userId: user1._id,
      gender: ['female'],
      ageRange: { min: 23, max: 30 },
      distance: 5,
      relationshipType: ['serious', 'not-sure'],
      interests: ['coffee', 'hiking', 'movies', 'reading'],
      dealBreakers: ['smoking', 'dishonesty']
    });
    await preference1.save();
    console.log('Created Preferences for Shreyash');

    const preference2 = new Preference({
      userId: user2._id,
      gender: ['male'],
      ageRange: { min: 25, max: 32 },
      distance: 5,
      relationshipType: ['serious', 'not-sure'],
      interests: ['coffee', 'hiking', 'movies', 'technology'],
      dealBreakers: ['smoking']
    });
    await preference2.save();
    console.log('Created Preferences for Shreya');

    console.log('\n✅ Test users created successfully!\n');
    console.log('='.repeat(60));
    console.log('USER 1 - SHREYASH');
    console.log('='.repeat(60));
    console.log('Email:    shreyash@test.com');
    console.log('Password: Test123!');
    console.log('User ID:  ', user1._id.toString());
    console.log('Gender:   Male');
    console.log('Age:      29');
    console.log('Location: MG Road, Bangalore');
    console.log('');
    console.log('='.repeat(60));
    console.log('USER 2 - SHREYA');
    console.log('='.repeat(60));
    console.log('Email:    shreya@test.com');
    console.log('Password: Test123!');
    console.log('User ID:  ', user2._id.toString());
    console.log('Gender:   Female');
    console.log('Age:      27');
    console.log('Location: Brigade Road, Bangalore (same neighborhood)');
    console.log('');
    console.log('='.repeat(60));
    console.log('MATCHING DETAILS');
    console.log('='.repeat(60));
    console.log('Distance: ~500 meters (within 5km radius)');
    console.log('Shared Places: Third Wave Coffee, Cubbon Park');
    console.log('Shared Interests: Coffee, Hiking, Movies');
    console.log('Both looking for: Serious relationship');
    console.log('Same Neighborhood: MG Road area');
    console.log('');
    console.log('These users should match with high compatibility!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error seeding test users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedTestUsers();
