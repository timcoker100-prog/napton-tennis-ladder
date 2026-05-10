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
  winnerId: string;
  loserId: string;
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
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedMatches) setMatches(JSON.parse(savedMatches));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSaved = (newPlayer: Player) => {
    setPlayers(prev => {
      const existingIndex = prev.findIndex(p => p.email === newPlayer.email);
      let updated;
      if (existingIndex !== -1) {
        updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...newPlayer };
      } else {
        updated = [...prev, newPlayer];
      }
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
      winnerId,
      loserId,
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
      if (player.id === winnerId) {
        return { 
          ...player, 
          points: player.points + winnerGames, 
          gamesWon: player.gamesWon + winnerGames, 
          gamesLost: player.gamesLost + loserGames, 
          matchesPlayed: player.matchesPlayed + 1 
        };
      }
      if (player.id === loserId) {
        return { 
          ...player, 
          points: player.points + loserGames, 
          gamesWon: player.gamesWon + loserGames, 
          gamesLost: player.gamesLost + winnerGames, 
          matchesPlayed: player.matchesPlayed + 1 
        };
      }
      return player;
    }));
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Admin + Logout */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-emerald-700">Current Ladder</h2>
        <div className="flex gap-3">
          <button onClick={loadData} className="px-5 py-3 border rounded-full hover:bg-gray-100">🔄 Refresh</button>
          
          <button 
            onClick={() => setShowProfileModal(true)} 
            className="px-6 py-3 border border-emerald-600 text-emerald-700 rounded-full hover:bg-emerald-50 font-medium"
          >
            My Profile
          </button>

          <button 
            onClick={() => setShowMatchModal(true)} 
            className="px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 font-medium"
          >
            + Record Match
          </button>

          <a 
            href="/admin" 
            className="px-6 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 font-medium"
          >
            Admin
          </a>

          <button 
            onClick={() => {
              if (confirm("Logout?")) {
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
              }
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Ladder Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden mb-12">
        <table className="w-full">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="p-4 text-left">Rank</th>
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-center">Points</th>
              <th className="p-4 text-center">Matches</th>
              <th className="p-4 text-center">Games Won</th>
              <th className="p-4 text-center">Games Lost</th>
              <th className="p-4 text-center">Win %</th>
              <th className="p-4 text-center">Contact</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-center font-bold text-lg">{index + 1}</td>
                <td className="p-4 font-medium">{player.name}</td>
                <td className="p-4 font-semibold text-emerald-700 text-center">{player.points}</td>
                <td className="p-4 text-center">{player.matchesPlayed}</td>
                <td className="p-4 text-center text-green-600">{player.gamesWon}</td>
                <td className="p-4 text-center text-red-600">{player.gamesLost}</td>
                <td className="p-4 text-center">
                  {player.matchesPlayed > 0 ? Math.round((player.gamesWon / (player.gamesWon + player.gamesLost)) * 100) : 0}%
                </td>
                <td className="p-4">
                  {player.contactConsent && (
                    <div className="flex gap-4 text-2xl justify-center">
                      {player.email && <a href={`mailto:${player.email}`} title="Email">✉️</a>}
                      {player.whatsapp && <a href={`https://wa.me/${player.whatsapp.replace(/\D/g,'')}`} target="_blank" title="WhatsApp">💬</a>}
                      {player.phone && <a href={`tel:${player.phone}`} title="Call">📞</a>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} onSaved={handleProfileSaved} />
      <MatchModal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} players={players} onMatchRecorded={recordMatch} />
    </div>
  );
}