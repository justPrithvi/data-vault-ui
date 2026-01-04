'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/screens/dashboard');
    } else {
      router.replace('/auth/login');
    }
  }, [user, router]);

  return null; // nothing to render
}
