'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

async function fetchProfile() {
  const res = await fetch('/api/user/profile');
  if (res.ok) return res.json();
  return null;
}

export function useAuth() {
  const { user, session, loading, setUser, setSession, setLoading, logout } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (s?.user) {
            const profile = await fetchProfile();
            if (profile) setUser(profile);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
        // TOKEN_REFRESHED and other events: do nothing — profile doesn't change
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/login');
  };

  return { user, session, loading, signOut };
}
