'use client';

import { useState } from 'react';

export default function AuthButtons() {
  const [isAuthenticated] = useState(false); // TODO: Implement proper auth state management

  const handleLogin = () => {
    window.location.href = '/api/auth/[auth0]?action=login';
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/[auth0]?action=logout';
  };

  return (
    <div className="flex items-center space-x-4" suppressHydrationWarning>
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <span className="text-white">Welcome, User!</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25"
        >
          Login
        </button>
      )}
    </div>
  );
}