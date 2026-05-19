'use client';
import { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import MatchModal from './MatchModal';

type Player = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  contactConsent: boolean;
  points: number;
  gamesWon: number;
  gamesLost: number;
  matchesPlayed: number;
};

type Match = {
  id: string;
  winnerName: string;
  loserName: string;
  winnerGames: number;
  loserGames: number;
  date: string;
  winnerId: string;
  loserId: string;
};

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const loadData = () => {
    try {
      const savedPlayers = localStorage.getItem('players');
      const savedMatches = localStorage.getItem('matches');
      
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedMatches) setMatches(JSON.parse(savedMatches));
    } catch (e) {
      console.error("Load error", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveData = (newPlayers: Player[], newMatches?: Match[]) => {
    localStorage.setItem('players', JSON.stringify(newPlayers));
    if (newMatches) localStorage.setItem('matches', JSON.stringify(newMatches));
    setPlayers(newPlayers);
    if (newMatches) setMatches(newMatches);
  };

  const handleProfileSaved = (newPlayer: Player) => {
    setPlayers(prev => {
      const index = prev.findIndex(p => p.email === newPlayer.email);
      let updated = [...prev];
      if (index !== -1) {
        updated[index] = { ...updated[index], ...newPlayer };
      } else {
        updated.push(newPlayer);
      }
      saveData(updated);
      return updated;
    });
    setShowProfileModal(false);
  };

  const hasPlayedBefore = (p1Id: string, p2Id: string) => {
    return matches.some(m => 
      (m.winnerId === p1Id && m.loserId === p2Id) || 
      (m.winnerId === p2Id && m.loserId === p1Id)
    );
  };

  const recordMatch = (winnerId: string, loserId: string, winnerGames: number, loserGames: number) => {
    if (winnerId === loserId) return alert("❌ Cannot play yourself");
    if (winnerGames + loserGames !== 15) return alert("❌ Total games must be 15");
    if (hasPlayedBefore(winnerId, loserId)) return alert("❌ Already played this opponent once");

    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);
    if (!winner || !loser) return;

    const newMatch: Match = {
      id: Date.now().toString(),
      winnerName: winner.name,
      loserName: loser.name,
      winnerGames,
      loserGames,
      date: new Date().toLocaleDateString(),
      winnerId,
      loserId
    };

    const updatedMatches = [newMatch, ...matches];
    const updatedPlayers = players.map(player => {
      if (player.id === winnerId) {
        return { ...player, points: (player.points||0) + winnerGames, gamesWon: (player.gamesWon||0) + winnerGames, gamesLost: (player.gamesLost||0) + loserGames, matchesPlayed: (player.matchesPlayed||0) + 1 };
      }
      if (player.id === loserId) {
        return { ...player, points: (player.points||0) + loserGames, gamesWon: (player.gamesWon||0) + loserGames, gamesLost: (player.gamesLost||0) + winnerGames, matchesPlayed: (player.matchesPlayed||0) + 1 };
      }
      return player;
    });

    saveData(updatedPlayers, updatedMatches);
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-700 text-white sticky top-0 z-50 p-4">
        <h1 className="text-2xl font-bold">Napton Tennis Club</h1>
        <p className="text-emerald-100">Singles Ladder</p>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={loadData} className="px-6 py-3 border rounded-full">🔄 Refresh</button>
          <button onClick={loadData} className="px-6 py-3 border border-orange-500 text-orange-600 rounded-full">🔄 Restore Data</button>
          <button onClick={() => setShowProfileModal(true)} className="px-6 py-3 border border-emerald-600 text-emerald-700 rounded-full">👤 My Profile</button>
          <button onClick={() => setShowMatchModal(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-full">+ Record Match</button>
          <a href="/instructions" className="px-6 py-3 bg-blue-600 text-white rounded-full">📋 How to Use</a>
          <a href="/admin" className="px-6 py-3 bg-amber-600 text-white rounded-full">⚙️ Admin</a>
          <button onClick={() => { if (confirm("Logout?")) { localStorage.removeItem('currentUser'); window.location.href = '/login'; } }} className="px-6 py-3 bg-red-600 text-white rounded-full">Logout</button>
        </div>

        <div className="bg-white rounded-3xl shadow mb-8">
          <div className="bg-emerald-700 text-white p-4 font-medium">Current Ladder</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Rank</th>
                  <th className="p-4 text-left">Player</th>
                  <th className="p-4 text-center">Points</th>
                  <th className="p-4 text-center">Contact</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, i) => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold">{i+1}</td>
                    <td className="p-4">{player.name}</td>
                    <td className="p-4 text-center font-semibold text-xl text-emerald-700">{player.points}</td>
                    <td className="p-4">
                      <div className="flex gap-4 justify-center text-2xl">
                        {player.email && <a href={`mailto:${player.email}`}>✉️</a>}
                        {player.whatsapp && <a href={`https://wa.me/${player.whatsapp.replace(/\D/g,'')}`} target="_blank">💬</a>}
                        {player.phone && <a href={`tel:${player.phone}`}>📞</a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="bg-white rounded-3xl shadow">
            <div className="bg-emerald-700 text-white p-4 font-medium">Recent Matches</div>
            <div className="p-4 space-y-2">
              {matches.slice(0, 10).map(m => (
                <div key={m.id} className="text-sm">
                  {m.date} — <strong>{m.winnerName}</strong> beat {m.loserName} ({m.winnerGames}-{m.loserGames})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} onSaved={handleProfileSaved} />
      <MatchModal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} players={players} onMatchRecorded={recordMatch} />
    </div>
  );
}