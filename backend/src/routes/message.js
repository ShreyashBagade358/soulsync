const express = require('express');
const Message = require('../models/Message');
const Match = require('../models/Match');
const { authenticate } = require('./auth');
const router = express.Router();

router.get('/:matchId', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 50 } = req.query;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: 'active'
    });

    if (!match) {
      return res.status(403).json({ error: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ matchId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    await Message.updateMany(
      { matchId, senderId: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const total = await Message.countDocuments({ matchId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/:matchId', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const senderId = req.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: senderId }, { user2Id: senderId }],
      status: 'active'
    });

    if (!match) {
      return res.status(403).json({ error: 'Not authorized to send messages' });
    }

    const message = new Message({
      matchId,
      senderId,
      content: content.trim(),
      messageType
    });

    await message.save();

    await Match.findByIdAndUpdate(matchId, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 }
    });

    const receiverId = match.user1Id.toString() === senderId.toString() 
      ? match.user2Id 
      : match.user1Id;

    req.io.to(`user:${receiverId}`).emit('new_message', {
      matchId,
      message: {
        id: message._id,
        senderId,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.put('/:messageId/read', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const match = await Match.findById(message.matchId);
    if (!match || (match.user1Id.toString() !== userId.toString() && match.user2Id.toString() !== userId.toString())) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (message.senderId.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      req.io.to(`user:${message.senderId}`).emit('message_read', {
        messageId: message._id,
        readAt: message.readAt
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const matches = await Match.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: 'active'
    }).select('_id');

    const matchIds = matches.map(m => m._id);

    const unreadCount = await Message.countDocuments({
      matchId: { $in: matchIds },
      senderId: { $ne: userId },
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;
