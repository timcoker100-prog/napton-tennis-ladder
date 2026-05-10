'use client';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎾</div>
          <h1 className="text-4xl font-bold text-emerald-700">How to Use the Ladder</h1>
        </div>

        <div className="space-y-10 text-lg">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Register / Join</h2>
            <p className="text-gray-600">Open the site → Enter your name, email and the secret code <strong>NAPTON2026</strong>.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Record a Match</h2>
            <p className="text-gray-600">Click "+ Record Match" → Choose winner and loser → Enter games won by each player (must add up to exactly 15).</p>
            <p className="text-sm text-emerald-700 mt-2">Examples: 10-5, 8-7, 15-0</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Scoring Rules</h2>
            <p className="text-gray-600">• 1 point per game won<br/>• You cannot play the same opponent twice<br/>• You cannot play yourself</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Contact Players</h2>
            <p className="text-gray-600">Use the icons (✉️ 💬 📞) in the Contact column to email, WhatsApp or call other members.</p>
          </div>
        </div>

        <div className="mt-12 flex gap-4 justify-center">
          <a href="/ladder" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700">
            Back to Ladder
          </a>
          <a href="/admin" className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-medium hover:bg-amber-700">
            Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}