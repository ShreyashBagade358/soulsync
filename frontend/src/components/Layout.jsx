import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.jsx';
import { useSocketStore } from '../stores/socketStore.jsx';
import { useMessageStore } from '../stores/messageStore.jsx';
import { Heart, MessageCircle, User, Settings, LogOut, Flame, ChevronLeft, Search, Share2, Users, CreditCard, HelpCircle } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { connect, disconnect } = useSocketStore();
  const { fetchUnreadCount, unreadCount } = useMessageStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      connect(user.id);
      fetchUnreadCount();
      
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => {
        disconnect();
        clearInterval(interval);
      };
    }
  }, [user?.id]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/discover': return 'Discover';
      case '/browse': return 'Browse Users';
      case '/matches': return 'Matches';
      case '/messages': return 'Messages';
      case '/profile': return 'My Profile';
      case '/settings': return 'Settings';
      default: return 'SoulSync';
    }
  };

  const showBackButton = location.pathname !== '/discover';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-red-950/30">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-dark-900/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
          )}
          <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            to="/matches" 
            className="relative p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center ring-2 ring-red-500/50 overflow-hidden">
                {user?.profile?.photos?.[0]?.url ? (
                  <img 
                    src={user.profile.photos[0].url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {user?.profile?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                )}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-14 w-72 bg-gradient-to-b from-gray-900 to-red-950/90 rounded-3xl shadow-2xl overflow-hidden z-50 border border-red-900/30">
                {/* Header with Share Button & Avatar */}
                <div className="p-4 flex items-center justify-between">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-red-900/50 hover:bg-red-800/50 rounded-full text-sm font-semibold text-white transition-colors border border-red-800/50">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center ring-[3px] ring-red-500 overflow-hidden">
                      {user?.profile?.photos?.[0]?.url ? (
                        <img 
                          src={user.profile.photos[0].url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-base font-bold">
                          {user?.profile?.firstName?.[0] || user?.email?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="px-2 pb-2">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-900/30 rounded-xl transition-colors text-left"
                  >
                    <User className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                    <span className="text-white font-medium text-base">Profile</span>
                  </button>

                  <button 
                    onClick={() => {
                      navigate('/browse');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-900/30 rounded-xl transition-colors text-left"
                  >
                    <Users className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                    <span className="text-white font-medium text-base">Community</span>
                  </button>

                  <button 
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-900/30 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                      <span className="text-white font-medium text-base">Subscription</span>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold rounded-lg">
                      PRO
                    </span>
                  </button>

                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-900/30 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                    <span className="text-white font-medium text-base">Settings</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-red-900/30"></div>

                {/* Bottom Items */}
                <div className="px-2 py-2">
                  <button 
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-900/30 rounded-xl transition-colors text-left"
                  >
                    <HelpCircle className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                    <span className="text-white font-medium text-base">Help center</span>
                  </button>

                  <button 
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-900/30 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                    <span className="text-white font-medium text-base">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-dark-900/95 backdrop-blur-md border-t border-gray-800 flex items-center justify-around px-4 z-50">
        <Link
          to="/discover"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            isActive('/discover')
              ? 'text-red-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Heart className={`w-6 h-6 ${isActive('/discover') ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Discover</span>
        </Link>

        <Link
          to="/browse"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            isActive('/browse')
              ? 'text-red-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs font-medium">Browse</span>
        </Link>

        <Link
          to="/matches"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${
            isActive('/matches')
              ? 'text-red-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <MessageCircle className={`w-6 h-6 ${isActive('/matches') ? 'fill-current' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Matches</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            isActive('/profile')
              ? 'text-red-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className={`w-6 h-6 ${isActive('/profile') ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Profile</span>
        </Link>

        <Link
          to="/settings"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            isActive('/settings')
              ? 'text-red-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
