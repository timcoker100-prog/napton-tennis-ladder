'use client';
import { useState } from 'react';

const SECRET_CODE = "NAPTON2026";   // ← CHANGE THIS to your private club code

export default function ProfileModal({ isOpen, onClose, onSaved }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (secretCode !== SECRET_CODE) {
      setError("❌ Incorrect club code. Ask the admin for the code.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone,
      whatsapp,
      contactConsent,
      points: 1000,
      gamesWon: 0,
      gamesLost: 0,
      matchesPlayed: 0
    };

    const existing = JSON.parse(localStorage.getItem('players') || '[]');
    localStorage.setItem('players', JSON.stringify([...existing, newPlayer]));

    alert("✅ Profile created successfully! Welcome to the Napton Tennis Ladder.");
    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Join Napton Tennis Ladder</h2>
        
        <input 
          type="text" 
          placeholder="Full Name *" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full p-3 border rounded-lg mb-3" 
        />
        <input 
          type="email" 
          placeholder="Email Address *" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 border rounded-lg mb-3" 
        />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
          className="w-full p-3 border rounded-lg mb-3" 
        />
        <input 
          type="tel" 
          placeholder="WhatsApp Number" 
          value={whatsapp} 
          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} 
          className="w-full p-3 border rounded-lg mb-3" 
        />

        <input 
          type="text" 
          placeholder="Club Secret Code *" 
          value={secretCode} 
          onChange={(e) => setSecretCode(e.target.value.toUpperCase())} 
          className="w-full p-3 border rounded-lg mb-4" 
        />

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input 
            type="checkbox" 
            checked={contactConsent} 
            onChange={(e) => setContactConsent(e.target.checked)} 
          />
          I agree to be contacted by other club members
        </label>

        {error && <p className="text-red-600 mb-4 text-center font-medium">{error}</p>}

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            Join Ladder
          </button>
        </div>
      </div>
    </div>
  );
}