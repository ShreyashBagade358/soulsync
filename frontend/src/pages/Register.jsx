import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.jsx';
import { Heart, Mail, Lock, User, Calendar, ChevronRight, ChevronLeft, Sparkles, Check, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    dateOfBirth: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();

  const totalSteps = 3;

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!formData.email || !formData.password) {
          toast.error('Please fill in all fields');
          return false;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        return true;
      case 1:
        if (!formData.firstName || !formData.dateOfBirth || !formData.gender) {
          toast.error('Please fill in all fields');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps - 1) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    clearError();

    const success = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender
    });

    if (success) {
      toast.success('Account created! Complete your profile 🔥');
      navigate('/onboarding');
    } else {
      toast.error(error || 'Registration failed');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Start your journey to find love</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-12"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Create a strong password"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">About You</h2>
              <p className="text-gray-400">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Your first name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'male', label: 'Male', emoji: '♂️' },
                    { value: 'female', label: 'Female', emoji: '♀️' },
                    { value: 'non-binary', label: 'Non-binary', emoji: '⚧' },
                    { value: 'other', label: 'Other', emoji: '🏳️‍🌈' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, gender: option.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.gender === option.value
                          ? 'border-red-500 bg-red-900/30'
                          : 'border-dark-400 bg-dark-600 hover:border-red-500/50'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{option.emoji}</span>
                      <span className="font-medium text-gray-300">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto shadow-red-glow">
              <Check className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Go!</h2>
              <p className="text-gray-400">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
            </div>

            <div className="bg-dark-600 rounded-xl p-4 text-left border border-dark-400">
              <h3 className="font-semibold text-red-400 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  Complete your profile with photos
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  Share your interests and hobbies
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  Tell us your favorite movies & shows
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  Start matching with compatible people
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-900">
      {/* Left Side - Dark Red Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 via-red-950 to-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(153,27,27,0.2)_0%,transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-red-glow-lg">
              <Flame className="w-16 h-16 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 text-center text-gradient"
          >
            Join SoulSync
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400 text-center max-w-md"
          >
            Create meaningful connections based on shared interests, movies, and hobbies
          </motion.p>
        </div>
        
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-900/20 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-800/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-900">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-red-glow">
              <Flame className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">SoulSync</h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Step {step + 1} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-dark-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="modal-dark p-8 rounded-2xl min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className={`btn-secondary flex items-center gap-2 ${step === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : step === totalSteps - 1 ? (
                  <>
                    Create Account
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
