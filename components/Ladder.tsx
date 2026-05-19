'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Player {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  points: number;
  contact_consent: boolean;
}

interface Match {
  id: string;
  winner_id: string;
  loser_id: string;
  winner_name: string;
  loser_name: string;
  winner_games: number;
  loser_games: number;
  date: string;
  created_at: string;
}

const ADMIN_CODE = 'ADMIN2026';

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedOpponent, setSelectedOpponent] = useState<Player | null>(null);
  const [winnerGames, setWinnerGames] = useState(8);
  const [loserGames, setLoserGames] = useState(7);
  const [loading, setLoading] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');

  const loadData = async () => {
    const { data: playersData } = await supabase.from('players').select('*').order('points', { ascending: false });
    const { data: matchesData } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
    setPlayers(playersData || []);
    setMatches(matchesData || []);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      setCurrentUser(players[0]);
      setProfileName(players[0].name);
      setProfilePhone(players[0].phone || '');
      setProfileWhatsapp(players[0].whatsapp || '');
    }
  }, [players]);

  // Check if these two players have already played
  const hasPlayedBefore = (player1Id: string, player2Id: string) => {
    return matches.some(m => 
      (m.winner_id === player1Id && m.loser_id === player2Id) ||
      (m.winner_id === player2Id && m.loser_id === player1Id)
    );
  };

  const recordMatch = async () => {
    if (!selectedOpponent) return;
    if (winnerGames + loserGames !== 15) {
      alert("Total games must be exactly 15");
      return;
    }
    if (hasPlayedBefore(currentUser!.id, selectedOpponent.id)) {
      alert("You have already played this opponent!");
      return;
    }

    setLoading(true);
    const winner = currentUser!;
    const loser = selectedOpponent;
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('matches').insert({
      winner_id: winner.id,
      loser_id: loser.id,
      winner_name: winner.name,
      loser_name: loser.name,
      winner_games: winnerGames,
      loser_games: loserGames,
      date: today,
    });

    if (!error) {
      await supabase.from('players').update({ points: winner.points + winnerGames }).eq('id', winner.id);
      await supabase.from('players').update({ points: loser.points + loserGames }).eq('id', loser.id);
      alert(`✅ Match recorded! ${winner.name} ${winnerGames} - ${loserGames} ${loser.name}`);
    } else {
      alert("Error: " + error.message);
    }

    setShowMatchModal(false);
    setSelectedOpponent(null);
    setWinnerGames(8);
    setLoserGames(7);
    await loadData();
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!currentUser) return;
    const { error } = await supabase.from('players').update({
      name: profileName,
      phone: profilePhone || null,
      whatsapp: profileWhatsapp || null,
    }).eq('id', currentUser.id);

    if (error) alert("Error saving profile");
    else {
      alert("✅ Profile saved!");
      setShowProfileModal(false);
      await loadData();
    }
  };

  const handleAdminLogin = () => {
    if (adminCodeInput === ADMIN_CODE) {
      setIsAdmin(true);
      alert("✅ Admin access granted");
    } else {
      alert("❌ Wrong code");
    }
  };

  const resetAllData = async () => {
    if (!confirm("Delete ALL data?")) return;
    await supabase.from('matches').delete().neq('id', '0');
    await supabase.from('players').delete().neq('id', '0');
    alert("All data reset");
    await loadData();
  };

  const removePlayer = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    await supabase.from('matches').delete().or(`winner_id.eq.${id},loser_id.eq.${id}`);
    await supabase.from('players').delete().eq('id', id);
    alert(`${name} removed`);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-emerald-50 pb-12">
      <div className="bg-emerald-700 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Napton Tennis Club</h1>
          <p className="text-emerald-100">Singles Ladder</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-3">
        <button onClick={loadData} className="flex items-center gap-2 bg-white border border-gray-300 px-5 py-2.5 rounded-3xl hover:bg-gray-50">🔄 Refresh</button>
        <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 bg-white border border-emerald-600 text-emerald-700 px-5 py-2.5 rounded-3xl hover:bg-emerald-50">👤 My Profile</button>
        <button onClick={() => setShowMatchModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-3xl hover:bg-emerald-700">+ Record Match</button>
        <button onClick={() => setShowHowToUse(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-3xl hover:bg-blue-700">📋 How to Use</button>
        <button onClick={() => setShowAdminModal(true)} className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-3xl hover:bg-orange-700">⚙️ Admin</button>
        <button onClick={() => { alert("Logged out"); window.location.href = "/login"; }} className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-3xl hover:bg-red-700">Logout</button>
      </div>

      {/* Ladder Table */}
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
                    <div className="flex gap-4">
                      {player.email && <a href={`mailto:${player.email}`} className="text-xl">✉️</a>}
                      {player.phone && <a href={`tel:${player.phone}`} className="text-xl">📞</a>}
                      {player.whatsapp && <a href={`https://wa.me/${player.whatsapp.replace(/\D/g,'')}`} target="_blank" className="text-xl">💬</a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {matches.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
            <div className="space-y-3">
              {matches.slice(0, 10).map((m) => (
                <div key={m.id} className="flex justify-between bg-gray-50 p-4 rounded-2xl">
                  <div><span className="font-medium">{m.winner_name}</span> beat <span className="font-medium">{m.loser_name}</span></div>
                  <div className="text-right text-sm">{m.winner_games}-{m.loser_games} • {m.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Modals (Profile, Match, How to Use, Admin) */}
      {/* Profile Modal */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full p-4 border rounded-2xl mb-4" placeholder="Name" />
            <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full p-4 border rounded-2xl mb-4" placeholder="Phone (optional)" />
            <input type="tel" value={profileWhatsapp} onChange={(e) => setProfileWhatsapp(e.target.value)} className="w-full p-4 border rounded-2xl mb-6" placeholder="WhatsApp (optional)" />
            <div className="flex gap-3">
              <button onClick={() => setShowProfileModal(false)} className="flex-1 py-4 border rounded-2xl">Cancel</button>
              <button onClick={saveProfile} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Record New Match</h2>
            <div className="space-y-6">
              <div><label className="block text-sm mb-2">You</label><div className="bg-gray-100 p-4 rounded-2xl font-medium">{currentUser?.name}</div></div>
              <div>
                <label className="block text-sm mb-2">Opponent</label>
                <select className="w-full p-4 border rounded-2xl" onChange={(e) => setSelectedOpponent(players.find(p => p.id === e.target.value) || null)}>
                  <option value="">Select opponent</option>
                  {players.filter(p => p.id !== currentUser?.id).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label>Your Games Won</label><input type="number" value={winnerGames} onChange={(e) => setWinnerGames(Number(e.target.value))} className="w-full p-4 border rounded-2xl text-3xl text-center" /></div>
                <div><label>Opponent Games Won</label><input type="number" value={loserGames} onChange={(e) => setLoserGames(Number(e.target.value))} className="w-full p-4 border rounded-2xl text-3xl text-center" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowMatchModal(false)} className="flex-1 py-4 border rounded-2xl">Cancel</button>
              <button onClick={recordMatch} disabled={loading || !selectedOpponent} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl disabled:opacity-50">
                {loading ? "Recording..." : "Record Match"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Use Modal */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">How to Use</h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <p><strong>1.</strong> Register with code <strong>N&P2026</strong></p>
              <p><strong>2.</strong> Play exactly <strong>15 games</strong> total (not sets)</p>
              <p><strong>3.</strong> Record score (e.g. 8-7, 9-6)</p>
              <p><strong>4.</strong> 1 point per game won</p>
              <p><strong>5.</strong> You can only play each opponent <strong>once</strong></p>
            </div>
            <button onClick={() => setShowHowToUse(false)} className="mt-8 w-full py-4 bg-emerald-600 text-white rounded-2xl">Close</button>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            {!isAdmin ? (
              <>
                <input type="password" value={adminCodeInput} onChange={(e) => setAdminCodeInput(e.target.value)} placeholder="Enter ADMIN2026" className="w-full p-4 border rounded-2xl mb-4" />
                <button onClick={handleAdminLogin} className="w-full py-4 bg-orange-600 text-white rounded-2xl">Login as Admin</button>
              </>
            ) : (
              <div className="space-y-4">
                <button onClick={resetAllData} className="w-full py-4 bg-red-600 text-white rounded-2xl">Reset ALL Data</button>
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Remove Player</h3>
                  {players.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl mb-2">
                      <span>{p.name}</span>
                      <button onClick={() => removePlayer(p.id, p.name)} className="text-red-600 text-sm">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => { setShowAdminModal(false); setIsAdmin(false); setAdminCodeInput(''); }} className="mt-6 w-full py-4 border rounded-2xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}