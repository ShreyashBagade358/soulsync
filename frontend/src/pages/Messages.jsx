import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore.jsx';
import { useSocketStore } from '../stores/socketStore.jsx';
import { Send, ArrowLeft, Heart } from 'lucide-react';
import axios from 'axios';

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

  const matchMessages = messages[matchId] || [];

  useEffect(() => {
    fetchMatchInfo();
    fetchMessages(matchId);
    joinMatch(matchId);

    return () => {
      leaveMatch(matchId);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [matchMessages]);

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

  if (!matchInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button
          onClick={() => navigate('/matches')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex items-center gap-3">
          {matchInfo.user.photos?.[0]?.url ? (
            <img
              src={matchInfo.user.photos[0].url}
              alt={matchInfo.user.firstName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
              <span className="text-xl text-white font-bold">
                {matchInfo.user.firstName?.[0]}
              </span>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-gray-800">
              {matchInfo.user.firstName}
            </h2>
            <p className="text-sm text-gray-500">
              {typingUsers.has(matchInfo.user.id) ? (
                <span className="text-primary-500">typing...</span>
              ) : (
                `${matchInfo.compatibilityScore}% match`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {matchMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              It's a Match!
            </h3>
            <p className="text-gray-500">
              Start the conversation with {matchInfo.user.firstName}
            </p>
          </div>
        ) : (
          matchMessages.map((message, idx) => {
            const isOwn = message.senderId === JSON.parse(localStorage.getItem('auth-storage'))?.state?.user?.id;

            return (
              <div
                key={message._id || idx}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
                    {formatTime(message.createdAt)}
                    {isOwn && message.isRead && '  Read'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 input-field"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary px-4 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Messages;
