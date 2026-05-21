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

  // Inactivity Timer
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert("⏰ You have been logged out due to inactivity (10 minutes).");
        window.location.href = '/login';
      }, INACTIVITY_TIMEOUT);
    };

    // Reset timer on user activity
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer

    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

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

  // ... rest of your functions (handleAdmin, resetAllData, removePlayer, recordMatch) stay the same ...

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
      {/* ... same UI as before ... */}
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

        {/* Current Ladder and Recent Matches sections remain the same as your last version */}
        {/* ... (copy from previous Ladder.tsx if needed) ... */}

      </div>

      {/* Modals (Admin, Record Match, How to Use) - keep the same as last working version */}
      {/* ... paste your existing modals here ... */}
    </div>
  );
}