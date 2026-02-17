const mongoose = require('mongoose');
const Match = require('./src/models/Match');
const Profile = require('./src/models/Profile');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soulsync';

async function createMatch() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // User IDs for Shreyash and Shreya
    const shreyashId = '699376f45fed2e562f87626d';
    const shreyaId = '699376f45fed2e562f87627e';

    // Check if match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { user1Id: shreyashId, user2Id: shreyaId },
        { user1Id: shreyaId, user2Id: shreyashId }
      ]
    });

    if (existingMatch) {
      console.log('Match already exists!');
      console.log('Match ID:', existingMatch._id.toString());
      
      // Update to active if not already
      if (existingMatch.status !== 'active') {
        existingMatch.status = 'active';
        await existingMatch.save();
        console.log('Match status updated to active');
      }
    } else {
      // Create new match
      const profile1 = await Profile.findOne({ userId: shreyashId });
      const profile2 = await Profile.findOne({ userId: shreyaId });

      const match = new Match({
        user1Id: shreyashId,
        user2Id: shreyaId,
        user1Action: 'like',
        user2Action: 'like',
        status: 'active',
        compatibilityScore: 85,
        matchedAt: new Date(),
        createdAt: new Date()
      });

      await match.save();
      console.log('✅ Match created successfully!');
      console.log('Match ID:', match._id.toString());
    }

    // Verify match exists
    const verifyMatch = await Match.findOne({
      $or: [
        { user1Id: shreyashId, user2Id: shreyaId },
        { user1Id: shreyaId, user2Id: shreyashId }
      ]
    });

    if (verifyMatch) {
      console.log('\n✅ VERIFIED: Match is active between Shreyash and Shreya');
      console.log('Match Score:', verifyMatch.compatibilityScore + '%');
      console.log('Matched At:', verifyMatch.matchedAt);
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error creating match:', error);
    process.exit(1);
  }
}

createMatch();
