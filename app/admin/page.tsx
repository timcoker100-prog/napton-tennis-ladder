'use client';
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = "ADMIN2026";

type Player = {
  id: string;
  name: string;
  email?: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState("");

  const loadPlayers = () => {
    const saved = localStorage.getItem('players');
    if (saved) setPlayers(JSON.parse(saved));
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      loadPlayers();
    } else {
      setMessage("❌ Incorrect admin password");
    }
  };

  const removePlayer = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the ladder?`)) return;

    const updated = players.filter(p => p.id !== id);
    localStorage.setItem('players', JSON.stringify(updated));
    setPlayers(updated);
    setMessage(`✅ Removed ${name}`);
  };

  const resetLadder = () => {
    if (!confirm("⚠️ Delete ALL players and matches?")) return;
    if (!confirm("FINAL WARNING - Type 'RESET' to confirm")) return;

    localStorage.clear();
    setMessage("✅ Ladder completely reset");
    setTimeout(() => window.location.href = '/ladder', 1500);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Admin Access</h1>
          <input type="password" placeholder="Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border rounded-2xl mb-6" />
          <button onClick={handleLogin} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-semibold">Login as Admin</button>
          {message && <p className="text-red-600 text-center mt-4">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-700">Admin Dashboard</h1>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Players ({players.length})</h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {players.map(player => (
              <div key={player.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <span>{player.name} {player.email && `(${player.email})`}</span>
                <button 
                  onClick={() => removePlayer(player.id, player.name)}
                  className="text-red-600 hover:text-red-700 font-medium px-4 py-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-50 border border-red-300 rounded-3xl p-8 text-center">
          <button onClick={resetLadder} className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-bold text-xl">
            RESET ENTIRE LADDER
          </button>
        </div>

        <div className="mt-10 text-center">
          <a href="/ladder" className="inline-block bg-emerald-600 text-white px-10 py-4 rounded-2xl font-medium hover:bg-emerald-700">
            ← Back to Ladder
          </a>
        </div>

        {message && <p className="text-center mt-8 text-green-600 font-medium">{message}</p>}
      </div>
    </div>
  );
}