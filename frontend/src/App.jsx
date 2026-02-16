import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore.jsx';
import Layout from './components/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Discover from './pages/Discover.jsx';
import Browse from './pages/Browse.jsx';
import Matches from './pages/Matches.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import './App.css';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-dark-900">
        <Routes>
          <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/discover" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/discover" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} />
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/discover" />} />
            <Route path="discover" element={<Discover />} />
            <Route path="browse" element={<Browse />} />
            <Route path="matches" element={<Matches />} />
            <Route path="messages/:matchId" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
