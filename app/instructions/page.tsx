export default function Instructions() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-emerald-700 mb-8 text-center">How to Use the Ladder</h1>

        <div className="space-y-8 text-gray-700">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Register / Join</h2>
            <p>Open the site → Enter your name, email and the secret code.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Recording a Match</h2>
            <p className="mb-2">Click "+ Record Match"</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Choose winner and loser</li>
              <li>Enter games won by each player</li>
              <li><strong>Total games must equal 15</strong> (this is individual games, <strong>not sets</strong>)</li>
            </ul>
            <p className="mt-3 text-sm font-medium">1 point is awarded for each game won.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Important Rules</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Matches are always 15 games total</li>
              <li>You cannot play the same opponent twice</li>
              <li>You cannot play yourself</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex gap-4 justify-center">
          <a href="/ladder" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-medium">← Back to Ladder</a>
        </div>
      </div>
    </div>
  );
}