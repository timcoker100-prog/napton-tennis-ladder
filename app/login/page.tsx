'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const SECRET_CODE = 'N&P2026';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== SECRET_CODE) {
      alert("❌ Incorrect code. Please contact timcoker100@gmail.com for the code.");
      return;
    }

    setLoading(true);

    // Check if email already exists
    const { data: existing } = await supabase
      .from('players')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existing) {
      alert("✅ You are already registered! Redirecting to ladder...");
      router.push('/ladder');
      return;
    }

    // Create new player
    const { error } = await supabase.from('players').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      points: 0
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✅ Registration successful! Welcome to the ladder.");
      router.push('/ladder');
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Tim Coker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500"
              placeholder="Enter code"
            />
            <p className="text-xs text-gray-500 mt-2">
              Contact timcoker100@gmail.com for the code
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-2xl text-lg transition disabled:opacity-70"
          >
            {loading ? "Registering..." : "Join the Ladder"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already registered? Just log in with the same details above.
        </p>
      </div>
    </div>
  );
}