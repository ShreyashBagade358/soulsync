require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const matchRoutes = require('./routes/match');
const swipeRoutes = require('./routes/swipe');
const messageRoutes = require('./routes/message');
const recommendationRoutes = require('./routes/recommendation');
const preferenceRoutes = require('./routes/preference');

const socketHandler = require('./socket/socketHandler');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Redis configuration - optional (app works without Redis)
let redisClient = null;

// Create Redis client with error handling
redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  // Silently handle Redis errors - app works without Redis
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

// Try to connect to Redis, but don't block if it fails
redisClient.connect().catch(() => {
  logger.warn('Redis not available - running without cache (this is OK for development)');
});

// CORS configuration - Allow all origins in development
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests, please try again later'
});
app.use(limiter);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soulsync')
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

app.use((req, res, next) => {
  req.redisClient = redisClient;
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/recommendation', recommendationRoutes);
app.use('/api/preferences', preferenceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

socketHandler(io, redisClient);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`SoulSync server running on port ${PORT}`);
});

module.exports = { app, redisClient };
