'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const SECRET_CODE = 'N&P2026';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (isRegisterMode) {
      if (!playerName.trim() || !trimmedEmail || password !== SECRET_CODE) {
        setError('Please fill all fields and use the correct code');
        setLoading(false);
        return;
      }

      // Check if email already exists
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('email', trimmedEmail)
        .single();

      if (existing) {
        setError('This email is already registered');
        setLoading(false);
        return;
      }

      // Create player immediately
      const { error: insertError } = await supabase
        .from('players')
        .insert({
          name: playerName.trim(),
          email: trimmedEmail,
          phone: phone.trim() || null,
          whatsapp: whatsapp.trim() || null,
          contact_consent: true,
          points: 0,
        });

      if (insertError) {
        setError('Failed to create player: ' + insertError.message);
      } else {
        alert('✅ Registration successful! You are now on the ladder.');
        router.push('/ladder');
      }
    } else {
      // Login mode - just check if exists
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('email', trimmedEmail)
        .single();

      if (data) {
        router.push('/ladder');
      } else {
        setError('No account found with this email');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-emerald-800 text-center mb-2">Napton Tennis Club</h1>
        <p className="text-center text-emerald-600 mb-8">Singles Ladder</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsRegisterMode(true)}
            className={`flex-1 py-3 rounded-2xl font-medium ${isRegisterMode ? 'bg-emerald-700 text-white' : 'bg-gray-100'}`}
          >
            Register
          </button>
          <button
            onClick={() => setIsRegisterMode(false)}
            className={`flex-1 py-3 rounded-2xl font-medium ${!isRegisterMode ? 'bg-emerald-700 text-white' : 'bg-gray-100'}`}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp (optional)</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Secret Code {isRegisterMode && <span className="text-red-500">(required)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600"
              required
            />
            {isRegisterMode && (
              <p className="text-xs text-gray-500 mt-1">Contact timcoker100@gmail.com for the code</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegisterMode ? 'Register & Join Ladder' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}