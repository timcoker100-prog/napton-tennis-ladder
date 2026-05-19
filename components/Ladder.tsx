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
    try {
      const savedPlayers = localStorage.getItem('players');
      const savedMatches = localStorage.getItem('matches');

      if (savedPlayers) {
        const parsed = JSON.parse(savedPlayers);
        setPlayers(Array.isArray(parsed) ? parsed : []);
      }
      if (savedMatches) {
        const parsed = JSON.parse(savedMatches);
        setMatches(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error("Error loading data:", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1500); // Auto refresh every 1.5s
    return () => clearInterval(interval);
  }, []);

  const savePlayers = (updatedPlayers: Player[]) => {
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    setPlayers(updatedPlayers);
  };

  const handleProfileSaved = (newPlayer: Player) => {
    setPlayers(prev => {
      const existingIndex = prev.findIndex(p => p.email === newPlayer.email);
      let updated = [...prev];
      if (existingIndex !== -1) {
        updated[existingIndex] = { ...updated[existingIndex], ...newPlayer };
      } else {
        updated.push(newPlayer);
      }
      savePlayers(updated);
      return updated;
    });
    setShowProfileModal(false);
  };

  const recordMatch = (winnerId: string, loserId: string, winnerGames: number, loserGames: number) => {
    if (winnerGames + loserGames !== 15) return;

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

    // Update matches
    const updatedMatches = [newMatch, ...matches];
    setMatches(updatedMatches);
    localStorage.setItem('matches', JSON.stringify(updatedMatches));

    // Update players
    setPlayers(prev => {
      const updated = prev.map(player => {
        if (player.id === winnerId) {
          return {
            ...player,
            points: (player.points || 0) + winnerGames,
            gamesWon: (player.gamesWon || 0) + winnerGames,
            gamesLost: (player.gamesLost || 0) + loserGames,
            matchesPlayed: (player.matchesPlayed || 0) + 1
          };
        }
        if (player.id === loserId) {
          return {
            ...player,
            points: (player.points || 0) + loserGames,
            gamesWon: (player.gamesWon || 0) + loserGames,
            gamesLost: (player.gamesLost || 0) + winnerGames,
            matchesPlayed: (player.matchesPlayed || 0) + 1
          };
        }
        return player;
      });
      savePlayers(updated);
      return updated;
    });
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
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={loadData} className="px-6 py-3 border rounded-full">🔄 Refresh</button>
          <button onClick={() => setShowProfileModal(true)} className="px-6 py-3 border border-emerald-600 text-emerald-700 rounded-full">👤 My Profile</button>
          <button onClick={() => setShowMatchModal(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-full">+ Record Match</button>
          <a href="/instructions" className="px-6 py-3 bg-blue-600 text-white rounded-full">📋 How to Use</a>
          <a href="/admin" className="px-6 py-3 bg-amber-600 text-white rounded-full">⚙️ Admin</a>
          <button onClick={() => { if (confirm("Logout?")) { localStorage.removeItem('currentUser'); window.location.href = '/login'; } }} className="px-6 py-3 bg-red-600 text-white rounded-full">Logout</button>
        </div>

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
                    <td className="p-4 pl-6 font-bold">{index + 1}</td>
                    <td className="p-4 font-medium">{player.name}</td>
                    <td className="p-4 font-semibold text-emerald-700 text-center text-xl">{player.points}</td>
                    <td className="p-4">
                      {player.contactConsent && (
                        <div className="flex gap-4 justify-center text-2xl">
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

        {matches.length > 0 && (
          <div className="bg-white rounded-3xl shadow overflow-hidden">
            <div className="bg-emerald-700 text-white p-4 font-medium">Recent Matches</div>
            <div className="p-4 space-y-3">
              {matches.slice(0, 10).map(match => (
                <div key={match.id} className="text-sm border-l-4 border-emerald-600 pl-3 py-1">
                  {match.date} — <strong>{match.winnerName}</strong> beat {match.loserName} ({match.winnerGames}-{match.loserGames})
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