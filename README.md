# SoulSync Dating App

A modern, AI-powered dating application with sophisticated matching algorithms and real-time features.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB (Primary), Redis (Cache)
- **Real-time**: Socket.IO + WebSockets
- **Authentication**: JWT
- **Geolocation**: Geolib

## Features

- **Smart Matching Algorithm**: Multi-layer scoring system with distance, interests, age, and behavioral analysis
- **User Embeddings**: AI-powered taste profiling and compatibility prediction
- **Real-time Messaging**: Instant chat with typing indicators and read receipts
- **Swipe System**: Like, Dislike, and SuperLike actions
- **Profile Management**: Photos, prompts, personality traits, and verification
- **Geolocation**: Location-based matching with configurable radius

## Project Structure

```
backend/
├── src/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic (matching algorithm)
│   ├── socket/           # WebSocket handlers
│   └── app.js           # Main application
├── package.json
└── .env
```

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/soulsync
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

3. Start MongoDB and Redis servers

4. Run the application:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/location` - Update location
- `POST /api/profile/photos` - Add photos

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

### Swipe & Match
- `POST /api/swipe` - Create swipe (like/dislike/superlike)
- `GET /api/swipe/history` - Get swipe history
- `GET /api/swipe/stats` - Get swipe statistics

### Recommendations
- `GET /api/recommendation` - Get recommended profiles
- `GET /api/recommendation/discover` - Discover new profiles
- `GET /api/recommendation/compatibility/:userId` - Calculate compatibility

### Matches
- `GET /api/match` - Get all matches
- `GET /api/match/:matchId` - Get match details
- `DELETE /api/match/:matchId` - Unmatch

### Messages
- `GET /api/message/:matchId` - Get messages
- `POST /api/message/:matchId` - Send message
- `PUT /api/message/:messageId/read` - Mark as read
- `GET /api/message/unread/count` - Get unread count

## Matching Algorithm

The matching algorithm uses multiple scoring factors:

1. **Distance Score** (25%): Based on location proximity
2. **Interest Score** (25%): Common interests between users
3. **Age Score** (20%): Age compatibility within preferences
4. **Profile Quality** (15%): Profile completeness
5. **Trust Score** (10%): User verification level
6. **Behavioral Score** (5%): AI learning from swipe patterns

### Scoring Formula
```javascript
match_score =
  (distance_score * 0.25) +
  (interest_score * 0.25) +
  (age_score * 0.20) +
  (profile_quality * 0.15) +
  (trust_score * 0.10) +
  (behavioral_score * 0.05)
```

## WebSocket Events

### Client to Server
- `authenticate` - Authenticate socket connection
- `join_match` - Join a match room
- `leave_match` - Leave a match room
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server to Client
- `new_match` - New match created
- `new_message` - New message received
- `message_read` - Message marked as read
- `match_unmatched` - Match removed
- `user_online` - User came online
- `user_offline` - User went offline
- `typing` - Other user is typing
- `stop_typing` - Other user stopped typing

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/soulsync |
| REDIS_URL | Redis connection string | redis://localhost:6379 |
| JWT_SECRET | Secret for JWT tokens | - |
| CLIENT_URL | Frontend URL | http://localhost:3000 |

## License

MIT
