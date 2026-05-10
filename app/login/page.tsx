'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECRET_CODE = "NAPTON2026";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(true); // true = Register, false = Login

  const handleSubmit = () => {
    if (secretCode !== SECRET_CODE) {
      setError("❌ Incorrect club code");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check for duplicate email on Register
    if (isRegisterMode) {
      const existingUsers = JSON.parse(localStorage.getItem('players') || '[]');
      const emailExists = existingUsers.some((p: any) => p.email === trimmedEmail);
      
      if (emailExists) {
        setError("❌ This email is already registered. Use Login instead.");
        return;
      }
      if (!name.trim()) {
        setError("Name is required for registration");
        return;
      }
    }

    const user = {
      id: Date.now().toString(),
      name: name.trim() || "User",
      email: trimmedEmail,
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    router.push('/ladder');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎾</div>
          <h1 className="text-3xl font-bold text-emerald-700">Napton Tennis Club</h1>
          <p className="text-gray-600 mt-2">Singles Ladder</p>
        </div>

        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setIsRegisterMode(true)}
            className={`flex-1 py-3 rounded-xl font-medium ${isRegisterMode ? 'bg-white shadow' : 'text-gray-500'}`}
          >
            Register
          </button>
          <button
            onClick={() => setIsRegisterMode(false)}
            className={`flex-1 py-3 rounded-xl font-medium ${!isRegisterMode ? 'bg-white shadow' : 'text-gray-500'}`}
          >
            Login
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-8">
          {isRegisterMode ? "Create New Account" : "Login"}
        </h2>

        {isRegisterMode && (
          <input
            type="text"
            placeholder="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border rounded-2xl mb-4 text-lg"
          />
        )}

        <input
          type="email"
          placeholder="Email Address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border rounded-2xl mb-6 text-lg"
        />

        <input
          type="text"
          placeholder="Club Secret Code *"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
          className="w-full p-4 border rounded-2xl mb-8 text-lg"
        />

        {error && <p className="text-red-600 text-center mb-6 font-medium">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-semibold text-xl"
        >
          {isRegisterMode ? "Register" : "Login"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-8">
          Club members only • Ask admin for the code
        </p>
      </div>
    </div>
  );
}