'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Player {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  points: number;
}

const ADMIN_CODE = 'ADMIN2026';

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Match form
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [winnerGames, setWinnerGames] = useState(0);
  const [loserGames, setLoserGames] = useState(0);

  const loadData = async () => {
    const { data } = await supabase.from('players').select('*');
    setPlayers(data || []);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAdmin = () => {
    const code = prompt("Enter Admin Code:");
    if (code === ADMIN_CODE) {
      setShowAdminModal(true);
    } else if (code) {
      alert("❌ Wrong admin code");
    }
  };

  const resetAllData = async () => {
    if (!confirm("Clear ALL players and matches?")) return;
    await supabase.from('players').delete().neq('id', '0');
    await supabase.from('matches').delete().neq('id', '0');
    loadData();
    alert("✅ Ladder has been fully reset");
  };

  const removePlayer = async (email: string) => {
    if (!confirm("Remove this player?")) return;
    await supabase.from('players').delete().eq('email', email);
    loadData();
  };

  const recordMatch = async () => {
    if (!selectedOpponent || winnerGames + loserGames !== 15) {
      alert("Total games must be exactly 15");
      return;
    }

    const winnerEmail = prompt("Enter your email to record match:");
    if (!winnerEmail) return;

    const winner = players.find(p => p.email.toLowerCase() === winnerEmail.toLowerCase());
    const loser = players.find(p => p.name === selectedOpponent);

    if (!winner || !loser) {
      alert("Player not found");
      return;
    }

    const { error } = await supabase.from('matches').insert({
      winner_name: winner.name,
      loser_name: loser.name,
      winner_games: winnerGames,
      loser_games: loserGames,
      date: new Date().toISOString().split('T')[0]
    });

    if (error) {
      alert("Error recording match");
    } else {
      alert("✅ Match recorded!");
      setShowMatchModal(false);
      setSelectedOpponent('');
      setWinnerGames(0);
      setLoserGames(0);
      loadData();
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-emerald-800">Napton and Priors Marston</h1>
          <p className="text-emerald-700 text-2xl mt-1">Singles Ladder (Mixed)</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button onClick={loadData} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">🔄 Refresh</button>
          <button onClick={() => alert("Profile editing coming soon")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">👤 My Profile</button>
          <button onClick={() => setShowMatchModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">🎾 Record Match</button>
          <button onClick={() => setShowHowToUse(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">📖 How to Use</button>
          <button onClick={handleAdmin} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl">🔧 Admin</button>
          <button onClick={() => window.location.href = '/login'} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl">Logout</button>
        </div>

        {/* Ladder Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-emerald-700 text-white p-6">
            <h2 className="text-3xl font-bold">Current Ladder</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-100">
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Player</th>
                  <th className="px-6 py-4 text-center">Points</th>
                  <th className="px-6 py-4 text-center">Contact</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="border-b hover:bg-emerald-50">
                    <td className="px-6 py-4 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{player.name}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-700">{player.points}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 justify-center text-2xl">
                        {player.email && <a href={`mailto:${player.email}`} title="Email">✉️</a>}
                        {player.phone && <a href={`tel:${player.phone}`} title="Call">📞</a>}
                        {player.whatsapp && <a href={`https://wa.me/${player.whatsapp.replace(/\D/g,'')}`} target="_blank" title="WhatsApp">💬</a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-red-600 mb-6">Admin Panel</h3>
            
            <button onClick={resetAllData} className="w-full bg-red-600 text-white py-4 rounded-xl mb-6 font-medium">
              ❌ Clear All Data (Reset Ladder)
            </button>

            <h4 className="font-semibold mb-3">Players</h4>
            {players.map(player => (
              <div key={player.email} className="flex justify-between items-center py-2 border-b">
                <span>{player.name}</span>
                <button onClick={() => removePlayer(player.email)} className="text-red-500 hover:underline">Remove</button>
              </div>
            ))}

            <button onClick={() => setShowAdminModal(false)} className="mt-8 w-full py-3 text-gray-500">Close Admin</button>
          </div>
        </div>
      )}

      {/* Record Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Record New Match</h3>
            <select value={selectedOpponent} onChange={(e) => setSelectedOpponent(e.target.value)} className="w-full border rounded-xl px-4 py-3 mb-6">
              <option value="">Select Opponent</option>
              {players.map(p => (
                <option key={p.email} value={p.name}>{p.name}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm mb-2">You (Games Won)</p>
                <input type="number" value={winnerGames} onChange={(e) => setWinnerGames(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" min="0" max="15" />
              </div>
              <div>
                <p className="text-sm mb-2">Opponent (Games Won)</p>
                <input type="number" value={loserGames} onChange={(e) => setLoserGames(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" min="0" max="15" />
              </div>
            </div>

            <button onClick={recordMatch} className="w-full bg-emerald-600 text-white py-4 rounded-xl mb-3">Record Match</button>
            <button onClick={() => setShowMatchModal(false)} className="w-full py-3 text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* How to Use Modal */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">How to Use</h3>
            <p className="mb-4">• Play 15 games total (not sets)</p>
            <p className="mb-4">• 1 point per game won</p>
            <p className="mb-4">• You can only play each opponent once</p>
            <button onClick={() => setShowHowToUse(false)} className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}