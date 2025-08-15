'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is not yet loaded, wait
    
    if (user === null) return;
    
    if (!user) {
      setLoading(false); // user exists, stop loading
      router.replace('/auth/login'); // redirect if not logged in
    } else {
      setLoading(false); // user exists, stop loading
    }
  }, [user, router]);

  if (loading) return <p>Loading...</p>; // show while checking

  return <>{children}</>; // render dashboard content
}
