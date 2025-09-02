import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymous = async (displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            display_name: displayName
          }
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      toast.error('Erreur de connexion anonyme: ' + error.message);
      return { success: false, error };
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      if (error) throw error;
      toast.success('Lien magic envoyé par email');
      return { success: true, data };
    } catch (error: any) {
      toast.error('Erreur d\'envoi email: ' + error.message);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Déconnecté');
    } catch (error: any) {
      toast.error('Erreur de déconnexion: ' + error.message);
    }
  };

  return {
    user,
    session,
    loading,
    signInAnonymous,
    signInWithEmail,
    signOut
  };
}