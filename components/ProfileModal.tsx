'use client';

import { useState } from "react";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProfileModal({ isOpen, onClose, onSaved }: ProfileModalProps) {
  const [form, setForm] = useState({
    name: "Your Name",
    email: "your@email.com",
    phone: "+441234567890",
    whatsapp: "+441234567890",
    contactConsent: true,
  });

  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.name.trim()) return setError("Name is required");
    if (!form.email.includes("@")) return setError("Please enter a valid email");

    alert(`✅ Profile Saved!\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nWhatsApp: ${form.whatsapp}`);
    
    onSaved();
    onClose();
  };

  // Allow only numbers + +
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'whatsapp') => {
    const value = e.target.value.replace(/[^0-9+]/g, '');
    setForm({ ...form, [field]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">My Profile - Napton Tennis Club</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e, 'phone')}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="+44 1234 567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => handlePhoneChange(e, 'whatsapp')}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="+44 1234 567890"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              checked={form.contactConsent}
              onChange={(e) => setForm({ ...form, contactConsent: e.target.checked })}
              className="w-5 h-5"
            />
            <label className="text-sm">
              I am happy to be contacted by other club members via phone / WhatsApp
            </label>
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <div className="pt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-medium hover:bg-emerald-800"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}