import Ladder from "@/components/Ladder";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-emerald-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🏆 Napton Tennis Club Ladder</h1>
          <div className="text-sm opacity-75">
            Local Version • Ready for Club Use
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <Ladder />
      </main>
    </div>
  );
}