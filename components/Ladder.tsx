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
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player1Games, setPlayer1Games] = useState(0);
  const [player2Games, setPlayer2Games] = useState(0);

  // ====================== AUTO LOGOUT AFTER 10 MINUTES ======================
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert("⏰ You've been logged out due to 10 minutes of inactivity.");
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
  // =====================================================================

  const loadData = async () => {
    const { data: pData } = await supabase.from('players').select('*');
    const { data: mData } = await supabase.from('matches').select('*');

    setPlayers(pData || []);

    const currentNames = new Set((pData || []).map(p => p.name));
    const validMatches = (mData || []).filter(m => 
      currentNames.has(m.winner_name) && currentNames.has(m.loser_name)
    );
    setMatches(validMatches);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const hasPlayedBefore = (p1: string, p2: string) => {
    return matches.some(m => 
      (m.winner_name === p1 && m.loser_name === p2) || 
      (m.winner_name === p2 && m.loser_name === p1)
    );
  };

  const handleAdmin = () => {
    const code = prompt("Enter Admin Code:");
    if (code === ADMIN_CODE) setShowAdminModal(true);
    else if (code) alert("❌ Wrong admin code");
  };

  const resetAllData = async () => {
    if (!confirm("⚠️ Delete ALL players and ALL matches?\n\nThis cannot be undone!")) return;

    await supabase.from('matches').delete().gte('id', '00000000-0000-0000-0000-000000000000');
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
      await supabase.from('matches').delete().or(`winner_name.eq.${player.name},loser_name.eq.${player.name}`);
    }
    await supabase.from('players').delete().eq('email', email);
    loadData();
  };

  const recordMatch = async () => {
    if (!player1 || !player2 || player1 === player2) {
      alert("Select two different players");
      return;
    }
    if (hasPlayedBefore(player1, player2)) {
      alert("❌ These two players have already played each other");
      return;
    }
    if (player1Games + player2Games !== 15) {
      alert("Total games must be exactly 15");
      return;
    }

    const p1 = players.find(p => p.name === player1);
    const p2 = players.find(p => p.name === player2);
    if (!p1 || !p2) return;

    await supabase.from('matches').insert({
      winner_name: player1Games > player2Games ? p1.name : p2.name,
      loser_name: player1Games > player2Games ? p2.name : p1.name,
      winner_games: Math.max(player1Games, player2Games),
      loser_games: Math.min(player1Games, player2Games),
      date: new Date().toISOString().split('T')[0]
    });

    await supabase.from('players').update({ points: p1.points + player1Games }).eq('id', p1.id);
    await supabase.from('players').update({ points: p2.points + player2Games }).eq('id', p2.id);

    alert("✅ Match recorded and points updated!");
    setShowMatchModal(false);
    setPlayer1(''); setPlayer2('');
    setPlayer1Games(0); setPlayer2Games(0);
    loadData();
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
          <button onClick={() => setShowMatchModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">🎾 Record Match</button>
          <button onClick={() => setShowHowToUse(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl">📖 How to Use</button>
          <button onClick={handleAdmin} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl">🔧 Admin</button>
          <button onClick={() => window.location.href = '/login'} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl">Logout</button>
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
              matches.slice(-10).reverse().map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                  <div>
                    <span className="font-medium text-emerald-700">{m.winner_name}</span> beat <span className="font-medium">{m.loser_name}</span>
                  </div>
                  <div className="font-semibold">
                    {m.winner_games} - {m.loser_games}
                  </div>
                  <div className="text-sm text-gray-500">{m.date}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-red-600 mb-6">Admin Panel</h3>
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

      {/* Record Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Record New Match</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1">Player 1</label>
              <select value={player1} onChange={(e) => setPlayer1(e.target.value)} className="w-full border rounded-xl px-4 py-3">
                <option value="">Select Player 1</option>
                {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1">Player 2</label>
              <select value={player2} onChange={(e) => setPlayer2(e.target.value)} className="w-full border rounded-xl px-4 py-3">
                <option value="">Select Player 2</option>
                {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm mb-1">{player1 || "Player 1"} Games Won</p>
                <input type="number" min="0" max="15" value={player1Games} onChange={(e) => setPlayer1Games(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" />
              </div>
              <div>
                <p className="text-sm mb-1">{player2 || "Player 2"} Games Won</p>
                <input type="number" min="0" max="15" value={player2Games} onChange={(e) => setPlayer2Games(Number(e.target.value))} className="w-full border rounded-xl px-4 py-3 text-center" />
              </div>
            </div>

            <button onClick={recordMatch} className="w-full bg-emerald-600 text-white py-4 rounded-xl">Record Match</button>
            <button onClick={() => setShowMatchModal(false)} className="w-full mt-3 text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* How to Use Modal */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">How to Use the Ladder</h3>
            <div className="space-y-4 text-gray-700">
              <p><strong>Match Rules:</strong></p>
              <p>• Play exactly <strong>15 games</strong> (not sets)</p>
              <p>• 1 point per game won</p>
              <p>• You can only play each opponent <strong>once</strong></p>
              <p>• Use "Record Match" button to submit score</p>
            </div>
            <button onClick={() => setShowHowToUse(false)} className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-xl font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}