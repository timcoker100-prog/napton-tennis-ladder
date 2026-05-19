export default function Instructions() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-emerald-700 mb-8 text-center">How to Use</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. Register / Join</h2>
            <p className="text-gray-600">Open the site → Enter your name, email and the secret code.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">2. Recording a Match</h2>
            <p className="text-gray-600 mb-3">Click <strong>+ Record Match</strong></p>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              <li>Select yourself and your opponent</li>
              <li>Enter the score as <strong>games won</strong> (for example: 10 - 5)</li>
              <li><strong>Important:</strong> A match for the ladder is <strong>15 games total</strong> (not played as sets)</li>
              <li><strong>Total games must equal 15</strong></li>
              <li><strong>1 point is awarded for each game you win</strong></li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">3. Rules Summary</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Each match = exactly 15 games</li>
              <li>You cannot play the same opponent more than once</li>
              <li>You cannot play against yourself</li>
              <li>Your points = total number of games you have won across all matches</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">4. Contacting Members</h2>
            <p className="text-gray-600">Tap the contact icons (✉️ 💬 📞) next to any player’s name (only if they have given consent).</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="/ladder" className="inline-block bg-emerald-600 text-white px-10 py-4 rounded-2xl font-medium hover:bg-emerald-700">
            ← Back to Ladder
          </a>
        </div>
      </div>
    </div>
  );
}