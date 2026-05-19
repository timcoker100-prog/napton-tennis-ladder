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

  const recordMatch = async () => { /* ... same as before ... */ 
    if (!selectedOpponent || winnerGames + loserGames !== 15) {
      alert("Total games must be exactly 15");
      return;
    }
    setLoading(true);
    const winner = currentUser!;
    const loser = selectedOpponent;
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('matches').insert({
      winner_id: winner.id, loser_id: loser.id,
      winner_name: winner.name, loser_name: loser.name,
      winner_games: winnerGames, loser_games: loserGames, date: today
    });

    if (!error) {
      await supabase.from('players').update({ points: winner.points + winnerGames }).eq('id', winner.id);
      await supabase.from('players').update({ points: loser.points + loserGames }).eq('id', loser.id);
      alert(`✅ Match recorded!`);
    } else {
      alert("Error: " + error.message);
    }
    setShowMatchModal(false);
    setSelectedOpponent(null);
    setWinnerGames(8); setLoserGames(7);
    await loadData();
    setLoading(false);
  };

  const saveProfile = async () => { /* ... same ... */ 
    if (!currentUser) return;
    const { error } = await supabase.from('players').update({
      name: profileName, phone: profilePhone || null, whatsapp: profileWhatsapp || null
    }).eq('id', currentUser.id);
    if (error) alert("Error");
    else { alert("✅ Saved!"); setShowProfileModal(false); await loadData(); }
  };

  const handleAdminLogin = () => {
    if (adminCodeInput === ADMIN_CODE) {
      setIsAdmin(true);
      alert("✅ Admin access granted");
    } else {
      alert("❌ Incorrect admin code");
    }
  };

  const resetAllData = async () => {
    if (!confirm("Delete ALL players and matches? This cannot be undone.")) return;
    await supabase.from('matches').delete().neq('id', '0');
    await supabase.from('players').delete().neq('id', '0');
    alert("All data has been reset");
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
      {/* Header + Buttons */}
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

      {/* Ladder Table + Recent Matches (same as before) */}
      {/* ... (keeping the same ladder table and recent matches section) ... */}

      {/* ADMIN MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            
            {!isAdmin ? (
              <div>
                <input 
                  type="password" 
                  placeholder="Enter Admin Code" 
                  value={adminCodeInput}
                  onChange={(e) => setAdminCodeInput(e.target.value)}
                  className="w-full p-4 border rounded-2xl mb-4"
                />
                <button onClick={handleAdminLogin} className="w-full py-4 bg-orange-600 text-white rounded-2xl">Login as Admin</button>
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={resetAllData} className="w-full py-4 bg-red-600 text-white rounded-2xl font-semibold">Reset ALL Data</button>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Players</h3>
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

      {/* Other modals (Profile, Match, How to Use) remain the same */}
      {/* ... Profile Modal, Match Modal, How to Use Modal ... */}
    </div>
  );
}