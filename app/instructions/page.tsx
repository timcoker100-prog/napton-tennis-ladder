'use client';

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-emerald-700 mb-8 text-center">How to Use the Napton Tennis Ladder</h1>

        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. Register / Join</h2>
            <p className="text-gray-600">Go to the homepage → Enter your name, email and the secret code (ask a club admin).</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">2. Record a Match</h2>
            <p className="text-gray-600">Click "+ Record Match" → Choose winner and loser → Enter games won by each (must total exactly 15 games).</p>
            <p className="text-sm text-emerald-700 mt-2">Example: 10-5, 8-7, 15-0 etc.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">3. Scoring</h2>
            <p className="text-gray-600">1 point per game won. Total games per match = 15.</p>
            <p className="text-sm mt-2">You cannot play the same opponent twice.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">4. Contact Other Players</h2>
            <p className="text-gray-600">Click the icons (✉️ 💬 📞) in the Contact column to email, WhatsApp or call.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="/ladder" className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-2xl font-medium hover:bg-emerald-700">
            Back to Ladder
          </a>
        </div>
      </div>
    </div>
  );
}