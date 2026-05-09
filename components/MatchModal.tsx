'use client';

import { useState } from "react";

type Player = {
  id: string;
  name: string;
};

type MatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSaved: () => void;
  onMatchRecorded: (winnerId: string, loserId: string, winnerGames: number, loserGames: number) => void;
};

export default function MatchModal({ 
  isOpen, 
  onClose, 
  players, 
  onSaved, 
  onMatchRecorded 
}: MatchModalProps) {

  const [winnerId, setWinnerId] = useState("");
  const [loserId, setLoserId] = useState("");
  const [winnerGames, setWinnerGames] = useState(8);
  const [loserGames, setLoserGames] = useState(7);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!winnerId || !loserId) return setError("Please select both players");
    if (winnerId === loserId) return setError("❌ You cannot play against yourself!");

    if (winnerGames + loserGames !== 15) {
      return setError("Total games must equal 15 (e.g. 8-7, 9-6)");
    }

    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);

    alert(`✅ Match Recorded!\n\n${winner?.name} defeated ${loser?.name} ${winnerGames}-${loserGames}`);

    // Update ladder points
    onMatchRecorded(winnerId, loserId, winnerGames, loserGames);
    
    onSaved();
    onClose();

    // Reset form
    setWinnerId("");
    setLoserId("");
    setWinnerGames(8);
    setLoserGames(7);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Record New Match</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Winner</label>
            <select 
              value={winnerId} 
              onChange={(e) => setWinnerId(e.target.value)} 
              className="w-full border rounded-lg px-4 py-3"
              required
            >
              <option value="">Select Winner</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Loser</label>
            <select 
              value={loserId} 
              onChange={(e) => setLoserId(e.target.value)} 
              className="w-full border rounded-lg px-4 py-3"
              required
            >
              <option value="">Select Loser</option>
              {players.map(p => (
                <option key={p.id} value={p.id} disabled={p.id === winnerId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Winner Games</label>
              <input
                type="number"
                value={winnerGames}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWinnerGames(val);
                  setLoserGames(15 - val);
                }}
                className="w-full border rounded-lg px-4 py-3 text-center text-2xl font-bold"
                min="0" max="15"
              />
            </div>
            <div>
              <label className="block mb-2">Loser Games</label>
              <input
                type="number"
                value={loserGames}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setLoserGames(val);
                  setWinnerGames(15 - val);
                }}
                className="w-full border rounded-lg px-4 py-3 text-center text-2xl font-bold"
                min="0" max="15"
              />
            </div>
          </div>

          {error && <p className="text-red-600 font-medium">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-semibold">Submit Result</button>
          </div>
        </form>
      </div>
    </div>
  );
}