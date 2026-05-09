'use client';
import { useState, useEffect } from 'react';
import Ladder from '../components/Ladder';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    if (confirm("Logout from the ladder?")) {
      localStorage.removeItem('currentUser');
      setIsLoggedIn(false);
      setCurrentUser(null);
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
            {isLoggedIn ? (
              <>
                <span className="text-sm">Hi, {currentUser?.name}</span>
                <a 
                  href="/admin" 
                  className="px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium"
                >
                  Admin
                </a>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="text-sm">Please login / register</div>
            )}
          </div>
        </div>
      </header>

      <Ladder onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}