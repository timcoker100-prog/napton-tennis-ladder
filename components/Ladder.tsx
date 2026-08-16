'use client';

import { useState, useEffect, useRef } from 'react';
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
  id: number;
  player_a: string;
  player_b: string;
  player_a_games: number;
  player_b_games: number;
  created_at: string;
}

const ADMIN_CODE = 'ADMIN2026';
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player1Games, setPlayer1Games] = useState(0);
  const [player2Games, setPlayer2Games] = useState(0);
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);
  const isSubmittingMatchRef = useRef(false);

  const [adminPlayer1, setAdminPlayer1] = useState('');
  const [adminPlayer2, setAdminPlayer2] = useState('');
  const [adminPlayer1Games, setAdminPlayer1Games] = useState(0);
  const [adminPlayer2Games, setAdminPlayer2Games] = useState(0);
  const [isSubmittingAdminMatch, setIsSubmittingAdminMatch] = useState(false);
  const isSubmittingAdminMatchRef = useRef(false);

  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');

  // Page protection
  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      window.location.href = '/login';
    }
  }, []);

  // Auto logout after 2 minutes inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert("⏰ You've been logged out due to inactivity (2 minutes).");
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  const loadData = async () => {
    const { data: pData } = await supabase.from('players').select('*');
    const { data: mData } = await supabase.from('matches').select('*');

    setPlayers(pData || []);

    const currentIds = new Set((pData || []).map(p => p.id));
    const validMatches = (mData || []).filter(m =>
      currentIds.has(m.player_a) && currentIds.has(m.player_b)
    );
    setMatches(validMatches);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const hasPlayedBefore = (p1Id: string, p2Id: string) => {
    return matches.some(m =>
      (m.player_a === p1Id && m.player_b === p2Id) ||
      (m.player_a === p2Id && m.player_b === p1Id)
    );
  };

  const handleAdmin = () => {
    const code = prompt("Enter Admin Code:");
    if (code === ADMIN_CODE) setShowAdminModal(true);
    else if (code) alert("❌ Wrong admin code");
  };

  const openProfile = () => {
    const userEmail = prompt("Enter your email to edit profile:");
    if (!userEmail) return;
    const user = players.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setEditWhatsapp(user.whatsapp || '');
      setShowProfileModal(true);
    } else {
      alert("Email not found.");
    }
  };

  const saveProfile = async () => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('players')
      .update({ 
        name: editName.trim(), 
        phone: editPhone.trim() || null, 
        whatsapp: editWhatsapp.trim() || null 
      })
      .eq('id', currentUser.id);

    if (error) alert("Error updating profile");
    else {
      alert("✅ Profile updated successfully");
      setShowProfileModal(false);
      loadData();
    }
  };

  const resetAllData = async () => {
    if (!confirm("⚠️ Delete ALL players and ALL matches?\n\nThis cannot be undone!")) return;
    await supabase.from('matches').delete().gte('id', 0);
    await supabase.from('players').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    setPlayers([]);
    setMatches([]);
    alert("✅ Ladder has been completely reset");
    loadData();
  };

  const removePlayer = async (email: string) => {
    if (!confirm("Remove this player and all their matches?")) return;
    const player = players.find(p => p.email === email);
    if (player) {
      await supabase.from('matches').delete().or(`player_a.eq.${player.id},player_b.eq.${player.id}`);
    }
    await supabase.from('players').delete().eq('email', email);
    loadData();
  };

  const submitMatch = async (
    p1Id: string,
    p2Id: string,
    p1Games: number,
    p2Games: number,
    onDone: () => void
  ) => {
    if (!p1Id || !p2Id || p1Id === p2Id) {
      alert("Select two different players");
      return;
    }
    if (hasPlayedBefore(p1Id, p2Id)) {
      alert("❌ These two players have already played each other");
      return;
    }
    if (p1Games + p2Games !== 15) {
      alert("Total games must be exactly 15");
      return;
    }

    const p1 = players.find(p => p.id === p1Id);
    const p2 = players.find(p => p.id === p2Id);
    if (!p1 || !p2) return;

    const { error: insertError } = await supabase.from('matches').insert({
      player_a: p1.id,
      player_b: p2.id,
      player_a_games: p1Games,
      player_b_games: p2Games,
      status: 'confirmed',
      created_at: new Date().toISOString()
    });

    if (insertError) {
      if (insertError.code === '23505') {
        alert("❌ These two players have already had a result recorded today");
      } else {
        alert("❌ Failed to submit score, please try again");
      }
      loadData();
      return;
    }

    await supabase.from('players').update({ points: p1.points + p1Games }).eq('id', p1.id);
    await supabase.from('players').update({ points: p2.points + p2Games }).eq('id', p2.id);

    alert("✅ Score submitted successfully!");
    onDone();
    loadData();
  };

  const recordMatch = async () => {
    if (isSubmittingMatchRef.current) return;
    isSubmittingMatchRef.current = true;
    setIsSubmittingMatch(true);
    try {
      await submitMatch(player1, player2, player1Games, player2Games, () => {
        setShowMatchModal(false);
        setPlayer1(''); setPlayer2('');
        setPlayer1Games(0); setPlayer2Games(0);
      });
    } finally {
      isSubmittingMatchRef.current = false;
      setIsSubmittingMatch(false);
    }
  };

  const recordAdminMatch = async () => {
    if (isSubmittingAdminMatchRef.current) return;
    isSubmittingAdminMatchRef.current = true;
    setIsSubmittingAdminMatch(true);
    try {
      await submitMatch(adminPlayer1, adminPlayer2, adminPlayer1Games, adminPlayer2Games, () => {
        setAdminPlayer1(''); setAdminPlayer2('');
        setAdminPlayer1Games(0); setAdminPlayer2Games(0);
      });
    } finally {
      isSubmittingAdminMatchRef.current = false;
      setIsSubmittingAdminMatch(false);
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
          <button onClick={() => setShowMatchModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">🎾 Record Match</button>
          <button onClick={() => setShowHowToUse(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">📖 How to Use</button>
          <button onClick={openProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">👤 Profile</button>
          <button onClick={handleAdmin} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl">🔧 Admin</button>
          <button onClick={() => { localStorage.removeItem('isLoggedIn'); window.location.href = '/login'; }} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl">Logout</button>
        </div>

        {/* Current Ladder */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
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

        {/* Recent Matches */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-emerald-700 text-white p-6">
            <h2 className="text-3xl font-bold">Recent Matches</h2>
          </div>
          <div className="p-6 space-y-3">
            {matches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No matches yet</p>
            ) : (
              matches.slice(-10).reverse().map((m) => {
                const aName = players.find(p => p.id === m.player_a)?.name || 'Unknown';
                const bName = players.find(p => p.id === m.player_b)?.name || 'Unknown';
                const aWon = m.player_a_games > m.player_b_games;
                const winnerName = aWon ? aName : bName;
                const loserName = aWon ? bName : aName;
                const winnerGames = aWon ? m.player_a_games : m.player_b_games;
                const loserGames = aWon ? m.player_b_games : m.player_a_games;
                return (
                  <div key={m.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <div>
                      <span className="font-medium text-emerald-700">{winnerName}</span> beat <span className="font-medium">{loserName}</span>
                    </div>
                    <div className="font-semibold">
                      {winnerGames} - {loserGames}
                    </div>
                    <div className="text-sm text-gray-500">{new Date(m.created_at).toLocaleDateString()}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Edit Your Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone Number</label>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full border rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm mb-1">WhatsApp Number</label>
                <input value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="w-full border rounded-xl px-4 py-3" />
              </div>
            </div>
            <button onClick={saveProfile} className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl">Save Changes</button>
            <button onClick={() => setShowProfileModal(false)} className="w-full mt-3 text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Record Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Record New Match</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1">Player 1</label>
              <select value={player1} onChange={(e) => setPlayer1(e.target.value)} className="w-full border rounded-xl px-4 py-3">
                <option value="">Select Player 1</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1">Player 2</label>
              <select value={player2} onChange={(e) => setPlayer2(e.target.value)} className="w-full border rounded-xl px-4 py-3">
                <option value="">Select Player 2</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm mb-1">{players.find(p => p.id === player1)?.name || "Player 1"} Games Won</p>
                <input type="number" min="0" max="15" value={player1Games} onChange={(e) => setPlayer1Games(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" />
              </div>
              <div>
                <p className="text-sm mb-1">{players.find(p => p.id === player2)?.name || "Player 2"} Games Won</p>
                <input type="number" min="0" max="15" value={player2Games} onChange={(e) => setPlayer2Games(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" />
              </div>
            </div>

            <button onClick={recordMatch} disabled={isSubmittingMatch} className="w-full bg-emerald-600 text-white py-4 rounded-xl disabled:opacity-50">{isSubmittingMatch ? 'Submitting...' : 'Record Match'}</button>
            <button onClick={() => setShowMatchModal(false)} className="w-full mt-3 text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* How to Use Modal */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">How to Use the Ladder</h3>
            <div className="space-y-5 text-gray-700">
              <div>
                <p className="font-semibold">🎾 Arranging a Match:</p>
                <p>1. Use the contact icons (📧 📞 💬) next to each player to message them</p>
                <p>2. Arrange and play your match</p>
                <p>3. Click <strong>"Record Match"</strong> to enter the result</p>
              </div>
              <div>
                <p className="font-semibold">Match Rules:</p>
                <p>• A match consists of <strong>15 games</strong>, with each game worth 1 point</p>
                <p>• For the ladder, you can only claim points once with each opponent</p>
                <p>• You cannot play the same person more than once for ladder scoring</p>
              </div>
              <div>
                <p className="font-semibold">Profile:</p>
                <p>• Click <strong>"Profile"</strong> to update your name or contact details</p>
              </div>
            </div>
            <button onClick={() => setShowHowToUse(false)} className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-xl font-medium">Close</button>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-red-600 mb-6">Admin Panel</h3>

            <div className="mb-6 border rounded-xl p-4">
              <h4 className="font-semibold mb-3">Add Score (Any Two Players)</h4>
              <div className="mb-3">
                <label className="block text-sm mb-1">Player 1</label>
                <select value={adminPlayer1} onChange={(e) => setAdminPlayer1(e.target.value)} className="w-full border rounded-xl px-4 py-3">
                  <option value="">Select Player 1</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Player 2</label>
                <select value={adminPlayer2} onChange={(e) => setAdminPlayer2(e.target.value)} className="w-full border rounded-xl px-4 py-3">
                  <option value="">Select Player 2</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm mb-1">{players.find(p => p.id === adminPlayer1)?.name || "Player 1"} Games Won</p>
                  <input type="number" min="0" max="15" value={adminPlayer1Games} onChange={(e) => setAdminPlayer1Games(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" />
                </div>
                <div>
                  <p className="text-sm mb-1">{players.find(p => p.id === adminPlayer2)?.name || "Player 2"} Games Won</p>
                  <input type="number" min="0" max="15" value={adminPlayer2Games} onChange={(e) => setAdminPlayer2Games(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" />
                </div>
              </div>
              <button onClick={recordAdminMatch} disabled={isSubmittingAdminMatch} className="w-full bg-emerald-600 text-white py-3 rounded-xl disabled:opacity-50">{isSubmittingAdminMatch ? 'Submitting...' : 'Add Score'}</button>
            </div>

            <button onClick={resetAllData} className="w-full bg-red-600 text-white py-4 rounded-xl mb-6 font-medium">❌ Clear All Data (Reset Ladder)</button>
            {players.map(p => (
              <div key={p.email} className="flex justify-between py-3 border-b">
                <span>{p.name}</span>
                <button onClick={() => removePlayer(p.email)} className="text-red-500">Remove</button>
              </div>
            ))}
            <button onClick={() => setShowAdminModal(false)} className="mt-6 w-full text-gray-500">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}