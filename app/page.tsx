'use client';
import Ladder from '../components/Ladder';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const playersData = localStorage.getItem('players');
      const hasProfile = playersData ? JSON.parse(playersData).length > 0 : false;
      setIsLoggedIn(hasProfile);
    } catch (e) {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Logout and clear your session?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white py-4 shadow">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎾</div>
            <div>
              <h1 className="text-2xl font-bold">Napton Tennis Club</h1>
              <p className="text-emerald-100 text-sm">Singles Ladder</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            )}
            <a 
              href="/admin" 
              className="text-sm bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg transition"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      <main>
        <Ladder />
      </main>
    </div>
  );
}