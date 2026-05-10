'use client';
import { useState } from 'react';

const ADMIN_PASSWORD = "ADMIN2026";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      setMessage("❌ Incorrect admin password");
    }
  };

  const resetLadder = () => {
    if (confirm("Reset the entire ladder? This cannot be undone.")) {
      localStorage.clear();
      setMessage("✅ Ladder has been reset");
      window.location.reload();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Admin Access</h1>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border rounded-2xl mb-6 text-lg"
          />
          <button onClick={handleLogin} className="w-full bg-amber-600 text-white py-4 rounded-2xl font-semibold text-xl">
            Login as Admin
          </button>
          {message && <p className="text-center mt-4 text-red-600">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-center mb-10 text-amber-700">Admin Dashboard</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-red-700">Danger Zone</h2>
          <button 
            onClick={resetLadder}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-medium text-lg"
          >
            Reset Entire Ladder (Clear All Data)
          </button>
        </div>

        <div className="text-center">
          <a href="/ladder" className="inline-block bg-emerald-600 text-white px-10 py-4 rounded-2xl font-medium hover:bg-emerald-700">
            Back to Ladder
          </a>
        </div>
      </div>
    </div>
  );
}