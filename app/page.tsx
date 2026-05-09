'use client';
import Ladder from '../components/Ladder';
import { useState, useEffect } from 'react';

export default function Home() {
  const [showLogout, setShowLogout] = useState(true); // Always show for now

  const handleLogout = () => {
    if (confirm("Logout from the ladder?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white py-5 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎾</div>
            <div>
              <h1 className="text-3xl font-bold">Napton Tennis Club</h1>
              <p className="text-emerald-100">Singles Ladder</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="/admin" 
              className="px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
            >
              Admin
            </a>

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        <Ladder />
      </main>
    </div>
  );
}