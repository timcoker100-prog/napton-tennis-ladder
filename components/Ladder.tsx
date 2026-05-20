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

interface Match {
  id: string;
  winner_name: string;
  loser_name: string;
  winner_games: number;
  loser_games: number;
  date: string;
}

const ADMIN_CODE = 'ADMIN2026';

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Profile form
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');

  // Match form
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [winnerGames, setWinnerGames] = useState(0);
  const [loserGames, setLoserGames] = useState(0);

  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load data from Supabase
  const loadData = async () => {
    const { data: playersData } = await supabase.from('players').select('*');
    const { data: matchesData } = await supabase.from('matches').select('*');
    
    setPlayers(playersData || []);
    setMatches(matchesData || []);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Auto refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Save / Update Profile
  const saveProfile = async () => {
    if (!profileName.trim()) {
      alert("Name is required");
      return;
    }

    const { error } = await supabase
      .from('players')
      .upsert({
        email: currentUser?.email,
        name: profileName.trim(),
        phone: profilePhone.trim() || null,
        whatsapp: profileWhatsapp.trim() || null,
        points: players.find(p => p.email === currentUser?.email)?.points || 0
      });

    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      alert('✅ Profile saved successfully!');
      setShowProfileModal(false);
      loadData();
    }
  };

  // Record a new match
  const recordMatch = async () => {
    if (!selectedOpponent) {
      alert("Please select an opponent");
      return;
    }
    if (winnerGames + loserGames !== 15) {
      alert("Total games must equal exactly 15");
      return;
    }

    const winner = players.find(p => p.email === currentUser?.email);
    const loser = players.find(p => p.name === selectedOpponent);

    if (!winner || !loser) return alert("Player not found");

    // Prevent playing the same person twice
    const alreadyPlayed = matches.some(m =>
      (m.winner_name === winner.name && m.loser_name === loser.name) ||
      (m.winner_name === loser.name && m.loser_name === winner.name)
    );

    if (alreadyPlayed) {
      alert("You have already played this opponent once!");
      return;
    }

    setLoading(true);

    // Record match
    const { error: matchError } = await supabase.from('matches').insert({
      winner_name: winner.name,
      loser_name: loser.name,
      winner_games: winnerGames,
      loser_games: loserGames,
      date: new Date().toISOString().split('T')[0]
    });

    if (matchError) {
      alert("Error recording match: " + matchError.message);
      setLoading(false);
      return;
    }

    // Update points
    await supabase
      .from('players')
      .update({ points: winner.points + winnerGames })
      .eq('email', winner.email);

    await supabase
      .from('players')
      .update({ points: loser.points + loserGames })
      .eq('email', loser.email);

    alert("✅ Match recorded successfully!");
    setShowMatchModal(false);
    setSelectedOpponent('');
    setWinnerGames(0);
    setLoserGames(0);
    loadData();
    setLoading(false);
  };

  const openProfile = () => {
    const user = players.find(p => p.email === currentUser?.email);
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileWhatsapp(user.whatsapp || '');
    }
    setShowProfileModal(true);
  };

  const handleAdminLogin = () => {
    if (adminCodeInput === ADMIN_CODE) {
      setShowAdminModal(true);
    } else {
      alert("❌ Wrong admin code");
    }
    setAdminCodeInput('');
  };

  const resetAllData = async () => {
    if (!confirm("Delete ALL players and matches? This cannot be undone.")) return;
    await supabase.from('matches').delete().neq('id', '0');
    await supabase.from('players').delete().neq('id', '0');
    loadData();
    alert("All data has been cleared");
  };

  const removePlayer = async (email: string) => {
    if (!confirm("Remove this player?")) return;
    await supabase.from('players').delete().eq('email', email);
    loadData();
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-emerald-800">Napton and Priors Marston</h1>
          <p className="text-emerald-700 text-2xl mt-1">Singles Ladder (Mixed)</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button onClick={loadData} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium">🔄 Refresh</button>
          <button onClick={openProfile} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium">👤 My Profile</button>
          <button onClick={() => setShowMatchModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium">🎾 Record Match</button>
          <button onClick={() => setShowHowToUse(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium">📖 How to Use</button>
          <button onClick={() => setShowAdminModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium">🔧 Admin</button>
          <button onClick={() => window.location.href = '/login'} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium">Logout</button>
        </div>

        {/* Current Ladder */}
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
                  <th className="px-6 py-4 text-center">Admin</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => (
                  <tr key={player.email} className="border-b hover:bg-emerald-50">
                    <td className="px-6 py-4 font-semibold text-lg">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{player.name}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-700 text-xl">{player.points}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-5 text-2xl justify-center">
                        {player.email && <a href={`mailto:${player.email}`} className="hover:scale-110 transition" title="Email">✉️</a>}
                        {player.phone && <a href={`tel:${player.phone}`} className="hover:scale-110 transition" title="Call">📞</a>}
                        {player.whatsapp && (
                          <a 
                            href={`https://wa.me/${player.whatsapp.replace(/\D/g, '')}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition text-green-500"
                            title="WhatsApp"
                          >
                            💬
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => removePlayer(player.email)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedPlayers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">No players yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== PROFILE MODAL ==================== */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold mb-6">My Profile</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-4"
            />
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-4"
            />
            <input
              type="text"
              placeholder="WhatsApp number (optional)"
              value={profileWhatsapp}
              onChange={(e) => setProfileWhatsapp(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-6"
            />
            <button onClick={saveProfile} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium mb-3">
              Save Profile
            </button>
            <button onClick={() => setShowProfileModal(false)} className="w-full text-gray-500 py-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ==================== MATCH MODAL ==================== */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold mb-6">Record New Match</h3>
            
            <select
              value={selectedOpponent}
              onChange={(e) => setSelectedOpponent(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-6"
            >
              <option value="">Select Opponent</option>
              {players
                .filter(p => p.email !== currentUser?.email)
                .map(p => (
                  <option key={p.email} value={p.name}>{p.name}</option>
                ))}
            </select>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">You (Games Won)</p>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={winnerGames}
                  onChange={(e) => setWinnerGames(Number(e.target.value))}
                  className="w-full border rounded-xl px-4 py-3 text-center text-2xl"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Opponent (Games Won)</p>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={loserGames}
                  onChange={(e) => setLoserGames(Number(e.target.value))}
                  className="w-full border rounded-xl px-4 py-3 text-center text-2xl"
                />
              </div>
            </div>

            <button 
              onClick={recordMatch} 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-medium mb-3 disabled:opacity-50"
            >
              {loading ? "Recording..." : "Record Match"}
            </button>
            <button onClick={() => setShowMatchModal(false)} className="w-full text-gray-500 py-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ==================== HOW TO USE MODAL ==================== */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold mb-6">How to Use the Ladder</h3>
            <div className="space-y-4 text-gray-700">
              <p><strong>1.</strong> Register or login using code <strong>N&amp;P2026</strong></p>
              <p><strong>2.</strong> Complete your profile (add phone &amp; WhatsApp if you want to be contacted)</p>
              <p><strong>3.</strong> Arrange a match with another player</p>
              <p><strong>4.</strong> Play 15 games total (not sets)</p>
              <p><strong>5.</strong> Record the result — 1 point per game won</p>
              <p><strong>6.</strong> You can only play each opponent once</p>
            </div>
            <button onClick={() => setShowHowToUse(false)} className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-xl">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ==================== ADMIN MODAL ==================== */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold mb-6 text-red-600">Admin Panel</h3>
            
            <button onClick={resetAllData} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl mb-4 font-medium">
              ❌ Clear All Data (Reset Ladder)
            </button>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Players</h4>
              {players.map(player => (
                <div key={player.email} className="flex justify-between items-center py-2 border-b">
                  <span>{player.name}</span>
                  <button 
                    onClick={() => removePlayer(player.email)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setShowAdminModal(false)} className="mt-8 w-full text-gray-500 py-3">
              Close Admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}