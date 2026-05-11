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
};

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const loadData = () => {
    const savedPlayers = localStorage.getItem('players');
    const savedMatches = localStorage.getItem('matches');
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileSaved = (newPlayer: Player) => {
    setPlayers(prev => {
      const existing = prev.findIndex(p => p.email === newPlayer.email);
      const updated = existing !== -1 
        ? prev.map((p, i) => i === existing ? { ...p, ...newPlayer } : p)
        : [...prev, newPlayer];
      localStorage.setItem('players', JSON.stringify(updated));
      return updated;
    });
    setShowProfileModal(false);
  };

  const recordMatch = (winnerId: string, loserId: string, winnerGames: number, loserGames: number) => {
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);
    if (!winner || !loser) return;

    const newMatch: Match = {
      id: Date.now().toString(),
      winnerName: winner.name,
      loserName: loser.name,
      winnerGames,
      loserGames,
      date: new Date().toLocaleDateString()
    };

    const updatedMatches = [newMatch, ...matches];
    setMatches(updatedMatches);
    localStorage.setItem('matches', JSON.stringify(updatedMatches));

    setPlayers(prev => prev.map(player => {
      if (player.id === winnerId) return { ...player, points: player.points + winnerGames, gamesWon: player.gamesWon + winnerGames, gamesLost: player.gamesLost + loserGames, matchesPlayed: player.matchesPlayed + 1 };
      if (player.id === loserId) return { ...player, points: player.points + loserGames, gamesWon: player.gamesWon + loserGames, gamesLost: player.gamesLost + winnerGames, matchesPlayed: player.matchesPlayed + 1 };
      return player;
    }));
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-700 text-white sticky top-0 z-50 shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Napton Tennis Club</h1>
          <p className="text-emerald-100">Singles Ladder</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={loadData} className="py-4 bg-white border-2 border-gray-300 rounded-2xl font-medium active:bg-gray-100">🔄 Refresh</button>
          <button onClick={() => setShowProfileModal(true)} className="py-4 bg-white border-2 border-emerald-600 text-emerald-700 rounded-2xl font-medium active:bg-emerald-50">👤 My Profile</button>
          <button onClick={() => setShowMatchModal(true)} className="py-4 bg-emerald-600 text-white rounded-2xl font-semibold active:bg-emerald-700 col-span-2">+ Record Match</button>
        </div>

        {/* Secondary Small Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <a href="/instructions" className="text-xs px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200">📋 How to Use</a>
          <a href="/admin" className="text-xs px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200">⚙️ Admin</a>
          <button 
            onClick={() => { if (confirm("Logout?")) { localStorage.removeItem('currentUser'); window.location.href = '/login'; } }} 
            className="text-xs px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200"
          >
            Logout
          </button>
        </div>

        {/* Ladder Table */}
        <div className="bg-white rounded-3xl shadow overflow-hidden mb-8">
          <div className="bg-emerald-700 text-white p-4 font-medium">Current Ladder</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left pl-6">Rank</th>
                  <th className="p-4 text-left">Player</th>
                  <th className="p-4 text-center">Points</th>
                  <th className="p-4 text-center">Contact</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 pl-6 font-bold text-lg">{index + 1}</td>
                    <td className="p-4 font-medium">{player.name}</td>
                    <td className="p-4 font-semibold text-emerald-700 text-center text-xl">{player.points}</td>
                    <td className="p-4">
                      {player.contactConsent && (
                        <div className="flex gap-5 justify-center text-2xl">
                          {player.email && <a href={`mailto:${player.email}`}>✉️</a>}
                          {player.whatsapp && <a href={`https://wa.me/${player.whatsapp.replace(/\D/g,'')}`} target="_blank">💬</a>}
                          {player.phone && <a href={`tel:${player.phone}`}>📞</a>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-3xl shadow p-5">
          <h3 className="font-semibold mb-4">Recent Matches</h3>
          {matches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No matches yet</p>
          ) : (
            <div className="space-y-2 text-sm">
              {matches.slice(0, 8).map(m => (
                <div key={m.id} className="border-l-4 border-emerald-600 pl-3">
                  {m.date} — <strong>{m.winnerName}</strong> beat {m.loserName} ({m.winnerGames}-{m.loserGames})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} onSaved={handleProfileSaved} />
      <MatchModal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} players={players} onMatchRecorded={recordMatch} />
    </div>
  );
}