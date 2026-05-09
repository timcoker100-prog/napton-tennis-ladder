'use client';
import { useState, useEffect } from 'react';

const SECRET_MEMBER_CODE = "NAPTON2026";

export default function ProfileModal({ isOpen, onClose, onSaved }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load existing profile if any
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        const user = JSON.parse(saved);
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setWhatsapp(user.whatsapp || "");
        setContactConsent(user.contactConsent || false);
        setIsEditing(true);
      }
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (secretCode !== SECRET_MEMBER_CODE && !isEditing) {
      setError("❌ Incorrect club code");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      contactConsent,
      points: 0,
      gamesWon: 0,
      gamesLost: 0,
      matchesPlayed: 0
    };

    // Save to players list
    const existingPlayers = JSON.parse(localStorage.getItem('players') || '[]');
    const emailExistsIndex = existingPlayers.findIndex((p: any) => p.email === newPlayer.email);

    let updatedPlayers;
    if (emailExistsIndex !== -1) {
      // Update existing
      updatedPlayers = [...existingPlayers];
      updatedPlayers[emailExistsIndex] = { ...updatedPlayers[emailExistsIndex], ...newPlayer };
    } else {
      updatedPlayers = [...existingPlayers, newPlayer];
    }

    localStorage.setItem('players', JSON.stringify(updatedPlayers));
    localStorage.setItem('currentUser', JSON.stringify(newPlayer));

    alert(isEditing ? "✅ Profile updated!" : "✅ Profile created successfully!");
    onSaved(newPlayer);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEditing ? "Update Profile" : "Join Napton Tennis Ladder"}
        </h2>
        
        <input type="text" placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
        <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
        <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))} className="w-full p-3 border rounded-lg mb-3" />
        <input type="tel" placeholder="WhatsApp Number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g,''))} className="w-full p-3 border rounded-lg mb-3" />

        {!isEditing && (
          <input 
            type="text" 
            placeholder="Club Secret Code *" 
            value={secretCode} 
            onChange={(e) => setSecretCode(e.target.value.toUpperCase())} 
            className="w-full p-3 border rounded-lg mb-4" 
          />
        )}

        <label className="flex items-center gap-2 mb-6">
          <input type="checkbox" checked={contactConsent} onChange={(e) => setContactConsent(e.target.checked)} />
          I agree to be contacted by other members
        </label>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium">
            {isEditing ? "Update Profile" : "Join Ladder"}
          </button>
        </div>
      </div>
    </div>
  );
}