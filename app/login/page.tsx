'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const SECRET_CODE = 'N&P2026';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    console.log("Starting registration...");

    if (code !== SECRET_CODE) {
      setMessage("❌ Wrong code");
      setLoading(false);
      return;
    }

    try {
      console.log("Checking if email exists...");
      const { data: existing, error: checkError } = await supabase
        .from('players')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Check error:", checkError);
      }

      if (existing) {
        setMessage("✅ Already registered! Redirecting...");
        router.push('/ladder');
        return;
      }

      console.log("Inserting new player...");
      const { error: insertError } = await supabase.from('players').insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        points: 0
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        setMessage("❌ Insert failed: " + insertError.message);
      } else {
        setMessage("✅ Success! Redirecting to ladder...");
        setTimeout(() => router.push('/ladder'), 1200);
      }
    } catch (err: any) {
      console.error("Catch error:", err);
      setMessage("❌ Failed to fetch: " + (err.message || err));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">
            Napton and Priors Marston
          </h1>
          <p className="text-emerald-700 text-2xl">Singles Ladder (Mixed)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields same as before */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-5 py-4" placeholder="Tim Coker" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-5 py-4" placeholder="your@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Code</label>
            <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-5 py-4" placeholder="N&P2026" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-lg">
            {loading ? "Registering..." : "Join the Ladder"}
          </button>
        </form>

        {message && <p className="mt-4 text-center font-medium text-red-600">{message}</p>}

        <p className="text-center text-sm text-gray-500 mt-8">Already registered? Use the same details above.</p>
      </div>
    </div>
  );
}