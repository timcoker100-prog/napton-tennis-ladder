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
  contact_consent: boolean;
}

interface Match {
  id: string;
  winner_id: string;
  loser_id: string;
  winner_games: number;
  loser_games: number;
  created_at: string;
  winner_name?: string;
  loser_name?: string;
}

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Player | null>(null);
  const [winnerGames, setWinnerGames] = useState(8);
  const [loserGames, setLoserGames] = useState(7);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .order('points', { ascending: false });

    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        *,
        winner:winner_id(name),
        loser:loser_id(name)
      `)
      .order('created_at', { ascending: false });

    setPlayers(playersData || []);
    setMatches(matchesData || []);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const recordMatch = async () => {
    if (!selectedOpponent || winnerGames + loserGames !== 15) {
      alert("Total games must be exactly 15");
      return;
    }

    setLoading(true);

    const winner = currentUser!;
    const loser = selectedOpponent;

    // Insert match
    const { error: matchError } = await supabase
      .from('matches')
      .insert({
        winner_id: winner.id,
        loser_id: loser.id,
        winner_games: winnerGames,
        loser_games: loserGames,
      });

    if (matchError) {
      alert("Error recording match: " + matchError.message);
      setLoading(false);
      return;
    }

    // Update winner points
    await supabase
      .from('players')
      .update({ points: winner.points + winnerGames })
      .eq('id', winner.id);

    // Update loser points
    await supabase
      .from('players')
      .update({ points: loser.points + loserGames })
      .eq('id', loser.id);

    alert(`✅ Match recorded! ${winner.name} ${winnerGames} - ${loserGames} ${loser.name}`);
    
    setShowMatchModal(false);
    setSelectedOpponent(null);
    setWinnerGames(8);
    setLoserGames(7);
    
    await loadData(); // Refresh immediately
    setLoading(false);
  };

  const openMatchModal = (opponent: Player) => {
    if (opponent.id === currentUser?.id) {
      alert("You cannot play against yourself!");
      return;
    }
    setSelectedOpponent(opponent);
    setShowMatchModal(true);
  };

  // Find current user (first one for now - you can improve this later)
  useEffect(() => {
    if (players.length > 0) {
      setCurrentUser(players[0]); // Tim Coker in your screenshot
    }
  }, [players]);

  return (
    <div className="min-h-screen bg-emerald-50 pb-12">
      {/* Header */}
      <div className="bg-emerald-700 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Napton Tennis Club</h1>
          <p className="text-emerald-100">Singles Ladder</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-3">
        <button onClick={loadData} className="flex items-center gap-2 bg-white border border-gray-300 px-5 py-2.5 rounded-3xl hover:bg-gray-50">
          🔄 Refresh
        </button>
        <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 bg-white border border-emerald-600 text-emerald-700 px-5 py-2.5 rounded-3xl hover:bg-emerald-50">
          👤 My Profile
        </button>
        <button onClick={() => setShowMatchModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-3xl hover:bg-emerald-700">
          + Record Match
        </button>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-3xl hover:bg-blue-700">
          📋 How to Use
        </button>
        <button className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-3xl hover:bg-orange-700">
          ⚙️ Admin
        </button>
        <button className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-3xl hover:bg-red-700">
          Logout
        </button>
      </div>

      {/* Current Ladder */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <div className="bg-emerald-700 text-white px-6 py-4 font-semibold text-lg">Current Ladder</div>
          
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Player</th>
                <th className="px-6 py-4 text-left">Points</th>
                <th className="px-6 py-4 text-left">Contact</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{player.name}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-700">{player.points}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      {player.email && <a href={`mailto:${player.email}`} className="text-blue-600 hover:text-blue-800">✉️</a>}
                      {player.phone && <a href={`tel:${player.phone}`} className="text-pink-600 hover:text-pink-800">📞</a>}
                      {player.whatsapp && <a href={`https://wa.me/${player.whatsapp.replace(/\D/g,'')}`} target="_blank" className="text-green-600 hover:text-green-800">💬</a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Record New Match</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 font-medium">You (Winner?)</label>
                <div className="bg-gray-100 p-4 rounded-2xl font-medium">
                  {currentUser?.name || "Loading..."}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium">Opponent</label>
                <select 
                  className="w-full p-4 border border-gray-300 rounded-2xl"
                  onChange={(e) => {
                    const opp = players.find(p => p.id === e.target.value);
                    setSelectedOpponent(opp || null);
                  }}
                >
                  <option value="">Select opponent</option>
                  {players
                    .filter(p => p.id !== currentUser?.id)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Your Games Won</label>
                  <input 
                    type="number" 
                    value={winnerGames} 
                    onChange={(e) => setWinnerGames(Number(e.target.value))}
                    className="w-full p-4 border border-gray-300 rounded-2xl text-2xl text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Opponent Games Won</label>
                  <input 
                    type="number" 
                    value={loserGames} 
                    onChange={(e) => setLoserGames(Number(e.target.value))}
                    className="w-full p-4 border border-gray-300 rounded-2xl text-2xl text-center"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                Total must = 15 games
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowMatchModal(false)}
                className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={recordMatch}
                disabled={loading || !selectedOpponent}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-semibold disabled:opacity-50"
              >
                {loading ? "Recording..." : "Record Match"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}