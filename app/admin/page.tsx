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
    if (saved) {
      setPlayers(JSON.parse(saved));
    }
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
    if (!confirm(`Remove ${name} from the ladder? This cannot be undone.`)) return;

    const updated = players.filter(p => p.id !== id);
    localStorage.setItem('players', JSON.stringify(updated));
    setPlayers(updated);
    setMessage(`✅ Removed ${name}`);
  };

  const resetLadder = () => {
    if (!confirm("⚠️ This will delete ALL players and matches!")) return;
    if (!confirm("FINAL WARNING: Type 'RESET' to confirm")) return;

    localStorage.clear();
    setMessage("✅ Entire ladder has been reset");
    setTimeout(() => window.location.href = '/ladder', 1500);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-amber-700">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border rounded-2xl mb-6"
          />
          <button 
            onClick={handleLogin} 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-semibold text-xl"
          >
            Login as Admin
          </button>
          {message && <p className="text-red-600 text-center mt-4">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-700">Admin Dashboard</h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">All Players ({players.length})</h2>
          <div className="space-y-3 max-h-[500px] overflow-auto">
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No players yet</p>
            ) : (
              players.map(player => (
                <div key={player.id} className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl">
                  <div>
                    <div className="font-medium">{player.name}</div>
                    {player.email && <div className="text-sm text-gray-500">{player.email}</div>}
                  </div>
                  <button 
                    onClick={() => removePlayer(player.id, player.name)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2.5 rounded-xl font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-10 text-center">
          <h3 className="text-red-700 font-bold text-xl mb-4">Danger Zone</h3>
          <button 
            onClick={resetLadder}
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-bold text-xl w-full"
          >
            RESET ENTIRE LADDER (Clear Everything)
          </button>
        </div>

        <div className="mt-10 text-center">
          <a href="/ladder" className="inline-block bg-emerald-600 text-white px-10 py-4 rounded-2xl font-medium hover:bg-emerald-700">
            ← Back to Ladder
          </a>
        </div>

        {message && <p className="text-center mt-8 text-green-600 font-medium text-lg">{message}</p>}
      </div>
    </div>
  );
}