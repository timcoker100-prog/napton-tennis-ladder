'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (code !== 'N&P2026') {
      setMessage("❌ Incorrect secret code.");
      setLoading(false);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('players')
        .select('name, email')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existing) {
        if (existing.name.toLowerCase() !== name.toLowerCase().trim()) {
          setMessage("❌ This email is already registered under a different name.");
        } else {
          setMessage("✅ You are already registered. Taking you to the ladder...");
          localStorage.setItem('isLoggedIn', 'true');
          setTimeout(() => router.push('/ladder'), 1200);
        }
        setLoading(false);
        return;
      }

      // New registration
      const { error } = await supabase.from('players').insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        points: 0
      });

      if (error) throw error;

      setMessage("🎉 Registration successful!");
      localStorage.setItem('isLoggedIn', 'true');
      setTimeout(() => router.push('/ladder'), 1500);

    } catch (err: any) {
      setMessage("❌ Error: " + (err.message || "Please try again"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-800">Napton & Priors Marston</h1>
          <p className="text-2xl text-emerald-700 mt-2">Singles Ladder (Mixed)</p>
          <p className="text-gray-600 mt-4">Register or log in below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-lg" placeholder="e.g. John Smith" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-lg" placeholder="your@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (optional)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-lg" placeholder="07912 345678" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (optional)</label>
            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-lg" placeholder="07912 345678" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Code</label>
            <input type="password" required value={code} onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-lg" placeholder="Enter code" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-4 rounded-2xl text-lg">
            {loading ? "Processing..." : "Register / Log In"}
          </button>
        </form>

        {message && <p className="mt-6 text-center text-lg font-medium p-4 bg-emerald-50 rounded-2xl">{message}</p>}
      </div>
    </div>
  );
}