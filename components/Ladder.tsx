'use client';

import { useEffect, useState } from "react";
import ProfileModal from "./ProfileModal";
import MatchModal from "./MatchModal";

type Player = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  contactConsent: boolean;
  points: number;
  gamesWon: number;
  gamesLost: number;
  matchesPlayed: number;
};

export default function Ladder() {
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "+44 1234 567890",
      whatsapp: "+441234567890",
      contactConsent: true,
      points: 1250,
      gamesWon: 85,
      gamesLost: 45,
      matchesPlayed: 26
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah@example.com",
      phone: "+44 9876 543210",
      whatsapp: "+449876543210",
      contactConsent: true,
      points: 1180,
      gamesWon: 72,
      gamesLost: 38,
      matchesPlayed: 22
    },
    {
      id: "3",
      name: "Mike Thompson",
      email: "mike@example.com",
      phone: "",
      whatsapp: "",
      contactConsent: false,
      points: 1050,
      gamesWon: 45,
      gamesLost: 35,
      matchesPlayed: 18
    }
  ]);

  const [showProfile, setShowProfile] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [loading, setLoading] = useState(false);

    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    const recordMatch = (winnerId: string, loserId: string, winnerGames: number, loserGames: number) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === winnerId) {
        return {
          ...player,
          points: player.points + winnerGames,           // +1 per game won
          gamesWon: player.gamesWon + winnerGames,
          gamesLost: player.gamesLost + loserGames,
          matchesPlayed: player.matchesPlayed + 1
        };
      }
      if (player.id === loserId) {
        return {
          ...player,
          points: player.points + loserGames,            // +1 per game won
          gamesWon: player.gamesWon + loserGames,
          gamesLost: player.gamesLost + winnerGames,
          matchesPlayed: player.matchesPlayed + 1
        };
      }
      return player;
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-emerald-800">Current Ladder</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowProfile(true)}
            className="bg-white border border-emerald-700 text-emerald-700 px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-50"
          >
            My Profile
          </button>
          <button
            onClick={() => setShowMatchModal(true)}
            className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-800"
          >
            + Record Match
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-emerald-800 text-white">
            <tr>
              <th className="w-16 p-4">Rank</th>
              <th className="p-4 text-left">Player</th>
              <th className="p-4">Points</th>
              <th className="p-4">Matches</th>
              <th className="p-4">Games Won</th>
              <th className="p-4">Games Lost</th>
              <th className="p-4">Win %</th>
              <th className="p-4">Contact</th>
            </tr>
          </thead>
                   <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className="border-b hover:bg-gray-50">
                <td className="text-center font-bold text-lg p-4">{index + 1}</td>
                <td className="font-medium p-4">{player.name}</td>
                <td className="font-semibold text-emerald-700 p-4">{player.points}</td>
                <td className="p-4">{player.matchesPlayed}</td>
                <td className="text-green-600 p-4">{player.gamesWon}</td>
                <td className="text-red-600 p-4">{player.gamesLost}</td>
                <td className="p-4">
                  {player.matchesPlayed > 0 
                    ? ((player.gamesWon / (player.gamesWon + player.gamesLost)) * 100).toFixed(0) + "%" 
                    : "-"}
                </td>
                <td className="p-4">
                  {player.contactConsent && (
                    <div className="flex gap-4 text-2xl">
                      {player.email && (
                        <a 
                          href={`mailto:${player.email}`} 
                          title="Send Email"
                          className="hover:scale-125 transition-transform"
                        >
                          ✉️
                        </a>
                      )}
                      {player.whatsapp && (
                        <a 
                          href={`https://wa.me/${player.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          title="WhatsApp"
                          className="hover:scale-125 transition-transform"
                        >
                          💬
                        </a>
                      )}
                      {player.phone && (
                        <a 
                          href={`tel:${player.phone}`} 
                          title="Call"
                          className="hover:scale-125 transition-transform"
                        >
                          📞
                        </a>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} onSaved={() => {}} />
      <MatchModal 
        isOpen={showMatchModal} 
        onClose={() => setShowMatchModal(false)} 
        players={players} 
        onSaved={() => {}} 
        onMatchRecorded={recordMatch}
      />
    </div>
  );
}