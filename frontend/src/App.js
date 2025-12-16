// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Transfers from './components/Transfers';
import Assignments from './components/Assignment';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Simulate loading time for visual effect
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden flex flex-col items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        </div>

        {/* Loading Animation */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Container */}
          <div className="mb-8 relative">
            {/* Outer rotating ring */}
            <div className="w-40 h-40 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
            
            {/* Middle rotating ring (counter-clockwise) */}
            <div className="absolute top-3 left-3 w-34 h-34 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
            
            {/* Inner rotating ring */}
            <div className="absolute top-6 left-6 w-28 h-28 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{animationDuration: '3s'}}></div>
            
            {/* Center pulsing circle with logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 animate-pulse shadow-lg shadow-emerald-500/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Orbiting dots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-full animate-spin" style={{animationDuration: '4s'}}></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-spin" style={{animationDuration: '5s', animationDirection: 'reverse'}}></div>
            </div>
          </div>

          {/* Brand Name */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-black text-white mb-2 tracking-[6px] drop-shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse">
              MILASSET
            </h1>
            <p className="text-emerald-400 text-sm font-bold uppercase tracking-[3px]">
              Military Asset Management
            </p>
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <p className="text-emerald-400 font-bold text-lg mb-3 animate-pulse">
              Initializing System...
            </p>
            
            {/* Loading Dots */}
            <div className="flex gap-2 justify-center">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 w-64 h-2 bg-[#1f2937] rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 animate-loading-bar rounded-full"></div>
          </div>

          {/* Status Messages */}
          <div className="mt-8 space-y-2 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Loading authentication module...</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Establishing secure connection...</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Verifying system integrity...</span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes loading-bar {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .animate-loading-bar {
            animation: loading-bar 1.5s ease-in-out infinite;
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            }
          />

          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/purchases"
            element={
              isAuthenticated ? <Purchases user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/transfers"
            element={
              isAuthenticated ? <Transfers user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/assignments"
            element={
              isAuthenticated ? <Assignments user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />

          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;