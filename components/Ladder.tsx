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
      const p = localStorage.getItem('players');
      const m = localStorage.getItem('matches');
      if (p) setPlayers(JSON.parse(p));
      if (m) setMatches(JSON.parse(m));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileSaved = (newPlayer: Player) => {
    setPlayers(prev => {
      const index = prev.findIndex(p => p.email === newPlayer.email);
      let updated = [...prev];
      if (index !== -1) {
        updated[index] = { ...updated[index], ...newPlayer };
      } else {
        updated.push(newPlayer);
      }
      localStorage.setItem('players', JSON.stringify(updated));
      return updated;
    });
    setShowProfileModal(false);
  };

  const hasPlayedBefore = (player1Id: string, player2Id: string) => {
    return matches.some(m => 
      (m.winnerId === player1Id && m.loserId === player2Id) || 
      (m.winnerId === player2Id && m.loserId === player1Id)
    );
  };

  const recordMatch = (winnerId: string, loserId: string, winnerGames: number, loserGames: number) => {
    if (winnerId === loserId) {
      alert("❌ You cannot play against yourself");
      return;
    }
    if (winnerGames + loserGames !== 15) {
      alert("❌ Total games must equal 15");
      return;
    }
    if (hasPlayedBefore(winnerId, loserId)) {
      alert("❌ You have already played this opponent once. Only one match per pair allowed.");
      return;
    }

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
    setMatches(updatedMatches);
    localStorage.setItem('matches', JSON.stringify(updatedMatches));

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
      localStorage.setItem('players', JSON.stringify(updated));
      return updated;
    });
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
          <button on