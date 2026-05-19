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
      
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedMatches) setMatches(JSON.parse(savedMatches));
    } catch (e) {
      console.error("Error loading data", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileSaved = (newPlayer: Player) => {
    setPlayers(prev => {
      const existingIndex = prev.findIndex(p => p.email === newPlayer.email);
      let updated = [...prev];
      
      if (existingIndex !== -1) {
        updated[existingIndex] = { ...updated[existingIndex], ...newPlayer };
      } else {
        updated.push(newPlayer);
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
      winnerName: winner.name,
      loserName: loser.name,
      winnerGames,
      loserGames,
      date: new Date().toLocaleDateString()
    };

    // Save match
    const updatedMatches = [newMatch, ...matches];
    setMatches(updatedMatches);
    localStorage.setItem('matches', JSON.stringify(updatedMatches));

    // Update players
    setPlayers(prev => {
      const updated = prev.map(player => {
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
      });
      localStorage.setItem('players', JSON.stringify(updated));
      return updated;
    });
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header and buttons same as before - I kept it short for space */}
      {/* ... (use the previous mobile version you liked) */}

      {/* For now, the important part is the data handling above */}

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} onSaved={handleProfileSaved} />
      <MatchModal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} players={players} onMatchRecorded={recordMatch} />
    </div>
  );
}