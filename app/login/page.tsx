'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const SECRET_CODE = 'N&P2026';

export default function LoginPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (code !== SECRET_CODE) {
      setMessage("❌ Incorrect secret code");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          whatsapp: whatsapp.trim() || null,
          points: 0
        });

      if (error) {
        setMessage("❌ " + error.message);
      } else {
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => router.push('/ladder'), 1500);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setMessage("❌ Connection failed. Please check your internet or try again later.");
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
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-5 py-4" placeholder="Tim Coker" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-5 py-4" placeholder="timcoker100@gmail.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (optional)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-5 py-4" placeholder="07927 315429" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (optional)</label>
            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-5 py-4" placeholder="07927 315456" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Code</label>
            <input 
              type="password" 
              required 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="w-full border border-gray-300 rounded-2xl px-5 py-4" 
              placeholder="Enter secret code" 
            />
            <p className="text-xs text-gray-500 mt-2">Contact timcoker100@gmail.com for the code</p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-2xl text-lg transition disabled:opacity-70"
          >
            {loading ? "Registering..." : "Join the Ladder"}
          </button>
        </form>

        {message && <p className="mt-4 text-center font-medium text-red-600">{message}</p>}
      </div>
    </div>
  );
}