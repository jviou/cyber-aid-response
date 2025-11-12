import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return {
    user,
    session,
    loading,
    signInAnonymous: async () => ({ success: true }),
    signInWithEmail: async () => ({ success: true }),
    signOut: async () => {}
  };
}