'use client';
import { useEffect, useState } from 'react';

const ADMIN_PASSWORD = "ADMIN2026";   // ← Change this to your admin password

type Match = {
  id: string;
  winnerName: string;
  loserName: string;
  winnerGames: number;
  loserGames: number;
  date: string;
};

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("❌ Incorrect admin password");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Load mock match history
      const mockMatches = [
        { id: "1", winnerName: "Sarah Chen", loserName: "John Smith", winnerGames: 9, loserGames: 6, date: "2025-05-08" },
        { id: "2", winnerName: "Mike Thompson", loserName: "Sarah Chen", winnerGames: 8, loserGames: 7, date: "2025-05-07" },
      ];
      setMatches(mockMatches);
    }
  }, [isAuthenticated]);

  const resetLadder = () => {
    if (!confirm("Reset the entire ladder? This cannot be undone.")) return;
    alert("✅ Ladder has been reset (mock mode)");
    window.location.reload();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border rounded-lg text-lg mb-6"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg font-medium text-lg"
          >
            Login to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-700">Admin Dashboard</h1>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-gray-500 hover:text-red-600"
        >
          Logout
        </button>
      </div>

      <button
        onClick={resetLadder}
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium mb-10"
      >
        🔄 Reset Entire Ladder
      </button>

      <h2 className="text-2xl font-bold mb-6">Match History</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Match Result</th>
              <th className="p-4 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(m => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{m.date}</td>
                <td className="p-4 font-medium">{m.winnerName} defeated {m.loserName}</td>
                <td className="p-4">{m.winnerGames} - {m.loserGames}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}