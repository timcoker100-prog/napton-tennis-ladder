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
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Record Match
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player1Games, setPlayer1Games] = useState(0);
  const [player2Games, setPlayer2Games] = useState(0);

  const loadData = async () => {
    const { data: pData } = await supabase.from('players').select('*');
    const { data: mData } = await supabase.from('matches').select('*');
    setPlayers(pData || []);
    setMatches(mData || []);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAdmin = () => {
    const code = prompt("Enter Admin Code:");
    if (code === ADMIN_CODE) setShowAdminModal(true);
    else if (code) alert("❌ Wrong admin code");
  };

  const resetAllData = async () => {
    if (!confirm("Clear ALL data?")) return;
    await supabase.from('matches').delete().neq('id', '0');
    await supabase.from('players').delete().neq('id', '0');
    loadData();
    alert("✅ Ladder fully reset");
  };

  const removePlayer = async (email: string) => {
    if (!confirm("Remove this player AND all their matches?")) return;

    // Delete all matches involving this player
    await supabase
      .from('matches')
      .delete()
      .or(`winner_name.eq.${email},loser_name.eq.${email}`);   // Wait, better to use name

    // Better way - delete by name (since we store names in matches)
    const player = players.find(p => p.email === email);
    if (player) {
      await supabase
        .from('matches')
        .delete()
        .or(`winner_name.eq.${player.name},loser_name.eq.${player.name}`);
    }

    // Delete the player
    await supabase.from('players').delete().eq('email', email);

    loadData();
    alert("Player and their matches removed");
  };

  const recordMatch = async () => {
    if (!player1 || !player2 || player1 === player2) {
      alert("Select two different players");
      return;
    }
    if (player1Games + player2Games !== 15) {
      alert("Total games must be 15");
      return;
    }

    const p1 = players.find(p => p.name === player1);
    const p2 = players.find(p => p.name === player2);

    const { error } = await supabase.from('matches').insert({
      winner_name: player1Games > player2Games ? p1!.name : p2!.name,
      loser_name: player1Games > player2Games ? p2!.name : p1!.name,
      winner_games: Math.max(player1Games, player2Games),
      loser_games: Math.min(player1Games, player2Games),
      date: new Date().toISOString().split('T')[0]
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✅ Match recorded!");
      setShowMatchModal(false);
      setPlayer1(''); 
      setPlayer2('');
      setPlayer1Games(0);
      setPlayer2Games(0);
      loadData();
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-emerald-50 p-4">
      {/* ... same header and buttons as before ... */}

      {/* Current Ladder + Recent Matches sections remain the same */}

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
              <div key={player.email} className="flex justify-between items-center py-3 border-b">
                <span>{player.name}</span>
                <button onClick={() => removePlayer(player.email)} className="text-red-500 hover:underline">Remove</button>
              </div>
            ))}

            <button onClick={() => setShowAdminModal(false)} className="mt-8 w-full py-3 text-gray-500">Close Admin</button>
          </div>
        </div>
      )}

      {/* Record Match Modal - unchanged */}
      {/* ... keep the same as previous version ... */}
    </div>
  );
}