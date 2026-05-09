'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      router.replace('/ladder');     // Go to ladder if logged in
    } else {
      router.replace('/login');      // Go to login if not logged in
    }
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
}