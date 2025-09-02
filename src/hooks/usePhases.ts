
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Phase {
  id: string;
  session_id: string;
  order_index: number;
  code: string;
  title: string;
  subtitle?: string;
  created_at: string;
}

export function usePhases(sessionId: string) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhases = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        const { data, error } = await (supabase as any)
          .from('phases')
          .select('*')
          .eq('session_id', sessionId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching phases:', error);
          setError(error.message);
          return;
        }

        setPhases((data as any as Phase[]) || []);
      } catch (err) {
        console.error('Error fetching phases:', err);
        setError('Erreur lors du chargement des phases');
      } finally {
        setLoading(false);
      }
    };

    fetchPhases();
  }, [sessionId]);

  return { phases, loading, error };
}
