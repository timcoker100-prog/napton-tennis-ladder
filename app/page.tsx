'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      router.replace('/ladder');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Napton Tennis Ladder...</div>;
}