'use client';
import { useState } from 'react';

type Player = {
  id: string;
  name: string;
};

type MatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onMatchRecorded: (winnerId: string, loserId: string, winnerGames: number, loserGames: number) => void;
};

export default function MatchModal({ isOpen, onClose, players, onMatchRecorded }: MatchModalProps) {
  const [winnerId, setWinnerId] = useState("");
  const [loserId, setLoserId] = useState("");
  const [winnerGames, setWinnerGames] = useState(0);
  const [loserGames, setLoserGames] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!winnerId || !loserId) {
      setError("Please select both players");
      return;
    }
    if (winnerId === loserId) {
      setError("You cannot play against yourself!");
      return;
    }
    if (winnerGames + loserGames !== 15) {
      setError("Total games must equal 15");
      return;
    }

    onMatchRecorded(winnerId, loserId, winnerGames, loserGames);
    alert(`✅ Match recorded: ${players.find(p => p.id === winnerId)?.name} ${winnerGames} - ${loserGames} ${players.find(p => p.id === loserId)?.name}`);
    
    setWinnerId("");
    setLoserId("");
    setWinnerGames(0);
    setLoserGames(0);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Record New Match</h2>

        <select 
          value={winnerId} 
          onChange={(e) => setWinnerId(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3"
        >
          <option value="">Select Winner</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select 
          value={loserId} 
          onChange={(e) => setLoserId(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3"
          disabled={!winnerId}
        >
          <option value="">Select Loser</option>
          {players
            .filter(p => p.id !== winnerId)
            .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">Winner Games</label>
            <input 
              type="number" 
              value={winnerGames} 
              onChange={(e) => setWinnerGames(Number(e.target.value))} 
              className="w-full p-3 border rounded-lg" 
              min="0" 
              max="15"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Loser Games</label>
            <input 
              type="number" 
              value={loserGames} 
              onChange={(e) => setLoserGames(Number(e.target.value))} 
              className="w-full p-3 border rounded-lg" 
              min="0" 
              max="15"
            />
          </div>
        </div>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium">Record Match</button>
        </div>
      </div>
    </div>
  );
}