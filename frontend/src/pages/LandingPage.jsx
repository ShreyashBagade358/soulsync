import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lookingFor, setLookingFor] = useState('man');
  const [ageRange, setAgeRange] = useState(25);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Pink Header Background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400" />
      
      {/* Navigation */}
      <nav className="relative z-50 px-8 lg:px-16 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500" fill="#f43f5e" />
            <span className="text-2xl font-bold text-rose-500">SoulSync</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-white">
            <a href="#" className="hover:text-rose-100 transition-colors font-medium border-b-2 border-white">Home</a>
            <a href="#" className="hover:text-rose-100 transition-colors font-medium">Contact</a>
            <a href="#" className="hover:text-rose-100 transition-colors font-medium">About</a>
            <a href="#" className="hover:text-rose-100 transition-colors font-medium flex items-center gap-1">
              Reviews
              <Search className="w-4 h-4" />
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-white hover:text-rose-100 font-medium transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-all shadow-lg"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg p-6"
          >
            <div className="flex flex-col gap-4">
              <a href="#" className="text-rose-500 font-medium">Home</a>
              <a href="#" className="text-gray-600">Contact</a>
              <a href="#" className="text-gray-600">About</a>
              <a href="#" className="text-gray-600">Reviews</a>
              <hr className="border-gray-200" />
              <button onClick={() => navigate('/login')} className="text-gray-600 text-left">Log In</button>
              <button onClick={() => navigate('/register')} className="text-rose-500 text-left">Sign Up</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-8 lg:px-16 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-0 items-start">
            {/* Left Content - White Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-br-[100px] pr-8 pb-16 pt-8"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Dating For you
              </h1>
              
              <p className="text-gray-500 text-base mb-8 max-w-md leading-relaxed">
                Dating is a stage of romantic relationships in humans whereby two people meet socially with the aim of each assessing the other's suitability as a prospective partner in an intimate relationship. It is a form of courtship, consisting of social activities done by the couple, either alone or with others.
              </p>

              {/* Floating Hearts Decoration */}
              <div className="flex gap-4 mb-8">
                <span className="text-pink-300 text-2xl">♥</span>
                <span className="text-pink-300 text-xl">♥</span>
                <span className="text-pink-300 text-lg">♥</span>
              </div>

              {/* Search Form */}
              <div className="mb-8">
                <h3 className="text-gray-700 font-semibold mb-3 text-lg">Looking for</h3>
                <div className="flex gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="man"
                      checked={lookingFor === 'man'}
                      onChange={(e) => setLookingFor(e.target.value)}
                      className="w-4 h-4 text-rose-500 border-gray-300 focus:ring-rose-500"
                    />
                    <span className="text-gray-600">Man</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="woman"
                      checked={lookingFor === 'woman'}
                      onChange={(e) => setLookingFor(e.target.value)}
                      className="w-4 h-4 text-rose-500 border-gray-300 focus:ring-rose-500"
                    />
                    <span className="text-gray-600">Woman</span>
                  </label>
                </div>

                <h3 className="text-gray-700 font-semibold mb-3 text-lg">Age</h3>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-500 font-medium">18</span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow"></div>
                  </div>
                  <span className="text-gray-500 font-medium">80</span>
                </div>

                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-all shadow-lg"
                >
                  Find Now
                </button>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                {/* Dots decoration */}
                <div className="flex gap-1 ml-4">
                  <div className="w-2 h-2 bg-rose-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-rose-300 rounded-full"></div>
                  <div className="w-2 h-2 border-2 border-rose-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-rose-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-rose-300 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Couple Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-full min-h-[600px]"
            >
              {/* Curved Separator */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
              
              {/* Pink Background Area */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 rounded-bl-[100px]">
                {/* Decorative Plants */}
                <div className="absolute bottom-0 left-0 right-0 h-48 flex items-end justify-center">
                  {/* Plant silhouettes */}
                  <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                    <path d="M0,150 Q50,100 80,120 T150,80 T220,100 T300,60 T400,100 L400,150 Z" fill="#be185d" opacity="0.3"/>
                  </svg>
                </div>

                {/* Floating Hearts */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-20 left-20"
                >
                  <Heart className="w-6 h-6 text-pink-400" fill="#f472b6" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute top-32 right-20"
                >
                  <Heart className="w-5 h-5 text-rose-400" fill="#fb7185" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-40 left-10"
                >
                  <Heart className="w-4 h-4 text-pink-300" fill="#f9a8d4" />
                </motion.div>

                {/* Couple Emoji/Illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-9xl mb-4">👫</div>
                    <div className="flex justify-center gap-2">
                      <Heart className="w-6 h-6 text-rose-500" fill="#f43f5e" />
                      <Heart className="w-6 h-6 text-pink-500" fill="#ec4899" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
