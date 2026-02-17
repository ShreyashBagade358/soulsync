import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore.jsx';
import { useSocketStore } from '../stores/socketStore.jsx';
import { Send, ArrowLeft, Heart, MoreVertical, Phone, Video, Image, Smile, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { messages, fetchMessages, sendMessage, markAsRead } = useMessageStore();
  const { joinMatch, leaveMatch, sendTyping, stopTyping, typingUsers } = useSocketStore();
  const [newMessage, setNewMessage] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const matchMessages = messages[matchId] || [];
  const currentUserId = JSON.parse(localStorage.getItem('auth-storage'))?.state?.user?.id;

  useEffect(() => {
    fetchMatchInfo();
    fetchMessages(matchId);
    joinMatch(matchId);
    markAsRead(matchId);

    return () => {
      leaveMatch(matchId);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [matchMessages, typingUsers]);

  const fetchMatchInfo = async () => {
    try {
      const response = await axios.get(`/match/${matchId}`);
      setMatchInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch match info:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = await sendMessage(matchId, newMessage.trim());
    if (message) {
      setNewMessage('');
      stopTyping(matchId);
      setShowEmojiPicker(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTyping(matchId);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(matchId);
    }, 1000);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(matchMessages);

  if (!matchInfo) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-dark-900 to-dark-800">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOtherTyping = typingUsers.has(matchInfo.user.id);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-dark-900 via-dark-900 to-dark-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-900/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/matches')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              {matchInfo.user.photos?.[0]?.url ? (
                <img
                  src={matchInfo.user.photos[0].url}
                  alt={matchInfo.user.firstName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center ring-2 ring-red-500/30">
                  <span className="text-xl text-white font-bold">
                    {matchInfo.user.firstName?.[0]}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-900"></div>
            </div>

            <div>
              <h2 className="font-semibold text-white text-lg">
                {matchInfo.user.firstName} {matchInfo.user.lastName}
              </h2>
              <div className="flex items-center gap-2">
                {isOtherTyping ? (
                  <span className="text-sm text-red-400 flex items-center gap-1">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                    typing...
                  </span>
                ) : (
                  <>
                    <span className="text-xs text-green-400">Online</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-red-400 font-medium">{matchInfo.compatibilityScore}% match</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {matchMessages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-900/20">
              <Heart className="w-12 h-12 text-red-500" fill="currentColor" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              It's a Match! 💕
            </h3>
            <p className="text-gray-400 max-w-xs mb-6">
              You and {matchInfo.user.firstName} have liked each other. Start the conversation!
            </p>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full font-medium hover:shadow-lg hover:shadow-red-900/30 transition-all">
                Say Hello 👋
              </button>
            </div>
          </motion.div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-800/50 px-4 py-1.5 rounded-full">
                  <span className="text-xs text-gray-400 font-medium">{formatDate(dateMessages[0].createdAt)}</span>
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message, idx) => {
                const isOwn = message.senderId === currentUserId;
                const showAvatar = !isOwn && (idx === 0 || dateMessages[idx - 1]?.senderId !== message.senderId);

                return (
                  <motion.div
                    key={message._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}
                  >
                    {/* Avatar for other user */}
                    {!isOwn && showAvatar && matchInfo.user.photos?.[0]?.url && (
                      <img
                        src={matchInfo.user.photos[0].url}
                        alt={matchInfo.user.firstName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    {!isOwn && showAvatar && !matchInfo.user.photos?.[0]?.url && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">
                          {matchInfo.user.firstName?.[0]}
                        </span>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`max-w-[75%] lg:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-red-600 to-red-800 text-white rounded-br-md'
                          : 'bg-gray-800 text-gray-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-red-200' : 'text-gray-500'}`}>
                        <span className="text-[10px]">{formatTime(message.createdAt)}</span>
                        {isOwn && (
                          <span className="ml-1">
                            {message.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isOtherTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start items-end gap-2"
            >
              {matchInfo.user.photos?.[0]?.url ? (
                <img
                  src={matchInfo.user.photos[0].url}
                  alt={matchInfo.user.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {matchInfo.user.firstName?.[0]}
                  </span>
                </div>
              )}
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-dark-900/95 backdrop-blur-xl border-t border-gray-800/50 px-4 py-3">
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-red-400">
            <Image className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:bg-gray-800 hover:text-red-400'}`}
          >
            <Smile className="w-5 h-5" />
          </button>
          <div className="flex-1"></div>
          <span className="text-xs text-gray-500">Matched on {new Date(matchInfo.matchedAt).toLocaleDateString()}</span>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder={`Message ${matchInfo.user.firstName}...`}
              className="w-full bg-gray-800/80 border border-gray-700 text-white pl-4 pr-4 py-3.5 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-gray-500 text-[15px]"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!newMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-3 rounded-full font-medium transition-all flex items-center justify-center ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30 hover:shadow-red-900/50'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
